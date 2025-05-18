// favorites.js → Handles fetching and removing favorite dogs

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('favorites-container');
  const logoutButton = document.getElementById('logout-button');

  // Auth check
  const token = localStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!token || !isLoggedIn) {
    alert('Please log in to view your favorites.');
    window.location.href = 'login.html';
    return;
  }

  // Log out handler
  logoutButton.addEventListener('click', () => {
    localStorage.clear();
    alert('You have been logged out.');
    window.location.href = 'index.html';
  });

  try {
    const res = await fetch('http://localhost:3000/api/favorites', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const favorites = await res.json();

    if (!Array.isArray(favorites) || favorites.length === 0) {
      container.innerHTML = '<p class="text-center">You have no favorite dogs yet.</p>';
      return;
    }

    favorites.forEach(fav => {
      const dog = fav.dog || fav; // handle direct dog list or dog object inside favorite
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
      if (e.target.classList.contains('remove-fav-btn')) {
        const dogId = e.target.dataset.id;
        try {
          const res = await fetch(`http://localhost:3000/api/favorites/${dogId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const data = await res.json();
          if (res.ok) {
            e.target.closest('.col-md-4').remove();
            if (container.children.length === 0) {
              container.innerHTML = '<p class="text-center">You have no favorite dogs left.</p>';
            }
          } else {
            console.error(data.error);
            alert(data.error || 'Failed to remove favorite.');
          }
        } catch (err) {
          console.error('Error removing favorite:', err);
          alert('Server error while removing favorite.');
        }
      }
    });
  } catch (err) {
    console.error('Error loading favorites:', err);
    container.innerHTML = '<p class="text-danger text-center">Failed to load favorites.</p>';
  }
});
