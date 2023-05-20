/* eslint-disable radix */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
const jwt = require('jsonwebtoken');
const generator = require('generate-password');

const currencyConverter = new Intl.NumberFormat('ha-NG', { style: 'currency', currency: 'NGN' });
const {
    addMonths, endOfToday, addMinutes
} = require('date-fns');
const uuidAPIKey = require('uuid-apikey');
const ClientHttp = require('../utils/Client');
const AkuPayWorkers = require('../queues/workers/applicants/akuPay');
const { v4: uuidv4 } = require('uuid');
const smsMessage = require('../messages');
const short_code = require('../constants/variables');


class Helper {
    constructor({
        config, errors, database, queries, akupayService, notificationService
    }) {
        this.config = config;
        this.errors = errors;
        this.database = database;
        this.queries = queries;
        this.akupayService = akupayService;
        this.notificationService = notificationService;
    }

    async generateResetPasswordLink() {
        try {
            const { uuid } = uuidAPIKey.create();
            const expiredAt = addMinutes(new Date(), 15);

            return { tokenId: uuid, uuid, expiredAt };
        } catch (err) {
            throw new Error(err);
        }
    }

    async formResetPasswordLink() {
        try {
            const {
                tokenId,
                uuid,
                expiredAt
            } = await this.generateResetPasswordLink();

            const link = `${this.config.get('server.app.frontend_uri')}?token=${tokenId}`;

            return { tokenId: uuid, expiredAt, url: link };
        } catch (err) {
            throw new Error(err);
        }
    }

