const SmsController = require('../controllers/SmsController');
const multer = require('multer')();


module.exports = (
    router,
    Validator,
    check_errors,
    makeInvoker,
    MethodNotAllowed
) => {
    const controller = makeInvoker(SmsController);

    router.get('/sms/logs', check_errors(controller('getSmsLogs'))).all(MethodNotAllowed);

    router.post('/sms/logs/export', check_errors(controller('exportSmsLogs'))).all(MethodNotAllowed);

    router.post('/sms/webhook', check_errors(controller('africastalkingWebhook')))
        .all(MethodNotAllowed);

    router.route('/sms/webhook/sms1960')
        .post(
            multer.none(),
            check_errors(controller('sms1960Webhook'))
        )
        .all(MethodNotAllowed);

    router.route('/sms/webhook/infobip')
        .post(check_errors(controller('infobipWebhook')))
        .all(MethodNotAllowed);

    router.get('/sms/applicant-replies', check_errors(controller('getApplicantReplies')))
        .all(MethodNotAllowed);


    router.post('/sms/applicant-replies/export', check_errors(controller('getApplicantRepliesExport')))
        .all(MethodNotAllowed);

    router.post('/sms/status/webhook', check_errors(controller('africastalkingSMSWebhook')))
        .all(MethodNotAllowed);

    return router;
};
