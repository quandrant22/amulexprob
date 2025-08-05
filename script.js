document.addEventListener('DOMContentLoaded', () => {
const tg = window.Telegram.WebApp;
    tg.ready();

    // Элементы для услуг
    const servicesArea = document.querySelector('.services-area');

    // Элементы навигации
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');

    // Функция переключения экранов (делаем глобальной)
    window.switchScreen = function(targetScreenId) {
        // Скрываем все экраны
        screens.forEach(screen => screen.classList.remove('active'));
        
        // Показываем целевой экран
        const targetScreen = document.getElementById(targetScreenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Обновляем состояние навигации
        navItems.forEach(item => item.classList.remove('active'));
        const activeNavItem = document.querySelector(`[data-screen="${targetScreenId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Если переключились на экран профиля, переинициализируем внешние ссылки
        if (targetScreenId === 'profile-screen') {
            setTimeout(() => setupExternalLinks(), 100);
        }
    };

    // Обработчики для навигации
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.getAttribute('data-screen');
            window.switchScreen(screenId);
        });
    });

    // Обработчики для кнопок документов
    function setupDocumentButtons() {
        // Основные кнопки документов
        const docBtns = document.querySelectorAll('.doc-btn');
        docBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.textContent;
                if (text.includes('юридический анализ')) {
                    window.switchScreen('analysis-screen');
                } else if (text.includes('шаблон документа')) {
                    window.switchScreen('template-screen');
                } else if (text.includes('Амулекс')) {
                    openExternalLink('https://amulex.ru/docs');
                }
            });
        });

        // Кнопка "Отправить запрос"
        const helpBtn = document.querySelector('.help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                window.switchScreen('complaints-screen');
            });
        }
    }

    // Обработчики для экрана юридического анализа
    function setupAnalysisButtons() {
        const orderAnalysisBtn = document.querySelector('.order-analysis-btn');
        if (orderAnalysisBtn) {
            orderAnalysisBtn.addEventListener('click', () => {
                alert('Переход к оплате юридического анализа за 250 рублей');
            });
        }

        const exampleAnalysisBtn = document.querySelector('.example-analysis-btn');
        if (exampleAnalysisBtn) {
            exampleAnalysisBtn.addEventListener('click', () => {
                alert('Показать пример отчета юридического анализа');
            });
        }
    }

    // Обработчики для экрана шаблонов документов
    function setupTemplateButtons() {
        // Кнопка "Найти шаблон на сайте Амулекс"
        const templateLinkBtn = document.querySelector('.template-link-btn');
        if (templateLinkBtn) {
            templateLinkBtn.addEventListener('click', () => {
                const url = templateLinkBtn.getAttribute('data-url');
                openExternalLink(url);
            });
        }

        // Кнопка "Отправить заявку" для профессиональных документов
        const professionalBtn = document.querySelector('.professional-btn');
        if (professionalBtn) {
            professionalBtn.addEventListener('click', () => {
                const url = professionalBtn.getAttribute('data-url');
                openExternalLink(url);
            });
        }

        // Кнопка "Получить" для кастомного шаблона
        const getCustomTemplateBtn = document.querySelector('.get-custom-template-btn');
        if (getCustomTemplateBtn) {
            getCustomTemplateBtn.addEventListener('click', () => {
                const textarea = document.querySelector('.custom-input-wrapper textarea');
                const text = textarea ? textarea.value.trim() : '';
                if (text) {
                    // Показываем результат в специальной области
                    const resultArea = document.querySelector('.template-result p');
                    if (resultArea) {
                        resultArea.textContent = `Ваш запрос "${text}" принят. Шаблон будет подготовлен в ближайшее время.`;
                        resultArea.style.color = 'var(--primary-text-color)';
                        resultArea.style.fontStyle = 'normal';
                    }
                    textarea.value = '';
                } else {
                    alert('Пожалуйста, введите описание нужного шаблона');
                }
            });
        }
    }

    // Обработчики для экрана жалоб и предложений
    function setupComplaintsButtons() {
        const sendComplaintBtn = document.querySelector('.send-complaint-btn');
        if (sendComplaintBtn) {
            sendComplaintBtn.addEventListener('click', async () => {
                const textarea = document.querySelector('.complaints-input-section textarea');
                const text = textarea ? textarea.value.trim() : '';
                
                if (!text) {
                    alert('Пожалуйста, введите текст жалобы или предложения');
                    return;
                }
                
                // Показываем индикатор загрузки
                const originalText = sendComplaintBtn.textContent;
                sendComplaintBtn.textContent = 'Отправляем...';
                sendComplaintBtn.disabled = true;
                
                try {
                    // Получаем информацию о пользователе Telegram
                    let userName = 'Аноним';
                    let userInfo = {
                        name: 'Аноним',
                        id: null,
                        username: null
                    };
                    
                    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
                        const user = window.Telegram.WebApp.initDataUnsafe.user;
                        if (user) {
                            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                            userInfo.name = fullName || user.username || `Пользователь ${user.id}`;
                            userInfo.id = user.id;
                            userInfo.username = user.username;
                            
                            // Формируем строку с полной информацией
                            userName = userInfo.name;
                            if (userInfo.username) {
                                userName += ` (@${userInfo.username})`;
                            }
                            if (userInfo.id) {
                                userName += ` [ID: ${userInfo.id}]`;
                            }
                        }
                    }
                    
                    // URL вашего Google Apps Script
                    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz1hxn7ewb-XuV2ytRcKy78gQ_clR1-8ei8DMzAF9LyFcHqpMVEzjHpwXm5j8e07kFHCg/exec';
                    
                    // Отправляем в Google Таблицы
                    const response = await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors', // Важно для Google Apps Script
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user: userName,
                            message: text,
                            user_id: userInfo.id,
                            username: userInfo.username,
                            full_name: userInfo.name,
                            source: 'Страница документов - жалоба'
                        })
                    });
                    
                    // Успешная отправка
                    alert('Спасибо за ваше обращение! Оно успешно отправлено и будет рассмотрено.');
                    textarea.value = '';
                    
                } catch (error) {
                    console.error('Ошибка отправки в Google Таблицы:', error);
                    
                    // Fallback - отправляем в Telegram
                    const message = `📝 ЖАЛОБА/ПРЕДЛОЖЕНИЕ:\n\n${text}`;
                    const telegramUrl = `https://t.me/mihail_rein?text=${encodeURIComponent(message)}`;
                    openExternalLink(telegramUrl);
                    
                    alert('Сообщение отправлено через Telegram. Мы обязательно его рассмотрим.');
                    textarea.value = '';
                } finally {
                    // Восстанавливаем кнопку
                    sendComplaintBtn.textContent = originalText;
                    sendComplaintBtn.disabled = false;
                }
            });
        }
    }

    // Обработчики для экрана бонусов
    function setupBonusButtons() {
        // Обработчик для карточки "Есть предложение"
        const suggestionCard = document.querySelector('.bonus-card.suggestion');
        if (suggestionCard) {
            suggestionCard.addEventListener('click', () => {
                // Показываем prompt для ввода предложения  
                const suggestion = prompt('Напишите ваше предложение для улучшения бота:');
                
                if (suggestion && suggestion.trim()) {
                    sendSuggestionToGoogleSheets(suggestion.trim());
                } else if (suggestion !== null) {
                    alert('Пожалуйста, введите ваше предложение');
                }
            });
            suggestionCard.style.cursor = 'pointer';
        }

        // Обработчики для карточек подписок
        const bonusCards = document.querySelectorAll('.bonus-card:not(.suggestion):not(.special)');
        bonusCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h3').textContent;
                if (title.includes('навсегда')) {
                    alert('Добавьте бота в чат от 1000 человек, чтобы получить подписку навсегда!\n\nИнструкция:\n1. Создайте группу или канал\n2. Добавьте @amulexprob_bot\n3. Пригласите 1000+ участников');
                } else if (title.includes('неделю')) {
                    const shareText = 'Попробуй этого юридического помощника! Очень удобно получать консультации и документы:';
                    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/amulexprob_bot')}&text=${encodeURIComponent(shareText)}`;
                    openExternalLink(shareUrl);
                }
            });
            card.style.cursor = 'pointer';
        });

        // Обработчик для специальной карточки банкротства
        const specialCard = document.querySelector('.bonus-card.special');
        if (specialCard) {
            specialCard.addEventListener('click', () => {
                window.switchScreen('bonus-offer-screen');
            });
            specialCard.style.cursor = 'pointer';
        }
    }

    // Функция для отправки предложений в Google Таблицы
    async function sendSuggestionToGoogleSheets(suggestionText) {
        try {
            // Получаем информацию о пользователе Telegram
            let userName = 'Аноним';
            let userInfo = {
                name: 'Аноним',
                id: null,
                username: null
            };
            
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
                const user = window.Telegram.WebApp.initDataUnsafe.user;
                if (user) {
                    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    userInfo.name = fullName || user.username || `Пользователь ${user.id}`;
                    userInfo.id = user.id;
                    userInfo.username = user.username;
                    
                    // Формируем строку с полной информацией
                    userName = userInfo.name;
                    if (userInfo.username) {
                        userName += ` (@${userInfo.username})`;
                    }
                    if (userInfo.id) {
                        userName += ` [ID: ${userInfo.id}]`;
                    }
                }
            }
            
            // URL Google Apps Script
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz1hxn7ewb-XuV2ytRcKy78gQ_clR1-8ei8DMzAF9LyFcHqpMVEzjHpwXm5j8e07kFHCg/exec';
            
            // Отправляем в Google Таблицы
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Важно для Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: userName,
                    message: suggestionText,
                    user_id: userInfo.id,
                    username: userInfo.username,
                    full_name: userInfo.name,
                    source: 'Страница бонусов - предложение'
                })
            });
            
            // Успешная отправка
            alert('Спасибо за ваше предложение! Оно успешно отправлено и будет рассмотрено.');
            
        } catch (error) {
            console.error('Ошибка отправки предложения в Google Таблицы:', error);
            
            // Fallback - отправляем в Telegram
            const message = `💡 ПРЕДЛОЖЕНИЕ:\n\n${suggestionText}`;
            const telegramUrl = `https://t.me/mihail_rein?text=${encodeURIComponent(message)}`;
            openExternalLink(telegramUrl);
            
            alert('Предложение отправлено через Telegram. Спасибо за ваш отзыв!');
        }
    }

    // Функция для открытия внешних ссылок
    function openExternalLink(url) {
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                window.Telegram.WebApp.openLink(url);
            } catch (error) {
                console.error('Ошибка Telegram WebApp API:', error);
                window.open(url, '_blank');
            }
        } else {
            window.open(url, '_blank');
        }
    }

    // Инициализируем кнопки документов
    setupDocumentButtons();
    
    // Инициализируем кнопки анализа
    setupAnalysisButtons();
    
    // Инициализируем кнопки шаблонов
    setupTemplateButtons();
    
    // Инициализируем кнопки жалоб
    setupComplaintsButtons();
    
    // Инициализируем кнопки бонусов
    setupBonusButtons();

    // Обработчики для кнопок создания документов
    const createDocBtns = document.querySelectorAll('.create-doc-btn');
    createDocBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const docItem = e.target.closest('.document-item');
            const docTitle = docItem.querySelector('h3').textContent;
            alert(`Создание документа "${docTitle}" будет доступно после подключения платежной системы.`);
        });
    });

    // Обработчики для кнопок профиля
    const upgradeBtn = document.querySelector('.upgrade-btn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            alert('Функция улучшения тарифного плана будет доступна после подключения платежной системы.');
        });
    }

    const contactLawyerBtn = document.querySelector('.contact-lawyer-btn');
    if (contactLawyerBtn) {
        contactLawyerBtn.addEventListener('click', () => {
            alert('Функция связи с юристом будет доступна в следующих версиях приложения.');
        });
    }

    const supportBtns = document.querySelectorAll('.support-btn');
    supportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Раздел поддержки находится в разработке.');
        });
    });

    // Обработчики для внешних ссылок
    function setupExternalLinks() {
        const externalLinkBtns = document.querySelectorAll('.external-link-btn');
        console.log('Найдено кнопок внешних ссылок:', externalLinkBtns.length);
        
        externalLinkBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const url = btn.getAttribute('data-url');
                console.log('Нажата кнопка с URL:', url);
                
                if (url) {
                    // Сначала пробуем Telegram WebApp API
                    if (window.Telegram && window.Telegram.WebApp) {
                        console.log('Используем Telegram WebApp API');
                        try {
                            window.Telegram.WebApp.openLink(url);
                        } catch (error) {
                            console.error('Ошибка Telegram WebApp API:', error);
                            // Fallback на обычное открытие
                            window.open(url, '_blank');
                        }
                    } else {
                        console.log('Telegram WebApp API недоступен, используем window.open');
                        // Fallback для тестирования в браузере
                        window.open(url, '_blank');
                    }
    } else {
                    console.error('URL не найден для кнопки');
                }
            });
        });
    }
    
    // Вызываем настройку ссылок
    setupExternalLinks();

    // Обработчик для формы "Дарим 40 000 рублей"
    function setupBonusOfferForm() {
        const bonusForm = document.querySelector('.bonus-form');
        if (bonusForm) {
            bonusForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const nameInput = bonusForm.querySelector('input[type="text"]');
                const phoneInput = bonusForm.querySelector('input[type="tel"]');
                const agreementCheckbox = bonusForm.querySelector('#agreement');
                
                const name = nameInput.value.trim();
                const phone = phoneInput.value.trim();
                
                if (!name) {
                    alert('Пожалуйста, введите ваше имя');
                    return;
                }
                
                if (!phone) {
                    alert('Пожалуйста, введите номер телефона');
                    return;
                }
                
                if (!agreementCheckbox.checked) {
                    alert('Необходимо дать согласие на обработку данных');
                    return;
                }
                
                // Отправляем данные в Telegram
                const message = `🎁 ЗАЯВКА НА БОНУС 40,000 РУБЛЕЙ\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n\n💼 Услуга: Банкротство физических лиц\n💰 Запрашиваемая скидка: 40,000 рублей`;
                const telegramUrl = `https://t.me/mihail_rein?text=${encodeURIComponent(message)}`;
                
                openExternalLink(telegramUrl);
                
                // Показываем сообщение об успехе
                alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время для активации бонусного предложения.');
                
                // Очищаем форму
                nameInput.value = '';
                phoneInput.value = '';
                agreementCheckbox.checked = false;
            });
        }
    }

    // Инициализируем форму бонусного предложения
    setupBonusOfferForm();

    // Расширяем область для клика на всю обертку в чате
    const inputWrapper = document.querySelector('.input-wrapper');
    if (inputWrapper) {
        inputWrapper.addEventListener('click', (event) => {
            if(event.target !== sendButton && !sendButton.contains(event.target)) {
                messageInput.focus();
            }
        });
    }
}); 