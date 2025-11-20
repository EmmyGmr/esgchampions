// Panels page functionality with Supabase

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check authentication
    const currentChampion = await DB.getCurrentChampion();
    if (!currentChampion) {
      window.location.href = 'champion-login.html';
      return;
    }

    // Display champion name
    const championNameEl = document.getElementById('champion-name');
    if (championNameEl && currentChampion) {
      const firstName = currentChampion.first_name || currentChampion.firstName || 'Champion';
      championNameEl.textContent = firstName;
    }

    // Calculate and display credits (based on votes and comments this week)
    const calculateCredits = async () => {
      try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const [votesResult, commentsResult] = await Promise.all([
          supabaseClient
            .from('votes')
            .select('id')
            .eq('champion_id', currentChampion.id)
            .gte('created_at', oneWeekAgo.toISOString()),
          supabaseClient
            .from('comments')
            .select('id')
            .eq('champion_id', currentChampion.id)
            .gte('created_at', oneWeekAgo.toISOString())
        ]);

        const recentVotes = votesResult.data || [];
        const recentComments = commentsResult.data || [];
        
        // 1 credit per vote, 2 credits per comment
        return recentVotes.length + (recentComments.length * 2);
      } catch (error) {
        console.error('Error calculating credits:', error);
        return 0;
      }
    };

    const creditsEl = document.getElementById('champion-credits');
    if (creditsEl) {
      const credits = await calculateCredits();
      creditsEl.textContent = credits;
    }

    // Load panels (async)
    console.log('Fetching panels from Supabase...');
    const panels = await DB.getPanels();
    const panelsGrid = document.getElementById('panels-grid');
    let currentPanelId = null;
    
    console.log('Panels loaded:', panels);
    console.log('Panels count:', panels?.length || 0);
    console.log('Is array?', Array.isArray(panels));
    
    // Ensure panels is an array
    if (!Array.isArray(panels)) {
      console.error('Panels is not an array:', panels);
      if (panelsGrid) {
        panelsGrid.innerHTML = '<p class="text-gray">Error loading panels. Please refresh the page.</p>';
      }
      return;
    }
    
    if (panels.length === 0) {
      console.warn('No panels found in database. Make sure you ran seed-panels-indicators.sql');
      if (panelsGrid) {
        panelsGrid.innerHTML = '<p class="text-gray">No panels found. Please run the seed script in Supabase.</p>';
      }
      return;
    }
    
    function renderPanels(filteredPanels) {
      // Ensure filteredPanels is an array
      if (!Array.isArray(filteredPanels)) {
        console.error('filteredPanels is not an array:', filteredPanels);
        panelsGrid.innerHTML = '<p class="text-gray">Error rendering panels. Please refresh the page.</p>';
        return;
      }
      
      if (filteredPanels.length === 0) {
        panelsGrid.innerHTML = '<p class="text-gray">No panels found matching your search.</p>';
        return;
      }

      // Use Promise.all to handle async indicator loading
      Promise.all(filteredPanels.map(async (panel) => {
        const indicators = await DB.getIndicators(panel.id);
        
        // Get votes and comments for this panel from Supabase
        const [votesResult, commentsResult] = await Promise.all([
          supabaseClient
            .from('votes')
            .select('*, indicators:indicator_id(panel_id)')
            .eq('champion_id', currentChampion.id),
          supabaseClient
            .from('comments')
            .select('*, indicators:indicator_id(panel_id)')
            .eq('champion_id', currentChampion.id)
        ]);

        const allVotes = votesResult.data || [];
        const allComments = commentsResult.data || [];
        
        const panelVotes = allVotes.filter(v => {
          const indicator = v.indicators;
          return indicator && indicator.panel_id === panel.id;
        });
        
        const panelComments = allComments.filter(c => {
          const indicator = c.indicators;
          return indicator && indicator.panel_id === panel.id;
        });

        return {
          html: `
            <div class="panel-card card" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'"
                 data-panel-id="${panel.id}">
              <div style="font-size: 3rem; margin-bottom: 1rem; text-align: center;">${panel.icon || '📋'}</div>
              <h3 style="margin-bottom: 0.75rem; text-align: center;">${panel.title}</h3>
              <p class="text-gray" style="margin-bottom: 1rem; text-align: center; font-size: 0.875rem;">${panel.description || ''}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f3f4f6;">
                <span class="text-gray" style="font-size: 0.875rem;">
                  <span class="badge" style="background-color: ${panel.category === 'environmental' ? '#10b981' : panel.category === 'social' ? '#3b82f6' : '#8b5cf6'}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; text-transform: capitalize;">${panel.category || 'general'}</span>
                </span>
                <span class="text-gray" style="font-size: 0.875rem;">${indicators ? indicators.length : 0} indicators</span>
              </div>
              ${panelVotes.length > 0 || panelComments.length > 0 ? `
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6;">
                  <p class="text-gray" style="font-size: 0.75rem;">
                    ${panelVotes.length} votes • ${panelComments.length} comments
                  </p>
                </div>
              ` : ''}
            </div>
          `
        };
      })).then(panelHtmls => {
        panelsGrid.innerHTML = panelHtmls.map(p => p.html).join('');
        // Re-attach click handlers after rendering
        attachPanelClickHandlers();
      }).catch(error => {
        console.error('Error rendering panels:', error);
        panelsGrid.innerHTML = '<p class="text-gray">Error loading panels. Please refresh the page.</p>';
      });
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
    if (panelsGrid && panels.length > 0) {
      console.log('Rendering', panels.length, 'panels...');
      renderPanels(panels);
    } else if (panelsGrid) {
      console.warn('Panels grid element found but no panels to render');
      panelsGrid.innerHTML = '<p class="text-gray">No panels found. Please run the seed script in Supabase.</p>';
    } else {
      console.error('Panels grid element not found in DOM');
    }

    // Apply filters and sorting
    async function applyFiltersAndSort() {
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
    
    // Sort (pre-fetch data if needed for async operations)
    if (sortBy === 'indicators' || sortBy === 'activity') {
      // Pre-fetch indicator counts for all panels
      const indicatorCounts = {};
      if (sortBy === 'indicators') {
        await Promise.all(filtered.map(async (panel) => {
          const indicators = await DB.getIndicators(panel.id);
          indicatorCounts[panel.id] = indicators?.length || 0;
        }));
      }
      
      // Pre-fetch votes and comments for activity sorting
      let allVotes = [];
      let allComments = [];
      if (sortBy === 'activity') {
        const [votesResult, commentsResult] = await Promise.all([
          supabaseClient
            .from('votes')
            .select('*, indicators:indicator_id(panel_id)')
            .eq('champion_id', currentChampion.id),
          supabaseClient
            .from('comments')
            .select('*, indicators:indicator_id(panel_id)')
            .eq('champion_id', currentChampion.id)
        ]);
        allVotes = votesResult.data || [];
        allComments = commentsResult.data || [];
      }
      
      // Now sort synchronously with pre-fetched data
      filtered.sort((a, b) => {
        switch(sortBy) {
          case 'indicators':
            return (indicatorCounts[b.id] || 0) - (indicatorCounts[a.id] || 0);
          case 'activity':
            const aVotes = allVotes.filter(v => {
              const indicator = v.indicators;
              return indicator && indicator.panel_id === a.id;
            }).length;
            const aComments = allComments.filter(c => {
              const indicator = c.indicators;
              return indicator && indicator.panel_id === a.id;
            }).length;
            const bVotes = allVotes.filter(v => {
              const indicator = v.indicators;
              return indicator && indicator.panel_id === b.id;
            }).length;
            const bComments = allComments.filter(c => {
              const indicator = c.indicators;
              return indicator && indicator.panel_id === b.id;
            }).length;
            return (bVotes + bComments) - (aVotes + aComments);
          default:
            return 0;
        }
      });
    } else {
      // Synchronous sorting for name-based sorts
      filtered.sort((a, b) => {
        switch(sortBy) {
          case 'name':
            return a.title.localeCompare(b.title);
          case 'name-desc':
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
    }
    
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
    filterSelect.addEventListener('change', () => applyFiltersAndSort());
  }

  // Sort functionality
  const sortSelect = document.getElementById('panel-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => applyFiltersAndSort());
  }
  
  } catch (error) {
    console.error('Error initializing panels page:', error);
    const panelsGrid = document.getElementById('panels-grid');
    if (panelsGrid) {
      panelsGrid.innerHTML = '<p class="text-gray">Error loading panels. Please refresh the page.</p>';
    }
  }
});
