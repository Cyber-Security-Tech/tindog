// signup.js → handles user registration

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const messageBox = document.getElementById('signupMessage');

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageBox.textContent = '';
    messageBox.className = '';

    const name = signupForm.name.value.trim();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value.trim();

    // 🔒 Simple front-end validation
    if (!name || !email || !password) {
      displayMessage('All fields are required.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      displayMessage('Please enter a valid email address.', 'error');
      return;
    }

    if (password.length < 6) {
      displayMessage('Password must be at least 6 characters.', 'error');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        displayMessage('Signup successful! Redirecting to login...', 'success');
        signupForm.reset();
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } else {
        displayMessage(data.error || 'Signup failed', 'error');
      }
    } catch (err) {
      console.error('Signup error:', err);
      displayMessage('Server error. Please try again later.', 'error');
    }
  });

  function displayMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = type;
    messageBox.setAttribute('role', 'alert');
  }
});
