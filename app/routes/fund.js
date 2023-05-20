const FundController = require('../controllers/FundController');
const CreateFundSchema = require('../validations/fund/create');
const auth = require('../middlewares/auth');


module.exports = (
  router,
  Validator,
  check_errors,
  makeInvoker,
  MethodNotAllowed
) => {
  const controller = makeInvoker(FundController);

  router.post('/funds', auth,Validator.body(CreateFundSchema), check_errors(controller('create')))
    .all(MethodNotAllowed);
  router.get('/funds', auth, check_errors(controller('getFunding')))
    .all(MethodNotAllowed);

  router.post('/funds/export', auth, check_errors(controller('exportFunding')))
  .all(MethodNotAllowed);

  return router;
};
