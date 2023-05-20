const Joi = require('@hapi/joi');

const createProgrammeSchema = Joi.object().keys({
    name: Joi.string().required().min(2),
    flagging_duration: Joi.string().required(),
});

module.exports = createProgrammeSchema;
