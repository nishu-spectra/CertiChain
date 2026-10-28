CREATE DATABASE IF NOT EXISTS certichain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE certichain;
CREATE TABLE IF NOT EXISTS institutions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  institution_name VARCHAR(180) NOT NULL,
  email VARCHAR(254) NOT NULL,
  contact VARCHAR(30) NOT NULL,
  wallet_address CHAR(42) NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_institutions_email (email),
  UNIQUE KEY uq_institutions_wallet (wallet_address)
) ENGINE=InnoDB;


-- ALTER TABLE institutions
-- ADD COLUMN contact VARCHAR(30) NOT NULL DEFAULT '';