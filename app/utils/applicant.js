/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable radix */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
const { inject } = require('awilix-express');
const path = require('path');
const FileStreamParser = require('./CSVFileParser');
const { ACCEPTED_DELIVERY_STATUS, SMS_SUCCESS_STATUS, SMS_FAILED_STATUS } = require('../constants');
const fastcsv = require('fast-csv');
const { differenceInDays, isToday, format } = require('date-fns');
const config = require('../../config');
const { s3 } = require('./multer');
const through2 = require('through2');
const database = require('../utils/database');
const queries = require('../queries');
const errors = require('../tools/errors');
const HelperUtil = require('../utils/Helper');
const AkupayService = require('../services/AkuPayService');
const SosService = require('../services/SosService');
const NotificationService = require('../services/NotificationService');
const smsMessage = require('../messages');
const { ERROR_CODE, SUCCESS_CODE } = require('../constants');
const ApplicantPaymentWorkers = require('../queues/workers/applicants/payment');
const AccountUploadMailWorkers = require('../queues/workers/beneficiary/upload');
const PaymentService = require('../services/PaymentService');
const AfricasTalkingService = require('../services/AfricastalkingService');
const SMS1960Service = require('../services/SMS1960Service');
const InfobipService = require('../services/InfobipService');

const akupayService = new AkupayService({ config, errors });
const africasTalkingService = new AfricasTalkingService({
    config, errors, database, queries
});
const sms1960Service = new SMS1960Service({
    config, database, queries, errors, HelperUtil
});
const infobipService = new InfobipService({
    config, errors, database, queries
});
const sosService = new SosService({ config });
export const notificationService = new NotificationService({
    config, errors, africasTalkingService, sms1960Service, infobipService
});
const helper = new HelperUtil({
    config, errors, database, queries, notificationService, akupayService
});
const paymentService = new PaymentService({ config, errors, helper });

const saveRowToDatabase = async(payload, programme_id) => {
    try {
        await database.query.oneOrNone(queries.applicant.create, {
            phone_number: payload.phone_number,
            amount: payload.amount,
            first_name: payload.first_name,
            last_name: payload.last_name,
            state: payload.state,
            lga: payload.lga,
            state_of_residence: payload.state_of_residence,
            lga_of_residence: payload.lga_of_residence,
            bank_name: payload.bank_name,
            bank_account_number: payload.bank_account_number,
            programme_id
        });

        return 'done';
    } catch (err) {
        throw new Error(err);
    }
};

const saveUploadApplicantError = async(phone_number, message, programme_id) => {
    try {
        await helper.saveUploadError({ phone_number, error_message: message, programme_id });

        return true;
    } catch (err) {
        console.log({ err });
    }
};

const validateApplicantCashBand = async(amount, programme_id) => {
    try {
        const availableAmount = await database.query.oneOrNone(queries.band.fetchBandByAmount, { amount, programme_id });

        return !!availableAmount;
    } catch (err) {
        throw new Error(err.message || err);
    }
};

