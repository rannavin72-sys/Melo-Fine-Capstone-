const BASE = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  sendSignupOtp: (email) =>
    request('/auth/send-signup-otp', { method: 'POST', body: JSON.stringify({ email }) }),

  verifyAndRegister: ({ username, email, password, otp }) =>
    request('/auth/verify-and-register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, otp }),
    }),

  login: ({ email, password }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Music
  searchSongs: (query) =>
    request(`/music/search?query=${encodeURIComponent(query)}`),

  getTrendingSongs: () =>
    request('/music/trending'),
};
