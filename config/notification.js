exports.notification = {
    base_uri: process.env.NOTIFICATION_BASE_URI,
    api_key: process.env.NOTIFICATION_API_KEY,
    public_key: process.env.NOTIFICATION_PUBLIC_KEY,
    email: {
        from_mail: process.env.MAIL_FROM_EMAIL,
        from_name: process.env.MAIL_FROM_NAME
    }
};
