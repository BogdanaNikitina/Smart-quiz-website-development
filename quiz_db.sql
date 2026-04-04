-- Создание базы данных (выполнить просто в phpMyAdmin)
CREATE DATABASE IF NOT EXISTS `quiz_design`;
USE `quiz_design`;

-- Таблица для хранения результатов квиза
CREATE TABLE IF NOT EXISTS `quiz_results` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `room_type` VARCHAR(100) DEFAULT NULL,
    `zones` TEXT DEFAULT NULL,
    `area` INT(11) DEFAULT NULL,
    `style` VARCHAR(100) DEFAULT NULL,
    `budget` VARCHAR(100) DEFAULT NULL,
    `name` VARCHAR(255) DEFAULT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `comment` TEXT DEFAULT NULL,
    `page_url` TEXT DEFAULT NULL,
    `utm_source` VARCHAR(255) DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_phone` (`phone`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;