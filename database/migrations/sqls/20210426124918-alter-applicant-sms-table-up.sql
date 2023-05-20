ALTER TABLE applicant_sms
    ADD IF NOT EXISTS sms_type VARCHAR NOT NULL DEFAULT 'outgoing';
