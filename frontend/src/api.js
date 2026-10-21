const BASE_URL = (import.meta.env.VITE_API_URL || 'https://ps8-helpdesk.onrender.com').replace(/\/+$/, '');
export const apiRequest = async (path, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};
