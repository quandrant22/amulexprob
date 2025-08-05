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
            sendComplaintBtn.addEventListener('click', () => {
                const textarea = document.querySelector('.complaints-input-section textarea');
                const text = textarea ? textarea.value.trim() : '';
                if (text) {
                    // Отправляем жалобу/предложение через Telegram
                    const message = `Жалоба/предложение от пользователя:\n\n${text}`;
                    const telegramUrl = `https://t.me/mihail_rein?text=${encodeURIComponent(message)}`;
                    openExternalLink(telegramUrl);
                    
                    // Очищаем поле и показываем уведомление
                    textarea.value = '';
                    alert('Спасибо за ваше обращение! Мы обязательно рассмотрим его.');
                } else {
                    alert('Пожалуйста, введите текст жалобы или предложения');
                }
            });
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