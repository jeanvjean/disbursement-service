/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE programme_sms(
    id VARCHAR PRIMARY KEY DEFAULT 'sms-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() As varchar(50))
            , '-','')
        ),
    message_key VARCHAR NOT NULL,
    message_value VARCHAR NOT NULL,
    programme_id VARCHAR REFERENCES programmes(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
