// Admin Review Page Functionality

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is admin
  try {
    const isAdmin = await AdminService.isAdmin();
    if (!isAdmin) {
      // Get current user info for debugging
      const champion = await SupabaseService.getCurrentChampion();
      const user = await SupabaseService.getCurrentUser();
      
      console.log('Current user:', user?.email);
      console.log('Champion profile:', champion);
      console.log('Is admin check result:', isAdmin);
      
      alert('Access denied. Admin privileges required.\n\nIf you just set yourself as admin, please:\n1. Log out\n2. Log back in\n3. Try accessing this page again.');
      window.location.href = 'index.html';
      return;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    alert('Error checking admin status. Please check the console for details.');
    window.location.href = 'index.html';
    return;
  }

  let allReviews = [];
  let currentFilters = {
    status: 'all',
    panelCategory: 'all',
    search: ''
  };

  // Load and render reviews
  async function loadReviews() {
    try {
      const container = document.getElementById('reviews-container');
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><p>Loading reviews...</p></div>';

      allReviews = await AdminService.getAllReviews(currentFilters);
      renderReviews(allReviews);
      updateStats();
    } catch (error) {
      console.error('Load reviews error:', error);
      document.getElementById('reviews-container').innerHTML = 
        '<div class="empty-state"><div class="empty-state-icon">❌</div><p>Error loading reviews. Please try again.</p></div>';
    }
  }

  // Render reviews
  function renderReviews(reviews) {
    const container = document.getElementById('reviews-container');

    if (reviews.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>No reviews found matching your filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = reviews.map(review => {
      const champion = review.champions;
      const indicator = review.indicators;
      const panel = review.panel;
      
      const championName = champion 
        ? `${champion.first_name} ${champion.last_name}`
        : 'Unknown Champion';
      
      const organization = champion?.organization || 'N/A';
      const indicatorTitle = indicator?.title || 'Unknown Indicator';
      const panelTitle = panel?.title || 'Unknown Panel';
      const panelCategory = panel?.category || 'unknown';
      const panelIcon = panel?.icon || '📋';

      const statusClass = `status-${review.status}`;
      const statusText = review.status.charAt(0).toUpperCase() + review.status.slice(1);

      const ratingStars = '★'.repeat(review.rating || 0) + '☆'.repeat(5 - (review.rating || 0));
      const necessaryText = review.necessary === 'yes' ? 'Yes' : 
                           review.necessary === 'no' ? 'No' : 
                           review.necessary === 'not-sure' ? 'Not Sure' : 'N/A';

      const submissionDate = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="review-card" data-review-id="${review.id}">
          <div class="review-header">
            <div>
              <h3 style="margin-bottom: 0.5rem;">${panelIcon} ${panelTitle}</h3>
              <p class="text-gray" style="font-size: 0.875rem;">${indicatorTitle}</p>
            </div>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>

          <div class="review-meta">
            <div class="meta-item">
              <span class="meta-label">Champion</span>
              <span class="meta-value">${championName}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Organization</span>
              <span class="meta-value">${organization}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Panel Category</span>
              <span class="meta-value" style="text-transform: capitalize;">${panelCategory}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Submission Date</span>
              <span class="meta-value">${submissionDate}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Necessary?</span>
              <span class="meta-value">${necessaryText}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Rating</span>
              <span class="meta-value" style="color: #fbbf24;">${ratingStars}</span>
            </div>
          </div>

          ${review.comments ? `
            <div style="margin-top: 1rem; padding: 1rem; background-color: #f9fafb; border-radius: 0.375rem;">
              <span class="meta-label" style="margin-bottom: 0.5rem; display: block;">Comments</span>
              <p style="color: #374151; line-height: 1.6;">${review.comments}</p>
            </div>
          ` : ''}

          ${review.status === 'pending' ? `
            <div class="review-actions">
              <button class="btn-primary accept-review-btn" data-review-id="${review.id}" 
                      style="flex: 1; padding: 0.75rem;">
                ✓ Accept
              </button>
              <button class="btn-secondary delete-review-btn" data-review-id="${review.id}" 
                      style="flex: 1; padding: 0.75rem; background-color: #ef4444; color: white; border-color: #ef4444;">
                ✕ Delete
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach event listeners
    attachEventListeners();
  }

  // Update statistics
  async function updateStats() {
    const stats = await AdminService.getReviewStats();
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-accepted').textContent = stats.accepted;
    document.getElementById('stat-deleted').textContent = stats.deleted;
    document.getElementById('stat-total').textContent = stats.total;
  }

  // Attach event listeners
  function attachEventListeners() {
    // Accept buttons
    document.querySelectorAll('.accept-review-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const reviewId = e.target.dataset.reviewId;
        await handleAcceptReview(reviewId);
      });
    });

    // Delete buttons
    document.querySelectorAll('.delete-review-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const reviewId = e.target.dataset.reviewId;
        await handleDeleteReview(reviewId);
      });
    });
  }

  // Handle accept review
  async function handleAcceptReview(reviewId) {
    const review = allReviews.find(r => r.id === reviewId);
    if (!review) return;

    const indicator = review.indicators;
    const panel = review.panel;
    const champion = review.champions;

    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-btn');

    confirmTitle.textContent = 'Accept Review';
    confirmMessage.innerHTML = `
      Are you sure you want to accept this review?<br><br>
      <strong>Champion:</strong> ${champion ? `${champion.first_name} ${champion.last_name}` : 'Unknown'}<br>
      <strong>Panel:</strong> ${panel?.title || 'Unknown'}<br>
      <strong>Indicator:</strong> ${indicator?.title || 'Unknown'}<br><br>
      This review will be added to the ranking page.
    `;

    confirmModal.classList.remove('hidden');

    // Remove existing listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', async () => {
      try {
        newConfirmBtn.disabled = true;
        newConfirmBtn.textContent = 'Processing...';

        await AdminService.acceptReview(reviewId);

        confirmModal.classList.add('hidden');
        alert('Review accepted successfully! It has been added to the ranking page.');
        
        // Reload reviews
        await loadReviews();
      } catch (error) {
        console.error('Accept review error:', error);
        alert('Error accepting review: ' + (error.message || 'Unknown error'));
        newConfirmBtn.disabled = false;
        newConfirmBtn.textContent = 'Confirm';
      }
    });
  }

  // Handle delete review
  async function handleDeleteReview(reviewId) {
    const review = allReviews.find(r => r.id === reviewId);
    if (!review) return;

    const indicator = review.indicators;
    const panel = review.panel;
    const champion = review.champions;

    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-btn');

    confirmTitle.textContent = 'Delete Review';
    confirmMessage.innerHTML = `
      Are you sure you want to delete this review?<br><br>
      <strong>Champion:</strong> ${champion ? `${champion.first_name} ${champion.last_name}` : 'Unknown'}<br>
      <strong>Panel:</strong> ${panel?.title || 'Unknown'}<br>
      <strong>Indicator:</strong> ${indicator?.title || 'Unknown'}<br><br>
      This action cannot be undone.
    `;

    confirmModal.classList.remove('hidden');

    // Remove existing listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', async () => {
      try {
        newConfirmBtn.disabled = true;
        newConfirmBtn.textContent = 'Deleting...';

        await AdminService.deleteReview(reviewId);

        confirmModal.classList.add('hidden');
        alert('Review deleted successfully.');
        
        // Reload reviews
        await loadReviews();
      } catch (error) {
        console.error('Delete review error:', error);
        alert('Error deleting review: ' + (error.message || 'Unknown error'));
        newConfirmBtn.disabled = false;
        newConfirmBtn.textContent = 'Confirm';
      }
    });
  }

  // Filter handlers
  document.getElementById('status-filter').addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    loadReviews();
  });

  document.getElementById('panel-filter').addEventListener('change', (e) => {
    currentFilters.panelCategory = e.target.value;
    loadReviews();
  });

  document.getElementById('search-input').addEventListener('input', (e) => {
    currentFilters.search = e.target.value;
    loadReviews();
  });

  // Modal close handlers
  document.getElementById('close-confirm-modal').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.add('hidden');
  });

  document.getElementById('cancel-confirm-btn').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.add('hidden');
  });

  // Close modal on outside click
  document.getElementById('confirm-modal').addEventListener('click', (e) => {
    if (e.target.id === 'confirm-modal') {
      document.getElementById('confirm-modal').classList.add('hidden');
    }
  });

  // Initial load
  await loadReviews();
  await updateStats();
});

