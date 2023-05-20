const path = require('path')
const ejs = require('ejs')
const ClientHttp = require('../utils/Client')
const qs = require('qs')
const { SMS_PROVIDER: { AFRICALSTALKING: AFRICALSTALKING_PROVIDER }, 
    SMS_SUCCESS_STATUS, 
    SMS_OUTGOING_TYPE, 
    SMS_INCOMING_TYPE,
    SMS_DEFAULT_STATUS,
 } = require('../constants')

class AfricastalkingService {
    constructor ({ config,    database, queries, }) {
        this.baseUrl = config.get('africastalking.base_uri');
        this.headers = {
            apiKey: config.get('africastalking.api_key'),
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        this.database = database;
        this.queries = queries;
        this.config = config;
        this.smsClient = new ClientHttp(this.baseUrl, this.headers)
    }

    async sendSms(payload) {
        try {
            let { to, message } = payload
            
            if(!Array.isArray(payload.to)) {
                to = [ to ]
            }

            to = await this.parsePhoneNumberToStandard(to);
            
            const response = await this.smsClient.post('messaging', qs.stringify({
                username: this.config.get('africastalking.username'),
                to: to.toString(),
                message: message,
                from: this.config.get('africastalking.from'),
            }));

            const recipients = response.SMSMessageData.Recipients;
            for (let i = 0; i < recipients.length; i += 1) {
                await this.database.query.oneOrNone(this.queries.applicant_sms.create, {
                    source: AFRICALSTALKING_PROVIDER,
                    to: recipients[i].number,
                    from: this.config.get('africastalking.from'),
                    sms_content: message,
                    message_id: recipients[i] ? recipients[i].messageId : undefined,
                    delivery_status: SMS_DEFAULT_STATUS,
                    sms_type: SMS_OUTGOING_TYPE,
                });
            }
            
            return response;
        } catch (error) {
            console.log({error})
            throw new Error(error)
        }
    }

    async parsePhoneNumberToStandard(phoneNumbers) {
        try {
            let results = []
            for(let i = 0; i <= phoneNumbers.length - 1; i++) {
                if(phoneNumbers[i].length === 11) {
                    phoneNumbers[i] = `+234${phoneNumbers[i].substring(1)}`
                }
                if(phoneNumbers[i].length === 13 && phoneNumbers[i].substring(0, 1) !== '+') {
                    phoneNumbers[i] = `+${phoneNumbers[i]}`
                }

                results.push(phoneNumbers[i])
            }

            return phoneNumbers
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = AfricastalkingService;