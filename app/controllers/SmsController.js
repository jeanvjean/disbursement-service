/* eslint-disable no-console */
const BaseController = require('./Base');

class SmsController extends BaseController {
    constructor({ smsFactory }) {
        super();
        this.smsFactory = smsFactory;
    }
    async africastalkingWebhook(req, res) {
        const data = await this.smsFactory.africastalkingWebhook(req);

        return SmsController.success(data, req, res);
    }

    async infobipWebhook(req, res) {
        const data = await this.smsFactory.infobipWebhook(req);

        return SmsController.success(data, req, res);
    }

    async sms1960Webhook(req, res) {
        const data = await this.smsFactory.sms1960Webhook(req);

        return SmsController.success(data, req, res);
    }

    async getApplicantReplies(req, res) {
        const data = await this.smsFactory.getApplicantReplies(req);

        return SmsController.pagination(data, req, res);
    }


    async getApplicantRepliesExport(req, res) {
        const data = await this.smsFactory.getApplicantRepliesExport(req);

        return SmsController.success(data, req, res);
    }

    async africastalkingSMSWebhook(req, res) {
        const data = await this.smsFactory.africastalkingSMSWebhook(req);

        return SmsController.success(data, req, res);
    }

    async getSmsLogs(req, res) {
        const data = await this.smsFactory.getSmsLogs(req);

        return SmsController.pagination(data, req, res, 'sms logs retrieved successfully');
    }
    async exportSmsLogs(req, res) {
        const data = await this.smsFactory.exportSmsLogs(req);

        return SmsController.success(data, req, res);
    }
}

module.exports = SmsController;
