/* Replace with your SQL commands */

ALTER TABLE transactions
    ADD retracted BOOLEAN DEFAULT FALSE,
    ADD retracted_at TIMESTAMPTZ DEFAULT NULL;