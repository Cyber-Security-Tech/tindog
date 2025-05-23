document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('dogs-container');
  const logoutBtn = document.getElementById('logout-button');
  const signupLink = document.getElementById('signup-link');
  const loginLink = document.getElementById('login-link');

  const token = localStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  let user = {};
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : {};
  } catch (err) {
    console.warn('Invalid user in localStorage:', err);
    user = {};
  }

  let favoriteDogIds = [];

  if (isLoggedIn && token) {
    signupLink?.classList.add('d-none');
    loginLink?.classList.add('d-none');
    logoutBtn?.classList.remove('d-none');
  } else {
    logoutBtn?.classList.add('d-none');
  }

  logoutBtn?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });

  if (isLoggedIn && token) {
    try {
      const res = await fetch('http://localhost:3000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const favorites = await res.json();
        favoriteDogIds = favorites.map(f => f.id || f.dogId || (f.dog && f.dog.id));
      }
    } catch (err) {
      console.warn('Could not load favorites:', err);
    }
  }

  try {
    const dogRes = await fetch('http://localhost:3000/api/dogs');
    if (!dogRes.ok) throw new Error(`Dog fetch failed: ${dogRes.status}`);

    const raw = await dogRes.text();
    console.log('Raw dog API response:', raw);

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

      const icon = e.target;
      const dogId = icon.dataset.id;

      if (!isLoggedIn || !token) {
        alert('Please log in to favorite dogs.');
        return;
      }

      const isFavorited = icon.classList.contains('fa-solid');
      const url = `http://localhost:3000/api/favorites/${dogId}`;
      const method = isFavorited ? 'DELETE' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: isFavorited ? null : JSON.stringify({ dogId }),
        });

        let responseData = {};
        try {
          responseData = await res.json();
        } catch (jsonErr) {
          console.warn('Favorite JSON parse error:', jsonErr);
        }

        if (res.ok) {
          icon.classList.toggle('fa-solid');
          icon.classList.toggle('fa-regular');
          icon.classList.toggle('text-danger');
        } else {
          alert(responseData.error || 'Could not update favorites.');
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
