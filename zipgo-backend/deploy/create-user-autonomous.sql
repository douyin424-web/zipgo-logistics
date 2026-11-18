-- Oracle Autonomous Database: run ONCE as ADMIN (Database actions -> SQL).
-- Replace the password first: at least 12 characters with upper case, lower case and a number.

CREATE USER zipgo IDENTIFIED BY "ChangeMe_12345";
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE VIEW TO zipgo;
-- Autonomous Database stores user data in the DATA tablespace (not USERS)
ALTER USER zipgo QUOTA UNLIMITED ON DATA;
