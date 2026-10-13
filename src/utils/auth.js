const AUTH_KEY = import.meta.env.VITE_AUTH_KEY;
const SESSION_HOURS = 8;

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export function login(email, password) {
  const valid =
    email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  if (!valid) return false;

  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      email: ADMIN_EMAIL,
      expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
    }),
  );
  return true;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated() {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_KEY));
    if (!session || Date.now() > session.expiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return false;
  }
}
