const publishToRabitmq = require('../../publishers');

module.exports = class WebHookLogsWorker {
  static async export({ dbQuery, user }) {
    try {
      await publishToRabitmq({
        worker: 'exports_webhook_logs_queue',
        message: {
          action: 'exports_webhook_logs',
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
  static async sendExportedWebHookLogs({ file, user }) {
    try {
      await publishToRabitmq({
        worker: 'send_exported_webhook_logs_queue',
        message: {
          action: 'send_exported_webhook_logs',
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
