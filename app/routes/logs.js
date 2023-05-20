const LogController = require('../controllers/LogController');
const auth = require('../middlewares/auth');


module.exports = (
  router,
  Validator,
  check_errors,
  makeInvoker,
  MethodNotAllowed
) => {
  const controller = makeInvoker(LogController);

  router.get('/logs/upload-errors', auth, check_errors(controller('uploadErrors')))
    .all(MethodNotAllowed);
  router.post('/logs/upload-errors/export', auth, check_errors(controller('exportUploadErrors')))
    .all(MethodNotAllowed);

  router.get('/logs/webhook-response', auth, check_errors(controller('webhookResponse')))
    .all(MethodNotAllowed);

  router.post('/logs/webhook-response/export', auth, check_errors(controller('exportWebhookResponse')))
    .all(MethodNotAllowed);
  return router;
};
