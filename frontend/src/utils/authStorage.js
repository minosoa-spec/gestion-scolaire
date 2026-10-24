const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';

export function setAuthData({ access, refresh, user, rememberMe }) {
  const storage = rememberMe ? localStorage : sessionStorage;
  const autre = rememberMe ? sessionStorage : localStorage;

  storage.setItem(ACCESS_KEY, access);
  storage.setItem(REFRESH_KEY, refresh);
  storage.setItem(USER_KEY, JSON.stringify(user));

  autre.removeItem(ACCESS_KEY);
  autre.removeItem(REFRESH_KEY);
  autre.removeItem(USER_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY) || sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
}

export function updateAccessToken(newAccess) {
  if (localStorage.getItem(REFRESH_KEY)) {
    localStorage.setItem(ACCESS_KEY, newAccess);
  } else if (sessionStorage.getItem(REFRESH_KEY)) {
    sessionStorage.setItem(ACCESS_KEY, newAccess);
  }
}

export function clearAuthData() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}