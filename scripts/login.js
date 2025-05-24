// login.js – Handles user login and stores access token

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageBox = document.getElementById('loginMessage');

  // Show alert message
  function displayMessage(message, type) {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = type;
    messageBox.setAttribute('role', 'alert');
  }

  // Validate email/password before submission
  function validateForm(email, password) {
    if (!email || !password) {
      displayMessage('Please fill in all fields.', 'error');
      return false;
    }
    return true;
  }

  // Handle login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    displayMessage('', '');

    const email = loginForm.loginEmail.value.trim();
    const password = loginForm.loginPassword.value.trim();

    if (!validateForm(email, password)) return;

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // important for refresh token cookie
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save session info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        localStorage.setItem('isLoggedIn', 'true');

        displayMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
      } else {
        displayMessage(data.error || 'Invalid email or password.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      displayMessage('Server error. Please try again later.', 'error');
    }
  });
});
