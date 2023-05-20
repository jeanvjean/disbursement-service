const config = require('../../config');
const HttpClient = require('./Client');

const baseUrl = config.get('notification.base_uri');
const apiKey = config.get('notification.api_key');


const dispatchEmailNotification = (payload) => new Promise(async(resolve, reject) => {
    try {
        const headers = {
            'secret-key': apiKey
        };
        const data = await new HttpClient(baseUrl, headers).post('notifications/email', payload, headers);
        resolve(data);
    } catch (err) {
        console.log({ err });
        reject(err);
    }
});

const dispatchSmsNotification = (params) => new Promise(async(resolve, reject) => {
    try {
        const headers = {
            'secret-key': apiKey
        };

        const data = await new HttpClient(baseUrl, headers).post('notifications/sms', params, headers);
        resolve(data);
    } catch (err) {
        reject(err);
    }
});

module.exports = {
    dispatchSmsNotification,
    dispatchEmailNotification
};
