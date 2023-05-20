const Joi = require('@hapi/joi');

const createProgrammeSmsSchema = Joi.object().keys({
    message_key: Joi.string().required().valid('registration', 'whitelist', 'resent'),
    message_value: Joi.string().required().min(2)
});

module.exports = createProgrammeSmsSchema;
