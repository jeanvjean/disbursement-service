/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { sendEMail ,generateCode, base64EncodeFile, getFileSize } = require('./mail');

const { BadRequest } = require('../tools/errors');
const ApplicantReplyWorker = require('../queues/workers/applicants/replySms');
const CSVFileParser = require('./CSVFileParser');
const database = require('./database');


const exportApplicantReply = async({
    dbQuery,
    user
}) => {
    try {
        const headers = [
            'id',
            'phone_number',
            'account_number',
            'bank_name',
            'message_text',
            'created_at'
            ];

        const data = await database.query.any(dbQuery);

        const csvPath = path.resolve(__dirname, '../../storage/applicantreply');
        const spaceKeyPath = 'exports/applicantreply';
        const fileName = `applicant-reply-${generateCode()}.csv`;
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
        await ApplicantReplyWorker.sendExportedApplicantReply({
          file,
          user
      });
        return 'done';
    } catch (err) {
        console.log(err);
        throw BadRequest(err);
    }
};

const sendExportedApplicantReply = async({ file, user }) => {
    try {
        const base64Content = await base64EncodeFile(file.filePath);
        const fileSize = getFileSize(file.filePath);

        const exportApplicantReplyTemplate = '../../views/emails/applicant-reply.ejs'
    
        let mailPayload = {};
        console.log('we got here')
        if (base64Content !== '') {
            if (fileSize >= 20) {
                mailPayload = {
                    to:  user.email || 'akudevops@gmail.com',
                    from: config.get('notification.email.from_mail'),
                    bcc: [ 'akudevops@gmail.com' ],
                    subject: 'Funds Details Download',
                    filePath: exportApplicantReplyTemplate,
                    payload: {
                        user,
                        file
                    },
                    attachment: false
                };
                console.log('we got here' ,1)
                await sendEMail({
                    ...mailPayload
                });
                console.log('we got here', 2)
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
            console.log('we got here', 3)
            mailPayload = {
                to:  user.email || 'akudevops@gmail.com',
                from: config.get('notification.email.from_mail'),
                subject: 'Funds Details Download',
                bcc: [ 'akudevops@gmail.com' ],
                filePath: exportApplicantReplyTemplate,
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
    exportApplicantReply,
    sendExportedApplicantReply,
};




// clear
