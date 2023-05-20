class AppFactory {
  constructor({
    config,
    errors,
    currentClient,
  }) {
    this.config = config;
    this.errors = errors;
    this.currentClient = currentClient
  }
  getApp() {
    return { domain: this.config.get('server.app.domain') };
  }
}

module.exports = AppFactory;