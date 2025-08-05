# Инструкция по настройке Google Apps Script для жалоб и предложений

## Шаг 1: Создание Google Apps Script

1. Откройте вашу Google Таблицу: https://docs.google.com/spreadsheets/d/1tr2ZWlcOSFkgInxm8iOS9tc0M8KxPgCZ3PbVro06iP4/edit
2. Перейдите в меню **Расширения** → **Apps Script**
3. Удалите весь код в редакторе и вставьте следующий:

```javascript
function doPost(e) {
  try {
    // ID вашей таблицы (из URL)
    const SPREADSHEET_ID = '1tr2ZWlcOSFkgInxm8iOS9tc0M8KxPgCZ3PbVro06iP4';
    const SHEET_NAME = 'Жалобы и предложения'; // Лист для жалоб и предложений
    
    // Получаем данные из POST запроса
    const data = JSON.parse(e.postData.contents);
    
    // Открываем таблицу
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Если лист не найден, создаем его
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      
      // Добавляем заголовки для нового листа
      sheet.getRange(1, 1, 1, 8).setValues([['Дата', 'Время', 'Пользователь', 'Сообщение', 'Имя', 'Username', 'Telegram ID', 'Источник']]);
      
      // Форматируем заголовки
      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      
      // Автоширина колонок
      sheet.autoResizeColumns(1, 8);
    }
    
    // Подготавливаем данные для записи
    const now = new Date();
    const dateStr = Utilities.formatDate(now, 'Europe/Moscow', 'dd.MM.yyyy');
    const timeStr = Utilities.formatDate(now, 'Europe/Moscow', 'HH:mm:ss');
    
    const rowData = [
      dateStr,
      timeStr,
      data.user || 'Аноним',
      data.message || '',
      data.full_name || '',
      data.username || '',
      data.user_id || '',
      data.source || 'Неизвестный источник'
    ];
    
    // Добавляем строку в таблицу
    sheet.appendRow(rowData);
    
    // Автоширина для новых данных
    sheet.autoResizeColumns(1, 8);
    
    // Возвращаем успешный ответ
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Данные записаны'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Логируем ошибку
    console.error('Ошибка:', error);
    
    // Возвращаем ошибку
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({message: 'Webhook для жалоб и предложений работает'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Тестовая функция для проверки
function testFunction() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        user: 'Тестовый пользователь',
        message: 'Это тестовое сообщение'
      })
    }
  };
  
  const result = doPost(testData);
  console.log(result.getContent());
}
```

## Шаг 2: Развертывание веб-приложения

1. Нажмите **Сохранить** (Ctrl+S)
2. Дайте проекту имя: "Webhook жалоб и предложений"
3. Нажмите **Развернуть** → **Новое развертывание**
4. Нажмите на иконку шестеренки и выберите **Веб-приложение**
5. Установите параметры:
   - **Описание**: "Webhook для жалоб и предложений"
   - **Выполнить как**: "Я"
   - **У кого есть доступ**: "Все"
6. Нажмите **Развернуть**
7. При необходимости предоставьте разрешения
8. **СКОПИРУЙТЕ URL веб-приложения** - он выглядит примерно так:
   `https://script.google.com/macros/s/ВАШИ_СИМВОЛЫ/exec`

## Шаг 3: Обновление кода приложения

Замените в файле `script.js` строку:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

На ваш реальный URL:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ВАШИ_СИМВОЛЫ/exec';
```

## Шаг 4: Тестирование

1. В Apps Script нажмите **Выполнить** → **testFunction** для проверки
2. Проверьте, что в таблице появился новый лист "Жалобы и предложения" с заголовками и тестовой записью
3. Протестируйте отправку жалобы через мини-приложение

## Структура данных в таблице

Таблица будет содержать следующие колонки:
- **Дата** - дата отправки (ДД.ММ.ГГГГ)
- **Время** - время отправки (ЧЧ:ММ:СС)
- **Пользователь** - полная информация о пользователе (имя + @username + [ID])
- **Сообщение** - текст жалобы или предложения
- **Имя** - имя и фамилия пользователя из Telegram
- **Username** - @username пользователя (без @)
- **Telegram ID** - уникальный ID пользователя в Telegram
- **Источник** - откуда отправлено (Страница документов - жалоба / Страница бонусов - предложение)

## Примечания

- Данные сохраняются в отдельный лист "Жалобы и предложения" в реальном времени
- Лист создается автоматически при первом обращении
- Заголовки добавляются автоматически при создании листа
- Если Google Apps Script недоступен, сообщения отправляются в Telegram как fallback
- Все ошибки логируются в консоль Apps Script
- Данные добавляются в конец таблицы