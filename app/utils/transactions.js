/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { sendEMail ,generateCode, base64EncodeFile, getFileSize } = require('./mail');

const { BadRequest } = require('../tools/errors');
const TransactionWorker = require('../queues/workers/transactions/export');
const CSVFileParser = require('./CSVFileParser');
const database = require('./database');


const exportTransaction = async({
    dbQuery,
    dbValues,
    user
}) => {
    try {
        const headers = [
            'id',
            'status',
            'account_number',
            'account_name',
            'bank_name',
            'amount',
            'whitelist_id',
            'deleted_at',
            'created_at',
            'updated_at',
            'reference',
            'flagged',
            'flagged_at',
            'deny_payment',
            'paid_at',
            'customer_id',
            'transaction_date',
            'retracted',
            'retracted_at',
            'response_code',
            'response_message',
            'programme_id',
            'bank_code',
            'sos_transaction_id'
            ];

        const data = await database.query.any(dbQuery, dbValues);

        const csvPath = path.resolve(__dirname, '../../storage/transactions');
        const spaceKeyPath = 'exports/transactions';
        const fileName = `transaction-${generateCode()}.csv`;
        const filePath = path.resolve(__dirname, `${csvPath}/${fileName}`);
        
        const fileParser = new CSVFileParser(
          null,
          filePath,
          fileName
      );
      await fileParser.setHeader(headers);
      const dataArray = Array.isArray(data) ? data : [data];
      const fileStream = fileParser.createFileStream()
      dataArray.forEach(async(row) => {
        fileStream.writeStream(row);
      });
      fileParser.end()
        const file = {
          fileName : fileStream.fileName,
          filePath: fileStream.filePath,
          bucketUrl: await fileParser.getSpaceUploadPath(spaceKeyPath)
        };

        await TransactionWorker.sendExportedTransaction({
          file,
          user
      });
        return 'done';
    } catch (err) {
        console.log(err);
        throw BadRequest(err);
    }
};

const sendExportedTransaction = async({ file, user }) => {
    try {
        const base64Content = await base64EncodeFile(file.filePath);
        const fileSize = getFileSize(file.filePath);

        const exportTransactionTemplate = '../../views/emails/transaction-export.ejs'
      
        let mailPayload = {};
        if (base64Content !== '') {
            if (fileSize >= 20) {
                mailPayload = {
                  to:  user.email || 'akudevops@gmail.com',
                  from: config.get('notification.email.from_mail'),
                    // bcc: [ 'jo@gmail.com' ],
                    subject: 'Transaction Details Download',
                    filePath: exportTransactionTemplate,
                    payload: {
                        user,
                        file
                    },
                    attachment: false
                };

                await sendEMail({
                    ...mailPayload
                });
                fs.unlink(file.filePath, err => {
                  if (err) {
                      return err;
                  }
                  console.log(`${file.filePath} was successfully removed`);
              });
                return 'done';
            }
        }

        if (base64Content !== '') {
            mailPayload = {
                to:  user.email || 'akudevops@gmail.com',
                from: config.get('notification.email.from_mail'),
                subject: 'Transaction Details Download',
                // bcc: [ 'akudevops@gmail.com' ],
                filePath: exportTransactionTemplate,
                payload: {
                    user,
                    file
                },
                attachment: true,
                fileName: file.fileName,
                fileType: 'text/csv',
                content: base64Content
            };

            await sendEMail({
                ...mailPayload
            });
            fs.unlink(file.filePath, err => {
              if (err) {
                  return err;
              }
              console.log(`${file.filePath} was successfully removed`);
          });
        }


        return 'done';
    } catch (err) {
        console.log(err);
        throw BadRequest({
            err
        });
    }
};


module.exports = {
    exportTransaction,
    sendExportedTransaction,
};




// clear
