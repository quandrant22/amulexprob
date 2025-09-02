/**
 * Система памяти разговоров для самообучающегося ИИ бота
 * Реализует контекстное обучение и долговременную память
 */

class ConversationMemorySystem {
    constructor() {
        this.memoryConfig = {
            maxShortTermMemory: 10,        // Количество последних сообщений для краткосрочной памяти
            maxLongTermMemory: 100,        // Максимальное количество важных воспоминаний
            memoryDecayRate: 0.95,         // Скорость забывания (0-1)
            importanceThreshold: 0.7,      // Порог важности для сохранения в долговременную память
            contextWindowSize: 4000,       // Максимальный размер контекста для ИИ
            similarityThreshold: 0.8       // Порог схожести для группировки воспоминаний
        };
        
        this.memoryTypes = {
            SHORT_TERM: 'short_term',      // Краткосрочная память (текущий разговор)
            LONG_TERM: 'long_term',        // Долговременная память (важные моменты)
            SEMANTIC: 'semantic',          // Семантическая память (знания и факты)
            EPISODIC: 'episodic',          // Эпизодическая память (конкретные события)
            PROCEDURAL: 'procedural'       // Процедурная память (навыки и паттерны)
        };
    }

    /**
     * Создает структуру памяти для нового пользователя
     */
    initializeUserMemory(userId) {
        return {
            userId: userId,
            shortTermMemory: [],
            longTermMemory: [],
            semanticMemory: {},
            episodicMemory: [],
            proceduralMemory: {},
            userProfile: {
                communicationStyle: 'professional',
                preferredTopics: [],
                learningProgress: {},
                satisfactionHistory: []
            },
            memoryStats: {
                totalInteractions: 0,
                successfulResolutions: 0,
                averageSatisfaction: 0,
                lastUpdate: new Date().toISOString()
            }
        };
    }

    /**
     * Добавляет новое взаимодействие в память
     */
    addInteraction(userId, interaction) {
        const memoryStructure = this.getUserMemory(userId) || this.initializeUserMemory(userId);
        
        // Создаем объект взаимодействия
        const memoryItem = {
            id: this.generateMemoryId(),
            timestamp: new Date().toISOString(),
            userMessage: interaction.userMessage,
            aiResponse: interaction.aiResponse,
            topic: interaction.topic,
            sentiment: interaction.sentiment,
            importance: this.calculateImportance(interaction),
            context: interaction.context || '',
            feedback: interaction.feedback,
            resolved: interaction.resolved || false,
            keywords: this.extractKeywords(interaction.userMessage),
            embedding: null // Будет заполнено позже для семантического поиска
        };

        // Добавляем в краткосрочную память
        memoryStructure.shortTermMemory.push(memoryItem);
        
        // Ограничиваем размер краткосрочной памяти
        if (memoryStructure.shortTermMemory.length > this.memoryConfig.maxShortTermMemory) {
            const removedItem = memoryStructure.shortTermMemory.shift();
            // Проверяем, нужно ли сохранить в долговременную память
            if (removedItem.importance >= this.memoryConfig.importanceThreshold) {
                this.moveToLongTermMemory(memoryStructure, removedItem);
            }
        }

        // Обновляем различные типы памяти
        this.updateSemanticMemory(memoryStructure, memoryItem);
        this.updateEpisodicMemory(memoryStructure, memoryItem);
        this.updateProceduralMemory(memoryStructure, memoryItem);
        this.updateUserProfile(memoryStructure, memoryItem);

        // Обновляем статистику
        memoryStructure.memoryStats.totalInteractions++;
        memoryStructure.memoryStats.lastUpdate = new Date().toISOString();

        return memoryStructure;
    }

    /**
     * Вычисляет важность взаимодействия
     */
    calculateImportance(interaction) {
        let importance = 0.5; // базовая важность

        // Факторы, увеличивающие важность
        if (interaction.feedback === 'positive') importance += 0.3;
        if (interaction.resolved) importance += 0.2;
        if (interaction.userMessage.length > 100) importance += 0.1;
        if (interaction.aiResponse && interaction.aiResponse.length > 200) importance += 0.1;
        
        // Сложность вопроса
        const complexityIndicators = ['как защитить', 'какая ответственность', 'в суд', 'договор'];
        if (complexityIndicators.some(indicator => 
            interaction.userMessage.toLowerCase().includes(indicator))) {
            importance += 0.2;
        }

        // Эмоциональная окраска
        if (interaction.sentiment === 'negative') importance += 0.1; // проблемы важнее
        
        // Повторяющиеся темы
        if (interaction.isRepeatedTopic) importance += 0.1;

        return Math.min(importance, 1.0);
    }

