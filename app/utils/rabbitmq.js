const config = require('../../config');

const amqp = require('amqplib');
const database = require('./database')
const queries = require('../queries')

let connectionString = config.get('rabbitmq.url');

const connection = async() => {
    try {
        const amqpconnection = await amqp.connect(connectionString);
        const channel = await amqpconnection.createConfirmChannel();

        return {
            connection: amqpconnection,
            channel
        };
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

const rabbitmqArchitecture = worker => new Promise((resolve, reject) => {
    try {
        const exchange = 'aku.abp_monitor.exchange';
        
        switch (worker) {
                case 'upload_applicant_queue':
                    resolve({
                        queue: 'upload_applicant.queue',
                        exchange,
                        routingKey: 'upload_applicant.send'
                    });
                break;
                case 'create_aku_account_queue':
                    resolve({
                        queue: 'create_aku_account_queue',
                        exchange,
                        routingKey: 'create_aku_account_send'
                    })
                break;
                case 'pay_applicant_queue':
                    resolve({
                        queue: 'pay_applicant_queue',
                        exchange,
                        routingKey: 'pay_applicant_send'
                    });
                break;
                case 'process_applicant_payment_queue':
                    resolve({
                        queue: 'process_applicant_payment_queue',
                        exchange,
                        routingKey: 'pay_applicant_send'
                    });
                break;
                case 'exports_transaction_queue':
                    resolve({
                        queue: 'exports_transaction_queue',
                        exchange,
                        routingKey: 'exports_transaction'
                    });
                    break;
                case 'send_exported_transaction_queue':
                    resolve({
                        queue: 'send_exported_transaction_queue',
                        exchange,
                        routingKey: 'send_exported_transaction'
                    });
                    break;
                case 'exports_funds_queue':
                    resolve({
                        queue: 'exports_funds_queue',
                        exchange,
                        routingKey: 'exports_funds'
                    });
                    break;
                case 'send_exported_funds_queue':
                    resolve({
                        queue: 'send_exported_funds_queue',
                        exchange,
                        routingKey: 'send_exported_funds'
                    });
                    break;

                case 'exports_applicant_repply_queue':
                    resolve({
                        queue: 'exports_applicant_repply_queue',
                        exchange,
                        routingKey: 'exports_applicant_repply'
                    });
                    break;

                case 'process_applicant_sms_status_queue':
                    resolve({
                        queue: 'process_applicant_sms_status_queue',
                        exchange,
                        routingKey: 'process_applicant_sms_status'
                    })
                break;
                case 'beneficiary_account_upload_queue':
                    resolve({
                        queue: 'beneficiary_account_upload_queue',
                        exchange,
                        routingKey: 'beneficiary_account_upload'
                    })
                break;
                case 'send_beneficiary_account_upload_queue':
                    resolve({
                        queue: 'send_beneficiary_account_upload_queue',
                        exchange,
                        routingKey: 'send_beneficiary_account_upload'
                    })
                break;
                case 'exports_cashout_queue':
                    resolve({
                        queue: 'exports_cashout_queue',
                        exchange,
                        routingKey: 'exports_cashout'
                    });
                    break;
                case 'send_exported_cashout_queue':
                    resolve({
                        queue: 'send_exported_cashout_queue',
                        exchange,
                        routingKey: 'send_exported_cashout'
                    });
                    break;
                case 'exports_sms_logs_queue':
                        resolve({
                            queue: 'exports_sms_logs_queue',
                            exchange,
                            routingKey: 'exports_sms_logs'
                        });
                        break;
                case 'send_exported_sms_logs_queue':
                        resolve({
                            queue: 'send_exported_sms_logs_queue',
                            exchange,
                            routingKey: 'send_exported_sms_logs'
                        });
                        break;

                case 'exports_webhook_logs_queue':
                        resolve({
                            queue: 'exports_webhook_logs_queue',
                            exchange,
                            routingKey: 'exports_webhook_logs'
                        });
                        break;
                case 'send_exported_webhook_logs_queue':
                        resolve({
                            queue: 'send_exported_webhook_logs_queue',
                            exchange,
                            routingKey: 'send_exported_webhook_logs'
                        });
                        break;
                case 'exports_retracted_queue':
                        resolve({
                            queue: 'exports_retracted_queue',
                            exchange,
                            routingKey: 'exports_retracted'
                        });
                    break;
                case 'send_exported_retracted_queue':
                        resolve({
                            queue: 'send_exported_retracted_queue',
                            exchange,
                            routingKey: 'send_exported_retracted'
                        });
                    break;
                case 'exports_upload_error_logs_queue':
                        resolve({
                            queue: 'exports_upload_error_logs_queue',
                            exchange,
                            routingKey: 'exports_upload_error_logs'
                        });
                    break;
                case 'send_exported_upload_error_logs_queue': 
                        resolve({
                            queue: 'send_exported_upload_error_logs_queue',
                            exchange,
                            routingKey: 'send_exported_upload_error_logs'
                        });
                    break;

                default:
                    throw new Error('Invalid queue: Something bad happened!');
        }
    } catch (error) {
        reject(error);
    }
});

const saveFailedJobs = async data => {
    try {
        await database.query.oneOrNone(queries.app.createFailedJob, data);

        return 'saved successfully';
    } catch (err) {
        throw new Error(err);
    }
};

module.exports = { rabbitmq: connection, rabbitmqArchitecture, saveFailedJobs };
