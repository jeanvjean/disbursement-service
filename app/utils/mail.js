const { dispatchEmailNotification } = require('./notifications');
const fs = require('fs');
const ejs = require('ejs')
const path = require('path')

const sendEMail = ({
    to,
    from,
    subject,
    bcc,
    cc,
    filePath,
    payload,
    attachment = false,
    fileName = '',
    fileType = '',
    content = '',
}) => new Promise(async (resolve, reject) => {
    try {

        const html = await ejs.renderFile(path.join(__dirname, filePath), payload);
        const notificationPayload = {
            to,
            from,
            subject,
            bcc,
            cc,
            attachment,
            html,
        };

        if (attachment) {
            notificationPayload.fileName = fileName;
            notificationPayload.fileType = fileType;
            notificationPayload.content = content;
        }
        await dispatchEmailNotification(notificationPayload);

        resolve('send successfully');
    } catch (err) {
        reject(err);
    }
});

const generateCode = () => Math.floor(100000 + Math.random() * 900000);

const fileGetContent = (filePath) => new Promise(async (resolve, reject) => {
    try {
        const fileContent = fs
            .readFileSync(path.resolve(filePath))
            .toString('utf8');

        resolve(fileContent);
    } catch (err) {
        console.log({ err4: err });
        reject(err);
    }
});


const getFileSize = file => {
    const stats = fs.statSync(file);
    const fileSizeInBytes = stats.size;
    // Convert the file size to megabytes (optional)
    const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;

    return fileSizeInMegabytes;
};

const base64EncodeFile = file => new Promise(async (resolve, reject) => {
    try {
        const bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        const base64Content = Buffer.from(bitmap).toString('base64');

        resolve(base64Content);
    } catch (err) {
        reject(err);
    }
});
module.exports = {
    sendEMail,
    fileGetContent,
    generateCode,
    base64EncodeFile,
    getFileSize
};