/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
const path = require('path');
const ejs = require('ejs');
const ClientHttp = require('../utils/Client');
const qs = require('qs');

class NotificationService {
    constructor({
        errors, config, africasTalkingService, sms1960Service, infobipService
    }) {
        this.config = config;
        // this.smsClient = new ClientHttp(this.baseUrl, this.headers);
        // this.smsClient = africasTalkingService;
        // this.smsClient = sms1960Service;
        this.smsClient = infobipService;

        const emailHeaders = {
            'secret-key': config.get('notification.api_key')
        };
        this.emailClient = new ClientHttp(config.get('notification.base_uri'), emailHeaders);
    }

    async sendSms(payload) {
        try {
            const response = await this.smsClient.sendSms(payload);
            return response;
        } catch (error) {
            console.log('SEND SMS ERROR', error);
            throw new Error(error);
        }
    }

    async parsePhoneNumberToStandard(phoneNumbers) {
        try {
            const results = [];
            for (let i = 0; i <= phoneNumbers.length - 1; i++) {
                if (phoneNumbers[i].length === 11) {
                    phoneNumbers[i] = `+234${phoneNumbers[i].substring(1)}`;
                }
                if (phoneNumbers[i].length === 13 && phoneNumbers[i].substring(0, 1) !== '+') {
                    phoneNumbers[i] = `+${phoneNumbers[i]}`;
                }

                results.push(phoneNumbers[i]);
            }

            return phoneNumbers;
        } catch (error) {
            throw new Error(error);
        }
    }

    async sendUploadMail({ user, successBucketUrl, errorBucketUrl }) {
        try {
            const emailTemplate = await ejs.renderFile(path.join(__dirname, '../../views/emails/upload.ejs'), { user, successBucketUrl, errorBucketUrl });

            const message = {
                to: user.email,
                bcc: [ 'akudevops2@gmail.com', 'admin@aku.technology' ],
                from: this.config.get('notification.email.from_mail'),
                subject: 'File Upload Report',
                html: emailTemplate
            };

            const response = await this.emailClient.post(
                'notifications/email',
                message
            );

            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async sendApplicantUploadMail({ metadata, successBucketUrl, errorBucketUrl }) {
        try {
            const { first_name, last_name, email } = metadata;

            const emailTemplate = await ejs.renderFile(path.join(__dirname, '../../views/emails/account_upload.ejs'), {
                first_name, last_name, successBucketUrl, errorBucketUrl
            });

            const message = {
                to: email,
                bcc: [ 'akudevops2@gmail.com' ],
                from: this.config.get('notification.email.from_mail'),
                subject: 'Account Upload Report',
                html: emailTemplate
            };

            const response = await this.emailClient.post(
                'notifications/email',
                message
            );

            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = NotificationService;
