document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logout-button');
  const profileForm = document.getElementById('profileForm');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileMessage = document.getElementById('profileMessage');
  const favoritesCount = document.getElementById('favoritesCount');

  const passwordForm = document.getElementById('passwordForm');
  const currentPassword = document.getElementById('currentPassword');
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  const passwordMessage = document.getElementById('passwordMessage');

  const deleteBtn = document.getElementById('deleteAccountButton');
  const deleteMessage = document.getElementById('deleteMessage');

  const token = localStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  function forceLogout() {
    localStorage.clear();
    alert('Session expired. Please log in again.');
    window.location.href = 'login.html';
  }

  async function fetchWithRefresh(url, options = {}) {
    const res = await fetch(url, options);
    if (res.status !== 401) return res;

    const refreshRes = await fetch('http://localhost:3000/api/users/refresh-token', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem('token', data.token);
      options.headers.Authorization = `Bearer ${data.token}`;
      return fetch(url, options);
    } else {
      forceLogout();
    }
  }

  if (!isLoggedIn || !token) {
    forceLogout();
    return;
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    alert('You have been logged out.');
    window.location.href = 'index.html';
  });

  try {
    const res = await fetchWithRefresh('http://localhost:3000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to load user');

    const user = await res.json();
    profileName.value = user.name;
    profileEmail.value = user.email;
    if (favoritesCount) favoritesCount.textContent = user.totalFavorites ?? '0';
  } catch (err) {
    console.error('Error loading profile:', err);
    profileMessage.textContent = 'Failed to load profile.';
    profileMessage.className = 'text-danger';
  }

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    profileMessage.textContent = '';
    profileMessage.className = '';

    const updatedName = profileName.value.trim();
    const updatedEmail = profileEmail.value.trim();

    try {
      const res = await fetchWithRefresh('http://localhost:3000/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: updatedName, email: updatedEmail })
      });

      const data = await res.json();

      if (res.ok) {
        profileMessage.textContent = 'Profile updated successfully.';
        profileMessage.className = 'text-success';
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        profileMessage.textContent = data.error || 'Failed to update profile.';
        profileMessage.className = 'text-danger';
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      profileMessage.textContent = 'Server error. Please try again.';
      profileMessage.className = 'text-danger';
    }
  });

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    passwordMessage.textContent = '';
    passwordMessage.className = '';

    const current = currentPassword.value.trim();
    const next = newPassword.value.trim();
    const confirm = confirmPassword.value.trim();

    if (!current || !next || !confirm) {
      passwordMessage.textContent = 'All fields are required.';
      passwordMessage.className = 'text-danger';
      return;
    }

    if (next.length < 6) {
      passwordMessage.textContent = 'New password must be at least 6 characters.';
      passwordMessage.className = 'text-danger';
      return;
    }

    if (next !== confirm) {
      passwordMessage.textContent = 'New passwords do not match.';
      passwordMessage.className = 'text-danger';
      return;
    }

    try {
      const res = await fetchWithRefresh('http://localhost:3000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword: current, newPassword: next })
      });

      const data = await res.json();

      if (res.ok) {
        passwordMessage.textContent = 'Password updated successfully.';
        passwordMessage.className = 'text-success';
        passwordForm.reset();
      } else {
        passwordMessage.textContent = data.error || 'Failed to update password.';
        passwordMessage.className = 'text-danger';
      }
    } catch (err) {
      console.error('Password change error:', err);
      passwordMessage.textContent = 'Server error. Please try again.';
      passwordMessage.className = 'text-danger';
    }
  });

  deleteBtn.addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to permanently delete your account?');
    if (!confirmed) return;

    try {
      const res = await fetchWithRefresh('http://localhost:3000/api/users/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await res.json();

      if (res.ok) {
        deleteMessage.textContent = 'Account deleted. Redirecting...';
        deleteMessage.className = 'text-success';
        localStorage.clear();
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        deleteMessage.textContent = data.error || 'Failed to delete account.';
        deleteMessage.className = 'text-danger';
      }
    } catch (err) {
      console.error('Delete account error:', err);
      deleteMessage.textContent = 'Server error. Please try again.';
      deleteMessage.className = 'text-danger';
    }
  });
});
