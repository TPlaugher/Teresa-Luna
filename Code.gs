const SPREADSHEET_ID = '1GdPNAXYpSNBCfTVvA_Uy2Sa_Ax4LVRGpCDj_F3QXciE';
const SHEET_NAME = 'Recuerdos';

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'list';

    if (action !== 'list') {
      return jsonResponse({ ok: false, error: 'Acción no válida.' });
    }

    const sheet = getSheet_();
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return jsonResponse([]);
    }

    const rows = sheet.getRange(2, 1, lastRow - 1, 7).getValues();

    const memories = rows
      .filter(row => String(row[4]).trim() === 'Aprobado' && row[5] === true)
      .map(row => ({
        date: formatDate_(row[0]),
        name: cleanText_(row[1], 80),
        relation: cleanText_(row[2], 100),
        memory: cleanText_(row[3], 1500)
      }))
      .filter(item => item.name && item.memory)
      .reverse();

    return jsonResponse(memories);
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: 'No se pudieron cargar los recuerdos.' });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'No se recibieron datos.' });
    }

    const data = JSON.parse(e.postData.contents);
    const name = cleanText_(data.name, 80);
    const relation = cleanText_(data.relation, 100);
    const memory = cleanText_(data.memory, 1500);

    if (!name || !memory) {
      return jsonResponse({ ok: false, error: 'El nombre y el recuerdo son obligatorios.' });
    }

    const sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      name,
      relation,
      memory,
      'Pendiente',
      false,
      ''
    ]);

    return jsonResponse({
      ok: true,
      message: 'Gracias. Tu recuerdo fue recibido y será revisado antes de publicarse.'
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: 'No se pudo guardar el recuerdo.' });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error('No se encontró la pestaña "' + SHEET_NAME + '".');
  }

  return sheet;
}

function cleanText_(value, maxLength) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function formatDate_(value) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return '';
  return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
