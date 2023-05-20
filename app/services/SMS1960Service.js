const ClientHttp = require('../utils/Client')
const qs = require('qs')
const { SMS_PROVIDER: { SMS1960: SMS1960_PROVIDER }, SMS_DEFAULT_STATUS, SMS_SUCCESS_STATUS, SMS_OUTGOING_TYPE, SMS_INCOMING_TYPE } = require('../constants')

class SMS1960Service {
    constructor ({ config, database, queries }) {
        this.baseUrl = config.get('sms1960.base_uri');
        this.userName = config.get('sms1960.username');
        this.password = config.get('sms1960.password');
        this.from = config.get('sms1960.from');
        this.config = config;
        this.database = database;
        this.queries = queries;
        this.sms1960Headers = {
            'Content-Type': 'application/json'
        },
        // this.client = new ClientHttp(this.baseUrl);
        this.sms1960Client = new ClientHttp(this.baseUrl, this.sms1960Headers);
    }


    async checkBalance() {
        try {
            const balance = await this.sms1960Client.get(encodeURI(`credit/?user=${this.userName}&pass=${this.password}`));
            return balance;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async sendSms(payload) {
        try {
            let { to, message } = payload;
            
            if(!Array.isArray(payload.to)) {
                to =  to.replace('+', '');
            } else {
                to = to.map(item => item.replace('+', ''));
                to = to.toString()
            }
            
            const response = await this.sms1960Client.get(encodeURI(`send/?user=${this.userName}&pass=${this.password}&to=${to}&from=${ this.from }&msg=${message}&enable_msg_id=1`));
            const mesgId = response.split(',').length ? response.split(',')[1] : ''
            await this.database.query.oneOrNone(this.queries.applicant_sms.create, {
                source: SMS1960_PROVIDER,
                to,
                from: this.from,
                sms_content: message,
                message_id: mesgId ? mesgId : undefined,
                delivery_status: SMS_DEFAULT_STATUS,
                sms_type:  SMS_OUTGOING_TYPE
            });
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async checkSMSDelivery(message_id) {
        try {
            const response = await this.sms1960Client.get(encodeURI(`report/?user=${this.userName}&pass=${this.password}&msgid=${message_id}`));
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async numberLookUp(phone_number) {
        try {
            const response = await this.sms1960Client.get(encodeURI(`lookup/?user=${this.userName}&pass=${this.password}&msisdn=${phone_number}`));
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = SMS1960Service;
