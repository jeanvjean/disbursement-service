const publishToRabitmq = require('../../publishers');

module.exports = class CashoutWorker {
  static async export({ dbQuery, sqlQuery2, user }) {
    try {
      await publishToRabitmq({
        worker: 'exports_cashout_queue',
        message: {
          action: 'exports_cashout',
          type: 'fire',
          data: {
            dbQuery,
            sqlQuery2,
            user,
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
  static async sendExportedCashout({ file, user }) {
    try {
      await publishToRabitmq({
        worker: 'send_exported_cashout_queue',
        message: {
          action: 'send_exported_cashout',
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
