// Dashboard functionality

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  const currentChampion = DB.getCurrentChampion();
  if (!currentChampion) {
    window.location.href = 'champion-login.html';
    return;
  }

  // Load account information
  document.getElementById('champion-name').textContent = `${currentChampion.firstName} ${currentChampion.lastName}`;
  document.getElementById('account-fullname').textContent = `${currentChampion.firstName} ${currentChampion.lastName}`;
  document.getElementById('account-email').textContent = currentChampion.email;
  document.getElementById('account-organization').textContent = currentChampion.organization || 'Not specified';
  document.getElementById('account-expertise').textContent = currentChampion.expertise.length > 0 
    ? currentChampion.expertise.join(', ') 
    : 'Not specified';

  // Load participation history
  const history = DB.getParticipationHistory(currentChampion.id);
  const historyContainer = document.getElementById('participation-history');
  
  if (history.length === 0) {
    historyContainer.innerHTML = '<p class="text-gray">No panel participation yet. <a href="champion-panels.html" class="text-primary" style="text-decoration: underline;">Start reviewing panels</a></p>';
  } else {
    historyContainer.innerHTML = history.map(item => `
      <div class="participation-item" style="padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 1rem;">
        <div class="flex justify-between items-start">
          <div>
            <h3 style="margin-bottom: 0.5rem;">
              <a href="champion-indicators.html?panel=${item.panel.id}" class="text-primary" style="text-decoration: none;">${item.panel.icon} ${item.panel.title}</a>
            </h3>
            <p class="text-gray" style="font-size: 0.875rem;">
              ${item.votesCount} votes • ${item.commentsCount} comments
            </p>
          </div>
          <div class="text-gray" style="font-size: 0.875rem;">
            ${new Date(item.lastActivity).toLocaleDateString()}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Calculate stats
  const allVotes = JSON.parse(localStorage.getItem('esg-votes') || '[]').filter(v => v.championId === currentChampion.id);
  const allComments = JSON.parse(localStorage.getItem('esg-comments') || '[]').filter(c => c.championId === currentChampion.id);
  
  document.getElementById('stat-panels').textContent = history.length;
  document.getElementById('stat-indicators').textContent = new Set(allVotes.map(v => v.indicatorId)).size;
  document.getElementById('stat-comments').textContent = allComments.length;

  // Load recent activity
  const recentActivity = [...allVotes, ...allComments]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  
  const activityContainer = document.getElementById('recent-activity');
  if (recentActivity.length === 0) {
    activityContainer.innerHTML = '<p class="text-gray">No recent activity</p>';
  } else {
    activityContainer.innerHTML = recentActivity.map(activity => {
      const indicator = DB.getIndicator(activity.indicatorId);
      const panel = indicator ? DB.getPanel(indicator.panelId) : null;
      const isVote = activity.vote !== undefined;
      
      return `
        <div style="padding: 1rem; border-bottom: 1px solid #f3f4f6;">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-dark" style="font-size: 0.875rem;">
                ${isVote ? 'Voted on' : 'Commented on'} 
                <strong>${indicator ? indicator.title : 'Unknown Indicator'}</strong>
                ${panel ? `in ${panel.title}` : ''}
              </p>
              ${!isVote ? `<p class="text-gray" style="font-size: 0.875rem; margin-top: 0.25rem;">${activity.comment.substring(0, 100)}${activity.comment.length > 100 ? '...' : ''}</p>` : ''}
            </div>
            <span class="text-gray" style="font-size: 0.75rem;">
              ${new Date(activity.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Logout is handled by logout.js
});

