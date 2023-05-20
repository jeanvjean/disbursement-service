/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE applicant_sms(
    id VARCHAR PRIMARY KEY DEFAULT 'applicant-sms-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() As varchar(50))
            , '-','')
        ),
    source VARCHAR NOT NULL,
    sms_from VARCHAR DEFAULT NULL,
    sms_to VARCHAR DEFAULT NULL,
    sms_content VARCHAR DEFAULT NULL,
    delivery_status VARCHAR DEFAULT 'pending',
    message_id VARCHAR,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
