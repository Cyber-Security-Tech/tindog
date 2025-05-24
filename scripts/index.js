import { fetchWithRefresh, handleAuthError } from './helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('dogs-container');
  const logoutBtn = document.getElementById('logout-button');
  const signupLink = document.getElementById('signup-link');
  const loginLink = document.getElementById('login-link');

  let token = localStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  function logout() {
    localStorage.clear();
    alert('You have been logged out.');
    window.location.href = 'login.html';
  }

  if (isLoggedIn && token) {
    signupLink?.classList.add('d-none');
    loginLink?.classList.add('d-none');
    logoutBtn?.classList.remove('d-none');
  } else {
    logoutBtn?.classList.add('d-none');
  }

  logoutBtn?.addEventListener('click', logout);

  let favoriteDogIds = [];

  if (isLoggedIn && token) {
    try {
      const favRes = await fetchWithRefresh('http://localhost:3000/api/favorites', {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!handleAuthError(favRes) && favRes.ok) {
        const favorites = await favRes.json();
        favoriteDogIds = favorites.map(f => f.id || f.dogId || (f.dog && f.dog.id));
      }
    } catch (err) {
      console.warn('Failed to load favorites:', err);
    }
  }

  try {
    const dogRes = await fetch('http://localhost:3000/api/dogs', { credentials: 'include' });
    if (!dogRes.ok) throw new Error(`Dog fetch failed: ${dogRes.status}`);

    const raw = await dogRes.text();
    let dogs;
    try {
      dogs = JSON.parse(raw);
    } catch (err) {
      throw new Error('Dog response is not valid JSON. Raw content: ' + raw);
    }

    container.innerHTML = '';

    if (!Array.isArray(dogs) || dogs.length === 0) {
      container.innerHTML = '<p class="text-center">No dogs available.</p>';
      return;
    }

    dogs.forEach((dog) => {
      const isFavorited = favoriteDogIds.includes(dog.id);
      const card = document.createElement('div');
      card.className = 'col-md-4';
      card.innerHTML = `
        <div class="card shadow-sm position-relative">
          <img src="${dog.image}" class="card-img-top" alt="${dog.name}">
          <div class="card-body">
            <h5 class="card-title">${dog.name}</h5>
            <p class="card-text">${dog.age} • ${dog.breed}</p>
            <p class="card-text">${dog.about}</p>
            <i class="${isFavorited ? 'fa-solid' : 'fa-regular'} fa-heart heart-icon ${isFavorited ? 'text-danger' : ''}" data-id="${dog.id}" style="cursor: pointer; font-size: 1.4rem;"></i>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    container.addEventListener('click', async (e) => {
      if (!e.target.classList.contains('heart-icon')) return;

      if (!isLoggedIn || !token) {
        alert('Please log in to favorite dogs.');
        return;
      }

      const icon = e.target;
      const dogId = icon.dataset.id;
      const isFavorited = icon.classList.contains('fa-solid');
      const method = isFavorited ? 'DELETE' : 'POST';

      try {
        const res = await fetchWithRefresh(`http://localhost:3000/api/favorites/${dogId}`, {
          method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: isFavorited ? null : JSON.stringify({ dogId })
        });

        if (handleAuthError(res)) return;

        if (res.ok) {
          icon.classList.toggle('fa-solid');
          icon.classList.toggle('fa-regular');
          icon.classList.toggle('text-danger');
        } else {
          const data = await res.json();
          alert(data.error || 'Could not update favorites.');
        }
      } catch (err) {
        console.error('Favorite toggle error:', err);
        alert('Server error while updating favorites.');
      }
    });

  } catch (err) {
    console.error('Error loading dogs:', err);
    container.innerHTML = `<p class="text-danger text-center">Failed to load dogs. ${err.message}</p>`;
  }
});
