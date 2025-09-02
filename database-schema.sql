-- Схема базы данных для самообучающегося ИИ Telegram бота
-- Создание базы данных
CREATE DATABASE IF NOT EXISTS ai_lawyer_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_lawyer_bot;

-- Таблица для хранения разговоров и сообщений
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    message TEXT NOT NULL,
    ai_response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    context TEXT,
    sentiment ENUM('positive', 'negative', 'neutral') DEFAULT 'neutral',
    topics VARCHAR(500),
    response_quality ENUM('high', 'medium', 'low') DEFAULT 'medium',
    response_length INT DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_sentiment (sentiment),
    INDEX idx_quality (response_quality)
) ENGINE=InnoDB;

-- Таблица для обратной связи от пользователей
CREATE TABLE feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    conversation_id BIGINT,
    feedback_type ENUM('positive', 'negative') NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,
    INDEX idx_user_id (user_id),
    INDEX idx_feedback_type (feedback_type),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Таблица для хранения профилей пользователей и их предпочтений
CREATE TABLE user_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'ru',
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    subscription_type ENUM('free', 'premium', 'unlimited') DEFAULT 'free',
    subscription_expires DATETIME,
    daily_requests_used INT DEFAULT 0,
    daily_requests_limit INT DEFAULT 5,
    preferred_topics VARCHAR(500),
    communication_style ENUM('formal', 'informal', 'professional') DEFAULT 'professional',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_user_id (user_id),
    INDEX idx_subscription_type (subscription_type),
    INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB;

-- Таблица для хранения знаний и обучающих данных
CREATE TABLE knowledge_base (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    subtopic VARCHAR(255),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords VARCHAR(500),
    relevance_score DECIMAL(3,2) DEFAULT 1.00,
    usage_count INT DEFAULT 0,
    success_rate DECIMAL(3,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    source ENUM('manual', 'learned', 'imported') DEFAULT 'manual',
    INDEX idx_topic (topic),
    INDEX idx_keywords (keywords),
    INDEX idx_relevance (relevance_score),
    INDEX idx_success_rate (success_rate),
    FULLTEXT idx_question_answer (question, answer, keywords)
) ENGINE=InnoDB;

-- Таблица для отчетов самообучения
CREATE TABLE learning_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_conversations INT DEFAULT 0,
    unique_users INT DEFAULT 0,
    top_topics TEXT,
    positive_feedback_rate DECIMAL(5,2) DEFAULT 0.00,
    negative_feedback_rate DECIMAL(5,2) DEFAULT 0.00,
    high_quality_response_rate DECIMAL(5,2) DEFAULT 0.00,
    average_response_length DECIMAL(8,2) DEFAULT 0.00,
    improvement_suggestions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_positive_rate (positive_feedback_rate)
) ENGINE=InnoDB;

-- Таблица для хранения паттернов и шаблонов ответов
CREATE TABLE response_patterns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pattern_name VARCHAR(255) NOT NULL,
    trigger_keywords VARCHAR(500) NOT NULL,
    response_template TEXT NOT NULL,
    topic VARCHAR(255),
    priority INT DEFAULT 1,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    last_used DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_topic (topic),
    INDEX idx_priority (priority),
    INDEX idx_success_rate ((success_count / (success_count + failure_count + 1))),
    FULLTEXT idx_keywords (trigger_keywords)
) ENGINE=InnoDB;

-- Таблица для логирования ошибок и системных событий
CREATE TABLE system_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_level ENUM('info', 'warning', 'error', 'critical') NOT NULL,
    component VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    details JSON,
    user_id BIGINT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_level (log_level),
    INDEX idx_component (component),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- Таблица для A/B тестирования различных подходов
CREATE TABLE ab_tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    variant ENUM('A', 'B') NOT NULL,
    test_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    test_end DATETIME,
    success_metric DECIMAL(5,2),
    feedback_score DECIMAL(3,2),
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_test_name (test_name),
    INDEX idx_user_id (user_id),
    INDEX idx_variant (variant)
) ENGINE=InnoDB;

