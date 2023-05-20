const { scopePerRequest } = require('awilix-express');
const errors = require('../app/tools/errors');
const config = require('../config');
const Helper = require('../app/utils/Helper.js');
// const ApplicantUtil = require('../app/utils/ApplicantUtil.js');
const { run1960PendingSms } = require('../app/utils/cronJob');
const ApplicantUtil = require('../app/utils/applicant');
const database = require('../app/utils/database');
const ClientHttp = require('../app/utils/Client');
const NotificationService = require('../app/services/NotificationService');
const SosService = require('../app/services/SosService');
const PaymentService = require('../app/services/PaymentService');
const AkuPayService = require('../app/services/AkuPayService');
const ApplicantUploadWorker = require('../app/queues/workers/applicants/upload');
const BeneficiaryAccountUploadWorker = require('../app/queues/workers/beneficiary/upload');
const queries = require('../app/queries');
const { asFunction } = require('awilix');
const AfricasTalkingService = require('../app/services/AfricastalkingService');
const SMS1960Service = require('../app/services/SMS1960Service');
const InfobipService = require('../app/services/InfobipService');

module.exports = {
  boot(app, { awilix }) {
    const { asValue, createContainer, asClass } = awilix;
    const container = createContainer();

    container.loadModules(
      [
        // Globs!
        'app/factories/**/*.js',
        'app/controllers/**/*.js',
        'app/repositories/**/*.js',
      ],
      {
        formatName: 'camelCase',
        registrationOptions: {
          // lifetime: awilix.Lifetime.SINGLETON
        },
      }
    );


    container.register({
      currentClient: asValue({}),
      queries: asValue(queries),
      config: asValue(config),
      errors: asValue(errors),
      helper: asClass(Helper),
      applicantUploadWorker: asClass(ApplicantUploadWorker),
      beneficiaryAccountUploadWorker: asClass(BeneficiaryAccountUploadWorker),
      database: asValue(database),
      sms1960Service: asClass(SMS1960Service, {
        injector: () => ({ config, errors })
      }).singleton(),
      africasTalkingService: asClass(AfricasTalkingService, {
        injector: () => ({ config, errors })
      }).singleton(),
      notificationService: asClass(NotificationService, {
          injector: () => ({ config, errors, database })
      }),
      akupayService: asClass(AkuPayService, {
          injector: () => ({ config, errors })
      }).singleton(),
      paymentService: asClass(PaymentService, {
          injector: () => ({ config, errors })
      }).singleton(),
      sosService: asClass(SosService, {
          injector: () => ({ config, errors })
      }).singleton(),
      infobipService: asClass(InfobipService, {
          injector: () => ({ config, errors })
      }).singleton(),
      sms1960cron: asValue(run1960PendingSms),

    });

    app.use(scopePerRequest(container));

    const sms1960cronWorkers = container.resolve('sms1960cron');
    sms1960cronWorkers();
    // container.register({
    //   currentClient: asValue({}),
    // });

    app.use((req, res, next) => {
      const client = req.client || {};
      const user = req.user || {};
      // req.container.register({
      //   currentClient: asValue(client),
      // });

      // req.container.register({
      //   currentUser: asValue(user),
      // });

      return next();
    });

    return container;
  },
};
