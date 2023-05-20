module.exports = {
    boot(app, { config, routes }) {
        app.use('/api/', routes());
    }
};
