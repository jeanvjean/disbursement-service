const BaseController = require('./Base');

class AppController extends BaseController {
  constructor({ appFactory }) {
    super();
    this.appFactory = appFactory;
  }
  async index(req, res) {
    const data = await this.appFactory.getApp();

    return AppController.success(data, req, res);
  }

  async sendSms(req, res) {
    const data = await this.appFactory.sendSms(req);

    return AppController.success(data, req, res);
  }

  async smsWebhook(req, res) {
    const data = await this.appFactory.smsWebhook(req);

    return AppController.success(data, req, res);
  }

  async failedTransactions(req, res) {
    const data = await this.appFactory.failedTransactions(req);

    return AppController.success(data, req, res);
  }

  async getAuditLogs(req, res) {
    const data = await this.appFactory.getAuditLogs(req.query);

    return AppController.success(data, req, res);
  }
}

module.exports = AppController;
