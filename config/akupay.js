exports.akupay = {
    sos: {
        base_uri: process.env.AKUPAY_SOS_BASE_URI,
        client_key: process.env.AKUPAY_SOS_CLIENT_KEY,
        secret_key: process.env.AKUPAY_SOS_SECRET_KEY
    },
    app: {
        base_uri: process.env.AKUPAY_BASE_URI,
        public_key: process.env.AKUPAY_PUBLIC_KEY
    },
    disburse: {
        base_uri: process.env.AKUPAY_DISBURSE_BASE_URI,
        api_key: process.env.AKUPAY_API_KEY
    }
};

