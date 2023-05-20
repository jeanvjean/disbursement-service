/* Replace with your SQL commands */

ALTER TABLE funds
    ADD programme_id VARCHAR REFERENCES programmes(id) ON DELETE CASCADE;