/**
 * MoliHorario - Google Apps Script Backend for Professor Reviews
 * Moderation-based sheet integration.
 */

function getScriptSecret() {
  return PropertiesService.getScriptProperties().getProperty('SHARED_SECRET') || 'default-secret';
}

function getSpreadsheet() {
  var sheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!sheetId) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
  return SpreadsheetApp.openById(sheetId);
}

function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doGet(e) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('Reviews');
    if (!sheet) {
      return jsonResponse({ success: false, message: 'Reviews sheet not found' }, 404);
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse({ success: true, reviews: [] });
    }

    var headers = data[0];
    var profKeyIdx = headers.indexOf('professor_key');
    var courseCodeIdx = headers.indexOf('course_code');
    var periodIdx = headers.indexOf('period');
    var statusIdx = headers.indexOf('status');

    var filterProfKey = e && e.parameter ? e.parameter.professor_key : null;
    var filterCourseCode = e && e.parameter ? e.parameter.course_code : null;
    var filterPeriod = e && e.parameter ? e.parameter.period : null;

    var approvedReviews = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var status = row[statusIdx];

      // ONLY return approved reviews
      if (status !== 'approved') continue;

      if (filterProfKey && row[profKeyIdx] !== filterProfKey) continue;
      if (filterCourseCode && row[courseCodeIdx] !== filterCourseCode) continue;
      if (filterPeriod && row[periodIdx] !== filterPeriod) continue;

      var tagsRaw = row[headers.indexOf('tags')];
      var tagsList = [];
      if (tagsRaw) {
        try {
          tagsList = typeof tagsRaw === 'string' ? JSON.parse(tagsRaw) : tagsRaw;
        } catch (err) {
          tagsList = String(tagsRaw).split(',').map(function(t) { return t.trim(); });
        }
      }

      approvedReviews.push({
        id: row[headers.indexOf('id')],
        professor_key: row[headers.indexOf('professor_key')],
        professor_name: row[headers.indexOf('professor_name')],
        course_code: row[headers.indexOf('course_code')],
        course_name: row[headers.indexOf('course_name')],
        period: row[headers.indexOf('period')],
        rating: Number(row[headers.indexOf('rating')]),
        tags: tagsList,
        comment: row[headers.indexOf('comment')],
        created_at: row[headers.indexOf('created_at')]
      });
    }

    return jsonResponse({ success: true, reviews: approvedReviews });
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() }, 500);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return jsonResponse({ success: false, message: 'Server busy, try again' }, 503);
  }

  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    // Authenticate shared secret
    var providedSecret = body.secret || (e && e.parameter ? e.parameter.secret : null);
    if (providedSecret !== getScriptSecret()) {
      return jsonResponse({ success: false, message: 'Unauthorized access' }, 401);
    }

    // Input Validation
    if (!body.professor_key || !body.professor_name || !body.course_code || !body.rating) {
      return jsonResponse({ success: false, message: 'Missing required fields' }, 400);
    }

    var rating = Number(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return jsonResponse({ success: false, message: 'Rating must be an integer between 1 and 5' }, 400);
    }

    var comment = body.comment ? String(body.comment).replace(/<[^>]*>?/gm, '').trim() : '';
    var tags = Array.isArray(body.tags) ? body.tags.slice(0, 3) : [];

    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('Reviews');
    if (!sheet) {
      return jsonResponse({ success: false, message: 'Reviews sheet missing' }, 500);
    }

    var newId = 'rev_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
    var createdAt = new Date().toISOString();

    // Sheet Column order:
    // id | professor_key | professor_name | course_code | course_name | period | rating | tags | comment | created_at | status | moderation_notes | fingerprint_hash | report_count
    sheet.appendRow([
      newId,
      body.professor_key,
      body.professor_name,
      body.course_code,
      body.course_name || '',
      body.period || '2026-II',
      rating,
      JSON.stringify(tags),
      comment,
      createdAt,
      'pending', // ALWAYS enters as pending for manual moderation!
      '',
      body.fingerprint_hash || '',
      0
    ]);

    return jsonResponse({
      success: true,
      message: 'Reseña enviada correctamente. Se publicará tras ser moderada.',
      id: newId
    });
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}
