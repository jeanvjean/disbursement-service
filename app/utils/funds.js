/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const {
    sendEMail, generateCode, base64EncodeFile, getFileSize
} = require('./mail');

const { BadRequest } = require('../tools/errors');
const FundsWorker = require('../queues/workers/funds/export');
const CSVFileParser = require('./CSVFileParser');
const database = require('./database');


const exportFunds = async({
    dbQuery,
    user
}) => {
    try {
        const headers = [
            'id',
            'programme_id',
            'programme_name',
            'amount',
            'funded_at'
        ];

        const data = await database.query.any(dbQuery);

        const csvPath = path.resolve(__dirname, '../../storage/funds');
        const spaceKeyPath = 'exports/funds';
        const fileName = `funds-${generateCode()}.csv`;
        const filePath = path.resolve(__dirname, `${csvPath}/${fileName}`);

        const fileParser = new CSVFileParser(
            null,
            filePath,
            fileName
        );
        await fileParser.setHeader(headers);
        const dataArray = Array.isArray(data) ? data : [ data ];
        const fileStream = fileParser.createFileStream();
        dataArray.forEach(async(row) => {
            fileStream.writeStream(row);
        });
        fileParser.end();
        const file = {
            fileName: fileStream.fileName,
            filePath: fileStream.filePath,
            bucketUrl: await fileParser.getSpaceUploadPath(spaceKeyPath)
        };

        await FundsWorker.sendExportedFunds({
            file,
            user
        });
        return 'done';
    } catch (err) {
        console.log(err);
        throw BadRequest(err);
    }
};

const sendExportedFunds = async({ file, user }) => {
    try {
        const base64Content = await base64EncodeFile(file.filePath);
        const fileSize = getFileSize(file.filePath);

        const exportFundsTemplate = '../../views/emails/funds-export.ejs';

        let mailPayload = {};
        if (base64Content !== '') {
            if (fileSize >= 20) {
                mailPayload = {
                    to: user.email || 'akudevops@gmail.com',
                    from: config.get('notification.email.from_mail'),
                    bcc: [ 'jo@gmail.com' ],
                    subject: 'Funds Details Download',
                    filePath: exportFundsTemplate,
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
                to: user.email || 'akudevops@gmail.com',
                from: config.get('notification.email.from_mail'),
                subject: 'Funds Details Download',
                bcc: [ 'akudevops@gmail.com' ],
                filePath: exportFundsTemplate,
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
    exportFunds,
    sendExportedFunds
};


// clear
