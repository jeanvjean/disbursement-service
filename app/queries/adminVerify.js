module.exports = {
    create: `
        INSERT INTO admin_verify(
            whitelist_id, amount, last_paid_date
        ) VALUES (
            $[whitelist_id], $[amount], $[last_paid_date]
        ) RETURNING *
    `
}