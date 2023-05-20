const publishToRabitmq = require('../../publishers');

class ApplicantUploadWorkers {
  async upload({ file, metadata }) {
    try {
      await publishToRabitmq({
        worker: 'upload_applicant_queue',
        message: {
          action: 'upload_applicant',
          type: 'process',
          data: { file, metadata },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
};

module.exports = ApplicantUploadWorkers;
