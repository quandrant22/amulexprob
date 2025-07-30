document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    const chatArea = document.querySelector('.chat-area');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

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

        // Здесь в будущем будет логика ответа бота
    }

    // Обработчик для кнопки "Отправить"
    sendButton.addEventListener('click', sendMessage);

    // Обработчик для клавиши Enter
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Предотвращаем перенос строки
            sendMessage();
        }
    });

    // Автоматическое изменение высоты поля ввода
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });

    // Расширяем область для клика на всю обертку
    const inputWrapper = document.querySelector('.input-wrapper');
    inputWrapper.addEventListener('click', (event) => {
        // Если клик не по кнопке, фокусируемся на поле ввода
        if(event.target !== sendButton && !sendButton.contains(event.target)) {
            messageInput.focus();
        }
    });
});
