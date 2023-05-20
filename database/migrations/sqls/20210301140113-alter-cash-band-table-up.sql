/* Replace with your SQL commands */

ALTER TABLE cash_bands
    ADD programme_id VARCHAR REFERENCES programmes(id) ON DELETE CASCADE;