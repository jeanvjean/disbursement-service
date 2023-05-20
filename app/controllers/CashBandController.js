const BaseController = require('./Base');

class CashBandController extends BaseController {
    constructor({ cashBandFactory }) {
        super();
        this.cashBandFactory = cashBandFactory;
    }
    async all(req, res) {
        const data = await this.cashBandFactory.all(req);

        return CashBandController.success(data, req, res);
    }

    async get(req, res) {
        const data = await this.cashBandFactory.get(req);

        return CashBandController.success(data, req, res);
    }

    async create(req, res) {
        const data = await this.cashBandFactory.create(req);

        return CashBandController.success(data, req, res);
    }

    async delete(req, res) {
        const data = await this.cashBandFactory.delete(req);

        return CashBandController.success(data, req, res);
    }
}

module.exports = CashBandController;
