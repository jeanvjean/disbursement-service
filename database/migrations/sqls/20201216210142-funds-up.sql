/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE funds(
    id VARCHAR PRIMARY KEY DEFAULT 'fund-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() As varchar(50))
            , '-','')
        ),
    amount  NUMERIC NOT NULL,
    project_name VARCHAR,
    bank_name VARCHAR,
    account_number INTEGER,
    account_name VARCHAR,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);