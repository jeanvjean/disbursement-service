const CashBandController = require('../controllers/CashBandController');
const CreateCashBandValidationSchema = require('../validations/cash-band/create')

module.exports = (router, Validator, check_errors, makeInvoker, MethodNotAllowed) => {
    const controller = makeInvoker(CashBandController);

    router.get('/cash-bands', check_errors(controller('all'))).all(MethodNotAllowed);
    router.get('/cash-bands/:id', check_errors(controller('get'))).all(MethodNotAllowed);
    router.post('/cash-bands', Validator.body(CreateCashBandValidationSchema), check_errors(controller('create'))).all(MethodNotAllowed);
    router.delete('/cash-bands/:id', check_errors(controller('delete'))).all(MethodNotAllowed);

    return router;
};