    /**
     * Перемещает элемент в долговременную память
     */
    moveToLongTermMemory(memoryStructure, memoryItem) {
        // Добавляем метку времени перемещения
        memoryItem.movedToLongTerm = new Date().toISOString();
        memoryItem.accessCount = 0;
        
        memoryStructure.longTermMemory.push(memoryItem);
        
        // Ограничиваем размер долговременной памяти
        if (memoryStructure.longTermMemory.length > this.memoryConfig.maxLongTermMemory) {
            // Удаляем наименее важные или старые элементы
            memoryStructure.longTermMemory.sort((a, b) => {
                const importanceA = a.importance * Math.pow(this.memoryConfig.memoryDecayRate, 
                    (Date.now() - new Date(a.timestamp).getTime()) / (24 * 60 * 60 * 1000));
                const importanceB = b.importance * Math.pow(this.memoryConfig.memoryDecayRate, 
                    (Date.now() - new Date(b.timestamp).getTime()) / (24 * 60 * 60 * 1000));
                return importanceB - importanceA;
            });
            
            memoryStructure.longTermMemory = memoryStructure.longTermMemory.slice(0, 
                this.memoryConfig.maxLongTermMemory);
        }
    }

    /**
     * Обновляет семантическую память (знания по темам)
     */
    updateSemanticMemory(memoryStructure, memoryItem) {
        const topic = memoryItem.topic;
        if (!topic) return;

        if (!memoryStructure.semanticMemory[topic]) {
            memoryStructure.semanticMemory[topic] = {
                totalQuestions: 0,
                successfulAnswers: 0,
                commonKeywords: {},
                typicalPatterns: [],
                lastUpdated: new Date().toISOString()
            };
        }

        const topicMemory = memoryStructure.semanticMemory[topic];
        topicMemory.totalQuestions++;
        
        if (memoryItem.feedback === 'positive') {
            topicMemory.successfulAnswers++;
        }

        // Обновляем ключевые слова
        memoryItem.keywords.forEach(keyword => {
            topicMemory.commonKeywords[keyword] = (topicMemory.commonKeywords[keyword] || 0) + 1;
        });

        topicMemory.lastUpdated = new Date().toISOString();
    }

