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
      sheet.getRange(1, 1, 1, 7).setValues([['Дата', 'Время', 'Пользователь', 'Сообщение', 'Имя', 'Username', 'Telegram ID']]);
      
      // Форматируем заголовки
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      
      // Автоширина колонок
      sheet.autoResizeColumns(1, 7);
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
      data.user_id || ''
    ];
    
    // Добавляем строку в таблицу
    sheet.appendRow(rowData);
    
    // Автоширина для новых данных
    sheet.autoResizeColumns(1, 7);
    
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

// ИСПРАВЛЕННАЯ тестовая функция
function testFunction() {
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
      
      // Добавляем заголовки
      sheet.getRange(1, 1, 1, 7).setValues([['Дата', 'Время', 'Пользователь', 'Сообщение', 'Имя', 'Username', 'Telegram ID']]);
      
      // Форматируем заголовки
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      
      // Автоширина колонок
      sheet.autoResizeColumns(1, 7);
    }
    
    // Подготавливаем тестовые данные
    const now = new Date();
    const dateStr = Utilities.formatDate(now, 'Europe/Moscow', 'dd.MM.yyyy');
    const timeStr = Utilities.formatDate(now, 'Europe/Moscow', 'HH:mm:ss');
    
    const testRowData = [
      dateStr,
      timeStr,
      'Тестовый пользователь (@test) [ID: 123]',
      'Это тестовое сообщение для проверки работы системы',
      'Тестовый пользователь',
      'test',
      '123456789'
    ];
    
    // Добавляем тестовую строку
    sheet.appendRow(testRowData);
    
    // Автоширина колонок
    sheet.autoResizeColumns(1, 7);
    
    console.log('✅ Тест успешно выполнен! Проверьте лист "Жалобы и предложения" в таблице.');
    return 'Тест прошел успешно!';
    
  } catch (error) {
    console.error('❌ Ошибка в тесте:', error);
    return 'Ошибка: ' + error.toString();
  }
}