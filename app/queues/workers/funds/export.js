const publishToRabitmq = require('../../publishers');

module.exports = class FundsWorker {
  static async export({ dbQuery, user }) {
    try {
      await publishToRabitmq({
        worker: 'exports_funds_queue',
        message: {
          action: 'exports_funds',
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
  static async sendExportedFunds({ file, user }) {
    try {
      await publishToRabitmq({
        worker: 'send_exported_funds_queue',
        message: {
          action: 'send_exported_funds',
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
