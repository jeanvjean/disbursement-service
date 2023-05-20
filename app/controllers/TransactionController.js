const BaseController = require('./Base');

class TransactionController extends BaseController {
    constructor({ transactionFactory }) {
        super();
        this.transactionFactory = transactionFactory;
    }
    async all(req, res) {
        const data = await this.transactionFactory.all(req);

        return TransactionController.pagination(data, req, res);
    }

    async get(req, res) {
        const data = await this.transactionFactory.get(req);

        return TransactionController.success(data, req, res);
    }

    async getDisbursement(req, res) {
        const data = await this.transactionFactory.getDisbursement(req);

        return TransactionController.success(data, req, res);
    }

    async getRetracted(req, res) {
        const data = await this.transactionFactory.getRetracted(req);

        return TransactionController.success(data, req, res);
    }

    async getCashout(req, res) {
        const data = await this.transactionFactory.getCashout(req);

        return TransactionController.success(data, req, res);
    }

    async pay(req, res) {
        const data = await this.transactionFactory.pay(req);

        return TransactionController.success(data, req, res);
    }

    async requery(req, res) {
        const data = await this.transactionFactory.requery(req);

        return TransactionController.success(data, req, res);
    }

    async retry(req, res) {
        const data = await this.transactionFactory.retry(req);

        return TransactionController.success(data, req, res);
    }

    async approvalPay(req, res) {
        const data = await this.transactionFactory.approvalPay(req);

        return TransactionController.success(data, req, res);
    }

    async exportTransactions(req, res) {
        const data = await this.transactionFactory.exportTransactions(req);

        return TransactionController.success(data, req, res, 'Transactions exported successfully');
    }

    async uploadBeneficiary(req, res) {
        const data = await this.transactionFactory.uploadBeneficiary(req);

        return TransactionController.success(data, req, res, 'Uploaded beneficiary is currently been processed');
    }
    async exportCashout(req, res) {
        const data = await this.transactionFactory.exportCashout(req);

        return TransactionController.success(data, req, res);
    }
    async exportRetracted(req, res) {
        const data = await this.transactionFactory.exportRetracted(req);

        return TransactionController.success(data, req, res);
    }
}

module.exports = TransactionController;
