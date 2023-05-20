exports.server = {
  app: {
    ip: process.env.APP_IP || '127.0.0.1',
    port: process.env.APP_PORT || 3000,
    domain: process.env.APP_DOMAIN || 'localhost',
    locale: process.env.APP_LOCALE || 'en',
    environment: process.env.APP_ENV || 'development',
    round_salt: 8,
    pagination_size: 20,
    frontend_uri: process.env.FRONTEND_DOMAIN,
    sos_base_uri: process.env.SOS_APP_BASE_URI,
    pay_date_interval: 30
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expires: 60 * 60 * 24
  },
};
