module.exports = {
    all: `
        SELECT * FROM programmes WHERE deleted_at IS NULL;
    `,
    save: `
        INSERT INTO programmes(name, flagging_duration) VALUES($[name], $[flagging_duration]) RETURNING *;
    `,
    get: `
        SELECT * FROM programmes WHERE id = $[id] AND deleted_at IS NULL LIMIT 1;
    `,
    delete: `
        UPDATE programmes SET deleted_at = NOW() WHERE id = $[id];
    `,
    update: `
        UPDATE programmes SET name = $[name], flagging_duration = $[flagging_duration] WHERE id = $[id] AND deleted_at IS NULL RETURNING *;
    `,
    allProgrammes: `
        SELECT * FROM programmes;
    `
}