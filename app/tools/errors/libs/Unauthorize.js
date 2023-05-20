const Base = require('./../base');

class Unauthorize extends Base {
    constructor(message) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = 'UnauthorizeRequest';
        this.message = message || 'Unauthorize Request';
        this.statusCode = 422;
        this.errorCode = 422;
    }
}

module.exports = Unauthorize;