const processApplicantUpload = async(row, programme, isQueue = true) => {
    try {
        const processedPhoneNumber = [];

        const message = await helper.getSmsMessage(programme.id, programme.name, 'whitelist', '-programme_name-', '-name_key-', '-amount-', row.first_name, row.amount);
        row.phone_number = helper.convertPhoneNumberToInternationalFormat(row.phone_number);
        if (processedPhoneNumber.includes(row.phone_number)) {
            await saveUploadApplicantError(row.phone_number, `${row.phone_number} has been proccessed before`, programme.id);
            return {
                message: `${row.phone_number} has been proccessed before`,
                code: '01'
            };
        }
        const applicant = await saveRowToDatabase(row, programme.id);
        if (!applicant) {
            await saveUploadApplicantError(row.phone_number, 'Unable to add applicant', programme.id);
            return {
                message: 'Unable to add applicant',
                code: '02'
            };
        }

        const checkAmountBand = await validateApplicantCashBand(row.amount, programme.id);
        if (!checkAmountBand) {
            await saveUploadApplicantError(row.phone_number, `Amount not valid in cash band for ${programme.name} programme`, programme.id);
            return {
                message: `Amount not valid in cash band for ${programme.name} programme`,
                code: '03'
            };
        }

        let whitelist = await helper.checkIfWhitelistExists({ phone_number: row.phone_number });

        if (!whitelist) {
            const akupayResponse = await helper.createAkupayAccount({ row, programme_id: programme.id });

            if (!akupayResponse) {
                await saveUploadApplicantError(row.phone_number, 'Unable to create account on akupay', programme.id);
                return {
                    message: 'Unable to create account on akupay',
                    code: '04'
                };
            }

            whitelist = await helper.createWhiteList({
                phone_number: row.phone_number,
                bvn: row.bvn,
                first_name: row.first_name,
                last_name: row.last_name
            });
        }

        const transaction = await helper.addWhiteListTransaction({
            amount: row.amount,
            whitelist_id: whitelist.id,
            paid_at: row.paid_at,
            programme_id: programme.id
        });

        const creditResponse = await akupayService.creditBeneficiaryAccount({
            phone_number: row.phone_number.substring(1),
            amount: row.amount
        });

        if (!creditResponse) {
            await saveUploadApplicantError(row.phone_number, 'Unable to credit account on akupay', programme.id);
            return {
                message: 'Unable to credit account on akupay',
                code: '05'
            };
        }

        await database.query.oneOrNone(queries.transaction.updateStatusToDisbursed, {
            id: transaction.id
        });

        await notificationService.sendSms({ to: row.phone_number, message });

        processedPhoneNumber.push(row.phone_number);

        return {
            message: 'success',
            code: '00'
        };
    } catch (err) {
        if (isQueue) {
            return {
                code: '01',
                message: err
            };
        }

        throw new Error(err);
    }
};

const uploadApplicant = ({ file, metadata }) => new Promise(async(resolve, reject) => {
    try {
        const basePath = '../../storage/applicants';

        const successFailedPath = path.resolve(__dirname, `${basePath}/success`);
        const failedFilePath = path.resolve(__dirname, `${basePath}/error`);

        const successHeader = [ 'phone_number' ];
        const errorHeader = [ 'phone_number', 'errors' ];

        const successFileParser = await new FileStreamParser(
            null,
            successFailedPath
        );
        const errorFileParser = await new FileStreamParser(
            null,
            failedFilePath
        );

        await successFileParser.setHeader(successHeader);
        await errorFileParser.setHeader(errorHeader);

        const params = {
            Bucket: metadata.bucket,
            Key: metadata.key
        };

        s3.getObject(params)
            .createReadStream()
            .pipe(fastcsv.parse({ headers: true }))
            .on('error', error => {
                console.log('error');
            })
            .on('data-invalid', async(row) => {
                console.log('invalid data');
            })
            .pipe(through2({ objectMode: true }, async(row, enc, cb) => {
                try {
                    const beneficiary = await processApplicantUpload(row, metadata.programme);

                    if (beneficiary.code === 0) {
                        successFileParser.writeStream(row);
                    } else {
                        row.errors = beneficiary.message;
                        errorFileParser.writeStream(row);
                    }
                    delete row.errors;
                    cb(null, row);
                } catch (processError) {
                    console.log({ processError });
                    cb(null, row);
                }
            }))
            .on('data', (row) => {
            })
            .on('end', async rowCount => {
                successFileParser.end();
                errorFileParser.end();

                const successBucketUrl = await successFileParser.getSpaceUploadPath('beneficiary/success');
                const errorBucketUrl = await errorFileParser.getSpaceUploadPath('beneficiary/error');

                await sosService.notifySosUploadResponse({ successBucketUrl, errorBucketUrl, metadata });

                return resolve({ successBucketUrl, errorBucketUrl, metadata });
            });
    } catch (error) {
        return reject(new errors.InternalServer(error));
    }
});

const getAplicantsForPayment = async() => {
    try {
        const applicant = await database.query.manyOrNone(queries.transaction.getAplicantsForPayment, {
            time: Date.now()
        });
        return applicant;
    } catch (error) {
        throw new Error(err);
    }
};


const createAkuPay = async payload => akupayService.createAccount(payload);

const processPayment = async(payload) => {
    try {
        if (payload.length) {
            payload.map(async(applicant) => {
                await database.query.one(queries.transaction.updateProcessTransaction, {
                    id: applicant.id
                });
                ApplicantPaymentWorkers.payment(applicant);
            });
        }
        return 'done';
    } catch (error) {
        throw new Error(err);
    }
};

const payApplicant = async payload => paymentService.disburseFund(payload);

const getretractApplicant = async() => {
    try {
        const applicant = await database.query.any(queries.transaction.getRetract);
        return applicant;
    } catch (error) {
        throw new Error(err);
    }
};

