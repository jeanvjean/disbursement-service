const config = require('./../../config');

class Response {
  constructor(domain) {
    this.domain = domain || config.get('server.app.domain');
  }

  success(path, response, status = 'success') {
    const current_url = `${this.domain}${path}`;
    // const messages = err.message || err.error.message;

    if (response.length <= 0) {
      return new Error('Error: Object (data) is required!');
    }

    const { message, data } = response;

    return {
      current_url,
      message,
      data,
      status: 'Success',
    };
  }

  error(req, res, err) {
    const current_url = `${this.domain}${req.originalUrl}`;
    const message = err.message || 'Bad Request';
    const code = err.statusCode || err.code || 400;
    if (!message) {
      return new Error('Error: Object (message) is required!');
    }

    return res.status(code).json({
      current_url,
      message,
      // name: err.name || err.error.name,
      status_code: code,
    });
  }

  validation_error(req, res, err) {
    const current_url = `${this.domain}${req.originalUrl}`;
    const message = err.message || err.error.message;
    const code = err.statusCode || 422;

    if (!message) {
      return new Error('Error: Object (message) is required!');
    }

    return res.status(422).json({
      current_url,
      message,
      name: err.name || err.error.name,
      errors: err.errors || err.error.details,
      code,
    });
  }

  pagination(path, response, status = 'success') {
    const current_url = `${this.domain}${path}`;
    // const messages = err.message || err.error.message;

    if (response.length <= 0) {
      return new Error('Error: Object (data) is required!');
    }

    let { message, data, params, query } = response;
    let paginationTotal;
    if(data.data) {
      paginationTotal = data.paginationTotal;
      data = data.data;
    }
    // let total = 10;

    let page =
      parseInt(params.page || query.page || 1) >= total
        ? total
        : parseInt(params.page || query.page || 1);
    let limit = parseInt(
      params.limit || query.limit || config.get('server.app.pagination_size')
    );

    let last_page = Math.ceil(total / limit) > 0 ? Math.ceil(total / limit) : 1;
    let next_page = page > last_page ? page : data.length ? page + 1 : 1 ;
    let previous_page = page - 1 < 0 ? 0 : data.length ? page - 1 : 1;

    if (!data.length) {
      return {
        current_url,
        message,
        data,
        meta: {
          page,
          next_page,
          limit,
          total: 0,
          last_page,
          previous_page,
        },
        status: 'Success',
      };
    }

    let total = paginationTotal;
    // let total = data.length ? parseInt(data[0].over_all_count || data[1].over_all_count ) : 0;

    if(paginationTotal) {
      total = paginationTotal
    }
    
    if (!total) {
        throw new Error(
          'Total is not present in your pagination query'
        );
    }
    
    next_page = page > last_page ? page : data.length ? page + 1 : 1 ;
    previous_page = page - 1 < 0 ? 0 : data.length ? page - 1 : 1;
    last_page = Math.ceil(total / limit) > 0 ? Math.ceil(total / limit) : 1;

    // if(data[1].over_all_count) {
    //  data = data[0]
    // }
    const meta = {
      page,
      next_page,
      limit,
      total,
      last_page,
      previous_page,
    };
    return {
      current_url,
      message,
      data,
      meta,
      status: 'Success',
    };
  }
}

module.exports = new Response();
