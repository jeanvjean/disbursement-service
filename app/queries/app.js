module.exports = {
    allFailedJobs: `
        SELECT id, worker_name, message_action, message_type, error_message, created_at, COUNT(*) OVER() AS over_all_count FROM failed_jobs 
        `,
    getFailedJobs: `
            SELECT id, worker_name, message_action, message_type, error_message, message_data FROM failed_jobs WHERE id = $[id]
        `,
    deleteFailedJob: `
            DELETE FROM failed_jobs WHERE id = $[id]
        `,
    searchFailedJobs: `
        WHERE to_tsvector(worker_name || ' ' || message_action || ' ' || message_type || ' ' || error_message) @@ plainto_tsquery($[search]) 
    `,
    createFailedJob: `
        INSERT INTO failed_jobs(worker_name, message_action, message_type, message_data, error_message) VALUES($[worker_name], $[message_action], $[message_type], $[message_data], $[error_message]) RETURNING *;
    `,
    createWebhookResponse: `
        INSERT INTO webhook_responses(phone_number, message) VALUES($[phone_number], $[message]) RETURNING *;
    `,
    createUploadError: `
        INSERT INTO upload_errors(phone_number, error_message, programme_id) VALUES($[phone_number], $[error_message], $[programme_id]) RETURNING *;
    `,
};
