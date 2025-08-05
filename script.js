document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    // Элементы для услуг
    const servicesArea = document.querySelector('.services-area');

    // Элементы навигации
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');

    // Функция переключения экранов
    function switchScreen(targetScreenId) {
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
    }

    // Обработчики для навигации
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.getAttribute('data-screen');
            switchScreen(screenId);
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
                    alert('Переход к заказу юридического анализа за 250 рублей');
                } else if (text.includes('шаблон документа')) {
                    alert('Переход к получению шаблона документа');
                } else if (text.includes('Амулекс')) {
                    openExternalLink('https://amulex.ru/docs');
                }
            });
        });

        // Кнопка "Отправить запрос"
        const helpBtn = document.querySelector('.help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                openExternalLink('https://t.me/mihail_rein');
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