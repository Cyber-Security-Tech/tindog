// index.js → handles homepage auth + favorites + dog details

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('#dogs-container');
  const authButton = document.getElementById('logout-button') || document.getElementById('auth-button');
  const modal = new bootstrap.Modal(document.getElementById('dogModal'));

  function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const signupLink = document.getElementById('signup-link');
    const loginLink = document.getElementById('login-link');

    if (signupLink && loginLink && authButton) {
      signupLink.style.display = isLoggedIn ? 'none' : 'inline';
      loginLink.style.display = isLoggedIn ? 'none' : 'inline';
      authButton.style.display = isLoggedIn ? 'inline-block' : 'none';
    }
  }

  if (authButton) {
    authButton.addEventListener('click', () => {
      localStorage.clear();
      alert('You have been logged out.');
      updateAuthUI();
      location.href = 'index.html';
    });
  }

  updateAuthUI();

  try {
    const res = await fetch('http://localhost:3000/api/dogs');
    const dogs = await res.json();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;

    let favoriteDogIds = [];

    if (token && userId) {
      const favRes = await fetch('http://localhost:3000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const favs = await favRes.json();
      favoriteDogIds = favs.map(f => f.dogId || (f.dog && f.dog.id));
    }

    dogs.forEach((dog) => {
      const card = document.createElement('div');
      const isFavorited = favoriteDogIds.includes(dog.id);
      card.className = 'col-md-4';
      card.innerHTML = `
        <div class="card shadow-sm position-relative">
          <img src="${dog.image}" class="card-img-top" alt="${dog.name}">
          <div class="card-body">
            <h5 class="card-title">${dog.name}</h5>
            <p class="card-text">${dog.age} • ${dog.breed}</p>
            <button class="btn btn-outline-primary w-100 more-info-btn" data-id="${dog.id}">More Info</button>
            <i class="${isFavorited ? 'fa-solid' : 'fa-regular'} fa-heart position-absolute top-0 end-0 m-2 heart-icon ${isFavorited ? 'text-danger' : ''}" data-id="${dog.id}" style="cursor:pointer; font-size: 1.5rem;"></i>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    container.addEventListener('click', async (e) => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      if (e.target.classList.contains('more-info-btn')) {
        if (!isLoggedIn) {
          alert('Please log in to view more info.');
          return;
        }
        const dogId = e.target.dataset.id;
        const dog = dogs.find((d) => d.id === dogId);
        document.getElementById('dogModalLabel').textContent = dog.name;
        document.getElementById('dogModalBody').textContent = dog.about;
        modal.show();
      }

      if (e.target.classList.contains('heart-icon')) {
        if (!isLoggedIn) {
          alert('Please log in to save favorites.');
          return;
        }

        const icon = e.target;
        const dogId = icon.dataset.id;
        const isFavorited = icon.classList.contains('text-danger');

        const url = isFavorited
          ? `http://localhost:3000/api/favorites/${dogId}`
          : `http://localhost:3000/api/favorites`;

        const method = isFavorited ? 'DELETE' : 'POST';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        try {
          const response = await fetch(url, {
            method,
            headers,
            body: !isFavorited ? JSON.stringify({ dogId }) : null
          });

          const data = await response.json();

          if (response.ok) {
            icon.classList.toggle('fa-solid');
            icon.classList.toggle('fa-regular');
            icon.classList.toggle('text-danger');
          } else {
            console.error(data.error);
            alert(data.error || 'Could not update favorites.');
          }
        } catch (err) {
          console.error('Error updating favorite:', err);
          alert('Server error while updating favorite.');
        }
      }
    });
  } catch (err) {
    console.error('Error loading dogs:', err);
    container.innerHTML = '<p class="text-danger text-center">Failed to load dogs.</p>';
  }
});