    /**
     * Обновляет эпизодическую память (конкретные события)
     */
    updateEpisodicMemory(memoryStructure, memoryItem) {
        // Создаем эпизод только для важных событий
        if (memoryItem.importance >= 0.8) {
            const episode = {
                id: this.generateMemoryId(),
                timestamp: memoryItem.timestamp,
                type: 'important_interaction',
                summary: this.generateEpisodeSummary(memoryItem),
                context: memoryItem.context,
                outcome: memoryItem.resolved ? 'resolved' : 'pending',
                relatedTopics: [memoryItem.topic],
                emotionalContext: memoryItem.sentiment
            };

            memoryStructure.episodicMemory.push(episode);
            
            // Ограничиваем количество эпизодов
            if (memoryStructure.episodicMemory.length > 50) {
                memoryStructure.episodicMemory = memoryStructure.episodicMemory
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 50);
            }
        }
    }

    /**
     * Обновляет процедурную память (паттерны поведения)
     */
    updateProceduralMemory(memoryStructure, memoryItem) {
        const pattern = this.identifyPattern(memoryItem);
        if (!pattern) return;

        if (!memoryStructure.proceduralMemory[pattern.type]) {
            memoryStructure.proceduralMemory[pattern.type] = {
                occurrences: 0,
                successRate: 0,
                bestPractices: [],
                lastUsed: new Date().toISOString()
            };
        }

        const procedural = memoryStructure.proceduralMemory[pattern.type];
        procedural.occurrences++;
        
        if (memoryItem.feedback === 'positive') {
            procedural.successRate = (procedural.successRate * (procedural.occurrences - 1) + 1) / procedural.occurrences;
            
            // Добавляем в лучшие практики
            if (pattern.bestPractice) {
                procedural.bestPractices.push(pattern.bestPractice);
                // Ограничиваем количество лучших практик
                if (procedural.bestPractices.length > 10) {
                    procedural.bestPractices = procedural.bestPractices.slice(-10);
                }
            }
        } else if (memoryItem.feedback === 'negative') {
            procedural.successRate = (procedural.successRate * (procedural.occurrences - 1)) / procedural.occurrences;
        }

        procedural.lastUsed = new Date().toISOString();
    }

    /**
     * Обновляет профиль пользователя
     */
    updateUserProfile(memoryStructure, memoryItem) {
        const profile = memoryStructure.userProfile;
        
        // Обновляем предпочитаемые темы
        if (memoryItem.topic && !profile.preferredTopics.includes(memoryItem.topic)) {
            profile.preferredTopics.push(memoryItem.topic);
            // Ограничиваем количество тем
            if (profile.preferredTopics.length > 10) {
                profile.preferredTopics = profile.preferredTopics.slice(-10);
            }
        }

        // Обновляем историю удовлетворенности
        if (memoryItem.feedback) {
            profile.satisfactionHistory.push({
                timestamp: memoryItem.timestamp,
                feedback: memoryItem.feedback,
                topic: memoryItem.topic
            });
            
            // Ограничиваем историю
            if (profile.satisfactionHistory.length > 20) {
                profile.satisfactionHistory = profile.satisfactionHistory.slice(-20);
            }

            // Вычисляем среднюю удовлетворенность
            const positiveCount = profile.satisfactionHistory.filter(h => h.feedback === 'positive').length;
            memoryStructure.memoryStats.averageSatisfaction = 
                positiveCount / profile.satisfactionHistory.length;
        }

        // Определяем стиль коммуникации
        this.updateCommunicationStyle(profile, memoryItem);
    }

    /**
     * Обновляет стиль коммуникации пользователя
     */
    updateCommunicationStyle(profile, memoryItem) {
        const message = memoryItem.userMessage.toLowerCase();
        
        // Анализируем формальность
        const formalIndicators = ['уважаемый', 'прошу', 'благодарю', 'с уважением'];
        const informalIndicators = ['привет', 'спасибо', 'пока', 'класс', 'круто'];
        
        const formalCount = formalIndicators.filter(indicator => message.includes(indicator)).length;
        const informalCount = informalIndicators.filter(indicator => message.includes(indicator)).length;
        
        if (formalCount > informalCount && formalCount > 0) {
            profile.communicationStyle = 'formal';
        } else if (informalCount > formalCount && informalCount > 0) {
            profile.communicationStyle = 'informal';
        } else {
            profile.communicationStyle = 'professional';
        }
    }

    /**
     * Извлекает ключевые слова из сообщения
     */
    extractKeywords(message) {
        const stopWords = new Set(['и', 'в', 'на', 'с', 'по', 'для', 'как', 'что', 'это', 'не', 'я', 'мне', 'меня']);
        
        return message.toLowerCase()
            .replace(/[^\wа-яё\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word))
            .filter((word, index, arr) => arr.indexOf(word) === index) // уникальные
            .slice(0, 10); // ограничиваем количество
    }

    /**
     * Идентифицирует паттерн взаимодействия
     */
    identifyPattern(memoryItem) {
        const message = memoryItem.userMessage.toLowerCase();
        const response = memoryItem.aiResponse?.toLowerCase() || '';

        // Паттерн: Вопрос о документах
        if (message.includes('документ') || message.includes('справка') || message.includes('заявление')) {
            return {
                type: 'document_request',
                bestPractice: memoryItem.feedback === 'positive' ? {
                    approach: 'structured_document_explanation',
                    keywords: memoryItem.keywords.slice(0, 5)
                } : null
            };
        }

        // Паттерн: Вопрос о сроках
        if (message.includes('срок') || message.includes('когда') || message.includes('время')) {
            return {
                type: 'timeline_question',
                bestPractice: memoryItem.feedback === 'positive' ? {
                    approach: 'specific_timeline_with_exceptions',
                    keywords: memoryItem.keywords.slice(0, 5)
                } : null
            };
        }

        // Паттерн: Просьба о помощи
        if (message.includes('помогите') || message.includes('что делать') || message.includes('как быть')) {
            return {
                type: 'help_request',
                bestPractice: memoryItem.feedback === 'positive' ? {
                    approach: 'step_by_step_guidance',
                    keywords: memoryItem.keywords.slice(0, 5)
                } : null
            };
        }

        return null;
    }

    /**
     * Генерирует краткое описание эпизода
     */
    generateEpisodeSummary(memoryItem) {
        const topic = memoryItem.topic || 'общий вопрос';
        const sentiment = memoryItem.sentiment === 'negative' ? 'проблемный' : 'обычный';
        const outcome = memoryItem.resolved ? 'решен' : 'требует внимания';
        
        return `${sentiment} ${topic}, ${outcome}`;
    }

    /**
     * Получает релевантную память для формирования контекста
     */
    getRelevantMemory(userId, currentMessage, maxContextSize = null) {
        const memoryStructure = this.getUserMemory(userId);
        if (!memoryStructure) return null;

        const contextSize = maxContextSize || this.memoryConfig.contextWindowSize;
        let context = {
            shortTerm: [],
            longTerm: [],
            semantic: {},
            procedural: {},
            userProfile: memoryStructure.userProfile,
            totalSize: 0
        };

        // Добавляем краткосрочную память (всегда включаем)
        context.shortTerm = memoryStructure.shortTermMemory.slice(-5);
        context.totalSize += JSON.stringify(context.shortTerm).length;

        // Поиск релевантной долговременной памяти
        const relevantLongTerm = this.findRelevantLongTermMemory(
            memoryStructure, currentMessage, contextSize - context.totalSize
        );
        context.longTerm = relevantLongTerm;
        context.totalSize += JSON.stringify(relevantLongTerm).length;

        // Добавляем семантическую память по теме
        const detectedTopic = this.detectTopic(currentMessage);
        if (detectedTopic && memoryStructure.semanticMemory[detectedTopic]) {
            context.semantic[detectedTopic] = memoryStructure.semanticMemory[detectedTopic];
            context.totalSize += JSON.stringify(context.semantic[detectedTopic]).length;
        }

        // Добавляем релевантную процедурную память
        const relevantProcedural = this.findRelevantProceduralMemory(memoryStructure, currentMessage);
        if (relevantProcedural) {
            context.procedural = relevantProcedural;
            context.totalSize += JSON.stringify(relevantProcedural).length;
        }

        return context;
    }

    /**
     * Находит релевантную долговременную память
     */
    findRelevantLongTermMemory(memoryStructure, currentMessage, maxSize) {
        const currentKeywords = new Set(this.extractKeywords(currentMessage));
        
        // Оцениваем релевантность каждого воспоминания
        const scoredMemories = memoryStructure.longTermMemory.map(memory => {
            let score = 0;
            
            // Совпадение ключевых слов
            const commonKeywords = memory.keywords.filter(keyword => currentKeywords.has(keyword));
            score += commonKeywords.length * 0.3;
            
            // Важность воспоминания
            score += memory.importance * 0.4;
            
            // Свежесть (более свежие важнее)
            const daysSince = (Date.now() - new Date(memory.timestamp).getTime()) / (24 * 60 * 60 * 1000);
            score += Math.max(0, (30 - daysSince) / 30) * 0.2;
            
            // Успешность (положительная обратная связь)
            if (memory.feedback === 'positive') score += 0.1;
            
            return { memory, score };
        });

        // Сортируем по релевантности и выбираем лучшие
        scoredMemories.sort((a, b) => b.score - a.score);
        
        const relevantMemories = [];
        let currentSize = 0;
        
        for (const { memory } of scoredMemories) {
            const memorySize = JSON.stringify(memory).length;
            if (currentSize + memorySize <= maxSize) {
                relevantMemories.push(memory);
                currentSize += memorySize;
                memory.accessCount = (memory.accessCount || 0) + 1; // Отмечаем использование
            } else {
                break;
            }
        }
        
        return relevantMemories;
    }

    /**
     * Находит релевантную процедурную память
     */
    findRelevantProceduralMemory(memoryStructure, currentMessage) {
        const pattern = this.identifyPattern({ userMessage: currentMessage });
        if (!pattern) return null;

        const procedural = memoryStructure.proceduralMemory[pattern.type];
        if (!procedural || procedural.successRate < 0.5) return null;

        return {
            type: pattern.type,
            successRate: procedural.successRate,
            bestPractices: procedural.bestPractices.slice(-3), // последние 3 лучшие практики
            occurrences: procedural.occurrences
        };
    }

    /**
     * Определяет тему сообщения
     */
    detectTopic(message) {
        const topicKeywords = {
            'семейное право': ['развод', 'алименты', 'брак', 'опека'],
            'трудовое право': ['увольнение', 'зарплата', 'отпуск', 'работодатель'],
            'договорное право': ['договор', 'контракт', 'соглашение', 'сделка'],
            'налоговое право': ['налог', 'вычет', 'декларация', 'ндфл'],
            'банкротство': ['банкротство', 'долг', 'кредит', 'банкрот']
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return topic;
            }
        }
        
        return null;
    }

    /**
     * Форматирует память для использования в промпте ИИ
     */
    formatMemoryForPrompt(memoryContext) {
        if (!memoryContext) return '';

        let prompt = '';

        // Профиль пользователя
        if (memoryContext.userProfile) {
            prompt += `ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:\n`;
            prompt += `- Стиль общения: ${memoryContext.userProfile.communicationStyle}\n`;
            prompt += `- Основные темы: ${memoryContext.userProfile.preferredTopics.join(', ')}\n`;
            prompt += `- Средняя удовлетворенность: ${(memoryContext.userProfile.satisfactionHistory.length > 0 ? 
                memoryContext.userProfile.satisfactionHistory.filter(h => h.feedback === 'positive').length / 
                memoryContext.userProfile.satisfactionHistory.length * 100 : 0).toFixed(0)}%\n\n`;
        }

        // Краткосрочная память
        if (memoryContext.shortTerm && memoryContext.shortTerm.length > 0) {
            prompt += `НЕДАВНИЕ РАЗГОВОРЫ:\n`;
            memoryContext.shortTerm.forEach((item, index) => {
                prompt += `${index + 1}. Пользователь: ${item.userMessage}\n`;
                if (item.aiResponse) {
                    prompt += `   Ответ: ${item.aiResponse.substring(0, 150)}...\n`;
                }
                prompt += `   Тема: ${item.topic || 'не определена'}, Результат: ${item.feedback || 'без оценки'}\n\n`;
            });
        }

        // Релевантная долговременная память
        if (memoryContext.longTerm && memoryContext.longTerm.length > 0) {
            prompt += `ВАЖНЫЕ МОМЕНТЫ ИЗ ИСТОРИИ:\n`;
            memoryContext.longTerm.forEach((item, index) => {
                prompt += `${index + 1}. ${item.topic || 'Общий вопрос'}: ${item.userMessage.substring(0, 100)}...\n`;
                prompt += `   Результат: ${item.feedback || 'неизвестно'}, Важность: ${(item.importance * 100).toFixed(0)}%\n`;
            });
            prompt += '\n';
        }

        // Семантическая память
        if (memoryContext.semantic && Object.keys(memoryContext.semantic).length > 0) {
            prompt += `ЗНАНИЯ ПО ТЕМЕ:\n`;
            Object.entries(memoryContext.semantic).forEach(([topic, data]) => {
                prompt += `${topic}: ${data.totalQuestions} вопросов, успешность ${
                    (data.successfulAnswers / data.totalQuestions * 100).toFixed(0)}%\n`;
                const topKeywords = Object.entries(data.commonKeywords)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([word]) => word);
                prompt += `   Ключевые слова: ${topKeywords.join(', ')}\n`;
            });
            prompt += '\n';
        }

        // Процедурная память
        if (memoryContext.procedural && Object.keys(memoryContext.procedural).length > 0) {
            prompt += `УСПЕШНЫЕ ПОДХОДЫ:\n`;
            Object.entries(memoryContext.procedural).forEach(([type, data]) => {
                prompt += `${type}: успешность ${(data.successRate * 100).toFixed(0)}%\n`;
                if (data.bestPractices && data.bestPractices.length > 0) {
                    prompt += `   Лучшие практики: ${data.bestPractices.map(bp => bp.approach).join(', ')}\n`;
                }
            });
            prompt += '\n';
        }

        return prompt;
    }

    /**
     * Очищает устаревшую память
     */
    cleanupMemory(memoryStructure) {
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;

        // Применяем затухание к долговременной памяти
        memoryStructure.longTermMemory.forEach(memory => {
            const daysSince = (now - new Date(memory.timestamp).getTime()) / dayInMs;
            memory.importance *= Math.pow(this.memoryConfig.memoryDecayRate, daysSince);
        });

        // Удаляем память с очень низкой важностью
        memoryStructure.longTermMemory = memoryStructure.longTermMemory
            .filter(memory => memory.importance > 0.1);

        // Очищаем старые эпизоды (старше 6 месяцев)
        const sixMonthsAgo = now - (180 * dayInMs);
        memoryStructure.episodicMemory = memoryStructure.episodicMemory
            .filter(episode => new Date(episode.timestamp).getTime() > sixMonthsAgo);

        return memoryStructure;
    }

    /**
     * Генерирует уникальный ID для элемента памяти
     */
    generateMemoryId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Получает память пользователя (заглушка для интеграции с БД)
     */
    getUserMemory(userId) {
        // В реальной реализации здесь будет обращение к базе данных
        // Для n8n это будет отдельный узел с MySQL запросом
        return null;
    }

    /**
     * Сохраняет память пользователя (заглушка для интеграции с БД)
     */
    saveUserMemory(memoryStructure) {
        // В реальной реализации здесь будет сохранение в базу данных
        // Для n8n это будет отдельный узел с MySQL запросом
        return true;
    }

    /**
     * Экспортирует память пользователя для анализа
     */
    exportUserMemory(userId) {
        const memoryStructure = this.getUserMemory(userId);
        if (!memoryStructure) return null;

        return {
            userId: userId,
            exportDate: new Date().toISOString(),
            statistics: {
                totalInteractions: memoryStructure.memoryStats.totalInteractions,
                averageSatisfaction: memoryStructure.memoryStats.averageSatisfaction,
                shortTermMemorySize: memoryStructure.shortTermMemory.length,
                longTermMemorySize: memoryStructure.longTermMemory.length,
                knownTopics: Object.keys(memoryStructure.semanticMemory).length,
                proceduralPatterns: Object.keys(memoryStructure.proceduralMemory).length
            },
            memoryBreakdown: {
                shortTerm: memoryStructure.shortTermMemory.length,
                longTerm: memoryStructure.longTermMemory.length,
                semantic: Object.keys(memoryStructure.semanticMemory).length,
                episodic: memoryStructure.episodicMemory.length,
                procedural: Object.keys(memoryStructure.proceduralMemory).length
            },
            topTopics: Object.entries(memoryStructure.semanticMemory)
                .sort(([,a], [,b]) => b.totalQuestions - a.totalQuestions)
                .slice(0, 5)
                .map(([topic, data]) => ({
                    topic,
                    questions: data.totalQuestions,
                    successRate: (data.successfulAnswers / data.totalQuestions * 100).toFixed(1) + '%'
                }))
        };
    }
}

// Экспорт для использования в n8n
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConversationMemorySystem;
}

// Глобальный доступ для n8n
if (typeof global !== 'undefined') {
    global.ConversationMemorySystem = ConversationMemorySystem;
}

/**
 * Функция для использования в n8n Code Node
 */
function processMemoryOperation(inputData) {
    const memorySystem = new ConversationMemorySystem();
    
    const operation = inputData.operation || 'add';
    
    switch (operation) {
        case 'add':
            return memorySystem.addInteraction(inputData.userId, inputData.interaction);
            
        case 'getContext':
            return memorySystem.getRelevantMemory(inputData.userId, inputData.currentMessage);
            
        case 'formatPrompt':
            const context = memorySystem.getRelevantMemory(inputData.userId, inputData.currentMessage);
            return {
                formattedMemory: memorySystem.formatMemoryForPrompt(context),
                memoryContext: context
            };
            
        case 'cleanup':
            return memorySystem.cleanupMemory(inputData.memoryStructure);
            
        case 'export':
            return memorySystem.exportUserMemory(inputData.userId);
            
        case 'initialize':
            return memorySystem.initializeUserMemory(inputData.userId);
            
        default:
            return { error: 'Unknown memory operation' };
    }
}








