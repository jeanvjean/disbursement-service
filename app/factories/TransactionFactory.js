/* eslint-disable no-console */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable radix */
import schedule from 'node-schedule';

const { differenceInDays, isToday, format } = require('date-fns');
const TransactionsWorker = require('../queues/workers/transactions/export');
const CashoutWorker = require('../queues/workers/cashout/export');
const RetractedWorker = require('../queues/workers/retracted/export');

const { GAPS_RESPONSE_CODE: { REQUERY } } = require('../constants');

class TransactionFactory {
    constructor({
        config,
        errors,
        database,
        queries,
        sosService,
        notificationService,
        paymentService,
        akupayService,
        helper,
        beneficiaryAccountUploadWorker
    }) {
        this.config = config;
        this.errors = errors;
        this.database = database;
        this.queries = queries;
        this.sosService = sosService;
        this.notificationService = notificationService;
        this.paymentService = paymentService;
        this.akupayService = akupayService;
        this.helper = helper;
        this.beneficiaryAccountUploadWorker = beneficiaryAccountUploadWorker;
    }

    async parseParams({
        initialDbQuery, initalDbValues, query, alias = ''
    }) {
        const {
            flagged = null,
            sort = null,
            interval = null,
            search = null,
            status = null,
            s = null,
            period = null,
            start_date = null,
            end_date = null,
            programme_id = null,
            programme = null
        } = query;

        if (flagged && flagged !== '' && flagged != 'undefined') {
            let flaggedStatus = false;
            if (flagged == 'true') {
                flaggedStatus = true;
            }
            initialDbQuery += this.queries.base.filterColumn('flagged', flaggedStatus);
        }

        if (status && status !== '' && status != 'undefined') {
            initialDbQuery += this.queries.base.filterColumn('status', status);
        }

        if (period && period !== '' && period != 'undefined') {
            initialDbQuery += this.queries.base.interval(period, 't.');
        }

        if (programme_id && programme_id !== '' && programme_id != 'undefined') {
            initialDbQuery += this.queries.base.filterColumn('programme_id', programme_id);
        }

        if (programme && programme !== '' && programme != 'undefined') {
            initialDbQuery += this.queries.base.filterColumn('programme_id', programme);
        }

        if (start_date && start_date !== '' && start_date != 'undefined') {
            initialDbQuery += this.queries.base.filterColumn('t.created_at', start_date, '>=');
            if (end_date && end_date !== '' && end_date != 'undefined') {
                initialDbQuery += this.queries.base.filterColumn('t.created_at', end_date, '>=');
            }
        }

        if ((search && search !== '' && search != 'undefined')) {
            const [ column, value ] = search.split('|');
            if (column && value) {
                initialDbQuery += this.queries.base.search(column, value);
            }
        }

        if ((s && s !== '' && s != 'undefined')) {
            const [ column, value ] = s.split('|');
            if (column && value) {
                initialDbQuery += this.queries.base.search(column, value);
            }
        }

        if (interval && interval !== '' && interval != 'undefined') {
            initialDbQuery += this.queries.base.interval(interval, 't.');
        }

        if (sort && sort !== '' && sort != 'undefined') {
            const [ column = 't.created_at', arrange = 'DESC' ] = sort.split('|');
            initialDbQuery += this.queries.base.sortColumn(column, arrange.toUpperCase());
        }

        return { dbQuery: initialDbQuery, dbValues: initalDbValues };
    }

