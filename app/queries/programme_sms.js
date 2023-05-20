module.exports = {
    all: `
        SELECT * FROM programme_sms;
    `,
    save: `
        INSERT INTO programme_sms(programme_id, message_key, message_value) VALUES($[programme_id], $[message_key], $[message_value]) RETURNING *;
    `,
    get: `
        SELECT * FROM programme_sms WHERE id = $[id] AND deleted_at IS NULL;
    `,
    delete: `
        UPDATE programme_sms SET deleted_at = NOW() WHERE id = $[id];
    `,
    update: `
        UPDATE programme_sms SET message_value = $[message_value] WHERE id = $[id] RETURNING *;
    `,
    getMessage: 'SELECT * FROM programme_sms WHERE programme_id = $[programme_id] AND message_key = $[message_key]  AND deleted_at IS NULL LIMIT 1;',
    getMessageByProgramme: 'SELECT * FROM programme_sms WHERE programme_id = $[programme_id] AND deleted_at IS NULL;'
};
