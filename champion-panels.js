// Panels page functionality

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  const currentChampion = DB.getCurrentChampion();
  if (!currentChampion) {
    window.location.href = 'champion-login.html';
    return;
  }

  // Display champion name
  const championNameEl = document.getElementById('champion-name');
  if (championNameEl && currentChampion) {
    championNameEl.textContent = currentChampion.firstName || 'Champion';
  }

  // Calculate and display credits (based on votes and comments this week)
  const calculateCredits = () => {
    const votes = JSON.parse(localStorage.getItem('esg-votes') || '[]');
    const comments = JSON.parse(localStorage.getItem('esg-comments') || '[]');
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentVotes = votes.filter(v => {
      if (v.championId !== currentChampion.id) return false;
      return new Date(v.timestamp) >= oneWeekAgo;
    });
    const recentComments = comments.filter(c => {
      if (c.championId !== currentChampion.id) return false;
      return new Date(c.timestamp) >= oneWeekAgo;
    });
    
    // 1 credit per vote, 2 credits per comment
    return recentVotes.length + (recentComments.length * 2);
  };

  const creditsEl = document.getElementById('champion-credits');
  if (creditsEl) {
    creditsEl.textContent = calculateCredits();
  }

  // Load panels
  const panels = DB.getPanels();
  const panelsGrid = document.getElementById('panels-grid');
  let currentPanelId = null;
  
  function renderPanels(filteredPanels) {
    if (filteredPanels.length === 0) {
      panelsGrid.innerHTML = '<p class="text-gray">No panels found matching your search.</p>';
      return;
    }

    panelsGrid.innerHTML = filteredPanels.map(panel => {
      const indicators = DB.getIndicators(panel.id);
      const votes = JSON.parse(localStorage.getItem('esg-votes') || '[]');
      const comments = JSON.parse(localStorage.getItem('esg-comments') || '[]');
      const panelVotes = votes.filter(v => {
        const indicator = DB.getIndicator(v.indicatorId);
        return indicator && indicator.panelId === panel.id;
      });
      const panelComments = comments.filter(c => {
        const indicator = DB.getIndicator(c.indicatorId);
        return indicator && indicator.panelId === panel.id;
      });

      return `
        <div class="panel-card card" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" 
             onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'"
             data-panel-id="${panel.id}">
          <div style="font-size: 3rem; margin-bottom: 1rem; text-align: center;">${panel.icon}</div>
          <h3 style="margin-bottom: 0.75rem; text-align: center;">${panel.title}</h3>
          <p class="text-gray" style="margin-bottom: 1rem; text-align: center; font-size: 0.875rem;">${panel.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f3f4f6;">
            <span class="text-gray" style="font-size: 0.875rem;">
              <span class="badge" style="background-color: ${panel.category === 'environmental' ? '#10b981' : panel.category === 'social' ? '#3b82f6' : '#8b5cf6'}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; text-transform: capitalize;">${panel.category}</span>
            </span>
            <span class="text-gray" style="font-size: 0.875rem;">${indicators.length} indicators</span>
          </div>
          ${panelVotes.length > 0 || panelComments.length > 0 ? `
            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6;">
              <p class="text-gray" style="font-size: 0.75rem;">
                ${panelVotes.length} votes • ${panelComments.length} comments
              </p>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    // Re-attach click handlers after rendering
    attachPanelClickHandlers();
  }

  function attachPanelClickHandlers() {
    document.querySelectorAll('.panel-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const panelId = card.dataset.panelId;
        if (panelId) {
          currentPanelId = panelId;
          showIndicatorSelectionModal(panelId);
        }
      });
    });
  }

  function showIndicatorSelectionModal(panelId) {
    const panel = DB.getPanel(panelId);
    const indicators = DB.getIndicators(panelId);
    
    document.getElementById('selection-modal-title').textContent = `Select Indicators - ${panel.title}`;
    const indicatorsList = document.getElementById('indicators-selection-list');
    
    indicatorsList.innerHTML = indicators.map((indicator, index) => `
      <div style="padding: 0.75rem; border-bottom: 1px solid #f3f4f6; display: flex; align-items: flex-start; gap: 0.75rem;">
        <input type="checkbox" id="indicator-${indicator.id}" value="${indicator.id}" 
               class="indicator-checkbox" style="margin-top: 0.25rem; width: 1.25rem; height: 1.25rem; cursor: pointer;">
        <label for="indicator-${indicator.id}" style="flex: 1; cursor: pointer;">
          <div style="font-weight: 500; margin-bottom: 0.25rem;">${indicator.title}</div>
          <div class="text-gray" style="font-size: 0.875rem;">${indicator.description}</div>
        </label>
      </div>
    `).join('');

    const modal = document.getElementById('indicator-selection-modal');
    modal.classList.remove('hidden');
  }

  // Modal controls
  const closeSelectionModal = document.getElementById('close-selection-modal');
  const cancelSelectionBtn = document.getElementById('cancel-selection-btn');
  const selectAllBtn = document.getElementById('select-all-indicators');
  const deselectAllBtn = document.getElementById('deselect-all-indicators');
  const proceedReviewBtn = document.getElementById('proceed-review-btn');
  const selectionModal = document.getElementById('indicator-selection-modal');

  if (closeSelectionModal) {
    closeSelectionModal.addEventListener('click', () => {
      selectionModal.classList.add('hidden');
      currentPanelId = null;
    });
  }

  if (cancelSelectionBtn) {
    cancelSelectionBtn.addEventListener('click', () => {
      selectionModal.classList.add('hidden');
      currentPanelId = null;
    });
  }

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.indicator-checkbox').forEach(cb => {
        cb.checked = true;
      });
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.indicator-checkbox').forEach(cb => {
        cb.checked = false;
      });
    });
  }

  if (proceedReviewBtn) {
    proceedReviewBtn.addEventListener('click', () => {
      const selectedIndicators = Array.from(document.querySelectorAll('.indicator-checkbox:checked'))
        .map(cb => cb.value);
      
      if (selectedIndicators.length === 0) {
        alert('Please select at least one indicator to review');
        return;
      }

      // Store selected indicators and navigate to review page
      localStorage.setItem('selected-indicators', JSON.stringify(selectedIndicators));
      window.location.href = `champion-indicators.html?panel=${currentPanelId}`;
    });
  }

  // Close modal when clicking outside
  if (selectionModal) {
    selectionModal.addEventListener('click', (e) => {
      if (e.target === selectionModal) {
        selectionModal.classList.add('hidden');
        currentPanelId = null;
      }
    });
  }

  // Initial render
  renderPanels(panels);

  // Apply filters and sorting
  function applyFiltersAndSort() {
    const searchTerm = document.getElementById('panel-search')?.value.toLowerCase() || '';
    const domain = document.getElementById('panel-filter-domain')?.value || 'all';
    const sortBy = document.getElementById('panel-sort')?.value || 'name';
    
    let filtered = [...panels];
    
    // Filter by domain
    if (domain !== 'all') {
      filtered = filtered.filter(p => p.category === domain);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm) || 
        p.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'indicators':
          const aIndicators = DB.getIndicators(a.id).length;
          const bIndicators = DB.getIndicators(b.id).length;
          return bIndicators - aIndicators;
        case 'activity':
          const aVotes = JSON.parse(localStorage.getItem('esg-votes') || '[]').filter(v => {
            const indicator = DB.getIndicator(v.indicatorId);
            return indicator && indicator.panelId === a.id;
          }).length;
          const aComments = JSON.parse(localStorage.getItem('esg-comments') || '[]').filter(c => {
            const indicator = DB.getIndicator(c.indicatorId);
            return indicator && indicator.panelId === a.id;
          }).length;
          const bVotes = JSON.parse(localStorage.getItem('esg-votes') || '[]').filter(v => {
            const indicator = DB.getIndicator(v.indicatorId);
            return indicator && indicator.panelId === b.id;
          }).length;
          const bComments = JSON.parse(localStorage.getItem('esg-comments') || '[]').filter(c => {
            const indicator = DB.getIndicator(c.indicatorId);
            return indicator && indicator.panelId === b.id;
          }).length;
          return (bVotes + bComments) - (aVotes + aComments);
        default:
          return 0;
      }
    });
    
    renderPanels(filtered);
  }

  // Search functionality
  const searchInput = document.getElementById('panel-search');
  if (searchInput) {
    searchInput.addEventListener('input', applyFiltersAndSort);
  }

  // Filter functionality
  const filterSelect = document.getElementById('panel-filter-domain');
  if (filterSelect) {
    filterSelect.addEventListener('change', applyFiltersAndSort);
  }

  // Sort functionality
  const sortSelect = document.getElementById('panel-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFiltersAndSort);
  }

  // Logout is handled by logout.js
});
