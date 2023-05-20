/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE failed_jobs(
    id VARCHAR PRIMARY KEY DEFAULT 'job-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() As varchar(50))
            , '-','')
        ),
    worker_name VARCHAR,
    message_action VARCHAR,
    message_type VARCHAR,
    message_data JSON,
    error_message VARCHAR,
    options TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);