    async all({ query }) {
        const {
            page = 1, limit = 20, band = '', bands = '', programmes = ''
        } = query;
        const transactionSearch = query.s;
        delete query.s;
        const { offset } = await this.helper.getLimitOffset({ page, limit });

        const initialDbQuery = this.queries.transaction.all;
        const initialDbQuery2 = this.queries.transaction.allTotal;

        const initalDbValues = {
            offset,
            limit
        };

        let { dbQuery, dbValues } = await this.parseParams({
            initialDbQuery, initalDbValues, query, alias: 't.'
        });
        let { dbQuery: dbQuery2 } = await this.parseParams({
            initialDbQuery: initialDbQuery2, initalDbValues, query, alias: 't.'
        });

        if (transactionSearch && transactionSearch !== '' && transactionSearch != 'undefined') {
            dbQuery += this.queries.transaction.search;
            dbQuery2 += this.queries.transaction.search;
            dbValues.s = `${transactionSearch}:*`;
        }

        if (band && band !== '') {
            dbQuery += this.queries.base.filterColumn('amount', band);
            dbQuery2 += this.queries.base.filterColumn('amount', band);
        }

        if (bands && bands !== '') {
            dbQuery += this.queries.base.filterColumn('amount', bands);
            dbQuery2 += this.queries.base.filterColumn('amount', bands);
        }

        if (programmes && programmes.length) {
            const filteredProgrammes = programmes.split(',');
            if (filteredProgrammes.length) {
                dbQuery += this.queries.base.whereIn('programme_id');
                dbQuery2 += this.queries.base.whereIn('programme_id');
                dbValues.arr = filteredProgrammes;
            }
        }

        dbQuery += this.queries.base.sortColumn('t.created_at', 'DESC');

        dbQuery += this.queries.base.paginate({ limit, offset });

        const [ data, total ] = await this.database.query.tx(t => {
            const q1 = t.any(dbQuery, dbValues);
            const q2 = t.oneOrNone(dbQuery2, dbValues);

            return t.batch([ q1, q2 ]);
        });

        return { data, paginationTotal: total.over_all_count };
    }

    async get({ params }) {
        const transaction = await this.database.query.oneOrNone(this.queries.transaction.get, { id: params.id });

        if (!transaction) {
            throw new this.errors.BadRequest('Invalid Transaction ID');
        }

        return transaction;
    }

    async getDisbursement(req) {
        try {
            const { query } = req;

            const {
                period, start_date, end_date, programme_id = '', programmes = ''
            } = query;
            let sqlQuery = this.queries.transaction.getDisbursement;
            let sqlQuery2 = this.queries.transaction.getDisbursementTotal;

            const dbValues = {};

            if (query.period && query.period !== 'undefined') {
                sqlQuery += this.queries.base.interval(period, 't.');
                sqlQuery2 += this.queries.base.interval(period, 't.');
            }
            if (programme_id && programme_id !== 'undefined' && programme_id !== '') {
                sqlQuery += this.queries.base.filterColumn('t.programme_id', programme_id);
                sqlQuery2 += this.queries.base.filterColumn('t.programme_id', programme_id);
            }

            if (programmes && programmes !== '') {
                const filteredProgrammes = programmes.split(',');
                if (filteredProgrammes.length) {
                    sqlQuery += this.queries.base.whereIn('programme_id');
                    sqlQuery2 += this.queries.base.whereIn('programme_id');
                    dbValues.arr = filteredProgrammes;
                }
            }

            if (start_date && start_date !== 'undefined') {
                sqlQuery += this.queries.transaction.attachDateRange(start_date, end_date);
                sqlQuery2 += this.queries.transaction.attachDateRange(start_date, end_date);
            }
            sqlQuery = sqlQuery + this.queries.transaction.group('amount') + this.queries.base.sortColumn('amount', 'ASC', 't.');

            const data = await this.database.query.any(sqlQuery, dbValues);
            const data2 = await this.database.query.oneOrNone(sqlQuery2, dbValues);

            return { data, total: data2 };
        } catch (error) {
            throw new this.errors.InternalServer(error);
        }
    }

