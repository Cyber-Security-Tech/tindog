// login.js → handles user login

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageBox.textContent = '';
        messageBox.className = '';

        const email = loginForm.loginEmail.value.trim();
        const password = loginForm.loginPassword.value.trim();

        if (!email || !password) {
            messageBox.textContent = 'Please fill in all fields.';
            messageBox.classList.add('error');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/users/login', {  // ✅ make sure this matches backend
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('isLoggedIn', 'true');
                messageBox.textContent = 'Login successful! Redirecting...';
                messageBox.classList.add('success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                messageBox.textContent = data.error || 'Invalid email or password.';
                messageBox.classList.add('error');
            }
        } catch (err) {
            console.error('Login error:', err);
            messageBox.textContent = 'Server error, please try again later.';
            messageBox.classList.add('error');
        }
    });
});
