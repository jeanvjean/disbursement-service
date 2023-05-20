const publishToRabitmq = require('../../publishers');

class ApplicantPaymentWorkers {
  static async process(payload) {
    try {
      await publishToRabitmq({
        worker: 'process_applicant_payment_queue',
        message: {
          action: 'process_applicant_payment',
          type: 'process',
          data: payload,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
  static async payment(payload) {
    try {
      await publishToRabitmq({
        worker: 'pay_applicant_queue',
        message: {
          action: 'pay_applicant',
          type: 'process',
          data: payload,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
};

module.exports = ApplicantPaymentWorkers;
