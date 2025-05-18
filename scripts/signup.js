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

        try {
            const res = await fetch('http://localhost:3000/api/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                messageBox.textContent = 'Signup successful! Redirecting to login...';
                messageBox.classList.add('success');
                signupForm.reset();
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                messageBox.textContent = data.error || 'Signup failed';
                messageBox.classList.add('error');
            }
        } catch (err) {
            console.error('Signup error:', err);
            messageBox.textContent = 'Server error, please try again later.';
            messageBox.classList.add('error');
        }
    });
});
