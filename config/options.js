const bluebird = require('bluebird');
const config = require('../config');

// pg options
const pgOptions = {
    promiseLib: bluebird,
    noLocking: true
};

const i18nOptions = {
    locales: [ 'en', 'fr' ],
    defaultLocale: config.get('server.app.locale'),
    directory: `${__dirname}/../locales`,
    queryParameter: 'lang',
    autoReload: true
};

module.exports = { pgOptions, i18nOptions };
