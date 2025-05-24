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
