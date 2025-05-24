document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('favorites-container');
  const logoutButton = document.getElementById('logout-button');

  let token = localStorage.getItem('token');
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
      credentials: 'include'
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem('token', data.token);
      token = data.token;
      options.headers = options.headers || {};
      options.headers.Authorization = `Bearer ${token}`;
      return fetch(url, options);
    } else {
      forceLogout();
    }
  }

  if (!token || !isLoggedIn) {
    forceLogout();
    return;
  }

  logoutButton?.addEventListener('click', () => {
    localStorage.clear();
    alert('You have been logged out.');
    window.location.href = 'index.html';
  });

  try {
    const res = await fetchWithRefresh('http://localhost:3000/api/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Failed with status ${res.status}`);
    const favorites = await res.json();

    if (!Array.isArray(favorites) || favorites.length === 0) {
      showMessage('You have no favorite dogs yet.');
      return;
    }

    favorites.forEach(fav => {
      const dog = fav.dog || fav;
      if (!dog?.id || !dog.name) return;

      const card = document.createElement('div');
      card.className = 'col-md-4';
      card.innerHTML = `
        <div class="card shadow-sm position-relative">
          <img src="${dog.image}" class="card-img-top" alt="${dog.name}">
          <div class="card-body">
            <h5 class="card-title">${dog.name}</h5>
            <p class="card-text">${dog.age} • ${dog.breed}</p>
            <p class="card-text">${dog.about}</p>
            <button class="btn btn-danger w-100 remove-fav-btn" data-id="${dog.id}">Remove Favorite</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    container.addEventListener('click', async (e) => {
      if (!e.target.classList.contains('remove-fav-btn')) return;

      const dogId = e.target.dataset.id;

      try {
        const res = await fetchWithRefresh(`http://localhost:3000/api/favorites/${dogId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok) {
          e.target.closest('.col-md-4').remove();
          if (container.querySelectorAll('.col-md-4').length === 0) {
            showMessage('You have no favorite dogs left.');
          }
        } else {
          console.error(data.error);
          alert(data.error || 'Failed to remove favorite.');
        }
      } catch (err) {
        console.error('Error removing favorite:', err);
        alert('Server error while removing favorite.');
      }
    });

  } catch (err) {
    console.error('Error loading favorites:', err);
    showMessage('Failed to load favorites.', 'error');
  }

  function showMessage(text, type = 'info') {
    container.innerHTML = `
      <p class="text-center text-${type === 'error' ? 'danger' : 'secondary'}" role="alert">${text}</p>
    `;
  }
});
