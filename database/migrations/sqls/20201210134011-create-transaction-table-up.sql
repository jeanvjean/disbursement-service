/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE transactions(
    id VARCHAR PRIMARY KEY DEFAULT 'transaction-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() As varchar(50))
            , '-','')
        ),
    status VARCHAR DEFAULT 'pending',
    account_number VARCHAR,
    account_name VARCHAR,
    bank_name VARCHAR,
    amount  NUMERIC NOT NULL,
    whitelist_id VARCHAR REFERENCES whitelists(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);