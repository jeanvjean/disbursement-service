const BaseController = require('./Base');

class FundController extends BaseController {
    constructor({ fundFactory }) {
        super();
        this.fundFactory = fundFactory;
    }
    async create(req, res) {
        const data = await this.fundFactory.create(req);

        return FundController.success(data, req, res);
    }
    async getFunding(req, res) {
        const data = await this.fundFactory.getFunding(req);
        return FundController.pagination(data, req, res);
    }

    async exportFunding(req, res) {
        const data = await this.fundFactory.exportFunding(req);

        return FundController.success(data, req, res);
    }
}

module.exports = FundController;
