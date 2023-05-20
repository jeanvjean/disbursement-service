const BaseController = require('./Base');

class ClientController extends BaseController {
    constructor({ clientFactory }) {
        super();
        this.clientFactory = clientFactory;
    }
    async all(req, res) {
        const data = await this.clientFactory.all(req);

        return ClientController.success(data, req, res);
    }

    async get(req, res) {
        const data = await this.clientFactory.get(req);

        return ClientController.success(data, req, res);
    }

    async create(req, res) {
        const data = await this.clientFactory.create(req);

        return ClientController.success(data, req, res);
    }

    async delete(req, res) {
        const data = await this.clientFactory.delete(req);

        return ClientController.success(data, req, res);
    }
}

module.exports = ClientController;
