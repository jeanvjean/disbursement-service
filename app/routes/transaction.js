/* eslint-disable no-unused-vars */
const TransactionController = require('../controllers/TransactionController');
const auth = require('../middlewares/auth');
const { beneficaryUpload } = require('../utils/multer');

module.exports = (
    router,
    Validator,
    check_errors,
    makeInvoker,
    MethodNotAllowed
) => {
    const controller = makeInvoker(TransactionController);

    router.get('/transactions', check_errors(controller('all')))
        .all(MethodNotAllowed);

    router.post('/transactions/export', auth, check_errors(controller('exportTransactions')))
        .all(MethodNotAllowed);

    router.get('/transactions/disbursement', auth, check_errors(controller('getDisbursement')))
        .all(MethodNotAllowed);

    router.get('/transactions/retracted', auth, check_errors(controller('getRetracted')))
        .all(MethodNotAllowed);

    router.post('/transactions/retracted/export', auth, check_errors(controller('exportRetracted')))
        .all(MethodNotAllowed);

    router.get('/transactions/cashout', auth, check_errors(controller('getCashout')))
        .all(MethodNotAllowed);

    router.post('/transactions/cashout/export', auth, check_errors(controller('exportCashout')))
        .all(MethodNotAllowed);

    router.get('/transactions/:id', auth, check_errors(controller('get')))
        .all(MethodNotAllowed);

    router.post('/transactions/pay', auth, check_errors(controller('pay')))
        .all(MethodNotAllowed);

    router.post('/transactions/requery', auth, check_errors(controller('requery')))
        .all(MethodNotAllowed);

    router.post('/transactions/retry', auth, check_errors(controller('retry')))
        .all(MethodNotAllowed);

    router.post('/transactions/approval-pay', auth, check_errors(controller('approvalPay')))
        .all(MethodNotAllowed);

    router.post('/transactions/upload-beneficiary', auth, check_errors(controller('uploadBeneficiary')))
        .all(MethodNotAllowed);

    return router;
};