    async getRetracted(req) {
        try {
            const { query } = req;
            const {
                period, start_date, end_date, programme_id = '', programmes = ''
            } = query;
            let sqlQuery = this.queries.transaction.getRetracted;
            let sqlQuery2 = this.queries.transaction.getRetractedTotal;
            const dbValues = {};

            if (query.period && query.period !== 'undefined') {
                sqlQuery += this.queries.base.interval(period, 't.');
                sqlQuery2 += this.queries.base.interval(period, 't.');
            }
            if (programme_id && programme_id !== 'undefined' && programme_id !== '') {
                sqlQuery += this.queries.base.filterColumn('t.programme_id', programme_id);
                sqlQuery2 += this.queries.base.filterColumn('t.programme_id', programme_id);
            }
            if (start_date && start_date !== 'undefined') {
                sqlQuery += this.queries.transaction.attachDateRange(start_date, end_date);
                sqlQuery2 += this.queries.transaction.attachDateRange(start_date, end_date);
            }
            if (programmes && programmes !== '') {
                const filteredProgrammes = programmes.split(',');
                if (filteredProgrammes.length) {
                    sqlQuery += this.queries.base.whereIn('programme_id');
                    sqlQuery2 += this.queries.base.whereIn('programme_id');
                    dbValues.arr = filteredProgrammes;
                }
            }
            sqlQuery = sqlQuery + this.queries.transaction.group('amount') + this.queries.base.sortColumn('amount', 'ASC', 't.');
            const data = await this.database.query.any(sqlQuery, dbValues);
            const data2 = await this.database.query.oneOrNone(sqlQuery2, dbValues);

            return { data, total: data2 };
        } catch (error) {
            throw new this.errors.InternalServer(error);
        }
    }

    async getCashout(req) {
        try {
            const { query } = req;
            const {
                period, start_date, end_date, programme_id = '', programmes = ''
            } = query;
            let sqlQuery = this.queries.transaction.getCashout;
            let sqlQuery2 = this.queries.transaction.getCashoutTotal;
            const dbValues = {};

            if (query.period && query.period !== 'undefined') {
                sqlQuery += this.queries.base.interval(period, 't.');
                sqlQuery2 += this.queries.base.interval(period, 't.');
            }
            if (programme_id && programme_id !== 'undefined' && programme_id !== '') {
                sqlQuery += this.queries.base.filterColumn('t.programme_id', programme_id);
                sqlQuery2 += this.queries.base.filterColumn('t.programme_id', programme_id);
            }
            if (start_date && start_date !== 'undefined') {
                sqlQuery += this.queries.transaction.attachDateRange(start_date, end_date);
                sqlQuery2 += this.queries.transaction.attachDateRange(start_date, end_date);
            }
            if (programmes && programmes !== '') {
                const filteredProgrammes = programmes.split(',');
                if (filteredProgrammes.length) {
                    sqlQuery += this.queries.base.whereIn('programme_id');
                    sqlQuery2 += this.queries.base.whereIn('programme_id');
                    dbValues.arr = filteredProgrammes;
                }
            }

            sqlQuery = sqlQuery + this.queries.transaction.group('amount') + this.queries.base.sortColumn('amount', 'ASC', 't.');
            const data = await this.database.query.any(sqlQuery, dbValues);
            const data2 = await this.database.query.oneOrNone(sqlQuery2, dbValues);

            return { data, total: data2 };
        } catch (error) {
            throw new this.errors.InternalServer(error);
        }
    }

