-- Zee Telephonics: lead storage schema (MySQL 5.7+ / MariaDB 10.3+).
-- Import once in hPanel > Databases > phpMyAdmin > select your database > Import.

CREATE TABLE IF NOT EXISTS leads (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id       CHAR(36)        NOT NULL,           -- stable id to share with a CRM
  created_at      DATETIME        NOT NULL,           -- UTC
  status          VARCHAR(20)     NOT NULL DEFAULT 'new',  -- new, contacted, qualified, won, lost, spam
  full_name       VARCHAR(120)    NOT NULL,
  company         VARCHAR(160)    NULL,
  email           VARCHAR(190)    NOT NULL,
  phone           VARCHAR(40)     NULL,
  service         VARCHAR(80)     NULL,               -- service slug from services.json
  team_size       VARCHAR(40)     NULL,
  message         TEXT            NOT NULL,
  consent         TINYINT(1)      NOT NULL DEFAULT 0,
  consent_text    VARCHAR(255)    NULL,
  source_page     VARCHAR(255)    NULL,
  utm_source      VARCHAR(120)    NULL,
  utm_medium      VARCHAR(120)    NULL,
  utm_campaign    VARCHAR(120)    NULL,
  utm_term        VARCHAR(120)    NULL,
  utm_content     VARCHAR(120)    NULL,
  ip_hash         CHAR(64)        NULL,               -- salted SHA-256, never the raw IP
  user_agent      VARCHAR(255)    NULL,
  notified_at     DATETIME        NULL,               -- when the alert email was sent
  crm_status      VARCHAR(20)     NOT NULL DEFAULT 'pending', -- pending, skipped, synced, failed
  crm_id          VARCHAR(120)    NULL,
  crm_synced_at   DATETIME        NULL,
  crm_error       VARCHAR(255)    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_leads_public_id (public_id),
  KEY idx_leads_created (created_at),
  KEY idx_leads_email (email),
  KEY idx_leads_status (status),
  KEY idx_leads_crm_status (crm_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Every submission attempt (including blocked ones), used only for rate limiting.
CREATE TABLE IF NOT EXISTS lead_attempts (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ip_hash     CHAR(64)        NOT NULL,
  created_at  DATETIME        NOT NULL,
  outcome     VARCHAR(20)     NOT NULL,   -- accepted, invalid, spam, rate_limited, error
  PRIMARY KEY (id),
  KEY idx_attempts_ip_time (ip_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
