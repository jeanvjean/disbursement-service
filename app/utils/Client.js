/* eslint-disable prefer-promise-reject-errors */
const axios = require('axios');
const config = require('../../config');

class HttpClient {
    constructor(baseUrl, headers) {
        this.base_uri = baseUrl;
        this.client = axios.create({
            baseURL: baseUrl,
            timeout: 300000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers
        });
    }

    get(url, headers) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!url) {
                    return reject({
                        code: 400,
                        message: 'GET URL is undefined',
                        name: 'BadRequest'
                    });
                }
                const response = await this.client.get(this.base_uri + url, headers);

                const data = response.data.meta ?
                    response.data :
                    response.data.data || response.data || response;
                return resolve(data);
            } catch (err) {
                if (err.response) {
                    return reject(err.response.data || err.response);
                }
                return reject(err);
            }
        });
    }

    post(url, payload = {}, headers = {}) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!url) {
                    return reject({
                        code: 400,
                        message: 'POST URL is undefined',
                        name: 'BadRequest'
                    });
                }

                const response = await this.client.post(
                    this.base_uri + url,
                    payload,
                    headers
                );

                const data = response.data.meta ?
                    response.data :
                    response.data.data || response.data || response;
                return resolve(data);
            } catch (err) {
                if (err.response) {
                    return reject(err.response.data || err.response);
                }
                return reject(err);
            }
        });
    }

    put(url, payload, headers = {}) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!url) {
                    return reject({
                        code: 400,
                        message: 'PUT URL is undefined',
                        name: 'BadRequest'
                    });
                }
                const response = await this.client.put(
                    this.base_uri + url,
                    payload,
                    headers
                );

                const data = response.data.meta ?
                    response.data :
                    response.data.data || response.data || response;

                return resolve(data);
            } catch (err) {
                if (err.response) {
                    return reject(err.response.data || err.response);
                }
                return reject(err);
            }
        });
    }
    delete(url) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!url) {
                    return reject({
                        code: 400,
                        message: 'DELETE URL is undefined',
                        name: 'BadRequest'
                    });
                }
                const response = await this.client.delete(this.base_uri + url);

                const data = response.data.meta ?
                    response.data :
                    response.data.data || response.data || response;

                return resolve(data);
            } catch (err) {
                if (err.response) {
                    return reject(err.response.data || err.response);
                }
                return reject(err);
            }
        });
    }

    patch(url, payload, headers) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!url) {
                    return reject({
                        code: 400,
                        message: 'PATCH URL is undefined',
                        name: 'BadRequest'
                    });
                }
                const response = await this.client.patch(
                    this.base_uri + url,
                    payload,
                    headers
                );

                const data = response.data.meta ?
                    response.data :
                    response.data.data || response.data || response;

                return resolve(data);
            } catch (err) {
                if (err.response) {
                    return reject(err.response.data || err.response);
                }
                return reject(err);
            }
        });
    }
}

module.exports = HttpClient;
