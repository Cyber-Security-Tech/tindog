// auth.js
// Handles signup and login logic for TinDog, including validation, error handling, and localStorage operations

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById('signupForm');
    const signupMessageBox = document.getElementById('signupMessage');
    const loginForm = document.getElementById('loginForm');
    const loginMessageBox = document.getElementById('loginMessage');

    // Signup form handling
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearSignupMessages();

            const name = signupForm.name.value.trim();
            const email = signupForm.email.value.trim();
            const password = signupForm.password.value;
            const confirmPassword = signupForm.confirmPassword.value;

            const errors = validateSignupForm(name, email, password, confirmPassword);

            if (errors.length > 0) {
                displaySignupErrors(errors);
            } else {
                try {
                    saveUser(name, email, password);
                    signupMessageBox.textContent = 'Signup successful!';
                    signupMessageBox.classList.add('success');
                    signupForm.reset();
                } catch (error) {
                    console.error('Error saving user:', error);
                    signupMessageBox.textContent = error.message || 'An error occurred. Please try again.';
                    signupMessageBox.classList.add('error');
                }
            }
        });
    }

    // Login form handling
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearLoginMessages();

            const email = loginForm.loginEmail.value.trim();
            const password = loginForm.loginPassword.value;

            const error = validateLoginForm(email, password);

            if (error) {
                displayLoginError(error);
            } else {
                try {
                    const user = authenticateUser(email, password);
                    loginMessageBox.textContent = `Welcome back, ${user.name}! Redirecting...`;
                    loginMessageBox.classList.add('success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } catch (error) {
                    console.error('Login failed:', error);
                    loginMessageBox.textContent = error.message;
                    loginMessageBox.classList.add('error');
                }
            }
        });
    }

    // ----- Shared utility functions -----

    function validateSignupForm(name, email, password, confirmPassword) {
        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name) errors.push('Name is required.');
        if (!email) errors.push('Email is required.');
        else if (!emailRegex.test(email)) errors.push('Invalid email format.');
        if (!password) errors.push('Password is required.');
        else if (password.length < 6) errors.push('Password must be at least 6 characters.');
        if (password !== confirmPassword) errors.push('Passwords do not match.');

        return errors;
    }

    function displaySignupErrors(errors) {
        signupMessageBox.innerHTML = errors.map(err => `<p class="error">${err}</p>`).join('');
    }

    function clearSignupMessages() {
        signupMessageBox.textContent = '';
        signupMessageBox.classList.remove('error', 'success');
    }

    function saveUser(name, email, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(user => user.email === email)) {
            throw new Error('User already exists.');
        }
        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));
    }

    function validateLoginForm(email, password) {
        if (!email) return 'Email is required.';
        if (!password) return 'Password is required.';
        return null;
    }

    function displayLoginError(error) {
        loginMessageBox.textContent = error;
        loginMessageBox.classList.add('error');
    }

    function clearLoginMessages() {
        loginMessageBox.textContent = '';
        loginMessageBox.classList.remove('error', 'success');
    }

    function authenticateUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);
        if (!user) {
            throw new Error('Invalid email or password.');
        }
        return user;
    }
});
