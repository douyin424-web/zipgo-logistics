// Shared helper: sends form data to the ZipGo inbox via FormSubmit (AJAX).
export const CONTACT_EMAIL = 'contactzipgopk@gmail.com';

const ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

export async function sendForm(fields) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _template: 'table',
      _captcha: 'false',
      ...fields
    })
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // FormSubmit answers { success: "true" | "false", message }
  if (!response.ok || !data || String(data.success) !== 'true') {
    throw new Error((data && data.message) || 'Form submission failed');
  }
  return data;
}
