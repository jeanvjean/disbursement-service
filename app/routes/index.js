import expressJoi from 'express-joi-validation';
import AppRoute from './app';
import ApplicantRoute from './applicant';
import SMSRoute from './sms';
import TransactionRoute from './transaction';
import ClientRoute from './client';
import FundRoute from './fund';
import CashBandRoute from './cash-band';
import LogRoute from './logs';
import ProgrammeRoute from './programme';

import checkErrors from '../middlewares/check_errors';
import { MethodNotAllowed } from '../tools/errors';

const { makeInvoker } = require('awilix-express');

const express = require('express');

const Validator = expressJoi.createValidator({
  passError: true,
});

module.exports = () => {
  const router = express.Router();

  const routers = [].concat([
    AppRoute,
    ApplicantRoute,
    SMSRoute,
    TransactionRoute,
    ClientRoute,
    FundRoute,
    CashBandRoute,
    LogRoute,
    ProgrammeRoute
  ]);

  for (let i = 0; i <= routers.length - 1; i++) {
    routers[i](router, Validator, checkErrors, makeInvoker, MethodNotAllowed);
  }

  return router;
};
