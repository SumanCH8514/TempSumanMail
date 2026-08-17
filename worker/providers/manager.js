import { MailTmProvider } from './mailtm.js';
import { MailGwProvider } from './mailgw.js';
import { GuerrillaProvider } from './guerrilla.js';

export class ProviderManager {
  constructor() {
    this.providers = {
      mailtm: new MailTmProvider(),
      mailgw: new MailGwProvider(),
      guerrilla: new GuerrillaProvider()
    };
    this.order = ['mailtm', 'mailgw', 'guerrilla'];
    this.failures = new Map();
    this.domainCache = new Map();
    this.domainCacheTtl = 10 * 60 * 1000;
  }

  isHealthy(providerName) {
    const record = this.failures.get(providerName);
    if (!record) return true;
    if (Date.now() - record.lastFailure > 2 * 60 * 1000) {
      this.failures.delete(providerName);
      return true;
    }
    return record.count < 3;
  }

  recordFailure(providerName) {
    const record = this.failures.get(providerName) || { count: 0, lastFailure: 0 };
    record.count += 1;
    record.lastFailure = Date.now();
    this.failures.set(providerName, record);
  }

  recordSuccess(providerName) {
    this.failures.delete(providerName);
  }

  async getAllDomains() {
    const result = {};
    for (const name of this.order) {
      try {
        const cached = this.domainCache.get(name);
        if (cached && Date.now() - cached.timestamp < this.domainCacheTtl) {
          result[name] = cached.domains;
          continue;
        }
        const provider = this.providers[name];
        const domains = await provider.listDomains();
        this.domainCache.set(name, { domains, timestamp: Date.now() });
        result[name] = domains;
      } catch (err) {
        result[name] = [];
      }
    }
    return result;
  }

  async createInbox(localPart, preferredDomain, preferredProvider) {
    let targetProvider = preferredProvider;

    if (!targetProvider && preferredDomain) {
      for (const name of this.order) {
        const cached = this.domainCache.get(name);
        if (cached && cached.domains.includes(preferredDomain)) {
          targetProvider = name;
          break;
        }
      }
      if (!targetProvider) {
        for (const name of this.order) {
          try {
            const provider = this.providers[name];
            const domains = await provider.listDomains();
            this.domainCache.set(name, { domains, timestamp: Date.now() });
            if (domains.includes(preferredDomain)) {
              targetProvider = name;
              break;
            }
          } catch (e) {}
        }
      }
    }

    const candidateOrder = targetProvider && this.providers[targetProvider]
      ? [targetProvider]
      : [...this.order];

    let lastError = null;

    for (const name of candidateOrder) {
      if (!this.isHealthy(name) && candidateOrder.length > 1 && !targetProvider) {
        continue;
      }
      try {
        const provider = this.providers[name];
        const result = await provider.createInbox(localPart, preferredDomain);
        this.recordSuccess(name);
        return {
          address: result.address,
          provider: name,
          credentials: result.credentials
        };
      } catch (err) {
        this.recordFailure(name);
        lastError = err;
        if (targetProvider) {
          throw err;
        }
      }
    }

    throw lastError || new Error('All providers failed to create inbox');
  }

  getProvider(name) {
    const p = this.providers[name];
    if (!p) {
      throw new Error(`Unknown provider: ${name}`);
    }
    return p;
  }

  getHealthStatus() {
    const status = {};
    for (const name of this.order) {
      status[name] = {
        healthy: this.isHealthy(name),
        failures: this.failures.get(name)?.count || 0
      };
    }
    return status;
  }
}
