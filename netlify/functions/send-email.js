// /.netlify/functions/send-email.js
const sgMail = require('@sendgrid/mail');


/**
 * for DEMO ONLY: hardcoded API key.
 * Replace the placeholder with your real key from Twilio SendGrid.
 * Rotate/delete this key right after your demo.
 */
sgMail.setApiKey('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');

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { csvContent, to, subject } = JSON.parse(event.body || '{}');

    if (!csvContent) return { statusCode: 400, body: 'CSV content is required' };
    if (!to)         return { statusCode: 400, body: '"to" is required' };

    // Must match your verified Single Sender EXACTLY:
    const from = 'Visitor Check-In <checkinvisitor534@gmail.com>';

    const msg = {
      to,
      from,
      subject: subject || 'Visitor Log CSV',
      text: 'Please find the attached visitor log CSV.',
      html: '<p>Please find the attached visitor log CSV.</p>',
      attachments: [
        {
          content: Buffer.from(csvContent).toString('base64'),
          filename: 'visitor_log.csv',
          type: 'text/csv',
          disposition: 'attachment',
        },
      ],
    };

    await sgMail.send(msg);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    const body = e?.response?.body ? JSON.stringify(e.response.body) : String(e);
    return { statusCode: 500, body };
  }
}
