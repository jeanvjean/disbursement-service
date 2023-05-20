class ProgrammeFactory {
    constructor({ config, errors, database, queries, helper }) {
        this.config = config;
        this.errors = errors;
        this.database = database;
        this.queries = queries;
        this.helper = helper;
    }
    async all({ query }) {
        const data = await this.database.query.any(this.queries.programme.all);

        return data;
    }

    async allProgrammes({ query }) {
        const data = await this.database.query.any(this.queries.programme.allProgrammes);

        return data;
    }
    
    async get({ params }) {

        const data = await this.database.query.oneOrNone(this.queries.programme.get, { id: params.id });
        if(!data) {
            throw new this.errors.BadRequest('Invalid Programme ID');
        }
        return data;
        
    }

    async create({ body }) {
        const { name, flagging_duration } = body;
        const data = await this.database.query.oneOrNone(this.queries.programme.save, { name, flagging_duration });

        return data;
    }

    async delete({ params }) {
        const data = await this.database.query.oneOrNone(this.queries.programme.delete, { id: params.id });

        return 'Deleted Successfully';
    }

    async createMessage(req) {
        const {body, params} = req;
        const { message_key, message_value} = body;
        const data = await this.database.query.oneOrNone(this.queries.programme_sms.save, { programme_id: params.id, message_key, message_value });
        return data;
    }

    async deleteMessage({ params }) {
        await this.database.query.oneOrNone(this.queries.programme_sms.delete, { id: params.id });

        return 'Deleted Successfully';
    }

    async getMessage({ params }) {
        const data = await this.database.query.oneOrNone(this.queries.programme_sms.get, { id: params.id });

        return data;
    }

    async updateMessage({ params, body }) {
        let dbQuery = this.queries.programme_sms.update;
        let dbValues = { id: params.id, message_value: body.message_value };
        const programmeSms = await this.database.query.oneOrNone(this.queries.programme_sms.getMessage, { programme_id: body.programme_id, message_key: body.message_key });

        if(!programmeSms) {
            const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: body.programme_id });
            if(!programme) {
                throw new this.errors.BadRequest('Invalid Programme ID');
            }

            dbQuery = this.queries.programme_sms.save;
            dbValues = { programme_id: body.programme_id, message_key: body.message_key, message_value: body.message_value };
        }

        const data =  await this.database.query.oneOrNone(dbQuery, dbValues);

        return data;
    }

    async allMessage() {
        const data = await this.database.query.any(this.queries.programme_sms.all);

        return data;
    }
    
    async getProgrammeMessage({params, query}) {
        let data;
        if (query.message_key && query.message_key !== 'undefined') {
            data = await this.database.query.oneOrNone(this.queries.programme_sms.getMessage, { programme_id: params.id, message_key: query.message_key});

            if(!data) {
                throw new this.errors.BadRequest('No Message for the selected programme criteria');
            }
        } else {
            data = await this.database.query.any(this.queries.programme_sms.getMessageByProgramme, { programme_id: params.id});
        }

        return data;
    }

    async updateProgrammme({ params, body }) {
        const programme = await this.database.query.oneOrNone(this.queries.programme.get, { id: params.id });
        if(!programme) {
            throw new this.errors.BadRequest('Invalid Programme ID');
        }

        const flagging_duration = Number.isInteger(parseInt(body.flagging_duration));

        if(!flagging_duration) {
            throw new this.errors.BadRequest('Flagging duration is expected to be a number');
        }

        const data =  await this.database.query.oneOrNone(this.queries.programme.update, { 
            id: params.id, 
            name: body.name || programme.name, 
            flagging_duration: body.flagging_duration || programme.flagging_duration 
        });
 
        return data;
     }
}

module.exports = ProgrammeFactory;
