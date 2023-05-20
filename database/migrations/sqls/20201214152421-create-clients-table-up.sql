/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE clients(
    id VARCHAR PRIMARY KEY DEFAULT 'client-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() As varchar(50))
            , '-','')
        ),
    name VARCHAR NOT NULL,
    description TEXT,
    email VARCHAR,
    domain VARCHAR,
    reply_mail_to VARCHAR,
    secret_key VARCHAR NOT NULL,
    public_key VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    approved VARCHAR,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);