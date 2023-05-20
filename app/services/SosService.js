/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
const ClientHttp = require('../utils/Client');

class SosService {
    constructor({ config }) {
        this.baseUrl = config.get('akupay.sos.base_uri');
        this.headers = {
            'secret-key': config.get('akupay.sos.secret_key')
        },
        this.config = config;
        this.client = new ClientHttp(this.baseUrl, this.headers);
    }

    async resolveAccountDetails(payload) {
        console.log({ payload });
        try {
            const {
                phone_number, message_content, account_number, bank_name, account_name
            } = payload;
            const response = await this.client.post('resolve-transactions/webhook', {
                phone_number, message_content, account_number, bank_name, account_name
            });
            return response.data ? response.data : response;
        } catch (err) {
            throw new Error({ err: err.response });
        }
    }

    async notifySosUploadResponse(payload) {
        try {
            const { successBucketUrl, errorBucketUrl, metadata } = payload;

            const response = await this.client.post('upload-response/webhook', {
                successBucketUrl, errorBucketUrl, metadata
            });

            return response.data ? response.data : response;
        } catch (err) {
            throw new Error(err);
        }
    }

    async updateSosProgrammeTransaction(payload) {
        try {
            const response = await this.client.put('transactions/update-programme', payload);

            return response.data ? response.data : response;
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = SosService;
