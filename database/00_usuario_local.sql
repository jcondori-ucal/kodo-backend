-- Solo para MySQL local (sin Docker): crea el usuario que usa la API.
-- Mismos valores que .env / docker-compose.yml
CREATE USER IF NOT EXISTS 'kodo'@'localhost' IDENTIFIED BY 'kodo123';
CREATE USER IF NOT EXISTS 'kodo'@'%'         IDENTIFIED BY 'kodo123';
GRANT ALL PRIVILEGES ON kodo_db.* TO 'kodo'@'localhost';
GRANT ALL PRIVILEGES ON kodo_db.* TO 'kodo'@'%';
FLUSH PRIVILEGES;
