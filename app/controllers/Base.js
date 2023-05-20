const ResponseTransformer = require('../utils/ResponseTransformer');
const database = require('../utils/database');
const queries = require('../queries');

class BaseController {
  static async success(data, req, res, message = 'Success') {
    await this.saveAuditLogs(req, res, message);
    res
      .status(200)
      .json(ResponseTransformer.success(req.originalUrl, { message, data }));
  }

  static async pagination(data, req, res, message = 'Success') {
    await this.saveAuditLogs(req, res, message);
    res.status(200).json(
      ResponseTransformer.pagination(req.originalUrl, {
        message,
        data,
        params: req.params,
        query: req.query,
      })
    );
  }

  static async handleError(error, req, res) {
    const status = error.error_code || 500;
    let message = '';
    if (!error.error_message) {
      message =
        'A service error has occured and is being worked upon. Please try again later.';
    } else {
      message = error.error_message;
    }
    await this.saveAuditLogs(req, res, message);
    error.message = message;
    return res.status(status).json(ResponseTransformer.error(req, res, error));
  }

  static async saveAuditLogs(req, res, message) {
    let clientIp =
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.clientIp;

    if (clientIp.substr(0, 7) == '::ffff:') {
      clientIp = req.ip.substr(7);
    }

    const data = {
      clientIp,
      req_method: req.method || '',
      host: req.hostname || '',
      path: req.originalUrl || '',
      statusCode: res.statusCode || '',
      client_agent: req?.useragent?.browser || '',
      response_message: message || '',
      user_id: req.user ? req.user.id : '',
      user_email: req.user ? req.user.email : '',
      user_type: req.user ? req.user.user_type : '',
      referer:
        req.header('Referer') ||
        req.headers.referrer ||
        req.headers.referer ||
        '',
      content_type: req.headers['content-type']
        ? req.headers['content-type']
        : '',
      content_encoding: req.headers['accept-encoding']
        ? req.headers['accept-encoding']
        : '',
      user_agent: req.headers['user-agent'] ? req.headers['user-agent'] : 'N/A',
      user_name: req.user
        ? `${req.user.first_name} ${req.user.last_name}`
        : 'Guest',
    };

    try {
      // return await database.query.oneOrNone(queries.app.createAuditLog, data);
    } catch (err) {
      console.log(err, '--->>>errr');
    }
  }
}

module.exports = BaseController;
