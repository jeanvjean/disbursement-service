const publishToRabitmq = require('../../publishers');

module.exports = class UploadErrorWorker {
  static async export({ dbQuery, user }) {
    try {
      await publishToRabitmq({
        worker: 'exports_upload_error_logs_queue',
        message: {
          action: 'exports_upload_error_logs',
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
  static async sendExportedUploadError({ file, user }) {
    try {
      await publishToRabitmq({
        worker: 'send_exported_upload_error_logs_queue',
        message: {
          action: 'send_exported_upload_error_logs',
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
