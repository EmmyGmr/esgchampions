// Dashboard functionality with Supabase (Example Update)
// This shows how to update champion-dashboard.js to work with async Supabase calls

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication (now async)
  const currentChampion = await DB.getCurrentChampion();
  if (!currentChampion) {
    window.location.href = 'champion-login.html';
    return;
  }

  // Load account information
  // Note: Supabase uses snake_case, so we need to map fields
  const firstName = currentChampion.first_name || currentChampion.firstName;
  const lastName = currentChampion.last_name || currentChampion.lastName;
  const email = currentChampion.email;
  const organization = currentChampion.organization || 'Not specified';
  
  // Handle expertise (could be string or array)
  let expertiseText = 'Not specified';
  if (currentChampion.expertise_panels) {
    expertiseText = typeof currentChampion.expertise_panels === 'string' 
      ? currentChampion.expertise_panels 
      : currentChampion.expertise_panels.join(', ');
  } else if (currentChampion.expertise) {
    expertiseText = Array.isArray(currentChampion.expertise)
      ? currentChampion.expertise.join(', ')
      : currentChampion.expertise;
  }

  document.getElementById('champion-name').textContent = `${firstName} ${lastName}`;
  document.getElementById('account-fullname').textContent = `${firstName} ${lastName}`;
  document.getElementById('account-email').textContent = email;
  document.getElementById('account-organization').textContent = organization;
  document.getElementById('account-expertise').textContent = expertiseText;

  // Load participation history (now async)
  const history = await DB.getParticipationHistory(currentChampion.id);
  const historyContainer = document.getElementById('participation-history');
  
  if (history.length === 0) {
    historyContainer.innerHTML = '<p class="text-gray">No panel participation yet. <a href="champion-panels.html" class="text-primary" style="text-decoration: underline;">Start reviewing panels</a></p>';
  } else {
    historyContainer.innerHTML = history.map(item => {
      const panel = item.panel;
      return `
        <div class="participation-item" style="padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 1rem;">
          <div class="flex justify-between items-start">
            <div>
              <h3 style="margin-bottom: 0.5rem;">
                <a href="champion-indicators.html?panel=${panel.id}" class="text-primary" style="text-decoration: none;">${panel.icon} ${panel.title}</a>
              </h3>
              <p class="text-gray" style="font-size: 0.875rem;">
                ${item.votesCount} votes • ${item.commentsCount} comments
              </p>
            </div>
            <div class="text-gray" style="font-size: 0.875rem;">
              ${item.lastActivity ? new Date(item.lastActivity).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Calculate stats (now async)
  // Note: We'll need to fetch votes and comments separately or use the participation history
  const allVotes = await SupabaseService.getVotes(null); // Get all votes for this champion
  const allComments = await SupabaseService.getComments(null); // Get all comments for this champion
  
  // Filter by champion ID
  const championVotes = allVotes.filter(v => v.champion_id === currentChampion.id);
  const championComments = allComments.filter(c => c.championId === currentChampion.id);
  
  // Get unique indicator IDs
  const uniqueIndicators = new Set([
    ...championVotes.map(v => v.indicator_id),
    ...championComments.map(c => c.indicatorId)
  ]);
  
  document.getElementById('stat-panels').textContent = history.length;
  document.getElementById('stat-indicators').textContent = uniqueIndicators.size;
  document.getElementById('stat-comments').textContent = championComments.length;

  // Load recent activity (now async)
  const allActivity = [
    ...championVotes.map(v => ({ ...v, type: 'vote', timestamp: v.created_at })),
    ...championComments.map(c => ({ ...c, type: 'comment', timestamp: c.timestamp }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
   .slice(0, 5);
  
  const activityContainer = document.getElementById('recent-activity');
  if (allActivity.length === 0) {
    activityContainer.innerHTML = '<p class="text-gray">No recent activity</p>';
  } else {
    activityContainer.innerHTML = await Promise.all(allActivity.map(async (activity) => {
      const indicator = await DB.getIndicator(activity.indicator_id || activity.indicatorId);
      const panel = indicator ? await DB.getPanel(indicator.panel_id || indicator.panelId) : null;
      const isVote = activity.type === 'vote';
      
      return `
        <div style="padding: 1rem; border-bottom: 1px solid #f3f4f6;">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-dark" style="font-size: 0.875rem;">
                ${isVote ? 'Voted on' : 'Commented on'} 
                <strong>${indicator ? indicator.title : 'Unknown Indicator'}</strong>
                ${panel ? `in ${panel.title}` : ''}
              </p>
              ${!isVote ? `<p class="text-gray" style="font-size: 0.875rem; margin-top: 0.25rem;">${activity.comment ? activity.comment.substring(0, 100) : ''}${activity.comment && activity.comment.length > 100 ? '...' : ''}</p>` : ''}
            </div>
            <span class="text-gray" style="font-size: 0.75rem;">
              ${new Date(activity.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      `;
    })).then(html => html.join(''));
  }

  // Logout is handled by logout.js
});

