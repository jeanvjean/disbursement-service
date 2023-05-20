const BaseController = require('./Base');

class ApplicantController extends BaseController {
    constructor({ applicantFactory }) {
        super();
        this.applicantFactory = applicantFactory;
    }

    async uploadApplicants(req, res) {
        const data = await this.applicantFactory.uploadApplicants(req);

        return ApplicantController.success(data, req, res);
    }

    async addApplicant(req, res) {
        const data = await this.applicantFactory.addApplicant(req);

        return ApplicantController.success(data, req, res);
    }

    async cardReports(req, res) {
        const data = await this.applicantFactory.cardReports(req);

        return ApplicantController.success(data, req, res);
    }

    async fundCardReports(req, res) {
        const data = await this.applicantFactory.fundCardReports(req);

        return ApplicantController.success(data, req, res);
    }
}

module.exports = ApplicantController;
