const ProgrammeController = require('../controllers/ProgrammeController');
const CreateProgrammeValidationSchema = require('../validations/programme/create')
const createProgrammeSmsSchema = require('../validations/programme/createMessage');

module.exports = (router, Validator, check_errors, makeInvoker, MethodNotAllowed) => {
    const controller = makeInvoker(ProgrammeController);

    router.get('/programmes', check_errors(controller('all'))).all(MethodNotAllowed);
    router.get('/programmes/all', check_errors(controller('allProgrammes'))).all(MethodNotAllowed);
    router.get('/programmes/:id', check_errors(controller('get'))).all(MethodNotAllowed);
    router.put('/programmes/:id', check_errors(controller('updateProgrammme'))).all(MethodNotAllowed);
    router.post('/programmes', Validator.body(CreateProgrammeValidationSchema), check_errors(controller('create'))).all(MethodNotAllowed);
    router.delete('/programmes/:id', check_errors(controller('delete'))).all(MethodNotAllowed);
    router.post('/programmes/:id/sms', Validator.body(createProgrammeSmsSchema),check_errors(controller('createMessage'))).all(MethodNotAllowed);
    router.get('/programmes/sms/:id', check_errors(controller('getMessage'))).all(MethodNotAllowed);
    router.put('/programmes/sms/:id', check_errors(controller('updateMessage'))).all(MethodNotAllowed);
    router.delete('/programmes/sms/:id', check_errors(controller('deleteMessage'))).all(MethodNotAllowed);
    router.get('/programmes/sms', check_errors(controller('allMessage'))).all(MethodNotAllowed);
    router.get('/programmes/:id/sms',check_errors(controller('getProgrammeMessage'))).all(MethodNotAllowed);

    return router;
};
