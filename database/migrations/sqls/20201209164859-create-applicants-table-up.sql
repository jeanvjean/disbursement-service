/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE applicants(
    id VARCHAR PRIMARY KEY DEFAULT 'applicant-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() As varchar(50))
            , '-','')
        ),
    phone_number VARCHAR,
    amount NUMERIC DEFAULT '0',
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    state VARCHAR DEFAULT NULL,
    lga VARCHAR DEFAULT NULL,
    state_of_residence VARCHAR DEFAULT NULL,
    lga_of_residence VARCHAR DEFAULT NULL,
    bank_name VARCHAR DEFAULT NULL,
    bank_account_number VARCHAR DEFAULT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);