const ApplicantController = require('../controllers/ApplicantController');
const { applicantUpload } = require('../utils/multer');
const CreateApplicantSchema = require('../validations/applicant/create');
const auth = require('../middlewares/auth');
const decrypt = require('../middlewares/decrypt');

module.exports = (
    router,
    Validator,
    check_errors,
    makeInvoker,
    MethodNotAllowed
) => {
    const controller = makeInvoker(ApplicantController);

    router.post('/applicants/uploads', auth, check_errors(controller('uploadApplicants')))
        .all(MethodNotAllowed);

    router.post('/applicants/add', Validator.body(CreateApplicantSchema), check_errors(controller('addApplicant')))
        .all(MethodNotAllowed);

    router.get('/applicants/reports/cards', auth, check_errors(controller('cardReports')))
        .all(MethodNotAllowed);

    router.get('/applicants/funds/reports/cards', auth, check_errors(controller('cardReports')))
        .all(MethodNotAllowed);

    return router;
};
