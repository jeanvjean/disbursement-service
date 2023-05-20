/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const publishToRabitmq = require('../../publishers');

class BeneficiaryAccountUploadWorkers {
    async upload({ file, metadata }) {
        try {
            await publishToRabitmq({
                worker: 'beneficiary_account_upload_queue',
                message: {
                    action: 'beneficiary_account_upload',
                    type: 'process',
                    data: { file, metadata }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    async sendAccountUploadEmail({ successBucketUrl, errorBucketUrl, metadata }) {
        try {
            await publishToRabitmq({
                worker: 'send_beneficiary_account_upload_queue',
                message: {
                    action: 'send_beneficiary_account_upload',
                    type: 'process',
                    data: { successBucketUrl, errorBucketUrl, metadata }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = BeneficiaryAccountUploadWorkers;
