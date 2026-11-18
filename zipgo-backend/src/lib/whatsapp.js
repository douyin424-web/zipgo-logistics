'use strict';

// Sends the login code with the Meta WhatsApp Cloud API.
// Messages a business starts must use an approved template — create an
// "Authentication" template in WhatsApp Manager and put its name in .env.

function isConfigured(wa) {
  return Boolean(wa.token && wa.phoneNumberId);
}

async function sendLoginCode(wa, phone, code) {
  const url = `https://graph.facebook.com/${wa.apiVersion}/${wa.phoneNumberId}/messages`;
  const body = wa.messageType === 'text' ? textMessage(phone, code) : {
    messaging_product: 'whatsapp',
    to: phone.replace(/^\+/, ''),
    type: 'template',
    template: {
      name: wa.templateName,
      language: { code: wa.templateLang },
      components: [
        { type: 'body', parameters: [{ type: 'text', text: code }] },
        { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
      ],
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${wa.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WhatsApp API ${res.status}: ${text.slice(0, 300)}`);
  }
}

function textMessage(phone, code) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone.replace(/^\+/, ''),
    type: 'text',
    text: { body: `*ZipGo Express*\nYour login code is *${code}*. It is valid for 5 minutes. Do not share it with anyone.` },
  };
}

module.exports = { isConfigured, sendLoginCode };
