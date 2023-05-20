const publishToRabitmq = require('../../publishers');

module.exports = class RetractedWorker {
  static async export({ dbQuery, dbValues,user }) {
    try {
      await publishToRabitmq({
        worker: 'exports_retracted_queue',
        message: {
          action: 'exports_retracted',
          type: 'fire',
          data: {
            dbQuery,
            dbValues,
            user,
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
  static async sendExportedRetracted({ file, user }) {
    try {
      await publishToRabitmq({
        worker: 'send_exported_retracted_queue',
        message: {
          action: 'send_exported_retracted',
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
