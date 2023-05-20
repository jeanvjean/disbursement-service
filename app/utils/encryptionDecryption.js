const crypto = require('crypto');
const cryptoJs = require('crypto-js');

const encrypt = (data, secret_key, key) => {
    const ENC_KEY = cryptoJs.MD5(secret_key).toString();
    const IV = cryptoJs.SHA256(key).toString().substring(0, 16);

    const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
};

const decrypt = (encryptedText, secret_key, client_key) => {
    const ENC_KEY = cryptoJs.MD5(secret_key).toString();
    const IV = cryptoJs.SHA256(client_key)
        .toString()
        .substring(0, 16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
    const decrypted = decipher.update(encryptedText, 'base64', 'utf8');

    return decrypted + decipher.final('utf8');
};

module.exports = { encrypt, decrypt };
