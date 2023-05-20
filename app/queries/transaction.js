module.exports = {
    validateTime: `
        SELECT id FROM transactions 
        WHERE  phone_number = $[phone_number] AND 
        paid_at >= DATEADD(day, $[range], GETDATE())
        LIMIT 1
    `,
    update: `
        UPDATE 
            transactions
        SET 
            transaction_date = NOW(),
            status = 'paid',
            response_code = $[response_code],
            response_message = $[response_message]
        WHERE id = $[id]
    `,
    updateDisburseTransaction: `
        UPDATE 
            transactions
        SET 
            transaction_date = NOW(),
            status = $[status],
            response_code = $[response_code],
            response_message = $[response_message],
            account_number = $[account_number],
            account_name = $[account_name],
            bank_name = $[bank_name],
            bank_code = $[bank_code],
            sos_transaction_id = $[sos_transaction_id]
        WHERE id = $[id]
    `,
    updateUploadedDisburseTransaction: `
        UPDATE 
            transactions
        SET 
            transaction_date = NOW(),
            status = $[status],
            response_code = $[response_code],
            response_message = $[response_message],
            account_number = $[account_number],
            account_name = $[account_name],
            bank_name = $[bank_name],
            bank_code = $[bank_code],
            sos_transaction_id = $[sos_transaction_id],
            channel = $[channel]
        WHERE id = $[id]
    `,
    updateDisburseFlaggedTransaction: `
        UPDATE 
            transactions
        SET 
            transaction_date = NOW(),
            status = $[status],
            response_code = $[response_code],
            response_message = $[response_message],
            account_number = $[account_number],
            account_name = $[account_name],
            bank_name = $[bank_name],
            flagged = 'FALSE'
        WHERE id = $[id]
    `,
    flag: `
        UPDATE 
            transactions
        SET
            flagged = TRUE,
            deny_payment = TRUE,
            flagged_at = NOW(),
            account_number = $[account_number],
            account_name = $[account_name],
            bank_name = $[bank_name],
            bank_code= $[bank_code],
            status = 'not_paid',
            sos_transaction_id = $[sos_transaction_id]
        WHERE id = $[id]
    `,
    create: `
        INSERT INTO transactions(whitelist_id, amount, reference, paid_at, programme_id) VALUES ($[whitelist_id], $[amount], $[reference], $[paid_at], $[programme_id]) RETURNING *
    `,
    getLastUnpaidByPhoneNumber: `
        SELECT amount, reference, paid_at, created_at, transaction_date
        FROM transactions
        WHERE deleted_at IS NULL AND whitelist_id = $[whitelist_id] WHERE status = 'not_paid' ORDER BY created_at DESC LIMIT 1
    `,
    getLastUnpaidByPhoneNumberAndStatus: `
        SELECT id, amount, reference, paid_at, created_at, transaction_date, programme_id
        FROM transactions
        WHERE deleted_at IS NULL AND whitelist_id = $[whitelist_id] AND status = $[status] ORDER BY created_at DESC LIMIT 1
    `,
    getLastWhitlistPaidDate: `
        SELECT amount, reference, paid_at, created_at, transaction_date
        FROM transactions
        WHERE deleted_at IS NULL AND whitelist_id = $[whitelist_id] WHERE status = 'paid' ORDER BY created_at DESC LIMIT 1
    `,
    all: `
        SELECT 
            *, t.id AS id, p.name AS programme_name, w.phone_number AS phone_number 
        FROM transactions AS t 
        INNER JOIN programmes AS p
        ON p.id = t.programme_id
        INNER JOIN whitelists AS w
        ON w.id = t.whitelist_id
        WHERE t.deleted_at IS NULL
    `,
    allTotal: `
        SELECT COUNT(*) AS over_all_count FROM transactions AS t WHERE deleted_at IS NULL
    `,
    get: `
        SELECT * FROM transactions WHERE deleted_at IS NULL AND id = $[id] LIMIT 1
    `,
    getBySosTransaction: `
        SELECT * FROM transactions WHERE deleted_at IS NULL AND sos_transaction_id = $[sos_transaction_id] LIMIT 1
    `,
    getAplicantsForPayment: `
        SELECT id, amount, reference, account_name, bank_name, account_number
            FROM transactions 
            WHERE deleted_at IS NULL AND paid_at <= $[time] AND status = 'disbursed' AND 
            flagged = 'false' AND deny_payment = 'false' AND 
            retracted IS FALSE AND account_number IS NOT NULL
    `,
    updateProcessTransaction: `
        UPDATE 
            transactions
        SET
        status = 'processing'
        WHERE id = $[id]
    `,

    cardReports:`
        SELECT 
            COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'paid'), 0)::integer AS cashed_out,
            COALESCE(SUM(amount) FILTER (WHERE t.status = 'paid'), 0)::numeric AS cashed_out_amount,
            COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'disbursed'), 0)::integer AS disbursed,
            COALESCE(SUM(amount) FILTER (WHERE t.status = 'disbursed'), 0)::numeric AS disbursed_amount,
             COALESCE(COUNT(t.id) FILTER (WHERE t.retracted IS TRUE), 0)::integer AS retracted,
             COALESCE(SUM(amount) FILTER (WHERE t.retracted IS TRUE), 0)::numeric AS retracted_amount
        FROM transactions as t
    `,
    interval: (period) => `
         WHERE t.created_at > CURRENT_TIMESTAMP - INTERVAL '${period} days' 
    `,
    intervalAnd: (period) => `
         AND t.created_at > CURRENT_TIMESTAMP - INTERVAL '${period} days' 
    `,
    search: `
        AND to_tsvector(LOWER(concat_ws(' ', account_number, account_name,  bank_name))) @@ plainto_tsquery(LOWER($[s]))
    `,
    getRetract: `
       SELECT id, amount, reference, account_name, bank_name, account_number
            FROM transactions as t
           WHERE deleted_at IS NULL AND t.created_at > CURRENT_TIMESTAMP - INTERVAL '90 days' 
           AND status = 'pending' AND flagged = 'false' 
           AND deny_payment = 'false' AND account_number IS NULL 
    `,

     updateRetractTransaction: `
        UPDATE 
            transactions
        SET
        retracted = 'true', retracted_at = NOW()
        WHERE id = $[id]
    `,

    getDisbursement: `
        SELECT amount,
            COALESCE(COUNT(t.id), 0)::integer AS beneficiaries,
            COALESCE(SUM(amount), 0)::numeric AS disbursed_amount
        FROM transactions as t
        WHERE deleted_at IS NULL AND t.status = 'disbursed'
    `,

    getDisbursementTotal: `
    SELECT 
        COALESCE(COUNT(DISTINCT(whitelist_id)), 0)::integer AS total_unique_disburse,
        COALESCE(COUNT(whitelist_id), 0)::integer AS total_disburse,
        COALESCE(SUM(amount), 0)::integer AS total_sum_disburse
    FROM transactions as t
    WHERE deleted_at IS NULL AND t.status = 'disbursed'
    `,

    getCashout: `
        SELECT amount,
            COALESCE(COUNT(t.id), 0)::integer AS beneficiaries,
            COALESCE(SUM(amount), 0)::numeric AS disbursed_amount
        FROM transactions as t
        WHERE deleted_at IS NULL AND t.status = 'paid'
    `,
    getCashoutTotal: `
        SELECT 
            COALESCE(COUNT(DISTINCT(whitelist_id)), 0)::integer AS total_unique_cashed_out,
            COALESCE(COUNT(whitelist_id), 0)::integer AS total_cash_out,
            COALESCE(SUM(amount), 0)::integer AS total_sum_cash_out
        FROM transactions as t
        WHERE deleted_at IS NULL AND t.status = 'paid'
    `,
    getRetracted: `
        SELECT amount,
            COALESCE(COUNT(t.id), 0)::integer AS beneficiaries,
            COALESCE(SUM(amount), 0)::numeric AS disbursed_amount
        FROM transactions as t
        WHERE deleted_at IS NULL AND t.retracted = true
    `,
    getRetractedTotal: `
        SELECT
            COALESCE(COUNT(DISTINCT(whitelist_id)), 0)::integer AS total_unique_retracted,
            COALESCE(COUNT(whitelist_id), 0)::integer AS total_retracted,
            COALESCE(SUM(amount), 0)::integer AS total_sum_retracted
        FROM transactions as t
        WHERE deleted_at IS NULL AND t.retracted = true
    `,
    group: (group_by) =>`
        GROUP BY ${group_by}
    `,
    attachDateRange: (start_date, end_date) => `
        AND t.created_at >= '${start_date}' AND WHERE t.created_at <= '${end_date}'
    `,
    updateStatusToDisbursed: `
        UPDATE transactions SET status = 'disbursed' WHERE id = $[id];
    `,
    getFullTransactionDetails: `
        SELECT *, p.name AS programme_name FROM transactions AS t 
        INNER JOIN whitelists AS w
        ON w.id = t.whitelist_id
        INNER JOIN programmes AS p
        ON p.id = t.programme_id
        WHERE t.deleted_at IS NULL AND t.id = $[id] LIMIT 1;
    `,
    updateSosTransactionId: `
        UPDATE transactions SET sos_transaction_id = $[sos_transaction_id]
        WHERE id = $[id]
    `
}