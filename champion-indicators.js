// Indicators page functionality with Supabase

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check authentication
    const currentChampion = await DB.getCurrentChampion();
    if (!currentChampion) {
      window.location.href = 'champion-login.html';
      return;
    }

    // Get panel ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const panelId = urlParams.get('panel');
    
    if (!panelId) {
      window.location.href = 'champion-panels.html';
      return;
    }

    console.log('Loading panel and indicators for panel ID:', panelId);

    // Load panel information (async)
    const panel = await DB.getPanel(panelId);
    if (!panel) {
      console.error('Panel not found:', panelId);
      window.location.href = 'champion-panels.html';
      return;
    }

    console.log('Panel loaded:', panel);

    // Update panel information in UI
    const panelTitleEl = document.getElementById('panel-title');
    const panelDescEl = document.getElementById('panel-description');
    const panelBreadcrumbEl = document.getElementById('panel-breadcrumb');
    
    if (panelTitleEl) {
      panelTitleEl.textContent = `${panel.icon || '📋'} ${panel.title || 'Panel'}`;
    }
    if (panelDescEl) {
      panelDescEl.textContent = panel.description || '';
    }
    if (panelBreadcrumbEl) {
      panelBreadcrumbEl.textContent = panel.title || 'Panel';
    }

    // Load indicators - check if specific indicators were selected (async)
    console.log('Fetching indicators for panel:', panelId);
    let allIndicators = await DB.getIndicators(panelId);
    console.log('Indicators fetched:', allIndicators);
    console.log('Is array?', Array.isArray(allIndicators));
    
    // Ensure allIndicators is an array
    if (!Array.isArray(allIndicators)) {
      console.error('Indicators is not an array:', allIndicators);
      allIndicators = [];
    }
    
    let selectedIndicatorIds = null;
    
    // Check if there are selected indicators from the selection modal
    const storedSelected = localStorage.getItem('selected-indicators');
    console.log('Stored selected indicators from localStorage:', storedSelected);
    
    if (storedSelected) {
      try {
        selectedIndicatorIds = JSON.parse(storedSelected);
        console.log('Parsed selected indicator IDs:', selectedIndicatorIds);
        console.log('Total indicators before filtering:', allIndicators.length);
        console.log('Indicator IDs available:', allIndicators.map(ind => ind.id));
        
        // Filter to only show selected indicators
        if (Array.isArray(selectedIndicatorIds) && selectedIndicatorIds.length > 0) {
          // Convert all IDs to strings for comparison (in case of type mismatch)
          const selectedIdsAsStrings = selectedIndicatorIds.map(id => String(id));
          const beforeFilter = allIndicators.length;
          
          allIndicators = allIndicators.filter(ind => {
            const indicatorId = String(ind.id);
            const isSelected = selectedIdsAsStrings.includes(indicatorId);
            if (!isSelected) {
              console.log(`Indicator ${indicatorId} (${ind.title}) not in selected list`);
            }
            return isSelected;
          });
          
          console.log(`Filtered from ${beforeFilter} to ${allIndicators.length} indicators`);
          console.log('Filtered indicator IDs:', allIndicators.map(ind => ind.id));
          
          if (allIndicators.length === 0) {
            console.warn('No indicators matched after filtering! This might indicate an ID mismatch.');
            console.warn('Selected IDs:', selectedIdsAsStrings);
            // Get all available indicator IDs before filtering
            const allAvailableIds = (await DB.getIndicators(panelId)).map(ind => String(ind.id));
            console.warn('Available indicator IDs:', allAvailableIds);
          }
          
          // Only clear localStorage after successful filtering
          localStorage.removeItem('selected-indicators');
        } else {
          console.warn('selectedIndicatorIds is not a valid array:', selectedIndicatorIds);
        }
      } catch (error) {
        console.error('Error parsing selected indicators:', error);
        console.error('Raw stored value:', storedSelected);
      }
    } else {
      console.log('No selected indicators found in localStorage - showing all indicators for panel');
    }
  
    let indicators = allIndicators;
    const indicatorsCountEl = document.getElementById('indicators-count');
    if (indicatorsCountEl) {
      indicatorsCountEl.textContent = `${indicators.length}${selectedIndicatorIds ? ' selected' : ''} indicator${indicators.length !== 1 ? 's' : ''}`;
    }

    function renderIndicators(filteredIndicators) {
      const indicatorsList = document.getElementById('indicators-list');
      
      if (!indicatorsList) {
        console.error('Indicators list element not found');
        return;
      }
      
      // Ensure filteredIndicators is an array
      if (!Array.isArray(filteredIndicators)) {
        console.error('filteredIndicators is not an array:', filteredIndicators);
        indicatorsList.innerHTML = '<p class="text-gray">Error loading indicators. Please refresh the page.</p>';
        return;
      }
      
      if (filteredIndicators.length === 0) {
        indicatorsList.innerHTML = '<p class="text-gray">No indicators found matching your search.</p>';
        return;
      }

      const indicatorsHTML = filteredIndicators.map(indicator => {
        const existingReview = getExistingReview(currentChampion.id, indicator.id);
      const frameworks = indicator.frameworks || 'N/A';
      const sectorContext = indicator.sectorContext || 'All';
      const validationQuestion = indicator.validationQuestion || '';

      return `
        <div class="indicator-card card mb-6" data-indicator-id="${indicator.id}">
          <div class="flex justify-between items-start mb-6">
            <div style="flex: 1;">
              <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${indicator.title}</h3>
              <p class="text-gray" style="margin-bottom: 1rem;">${indicator.description}</p>
            </div>
          </div>
          
          <!-- Validation Environment Form -->
          <form class="validation-form" data-indicator-id="${indicator.id}" style="background-color: #f9fafb; padding: 1.5rem; border-radius: 0.5rem;">
            <!-- Indicator Info -->
            <div class="mb-6" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
              <div>
                <label style="font-size: 0.875rem; color: #6b7280; display: block; margin-bottom: 0.25rem;">Framework Mapping</label>
                <div style="font-weight: 500;">${frameworks}</div>
              </div>
              <div>
                <label style="font-size: 0.875rem; color: #6b7280; display: block; margin-bottom: 0.25rem;">Source</label>
                <div style="font-weight: 500;">SME Hub</div>
              </div>
              <div>
                <label style="font-size: 0.875rem; color: #6b7280; display: block; margin-bottom: 0.25rem;">Sector Context</label>
                <div style="font-weight: 500;">${sectorContext}</div>
              </div>
              ${validationQuestion ? `
              <div>
                <label style="font-size: 0.875rem; color: #6b7280; display: block; margin-bottom: 0.25rem;">Validation Question</label>
                <div style="font-size: 0.875rem; font-style: italic;">${validationQuestion}</div>
              </div>
              ` : ''}
            </div>

            <!-- Is this indicator necessary? -->
            <div class="form-group mb-6">
              <label style="display: block; margin-bottom: 0.75rem; font-weight: 500;">Is this indicator necessary?</label>
              <div class="flex gap-4">
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="radio" name="necessary-${indicator.id}" value="yes" ${existingReview?.necessary === 'yes' ? 'checked' : ''} 
                         style="margin-right: 0.5rem; width: 1.25rem; height: 1.25rem; cursor: pointer;">
                  <span>Yes</span>
                </label>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="radio" name="necessary-${indicator.id}" value="no" ${existingReview?.necessary === 'no' ? 'checked' : ''}
                         style="margin-right: 0.5rem; width: 1.25rem; height: 1.25rem; cursor: pointer;">
                  <span>No</span>
                </label>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <input type="radio" name="necessary-${indicator.id}" value="not-sure" ${existingReview?.necessary === 'not-sure' ? 'checked' : ''}
                         style="margin-right: 0.5rem; width: 1.25rem; height: 1.25rem; cursor: pointer;">
                  <span>Not sure</span>
                </label>
              </div>
            </div>

            <!-- Rate the clarity and relevance -->
            <div class="form-group mb-6">
              <label style="display: block; margin-bottom: 0.75rem; font-weight: 500;">Rate the clarity and relevance</label>
              <div class="star-rating" data-indicator-id="${indicator.id}" style="display: flex; gap: 0.5rem;">
                ${[1, 2, 3, 4, 5].map(star => `
                  <button type="button" class="star-btn" data-rating="${star}" 
                          style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: ${existingReview && existingReview.rating >= star ? '#fbbf24' : '#d1d5db'}; padding: 0;">
                    ★
                  </button>
                `).join('')}
              </div>
              <input type="hidden" name="rating-${indicator.id}" value="${existingReview?.rating || 0}">
            </div>

            <!-- Comments -->
            <div class="form-group">
              <label style="display: block; margin-bottom: 0.75rem; font-weight: 500;">Comments</label>
              <textarea name="comments-${indicator.id}" 
                        placeholder="Enter comments or references...." 
                        style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem; font-family: inherit; resize: vertical; min-height: 100px;">${existingReview?.comments || ''}</textarea>
            </div>
          </form>
        </div>
      `;
    }).join('');

    // Add submit all button at the bottom
    if (filteredIndicators.length > 0) {
      indicatorsList.innerHTML = indicatorsHTML + `
        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e5e7eb;">
          <button id="submit-all-reviews-btn" class="btn-primary" style="width: 100%; padding: 1rem; font-size: 1.125rem; font-weight: 600;">
            Submit All Reviews
          </button>
        </div>
      `;
    } else {
      indicatorsList.innerHTML = indicatorsHTML;
    }

    // Attach event listeners
    attachEventListeners();
  }

  function getExistingReview(championId, indicatorId) {
    const reviews = JSON.parse(localStorage.getItem('esg-reviews') || '[]');
    return reviews.find(r => r.championId === championId && r.indicatorId === indicatorId);
  }

  function saveReview(championId, indicatorId, reviewData) {
    const reviews = JSON.parse(localStorage.getItem('esg-reviews') || '[]');
    const existingIndex = reviews.findIndex(r => r.championId === championId && r.indicatorId === indicatorId);
    
    const review = {
      id: existingIndex >= 0 ? reviews[existingIndex].id : Date.now().toString(),
      championId,
      indicatorId,
      necessary: reviewData.necessary,
      rating: reviewData.rating,
      comments: reviewData.comments,
      timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      reviews[existingIndex] = review;
    } else {
      reviews.push(review);
    }

    localStorage.setItem('esg-reviews', JSON.stringify(reviews));
  }

  function attachEventListeners() {
    // Star rating
    document.querySelectorAll('.star-rating').forEach(rating => {
      const indicatorId = rating.dataset.indicatorId;
      const hiddenInput = document.querySelector(`input[name="rating-${indicatorId}"]`);
      
      rating.querySelectorAll('.star-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
          const ratingValue = index + 1;
          hiddenInput.value = ratingValue;
          
          // Update star colors
          rating.querySelectorAll('.star-btn').forEach((star, i) => {
            star.style.color = i < ratingValue ? '#fbbf24' : '#d1d5db';
          });
        });
      });
    });

    // Prevent individual form submissions
    document.querySelectorAll('.validation-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
      });
    });

    // Submit all reviews button
    const submitAllBtn = document.getElementById('submit-all-reviews-btn');
    if (submitAllBtn) {
      submitAllBtn.addEventListener('click', () => {
        submitAllReviews();
      });
    }
  }

  async function submitAllReviews() {
    const allForms = document.querySelectorAll('.validation-form');
    const reviewsToSubmit = [];
    let hasErrors = false;
    const missingIndicators = [];

    allForms.forEach(form => {
      const indicatorId = form.dataset.indicatorId;
      const necessary = form.querySelector(`input[name="necessary-${indicatorId}"]:checked`)?.value;
      const rating = parseInt(form.querySelector(`input[name="rating-${indicatorId}"]`).value) || 0;
      const comments = form.querySelector(`textarea[name="comments-${indicatorId}"]`).value.trim();
      
      if (!necessary) {
        hasErrors = true;
        const indicatorTitle = form.closest('.indicator-card').querySelector('h3').textContent;
        missingIndicators.push(indicatorTitle);
      } else {
        reviewsToSubmit.push({
          indicatorId,
          necessary,
          rating,
          comments
        });
      }
    });

    if (hasErrors) {
      alert(`Please review all indicators before submitting.\n\nMissing reviews for:\n${missingIndicators.join('\n')}`);
      return;
    }

    if (reviewsToSubmit.length === 0) {
      alert('No reviews to submit. Please fill in at least one review.');
      return;
    }

    // Save all reviews to Supabase with pending status
    try {
      const savePromises = reviewsToSubmit.map(async (reviewData) => {
        // Save review to Supabase with pending status
        await SupabaseService.saveReview(currentChampion.id, reviewData.indicatorId, {
          necessary: reviewData.necessary,
          rating: reviewData.rating,
          comments: reviewData.comments,
          status: 'pending' // All new reviews start as pending
        });

        // Also save as comment for backward compatibility
        if (reviewData.comments) {
          await DB.saveComment(currentChampion.id, reviewData.indicatorId, reviewData.comments);
        }
      });

      await Promise.all(savePromises);
      
      // Show success popup
      showSubmissionSuccess();
      
      // Redirect to panels page
      window.location.href = 'champion-panels.html';
    } catch (error) {
      console.error('Error saving reviews:', error);
      alert('Error submitting reviews. Please try again.');
    }
  }

    // Initial render
    console.log('Rendering', indicators.length, 'indicators...');
    renderIndicators(indicators);

  function applyFilters() {
    const searchTerm = document.getElementById('indicator-search')?.value.toLowerCase() || '';
    const sector = document.getElementById('indicator-filter-sector')?.value || 'all';
    
    let filtered = [...indicators];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(searchTerm) || 
        i.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by sector
    if (sector !== 'all') {
      filtered = filtered.filter(i => 
        i.sectorContext && i.sectorContext.includes(sector)
      );
    }
    
    renderIndicators(filtered);
  }

  // Search functionality
  const searchInput = document.getElementById('indicator-search');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Sector filter functionality
  const sectorFilter = document.getElementById('indicator-filter-sector');
  if (sectorFilter) {
    sectorFilter.addEventListener('change', applyFilters);
  }

  // Invite peers modal
  const inviteBtn = document.getElementById('invite-peers-btn');
  const inviteModal = document.getElementById('invite-modal');
  const closeInviteModal = document.getElementById('close-invite-modal');
  const cancelInvite = document.getElementById('cancel-invite');
  const inviteForm = document.getElementById('invite-form');

  if (inviteBtn) {
    inviteBtn.addEventListener('click', () => {
      inviteModal.classList.remove('hidden');
    });
  }

  if (closeInviteModal) {
    closeInviteModal.addEventListener('click', () => {
      inviteModal.classList.add('hidden');
    });
  }

  if (cancelInvite) {
    cancelInvite.addEventListener('click', () => {
      inviteModal.classList.add('hidden');
      inviteForm.reset();
    });
  }

  if (inviteForm) {
    inviteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('invite-email').value.trim();
      const message = document.getElementById('invite-message').value.trim();
      
      if (!email) {
        alert('Please enter an email address');
        return;
      }
      
      DB.saveInvitation(currentChampion.id, email, panelId, message);
      alert('Invitation sent successfully!');
      inviteForm.reset();
      inviteModal.classList.add('hidden');
    });
  }
  
  } catch (error) {
    console.error('Error initializing indicators page:', error);
    const indicatorsList = document.getElementById('indicators-list');
    if (indicatorsList) {
      indicatorsList.innerHTML = '<p class="text-gray">Error loading indicators. Please refresh the page.</p>';
    }
    const panelTitleEl = document.getElementById('panel-title');
    if (panelTitleEl) {
      panelTitleEl.textContent = 'Error Loading Panel';
    }
  }
});

