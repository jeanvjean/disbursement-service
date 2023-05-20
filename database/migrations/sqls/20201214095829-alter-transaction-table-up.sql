/* Replace with your SQL commands */

ALTER TABLE transactions
    ADD reference VARCHAR NOT NULL,
    ADD flagged BOOLEAN DEFAULT FALSE,
    ADD flagged_at TIMESTAMPTZ DEFAULT NULL,
    ADD deny_payment BOOLEAN DEFAULT FALSE,
    ADD paid_at TIMESTAMPTZ,
    ADD customer_id VARCHAR DEFAULT NULL,
    ADD transaction_date TIMESTAMPTZ DEFAULT NULL;