// Logout functionality with Supabase support

async function initLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Check if user is logged in (try Supabase first, fallback to localStorage)
      let isLoggedIn = false;
      
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
          const { data: { user } } = await supabaseClient.auth.getUser();
          isLoggedIn = !!user;
        } catch (error) {
          console.error('Error checking auth:', error);
        }
      }
      
      // Fallback to localStorage check
      if (!isLoggedIn) {
        const currentChampion = localStorage.getItem('current-champion') || localStorage.getItem('current-champion-id');
        isLoggedIn = !!currentChampion;
      }
      
      if (!isLoggedIn) {
        // User is not logged in, redirect to login page
        window.location.href = 'champion-login.html';
        return;
      }
      
      // Confirm logout
      if (confirm('Are you sure you want to logout?')) {
        // Sign out from Supabase if available
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
          try {
            await supabaseClient.auth.signOut();
          } catch (error) {
            console.error('Error signing out from Supabase:', error);
          }
        }
        
        // Remove session data from localStorage
        localStorage.removeItem('current-champion');
        localStorage.removeItem('current-champion-id');
        
        // Redirect to login page
        window.location.href = 'champion-login.html';
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initLogout);

