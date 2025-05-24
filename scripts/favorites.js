// favorites.js → Handles fetching and removing favorite dogs
import { fetchWithRefresh, handleAuthError } from './helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('favorites-container');
  const logoutButton = document.getElementById('logout-button');

  const token = localStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!token || !isLoggedIn) {
    alert('Please log in to view your favorites.');
    window.location.href = 'login.html';
    return;
  }

  logoutButton?.addEventListener('click', () => {
    localStorage.clear();
    alert('You have been logged out.');
    window.location.href = 'index.html';
  });

  try {
    const res = await fetchWithRefresh('http://localhost:3000/api/favorites', {
      method: 'GET',
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (handleAuthError(res)) return;

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
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (handleAuthError(res)) return;

        const data = await res.json();
        if (res.ok) {
          e.target.closest('.col-md-4')?.remove();
          if (container.querySelectorAll('.col-md-4').length === 0) {
            showMessage('You have no favorite dogs left.');
          }
        } else {
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
