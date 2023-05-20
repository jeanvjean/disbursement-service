module.exports = {
    create: `
        INSERT INTO applicant_sms(
            source, sms_from, sms_to, sms_content, message_id, delivery_status, sms_type 
        ) VALUES (
            $[source], $[from], $[to], $[sms_content], $[message_id], $[delivery_status], $[sms_type]
        ) RETURNING *
    `,
    getPendingSmsBySource: `
        SELECT * FROM applicant_sms WHERE source = $[source] AND  delivery_status = 'pending' AND message_id IS NOT NULL AND deleted_at IS NULL;
    `,
    getSmsLogs: `
        SELECT
            *
        FROM applicant_sms as aps
        WHERE aps.deleted_at IS NULL
    `,
    
    getSmsLogsByType: `
        SELECT
            *
        FROM applicant_sms as aps
        WHERE aps.deleted_at IS NULL AND aps.sms_type = $[sms_type]
    `,

    getSmsLogsTotal: `
        SELECT 
        COUNT(*)::integer AS over_all_count
        FROM applicant_sms as aps
        WHERE aps.deleted_at IS NULL
    `,

    getSmsLogsTotalByType: `
        SELECT 
            COUNT(*)::integer AS over_all_count
            FROM applicant_sms as aps
        WHERE aps.deleted_at IS NULL AND aps.sms_type = $[sms_type]
    `,

    updateByMessageId: `
        UPDATE 
            applicant_sms
        SET 
            updated_at = NOW(),
            delivery_status = $[delivery_status]
        WHERE message_id = $[message_id]
    `,
    searchPatchQuery: `
        AND to_tsvector(LOWER(concat_ws(' ', sms_from, sms_to, source, message_id ))) @@ plainto_tsquery(LOWER($[s]))
    `,
}