const processRetract = async payload => {
    try {
        payload.map(async applicant => {
            await database.query.one(queries.transaction.updateRetractTransaction, {
                id: applicant.id
            });
        });
    } catch (error) {
        throw new Error(err);
    }
};

const getPendingSmsBySource = async(source) => {
    try {
        const pendingSms = await database.query.any(queries.applicant_sms.getPendingSmsBySource, {
            source
        });
        return pendingSms;
    } catch (error) {
        throw error;
    }
};

const process1960SmsStatus = async messages => {
    try {
        messages.map(async pendingSms => {
            const response = await sms1960Service.checkSMSDelivery(pendingSms.message_id);
            let status = response;

            if (ACCEPTED_DELIVERY_STATUS.includes(response.toUpperCase())) {
                status = SMS_SUCCESS_STATUS;
            }

            await helper.updateApplicantSmsStatus(pendingSms.message_id, status);
        });
    } catch (error) {
        throw new Error(err);
    }
};

const processAccountUploadedFile = async({ row, programme }) => {
    try {
        row.phone_number = helper.convertPhoneNumberToInternationalFormat(row.phone_number);

        const result = await sosService.resolveAccountDetails({
            phone_number: row.phone_number,
            message_content: 'N/A',
            account_number: row.account_number,
            bank_name: row.bank_name,
            account_name: ''
        });

        if (!result.success) {
            // await this.notificationService.sendSms({ to: from, message: messages.whitelistedMessage(programme.name) });
            // await this.database.query.oneOrNone(queries.transaction.updateSosTransactionId, {
            //     id: transaction.id,
            //     sos_transaction_id: result.id
            // });

            await sosService.updateSosProgrammeTransaction({
                id: result.id,
                programme_id: programme.id
            });

            return {
                message: 'Account unable to be resolved, SMS Resent',
                code: ERROR_CODE.ACCOUNT_RESOLVE_ERROR
            };
        }

        const checkAmountBand = await validateApplicantCashBand(row.amount, programme.id);

        if (!checkAmountBand) {
            return {
                message: `Amount not valid in cash band for ${programme.name} programme`,
                code: ERROR_CODE.INVALID_AMOUNT_CASHBBAND
            };
        }

        const whitelist = await database.query.oneOrNone(queries.whitelist.get, { phone_number: row.phone_number });

        if (!whitelist) {
            return {
                message: `${row.phone_number} has not been whitelisted`,
                code: ERROR_CODE.INVALID_WHITELIST
            };
        }

        const transaction = await database.query.oneOrNone(queries.transaction.getLastUnpaidByPhoneNumberAndStatus, {
            whitelist_id: whitelist.id,
            status: 'disbursed'
        });

        if (!transaction) {
            return {
                message: `${row.phone_number} doesn't have a pending transaction`,
                code: ERROR_CODE.INVALID_TRANSACTION
            };
        }

        const lastPaidDate = await database.query.oneOrNone(queries.transaction.getLastUnpaidByPhoneNumberAndStatus, {
            whitelist_id: whitelist.id,
            status: 'paid'
        });

        if (lastPaidDate && lastPaidDate.transaction_date) {
            if (lastPaidDate.programme_id === transaction.programme_id) {
                const lasTPaidInterval = differenceInDays(new Date(transaction.paid_at), new Date(lastPaidDate.transaction_date));
                if (parseInt(lasTPaidInterval) < parseInt(programme.flagging_duration)) {
                    await database.query.oneOrNone(queries.transaction.flag, {
                        id: transaction.id,
                        account_number: result.account_number,
                        account_name: result.account_name,
                        bank_name: result.bank_name,
                        bank_code: result.bank_code,
                        sos_transaction_id: result.id
                    });
                    await sosService.updateSosProgrammeTransaction({
                        id: result.id,
                        programme_id: transaction.programme_id
                    });

                    return {
                        message: `${row.phone_number} transaction has been flagged`,
                        code: ERROR_CODE.TRANSACTION_FLAGGED
                    };
                }
            }
        }

        if (!isToday(new Date(row.pay_date))) {
            await sosService.updateSosProgrammeTransaction({
                id: result.id,
                programme_id: transaction.programme_id
            });

            return {
                message: `${row.phone_number} doesn't have a transaction`,
                code: ERROR_CODE.TRANSACTION_NOT_TODAY
            };
        }

        const paymentRes = await paymentService.disburseFund({
            account_number: result.account_number,
            bank_code: result.bank_code,
            account_name: result.account_name,
            reference: transaction.reference,
            remark: smsMessage.paymentRemark,
            amount: transaction.amount,
            transaction_id: transaction.id,
            date: format(new Date(), 'yyyy/MM/dd')
        });

        let disbursedStatus = 'not_paid';

        if (paymentRes.code == 1000) {
            disbursedStatus = 'paid';
        }

        await database.query.oneOrNone(queries.transaction.updateUploadedDisburseTransaction, {
            id: transaction.id,
            response_code: paymentRes.code || null,
            response_message: paymentRes.message || null,
            account_number: result.account_number,
            account_name: result.account_name,
            bank_name: result.bank_name,
            bank_code: result.bank_code,
            status: disbursedStatus,
            sos_transaction_id: result.id,
            channel: 'representatives'
        });

        await sosService.updateSosProgrammeTransaction({
            id: result.id,
            programme_id: transaction.programme_id
        });

        return {
            message: `${row.phone_number} successfully processed`,
            code: SUCCESS_CODE
        };
    } catch (err) {
        return {
            code: ERROR_CODE.UNKNOWN_ERROR,
            message: err
        };
    }
};

