const Joi = require('@hapi/joi');

const createClientSchema = Joi.object().keys({
    name: Joi.string().required().min(2),
    description: Joi.string(),
    email: Joi.string().required(),
    domain: Joi.string().required(),
    reply_mail_to: Joi.string().email().required()
});

module.exports = createClientSchema;
