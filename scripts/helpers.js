// scripts/helpers.js

export function handleAuthError(res) {
  if (res.status === 401) {
    localStorage.clear();
    alert('Your session has expired. Please log in again.');
    window.location.href = 'login.html';
    return true;
  }
  return false;
}

// Central fetch function that handles token refresh
export async function fetchWithRefresh(url, options = {}) {
  options.credentials = 'include';
  const res = await fetch(url, options);
  if (res.status !== 401) return res;

  // Try refresh token
  const refreshRes = await fetch('http://localhost:3000/api/users/refresh-token', {
    method: 'POST',
    credentials: 'include'
  });

  if (refreshRes.ok) {
    const data = await refreshRes.json();
    const newToken = data.token;
    localStorage.setItem('token', newToken);

    // Retry original request with new access token
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${newToken}`;
    return fetch(url, options);
  } else {
    localStorage.clear();
    alert('Session expired. Please log in again.');
    window.location.href = 'login.html';
  }
}
