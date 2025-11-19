// Champion Authentication System

// Password toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const passwordToggles = document.querySelectorAll('.password-toggle');
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const input = toggle.previousElementSibling;
      if (input && input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
      } else if (input) {
        input.type = 'password';
        toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      }
    });
  });

  // Login form
  const loginForm = document.getElementById('champion-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        alert('Please fill in all required fields');
        return;
      }

      const champions = JSON.parse(localStorage.getItem('esg-champions') || '[]');
      const champion = champions.find(c => c.email === email && c.password === password);

      if (champion) {
        // Store current session
        localStorage.setItem('current-champion', JSON.stringify({
          id: champion.id,
          email: champion.email,
          name: `${champion.firstName} ${champion.lastName}`
        }));
        window.location.href = 'champion-dashboard.html';
      } else {
        alert('Invalid email or password');
      }
    });
  }

  // Registration form
  const registerForm = document.getElementById('champion-register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById('champion-firstName').value.trim();
      const lastName = document.getElementById('champion-lastName').value.trim();
      const email = document.getElementById('champion-email').value.trim();
      const organization = document.getElementById('champion-organization').value.trim();
      const expertise = document.getElementById('champion-expertise').value.trim();
      const password = document.getElementById('champion-password').value;
      const confirmPassword = document.getElementById('champion-confirmPassword').value;
      const acceptedTerms = document.getElementById('champion-acceptedTerms').checked;
      const acceptedPrivacy = document.getElementById('champion-acceptedPrivacy').checked;

      // Validation
      if (!firstName || !lastName || !email || !password) {
        alert('Please fill in all required fields');
        return;
      }

      if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      if (!acceptedTerms || !acceptedPrivacy) {
        alert('Please accept the Terms & Conditions and Privacy Policy');
        return;
      }

      // Check if email already exists
      const champions = JSON.parse(localStorage.getItem('esg-champions') || '[]');
      if (champions.find(c => c.email === email)) {
        alert('An account with this email already exists');
        return;
      }

      // Create new champion
      const newChampion = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        organization: organization || '',
        expertise: expertise ? expertise.split(',').map(e => e.trim()) : [],
        password, // In production, this should be hashed
        createdAt: new Date().toISOString()
      };

      champions.push(newChampion);
      localStorage.setItem('esg-champions', JSON.stringify(champions));

      // Auto-login
      localStorage.setItem('current-champion', JSON.stringify({
        id: newChampion.id,
        email: newChampion.email,
        name: `${newChampion.firstName} ${newChampion.lastName}`
      }));

      alert('Registration successful! Redirecting to dashboard...');
      window.location.href = 'champion-dashboard.html';
    });
  }
});

