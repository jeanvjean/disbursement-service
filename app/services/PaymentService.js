/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-vars */
/* eslint-disable no-return-await */
/* eslint-disable class-methods-use-this */
const crypto = require('crypto');
const _ = require('lodash');
const { format } = require('date-fns');
const xml2js = require('xml2js');
const DOMParser = require('xmldom').DOMParser;
const ClientHttp = require('../utils/Client');
const vendorCodes = require('../storage/bank-vendor');

class PaymentService {
    constructor({ config, helper }) {
        this.baseUrl = config.get('gaps.base_uri');
        this.headers = {
            'Content-Type': 'text/xml'
        },
        this.config = config;
        this.helper = helper;
        this.uploaderCredentials = `
            <username>${this.config.get('gaps.username')}</username>
            <password>${this.config.get('gaps.password')}</password>
        `;
        this.gapsCredentials = `
            <accesscode>${this.config.get('gaps.access_code')}</accesscode>
            ${this.uploaderCredentials}
        `;
        this.client = new ClientHttp(this.baseUrl, this.headers);
        this.now = format(new Date(), 'yyyy/MM/dd');
    }

    async computeHash(plainText) {
        try {
            const hashResult = crypto.createHash('sha512').update(plainText).digest('hex');

            return hashResult;
        } catch (error) {
            throw new Error(error);
        }
    }

    prepareHashPayload(transactionDetails) {
        return `${transactionDetails}${this.config.get('gaps.access_code')}${this.config.get('gaps.username')}${this.config.get('gaps.password')}`;
    }

    escapeHTML(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    async disburseFund(payload) {
        try {
            const transactionDetails = await this.getTransactionDetails(payload);
            const hashPlainText = this.prepareHashPayload(transactionDetails);

            const hash = await this.computeHash(hashPlainText);

            const xmlBodyStr = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fil="http://tempuri.org/GAPS_Uploader/FileUploader">            <soapenv:Header/>
               <soapenv:Body>
                    <fil:SingleTransfers>
                        <fil:xmlRequest>
                            <![CDATA[
                                <SingleTransferRequest>
                                    <transdetails>${this.escapeHTML(transactionDetails)}</transdetails>
                                    ${this.gapsCredentials}
                                    <hash>${hash}</hash>
                                </SingleTransferRequest>
                            ]]>
                        </fil:xmlRequest>
                    </fil:SingleTransfers>
                </soapenv:Body>
            </soapenv:Envelope>
            `;

            const response = await this.client.post('FileUploader.asmx', xmlBodyStr);

            const formattedResponse = await this.xmlToJson(response);

            return formattedResponse;
        } catch (error) {
            console.log({ gtBankError: error });
            throw new Error(error.message);
        }
    }

    async getformattedRemark({ transactionId }) {
        return await this.helper.getPaymentRemark({ transactionId });
    }

    async getTransactionDetails({
        amount, date = this.now(), reference, bank_code, account_number, account_name, transaction_id
    }) {
        if (!bank_code) {
            throw new Error('Invalid Bank code from transaction');
        }
        const vendorbankcode = _.find(vendorCodes, (bank) => bank.bank_code == bank_code);

        if (!vendorbankcode) {
            throw new Error('Unable to select bank vendor code');
        }


        const remark = await this.getformattedRemark({ transactionId: transaction_id });

        return `<transactions><transaction><amount>${amount}</amount><paymentdate>${date}</paymentdate><reference>${reference}</reference><remarks>${remark || ''}</remarks><vendorcode>${bank_code}</vendorcode><vendorname>${account_name}</vendorname><vendoracctnumber>${account_number}</vendoracctnumber><vendorbankcode>${vendorbankcode.bank_sort_code}</vendorbankcode></transaction></transactions>`;
    }

    async getTransactionRequeryDetails({ reference }) {
        return `<transactions><transaction><amount>${amount}</amount><paymentdate>${date}</paymentdate><reference>${reference}</reference><remarks>${remark || ''}</remarks><vendorcode>${bank_code}</vendorcode><vendorname>${account_name}</vendorname><vendoracctnumber>${account_number}</vendoracctnumber><vendorbankcode>${vendorbankcode.bank_sort_code}</vendorbankcode></transaction></transactions>`;
    }

    async requeryTransaction({ reference }) {
        try {
            const requesyString = `<?xml version="1.0" encoding="utf-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fil="http://tempuri.org/GAPS_Uploader/FileUploader"><soapenv:Header/><soapenv:Body><fil:SingleTransfers><fil:xmlRequest><TransactionRequeryRequest><transref>${reference}</transref>${this.gapsCredentials}</TransactionRequeryRequest></fil:xmlRequest></fil:SingleTransfers></soapenv:Body></soapenv:Envelope>`;

            const response = await this.client.post('FileUploader.asmx', requesyString);

            return this.parseXmlResponse(response);
        } catch (error) {
            throw new Error(error);
        }
    }

    async parseXmlResponse(xmlString) {
        const parser = new xml2js.Parser(xml2js.defaults['0.2']);

        parser.parseStringPromise(xmlString).then((result) => {
            console.log(result['soap:Envelop']);
        })
            .catch((err) => {
                console.log({ err });
            // Failed
            });

        // xml2js.parseString(xmlString, (err, result) => {
        //     if(err) {
        //         throw err;
        //     }
        //     console.log({result});
        //     const json = JSON.stringify(result, null, 4);
        //     return json;
        // });
    }

    xmlToJson(xmlString) {
        return new Promise((resolve, reject) => {
            const parser = new xml2js.Parser();
            parser.parseStringPromise(xmlString).then((result) => {
                const deepRes = result['soap:Envelope']['soap:Body'][0].SingleTransfersResponse[0].SingleTransfersResult[0];
                parser.parseStringPromise(deepRes).then((result2) => {
                    const response = {
                        code: result2.Response.Code[0],
                        message: result2.Response.Message[0]
                    };
                    return resolve(response);
                })
                    .catch((err2) => reject(err2));
            })
                .catch((err) => reject(err));
        });
    }
}

module.exports = PaymentService;
