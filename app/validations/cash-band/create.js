const Joi = require('@hapi/joi');

const createCashBandSchema = Joi.object().keys({
    amount: Joi.number().integer().min(0),
    programme_id: Joi.string().required()
});

module.exports = createCashBandSchema;
