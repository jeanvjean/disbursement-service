class CashBandFactory {
    constructor({ config, errors, database, queries, helper }) {
        this.config = config;
        this.errors = errors;
        this.database = database;
        this.queries = queries;
        this.helper = helper;
    }
    async all({ query }) {
        const { programmes = '' } = query
        let dbQuery = this.queries.band.all;
        let dbValues = {};

        if(programmes && programmes !== '') {
            const filteredProgrammes = programmes.split(',');
            if(filteredProgrammes.length) {
                dbQuery += this.queries.base.whereIn('programme_id')
                dbQuery2 += this.queries.base.whereIn('programme_id')
                dbValues.arr = filteredProgrammes;
            }
        }

        dbQuery += this.queries.base.groupBy('amount');
        const data = await this.database.query.any(dbQuery, dbValues);

        return data;
    }
    
    async get({ params }) {
        try {
            
        } catch (err) {
            throw new this.errors.InternalServer(err.message || err);
        }
    }

    async create({ body }) {
        try {
            const { amount, programme_id } = body

            const validateAmountExists = await this.database.query.oneOrNone(this.queries.band.fetchBandByAmount, { amount, programme_id });

            if(validateAmountExists) {
                throw new this.errors.BadRequest('Amount Range already exists');
            }
            
            await this.database.query.oneOrNone(this.queries.band.create, { amount, programme_id });

            return 'Cash Band has been added';
        } catch (err) {
            console.log(err)
            throw new this.errors.InternalServer(err.message || err);
        }
    }

    async delete({ params }) {
        try {
            
        } catch (err) {
            throw new this.errors.InternalServer(err.message || err);
        }
    }
}

module.exports = CashBandFactory;
