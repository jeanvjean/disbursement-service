const Joi = require('@hapi/joi');

const createFundSchema = Joi.object().keys({
    amount: Joi.string().required().min(2),
    programme_id: Joi.string().required(),
    funded_at: Joi.string(),
});

module.exports = createFundSchema;
