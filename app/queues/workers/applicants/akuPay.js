const publishToRabitmq = require('../../publishers');

class AkuPayWorkers {
  static async create(payload) {
    try {
      await publishToRabitmq({
        worker: 'create_aku_account_queue',
        message: {
          action: 'create_aku_account',
          type: 'process',
          data: payload,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
};

module.exports = AkuPayWorkers;
