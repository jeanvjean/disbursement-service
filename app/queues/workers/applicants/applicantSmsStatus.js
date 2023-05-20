const publishToRabitmq = require('../../publishers');

class ApplicantSmsStatusWorkers {
  static async processSmsUpdate(payload) {
    try {
      await publishToRabitmq({
        worker: 'process_applicant_sms_status_queue',
        message: {
          action: 'process_applicant_sms_status',
          type: 'process',
          data: payload,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
};

module.exports = ApplicantSmsStatusWorkers;
