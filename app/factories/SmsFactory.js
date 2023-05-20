/* eslint-disable one-var */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-empty */
/* eslint-disable use-isnan */
/* eslint-disable prefer-destructuring */
/* eslint-disable eqeqeq */
/* eslint-disable max-len */
/* eslint-disable radix */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
// import * as helper from '../utils/Helper';

import schedule from 'node-schedule';

const { differenceInDays, isToday, format } = require('date-fns');
const messages = require('../messages');
const ApplicantReplyWorker = require('../queues/workers/applicants/replySms');
const SmsLogsWorker = require('../queues/workers/smsLogs/export');

const {
    SMS_PROVIDER: {
        SMS1960: SMS1960_PROVIDER,
        AFRICALSTALKING: AFRICALSTALKING_PROVIDER,
        INFOBIP: INFOBIP_PROVIDER
    },
    SMS_SUCCESS_STATUS,
    SMS_DEFAULT_STATUS,
    SMS_OUTGOING_TYPE,
    SMS_INCOMING_TYPE,
    ACCEPTED_DELIVERY_STATUS,
    SMS_FAILED_STATUS
} = require('../constants');

class SmsFactory {
    constructor({
        config,
        errors,
        database,
        queries,
        sosService,
        notificationService,
        paymentService,
        akupayService,
        helper
    }) {
        this.config = config;
        this.errors = errors;
        this.database = database;
        this.queries = queries;
        this.sosService = sosService;
        this.akupayService = akupayService;
        this.notificationService = notificationService;
        this.paymentService = paymentService;
        this.helper = helper;
    }

    async africastalkingWebhook({ body: payload, query }) {
        try {
            const response = await this.smsWebhook(payload);

            return response;
        } catch (err) {
            throw new this.errors.InternalServer(err);
        }
    }

    async sendMoneyNow(file) {
        try {
            console.log({ file });
            return;
        } catch (error) {
            console.log(error);
        }
    }

    async infobipWebhook({ body: { results }, messageCount }) {
        try {
            let {
                messageId, from, to, text, keyword, receivedAt
            } = results[0];
            text = text.replace('AKUPAY ', '');
            text = text.replace('Akupay ', '');
            text = text.replace('Pay ', '');

            if (from.length === 13) {
                from = `+${from}`;
            }
            const response = await this.smsWebhook({ to: INFOBIP_PROVIDER, from, text });
            console.log({ response });
            return response;
        } catch (err) {
            throw new this.errors.InternalServer(err);
        }
    }

    async sms1960Webhook({ query, body, originalUrl }) {
        try {
            let { sms_from: from, sms_message: text, datetime } = body;

            text = text.replace('Akupay ', '');
            text = text.replace('Pay ', '');

            const response = await this.smsWebhook({ from, text });

            return response;
        } catch (err) {
            throw new this.errors.InternalServer(err);
        }
    }

    async smsWebhook(payload) {
        try {
            const { text, from, to } = payload;
            const { account_number, bank_name } = await this.parseReceivedSmsContent(text);
            const source = !to ? SMS1960_PROVIDER : AFRICALSTALKING_PROVIDER;
            await this.database.query.oneOrNone(
                this.queries.applicant_sms.create,
                {
                    source,
                    from,
                    to,
                    sms_content: text,
                    message_id: '',
                    delivery_status: SMS_SUCCESS_STATUS,
                    sms_type: SMS_INCOMING_TYPE
                }
            );
            const result = await this.sosService.resolveAccountDetails({
                phone_number: payload.from,
                message_content: payload.text,
                account_number,
                bank_name,
                account_name: ''
            });

            console.log({ result });
            const whitelist = await this.database.query.oneOrNone(this.queries.whitelist.get, {
                phone_number: from
            });
            if (!whitelist) {
                await this.helper.saveWebhookResponse({ phone_number: from, message: 'Whitelist not found' });
                console.log('Whitelist not found');
                return 'done';
            }

            if (whitelist.flagged) {
                await this.helper.saveWebhookResponse({ phone_number: from, message: 'Whitelist has been flagged from receiving payment' });
                console.log('Whitelist has been flagged from receiving payment');
                return 'done';
                // throw new this.errors.BadRequest('Whitelist has been flagged from receiving payment')
            }

            const transaction = await this.database.query.oneOrNone(this.queries.transaction.getLastUnpaidByPhoneNumberAndStatus, {
                whitelist_id: whitelist.id,
                status: 'disbursed'
            });
            if (!transaction) {
                await this.helper.saveWebhookResponse({ phone_number: from, message: 'Transaction not found' });

                console.log('Transaction not found');
                return 'done';
            }

            const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: transaction.programme_id });

            if (!programme) {
                await this.helper.saveWebhookResponse({ phone_number: from, message: 'Transaction programme not found' });

                console.log('Transaction programme not found');
                return 'done';
            }

            if (!result.success) {
                const failed = await this.database.query.oneOrNone(this.queries.transaction.updateSosTransactionId, {
                    id: transaction.id,
                    sos_transaction_id: result.id
                });
                console.log(failed);
                await this.sosService.updateSosProgrammeTransaction({
                    id: result.id,
                    programme_id: transaction.programme_id
                });
                await this.helper.saveWebhookResponse({ phone_number: from, message: 'Unable to resolve bank account' });
                return 'Unable to resolve bank account';
            }

            const paidDate = await this.database.query.oneOrNone(this.queries.transaction.getLastUnpaidByPhoneNumberAndStatus, {
                whitelist_id: whitelist.id,
                status: 'paid'
            });

            if (paidDate && paidDate.transaction_date) {
                if (paidDate.programme_id === transaction.programme_id) {
                    const lasTPaidInterval = differenceInDays(new Date(transaction.paid_at), new Date(paidDate.transaction_date));
                    if (parseInt(lasTPaidInterval) < parseInt(programme.flagging_duration)) {
                        await this.database.query.oneOrNone(this.queries.transaction.flag, {
                            id: transaction.id,
                            account_number: result.account_number,
                            account_name: result.account_name,
                            bank_name: result.bank_name,
                            bank_code: result.bank_code,
                            sos_transaction_id: result.id
                        });
                        await this.sosService.updateSosProgrammeTransaction({
                            id: result.id,
                            programme_id: transaction.programme_id
                        });

                        console.log('Transaction flagged');

                        await this.helper.saveWebhookResponse({ phone_number: from, message: 'Transaction was flagged' });
                        return 'done';
                    }
                }
            }

            if (!isToday(new Date(transaction.paid_at))) {
                await this.sosService.updateSosProgrammeTransaction({
                    id: result.id,
                    programme_id: transaction.programme_id
                });
                await this.helper.saveWebhookResponse({ phone_number: from, message: 'Transaction not today' });
                console.log('Transaction not today');
                return 'done';
            }

            const paymentRes = await this.paymentService.disburseFund({
                account_number: result.account_number,
                bank_code: result.bank_code,
                account_name: result.account_name,
                reference: transaction.reference,
                remark: messages.paymentRemark,
                amount: transaction.amount,
                transaction_id: transaction.id,
                date: format(new Date(), 'yyyy/MM/dd')
            });

            let disbursedStatus = 'not_paid';

            if (paymentRes.code == 1000) {
                disbursedStatus = 'paid';
                const msg = await this.helper.getDisbursedSms(programme, { ...transaction, ...result });
                const date = new Date();
                const runtime = date.setMinutes(date.getMinutes() + 1);

                schedule.scheduleJob(
                    new Date(runtime),
                    (async(notification) => {
                        await notification.sendSms({ to: from, message: msg });
                    }).bind(null, this.notificationService)
                );
            }

            await this.database.query.oneOrNone(this.queries.transaction.updateDisburseTransaction, {
                id: transaction.id,
                response_code: paymentRes.code || null,
                response_message: paymentRes.message || null,
                account_number: result.account_number,
                account_name: result.account_name,
                bank_name: result.bank_name,
                bank_code: result.bank_code,
                status: disbursedStatus,
                sos_transaction_id: result.id
            });

            let akupayFrom = from;

            if (from.indexOf('+') >= 0) {
                akupayFrom = from.substring(1);
            }

            if (paymentRes.code == 1000) {
                await this.akupayService.debitBeneficiaryAccount({ phone_number: akupayFrom, amount: transaction.amount });
            }

            await this.helper.saveWebhookResponse({ phone_number: from, message: paymentRes.message || 'N/A' });


            await this.sosService.updateSosProgrammeTransaction({
                id: result.id,
                programme_id: transaction.programme_id
            });

            return 'sucess';
        } catch (err) {
            console.log({ err });
        }
    }

    async parseReceivedSmsContent(messageContent) {
        try {
            const messageChunk = await this.parseSmsDelimeter(messageContent);
            if (messageChunk == null) {
                throw new this.errors.BadRequest('Invalid Message Format');
            }
            let bank = null;
            let account = null;
            const numcheck = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ];
            const cha = messageChunk[0].split('');
            if (numcheck.includes(cha[0]) || numcheck.includes(cha[1]) || numcheck.includes(cha[2])) {
                bank = messageChunk[1];
                account = messageChunk[0];
            } else {
                bank = messageChunk[0];
                account = messageChunk[1];
            }
            return {
                bank_name: bank,
                account_number: account
            };
        } catch (err) {
            throw new this.errors.InternalServer(err);
        }
    }

    async parseSmsDelimeter(sms) {
        const splitCharacters = [ ',', '.', '-', ' ', '*', ':', ';' ];

        let messageChunkSplit;
        for (let i = 0; i <= splitCharacters.length - 1; i++) {
            messageChunkSplit = sms.split(splitCharacters[i]);
            if (messageChunkSplit.length >= 2) {
                return messageChunkSplit;
            }
        }

        return null;
    }

    async getApplicantRepliesQuery({ query }) {
        const {
            page = 1, limit = 20, s, period, start_date, end_date
        } = query;
        const { offset } = await this.helper.getLimitOffset({ page, limit });
        let dbQuery = this.queries.applicant_reply.all;
        let dbQuery2 = this.queries.applicant_reply.allTotal;
        if (period && period !== '' && period != 'undefined') {
            dbQuery += this.queries.base.interval(period);
            dbQuery2 += this.queries.base.interval(period);
        }
        if (start_date && start_date !== '' && start_date != 'undefined') {
            dbQuery += this.queries.base.filterColumn('created_at', start_date, '>=');
            dbQuery2 += this.queries.base.filterColumn('created_at', start_date, '>=');
            if (end_date && end_date !== '' && end_date != 'undefined') {
                dbQuery += this.queries.base.filterColumn('created_at', end_date, '<=');
                dbQuery2 += this.queries.base.filterColumn('created_at', end_date, '<=');
            }
        }

        if ((s && s !== '' && s != 'undefined')) {
            dbQuery += this.queries.applicant_reply.search(s);
            dbQuery2 += this.queries.applicant_reply.search(s);
        }
        dbQuery += this.queries.base.paginate({ limit, offset });

        return { dbQuery, dbQuery2 };
    }

    async getApplicantReplies(req) {
        const { dbQuery, dbQuery2 } = await this.getApplicantRepliesQuery(req);

        const [ applicantReply, total ] = await await this.database.query.tx(t => {
            const q1 = t.any(dbQuery);
            const q2 = t.oneOrNone(dbQuery2);

            return t.batch([ q1, q2 ]);
        });

        // const applicantReply = await this.database.query.any(dbQuery);

        return { data: applicantReply, paginationTotal: total.over_all_count };
    }


    async getApplicantRepliesExport({ body }) {
        const { user } = body;

        const dbQuery = await this.getApplicantRepliesQuery(body);
        await ApplicantReplyWorker.export({ dbQuery, user });

        return 'success';
    }


    async africastalkingSMSWebhook({ body, query }) {
        try {
            let status = body.status;
            if (ACCEPTED_DELIVERY_STATUS.includes(body.status.toUpperCase())) {
                status = SMS_SUCCESS_STATUS;
            }
            const response = await this.helper.updateApplicantSmsStatus(body.id, status);

            return true;
        } catch (err) {
            throw new this.errors.InternalServer(err);
        }
    }

    async getSmsLogs({ query }) {
        try {
            const {
                page = 1, s = '', sms_type = 'outgoing', limit = 20, start_date, end_date
            } = query;
            let totalCountQuery = this.queries.applicant_sms.getSmsLogsTotalByType;
            let sqlQuery = this.queries.applicant_sms.getSmsLogsByType;
            const paginatePayload = this.helper.getLimitOffset(query);
            const dbValues = { sms_type };
            if (start_date && start_date !== 'undefined') {
                sqlQuery += this.queries.base.dateRangeAnd(start_date, end_date, 'aps');
                totalCountQuery += this.queries.base.dateRangeAnd(start_date, end_date, 'aps');
            }
            if (s && s !== '' && s != 'undefined') {
                sqlQuery += this.queries.applicant_sms.searchPatchQuery;
                dbValues.s = `${s}:*`;
            }
            sqlQuery += this.queries.base.sortColumn('created_at', 'DESC');

            sqlQuery += this.queries.base.paginate(paginatePayload);

            const [ data, totalData ] = await this.database.query.tx(t => {
                const q1 = t.any(sqlQuery, dbValues);
                const q2 = t.oneOrNone(totalCountQuery, dbValues);

                return t.batch([ q1, q2 ]);
            });

            return { data, paginationTotal: totalData.over_all_count };
        } catch (error) {
            console.log(error);
            throw new this.errors.InternalServer(error);
        }
    }

    async exportSmsLogs({ body }) {
        try {
            const { query, params, user } = body;

            const {
                page = 1, sms_type = 'outgoing', limit = 20, start_date, end_date
            } = query;
            let totalCountQuery = this.queries.applicant_sms.getSmsLogsTotalByType;
            let dbQuery = this.queries.applicant_sms.getSmsLogsByType;
            const paginatePayload = this.helper.getLimitOffset(query);

            if (start_date && start_date !== 'undefined') {
                dbQuery += this.queries.base.dateRangeAnd(start_date, end_date, 'aps');
                totalCountQuery += this.queries.base.dateRangeAnd(start_date, end_date, 'aps');
            }
            dbQuery += this.queries.base.sortColumn('created_at', 'DESC');

            dbQuery += this.queries.base.paginate(paginatePayload);
            const dbValues = { sms_type };
            await SmsLogsWorker.export({
                dbQuery,
                dbValues,
                user
            });
        } catch (error) {
            console.log(error);
            throw new this.errors.InternalServer(error);
        }
    }
}

module.exports = SmsFactory;
