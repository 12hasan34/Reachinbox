-- Email Scheduler schema for MySQL 8

-- Campaigns table: stores subject, body, start time, and delay between emails
CREATE TABLE IF NOT EXISTS email_campaigns (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  delay_between_emails INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Emails table: stores each recipient email with its campaign, scheduled time, and status
CREATE TABLE IF NOT EXISTS emails (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP NULL,
  status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
  unique_key VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_sent_at (sent_at),
  UNIQUE KEY unique_key (unique_key)
);
