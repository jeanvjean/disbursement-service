module.exports = {
    get: `
        SELECT * FROM whitelists 
        WHERE phone_number = $[phone_number]  
        LIMIT 1
    `,

    getById: `
        SELECT * FROM whitelists 
        WHERE id = $[id]  
        LIMIT 1
    `,

    findById: `
        SELECT * FROM whitelists 
        WHERE  id = $[id]  
        LIMIT 1
    `,

    create: `
        INSERT INTO whitelists(phone_number, bvn, first_name, last_name) VALUES($[phone_number], $[bvn], $[first_name], $[last_name]) RETURNING *
    `
}