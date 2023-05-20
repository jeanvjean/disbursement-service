const BaseQueries = require('./base');
const AppQueries = require('./app');
const ApplicantQueries = require('./applicant');
const WhitelistQueries = require('./whitelist');
const TransactionQueries = require('./transaction');
const AdminVerifyQueries = require('./adminVerify');
const ClientQueries = require('./client');
const FundQueries = require('./funds');
const BandQueries = require('./band');
const LogQueries = require('./log');
const ProgrammeQueries = require('./programme');
const ProgrammeSmsQueries = require('./programme_sms');
const ApplicantReply = require('./applicant_reply');
const ApplicantSmsQueries = require('./applicant_sms')

module.exports = {
  get base() {
    return BaseQueries;
  },
  get app() {
    return AppQueries;
  },
  get applicant() {
    return ApplicantQueries;
  },
  get whitelist() {
    return WhitelistQueries;
  },
  get transaction() {
    return TransactionQueries;
  },
  get adminVerify() {
    return AdminVerifyQueries;
  },
  get client() {
    return ClientQueries;
  },
  get fund() {
    return FundQueries;
  },
  get band() {
    return BandQueries;
  },
  get log() {
    return LogQueries;
  },
  get programme() {
    return ProgrammeQueries;
  },
  get programme_sms() {
    return ProgrammeSmsQueries;
  },
  get applicant_reply() {
    return ApplicantReply;
  },
  get applicant_sms(){
    return ApplicantSmsQueries;
  }
};
