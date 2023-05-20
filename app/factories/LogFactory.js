const WebHookLogsWorker = require('../queues/workers/webHookLogs/export');
const UploadErrorWorker = require('../queues/workers/uploadError/export');

class LogFactory {
    constructor({ config, errors, database, queries, helper }) {
        this.config = config;
        this.errors = errors;
        this.database = database;
        this.queries = queries;
        this.helper = helper;
    }

    async uploadErrors({ query }) {
        try {
            const { period, start_date, end_date, s = '' } = query;
            const paginatePayload = this.helper.getLimitOffset(query);
            let sqlQuery = this.queries.log.getAllUploadErrors;
            let sqlQuery2 = this.queries.log.getAllUploadErrorsTotal;
            sqlQuery = sqlQuery + this.queries.base.skipSoftDeleteWhere('ue.');
            sqlQuery2 = sqlQuery2 + this.queries.base.skipSoftDeleteWhere('ue.');
            
            if(start_date && start_date !== 'undefined' && start_date !== '') {
                sqlQuery = sqlQuery + this.queries.base.dateRangeAnd(start_date, end_date, 'ue');
                sqlQuery2 = sqlQuery2 + this.queries.base.dateRangeAnd(start_date, end_date, 'ue');
            }
            
            if(period && period !== 'undefined' && period !== '') {
                sqlQuery = sqlQuery + this.queries.base.interval(period, 'ue.');
                sqlQuery2 = sqlQuery2 + this.queries.base.interval(period, 'ue.');
            }

            if(s && s !== 'undefined' && s !== '') {
                sqlQuery = sqlQuery + this.queries.base.search('phone_number', s);
                sqlQuery2 = sqlQuery2 + this.queries.base.search('phone_number', s);
            }

            sqlQuery = sqlQuery + this.queries.base.sortColumn('ue.created_at', 'DESC')

            sqlQuery = sqlQuery + this.queries.base.paginate(paginatePayload);

            const [ data, total ] = await this.database.query.tx(t => {
                const q1 = t.any(sqlQuery);
                const q2 = t.oneOrNone(sqlQuery2);

                return t.batch([ q1, q2 ])
            });

            return { data, paginationTotal: total.over_all_count };

            // const data = await this.database.query.any(sqlQuery)
            // return data;
        } catch (err) {
            console.log(err)
            throw new this.errors.InternalServer(err.message || err);
        }
    }

    async webhookResponse({ query }) {
        try {
            const { period, start_date, end_date, s = '' } = query;

            const paginatePayload = this.helper.getLimitOffset(query);
            let sqlQuery = this.queries.log.getAllWebhookResponse;
            let sqlQuery2 = this.queries.log.getAllWebhookResponseTotal;

            sqlQuery = sqlQuery + this.queries.base.skipSoftDeleteWhere('wr.');
            sqlQuery2 = sqlQuery2 + this.queries.base.skipSoftDeleteWhere('wr.');
            
            if(start_date && start_date !== 'undefined' && start_date !== '') {
                sqlQuery = sqlQuery + this.queries.base.dateRangeAnd(start_date, end_date, 'wr');
                sqlQuery2 = sqlQuery2 + this.queries.base.dateRangeAnd(start_date, end_date, 'wr');
            }
            if(s && s !== 'undefined' && s !== '') {
                sqlQuery = sqlQuery + this.queries.base.search('phone_number', s);
                sqlQuery2 = sqlQuery2 + this.queries.base.search('phone_number', s);
            }
            if(period && period !== 'undefined' && period !== '') {
                sqlQuery = sqlQuery + this.queries.base.interval(period, 'wr.');
                sqlQuery2 = sqlQuery2 + this.queries.base.interval(period, 'wr.');
            }

            sqlQuery = sqlQuery + this.queries.base.sortColumn('created_at', 'DESC')

            sqlQuery = sqlQuery + this.queries.base.paginate(paginatePayload);

            const [ data, total ] = await this.database.query.tx(t => {
                const q1 = t.any(sqlQuery);
                const q2 = t.oneOrNone(sqlQuery2);

                return t.batch([ q1, q2 ])
            });
            
            return { data, paginationTotal: total.over_all_count };

            // const data = await this.database.query.any(sqlQuery)
            // return data;
        } catch (err) {
            console.log(err)
            throw new this.errors.InternalServer(err.message || err);
        }
    }

    async exportWebhookResponse({ body }) {
        try {
            const  {user, query} = body
            const { period, start_date, end_date, s = '' } = query;

            let sqlQuery = this.queries.log.getAllWebhookResponse;

            sqlQuery = sqlQuery + this.queries.base.skipSoftDeleteWhere('wr.');
            
            if(start_date && start_date !== 'undefined' && start_date !== '') {
                sqlQuery = sqlQuery + this.queries.base.dateRangeAnd(start_date, end_date, 'wr');
            }
            if(s && s !== 'undefined' && s !== '') {
                sqlQuery = sqlQuery + this.queries.base.search('phone_number', s);
            }
            if(period && period !== 'undefined' && period !== '') {
                sqlQuery = sqlQuery + this.queries.base.interval(period, 'wr.');
            }

            const dbQuery = sqlQuery + this.queries.base.sortColumn('created_at', 'DESC')

    
            await WebHookLogsWorker.export({
                dbQuery,
                user
            });
            return true;
        } catch (err) {
            console.log(err)
            throw new this.errors.InternalServer(err.message || err);
        }
    }
    async exportUploadErrors({ body }) {
        try {
            const  {user, query} = body
            const { period, start_date, end_date, s = '' } = query;

            let sqlQuery = this.queries.log.getAllUploadErrors;
            sqlQuery = sqlQuery + this.queries.base.skipSoftDeleteWhere('ue.');
            
            if(start_date && start_date !== 'undefined' && start_date !== '') {
                sqlQuery = sqlQuery + this.queries.base.dateRangeAnd(start_date, end_date, 'ue');
            }
            
            if(period && period !== 'undefined' && period !== '') {
                sqlQuery = sqlQuery + this.queries.base.interval(period, 'ue.');
            }

            if(s && s !== 'undefined' && s !== '') {
                sqlQuery = sqlQuery + this.queries.base.search('phone_number', s);
            }

            const dbQuery = sqlQuery + this.queries.base.sortColumn('created_at', 'DESC');

            await UploadErrorWorker.export({
                dbQuery,
                user
            });

            return true;
        } catch (err) {
            console.log(err)
            throw new this.errors.InternalServer(err.message || err);
        }
    }

}

module.exports = LogFactory;
