// Admin Panel and Indicator Management
// Handles CRUD operations for panels and indicators

document.addEventListener('DOMContentLoaded', async () => {
  // Tab switching
  const tabs = document.querySelectorAll('.admin-tab');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}-tab`) {
          content.classList.add('active');
        }
      });

      // Load data for the active tab
      if (targetTab === 'panels') {
        loadPanels();
      } else if (targetTab === 'indicators') {
        loadIndicators();
      }
    });
  });

  // Panel Management
  const addPanelBtn = document.getElementById('add-panel-btn');
  const panelForm = document.getElementById('panel-form');
  const panelFormModal = document.getElementById('panel-form-modal');
  const closePanelFormBtn = document.getElementById('close-panel-form-modal');
  const cancelPanelFormBtn = document.getElementById('cancel-panel-form');

  if (addPanelBtn) {
    addPanelBtn.addEventListener('click', () => {
      openPanelForm();
    });
  }

  if (closePanelFormBtn) {
    closePanelFormBtn.addEventListener('click', closePanelForm);
  }

  if (cancelPanelFormBtn) {
    cancelPanelFormBtn.addEventListener('click', closePanelForm);
  }

  if (panelForm) {
    panelForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await savePanel();
    });
  }

  // Indicator Management
  const addIndicatorBtn = document.getElementById('add-indicator-btn');
  const indicatorForm = document.getElementById('indicator-form');
  const indicatorFormModal = document.getElementById('indicator-form-modal');
  const closeIndicatorFormBtn = document.getElementById('close-indicator-form-modal');
  const cancelIndicatorFormBtn = document.getElementById('cancel-indicator-form');
  const indicatorPanelFilter = document.getElementById('indicator-panel-filter');

  if (addIndicatorBtn) {
    addIndicatorBtn.addEventListener('click', () => {
      openIndicatorForm();
    });
  }

  if (closeIndicatorFormBtn) {
    closeIndicatorFormBtn.addEventListener('click', closeIndicatorForm);
  }

  if (cancelIndicatorFormBtn) {
    cancelIndicatorFormBtn.addEventListener('click', closeIndicatorForm);
  }

  if (indicatorForm) {
    indicatorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveIndicator();
    });
  }

  if (indicatorPanelFilter) {
    indicatorPanelFilter.addEventListener('change', () => {
      loadIndicators();
    });
  }

  // Load initial data
  await loadPanels();
  await loadIndicators();
});

// ============================================
// PANEL MANAGEMENT FUNCTIONS
// ============================================

async function loadPanels() {
  const container = document.getElementById('panels-container');
  if (!container) return;

  try {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><p>Loading panels...</p></div>';

    const panels = await AdminService.getAllPanels();

    if (panels.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No panels found. Add your first panel to get started.</p></div>';
      return;
    }

    container.innerHTML = panels.map(panel => `
      <div class="panel-card" data-panel-id="${panel.id}">
        <div class="panel-header">
          <div>
            <h3 style="margin-bottom: 0.5rem;">${panel.icon || '📋'} ${panel.title}</h3>
            <span class="category-badge category-${panel.category}">${panel.category}</span>
          </div>
          <div class="panel-actions">
            <button class="btn-secondary" onclick="editPanel('${panel.id}')">Edit</button>
            <button class="btn-secondary" onclick="deletePanelConfirm('${panel.id}', '${panel.title.replace(/'/g, "\\'")}')" style="color: #ef4444;">Delete</button>
          </div>
        </div>
        ${panel.description ? `<p style="color: #6b7280; margin-bottom: 0.5rem;">${panel.description}</p>` : ''}
        ${panel.purpose ? `<p style="color: #6b7280; font-size: 0.875rem;">Purpose: ${panel.purpose}</p>` : ''}
        <div class="panel-meta">
          <div class="meta-item">
            <span class="meta-label">Created</span>
            <span class="meta-value">${new Date(panel.created_at).toLocaleDateString()}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">ID</span>
            <span class="meta-value" style="font-family: monospace; font-size: 0.875rem;">${panel.id}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading panels:', error);
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><p>Error loading panels: ${error.message}</p></div>`;
  }
}

function openPanelForm(panelId = null) {
  const modal = document.getElementById('panel-form-modal');
  const form = document.getElementById('panel-form');
  const title = document.getElementById('panel-form-title');
  const formId = document.getElementById('panel-form-id');

  if (!modal || !form || !title || !formId) {
    console.error('Panel form elements not found');
    return;
  }

  if (panelId) {
    // Edit mode - load panel data
    AdminService.getAllPanels().then(panels => {
      const panel = panels.find(p => p.id === panelId);
      if (panel) {
        formId.value = panel.id;
        document.getElementById('panel-title').value = panel.title;
        document.getElementById('panel-category').value = panel.category;
        document.getElementById('panel-description').value = panel.description || '';
        document.getElementById('panel-purpose').value = panel.purpose || '';
        document.getElementById('panel-icon').value = panel.icon || '';
        title.textContent = 'Edit Panel';
      }
    });
  } else {
    // Add mode
    form.reset();
    formId.value = '';
    title.textContent = 'Add Panel';
  }

  modal.classList.remove('hidden');
}

function closePanelForm() {
  const modal = document.getElementById('panel-form-modal');
  modal.classList.add('hidden');
  document.getElementById('panel-form').reset();
}

async function savePanel() {
  const form = document.getElementById('panel-form');
  const formId = document.getElementById('panel-form-id').value;
  const title = document.getElementById('panel-title').value;
  const category = document.getElementById('panel-category').value;
  const description = document.getElementById('panel-description').value;
  const purpose = document.getElementById('panel-purpose').value;
  const icon = document.getElementById('panel-icon').value;

  if (!title || !category) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    const panelData = {
      title,
      category,
      description,
      purpose,
      icon
    };

    if (formId) {
      // Update existing panel
      await AdminService.updatePanel(formId, panelData);
      alert('Panel updated successfully!');
    } else {
      // Create new panel
      await AdminService.createPanel(panelData);
      alert('Panel created successfully!');
    }

    closePanelForm();
    await loadPanels();
  } catch (error) {
    console.error('Error saving panel:', error);
    alert(`Error: ${error.message}`);
  }
}

async function editPanel(panelId) {
  openPanelForm(panelId);
}

async function deletePanelConfirm(panelId, panelTitle) {
  if (!confirm(`Are you sure you want to delete "${panelTitle}"?\n\nThis action cannot be undone.`)) {
    return;
  }

  try {
    await AdminService.deletePanel(panelId);
    alert('Panel deleted successfully!');
    await loadPanels();
  } catch (error) {
    console.error('Error deleting panel:', error);
    alert(`Error: ${error.message}`);
  }
}

// ============================================
// INDICATOR MANAGEMENT FUNCTIONS
// ============================================

async function loadIndicators() {
  const container = document.getElementById('indicators-container');
  const filter = document.getElementById('indicator-panel-filter');
  if (!container) return;

  try {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><p>Loading indicators...</p></div>';

    const panelFilter = filter ? filter.value : 'all';
    const indicators = await AdminService.getAllIndicators({ panelId: panelFilter });

    if (indicators.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><p>No indicators found. Add your first indicator to get started.</p></div>';
      return;
    }

    container.innerHTML = indicators.map(indicator => {
      const panel = indicator.panels;
      return `
        <div class="indicator-card" data-indicator-id="${indicator.id}">
          <div class="indicator-header">
            <div>
              <h3 style="margin-bottom: 0.5rem;">${indicator.title}</h3>
              ${panel ? `<p style="color: #6b7280; font-size: 0.875rem;">Panel: <strong>${panel.title}</strong> <span class="category-badge category-${panel.category}">${panel.category}</span></p>` : ''}
            </div>
            <div class="indicator-actions">
              <button class="btn-secondary" onclick="editIndicator('${indicator.id}')">Edit</button>
              <button class="btn-secondary" onclick="deleteIndicatorConfirm('${indicator.id}', '${indicator.title.replace(/'/g, "\\'")}')" style="color: #ef4444;">Delete</button>
            </div>
          </div>
          ${indicator.description ? `<p style="color: #6b7280; margin-bottom: 0.5rem;">${indicator.description}</p>` : ''}
          <div class="indicator-meta">
            ${indicator.unit ? `<div class="meta-item"><span class="meta-label">Unit</span><span class="meta-value">${indicator.unit}</span></div>` : ''}
            ${indicator.frameworks ? `<div class="meta-item"><span class="meta-label">Frameworks</span><span class="meta-value">${indicator.frameworks}</span></div>` : ''}
            ${indicator.formula_required ? `<div class="meta-item"><span class="meta-label">Formula Required</span><span class="meta-value">Yes</span></div>` : ''}
            <div class="meta-item">
              <span class="meta-label">Created</span>
              <span class="meta-value">${new Date(indicator.created_at).toLocaleDateString()}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">ID</span>
              <span class="meta-value" style="font-family: monospace; font-size: 0.875rem;">${indicator.id}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading indicators:', error);
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><p>Error loading indicators: ${error.message}</p></div>`;
  }
}

async function loadPanelsForIndicatorForm() {
  const select = document.getElementById('indicator-panel');
  const filter = document.getElementById('indicator-panel-filter');
  
  if (!select) return;

  try {
    const panels = await AdminService.getAllPanels();
    
    // Clear and populate select
    select.innerHTML = '<option value="">Select panel</option>';
    panels.forEach(panel => {
      const option = document.createElement('option');
      option.value = panel.id;
      option.textContent = `${panel.icon || '📋'} ${panel.title} (${panel.category})`;
      select.appendChild(option);
    });

    // Also populate filter dropdown
    if (filter) {
      filter.innerHTML = '<option value="all">All Panels</option>';
      panels.forEach(panel => {
        const option = document.createElement('option');
        option.value = panel.id;
        option.textContent = `${panel.icon || '📋'} ${panel.title}`;
        filter.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading panels for form:', error);
  }
}

function openIndicatorForm(indicatorId = null) {
  const modal = document.getElementById('indicator-form-modal');
  const form = document.getElementById('indicator-form');
  const title = document.getElementById('indicator-form-title');
  const formId = document.getElementById('indicator-form-id');

  if (!modal || !form || !title || !formId) {
    console.error('Indicator form elements not found');
    return;
  }

  // Load panels first
  loadPanelsForIndicatorForm().then(() => {
    if (indicatorId) {
      // Edit mode - load indicator data
      AdminService.getAllIndicators().then(indicators => {
        const indicator = indicators.find(i => i.id === indicatorId);
        if (indicator) {
          formId.value = indicator.id;
          document.getElementById('indicator-title').value = indicator.title;
          document.getElementById('indicator-panel').value = indicator.panel_id;
          document.getElementById('indicator-description').value = indicator.description || '';
          document.getElementById('indicator-unit').value = indicator.unit || '';
          document.getElementById('indicator-frameworks').value = indicator.frameworks || '';
          document.getElementById('indicator-formula-required').checked = indicator.formula_required || false;
          title.textContent = 'Edit Indicator';
        }
      });
    } else {
      // Add mode
      form.reset();
      formId.value = '';
      title.textContent = 'Add Indicator';
    }

    modal.classList.remove('hidden');
  });
}

function closeIndicatorForm() {
  const modal = document.getElementById('indicator-form-modal');
  modal.classList.add('hidden');
  document.getElementById('indicator-form').reset();
}

async function saveIndicator() {
  const form = document.getElementById('indicator-form');
  const formId = document.getElementById('indicator-form-id').value;
  const title = document.getElementById('indicator-title').value;
  const panelId = document.getElementById('indicator-panel').value;
  const description = document.getElementById('indicator-description').value;
  const unit = document.getElementById('indicator-unit').value;
  const frameworks = document.getElementById('indicator-frameworks').value;
  const formulaRequired = document.getElementById('indicator-formula-required').checked;

  if (!title || !panelId) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    const indicatorData = {
      title,
      panelId,
      description,
      unit,
      frameworks,
      formulaRequired
    };

    if (formId) {
      // Update existing indicator
      await AdminService.updateIndicator(formId, indicatorData);
      alert('Indicator updated successfully!');
    } else {
      // Create new indicator
      await AdminService.createIndicator(indicatorData);
      alert('Indicator created successfully!');
    }

    closeIndicatorForm();
    await loadIndicators();
  } catch (error) {
    console.error('Error saving indicator:', error);
    alert(`Error: ${error.message}`);
  }
}

async function editIndicator(indicatorId) {
  openIndicatorForm(indicatorId);
}

async function deleteIndicatorConfirm(indicatorId, indicatorTitle) {
  if (!confirm(`Are you sure you want to delete "${indicatorTitle}"?\n\nThis action cannot be undone.`)) {
    return;
  }

  try {
    await AdminService.deleteIndicator(indicatorId);
    alert('Indicator deleted successfully!');
    await loadIndicators();
  } catch (error) {
    console.error('Error deleting indicator:', error);
    alert(`Error: ${error.message}`);
  }
}

// Make functions available globally for onclick handlers
window.editPanel = editPanel;
window.deletePanelConfirm = deletePanelConfirm;
window.editIndicator = editIndicator;
window.deleteIndicatorConfirm = deleteIndicatorConfirm;

