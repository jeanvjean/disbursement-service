const BaseController = require('./Base');

class ProgrammeController extends BaseController {
    constructor({ programmeFactory }) {
        super();
        this.programmeFactory = programmeFactory;
    }
    async all(req, res) {
        const data = await this.programmeFactory.all(req);

        return ProgrammeController.success(data, req, res);
    }

    async allProgrammes(req, res) {
        const data = await this.programmeFactory.allProgrammes(req);

        return ProgrammeController.success(data, req, res);
    }

    async get(req, res) {
        const data = await this.programmeFactory.get(req);

        return ProgrammeController.success(data, req, res);
    }

    async create(req, res) {
        const data = await this.programmeFactory.create(req);

        return ProgrammeController.success(data, req, res);
    }

    async delete(req, res) {
        const data = await this.programmeFactory.delete(req);

        return ProgrammeController.success(data, req, res);
    }

    async createMessage(req, res) {
        const data = await this.programmeFactory.createMessage(req);

        return ProgrammeController.success(data, req, res);
    }

    async getMessage(req, res) {
        const data = await this.programmeFactory.getMessage(req);

        return ProgrammeController.success(data, req, res);
    }

    async allMessage(req, res) {
        const data = await this.programmeFactory.allMessage(req);

        return ProgrammeController.success(data, req, res);
    }

    async updateMessage(req, res) {
        const data = await this.programmeFactory.updateMessage(req);

        return ProgrammeController.success(data, req, res);
    }

    async deleteMessage(req, res) {
        const data = await this.programmeFactory.deleteMessage(req);

        return ProgrammeController.success(data, req, res);
    }

    async getProgrammeMessage(req, res) {
        const data = await this.programmeFactory.getProgrammeMessage(req);

        return ProgrammeController.success(data, req, res);
    }

    async updateProgrammme(req, res) {
        const data = await this.programmeFactory.updateProgrammme(req);

        return ProgrammeController.success(data, req, res);
    }
}

module.exports = ProgrammeController;
