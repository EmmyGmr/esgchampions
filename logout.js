// Logout functionality

function initLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Check if user is logged in
      const currentChampion = localStorage.getItem('current-champion');
      
      if (!currentChampion) {
        // User is not logged in, redirect to login page
        window.location.href = 'champion-login.html';
        return;
      }
      
      // Confirm logout
      if (confirm('Are you sure you want to logout?')) {
        // Remove session data
        localStorage.removeItem('current-champion');
        
        // Redirect to login page
        window.location.href = 'champion-login.html';
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initLogout);

