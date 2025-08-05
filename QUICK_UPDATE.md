# Быстрое обновление для отправки в основной лист

## Что изменилось:
Теперь все жалобы и предложения будут отправляться в основной лист вашей таблицы (Лист1), а не создавать отдельный лист.

## Что нужно сделать:

### 1. Обновить Google Apps Script
Замените в вашем Google Apps Script строку:
```javascript
const SHEET_NAME = 'Жалобы и предложения';
```

На:
```javascript
const SHEET_NAME = 'Лист1';
```

### 2. Обновить логику заголовков
Замените блок кода с проверкой листа на новый (полный код в GOOGLE_SETUP_INSTRUCTIONS.md):

**Старый код:**
```javascript
if (!sheet) {
  sheet = ss.insertSheet(SHEET_NAME);
  // заголовки...
}
```

**Новый код:**
```javascript
if (!sheet) {
  sheet = ss.insertSheet(SHEET_NAME);
}

// Проверяем, есть ли заголовки
const firstRow = sheet.getRange(1, 1, 1, 7).getValues()[0];
const hasHeaders = firstRow.some(cell => cell && cell.toString().trim() !== '');

if (!hasHeaders) {
  // Добавляем заголовки только если их нет
  sheet.getRange(1, 1, 1, 7).setValues([['Дата', 'Время', 'Пользователь', 'Сообщение', 'Имя', 'Username', 'Telegram ID']]);
  // форматирование...
}
```

## Результат:
- ✅ Все данные в одном листе
- ✅ Заголовки добавляются только если лист пустой
- ✅ Существующие данные не затираются
- ✅ Новые записи добавляются в конец таблицы