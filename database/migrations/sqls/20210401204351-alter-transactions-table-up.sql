/* Replace with your SQL commands */

ALTER TABLE transactions 
    ADD IF NOT EXISTS sos_transaction_id VARCHAR DEFAULT NULL;