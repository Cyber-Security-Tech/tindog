document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const messageBox = document.getElementById('signupMessage');

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    const name = signupForm.name.value.trim();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value.trim();

    if (!validateInputs(name, email, password)) return;

    try {
      const res = await fetch('http://localhost:3000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('Signup successful! Redirecting to login...', 'success');
        signupForm.reset();
        setTimeout(() => window.location.href = 'login.html', 1500);
      } else {
        showMessage(data.error || 'Signup failed', 'error');
      }
    } catch (err) {
      console.error('Signup error:', err);
      showMessage('Server error. Please try again later.', 'error');
    }
  });

  function validateInputs(name, email, password) {
    if (!name || !email || !password) {
      showMessage('All fields are required.', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Please enter a valid email address.', 'error');
      return false;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters.', 'error');
      return false;
    }

    return true;
  }

  function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = type;
    messageBox.setAttribute('role', 'alert');
  }

  function clearMessage() {
    messageBox.textContent = '';
    messageBox.className = '';
    messageBox.removeAttribute('role');
  }
});
