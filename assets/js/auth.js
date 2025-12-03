const auth = {
  currentUser: null,

  async login(email, password) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.msg || 'Login failed');
      }

      const data = await response.json();
      this.currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async signup(name, email, password) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.msg || 'Registration failed');
      }

      const data = await response.json();
      return data; // Returns token and user data
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch('http://localhost:5000/api/auth/user', {
        method: 'GET',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const user = await response.json();
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Auth check error:', error);
      return null;
    }
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }
};

// Protect routes
async function protectRoute() {
  const protectedRoutes = ['/dashboard.html', '/my-courses.html', '/profile.html'];
  const currentPath = window.location.pathname.split('/').pop();
  
  if (protectedRoutes.includes(currentPath)) {
    const user = await auth.checkAuth();
    if (!user) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPath);
    }
  }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', async function() {
  await auth.checkAuth();
  await protectRoute();
  
  // Update UI based on auth state
  const user = auth.currentUser;
  if (user) {
    // Update header for logged-in users
    const headerAuth = document.querySelector('.header-auth');
    if (headerAuth) {
      headerAuth.innerHTML = `
        <div class="user-dropdown">
          <button class="user-menu">
            <div class="user-avatar">${getInitials(user.name)}</div>
            <span>${user.name}</span>
          </button>
          <div class="dropdown-content">
            <a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
            <a href="my-courses.html"><i class="fas fa-book"></i> My Courses</a>
            <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
            <div class="divider"></div>
            <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      `;
      
      document.getElementById('logout-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        auth.logout();
        window.location.href = 'index.html';
      });
    }
  }
});

// Helper function to get user initials
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}