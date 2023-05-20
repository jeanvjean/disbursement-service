module.exports = {
    all: `
        SELECT * FROM clients;
    `,
    saveClient: `
        INSERT INTO clients(name, description, email, domain, reply_mail_to, secret_key, public_key) VALUES($[name], $[description], $[email], $[domain], $[reply_mail_to], $[secret_key], $[public_key]) RETURNING *;
    `,
    get: `
        SELECT * FROM clients WHERE id = $[id] AND deleted_at IS NULL;
    `,
    delete: `
        UPDATE clients SET deleted_at = NOW() WHERE id = $[id];
    `,
    getBySecret: `
        SELECT * FROM clients WHERE secret_key = $[secret_key] AND deleted_at IS NULL LIMIT 1;
    `,
    getClientByPublicKey: `
        SELECT * FROM clients WHERE public_key = $[public_key] AND deleted_at IS NULL LIMIT 1; 
    `,
}