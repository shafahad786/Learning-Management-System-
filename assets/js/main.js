document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu');
  const mainNav = document.getElementById('main-nav');
  
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', function() {
      mainNav.classList.toggle('active');
    });
  }
  
  // Highlight active link
  const currentPage = location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
  
  // Course enrollment buttons
  const enrollBtns = document.querySelectorAll('.enroll-btn');
  enrollBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      alert('Course enrollment would be handled here');
      // Redirect to login if not authenticated
      // window.location.href = 'login.html';
    });
  });
  
  // Form submissions
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Login functionality would connect to backend');
      // window.location.href = 'dashboard.html';
    });
  }
  
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      
      alert('Account created (would connect to backend)');
      // window.location.href = 'dashboard.html';
    });
  }
  
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for your message! We will contact you soon.');
      contactForm.reset();
    });
  }
});