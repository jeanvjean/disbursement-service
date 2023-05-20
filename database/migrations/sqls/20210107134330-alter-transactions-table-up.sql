/* Replace with your SQL commands */

ALTER TABLE transactions
    ADD response_code VARCHAR DEFAULT NULL,
    ADD response_message VARCHAR DEFAULT NULL;