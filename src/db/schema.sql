-- ====================================================================
-- LMS ВУЗ: Схема реляционной базы данных MySQL 8.0+
-- Цифровое рабочее место преподавателя (ППС) и система авторизации
-- Соответствие требованиям ФГОС ВО 3++, ФЗ-152 «О персональных данных»
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `lms_university` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `lms_university`;

-- 1. Таблица пользователей системы и учетных записей (Авторизация)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `role` ENUM('teacher', 'head_of_department', 'admin', 'student') NOT NULL DEFAULT 'teacher',
  `department` VARCHAR(255) NOT NULL DEFAULT 'Кафедра программной инженерии',
  `academic_degree` VARCHAR(120) NULL DEFAULT 'Преподаватель',
  `avatar_url` TEXT NULL,
  `record_book_number` VARCHAR(64) NULL,
  `group_name` VARCHAR(64) NULL,
  `phone` VARCHAR(32) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Таблица студенческих групп
CREATE TABLE IF NOT EXISTS `academic_groups` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `code` VARCHAR(64) NOT NULL UNIQUE,
  `faculty` VARCHAR(191) NOT NULL,
  `specialty_code` VARCHAR(64) NOT NULL, -- например '09.03.04'
  `specialty_name` VARCHAR(255) NOT NULL,
  `year_of_admission` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Таблица дисциплин / учебных курсов
CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `code` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `semester` VARCHAR(128) NOT NULL,
  `faculty` VARCHAR(191) NOT NULL,
  `total_hours` INT NOT NULL DEFAULT 144,
  `lecture_hours` INT NOT NULL DEFAULT 36,
  `practice_hours` INT NOT NULL DEFAULT 36,
  `lab_hours` INT NOT NULL DEFAULT 36,
  `teacher_id` VARCHAR(36) NOT NULL,
  `syllabus_url` VARCHAR(255) NULL,
  `is_kum_approved` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Связь курсов и академических групп
CREATE TABLE IF NOT EXISTS `course_groups` (
  `course_id` VARCHAR(36) NOT NULL,
  `group_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`course_id`, `group_id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Электронный журнал: посещаемость занятий
CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `course_id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `lesson_date` DATE NOT NULL,
  `lesson_type` VARCHAR(64) NOT NULL,
  `status` ENUM('present', 'absent', 'excused', 'late') NOT NULL DEFAULT 'present',
  `note` VARCHAR(255) NULL,
  `updated_by` VARCHAR(36) NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_attendance` (`course_id`, `student_id`, `lesson_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Контрольные точки БРС (Балльно-рейтинговая система)
CREATE TABLE IF NOT EXISTS `grade_items` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `course_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('current', 'milestone', 'term_paper', 'exam') NOT NULL DEFAULT 'current',
  `max_points` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  `weight_percent` INT NOT NULL DEFAULT 10,
  `due_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Оценки студентов по контрольным точкам БРС
CREATE TABLE IF NOT EXISTS `student_grades` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `student_id` VARCHAR(36) NOT NULL,
  `grade_item_id` VARCHAR(36) NOT NULL,
  `points` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `updated_by` VARCHAR(36) NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`grade_item_id`) REFERENCES `grade_items`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_student_grade` (`student_id`, `grade_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Загруженные студенческие работы и Антиплагиат
CREATE TABLE IF NOT EXISTS `submissions` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `course_id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `assignment_title` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(32) NOT NULL,
  `version` INT NOT NULL DEFAULT 1,
  `status` ENUM('submitted', 'graded', 'revision_needed') NOT NULL DEFAULT 'submitted',
  `score` DECIMAL(5,2) NULL,
  `max_score` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  `antiplagiat_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `antiplagiat_status` ENUM('passed', 'review_required', 'rejected') NOT NULL DEFAULT 'passed',
  `feedback` TEXT NULL,
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Экзаменационные и зачетные ведомости с ЭЦП
CREATE TABLE IF NOT EXISTS `exam_statements` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `statement_number` VARCHAR(64) NOT NULL UNIQUE,
  `course_id` VARCHAR(36) NOT NULL,
  `group_name` VARCHAR(64) NOT NULL,
  `control_type` ENUM('Экзамен', 'Дифференцированный зачет', 'Зачет') NOT NULL DEFAULT 'Экзамен',
  `academic_year` VARCHAR(32) NOT NULL DEFAULT '2025/2026',
  `semester` VARCHAR(32) NOT NULL DEFAULT 'Весенний',
  `date` DATE NOT NULL,
  `is_signed` TINYINT(1) NOT NULL DEFAULT 0,
  `signed_at` DATETIME NULL,
  `signed_by` VARCHAR(255) NULL,
  `signature_hash` VARCHAR(128) NULL,
  `certificate_serial` VARCHAR(64) NULL,
  `status` ENUM('draft', 'ready_to_sign', 'signed_locked', 'archived') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Журнал аудита действий (ФЗ-152 / Безопасность)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(64) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `target` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  `details` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_logs_action` (`action`),
  INDEX `idx_audit_logs_timestamp` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
