/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { sendEMail ,generateCode, base64EncodeFile, getFileSize } = require('./mail');

const { BadRequest } = require('../tools/errors');
const RetractedWorker = require('../queues/workers/retracted/export');
const CSVFileParser = require('./CSVFileParser');
const database = require('./database');


const exportRetracted = async({
    dbQuery,
    sqlQuery2,
    user
}) => {
    try {
        const headers = [
            'total_unique_retracted',
            'total_retracted',
            'total_sum_retracted',
            ];

            const data = await database.query.any(dbQuery);
            // console.log(dbQuery);
            // const total = await database.query.oneOrNone(sqlQuery2);
            
        const csvPath = path.resolve(__dirname, '../../storage/retracted');
        const spaceKeyPath = 'exports/retracted';
        const fileName = `retracted-${generateCode()}.csv`;
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

        await RetractedWorker.sendExportedRetracted({
          file,
          user
      });
        return 'done';
    } catch (err) {
        console.log(err);
        throw BadRequest(err);
    }
};

const sendExportedRetracted = async({ file, user }) => {
    try {
        const base64Content = await base64EncodeFile(file.filePath);
        const fileSize = getFileSize(file.filePath);

        const templatePath = '../../views/emails/retracted-export.ejs'
      
        let mailPayload = {};
        if (base64Content !== '') {
            if (fileSize >= 20) {
                mailPayload = {
                  to:  user.email || 'akudevops@gmail.com',
                  from: config.get('notification.email.from_mail'),
                  bcc: [ 'akudevops@gmail.com' ],
                  subject: 'Retracted Details Download',
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
                subject: 'Retracted Details Download',
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
    exportRetracted,
    sendExportedRetracted,
};




// clear
