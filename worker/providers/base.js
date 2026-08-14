export class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  async listDomains() {
    throw new Error('listDomains not implemented');
  }

  async createInbox(localPart, domain) {
    throw new Error('createInbox not implemented');
  }

  async listMessages(credentials) {
    throw new Error('listMessages not implemented');
  }

  async getMessage(credentials, id) {
    throw new Error('getMessage not implemented');
  }

  async deleteMessage(credentials, id) {
    throw new Error('deleteMessage not implemented');
  }

  async deleteInbox(credentials) {
    throw new Error('deleteInbox not implemented');
  }
}
