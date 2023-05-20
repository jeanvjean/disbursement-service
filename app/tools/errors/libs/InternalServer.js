const Base = require('./../base');

class InternalServer extends Base {
    constructor(message) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = 'InternalServer';
        this.message = message || 'Internal Server Error';
        this.statusCode = 500;
        this.errorCode = 500;
    }
}

module.exports = InternalServer;