// login.js → handles user login

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageBox = document.getElementById('loginMessage');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    displayMessage('', '');

    const email = loginForm.loginEmail.value.trim();
    const password = loginForm.loginPassword.value.trim();

    if (!email || !password) {
      displayMessage('Please fill in all fields.', 'error');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        localStorage.setItem('isLoggedIn', 'true');
        displayMessage('Login successful! Redirecting...', 'success');

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        displayMessage(data.error || 'Invalid email or password.', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      displayMessage('Server error, please try again later.', 'error');
    }
  });

  function displayMessage(message, type) {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = type;
    messageBox.setAttribute('role', 'alert');
  }
});
