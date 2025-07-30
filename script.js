document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    // Элементы для чата
    const chatArea = document.querySelector('.chat-area');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

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
    }

    // Обработчики для навигации
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.getAttribute('data-screen');
            switchScreen(screenId);
        });
    });

    // Функция отправки сообщения в чате
    function sendMessage() {
        const text = messageInput.value.trim();

        if (text === '') {
            return;
        }

        // Создаем и добавляем сообщение пользователя
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = text;
        messageElement.appendChild(messageParagraph);
        chatArea.appendChild(messageElement);

        // Очищаем поле ввода и сбрасываем его высоту
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Прокручиваем чат вниз
        chatArea.scrollTop = chatArea.scrollHeight;

        // Имитируем ответ бота через 1-2 секунды
        setTimeout(() => {
            addBotMessage("Спасибо за ваш вопрос! Я обрабатываю информацию и скоро дам вам подробный ответ.");
            updateMessageCounter();
        }, 1000 + Math.random() * 1000);
    }

    // Функция добавления сообщения бота
    function addBotMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = text;
        messageElement.appendChild(messageParagraph);
        chatArea.appendChild(messageElement);
        
        // Прокручиваем чат вниз
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Функция обновления счетчика сообщений
    function updateMessageCounter() {
        const counter = document.querySelector('.message-counter span');
        if (counter) {
            const currentCount = parseInt(counter.textContent.match(/\d+/)[0]);
            const newCount = Math.max(0, currentCount - 1);
            counter.textContent = `Осталось сообщений: ${newCount}`;
            
            // Если сообщения закончились, показываем предложение оплаты
            if (newCount === 0) {
                setTimeout(() => {
                    addBotMessage("У вас закончились бесплатные сообщения. Перейдите в раздел 'Профиль' для улучшения тарифного плана.");
                }, 500);
            }
        }
    }

    // Обработчики для чата
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (messageInput) {
        // Обработчик для клавиши Enter
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });

        // Автоматическое изменение высоты поля ввода
        messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = (messageInput.scrollHeight) + 'px';
        });
    }

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