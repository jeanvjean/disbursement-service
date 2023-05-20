const ClientController = require('../controllers/ClientController');
const CreateClientValidationSchema = require('../validations/client/create')

module.exports = (router, Validator, check_errors, makeInvoker, MethodNotAllowed) => {
    const controller = makeInvoker(ClientController);

    router.get('/clients', check_errors(controller('all'))).all(MethodNotAllowed);
    router.get('/clients/:id', check_errors(controller('get'))).all(MethodNotAllowed);
    router.post('/clients', Validator.body(CreateClientValidationSchema), check_errors(controller('create'))).all(MethodNotAllowed);
    router.delete('/clients/:id', check_errors(controller('delete'))).all(MethodNotAllowed);

    return router;
};
