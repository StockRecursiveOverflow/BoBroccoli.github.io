// ── Google Apps Script: Calendar Scheduler ────────────────────────────────
// Deploy this as a Web App (execute as: Me, access: Anyone).
// Paste the deployment URL into APPS_SCRIPT_URL in index.html.

var OWNER_EMAIL = 'bowen4091761@gmail.com';
var TIMEZONE    = 'America/New_York';

function doPost(e) {
  var cors = ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON);

  try {
    var data = JSON.parse(e.postData.contents);

    var name     = data.name     || 'Visitor';
    var email    = data.email;
    var date     = data.date;          // "YYYY-MM-DD"
    var time     = data.time;          // "HH:MM"
    var duration = parseInt(data.duration) || 60;
    var topic    = data.topic   || 'Meeting';
    var message  = data.message || '';

    if (!email || !date || !time) {
      return cors.setContent(JSON.stringify({ status: 'error', error: 'Missing fields' }));
    }

    // Build start/end Date objects in the owner's timezone
    var startStr = date + 'T' + time + ':00';
    var start = new Date(startStr);
    var end   = new Date(start.getTime() + duration * 60000);

    var title       = 'Meeting with ' + name + (topic ? ' – ' + topic : '');
    var description = 'Requested via portfolio site.\n\n' +
                      'Guest: ' + name + ' <' + email + '>\n' +
                      (topic   ? 'Topic: '   + topic   + '\n' : '') +
                      (message ? '\nNote: '  + message        : '');

    var calendar = CalendarApp.getDefaultCalendar();

    var event = calendar.createEvent(title, start, end, {
      description: description,
      guests:      email,
      sendInvites: true,
    });

    // Add a Google Meet conference link
    event.addPopupReminder(30);

    return cors.setContent(JSON.stringify({ status: 'ok', eventId: event.getId() }));

  } catch (err) {
    return cors.setContent(JSON.stringify({ status: 'error', error: err.message }));
  }
}

// Handles CORS preflight (browsers may send OPTIONS)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
