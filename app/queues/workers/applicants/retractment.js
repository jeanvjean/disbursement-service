const publishToRabitmq = require('../../publishers');

class ApplicantRetractmentWorkers {
  static async processRetractment(payload) {
    try {
      await publishToRabitmq({
        worker: 'process_applicant_retractment_queue',
        message: {
          action: 'process_applicant_retractment',
          type: 'process',
          data: payload,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
};

module.exports = ApplicantRetractmentWorkers;
