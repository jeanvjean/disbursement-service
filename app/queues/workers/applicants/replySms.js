const publishToRabitmq = require('../../publishers');

module.exports = class ApplicantReplyWorker {
  static async export({ dbQuery, user }) {
    try {
      await publishToRabitmq({
        worker: 'exports_applicant_repply_queue',
        message: {
          action: 'exports_applicant_repply',
          type: 'fire',
          data: {
            dbQuery,
            user,
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
  static async sendExportedApplicantReply({ file, user }) {
    try {
      await publishToRabitmq({
        worker: 'exports_applicant_repply_queue',
        message: {
          action: 'send_exported_applicant_repply',
          type: 'fire',
          data: {
            file,
            user,
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
};
