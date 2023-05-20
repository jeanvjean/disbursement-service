const Base = require('./../base');

class ServiceUnavailable extends Base {
    constructor(message) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = 'ServiceUnavailable';
        this.message = message || 'Service Unavailable';
        this.statusCode = 503;
        this.errorCode = 503;
    }
}

module.exports = ServiceUnavailable;

