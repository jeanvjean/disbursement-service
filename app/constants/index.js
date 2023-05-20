module.exports = {
    CRON: {
        DEVELOPMENT: '* * * * *',
        PRODUCTION: '0 0 0 * * *'
    },
    SMS_CRON: {
        DEVELOPMENT: '* * * * *',
        PRODUCTION: '* * * * *'
    },
    SMS_PROVIDER: {
        AFRICALSTALKING: 'africastalking',
        SMS1960: 'sms1960',
        INFOBIP: 'infobip',
    },
    SMS_DEFAULT_STATUS: 'pending',
    SUCCESS_CODE: '00',
    ERROR_CODE: {
        INVALID_WHITELIST: '01',
        INVALID_TRANSACTION: '02',
        TRANSACTION_FLAGGED: '07',
        INVALID_AMOUNT_CASHBBAND: '03',
        ACCOUNT_RESOLVE_ERROR: '08',
        TRANSACTION_NOT_TODAY: '09',
        UNKNOWN_ERROR: '20'
    },
    SMS_OUTGOING_TYPE: 'outgoing',
    SMS_INCOMING_TYPE: 'incoming',
    ACCEPTED_DELIVERY_STATUS: ['DELIVRD', 'DELIVERED', 'SUCCESS', 'SUCCESSFUL'],
    SMS_SUCCESS_STATUS: 'delivered',
    SMS_FAILED_STATUS: 'failed',
    RESPONSE_CODE_TO_RETRY: ['1100', '1004'],
    GAPS_RESPONSE_CODE: {
        REQUERY: '1100',
    }
}