-- Таблица для хранения интеграций с внешними сервисами
CREATE TABLE integrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255),
    configuration JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync DATETIME,
    error_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_name (service_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- Вставка начальных данных в базу знаний
INSERT INTO knowledge_base (topic, subtopic, question, answer, keywords, source) VALUES
('семейное право', 'развод', 'Как подать на развод?', 'Для подачи на развод необходимо обратиться в ЗАГС (при обоюдном согласии и отсутствии несовершеннолетних детей) или в суд (при наличии споров или детей). Требуется заявление, паспорта, свидетельство о браке, документы на детей.', 'развод, ЗАГС, суд, заявление, документы', 'manual'),

('трудовое право', 'увольнение', 'Какие выплаты полагаются при увольнении?', 'При увольнении работник имеет право на: заработную плату за отработанное время, компенсацию за неиспользованный отпуск, выходное пособие (в определенных случаях). Все выплаты должны быть произведены в день увольнения.', 'увольнение, выплаты, зарплата, компенсация, отпуск, пособие', 'manual'),

('договорное право', 'договор купли-продажи', 'Что должно быть в договоре купли-продажи?', 'Договор купли-продажи должен содержать: данные сторон, предмет договора, цену, порядок передачи товара, права и обязанности сторон, ответственность, сроки исполнения. Для недвижимости требуется нотариальное удостоверение.', 'договор, купля-продажа, цена, товар, стороны, нотариус', 'manual'),

('налоговое право', 'налоговые вычеты', 'Какие налоговые вычеты можно получить?', 'Основные налоговые вычеты: имущественный (при покупке жилья), социальный (лечение, образование), стандартный (на детей), профессиональный (для ИП). Максимальные суммы и условия регулируются НК РФ.', 'налоги, вычеты, имущественный, социальный, НК РФ', 'manual'),

('банкротство', 'физические лица', 'Как объявить себя банкротом?', 'Процедура банкротства физлица включает: подачу заявления в арбитражный суд, предоставление документов о доходах и долгах, назначение финансового управляющего, реструктуризацию долгов или реализацию имущества. Минимальная сумма долга - 500 000 рублей.', 'банкротство, физлицо, суд, долги, управляющий', 'manual');

-- Вставка шаблонов ответов
INSERT INTO response_patterns (pattern_name, trigger_keywords, response_template, topic, priority) VALUES
('Приветствие', 'привет, здравствуйте, добрый день, добро пожаловать', 'Добро пожаловать! Я ваш ИИ-юрист "Твой Друг Юрист". Готов помочь с юридическими вопросами. О чем хотели бы узнать?', 'общее', 10),

('Благодарность', 'спасибо, благодарю, помогли', 'Рад был помочь! Если возникнут еще вопросы, обращайтесь. Также могу предложить персональный юридический анализ вашей ситуации.', 'общее', 5),

('Консультация по разводу', 'развод, расторжение брака, развестись', 'Рассмотрю ваш вопрос о разводе. Для более точного ответа уточните: есть ли общие несовершеннолетние дети и согласие второй стороны на развод?', 'семейное право', 8),

('Трудовые споры', 'увольнение, зарплата, трудовой договор, работодатель', 'Помогу разобраться с трудовым вопросом. Для точной консультации опишите подробнее ситуацию и ваши отношения с работодателем.', 'трудовое право', 8);

-- Создание пользователя для n8n
CREATE USER IF NOT EXISTS 'n8n_user'@'localhost' IDENTIFIED BY 'secure_n8n_password_2024';
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_lawyer_bot.* TO 'n8n_user'@'localhost';
FLUSH PRIVILEGES;

-- Создание представлений для аналитики
CREATE VIEW daily_stats AS
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_messages,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(response_length) as avg_response_length,
    SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) / COUNT(*) * 100 as positive_rate
FROM conversations 
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(timestamp)
ORDER BY date DESC;

CREATE VIEW user_activity_summary AS
SELECT 
    up.user_id,
    up.username,
    up.subscription_type,
    COUNT(c.id) as total_conversations,
    MAX(c.timestamp) as last_conversation,
    AVG(CASE WHEN f.feedback_type = 'positive' THEN 1 WHEN f.feedback_type = 'negative' THEN 0 END) as satisfaction_score