const uploadBeneficiaryAccount = async({ file, metadata }) => new Promise(async(resolve, reject) => {
    try {
        const basePath = '../../storage/beneficiary';

        const successFailedPath = path.resolve(__dirname, `${basePath}/success`);
        const failedFilePath = path.resolve(__dirname, `${basePath}/error`);

        const successHeader = [ 'phone_number' ];
        const errorHeader = [ 'phone_number', 'errors' ];

        const successFileParser = await new FileStreamParser(
            null,
            successFailedPath
        );
        const errorFileParser = await new FileStreamParser(
            null,
            failedFilePath
        );

        await successFileParser.setHeader(successHeader);
        await errorFileParser.setHeader(errorHeader);

        const params = {
            Bucket: metadata.bucket,
            Key: metadata.key
        };

        s3.getObject(params)
            .createReadStream()
            .pipe(fastcsv.parse({ headers: true }))
            .on('error', error => {
                console.log('error');
            })
            .on('data-invalid', async(row) => {
                console.log('invalid data');
            })
            .pipe(through2({ objectMode: true }, async(row, enc, cb) => {
                try {
                    const beneficiary = await processAccountUploadedFile({ row, programme: metadata.programme });

                    if (beneficiary.code === SUCCESS_CODE) {
                        successFileParser.writeStream(row);
                    } else {
                        console.log({ beneficiary });
                        row.errors = beneficiary.message;
                        errorFileParser.writeStream(row);
                    }
                    delete row.errors;
                    cb(null, row);
                } catch (processError) {;
                    cb(null, row);
                }
            }))
            .on('data', (row) => {
            })
            .on('end', async rowCount => {
                successFileParser.end();
                errorFileParser.end();

                const successBucketUrl = await successFileParser.getSpaceUploadPath('beneficiary/success');
                const errorBucketUrl = await errorFileParser.getSpaceUploadPath('beneficiary/error');

                // await sosService.notifySosUploadResponse({ successBucketUrl, errorBucketUrl, metadata });
                await new AccountUploadMailWorkers().sendAccountUploadEmail({ successBucketUrl, errorBucketUrl, metadata });
                return resolve({ successBucketUrl, errorBucketUrl, metadata });
            });
    } catch (error) {
        return reject(new errors.InternalServer(error));
        // throw new errors.InternalServer(error)
    }
});

const sendUploadBeneficiaryAccount = async({ successBucketUrl, errorBucketUrl, metadata }) => new Promise(async(resolve, reject) => {
    try {
        await notificationService.sendApplicantUploadMail({ successBucketUrl, errorBucketUrl, metadata });

        return resolve('done');
    } catch (error) {
        return reject(new errors.InternalServer(error));
    }
});

module.exports = {
    uploadApplicant,
    getAplicantsForPayment,
    processPayment,
    payApplicant,
    createAkuPay,
    processApplicantUpload,
    getretractApplicant,
    processRetract,
    getPendingSmsBySource,
    process1960SmsStatus,
    uploadBeneficiaryAccount,
    sendUploadBeneficiaryAccount,
    saveUploadApplicantError
};
