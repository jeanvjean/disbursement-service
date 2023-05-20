/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { sendEMail ,generateCode, base64EncodeFile, getFileSize } = require('./mail');

const { BadRequest } = require('../tools/errors');
const CashoutWorker = require('../queues/workers/cashout/export');
const CSVFileParser = require('./CSVFileParser');
const database = require('./database');


const exportCashout = async({
    dbQuery,
    sqlQuery2,
    user
}) => {
    try {
        const headers = [
            'amount',
            'beneficiaries',
            'disbursed_amount',
            // 'total_unique_cashed_out',
            // 'total_cash_out',
            // 'total_sum_cash_out',
        ];


        const data = await database.query.any(dbQuery);
        // const total = await database.query.oneOrNone(sqlQuery2);
 
        const csvPath = path.resolve(__dirname, '../../storage/cashouts');
        const spaceKeyPath = 'exports/cashouts';
        const fileName = `cashout-${generateCode()}.csv`;
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
    //   fileStream.writeStream(total);
      fileParser.end()
        const file = {
          fileName : fileStream.fileName,
          filePath: fileStream.filePath,
          bucketUrl: await fileParser.getSpaceUploadPath(spaceKeyPath)
        };
        await CashoutWorker.sendExportedCashout({
          file,
          user
      });
        return 'done';
    } catch (err) {
        console.log(err);
        throw BadRequest(err);
    }
};

const sendExportedCashout = async({ file, user }) => {
    try {
        const base64Content = await base64EncodeFile(file.filePath);
        const fileSize = getFileSize(file.filePath);

        const templatePath = '../../views/emails/cashout-export.ejs'
      
        let mailPayload = {};
        if (base64Content !== '') {
            if (fileSize >= 20) {
                mailPayload = {
                  to:  user.email || 'akudevops@gmail.com',
                  from: config.get('notification.email.from_mail'),
                    bcc: [ 'akudevops@gmail.com' ],
                    subject: 'Cashout Details Download',
                    filePath: templatePath,
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
                subject: 'Cashout Details Download',
                bcc: [ 'akudevops@gmail.com' ],
                filePath: templatePath,
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
    exportCashout,
    sendExportedCashout,
};




// clear
