// const path = require('path');
// const { database } = require('./database');
// const queries = require('../queries');
// const { ERROR_CODE } = require('../constants')
// const { saveUploadApplicantError, validateApplicantCashBand } = require('./applicant');

// const convertPhoneNumberToInternationalFormat = (phone_number) => {
//     if(phone_number.length == 11){
//       phone_number = `+234${phone_number.substring(1)}`
//     }
//     if(phone_number.length == 10){
//       phone_number = `+234${phone_number}`
//     }

//     if(phone_number.length == 13){
//       phone_number = `+${phone_number}`
//     }

//     return phone_number

//   }

// const processUploadedFile = ({ row, programme }) => {
//     try {
//         let processedPhoneNumber = [];

//         const checkAmountBand = await validateApplicantCashBand(row.amount, programme.id);

//         row.phone_number = convertPhoneNumberToInternationalFormat(row.phone_number);

//         if(!checkAmountBand) {
//             await saveUploadApplicantError(row.phone_number, `Amount not valid in cash band for ${programme.name} programme`);
//             return {
//                 message: `Amount not valid in cash band for ${programme.name} programme`,
//                 code: '03'
//             };
//         }

//         const whitelist = await database.query.oneOrNone(queries.whitelist.get, [ row.phone_number ]);

//         if(!whitelist) {
//             return {
//                 message: `${row.phone_number} has not been whitelisted`,
//                 code: ERROR_CODE.INVALID_WHITELIST
//             };
//         }

//         const transaction = await database.query.oneOrNone(queries.transaction.getLastUnpaidByPhoneNumberAndStatus, {
//             whitelist_id: whitelist.id,
//             status: 'disbursed'
//         });

//         if(!transaction) {
//             return {
//                 message: `${row.phone_number} doesn't have a transaction`,
//                 code: ERROR_CODE.INVALID_TRANSACTION
//             };
//         }

//         const lastPaidDate = await database.query.oneOrNone(queries.transaction.getLastUnpaidByPhoneNumberAndStatus, {
//             whitelist_id: whitelist.id,
//             status: 'paid'
//         });

//         if(lastPaidDate && lastPaidDate.transaction_date) {
//             if(lastPaidDate.programme_id === transaction.programme_id) {
//                 const lasTPaidInterval = differenceInDays(new Date(transaction.paid_at), new Date(lastPaidDate.transaction_date));
//                 if(parseInt(lasTPaidInterval) < parseInt(programme.flagging_duration)) {
//                     await database.query.oneOrNone(queries.transaction.flag, {
//                         id: transaction.id,
//                         account_number: result.account_number,
//                         account_name: result.account_name,
//                         bank_name: result.bank_name,
//                         bank_code: result.bank_code,
//                         sos_transaction_id: result.id
//                     });
//                     await this.sosService.updateSosProgrammeTransaction({ 
//                         id: result.id,
//                         programme_id: transaction.programme_id
//                     });

//                     return {
//                         message: `${row.phone_number} transaction has been flagged`,
//                         code: ERROR_CODE.TRANSACTION_FLAGGED
//                     };
//                 }
//             }
//         }

//         if(!isToday(new Date(transaction.paid_at))) {
//             await this.sosService.updateSosProgrammeTransaction({ 
//                 id: result.id,
//                 programme_id: transaction.programme_id
//             });
//             await this.helper.saveWebhookResponse({ phone_number: from, message: 'Transaction not today' })
//             console.log('Transaction not today')
//             return 'done';
//         }

//         const paymentRes = await this.paymentService.disburseFund({ 
//             account_number: result.account_number, 
//             bank_code: result.bank_code,
//             account_name: result.account_name,
//             reference: transaction.reference,
//             remark: messages.paymentRemark,
//             amount: transaction.amount,
//             transaction_id: transaction.id,
//             date: format(new Date(), 'yyyy/MM/dd')
//         });

//         let disbursedStatus = 'not_paid';

//         if(paymentRes.code == 1000) {
//             disbursedStatus = 'paid';
//         }
        
//         await this.database.query.oneOrNone(this.queries.transaction.updateDisburseTransaction, {
//             id: transaction.id,
//             response_code: paymentRes.code || null,
//             response_message: paymentRes.message || null,
//             account_number: result.account_number,
//             account_name: result.account_name,
//             bank_name: result.bank_name,
//             bank_code: result.bank_code,
//             status: disbursedStatus,
//             sos_transaction_id: result.id
//         });

//         let akupayFrom = from

//         if(from.indexOf('+') >= 0) {
//             akupayFrom = from.substring(1);
//         }

//         if(paymentRes.code == 1000) {
//             await this.akupayService.debitBeneficiaryAccount({ phone_number: akupayFrom , amount: transaction.amount});
//         }

//         await this.helper.saveWebhookResponse({ phone_number: from, message: paymentRes.message || 'N/A' })
        

//         await this.sosService.updateSosProgrammeTransaction({ 
//             id: result.id,
//             programme_id: transaction.programme_id
//         });
        
//         return 'sucess';
//     } catch (err) {
//         console.log({ err })
//         if(isQueue) {
//             return {
//                 code: '01',
//                 message: err
//             }
//         }

//         throw new Error(err)
//     }
// }

// const uploadBeneficiaryAccount = async ({ file, metadata }) => {
//     try {
//         const basePath = `../../storage/beneficiary`;

//         const successFailedPath = path.resolve(__dirname, `${basePath}/success`);
//         const failedFilePath = path.resolve(__dirname, `${basePath}/error`);

//         const successHeader = ['phone_number']
//         const errorHeader = ['phone_number', 'errors']

//         const successFileParser = await new FileStreamParser(
//             null,
//             successFailedPath
//         );
//         const errorFileParser = await new FileStreamParser(
//             null,
//             failedFilePath
//         );

//         await successFileParser.setHeader(successHeader);
//         await errorFileParser.setHeader(errorHeader);

//         let params = {
//             Bucket: file.bucket,
//             Key: file.key,
//         };
    
//         s3.getObject(params)
//         .createReadStream()
//         .pipe(fastcsv.parse({ headers: true }))
//         .on('error', error => {
//             console.log('error')
//         })
//         .on('data-invalid', async function(row) {
//             console.log('invalid data')
//         })
//         .pipe(
//             through2({ objectMode: true }, async (row, enc, cb) => {
//                 try {
//                     const beneficiary = await processUploadedFile({ row, programme: metadata.programme });

//                     if(beneficiary.code === 0) {
//                         successFileParser.writeStream(row);
//                     } else {
//                         row.errors = beneficiary.message
//                         errorFileParser.writeStream(row);
//                     }
//                     delete row.errors;
//                     cb(null, row);
//                 } catch (processError) {
//                     console.log({processError})
//                     cb(null, row);
//                 }
//             })
//             )
//             .on('data', function(row) {
//             // console.log('data')
//             })
//             .on('end', async rowCount => {
//                 successFileParser.end();
//                 errorFileParser.end();

//                 const successBucketUrl = await successFileParser.getSpaceUploadPath(
//                     'beneficiary/success'
//                 );
//                 const errorBucketUrl = await errorFileParser.getSpaceUploadPath(
//                     'beneficiary/error'
//                 );

//                 await sosService.notifySosUploadResponse({ successBucketUrl, errorBucketUrl, metadata });

//                 return { successBucketUrl, errorBucketUrl, metadata };
//             });
//     } catch (error) {
//         throw new errors.InternalServer(error)
//     }
// }

// module.exports = {
//     uploadBeneficiaryAccount,
// }