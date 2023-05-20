module.exports = {
  boot({ config, options }) {
    const pg = require('pg-promise')(options);
    //  pass database connection string
    const database = pg(config.get('database.url'));

    return { database, pg };
  },
};
