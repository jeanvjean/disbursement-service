/* eslint-disable eqeqeq */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-unreachable */
/* eslint-disable no-console */
const ClientHttp = require('../utils/Client');

class AkuPayService {
    constructor({ config }) {
        this.baseUrl = config.get('akupay.app.base_uri');
        this.disburseBaseUrl = config.get('akupay.disburse.base_uri');
        this.config = config;
        this.disburseHeaders = {
            'x-api-key': config.get('akupay.disburse.api_key'),
            'Content-Type': 'application/json'
        },
        this.client = new ClientHttp(this.baseUrl);
        this.disburseClient = new ClientHttp(this.disburseBaseUrl, this.disburseHeaders);
    }

    async checkIfAccountExists({ phone_number }) {
        try {
            // const mobile = String(phone_number).replace("+", "")
            // await this.client.get(`/subscriber/${mobile}`);

            return true;
        } catch (error) {
            if (error.statusCode == 404) {
                return false;
            }
            throw new Error(error.message);
        }
    }

    async createAccount({ phone_number }) {
        try {
            // const mobile = String(phone_number).replace("+", "")
            // await this.disburseClient.get(`/disbursement/subscriber/${mobile}`);

            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async creditBeneficiaryAccount({ phone_number, amount }) {
        try {
            // await this.disburseClient.post('disbursement/disburse', { mobile: phone_number, amount });

            return true;
        } catch (error) {
            console.log({ error });
            return false;
            // throw new Error(error.message);
        }
    }

    async debitBeneficiaryAccount({ phone_number, amount }) {
        try {
            // const data = await this.disburseClient.post('disbursement/transfer', { mobile: phone_number, amount });

            // return data;
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async checkBeneficiaryBalance({ phone_number }) {
        try {
            // const data = await this.disburseClient.get(`disbursement/balance/${phone_number}`);

            // return data;
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async registerBeneficiary({ phone_number }) {
        try {
            // const data = await this.disburseClient.get(`disbursement/subscriber/${phone_number}`);

            // return data;
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = AkuPayService;
