/* Replace with your SQL commands */
ALTER TABLE whitelists
    ADD IF NOT EXISTS first_name VARCHAR DEFAULT NULL,
    ADD IF NOT EXISTS last_name VARCHAR DEFAULT NULL;