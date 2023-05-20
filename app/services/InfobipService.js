/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable no-await-in-loop */
const uuidAPIKey = require('uuid-apikey');
const ClientHttp = require('../utils/Client');
const qs = require('qs');
const {
    SMS_PROVIDER: { INFOBIP: INFOBIP_PROVIDER },
    SMS_SUCCESS_STATUS,
    SMS_OUTGOING_TYPE,
    SMS_INCOMING_TYPE,
    SMS_DEFAULT_STATUS
} = require('../constants');

class InfobipService {
    constructor({ config, database, queries }) {
        this.baseUrl = config.get('infobip.base_uri');
        this.headers = {
            Authorization: `App ${config.get('infobip.api_key')}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        this.database = database;
        this.queries = queries;
        this.config = config;
        this.smsClient = new ClientHttp(this.baseUrl, this.headers);
    }

    async sendSms(payload) {
        try {
            const { uuid } = uuidAPIKey.create();
            let { to, message } = payload;

            if (!Array.isArray(payload.to)) {
                to = [ to ];
            }

            to = await this.parsePhoneNumberToStandard(to);
            const response = await this.smsClient.post('sms/2/text/advanced', {
                messages: [ {
                    from: this.config.get('infobip.from'),
                    destinations: to,
                    text: message
                } ]
            });

            const recipients = response.messages;
            for (let i = 0; i < recipients.length; i += 1) {
                await this.database.query.oneOrNone(this.queries.applicant_sms.create, {
                    source: INFOBIP_PROVIDER,
                    to: recipients[i].to,
                    from: this.config.get('infobip.from'),
                    sms_content: message,
                    message_id: recipients[i] ? recipients[i].messageId : undefined,
                    delivery_status: SMS_SUCCESS_STATUS,
                    sms_type: SMS_OUTGOING_TYPE
                });
            }

            return response;
        } catch (error) {
            throw new Error(error);
        }
    }

    async parsePhoneNumberToStandard(phoneNumbers) {
        try {
            const { uuid } = uuidAPIKey.create();
            const results = [];
            for (let i = 0; i <= phoneNumbers.length - 1; i++) {
                if (phoneNumbers[i].length === 11) {
                    phoneNumbers[i] = { to: `234${phoneNumbers[i].substring(1)}`, messageId: uuid };
                }
                if (phoneNumbers[i].length === 13 && phoneNumbers[i].substring(0, 1) !== '+') {
                    phoneNumbers[i] = { to: `${phoneNumbers[i]}`, messageId: uuid };
                }
                if (phoneNumbers[i].length === 14 && phoneNumbers[i].substring(0, 1) === '+') {
                    phoneNumbers[i] = { to: `${phoneNumbers[i].substring(1, 14)}`, messageId: uuid };
                }

                results.push({
                    to: phoneNumbers[i],
                    messageId: uuid
                });
            }

            return phoneNumbers;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = InfobipService;
