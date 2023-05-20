const cron = require('node-cron');
const config = require('../../config')
const { CRON, SMS_CRON } = require('../constants');
const ApplicantSmsStatusWorkers = require('../queues/workers/applicants/applicantSmsStatus');
const ApplicantPaymentWorkers = require('../queues/workers/applicants/payment');
const ApplicantRetractmentWorkers = require('../queues/workers/applicants/retractment');
const { getAplicantsForPayment, getretractApplicant , getPendingSmsBySource, process1960SmsStatus} = require('./applicant');
const { SMS_PROVIDER: { SMS1960: SMS1960_PROVIDER } } = require('../constants')

const payment = () => {
    // to run every midnight
    cron.schedule('0 0 0 * * *', async() => {
      try {
        console.log('Cron Job is running for payment');
        const transfers = await getAplicantsForPayment();
        ApplicantPaymentWorkers.process(transfers);
        return 'job for today processed'
      } catch (error) {
        console.error(error);
      }
});
}

const retracted = () => {
   cron.schedule('0 0 0 * * *', async() => {
      try {
        console.log('Cron Job is running for retractment');
        const transfers = await getretractApplicant();
        if( transfers && transfers.length) {
          ApplicantRetractmentWorkers.processRetractment(transfers)
        }
        return 'retractment job for today processed'
      } catch (error) {
        console.error(error);
      }
});
}

const run1960PendingSms = () => {
  const interval = config.get('server.app.environment').toLowerCase() === 'development' ? SMS_CRON.DEVELOPMENT : SMS_CRON.PRODUCTION;
  cron.schedule(interval, async() => {
      try {
        console.log('Cron Job is running for applicant update pending sms for 1960sms');
        
        const pending_sms = await getPendingSmsBySource(SMS1960_PROVIDER);
        
        if( pending_sms && pending_sms.length) {
          ApplicantSmsStatusWorkers.processSmsUpdate(pending_sms);
        }
        return 'applicant update pending sms for today processed';
      } catch (error) {
        console.error(error);
      }
  });
};

module.exports = { payment, retracted, run1960PendingSms }