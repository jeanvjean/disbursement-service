/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
const { processApplicantUpload } = require('../utils/applicant');

class ApplicantFactory {
    constructor({
        config,
        errors,
        database,
        queries,
        applicantUploadWorker
    }) {
        this.config = config;
        this.errors = errors;
        this.database = database;
        this.queries = queries;
        this.applicantUploadWorker = applicantUploadWorker;
    }

    /*
    * to query database
    * await this.database.query.oneOrNone(this.queries.app.createApp, []);
    *
    */
    async uploadApplicants({ file, body }) {
        const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: body.programme_id });
        if (!programme) {
            throw new this.errors.BadRequest('Invalid Programme Id');
        }
        const messages = await this.database.query.any(this.queries.programme_sms.getMessageByProgramme, {
            programme_id: programme.id
        });
        if (messages.length < 1) {
            throw new this.errors.BadRequest('SMS has not been set for programme');
        }
        body.programme = programme;

        for (const applicant of body.applicants) {
            await processApplicantUpload(applicant, programme);
        }
        return {
            message: 'Applicant has been uploaded successfully'
        };
    }

    async addApplicant({ body }) {
        try {
            const {
                phone_number, bvn, first_name, last_name, amount, paid_at, programme_id
            } = body;
            const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: programme_id });

            if (!programme) {
                throw new this.errors.BadRequest('Invalid Programme Id');
            }

            const messages = await this.database.query.any(this.queries.programme_sms.getMessageByProgramme, {
                programme_id: programme.id
            });

            if (messages.length < 1) {
                throw new this.errors.BadRequest('SMS has not been set for programme');
            }

            const data = await processApplicantUpload({
                phone_number, bvn, first_name, last_name, amount, paid_at
            }, programme, false);

            if (data.code !== '00') {
                return data;
            }

            return 'Applicant has been saved successfully';
        } catch (err) {
            throw new this.errors.InternalServer(err);
        }
    }

    async cardReports(req) {
        try {
            const { query } = req;
            const {
                period, programme_id, start_date, end_date, programmes = ''
            } = query;

            let sqlQuery = this.queries.transaction.cardReports;
            let fundSqlQuery = this.queries.fund.cardReports;
            const dbValues = {};
            let startWhere = false;

            // sqlQuery += this.queries.base.skipSoftDeleteWhere()
            // fundSqlQuery += this.queries.base.skipSoftDeleteWhere()

            if (programmes && programmes !== '') {
                const filteredProgrammes = programmes.split(',');
                if (filteredProgrammes.length) {
                    startWhere = true;
                    sqlQuery += this.queries.base.whereInWhere('programme_id');
                    fundSqlQuery += this.queries.base.whereInWhere('programme_id');
                    dbValues.arr = filteredProgrammes;
                }
            }

            if (query.period && query.period !== '' && query.period !== 'undefined') {
                if (startWhere) {
                    sqlQuery += this.queries.transaction.intervalAnd(period);
                    fundSqlQuery += this.queries.fund.intervalAnd(period);
                } else {
                    sqlQuery += this.queries.transaction.interval(period);
                    fundSqlQuery += this.queries.fund.interval(period);
                }
            }

            if (programme_id && programme_id !== '' && programme_id !== 'undefined') {
                sqlQuery += this.queries.base.filterColumn('programme_id', programme_id);
                fundSqlQuery += this.queries.base.filterColumn('programme_id', programme_id);
            }

            if (start_date && start_date !== '' && start_date !== 'undefined') {
                sqlQuery += this.queries.base.dateRange(start_date, end_date, 't');
                fundSqlQuery += this.queries.base.dateRange(start_date, end_date, 'f');
            }
            const [ reportdata, fundData ] = await Promise.all([ await this.database.query.oneOrNone(sqlQuery, dbValues), await this.database.query.oneOrNone(fundSqlQuery, dbValues) ]);
            return { ...reportdata, ...fundData };
        } catch (error) {
            throw new this.errors.InternalServer(error);
        }
    }

    async fundCardReports(req) {
        try {
            const { query } = req;
            const {
                period, start_date, end_date, programmes = ''
            } = query;
            let sqlQuery = this.queries.fund.cardReports;
            const dbValues = {};

            if (query.period && query.period !== 'undefined') {
                sqlQuery += this.queries.fund.interval(period);
            }
            if (start_date && start_date !== 'undefined') {
                sqlQuery += this.queries.base.dateRange(start_date, end_date, 'f');
            }
            if (programmes && programmes !== '') {
                const filteredProgrammes = programmes.split(',');
                if (filteredProgrammes.length) {
                    sqlQuery += this.queries.base.whereIn('programme_id');
                    fundSqlQuery += this.queries.base.whereIn('programme_id');
                    dbValues.arr = filteredProgrammes;
                }
            }
            const data = await this.database.query.oneOrNone(sqlQuery, dbValues);
            return data;
        } catch (error) {
            throw new this.errors.InternalServer(error);
        }
    }
}

module.exports = ApplicantFactory;