FROM user_profiles up
LEFT JOIN conversations c ON up.user_id = c.user_id
LEFT JOIN feedback f ON c.id = f.conversation_id
GROUP BY up.user_id, up.username, up.subscription_type;

CREATE VIEW knowledge_effectiveness AS
SELECT 
    kb.topic,
    kb.subtopic,
    COUNT(kb.id) as total_entries,
    AVG(kb.success_rate) as avg_success_rate,
    SUM(kb.usage_count) as total_usage
FROM knowledge_base kb
WHERE kb.is_active = TRUE
GROUP BY kb.topic, kb.subtopic
ORDER BY avg_success_rate DESC, total_usage DESC;

-- Триггеры для автоматического обновления статистики
DELIMITER //

CREATE TRIGGER update_user_activity 
AFTER INSERT ON conversations
FOR EACH ROW
BEGIN
    INSERT INTO user_profiles (user_id, username, first_name, last_name, last_activity)
    VALUES (NEW.user_id, NEW.username, NEW.first_name, NEW.last_name, NEW.timestamp)
    ON DUPLICATE KEY UPDATE
        last_activity = NEW.timestamp,
        username = COALESCE(NEW.username, username),
        first_name = COALESCE(NEW.first_name, first_name),
        last_name = COALESCE(NEW.last_name, last_name);
END//

CREATE TRIGGER update_knowledge_usage
AFTER INSERT ON conversations
FOR EACH ROW
BEGIN
    UPDATE knowledge_base 
    SET usage_count = usage_count + 1
    WHERE MATCH(question, answer, keywords) AGAINST(NEW.message IN NATURAL LANGUAGE MODE)
    LIMIT 1;
END//

CREATE TRIGGER calculate_pattern_success
AFTER INSERT ON feedback
FOR EACH ROW
BEGIN
    IF NEW.feedback_type = 'positive' THEN
        UPDATE response_patterns rp
        JOIN conversations c ON c.id = NEW.conversation_id
        SET rp.success_count = rp.success_count + 1
        WHERE MATCH(rp.trigger_keywords) AGAINST(c.message IN NATURAL LANGUAGE MODE)
        LIMIT 1;
    ELSE
        UPDATE response_patterns rp
        JOIN conversations c ON c.id = NEW.conversation_id
        SET rp.failure_count = rp.failure_count + 1
        WHERE MATCH(rp.trigger_keywords) AGAINST(c.message IN NATURAL LANGUAGE MODE)
        LIMIT 1;
    END IF;
END//

DELIMITER ;

-- Индексы для оптимизации производительности
CREATE INDEX idx_conversations_user_timestamp ON conversations(user_id, timestamp);
CREATE INDEX idx_feedback_conversation_type ON feedback(conversation_id, feedback_type);
CREATE INDEX idx_user_profiles_activity ON user_profiles(last_activity, subscription_type);
CREATE INDEX idx_knowledge_topic_success ON knowledge_base(topic, success_rate DESC);

-- Процедуры для очистки старых данных
DELIMITER //

CREATE PROCEDURE CleanOldData()
BEGIN
    -- Удаляем разговоры старше 6 месяцев для free пользователей
    DELETE c FROM conversations c
    JOIN user_profiles up ON c.user_id = up.user_id
    WHERE c.timestamp < DATE_SUB(NOW(), INTERVAL 6 MONTH)
    AND up.subscription_type = 'free';
    
    -- Удаляем системные логи старше 3 месяцев
    DELETE FROM system_logs 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL 3 MONTH)
    AND log_level IN ('info', 'warning');
    
    -- Архивируем неактивные знания
    UPDATE knowledge_base 
    SET is_active = FALSE
    WHERE usage_count = 0 
    AND created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
END//

DELIMITER ;

-- Создание события для автоматической очистки (выполняется еженедельно)
CREATE EVENT IF NOT EXISTS weekly_cleanup
ON SCHEDULE EVERY 1 WEEK
STARTS CURRENT_TIMESTAMP
DO CALL CleanOldData();








