// profile.js → loads logged-in user's favorite dogs

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('favorites-container');
  const logoutBtn = document.getElementById('logout-button');
  const signupLink = document.getElementById('signup-link');
  const loginLink = document.getElementById('login-link');

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    alert('Please log in to view your favorites.');
    window.location.href = 'login.html';
    return;
  }

  signupLink.style.display = 'none';
  loginLink.style.display = 'none';
  logoutBtn.style.display = 'inline-block';

  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.href = 'index.html';
  });

  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/favorites', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const favorites = await res.json();

    if (favorites.length === 0) {
      container.innerHTML = '<p class="text-center">You haven\'t favorited any dogs yet!</p>';
      return;
    }

    favorites.forEach(dog => {
      const card = document.createElement('div');
      card.className = 'col-md-4';
      card.innerHTML = `
        <div class="card shadow-sm">
          <img src="${dog.image}" class="card-img-top" alt="${dog.name}">
          <div class="card-body">
            <h5 class="card-title">${dog.name}</h5>
            <p class="card-text">${dog.age} • ${dog.breed}</p>
            <p>${dog.about}</p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    container.innerHTML = '<p class="text-danger text-center">Failed to load favorites.</p>';
  }
});