    async pay({ body: payload }) {
        const { transaction_id } = payload;
        const transaction = await this.database.query.oneOrNone(this.queries.transaction.get, { id: transaction_id });

        if (!transaction) {
            throw new this.errors.NotFound('Invalid Transaction ID');
        }

        if (transaction.status === 'paid') {
            throw new this.errors.BadRequest('Transaction was paid before');
        }

        const whitelist = await this.database.query.oneOrNone(this.queries.whitelist.getById, { id: transaction.whitelist_id });

        if (!whitelist) {
            throw new this.errors.NotFound('Whitelist Not Found');
        }
        const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: transaction.programme_id });

        if (!programme) {
            throw new this.errors.NotFound('Invalid Programme');
        }

        const paymentRes = await this.paymentService.disburseFund({
            account_number: transaction.account_number,
            bank_code: transaction.bank_code,
            account_name: transaction.account_name,
            reference: transaction.reference,
            remark: '',
            amount: transaction.amount,
            transaction_id: transaction.id,
            date: format(new Date(), 'yyyy/MM/dd')
        });

        const disbursedStatus = 'paid';
        if (paymentRes.code != 1000) {
            throw new this.errors.BadRequest('Unable to pay');
        }

        let akupayFrom = whitelist.phone_number;
        if (whitelist.phone_number.indexOf('+') >= 0) {
            akupayFrom = whitelist.phone_number.substring(1);
        }

        // await this.akupayService.debitBeneficiaryAccount({ phone_number: akupayFrom , amount: transaction.amount});
        const dataPayload = {
            id: transaction.id,
            response_code: paymentRes.code || null,
            response_message: paymentRes.message || null,
            account_number: transaction.account_number,
            account_name: transaction.account_name,
            bank_name: transaction.bank_name,
            status: 'paid',
            programme_name: programme.name,
            programme_id: programme.id
        };

        const msg = await this.helper.getDisbursedSms(programme, { ...dataPayload, amount: transaction.amount, bank_name: transaction.bank_name });
        const date = new Date();
        const runtime = date.setMinutes(date.getMinutes() + 1);
        schedule.scheduleJob(
            new Date(runtime),
            (async(notification) => {
                await notification.sendSms({ to: akupayFrom, message: msg });
            }).bind(null, this.notificationService)
        );
        await this.database.query.oneOrNone(this.queries.transaction.updateDisburseFlaggedTransaction, {
            ...dataPayload
        });

        return { ...dataPayload, amount: transaction.amount };
    }

    async requery({ body: { transaction_id } }) {
        const transaction = await this.database.query.oneOrNone(this.queries.transaction.get, { id: transaction_id });

        if (!transaction) {
            throw new this.errors.NotFound('Invalid Transaction ID');
        }

        if (transaction.response_code !== REQUERY) {
            throw new this.errors.BadRequest('Transaction can not be requeried');
        }

        if (transaction.status === 'paid') {
            throw new this.errors.BadRequest('Transaction was paid before');
        }

        if (transaction.flagged) {
            throw new this.errors.BadRequest('Transaction was flagged');
        }

        const whitelist = await this.database.query.oneOrNone(this.queries.whitelist.getById, { id: transaction.whitelist_id });

        if (!whitelist) {
            throw new this.errors.NotFound('Whitelist Not Found');
        }

        const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: transaction.programme_id });

        if (!programme) {
            throw new this.errors.NotFound('Invalid Programme');
        }

        const paymentRes = await this.paymentService.requeryTransaction({ reference: transaction.reference });

        const disbursedStatus = 'paid';

        if (paymentRes.code != 1000) {
            throw new this.errors.BadRequest('Unable to pay');
        }

        //  let akupayFrom = whitelist.phone_number;
        //  if(whitelist.phone_number.indexOf('+') >= 0) {
        //    akupayFrom = whitelist.phone_number.substring(1);
        //  }

        // await this.akupayService.debitBeneficiaryAccount({ phone_number: akupayFrom , amount: transaction.amount});
        const dataPayload = {
            id: transaction.id,
            response_code: paymentRes.code || null,
            response_message: paymentRes.message || null,
            account_number: transaction.account_number,
            account_name: transaction.account_name,
            bank_name: transaction.bank_name,
            status: disbursedStatus,
            programme_name: programme.name,
            programme_id: programme.id
        };
        await this.database.query.oneOrNone(this.queries.transaction.updateDisburseFlaggedTransaction, {
            ...dataPayload
        });

        return { ...dataPayload, amount: transaction.amount };
    }

    async retry({ body: { transaction_id } }) {
        const transaction = await this.database.query.oneOrNone(this.queries.transaction.get, { id: transaction_id });

        if (!transaction) {
            throw new this.errors.NotFound('Invalid Transaction ID');
        }

        if (transaction.status === 'paid') {
            throw new this.errors.BadRequest('Transaction was paid before');
        }

        if (transaction.flagged) {
            throw new this.errors.BadRequest('Transaction was flagged');
        }

        const whitelist = await this.database.query.oneOrNone(this.queries.whitelist.getById, { id: transaction.whitelist_id });

        if (!whitelist) {
            throw new this.errors.NotFound('Whitelist Not Found');
        }

        const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: transaction.programme_id });

        if (!programme) {
            throw new this.errors.NotFound('Invalid Programme');
        }

        const paymentRes = await this.paymentService.disburseFund({
            account_number: transaction.account_number,
            bank_code: transaction.bank_code,
            account_name: transaction.account_name,
            reference: transaction.reference,
            remark: '',
            amount: transaction.amount,
            transaction_id: transaction.id,
            date: format(new Date(), 'yyyy/MM/dd')
        });

        const disbursedStatus = 'paid';
        if (paymentRes.code != 1000) {
            throw new this.errors.BadRequest('Unable to pay');
        }

        //  let akupayFrom = whitelist.phone_number;
        //  if(whitelist.phone_number.indexOf('+') >= 0) {
        //    akupayFrom = whitelist.phone_number.substring(1);
        //  }

        // await this.akupayService.debitBeneficiaryAccount({ phone_number: akupayFrom , amount: transaction.amount});
        const dataPayload = {
            id: transaction.id,
            response_code: paymentRes.code || null,
            response_message: paymentRes.message || null,
            account_number: transaction.account_number,
            account_name: transaction.account_name,
            bank_name: transaction.bank_name,
            status: disbursedStatus,
            programme_name: programme.name,
            programme_id: programme.id
        };
        await this.database.query.oneOrNone(this.queries.transaction.updateDisburseFlaggedTransaction, {
            ...dataPayload
        });

        return { ...dataPayload, amount: transaction.amount };
    }

    async approvalPay({ body: payload }) {
        const {
            transaction_id, account_name, account_number, bank_name, bank_code
        } = payload;

        const transaction = await this.database.query.oneOrNone(this.queries.transaction.getBySosTransaction, { sos_transaction_id: transaction_id });

        if (!transaction) {
            // return { message: 'Invalid Transaction ID' };
            throw new this.errors.NotFound('Invalid Transaction ID');
        }

        if (transaction.status === 'paid') {
            throw new this.errors.BadRequest('Transaction was paid before');
        }

        const whitelist = await this.database.query.oneOrNone(this.queries.whitelist.getById, { id: transaction.whitelist_id });

        if (!whitelist) {
            throw new this.errors.NotFound('Whitelist Not Found');
        }

        const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: transaction.programme_id });

        if (!programme) {
            throw new this.errors.NotFound('Invalid Programme');
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
                        account_number,
                        account_name,
                        bank_name,
                        bank_code,
                        sos_transaction_id: transaction_id
                    });

                    throw new this.errors.NotFound('Transaction has been flagged');
                }
            }
        }

        const paymentRes = await this.paymentService.disburseFund({
            account_number,
            bank_code,
            account_name,
            reference: transaction.reference,
            remark: '',
            amount: transaction.amount,
            transaction_id: transaction.id,
            date: format(new Date(), 'yyyy/MM/dd')
        });

        const disbursedStatus = 'paid';

        if (paymentRes.code != 1000) {
            throw new this.errors.BadRequest('Unable to pay');
        }

        let akupayFrom = whitelist.phone_number;
        if (whitelist.phone_number.indexOf('+') >= 0) {
            akupayFrom = whitelist.phone_number.substring(1);
        }

        //  await this.akupayService.debitBeneficiaryAccount({ phone_number: akupayFrom , amount: transaction.amount});
        const dataPayload = {
            id: transaction.id,
            response_code: paymentRes.code || null,
            response_message: paymentRes.message || null,
            account_number,
            account_name,
            bank_name,
            status: disbursedStatus,
            programme_name: programme.name,
            programme_id: programme.id
        };
        await this.database.query.oneOrNone(this.queries.transaction.updateDisburseFlaggedTransaction, {
            ...dataPayload
        });

        return { ...dataPayload, amount: transaction.amount };
    }

    async exportTransactions({ body }) {
        const { user, query } = body;
        const { band = '', programmes = '' } = query;
        const transactionSearch = query.s;
        delete query.s;

        const initialDbQuery = this.queries.transaction.all;

        const initalDbValues = {
        };

        let { dbQuery, dbValues } = await this.parseParams({ initialDbQuery, initalDbValues, query });

        if (transactionSearch && transactionSearch !== '') {
            dbQuery += this.queries.transaction.search;
            dbValues.s = `${transactionSearch}:*`;
        }

        if (band && band !== '') {
            dbQuery += this.queries.base.filterColumn('amount', band);
        }

        if (programmes && programmes !== '') {
            const filteredProgrammes = programmes.split(',');
            if (filteredProgrammes.length) {
                dbQuery += this.queries.base.whereIn('programme_id');
                dbValues.arr = filteredProgrammes;
            }
        }

        await TransactionsWorker.export({
            dbQuery,
            dbValues,
            user
        });
        return true;
    }

    async uploadBeneficiary({ body, file }) {
        const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: body.programme_id });

        if (!programme) {
            throw new this.errors.BadRequest('Invalid Programme Id');
        }

        if (!body.email) {
            throw new this.errors.BadRequest('User email is required');
        }

        body.programme = programme;

        await this.beneficiaryAccountUploadWorker.upload({
            file,
            metadata: body
        });
    }

    async exportCashout({ body }) {
        try {
            const { user, query } = body;
            const {
                period, start_date, end_date, programme_id = '', programmes = ''
            } = query;
            let sqlQuery = this.queries.transaction.getCashout;
            let sqlQuery2 = this.queries.transaction.getCashoutTotal;
            //  let dbValues = {}

            if (query.period && query.period !== 'undefined') {
                sqlQuery += this.queries.base.interval(period, 't.');
                sqlQuery2 += this.queries.base.interval(period, 't.');
            }
            if (programme_id && programme_id !== 'undefined' && programme_id !== '') {
                sqlQuery += this.queries.base.filterColumn('t.programme_id', programme_id);
                sqlQuery2 += this.queries.base.filterColumn('t.programme_id', programme_id);
            }
            if (start_date && start_date !== 'undefined') {
                sqlQuery += this.queries.transaction.attachDateRange(start_date, end_date);
                sqlQuery2 += this.queries.transaction.attachDateRange(start_date, end_date);
            }

            //  if(programmes && programmes !== '') {
            //   const filteredProgrammes = programmes.split(',');
            //   if(filteredProgrammes.length) {
            //     sqlQuery += this.queries.base.whereIn('programme_id')
            //     sqlQuery2 += this.queries.base.whereIn('programme_id')
            //     dbValues.arr = filteredProgrammes;
            //   }
            // }

            const dbQuery = sqlQuery + this.queries.transaction.group('amount') + this.queries.base.sortColumn('amount', 'ASC', 't.');

            await CashoutWorker.export({
                dbQuery,
                sqlQuery2,
                user
            });
            return true;
        } catch (error) {
            throw new this.errors.InternalServer(error);
        }
    }
    async exportRetracted({ body }) {
        try {
            const { user, query } = body;

            const {
                period, start_date, end_date, programme_id = ''
            } = query;
            let sqlQuery = this.queries.transaction.getRetracted;
            let sqlQuery2 = this.queries.transaction.getRetractedTotal;
            if (query.period && query.period !== 'undefined') {
                sqlQuery += this.queries.base.interval(period, 't.');
                sqlQuery2 += this.queries.base.interval(period, 't.');
            }
            if (programme_id && programme_id !== 'undefined' && programme_id !== '') {
                sqlQuery += this.queries.base.filterColumn('t.programme_id', programme_id);
                sqlQuery2 += this.queries.base.filterColumn('t.programme_id', programme_id);
            }
            if (start_date && start_date !== 'undefined') {
                sqlQuery += this.queries.transaction.attachDateRange(start_date, end_date);
                sqlQuery2 += this.queries.transaction.attachDateRange(start_date, end_date);
            }
            const dbQuery = sqlQuery + this.queries.transaction.group('amount') + this.queries.base.sortColumn('amount', 'ASC', 't.');

            await RetractedWorker.export({
                dbQuery,
                sqlQuery2,
                user
            });
            return true;
        } catch (error) {
            throw new this.errors.InternalServer(error);
        }
    }
}

module.exports = TransactionFactory;

