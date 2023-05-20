const publishToRabitmq = require('../../publishers');

module.exports = class SmsLogsWorker {
  static async export({ dbQuery, dbValues,user }) {
    try {
      await publishToRabitmq({
        worker: 'exports_sms_logs_queue',
        message: {
          action: 'exports_sms_logs',
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
  static async sendExportedSmsLogs({ file, user }) {
    try {
      await publishToRabitmq({
        worker: 'send_exported_sms_logs_queue',
        message: {
          action: 'send_exported_sms_logs',
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
