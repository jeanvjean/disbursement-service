const Joi = require('@hapi/joi');

const CreateApplicentSchema = Joi.object().keys({
    amount: Joi.number().required(),
    phone_number: Joi.string().required(),
    programme_id: Joi.string().required(),
    last_name: Joi.string().min(3).required(),
    first_name: Joi.string().min(3).required(),
    bank_account_number: Joi.string().allow(''),
    bank_name: Joi.string().allow(''),
    bank_name: Joi.string().allow(''),
    state_of_residence: Joi.string().allow(''),
    lga_of_residence: Joi.string().allow(''),
    state: Joi.string().allow(''),
    lga: Joi.string().allow(''),
    bank_name: Joi.string().allow(''),
    bvn: Joi.string().allow(''),
    paid_at: Joi.string().min(3).allow(null),
});

module.exports = CreateApplicentSchema;
