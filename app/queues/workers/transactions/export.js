const publishToRabitmq = require('../../publishers');

module.exports = class TransactionsWorker {
  static async export({ dbQuery, dbValues,user }) {
    try {
      await publishToRabitmq({
        worker: 'exports_transaction_queue',
        message: {
          action: 'exports_transaction',
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
  static async sendExportedTransaction({ file, user }) {
    try {
      await publishToRabitmq({
        worker: 'send_exported_transaction_queue',
        message: {
          action: 'send_exported_transaction',
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
