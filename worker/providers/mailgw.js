import { MailTmProvider } from './mailtm.js';

export class MailGwProvider extends MailTmProvider {
  constructor() {
    super('https://api.mail.gw', 'mailgw');
  }
}
