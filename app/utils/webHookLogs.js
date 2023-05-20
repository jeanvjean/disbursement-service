/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { sendEMail ,generateCode, base64EncodeFile, getFileSize } = require('./mail');

const { BadRequest } = require('../tools/errors');
const WebHookLogsWorker = require('../queues/workers/webHookLogs/export');
const CSVFileParser = require('./CSVFileParser');
const database = require('./database');


const exportWebHookLogs = async({
    dbQuery,
    user
}) => {
    try {
        const headers = [
            'id',
            'phone_number',
            'message',
            'created_at',
            ];

        const data = await database.query.any(dbQuery);

        const csvPath = path.resolve(__dirname, '../../storage/webhooklogs');
        const spaceKeyPath = 'exports/webhooklogs';
        const fileName = `webhook-logs-${generateCode()}.csv`;
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

        await WebHookLogsWorker.sendExportedWebHookLogs({
          file,
          user
      });
        return 'done';
    } catch (err) {
        console.log(err);
        throw BadRequest(err);
    }
};

const sendExportedWebHookLogs = async({ file, user }) => {
    try {
        const base64Content = await base64EncodeFile(file.filePath);
        const fileSize = getFileSize(file.filePath);

        const templatePath = '../../views/emails/webhook-response-export.ejs'
    
        let mailPayload = {};
        if (base64Content !== '') {
            if (fileSize >= 20) {
                mailPayload = {
                    to:  user.email || 'akudevops@gmail.com',
                    from: config.get('notification.email.from_mail'),
                    bcc: [ 'akudevops@gmail.com' ],
                    subject: 'Webhook Logs Details Download',
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
                subject: 'Webhook Logs Details Download',
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
    exportWebHookLogs,
    sendExportedWebHookLogs,
};
