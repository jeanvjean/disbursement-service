module.exports = {
    getAllUploadErrors: `
        SELECT phone_number, ue.id, error_message, ue.created_at, p.name AS programme_name
        FROM upload_errors as ue
        INNER JOIN programmes AS p
        ON p.id = ue.programme_id
    `,
    getAllUploadErrorsTotal: `
        SELECT
            count(*) as over_all_count
        FROM upload_errors as ue
        INNER JOIN programmes AS p
        ON p.id = ue.programme_id
    `,
    getAllWebhookResponse: `
        SELECT phone_number, id, message, created_at FROM webhook_responses as wr
    `,
    getAllWebhookResponseTotal: `
        SELECT count(*) as over_all_count FROM webhook_responses as wr
    `,
}