// Dashboard functionality with Supabase

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check authentication and get current champion (async)
    const currentChampion = await DB.getCurrentChampion();
    
    if (!currentChampion) {
      console.log('No champion found, redirecting to login');
      window.location.href = 'champion-login.html';
      return;
    }

    console.log('Current champion loaded:', currentChampion);

    // Load account information
    const firstName = currentChampion.first_name || currentChampion.firstName || '';
    const lastName = currentChampion.last_name || currentChampion.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Champion';
    
    document.getElementById('champion-name').textContent = fullName;
    document.getElementById('account-fullname').textContent = fullName || 'Not specified';
    document.getElementById('account-email').textContent = currentChampion.email || 'Not specified';
    document.getElementById('account-organization').textContent = currentChampion.organization || 'Not specified';
    
    // Handle expertise areas (could be string or array)
    let expertiseText = '-';
    if (currentChampion.expertise_panels) {
      if (Array.isArray(currentChampion.expertise_panels)) {
        expertiseText = currentChampion.expertise_panels.join(', ');
      } else if (typeof currentChampion.expertise_panels === 'string') {
        expertiseText = currentChampion.expertise_panels;
      }
    } else if (currentChampion.expertise) {
      if (Array.isArray(currentChampion.expertise)) {
        expertiseText = currentChampion.expertise.join(', ');
      } else {
        expertiseText = currentChampion.expertise;
      }
    }
    document.getElementById('account-expertise').textContent = expertiseText || 'Not specified';

    // Load participation history (async)
    const history = await DB.getParticipationHistory(currentChampion.id);
    const historyContainer = document.getElementById('participation-history');
    
    if (!history || history.length === 0) {
      historyContainer.innerHTML = '<p class="text-gray">No panel participation yet. <a href="champion-panels.html" class="text-primary" style="text-decoration: underline;">Start reviewing panels</a></p>';
    } else {
      historyContainer.innerHTML = history.map(item => {
        const panel = item.panel || {};
        const panelIcon = panel.icon || '📋';
        const panelTitle = panel.title || 'Unknown Panel';
        const panelId = panel.id || '';
        
        return `
          <div class="participation-item" style="padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 1rem;">
            <div class="flex justify-between items-start">
              <div>
                <h3 style="margin-bottom: 0.5rem;">
                  <a href="champion-indicators.html?panel=${panelId}" class="text-primary" style="text-decoration: none;">${panelIcon} ${panelTitle}</a>
                </h3>
                <p class="text-gray" style="font-size: 0.875rem;">
                  ${item.votesCount || 0} votes • ${item.commentsCount || 0} comments
                </p>
              </div>
              ${item.lastActivity ? `
                <div class="text-gray" style="font-size: 0.875rem;">
                  ${new Date(item.lastActivity).toLocaleDateString()}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    // Calculate stats from Supabase
    try {
      const [votesResult, commentsResult, reviewsResult] = await Promise.all([
        supabaseClient
          .from('votes')
          .select('indicator_id')
          .eq('champion_id', currentChampion.id),
        supabaseClient
          .from('comments')
          .select('id')
          .eq('champion_id', currentChampion.id),
        supabaseClient
          .from('reviews')
          .select('indicator_id')
          .eq('champion_id', currentChampion.id)
      ]);

      const votes = votesResult.data || [];
      const comments = commentsResult.data || [];
      const reviews = reviewsResult.data || [];
      
      // Get unique indicators from reviews
      const uniqueIndicators = new Set(reviews.map(r => r.indicator_id));
      
      document.getElementById('stat-panels').textContent = history.length;
      document.getElementById('stat-indicators').textContent = uniqueIndicators.size;
      document.getElementById('stat-comments').textContent = comments.length;

      // Load recent activity from Supabase
      const [recentVotesResult, recentCommentsResult] = await Promise.all([
        supabaseClient
          .from('votes')
          .select('*, indicators:indicator_id(id, title, panel_id)')
          .eq('champion_id', currentChampion.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabaseClient
          .from('comments')
          .select('*, indicators:indicator_id(id, title, panel_id)')
          .eq('champion_id', currentChampion.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const recentVotes = recentVotesResult.data || [];
      const recentComments = recentCommentsResult.data || [];

      const allActivity = [
        ...recentVotes.map(v => ({ ...v, type: 'vote', created_at: v.created_at })),
        ...recentComments.map(c => ({ ...c, type: 'comment', created_at: c.created_at }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

      const activityContainer = document.getElementById('recent-activity');
      if (allActivity.length === 0) {
        activityContainer.innerHTML = '<p class="text-gray">No recent activity</p>';
      } else {
        const activityHtml = await Promise.all(allActivity.map(async (activity) => {
          const indicator = activity.indicators || (activity.indicator_id ? await DB.getIndicator(activity.indicator_id) : null);
          const panel = indicator && indicator.panel_id ? await DB.getPanel(indicator.panel_id) : null;
          const isVote = activity.type === 'vote';
          
          return `
            <div style="padding: 1rem; border-bottom: 1px solid #f3f4f6;">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-gray-dark" style="font-size: 0.875rem;">
                    ${isVote ? 'Voted on' : 'Commented on'} 
                    <strong>${indicator ? indicator.title : 'Unknown Indicator'}</strong>
                    ${panel ? `in ${panel.title || panel.id}` : ''}
                  </p>
                  ${!isVote && activity.comment ? `<p class="text-gray" style="font-size: 0.875rem; margin-top: 0.25rem;">${activity.comment.substring(0, 100)}${activity.comment.length > 100 ? '...' : ''}</p>` : ''}
                </div>
                <span class="text-gray" style="font-size: 0.75rem;">
                  ${new Date(activity.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          `;
        }));
        activityContainer.innerHTML = activityHtml.join('');
      }
    } catch (statsError) {
      console.error('Error loading stats:', statsError);
      // Set defaults if stats fail to load
      document.getElementById('stat-panels').textContent = '0';
      document.getElementById('stat-indicators').textContent = '0';
      document.getElementById('stat-comments').textContent = '0';
    }

  } catch (error) {
    console.error('Error loading dashboard:', error);
    // Show error message to user
    document.getElementById('champion-name').textContent = 'Error loading profile';
    document.getElementById('account-fullname').textContent = 'Error: ' + (error.message || 'Failed to load data');
  }

  // Logout is handled by logout.js
});

