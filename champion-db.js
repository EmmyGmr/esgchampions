// ESG Champions Database System
// This uses localStorage but is structured to easily migrate to a real database

const DB = {
  // Initialize database structure
  init: function() {
    if (!localStorage.getItem('esg-champions')) {
      localStorage.setItem('esg-champions', '[]');
    }
    if (!localStorage.getItem('esg-panels')) {
      this.initPanels();
    }
    if (!localStorage.getItem('esg-indicators')) {
      this.initIndicators();
    }
    if (!localStorage.getItem('esg-votes')) {
      localStorage.setItem('esg-votes', '[]');
    }
    if (!localStorage.getItem('esg-comments')) {
      localStorage.setItem('esg-comments', '[]');
    }
    if (!localStorage.getItem('esg-invitations')) {
      localStorage.setItem('esg-invitations', '[]');
    }
  },

  // Initialize 14 ESG panels based on mockup
  initPanels: function() {
    const panels = [
      { 
        id: '1', 
        title: 'Climate & GHG Emissions Panel', 
        category: 'environmental', 
        description: 'Evaluate completeness of Scope 1-3 data. GRI 305, ISSB S2',
        purpose: 'Evaluate data quality and completeness for carbon accounting and emissions reporting.',
        keyIndicators: 'scope1_tco2e → scope3_cat15_tco2e, total_energy_kwh, percent_renewable_energy',
        frameworks: 'GRI 305, ISSB S2, SASB, TCFD Metrics',
        icon: '🌍'
      },
      { 
        id: '2', 
        title: 'Energy & Resource Efficiency Panel', 
        category: 'environmental', 
        description: 'Assess renewable energy mix and intensity data. ISSB S2',
        purpose: 'Assess renewable energy mix, efficiency initiatives, and energy KPIs.',
        keyIndicators: 'total_energy_kwh, renewable_energy_kwh, percent_renewable_energy',
        frameworks: 'GRI 302, SASB "Energy Management"',
        icon: '⚡'
      },
      { 
        id: '3', 
        title: 'Targets & Transition Plans Panel', 
        category: 'environmental', 
        description: 'Validate targets (base year, net zero year, reduction percentages).',
        purpose: 'Validate targets (base year, net zero year, reduction percentages).',
        keyIndicators: 'net_zero_target_year, base_year, near_term_target_scope12_abs_reduction_pct',
        frameworks: 'ISSB S2, TCFD "Strategy"',
        icon: '🎯'
      },
      { 
        id: '4', 
        title: 'ESG Governance & Oversight Panel', 
        category: 'governance', 
        description: 'Review board-level accountability. GRI 2; TCFD',
        purpose: 'Validate governance mechanisms for ESG strategy and reporting.',
        keyIndicators: 'governance_in_place, board_level_responsible',
        frameworks: 'TCFD "Governance", GRI 2, SASB "Leadership & Governance"',
        icon: '👔'
      },
      { 
        id: '5', 
        title: 'Risk & Resilience Panel', 
        category: 'governance', 
        description: 'Map climate and transition risk handling. TCFD Risk Mgmt.',
        purpose: 'Validate enterprise risk mapping, physical/transition risk handling.',
        keyIndicators: 'risk_assessed_status, risk_location, risk_management_actions',
        frameworks: 'TCFD "Risk Management"',
        icon: '⚠️'
      },
      { 
        id: '6', 
        title: 'Frameworks & Assurance Panel', 
        category: 'governance', 
        description: 'Validate alignment with standards and independent verification.',
        purpose: 'Validate alignment with standards and independent verification.',
        keyIndicators: 'commitment_frameworks, standards_referenced, third_party_validation',
        frameworks: 'GRI / ISSB / SASB / TCFD',
        icon: '✅'
      },
      { 
        id: '7', 
        title: 'Strategy & Implementation Panel', 
        category: 'environmental', 
        description: 'Track sustainability initiatives and actions.',
        purpose: 'Track ongoing and planned sustainability initiatives.',
        keyIndicators: 'completed_initiatives, planned_initiatives, challenges_listed',
        frameworks: 'GRI 103, SASB "Activity Metrics"',
        icon: '📋'
      },
      { 
        id: '8', 
        title: 'Data Quality & Methodology Panel', 
        category: 'governance', 
        description: 'Assess calculation methods and data confidence.',
        purpose: 'Validate calculation methods and tools used.',
        keyIndicators: 'calculation_methodology_notes, tools_or_platforms_used',
        frameworks: 'GRI 2-4, ISSB "Measurement guidance"',
        icon: '📊'
      },
      { 
        id: '9', 
        title: 'Organizational Profile Panel', 
        category: 'governance', 
        description: 'Provide context: sector, geography, workforce, revenue period.',
        purpose: 'Provide context: sector, geography, workforce, revenue period.',
        keyIndicators: 'sector, country_region, employees_fte, revenue_reporting_year',
        frameworks: 'GRI 2-1 to 2-7',
        icon: '🏢'
      },
      { 
        id: '10', 
        title: 'Social & Workforce Panel (New)', 
        category: 'social', 
        description: 'Add social indicators (DEI, training).',
        purpose: 'Add social indicators as they appear in later data (e.g., diversity, training, safety).',
        keyIndicators: 'employees_fte (expand later with DEI, training)',
        frameworks: 'GRI 401-404, SASB HR Metrics',
        icon: '👥'
      },
      { 
        id: '11', 
        title: 'Supply Chain & Upstream Impacts Panel (New)', 
        category: 'environmental', 
        description: 'Validate purchased goods, capital goods, fuel data.',
        purpose: 'Validate upstream Scope 3 categories (purchased goods, capital goods, fuel/energy).',
        keyIndicators: 'scope3_cat1-cat8',
        frameworks: 'GRI 308, SASB Supply Chain',
        icon: '📦'
      },
      { 
        id: '12', 
        title: 'Downstream & Product Impacts Panel (New)', 
        category: 'environmental', 
        description: 'Validate downstream Scope 3 impacts (use phase, end-of-life, investments).',
        purpose: 'Validate downstream Scope 3 impacts (use phase, end-of-life, investments).',
        keyIndicators: 'scope3_cat9-cat15',
        frameworks: 'GRI 306, SASB Product Lifecycle',
        icon: '🔄'
      },
      { 
        id: '13', 
        title: 'Financial & Market Disclosure Panel (New)', 
        category: 'governance', 
        description: 'Review financial linkages of sustainability (revenue, cost of capital).',
        purpose: 'Review financial linkages of sustainability (revenue, cost of capital).',
        keyIndicators: 'revenue_reporting_year, net_zero_target_year, sector',
        frameworks: 'ISSB S1, TCFD "Metrics & Targets"',
        icon: '💰'
      },
      { 
        id: '14', 
        title: 'Reporting & Disclosure Quality Panel (New)', 
        category: 'governance', 
        description: 'Assess reporting completeness, transparency, and quality.',
        purpose: 'Assess reporting completeness, transparency, and quality.',
        keyIndicators: 'reporting_period, extraction_confidence, extraction_notes',
        frameworks: 'GRI 102, ISSB S1',
        icon: '📄'
      }
    ];
    localStorage.setItem('esg-panels', JSON.stringify(panels));
  },

  // Initialize comprehensive indicators based on mockup
  initIndicators: function() {
    const indicators = [];
    let indicatorId = 1;

    // Organizational Profile Panel (Panel 9) indicators
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Report ID',
      description: 'Unique identifier automatically assigned to each sustainability report entry.',
      formulaRequired: false, unit: '-', frameworks: 'Internal system field', sectorContext: 'All',
      validationQuestion: 'Is the report reference unique and traceable?'
    });
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Source Filename',
      description: 'The name of the original file from which sustainability data was extracted.',
      formulaRequired: false, unit: 'Text', frameworks: 'Internal', sectorContext: 'All',
      validationQuestion: 'Does the filename reflect the reporting organization and year?'
    });
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Company Name',
      description: 'Registered legal name of the reporting company.',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 2-1', sectorContext: 'All',
      validationQuestion: 'Is name correctly captured and consistent with official registration?'
    });
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Sector',
      description: 'The primary industry sector the company operates in.',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 2-6 / SASB Industry Classification', sectorContext: 'All',
      validationQuestion: 'Is the sector classification aligned with GRI or SASB taxonomy?'
    });
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Country / Region',
      description: 'Country or region where the organization primarily operates or reports emissions.',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 2-1', sectorContext: 'All',
      validationQuestion: 'Does the reported region match the scope of sustainability disclosures?'
    });
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Reporting Year',
      description: 'The calendar or fiscal year for which sustainability data is reported.',
      formulaRequired: false, unit: 'Year (YYYY)', frameworks: 'GRI 302 / 305', sectorContext: 'All',
      validationQuestion: 'Is the reporting period clearly defined and consistent with previous reports?'
    });
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Reporting Period (Start-End)',
      description: 'The start and end dates defining the report\'s coverage period.',
      formulaRequired: false, unit: 'Date range', frameworks: 'GRI 302 / 305', sectorContext: 'All',
      validationQuestion: 'Is the time coverage complete and aligned with reporting year?'
    });
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Employees (FTE)',
      description: 'Number of full-time equivalent employees during the reporting year.',
      formulaRequired: true, unit: 'Count (FTE)', frameworks: 'GRI 2-7 / SASB HR Metrics', sectorContext: 'All',
      validationQuestion: 'Does the employee count reflect full-time equivalents, excluding contractors?'
    });
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Headcount or FTE Basis',
      description: 'Whether workforce figures are reported as total headcount or FTE.',
      formulaRequired: false, unit: 'Text (Headcount/FTE)', frameworks: 'GRI 2-7', sectorContext: 'All',
      validationQuestion: 'Is the measurement basis clearly defined?'
    });
    indicators.push({
      id: `9-${indicatorId++}`, panelId: '9', title: 'Revenue (Reporting Year)',
      description: 'Annual revenue reported in the same fiscal year as sustainability disclosures.',
      formulaRequired: true, unit: 'Currency (e.g., GBP, USD)', frameworks: 'ISSB S1 / GRI 201', sectorContext: 'All',
      validationQuestion: 'Is the financial data aligned with the same period as environmental metrics?'
    });

    // Targets & Transition Plans Panel (Panel 3) indicators
    indicators.push({
      id: `3-${indicatorId++}`, panelId: '3', title: 'Net-Zero Target Year',
      description: 'The year by which the organization commits to reach net-zero GHG emissions.',
      formulaRequired: false, unit: 'Year (YYYY)', frameworks: 'ISSB S2 / TCFD Strategy', sectorContext: 'All',
      validationQuestion: 'Is the target year realistic and aligned with science-based targets?'
    });
    indicators.push({
      id: `3-${indicatorId++}`, panelId: '3', title: 'Base Year',
      description: 'The baseline year used for comparison in GHG reduction targets.',
      formulaRequired: false, unit: 'Year (YYYY)', frameworks: 'GRI 305-5 / TCFD Metrics', sectorContext: 'All',
      validationQuestion: 'Is the base year clearly defined and still relevant to current targets?'
    });
    indicators.push({
      id: `3-${indicatorId++}`, panelId: '3', title: 'Near-term Target (Scope 1+2 Reduction %)',
      description: 'Percentage reduction target for Scope 1 and 2 emissions by a near-term year.',
      formulaRequired: true, unit: '% Reduction', frameworks: 'ISSB S2 / TCFD Metrics', sectorContext: 'All',
      validationQuestion: 'Is the near-term target aligned with 1.5°C pathways?'
    });
    indicators.push({
      id: `3-${indicatorId++}`, panelId: '3', title: 'Near-term Target (Scope 3 Reduction %)',
      description: 'Percentage reduction target for Scope 3 emissions in near-term period.',
      formulaRequired: true, unit: '% Reduction', frameworks: 'ISSB S2 / TCFD Metrics', sectorContext: 'All',
      validationQuestion: 'Does the company disclose Scope 3 reduction targets with methodologies?'
    });
    indicators.push({
      id: `3-${indicatorId++}`, panelId: '3', title: 'Intensity Target Value',
      description: 'Intensity-based GHG target expressed per unit of output or revenue.',
      formulaRequired: true, unit: 'e.g., tCO2e / £ revenue', frameworks: 'GRI 305-4', sectorContext: 'All',
      validationQuestion: 'Is the intensity metric consistent with organizational boundaries?'
    });
    indicators.push({
      id: `3-${indicatorId++}`, panelId: '3', title: 'Intensity Target Unit / Denominator',
      description: 'The denominator for the intensity metric (e.g., revenue, production).',
      formulaRequired: true, unit: 'Text', frameworks: 'GRI 305-4', sectorContext: 'All',
      validationQuestion: 'Is the denominator (output or revenue) defined and measurable?'
    });
    indicators.push({
      id: `3-${indicatorId++}`, panelId: '3', title: 'Commitment Frameworks Referenced',
      description: 'Climate or sustainability frameworks the company aligns with (e.g., SBTi, UNGC).',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 102 / ISSB S2', sectorContext: 'All',
      validationQuestion: 'Are the stated frameworks verifiable and current?'
    });

    // ESG Governance & Oversight Panel (Panel 4) indicators
    indicators.push({
      id: `4-${indicatorId++}`, panelId: '4', title: 'Governance in Place',
      description: 'Indicates if ESG governance structures are formally established.',
      formulaRequired: false, unit: 'Boolean (Yes/No)', frameworks: 'TCFD Governance / GRI 2-9', sectorContext: 'All',
      validationQuestion: 'Is governance accountability clearly described?'
    });
    indicators.push({
      id: `4-${indicatorId++}`, panelId: '4', title: 'Board-level Responsibility',
      description: 'Whether board or senior management oversees ESG / climate strategy.',
      formulaRequired: false, unit: 'Boolean (Yes/No)', frameworks: 'TCFD Governance / GRI 2-10', sectorContext: 'All',
      validationQuestion: 'Is there explicit board oversight for climate risks and targets?'
    });

    // Risk & Resilience Panel (Panel 5) indicators
    indicators.push({
      id: `5-${indicatorId++}`, panelId: '5', title: 'Risk Assessment Status',
      description: 'Status of climate or ESG risk assessment (complete, partial, pending).',
      formulaRequired: false, unit: 'Dropdown (Complete/Partial/None)', frameworks: 'TCFD Risk Management', sectorContext: 'All',
      validationQuestion: 'Has a risk assessment been conducted within the last 24 months?'
    });
    indicators.push({
      id: `5-${indicatorId++}`, panelId: '5', title: 'Risk Location',
      description: 'Geographic or operational areas where material ESG risks are identified.',
      formulaRequired: false, unit: 'Text', frameworks: 'TCFD Risk Management', sectorContext: 'All',
      validationQuestion: 'Are risks geographically specified and relevant?'
    });
    indicators.push({
      id: `5-${indicatorId++}`, panelId: '5', title: 'Risk Management Actions',
      description: 'Description of measures implemented to mitigate identified risks.',
      formulaRequired: false, unit: 'Text', frameworks: 'TCFD Risk Management', sectorContext: 'All',
      validationQuestion: 'Are mitigation actions clearly linked to identified risks?'
    });

    // Energy & Resource Efficiency Panel (Panel 2) indicators
    indicators.push({
      id: `2-${indicatorId++}`, panelId: '2', title: 'Total Energy Consumption (kWh)',
      description: 'Total energy consumed by the organization during the reporting period.',
      formulaRequired: true, unit: 'kWh', frameworks: 'GRI 302-1', sectorContext: 'All',
      validationQuestion: 'Is total energy consumption measured and verified?'
    });
    indicators.push({
      id: `2-${indicatorId++}`, panelId: '2', title: 'Renewable Energy Consumption (kWh)',
      description: 'Total renewable energy consumed during the reporting period.',
      formulaRequired: true, unit: 'kWh', frameworks: 'GRI 302-1', sectorContext: 'All',
      validationQuestion: 'Is renewable energy sourced and certified properly?'
    });
    indicators.push({
      id: `2-${indicatorId++}`, panelId: '2', title: 'Percent Renewable Energy',
      description: 'Percentage of total energy sourced from renewables.',
      formulaRequired: true, unit: '%', frameworks: 'GRI 302-1', sectorContext: 'All',
      validationQuestion: 'Is renewable share accurately calculated from verified energy data?'
    });

    // Climate & GHG Emissions Panel (Panel 1) indicators
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 1 Emissions (tCO2e)',
      description: 'Direct GHG emissions from owned or controlled sources.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-1 / ISSB S2', sectorContext: 'All',
      validationQuestion: 'Are Scope 1 boundaries aligned with GHG Protocol?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 2 Emissions - Location-Based (tCO2e)',
      description: 'Indirect GHG emissions from purchased electricity (location-based).',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-2 / ISSB S2', sectorContext: 'All',
      validationQuestion: 'Are Scope 2 calculations consistent with market and location-based methods?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 2 Emissions - Market-Based (tCO2e)',
      description: 'Indirect GHG emissions using market-based electricity data.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-2 / ISSB S2', sectorContext: 'All',
      validationQuestion: 'Does the company disclose RECs or contractual instruments?'
    });
    // Scope 3 indicators
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Purchased Goods & Services (tCO2e)',
      description: 'Indirect GHG emissions from purchased goods and services.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-3 / ISSB S2', sectorContext: 'Manufacturing / Retail',
      validationQuestion: 'Is supplier data primary or estimated?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Capital Goods (tCO2e)',
      description: 'Indirect emissions from capital goods purchases.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-3', sectorContext: 'Manufacturing',
      validationQuestion: 'Are capital goods included in life cycle boundaries?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Upstream Fuel & Energy Activities (tCO2e)',
      description: 'Upstream emissions from fuel and energy use.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-3', sectorContext: 'Energy',
      validationQuestion: 'Is upstream fuel data from verified energy balances?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Upstream Transportation (tCO2e)',
      description: 'Emissions from transportation and distribution of goods upstream.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-3', sectorContext: 'Logistics / Retail',
      validationQuestion: 'Are logistics partners providing emission factors?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Waste (tCO2e)',
      description: 'Emissions from waste generated in operations.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 306', sectorContext: 'All',
      validationQuestion: 'Are waste emissions calculated per GHG Protocol guidance?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Business Travel (tCO2e)',
      description: 'Emissions from employee business travel.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-3', sectorContext: 'Services',
      validationQuestion: 'Are travel emissions estimated or tracked from travel providers?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Employee Commuting (tCO2e)',
      description: 'Emissions from employee commuting and homeworking.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-3', sectorContext: 'All',
      validationQuestion: 'Are commuting patterns updated post-COVID hybrid models?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Downstream Distribution (tCO2e)',
      description: 'Emissions from downstream product logistics and distribution.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-3', sectorContext: 'Manufacturing / Retail',
      validationQuestion: 'Are downstream distribution emissions modeled consistently?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Product Use (tCO2e)',
      description: 'Emissions from the use of sold products.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-3', sectorContext: 'Manufacturing / Tech',
      validationQuestion: 'Are use-phase assumptions aligned with product life cycle?'
    });
    indicators.push({
      id: `1-${indicatorId++}`, panelId: '1', title: 'Scope 3 Emissions - Product End of Life (tCO2e)',
      description: 'Emissions from product disposal and treatment at end-of-life.',
      formulaRequired: true, unit: 'tCO2e', frameworks: 'GRI 305-3', sectorContext: 'Manufacturing / Retail',
      validationQuestion: 'Are end-of-life emissions estimated from material composition?'
    });

    // Frameworks & Assurance Panel (Panel 6) indicators
    indicators.push({
      id: `6-${indicatorId++}`, panelId: '6', title: 'Standards Referenced',
      description: 'Reporting or assurance standards referenced (e.g., GRI, ISSB, SASB).',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 102 / ISSB S1', sectorContext: 'All',
      validationQuestion: 'Are referenced standards consistent with claimed frameworks?'
    });
    indicators.push({
      id: `6-${indicatorId++}`, panelId: '6', title: 'Third-Party Validation',
      description: 'Indicates if reported data were validated by an independent auditor.',
      formulaRequired: false, unit: 'Boolean (Yes/No)', frameworks: 'GRI 102-56', sectorContext: 'All',
      validationQuestion: 'Is the validation report publicly available or cited?'
    });

    // Strategy & Implementation Panel (Panel 7) indicators
    indicators.push({
      id: `7-${indicatorId++}`, panelId: '7', title: 'Completed Initiatives',
      description: 'ESG or decarbonization projects completed during the reporting year.',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 103-2', sectorContext: 'All',
      validationQuestion: 'Do completed initiatives link to measurable KPIs?'
    });
    indicators.push({
      id: `7-${indicatorId++}`, panelId: '7', title: 'Planned Initiatives',
      description: 'Projects planned for the next reporting cycle.',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 103-2', sectorContext: 'All',
      validationQuestion: 'Are planned actions time-bound and measurable?'
    });
    indicators.push({
      id: `7-${indicatorId++}`, panelId: '7', title: 'Challenges Listed',
      description: 'Challenges or barriers reported in achieving sustainability goals.',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 103-2', sectorContext: 'All',
      validationQuestion: 'Are challenges clearly linked to risk assessment outputs?'
    });

    // Data Quality & Methodology Panel (Panel 8) indicators
    indicators.push({
      id: `8-${indicatorId++}`, panelId: '8', title: 'Calculation Methodology Notes',
      description: 'Notes describing how data were calculated or estimated.',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 102 / ISSB', sectorContext: 'All',
      validationQuestion: 'Are assumptions and emission factors clearly stated?'
    });
    indicators.push({
      id: `8-${indicatorId++}`, panelId: '8', title: 'Tools or Platforms Used',
      description: 'Digital tools or software used to calculate or manage data.',
      formulaRequired: false, unit: 'Text', frameworks: 'GRI 102', sectorContext: 'All',
      validationQuestion: 'Is the calculation tool standardized or proprietary?'
    });

    // Reporting & Disclosure Quality Panel (Panel 14) indicators
    indicators.push({
      id: `14-${indicatorId++}`, panelId: '14', title: 'Extraction Confidence (0-1)',
      description: 'Confidence score for AI/automated data extraction.',
      formulaRequired: true, unit: '0-1 scale', frameworks: 'Internal QA Field', sectorContext: 'All',
      validationQuestion: 'Does extraction confidence align with manual verification results?'
    });
    indicators.push({
      id: `14-${indicatorId++}`, panelId: '14', title: 'Extraction Notes',
      description: 'Notes describing uncertainty or anomalies during data extraction.',
      formulaRequired: false, unit: 'Text', frameworks: 'Internal QA Field', sectorContext: 'All',
      validationQuestion: 'Are extraction issues resolved or flagged for review?'
    });
    indicators.push({
      id: `14-${indicatorId++}`, panelId: '14', title: 'Additional Comments',
      description: 'Any additional contextual or qualitative information.',
      formulaRequired: false, unit: 'Text', frameworks: '-', sectorContext: 'All',
      validationQuestion: 'Is commentary relevant to sustainability context?'
    });

    localStorage.setItem('esg-indicators', JSON.stringify(indicators));
  },

  // Get current champion
  getCurrentChampion: function() {
    const current = localStorage.getItem('current-champion');
    if (!current) return null;
    
    const championData = JSON.parse(current);
    const champions = JSON.parse(localStorage.getItem('esg-champions') || '[]');
    return champions.find(c => c.id === championData.id) || null;
  },

  // Get all panels
  getPanels: function() {
    return JSON.parse(localStorage.getItem('esg-panels') || '[]');
  },

  // Get panel by ID
  getPanel: function(panelId) {
    const panels = this.getPanels();
    return panels.find(p => p.id === panelId);
  },

  // Get indicators for a panel
  getIndicators: function(panelId) {
    const indicators = JSON.parse(localStorage.getItem('esg-indicators') || '[]');
    return indicators.filter(i => i.panelId === panelId);
  },

  // Get indicator by ID
  getIndicator: function(indicatorId) {
    const indicators = JSON.parse(localStorage.getItem('esg-indicators') || '[]');
    return indicators.find(i => i.id === indicatorId);
  },

  // Save vote
  saveVote: function(championId, indicatorId, vote) {
    const votes = JSON.parse(localStorage.getItem('esg-votes') || '[]');
    // Remove existing vote from same champion for this indicator
    const filtered = votes.filter(v => !(v.championId === championId && v.indicatorId === indicatorId));
    filtered.push({
      id: Date.now().toString(),
      championId,
      indicatorId,
      vote, // 'up', 'down', or 'neutral'
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('esg-votes', JSON.stringify(filtered));
  },

  // Get votes for an indicator
  getVotes: function(indicatorId) {
    const votes = JSON.parse(localStorage.getItem('esg-votes') || '[]');
    return votes.filter(v => v.indicatorId === indicatorId);
  },

  // Get vote by champion and indicator
  getChampionVote: function(championId, indicatorId) {
    const votes = JSON.parse(localStorage.getItem('esg-votes') || '[]');
    return votes.find(v => v.championId === championId && v.indicatorId === indicatorId);
  },

  // Save comment
  saveComment: function(championId, indicatorId, comment) {
    const comments = JSON.parse(localStorage.getItem('esg-comments') || '[]');
    const champions = JSON.parse(localStorage.getItem('esg-champions') || '[]');
    const champion = champions.find(c => c.id === championId);
    comments.push({
      id: Date.now().toString(),
      championId,
      championName: champion ? `${champion.firstName} ${champion.lastName}` : 'Anonymous',
      indicatorId,
      comment,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('esg-comments', JSON.stringify(comments));
  },

  // Get comments for an indicator
  getComments: function(indicatorId) {
    const comments = JSON.parse(localStorage.getItem('esg-comments') || '[]');
    return comments.filter(c => c.indicatorId === indicatorId).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  // Save invitation
  saveInvitation: function(fromChampionId, toEmail, panelId, message) {
    const invitations = JSON.parse(localStorage.getItem('esg-invitations') || '[]');
    invitations.push({
      id: Date.now().toString(),
      fromChampionId,
      toEmail,
      panelId,
      message: message || '',
      status: 'pending', // 'pending', 'accepted', 'declined'
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('esg-invitations', JSON.stringify(invitations));
  },

  // Get invitations for a champion
  getInvitations: function(championEmail) {
    const invitations = JSON.parse(localStorage.getItem('esg-invitations') || '[]');
    return invitations.filter(inv => inv.toEmail === championEmail);
  },

  // Get panel participation history for a champion
  getParticipationHistory: function(championId) {
    const votes = JSON.parse(localStorage.getItem('esg-votes') || '[]');
    const comments = JSON.parse(localStorage.getItem('esg-comments') || '[]');
    
    const participatedPanels = new Set();
    
    votes.forEach(vote => {
      if (vote.championId === championId) {
        const indicator = this.getIndicator(vote.indicatorId);
        if (indicator) {
          participatedPanels.add(indicator.panelId);
        }
      }
    });
    
    comments.forEach(comment => {
      if (comment.championId === championId) {
        const indicator = this.getIndicator(comment.indicatorId);
        if (indicator) {
          participatedPanels.add(indicator.panelId);
        }
      }
    });
    
    return Array.from(participatedPanels).map(panelId => {
      const panel = this.getPanel(panelId);
      const panelVotes = votes.filter(v => 
        v.championId === championId && 
        this.getIndicator(v.indicatorId)?.panelId === panelId
      );
      const panelComments = comments.filter(c => 
        c.championId === championId && 
        this.getIndicator(c.indicatorId)?.panelId === panelId
      );
      
      return {
        panel,
        votesCount: panelVotes.length,
        commentsCount: panelComments.length,
        lastActivity: [...panelVotes, ...panelComments]
          .map(a => new Date(a.timestamp))
          .sort((a, b) => b - a)[0]?.toISOString()
      };
    }).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  }
};

// Initialize database on load
DB.init();

