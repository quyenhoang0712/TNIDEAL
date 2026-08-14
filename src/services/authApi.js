async function sendAuthRequest(endpoint, form) {
  const response = await fetch(`/api/auth/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không thể xác thực tài khoản');
  return data;
}

export const login = (form) => sendAuthRequest('login', form);
export const register = (form) => sendAuthRequest('register', form);
