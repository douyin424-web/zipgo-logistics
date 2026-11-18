-- Run once as an admin user (SYSTEM / ADMIN) to create the ZipGo database user.
-- Change the password before running.

CREATE USER zipgo IDENTIFIED BY "Change_Me_123";
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE VIEW TO zipgo;
ALTER USER zipgo QUOTA UNLIMITED ON USERS;
