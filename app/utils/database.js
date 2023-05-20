const config = require('../../config');

const dbOptions = {
  connect(client, dc, useCount) {
    const cp = client.connectionParameters;
    console.log('Database connected successfully');
  },

  error(err, e) {
    console.log(`Error ${JSON.stringify(err)} on connecting to database`)
  },

  disconnect(client, dc) {
      const cp = client.connectionParameters;
      console.log('Disconnecting from database:', cp.database);
  }
};

const { database, pg } = require('../../providers/database').boot({
  config,
  options: dbOptions,
});

const dynamicUpdateById = (table, payload, id, fillable = null) =>
  new Promise(async (resolve, reject) => {
    try {
      const condition = pg.as.format(` WHERE id = '${id}'`, payload);
      payload.updated_at = new Date();
      const updateQuery =
        pg.helpers.update(payload, fillable, table) + condition;

      resolve(updateQuery);
    } catch (err) {
      reject(err);
    }
  });

const dynamicUpdate = (table, whereCol, payload, id, fillable = null) =>
  new Promise(async (resolve, reject) => {
    try {
      const condition = pg.as.format(` WHERE ${whereCol} = '${id}'`, payload);
      payload.updated_at = new Date();
      const updateQuery =
        pg.helpers.update(payload, fillable, table) + condition;

      resolve(updateQuery);
    } catch (err) {
      reject(err);
    }
});

const paginationData = (query) => {
  const {
    page = 1,
    limit = query.limit || config.get('server.app.pagination_size'),
  } = query;

  const offset = parseInt(page * limit - limit);

  return {
    limit: parseInt(limit),
    offset,
  };
};

module.exports = {
  query: database,
  dynamicUpdateById,
  dynamicUpdate,
  paginationData,
};
