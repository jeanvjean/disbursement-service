const RouteProvider = require('./route');
const DatabaseProvider = require('./database.js');
const LocaleProvider = require('./locale');
const ErrorsProvider = require('./errors');
const ContainerProvider = require('./container');

module.exports = {
    get routes() {
        return RouteProvider;
    },

    get database() {
        return DatabaseProvider;
    },

    get locale() {
        return LocaleProvider;
    },

    get errors() {
        return ErrorsProvider;
    },

    get container() {
        return ContainerProvider;
    }
};
