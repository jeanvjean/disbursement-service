 module.exports = {
     cardReports:`
        SELECT  
            COALESCE(SUM(amount), 0)::numeric AS total_funding
        FROM funds as f
    `,
    interval: (period) => `
         WHERE f.created_at > CURRENT_TIMESTAMP - INTERVAL '${period} days' 
    `,
    intervalAnd: (period) => `
         AND f.created_at > CURRENT_TIMESTAMP - INTERVAL '${period} days' 
    `,
    create: `
        INSERT INTO funds( amount, funded_at, programme_id) VALUES ($[amount], $[funded_at], $[programme_id]) RETURNING *
    `,
    getFunding: `
        SELECT f.created_at AS created_at, p.id AS programme_id, p.name AS programme_name, amount, f.id AS id, funded_at 
        FROM funds as f
        INNER JOIN programmes AS p 
        ON f.programme_id = p.id
    `,
    getFundingTotal: `
        SELECT count(*) as over_all_count 
        FROM funds as f
        INNER JOIN programmes AS p 
        ON f.programme_id = p.id
    `
}