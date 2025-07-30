// Получаем объект Telegram Web App
const tg = window.Telegram.WebApp;

// Функция для отображения данных пользователя
function showUserData() {
    const userDataContainer = document.getElementById('user-data');
    
    // Проверяем, что объект initDataUnsafe существует и содержит данные пользователя
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        const userInfo = {
            id: user.id,
            is_bot: user.is_bot,
            first_name: user.first_name,
            last_name: user.last_name || 'N/A',
            username: user.username || 'N/A',
            language_code: user.language_code,
        };
        
        // Преобразуем объект в красивую JSON-строку и выводим
        userDataContainer.textContent = JSON.stringify(userInfo, null, 2);
    } else {
        // Если данные недоступны, сообщаем об этом
        // Это может произойти, если открывать приложение не через Telegram
        userDataContainer.textContent = 'Не удалось получить данные пользователя. Откройте приложение через Telegram.';
    }
}

// Вызываем функцию, когда страница будет готова
document.addEventListener('DOMContentLoaded', () => {
    // Сообщаем Telegram, что приложение готово к отображению
    tg.ready();
    // Показываем данные пользователя
    showUserData();
}); 