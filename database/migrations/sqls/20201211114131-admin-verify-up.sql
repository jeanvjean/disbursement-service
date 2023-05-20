/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE admin_verify(
    id VARCHAR PRIMARY KEY DEFAULT 'admin-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() As varchar(50))
            , '-','')
        ),
    is_verified BOOLEAN DEFAULT FALSE,
    amount  NUMERIC NOT NULL,
    whitelist_id VARCHAR REFERENCES whitelists(id),
    last_paid_date TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);