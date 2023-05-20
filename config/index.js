const convict = require('convict');

const config = convict({
    env: {
        format: [ 'production', 'development' ],
        default: 'development',
        env: 'APP_ENV'
    }
});

config.load(require('./server'));
config.load(require('./database'));
config.load(require('./rabbitmq'));
config.load(require('./notification'));
config.load(require('./payment'));
config.load(require('./credentials'));
config.load(require('./bucket'));
config.load(require('./akupay'));
config.load(require('./africastalking'));
config.load(require('./gaps'));
config.load(require('./sms1960'));
config.load(require('./infobip'));


module.exports = config;
