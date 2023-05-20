class ClientFactory {
    constructor({ config, errors, database, queries, helper }) {
        this.config = config;
        this.errors = errors;
        this.database = database;
        this.queries = queries;
        this.helper = helper;
    }
    async all({ query }) {
        try {
            const data = await this.database.query.any(this.queries.client.all);

            return data;
        } catch (err) {
            console.log({err})
            throw new this.errors.InternalServer('Something went wrong while getting clients');
        }
    }
    
    async get({ params }) {
        try {
            const data = await this.database.query.oneOrNone(this.queries.client.get, { id: params.id });
            if(!data) {
                throw new this.errors.BadRequest('Invalid Client ID');
            }
            return data;
        } catch (err) {
            throw new this.errors.InternalServer(err.message || err);
        }
    }

    async create({ body }) {
        try {
            const { public_key, secret_key } = this.helper.generateKey();
            body.public_key = public_key;
            body.secret_key = secret_key;
            body.description = body.description || '';

            const data = await this.database.query.oneOrNone(this.queries.client.saveClient, body);

            return data;
        } catch (err) {
            console.log(err)
            throw new this.errors.InternalServer(err.message || err);
        }
    }

    async delete({ params }) {
        try {
            const data = await this.database.query.oneOrNone(this.queries.client.delete, { id: params.id });

            return 'Deleted Successfully';
        } catch (err) {
            throw new this.errors.InternalServer('Something went wrong processing failed transaction');
        }
    }
}

module.exports = ClientFactory;