    async generateToken(payload) {
        try {
            const token = jwt.sign(
                {
                    data: payload
                },
                this.config.get('server.jwt.secret'),
                { expiresIn: this.config.get('server.jwt.expires') }
            );

            return token;
        } catch (err) {
            throw new this.errors.InternalServer(err);
        }
    }

    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.config.get('server.jwt.secret'));

            return decoded;
        } catch (err) {
            throw new this.errors.InternalServer(err);
        }
    }

    generateKey() {
        try {
            const generatedKey = uuidAPIKey.create();

            const publicKey = `PUBLIC-${generatedKey.uuid.toUpperCase()}`;
            const secretKey = `SECRET-${generatedKey.apiKey}`;

            return { public_key: publicKey, secret_key: secretKey };
        } catch (err) {
            throw new this.errors.InternalServer(err);
        }
    }

    getLimitOffset({ limit = 20, page = 1 }) {
        try {
            const offset = parseInt(parseInt(limit) * parseInt(page) - parseInt(limit));

            return { offset, limit, page };
        } catch (err) {
            throw new Error(err);
        }
    }


    async checkIfWhitelistExists(payload) {
        try {
            const { phone_number } = payload;
            const whiteList = await this.database.query.oneOrNone(this.queries.whitelist.get, { phone_number });
            return whiteList || null;
        } catch (error) {
            throw new Error(error);
        }
    }
    /**
  *
  *
  * @param {*} payload
  * @returns
  */
    async checkIfApplicantAkuPay(payload) {
        return this.akupayService.checkIfAccountExists(payload);
    }

    /**
  *
  *
  * @param {*} payload
  * @returns
  */
    async createWhiteList(payload) {
        return new Promise(async(resolve, reject) => {
            try {
                payload.phone_number = this.convertPhoneNumberToInternationalFormat(payload.phone_number);

                const whiteList = await this.database.query.oneOrNone(this.queries.whitelist.create, {
                    phone_number: payload.phone_number,
                    bvn: payload.bvn,
                    first_name: payload.first_name,
                    last_name: payload.last_name
                });
                return resolve(whiteList);
            } catch (error) {
                return reject(error);
            }
        });
    }
    /**
  *
  *
  * @param {*} payload
  * @returns
  */
    async getWhitelistTransaction(payload) {
        return new Promise(async(resolve, reject) => {
            try {
                const getTime = await this.database.query.oneOrNone(this.queries.transaction.validateTime, {
                    phone_number: payload.phone_number,
                    range: payload.range
                });

                return resolve(getTime);
            } catch (error) {
                return reject(error);
            }
        });
    }

    async addWhiteListTransaction(payload) {
        return new Promise(async(resolve, reject) => {
            try {
                const transaction = await this.database.query.oneOrNone(this.queries.transaction.create, {
                    amount: payload.amount,
                    whitelist_id: payload.whitelist_id,
                    reference: uuidv4(),
                    paid_at: new Date(payload.paid_at),
                    programme_id: payload.programme_id
                });
                return resolve(transaction);
            } catch (error) {
                return reject(error);
            }
        });
    }

    async addWhiteListToAdminVerify(payload) {
        return new Promise(async(resolve, reject) => {
            try {
                const adminVerify = await this.database.query.oneOrNone(this.queries.adminVerify.create, {
                    amount: payload.amount,
                    whiteList_id: payload.whiteList_id,
                    last_paid_date: payload.paid_at
                });
                return resolve(adminVerify);
            } catch (error) {
                return reject(error);
            }
        });
    }

    async createAccount({ phone_number }) {
        try {
            const response = await this.akupayService.createAccount({ phone_number });

            // AkuPayWorkers.create(phone_number)
            return true;
        } catch (err) {
            return false;
            // throw new Error(err)
        }
    }

    async creditAccountOnAkupay({ phone_number, amount }) {

    }

    async debitAccountOnAkupay({ phone_number, amount }) {

    }

    async saveWebhookResponse({ phone_number, message }) {
        try {
            const data = await this.database.query.oneOrNone(this.queries.app.createWebhookResponse, { phone_number, message });

            return data;
        } catch (err) {
            throw new Error(err);
        }
    }

    async saveUploadError({ phone_number, error_message, programme_id }) {
        try {
            try {
                const data = await this.database.query.oneOrNone(this.queries.app.createUploadError, { phone_number, error_message, programme_id });

                return data;
            } catch (err) {
                throw new Error(err);
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    async createAkupayAccount({ row, programme_id }) {
        try {
            let applicant = await this.checkIfApplicantAkuPay({ phone_number: row.phone_number });

            if (applicant) {
                return applicant;
            }
            const message = await this.getSmsMessage(programme_id, 'registration', '-phone_number-', row.phone_number);
            applicant = await this.createAccount({ phone_number: row.phone_number });
            await this.notificationService.sendSms({ to: row.phone_number, message });

            return applicant;
        } catch (err) {
            throw new Error(err);
        }
    }

    async getSmsMessage(programme_id, programme_name, message_key, program_name_key, name_key, amount_key, name_value, amount_value) {
        try {
            const messages = await this.database.query.oneOrNone(this.queries.programme_sms.getMessage, {
                programme_id,
                message_key
            });

            if (!messages || !messages.message_value) {
                throw new Error('Unable to send user sms, no whitelist message set on programme');
            }
            const matchObject = {
                [program_name_key]: programme_name,
                [name_key]: name_value,
                [amount_key]: `${currencyConverter.format(amount_value)}`,
                [short_code.africasTalking.field]: short_code.africasTalking.code,
                [short_code.sms1960.field]: short_code.sms1960.code
            };
            const searchValue = new RegExp(Object.keys(matchObject).join('|'), 'gi');
            const message = messages.message_value.replace(searchValue, (matched) => matchObject[matched]);
            return message;
        } catch (error) {
            throw error;
        }
    }

    async getDisbursedSms(programme, payment) {
        try {
            const message = `Thank you! ${programme.name.toUpperCase()} has successfully disbursed ${currencyConverter.format(payment.amount)} to ${payment.bank_name.toUpperCase()} ${payment.account_number} belonging to ${payment.account_name.toUpperCase()}.`;
            return message;
        } catch (error) {
            throw error;
        }
    }

    convertPhoneNumberToInternationalFormat(phone_number) {
        if (phone_number.length == 11) {
            phone_number = `+234${phone_number.substring(1)}`;
        }
        if (phone_number.length == 10) {
            phone_number = `+234${phone_number}`;
        }

        if (phone_number.length == 13) {
            phone_number = `+${phone_number}`;
        }

        return phone_number;
    }

    async sendSms(payload) {
        try {
            return await this.notificationService.sendSms(payload);
        } catch (err) {
            throw new Error(err);
        }
    }

    async createApplicantSms(payload) {
        return new Promise(async(resolve, reject) => {
            try {
                const applicantSms = await this.database.query.oneOrNone(this.queries.applicant_sms.create, {
                    source: payload.source,
                    to: payload.to,
                    from: payload.from,
                    sms_content: payload.sms_content,
                    message_id: payload.message_id,
                    status: payload.status
                });
                return resolve(applicantSms);
            } catch (error) {
                return reject(error);
            }
        });
    }

    async updateApplicantSmsStatus(message_id, delivery_status) {
        return new Promise(async(resolve, reject) => {
            try {
                const updateResponse = await this.database.query.oneOrNone(this.queries.applicant_sms.updateByMessageId, {
                    message_id,
                    delivery_status
                });
                return resolve(updateResponse);
            } catch (error) {
                return reject(error);
            }
        });
    }

    async getPaymentRemark({ transactionId }) {
        const transaction = await this.database.query.oneOrNone(this.queries.transaction.getFullTransactionDetails, { id: transactionId });

        const programmeNameSlug = transaction.programme_name.split('').splice(0, 5).join('');

        let currentMonth = new Date().getMonth();

        if (currentMonth < 10) { currentMonth = `0${currentMonth}`; }
        const remark = `AKU-${programmeNameSlug}-${new Date().getTime()}`;
        // const remark = `${programmeNameSlug}${currentMonth}${new Date().getFullYear()}/${transaction.phone_number}`;

        return remark;
    }
}

module.exports = Helper;
