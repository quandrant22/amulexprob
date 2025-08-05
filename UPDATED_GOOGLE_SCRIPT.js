function doPost(e) {
  try {
    // ID вашей таблицы (из URL)
    const SPREADSHEET_ID = '1tr2ZWlcOSFkgInxm8iOS9tc0M8KxPgCZ3PbVro06iP4';
    const SHEET_NAME = 'Жалобы и предложения';
    
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

// Простая тестовая функция
function createTestSheet() {
  try {
    // ID вашей таблицы
    const SPREADSHEET_ID = '1tr2ZWlcOSFkgInxm8iOS9tc0M8KxPgCZ3PbVro06iP4';
    const SHEET_NAME = 'Жалобы и предложения';
    
    // Открываем таблицу
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Если лист не найден, создаем его
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      console.log('✅ Лист "Жалобы и предложения" создан');
    } else {
      console.log('✅ Лист "Жалобы и предложения" уже существует');
    }
    
    // Добавляем заголовки
    sheet.getRange(1, 1, 1, 8).setValues([['Дата', 'Время', 'Пользователь', 'Сообщение', 'Имя', 'Username', 'Telegram ID', 'Источник']]);
    
    // Форматируем заголовки
    const headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    // Автоширина колонок
    sheet.autoResizeColumns(1, 8);
    
    // Добавляем тестовые записи
    const now = new Date();
    const dateStr = Utilities.formatDate(now, 'Europe/Moscow', 'dd.MM.yyyy');
    const timeStr = Utilities.formatDate(now, 'Europe/Moscow', 'HH:mm:ss');
    
    // Тестовая жалоба
    const testComplaintData = [
      dateStr,
      timeStr,
      'Тестовый пользователь (@test) [ID: 123]',
      'Это тестовая жалоба с страницы документов',
      'Тестовый пользователь',
      'test',
      '123456789',
      'Страница документов - жалоба'
    ];
    
    // Тестовое предложение
    const testSuggestionData = [
      dateStr,
      timeStr,
      'Другой пользователь (@user2) [ID: 456]',
      'Это тестовое предложение со страницы бонусов',
      'Другой пользователь',
      'user2',
      '456789123',
      'Страница бонусов - предложение'
    ];
    
    // Добавляем тестовые строки
    sheet.appendRow(testComplaintData);
    sheet.appendRow(testSuggestionData);
    
    // Автоширина колонок
    sheet.autoResizeColumns(1, 8);
    
    console.log('✅ Тест успешно выполнен! Проверьте лист "Жалобы и предложения" в таблице.');
    return 'Тест прошел успешно!';
    
  } catch (error) {
    console.error('❌ Ошибка в тесте:', error);
    return 'Ошибка: ' + error.toString();
  }
}