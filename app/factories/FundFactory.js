const FundsWorker = require('../queues/workers/funds/export');
class FundFactory {
    constructor({ config, errors, database, queries, helper }) {
        this.config = config;
        this.errors = errors;
        this.database = database;
        this.queries = queries;
        this.helper = helper;
    }

    async create({ body }) {
        try {
            const {amount, funded_at, programme_id } = body

            const [ data, programme ] = await this.database.query.tx(t => {
                const q1 = t.oneOrNone(this.queries.fund.create, { amount, programme_id, funded_at });
                const q2 = t.oneOrNone(this.queries.programme.get, { id: programme_id });

                return t.batch([ q1, q2 ])
            });

            return { ...data, programme_name: programme.name, programme_id: programme.id };

        } catch (err) {
            console.log(err)
            throw new this.errors.InternalServer(err.message || err);
        }
    }

    async getFunding(req) {
        try {
            const { query } = req;
            const { period, start_date, end_date, programme_id } = query;
            const paginatePayload = this.helper.getLimitOffset(query);
            let sqlQuery = this.queries.fund.getFunding;
            let sqlQuery2 = this.queries.fund.getFundingTotal;

            if(query.period && query.period !== 'undefined') {
                sqlQuery = sqlQuery + this.queries.fund.interval(period);
                sqlQuery2 = sqlQuery2 + this.queries.fund.interval(period);
            }

            if(programme_id && programme_id !== 'undefined') {
                sqlQuery = sqlQuery + this.queries.base.filterColumn('p.programme_id', programme_id);
                sqlQuery2 = sqlQuery2 + this.queries.base.filterColumn('p.programme_id', programme_id);
            }

            if(start_date && start_date !== 'undefined') {
                sqlQuery = sqlQuery + this.queries.base.dateRange(start_date, end_date, 'f');
                sqlQuery2 = sqlQuery2 + this.queries.base.dateRange(start_date, end_date, 'f');
            }
            sqlQuery = sqlQuery + this.queries.base.paginate(paginatePayload);

            const [ data, total ] = await this.database.query.tx(t => {
                const q1 = t.any(sqlQuery);
                const q2 = t.oneOrNone(sqlQuery2);

                return t.batch([ q1, q2 ])
            });
            // const data = await this.database.query.any(sqlQuery)

            return { data, paginationTotal: total.over_all_count };

        } catch (err) {
            throw new this.errors.InternalServer(err.message || err);
        }
    }

    async exportFunding({body}) {
        try {
            const { user, query, params } = body;
            const { period, start_date, end_date, programme_id } = query;
            let dbQuery = this.queries.fund.getFunding;

            if(query.period && query.period !== 'undefined') {
                dbQuery = dbQuery + this.queries.fund.interval(period);
            }

            if(programme_id && programme_id !== 'undefined') {
                dbQuery = dbQuery + this.queries.base.filterColumn('p.programme_id', programme_id);
            }

            if(start_date && start_date !== 'undefined') {
                dbQuery = dbQuery + this.queries.base.dateRange(start_date, end_date, 'f');
            }
            await FundsWorker.export({
                dbQuery,
                user
            });
            return  true;  
        } catch (err) {
            throw new this.errors.InternalServer(err.message || err);
        }
    }
}

module.exports = FundFactory;
