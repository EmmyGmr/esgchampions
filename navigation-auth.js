// Navigation authentication handler
// Shows/hides Rankings and Logout buttons based on login status

document.addEventListener('DOMContentLoaded', () => {
  const currentChampion = localStorage.getItem('current-champion');
  const isLoggedIn = !!currentChampion;

  const nav = document.querySelector('nav');
  if (!nav) return;

  // Find or create Rankings button
  let rankingsBtn = document.getElementById('nav-rankings-btn');
  if (!rankingsBtn) {
    // Check if Rankings button already exists (might be in different format)
    const existingRankings = nav.querySelector('a[href="ranking.html"], a[href="ranking.html"]');
    if (existingRankings) {
      rankingsBtn = existingRankings;
      rankingsBtn.id = 'nav-rankings-btn';
    } else {
      // Create new Rankings button
      rankingsBtn = document.createElement('a');
      rankingsBtn.href = 'ranking.html';
      rankingsBtn.className = 'btn-primary';
      rankingsBtn.id = 'nav-rankings-btn';
      rankingsBtn.textContent = 'Rankings';
      
      // Insert before logout button if it exists, otherwise before membership button or at the end
      const logoutBtn = document.getElementById('logout-btn');
      const membershipBtn = document.getElementById('membership-btn');
      if (logoutBtn) {
        nav.insertBefore(rankingsBtn, logoutBtn);
      } else if (membershipBtn) {
        nav.insertBefore(rankingsBtn, membershipBtn.nextSibling);
      } else {
        nav.appendChild(rankingsBtn);
      }
    }
  }

  // Find or create Logout button
  let logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) {
    logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.className = 'btn-secondary';
    logoutBtn.id = 'logout-btn';
    logoutBtn.textContent = 'Logout';
    
    // Insert at the end of nav
    nav.appendChild(logoutBtn);
  }

  // Show/hide buttons based on login status
  if (rankingsBtn) {
    rankingsBtn.style.display = isLoggedIn ? '' : 'none';
  }
  
  if (logoutBtn) {
    logoutBtn.style.display = isLoggedIn ? '' : 'none';
    
    // Only attach logout functionality if logout.js hasn't already done it
    // logout.js will handle the actual logout, we just show/hide the button
  }
});

