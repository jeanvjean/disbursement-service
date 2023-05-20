module.exports = {
    all: `
        SELECT * FROM applicant_replies WHERE deleted_at IS NULL
    `,
    allTotal: `
        SELECT COUNT(*) AS over_all_count FROM applicant_replies WHERE deleted_at IS NULL
    `,
    save: `
        INSERT INTO applicant_replies(phone_number, account_number, bank_name, message_text) VALUES($[phone_number], $[account_number], $[bank_name], $[message_text]) RETURNING *;
    `,
    group: (group_by) =>`
        GROUP BY ${group_by}
    `,
    attachDateRange: (start_date, end_date) => `
        AND created_at >= '${start_date}' AND WHERE created_at <= '${end_date}'
    `,
    interval: (period) => `
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '${period} days' 
    `,
    search: (s) =>`
        AND to_tsvector(LOWER(concat_ws(' ', account_number, message_text,  bank_name))) @@ plainto_tsquery(LOWER('${s}'))
    `,
}