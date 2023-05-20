const BaseController = require('./Base');

class LogController extends BaseController {
    constructor({ logFactory }) {
        super();
        this.logFactory = logFactory;
    }
    async uploadErrors(req, res) {
        const data = await this.logFactory.uploadErrors(req);

        return LogController.pagination(data, req, res);
    }
    async webhookResponse(req, res) {
        const data = await this.logFactory.webhookResponse(req);
        return LogController.pagination(data, req, res);
    }

    async exportWebhookResponse(req, res) {
        const data = await this.logFactory.exportWebhookResponse(req);
        return LogController.success(data, req, res);
    }

    async exportUploadErrors(req, res) {
        const data = await this.logFactory.exportUploadErrors(req);

        return LogController.success(data, req, res);
    }

}

module.exports = LogController;
