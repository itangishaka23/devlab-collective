-- DevLab Collective database schema v2 (MySQL / MariaDB — XAMPP compatible)
-- Import via phpMyAdmin (Import tab) or run: npm run db:init
-- Safe to re-run: tables use IF NOT EXISTS; initDb.js also adds any new columns to a v1 database.

CREATE DATABASE IF NOT EXISTS devlab_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE devlab_db;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','member') NOT NULL DEFAULT 'member',
  bio           VARCHAR(500) NULL,
  github        VARCHAR(100) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug           VARCHAR(120) NOT NULL UNIQUE,
  title          VARCHAR(150) NOT NULL,
  tag            VARCHAR(50)  NOT NULL,
  icon           VARCHAR(60)  NOT NULL DEFAULT 'bi-code-slash',
  blurb          VARCHAR(500) NOT NULL,
  description    TEXT NULL,                            -- long description (markdown)
  stack          LONGTEXT NOT NULL,                    -- JSON array of strings
  roadmap        LONGTEXT NULL,                        -- JSON array [{ title, done }]
  progress       TINYINT UNSIGNED NOT NULL DEFAULT 0,  -- 0-100
  milestone      VARCHAR(80) NOT NULL DEFAULT '',
  status         VARCHAR(50) NOT NULL DEFAULT 'In development',
  art            VARCHAR(10) NOT NULL DEFAULT 'a1',
  lead           VARCHAR(100) NULL,
  github_repo    VARCHAR(120) NULL,                    -- "owner/repo"
  demo_url       VARCHAR(255) NULL,
  interest_count INT UNSIGNED NOT NULL DEFAULT 0,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_interests (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NULL,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_project_email (project_id, email),
  CONSTRAINT fk_interest_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS posts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(160) NOT NULL UNIQUE,
  title        VARCHAR(200) NOT NULL,
  excerpt      VARCHAR(500) NOT NULL,
  category     VARCHAR(50)  NOT NULL,
  icon         VARCHAR(60)  NOT NULL DEFAULT 'bi-journal-code',
  art          VARCHAR(10)  NOT NULL DEFAULT 'a1',
  published_at DATE NOT NULL,
  read_time    VARCHAR(30) NOT NULL DEFAULT '5 min read',
  author       LONGTEXT NOT NULL,                      -- JSON object
  tags         LONGTEXT NOT NULL,                      -- JSON array
  body         LONGTEXT NOT NULL,                      -- legacy JSON blocks ('[]' when markdown is used)
  content      LONGTEXT NULL,                          -- markdown article text
  published    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_posts_category (category),
  INDEX idx_posts_published (published_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS comments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id     INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NULL,
  author_name VARCHAR(100) NOT NULL,
  body        TEXT NOT NULL,
  status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comments_post (post_id, status),
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_reactions (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id    INT UNSIGNED NOT NULL,
  type       VARCHAR(20) NOT NULL,
  voter_key  VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_reaction (post_id, type, voter_key),
  CONSTRAINT fk_reactions_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS faqs (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category   VARCHAR(40) NOT NULL,
  question   VARCHAR(300) NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  INDEX idx_faqs_category (category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(160) NOT NULL,
  type        VARCHAR(40) NOT NULL DEFAULT 'Workshop',
  description TEXT NOT NULL,
  location    VARCHAR(150) NOT NULL DEFAULT 'Software Engineering Lab',
  starts_at   DATETIME NOT NULL,
  ends_at     DATETIME NULL,
  capacity    INT UNSIGNED NOT NULL DEFAULT 0,         -- 0 = unlimited
  icon        VARCHAR(60) NOT NULL DEFAULT 'bi-calendar-event-fill',
  art         VARCHAR(10) NOT NULL DEFAULT 'a1',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_events_start (starts_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_registrations (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id   INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NULL,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_event_email (event_id, email),
  CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name               VARCHAR(100) NOT NULL,
  email              VARCHAR(150) NOT NULL,
  phone              VARCHAR(40) NULL,
  track              VARCHAR(60) NOT NULL,
  level              VARCHAR(30) NOT NULL,
  skills             VARCHAR(300) NULL,
  availability_hours TINYINT UNSIGNED NOT NULL DEFAULT 6,
  github             VARCHAR(150) NULL,
  motivation         TEXT NOT NULL,
  status             ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_note         VARCHAR(500) NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_applications_status (status),
  INDEX idx_applications_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reports (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  subtitle   VARCHAR(300) NOT NULL DEFAULT '',
  year       SMALLINT UNSIGNED NULL,
  file_name  VARCHAR(120) NULL,                        -- stored file in uploads/reports
  size_bytes INT UNSIGNED NOT NULL DEFAULT 0,
  downloads  INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gallery_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(150) NOT NULL,
  caption    VARCHAR(300) NOT NULL DEFAULT '',
  image_file VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS team_members (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  role       VARCHAR(100) NOT NULL,
  photo_file VARCHAR(120) NULL,
  github     VARCHAR(150) NULL,
  linkedin   VARCHAR(150) NULL,
  x_handle   VARCHAR(150) NULL,
  color_a    VARCHAR(9) NOT NULL DEFAULT '#1b6fd1',
  color_b    VARCHAR(9) NOT NULL DEFAULT '#0f4c9e',
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  subject    VARCHAR(150) NOT NULL DEFAULT 'Other',
  message    TEXT NOT NULL,
  status     ENUM('new','read','archived') NOT NULL DEFAULT 'new',
  ip_address VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subscribers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  source     VARCHAR(40) NOT NULL DEFAULT 'website',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Finished projects that are live on the internet (posted by the admin; shown in the "Hosted projects" showcase)
CREATE TABLE IF NOT EXISTS hosted_projects (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(160) NOT NULL UNIQUE,
  title           VARCHAR(150) NOT NULL,
  summary         VARCHAR(500) NOT NULL,
  description     TEXT NULL,
  live_url        VARCHAR(255) NOT NULL,
  repo_url        VARCHAR(255) NULL,
  tech            LONGTEXT NOT NULL,                   -- JSON array of strings
  category        VARCHAR(50) NOT NULL DEFAULT 'Web App',
  screenshot_file VARCHAR(120) NULL,                   -- stored file in uploads/hosted
  launched_at     DATE NULL,
  featured        TINYINT(1) NOT NULL DEFAULT 0,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
