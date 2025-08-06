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
                    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWHhSTgDs8fjKCazQgwSJbctGxUPM_cITzTabGWa5WdBgkBAagJCszXJqzKf-LjyQ4qg/exec';
                    
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
                    
                    // Возвращаем пользователя на главную страницу документов
                    setTimeout(() => {
                        window.switchScreen('chat-screen');
                    }, 1000);
                    
                } catch (error) {
                    console.error('Ошибка отправки в Google Таблицы:', error);
                    
                    // Fallback - отправляем в Telegram
                    const message = `📝 ЖАЛОБА/ПРЕДЛОЖЕНИЕ:\n\n${text}`;
                    const telegramUrl = `https://t.me/mihail_rein?text=${encodeURIComponent(message)}`;
                    openExternalLink(telegramUrl);
                    
                    alert('Сообщение отправлено через Telegram. Мы обязательно его рассмотрим.');
                    textarea.value = '';
                    
                    // Возвращаем пользователя на главную страницу документов
                    setTimeout(() => {
                        window.switchScreen('chat-screen');
                    }, 1000);
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
                    // Переход на страницу подписки навсегда
                    window.switchScreen('forever-subscription-screen');
                } else if (title.includes('неделю')) {
                    // Переход на страницу реферальной программы
                    window.switchScreen('referral-screen');
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
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWHhSTgDs8fjKCazQgwSJbctGxUPM_cITzTabGWa5WdBgkBAagJCszXJqzKf-LjyQ4qg/exec';
            
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

    // Обработчики для реферальной программы
    function setupReferralButtons() {
        const shareBtn = document.querySelector('.referral-share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                try {
                    // Получаем ID пользователя для реферальной ссылки
                    let userId = 'guest';
                    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
                        const user = window.Telegram.WebApp.initDataUnsafe.user;
                        if (user && user.id) {
                            userId = user.id;
                        }
                    }
                    
                    // Создаем реферальную ссылку
                    const referralLink = `https://t.me/amulexprob_bot?start=ref_${userId}`;
                    
                    // Копируем в буфер обмена
                    if (navigator.clipboard) {
                        await navigator.clipboard.writeText(referralLink);
                        alert('Ссылка скопирована в буфер обмена!\n\nПоделитесь ей с 10 друзьями, чтобы получить неделю премиум доступа.');
                    } else {
                        // Fallback для старых браузеров
                        prompt('Скопируйте эту ссылку:', referralLink);
                    }
                } catch (error) {
                    console.error('Ошибка копирования:', error);
                    const fallbackLink = 'https://t.me/amulexprob_bot';
                    prompt('Скопируйте эту ссылку:', fallbackLink);
                }
            });
        }

        const readyBtn = document.querySelector('.referral-ready-btn');
        if (readyBtn) {
            readyBtn.addEventListener('click', () => {
                // Получаем информацию о пользователе
                let userName = 'Пользователь';
                let userId = null;
                
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
                    const user = window.Telegram.WebApp.initDataUnsafe.user;
                    if (user) {
                        userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || `Пользователь ${user.id}`;
                        userId = user.id;
                    }
                }
                
                // Отправляем уведомление о готовности
                const message = `🎯 ЗАЯВКА НА ПРОВЕРКУ РЕФЕРАЛОВ\n\n👤 Пользователь: ${userName}\n🆔 Telegram ID: ${userId}\n\n📢 Пользователь утверждает, что поделился ссылкой с 10 друзьями и готов получить неделю премиум доступа.\n\nПожалуйста, проверьте количество рефералов.`;
                const telegramUrl = `https://t.me/mihail_rein?text=${encodeURIComponent(message)}`;
                
                openExternalLink(telegramUrl);
                
                alert('Ваша заявка отправлена! Мы проверим количество ваших рефералов и свяжемся с вами для активации премиум доступа.');
            });
        }
    }

    // Инициализируем форму бонусного предложения
    setupBonusOfferForm();
    
    // Обработчики для страницы "Подписка навсегда"
    function setupForeverSubscriptionButtons() {
        const contactBtn = document.querySelector('.forever-contact-btn');
        const linkInput = document.querySelector('.forever-link-input');

        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                const chatLink = linkInput.value.trim();

                if (!chatLink) {
                    alert('Пожалуйста, вставьте ссылку на чат, в который был добавлен бот.');
                    linkInput.focus();
                    return;
                }

                // Простая валидация ссылки
                if (!chatLink.startsWith('http://') && !chatLink.startsWith('https://') && !chatLink.startsWith('t.me/')) {
                    alert('Пожалуйста, введите корректную ссылку (например, https://t.me/chat_name).');
                    linkInput.focus();
                    return;
                }

                // Получаем информацию о пользователе
                let userName = 'Пользователь';
                let userId = null;
                
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
                    const user = window.Telegram.WebApp.initDataUnsafe.user;
                    if (user) {
                        userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || `Пользователь ${user.id}`;
                        userId = user.id;
                    }
                }
                
                // Отправляем сообщение о желании получить подписку навсегда
                const message = `🏆 ЗАЯВКА НА ПОДПИСКУ НАВСЕГДА\n\n👤 Пользователь: ${userName}\n🆔 Telegram ID: ${userId}\n\n🔗 Ссылка на чат: ${chatLink}\n\n📢 Пользователь добавил @amulexfriendbot в чат и запрашивает проверку для получения подписки навсегда.`;
                const telegramUrl = `https://t.me/mihail_rein?text=${encodeURIComponent(message)}`;
                
                openExternalLink(telegramUrl);
                
                alert('Ваша заявка на проверку отправлена! Мы свяжемся с вами после проверки чата.');
                
                linkInput.value = '';
            });
        }
    }

    // Обработчики для страницы "Информация"
    function setupInfoButtons() {
        // Кнопка "Сайт"
        const siteBtn = document.getElementById('info-site-btn');
        if (siteBtn) {
            siteBtn.addEventListener('click', () => {
                openExternalLink('https://amulex.ru');
            });
        }

        // Кнопка "Связаться"
        const contactBtn = document.getElementById('info-contact-btn');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                openExternalLink('https://t.me/amulex_support'); // Замените на реальный контакт поддержки
            });
        }

        // Кнопка "Подробнее"
        const detailsBtn = document.getElementById('info-details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => {
                // Здесь может быть переход на отдельный экран с подробным описанием
                alert('Раздел "Функционал и описание" находится в разработке.');
            });
        }

        // Кнопка "Открыть" для оферты
        const offerBtn = document.getElementById('info-offer-btn');
        if (offerBtn) {
            offerBtn.addEventListener('click', () => {
                // Замените на реальную ссылку на публичную оферту
                openExternalLink('https://amulex.ru/docs/offer'); 
            });
        }
    }

    // Инициализируем кнопки реферальной программы
    setupReferralButtons();
    
    // Инициализируем кнопки подписки навсегда
    setupForeverSubscriptionButtons();

    // Инициализируем кнопки на странице "Информация"
    setupInfoButtons();

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