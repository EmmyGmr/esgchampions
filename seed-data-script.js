// Seed Data Script for Supabase
// This script helps migrate panels and indicators from champion-db.js to Supabase
// Run this in your browser console after setting up Supabase and loading the necessary scripts

// IMPORTANT: Make sure you have:
// 1. Loaded supabase-config.js and supabase-service.js
// 2. Authenticated as a user with admin privileges (or adjust RLS policies)

const SeedData = {
  // Panels data from champion-db.js
  panels: [
    { 
      id: '1', 
      title: 'Climate & GHG Emissions Panel', 
      category: 'environmental', 
      description: 'Evaluate completeness of Scope 1-3 data. GRI 305, ISSB S2',
      purpose: 'Evaluate data quality and completeness for carbon accounting and emissions reporting.',
      key_indicators: 'scope1_tco2e → scope3_cat15_tco2e, total_energy_kwh, percent_renewable_energy',
      frameworks: 'GRI 305, ISSB S2, SASB, TCFD Metrics',
      icon: '🌍'
    },
    { 
      id: '2', 
      title: 'Energy & Resource Efficiency Panel', 
      category: 'environmental', 
      description: 'Assess renewable energy mix and intensity data. ISSB S2',
      purpose: 'Assess renewable energy mix, efficiency initiatives, and energy KPIs.',
      key_indicators: 'total_energy_kwh, renewable_energy_kwh, percent_renewable_energy',
      frameworks: 'GRI 302, SASB "Energy Management"',
      icon: '⚡'
    },
    { 
      id: '3', 
      title: 'Targets & Transition Plans Panel', 
      category: 'environmental', 
      description: 'Validate targets (base year, net zero year, reduction percentages).',
      purpose: 'Validate targets (base year, net zero year, reduction percentages).',
      key_indicators: 'net_zero_target_year, base_year, near_term_target_scope12_abs_reduction_pct',
      frameworks: 'ISSB S2, TCFD "Strategy"',
      icon: '🎯'
    },
    { 
      id: '4', 
      title: 'ESG Governance & Oversight Panel', 
      category: 'governance', 
      description: 'Review board-level accountability. GRI 2; TCFD',
      purpose: 'Validate governance mechanisms for ESG strategy and reporting.',
      key_indicators: 'governance_in_place, board_level_responsible',
      frameworks: 'TCFD "Governance", GRI 2, SASB "Leadership & Governance"',
      icon: '👔'
    },
    { 
      id: '5', 
      title: 'Risk & Resilience Panel', 
      category: 'governance', 
      description: 'Map climate and transition risk handling. TCFD Risk Mgmt.',
      purpose: 'Validate enterprise risk mapping, physical/transition risk handling.',
      key_indicators: 'risk_assessed_status, risk_location, risk_management_actions',
      frameworks: 'TCFD "Risk Management"',
      icon: '⚠️'
    },
    { 
      id: '6', 
      title: 'Frameworks & Assurance Panel', 
      category: 'governance', 
      description: 'Validate alignment with standards and independent verification.',
      purpose: 'Validate alignment with standards and independent verification.',
      key_indicators: 'commitment_frameworks, standards_referenced, third_party_validation',
      frameworks: 'GRI / ISSB / SASB / TCFD',
      icon: '✅'
    },
    { 
      id: '7', 
      title: 'Strategy & Implementation Panel', 
      category: 'environmental', 
      description: 'Track sustainability initiatives and actions.',
      purpose: 'Track ongoing and planned sustainability initiatives.',
      key_indicators: 'completed_initiatives, planned_initiatives, challenges_listed',
      frameworks: 'GRI 103, SASB "Activity Metrics"',
      icon: '📋'
    },
    { 
      id: '8', 
      title: 'Data Quality & Methodology Panel', 
      category: 'governance', 
      description: 'Assess calculation methods and data confidence.',
      purpose: 'Validate calculation methods and tools used.',
      key_indicators: 'calculation_methodology_notes, tools_or_platforms_used',
      frameworks: 'GRI 2-4, ISSB "Measurement guidance"',
      icon: '📊'
    },
    { 
      id: '9', 
      title: 'Organizational Profile Panel', 
      category: 'governance', 
      description: 'Provide context: sector, geography, workforce, revenue period.',
      purpose: 'Provide context: sector, geography, workforce, revenue period.',
      key_indicators: 'sector, country_region, employees_fte, revenue_reporting_year',
      frameworks: 'GRI 2-1 to 2-7',
      icon: '🏢'
    },
    { 
      id: '10', 
      title: 'Social & Workforce Panel (New)', 
      category: 'social', 
      description: 'Add social indicators (DEI, training).',
      purpose: 'Add social indicators as they appear in later data (e.g., diversity, training, safety).',
      key_indicators: 'employees_fte (expand later with DEI, training)',
      frameworks: 'GRI 401-404, SASB HR Metrics',
      icon: '👥'
    },
    { 
      id: '11', 
      title: 'Supply Chain & Upstream Impacts Panel (New)', 
      category: 'environmental', 
      description: 'Validate purchased goods, capital goods, fuel data.',
      purpose: 'Validate upstream Scope 3 categories (purchased goods, capital goods, fuel/energy).',
      key_indicators: 'scope3_cat1-cat8',
      frameworks: 'GRI 308, SASB Supply Chain',
      icon: '📦'
    },
    { 
      id: '12', 
      title: 'Downstream & Product Impacts Panel (New)', 
      category: 'environmental', 
      description: 'Validate downstream Scope 3 impacts (use phase, end-of-life, investments).',
      purpose: 'Validate downstream Scope 3 impacts (use phase, end-of-life, investments).',
      key_indicators: 'scope3_cat9-cat15',
      frameworks: 'GRI 306, SASB Product Lifecycle',
      icon: '🔄'
    },
    { 
      id: '13', 
      title: 'Financial & Market Disclosure Panel (New)', 
      category: 'governance', 
      description: 'Review financial linkages of sustainability (revenue, cost of capital).',
      purpose: 'Review financial linkages of sustainability (revenue, cost of capital).',
      key_indicators: 'revenue_reporting_year, net_zero_target_year, sector',
      frameworks: 'ISSB S1, TCFD "Metrics & Targets"',
      icon: '💰'
    },
    { 
      id: '14', 
      title: 'Reporting & Disclosure Quality Panel (New)', 
      category: 'governance', 
      description: 'Assess reporting completeness, transparency, and quality.',
      purpose: 'Assess reporting completeness, transparency, and quality.',
      key_indicators: 'reporting_period, extraction_confidence, extraction_notes',
      frameworks: 'GRI 102, ISSB S1',
      icon: '📄'
    }
  ],

  // Function to seed panels
  async seedPanels() {
    console.log('Starting to seed panels...');
    try {
      const result = await SupabaseService.initPanels(this.panels);
      console.log('✅ Panels seeded successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error seeding panels:', error);
      throw error;
    }
  },

  // Function to seed indicators (you'll need to add the full indicators array from champion-db.js)
  async seedIndicators() {
    console.log('Starting to seed indicators...');
    
    // NOTE: You need to copy the full indicators array from champion-db.js initIndicators function
    // and format it like this:
    const indicators = [
      // Example structure:
      // {
      //   id: '9-1',
      //   panel_id: '9',
      //   title: 'Report ID',
      //   description: 'Unique identifier automatically assigned to each sustainability report entry.',
      //   formula_required: false,
      //   unit: '-',
      //   frameworks: 'Internal system field',
      //   sector_context: 'All',
      //   validation_question: 'Is the report reference unique and traceable?'
      // },
      // ... add all indicators here
    ];

    if (indicators.length === 0) {
      console.warn('⚠️ No indicators to seed. Please add indicators array from champion-db.js');
      return;
    }

    try {
      // Insert in batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < indicators.length; i += batchSize) {
        const batch = indicators.slice(i, i + batchSize);
        const result = await SupabaseService.initIndicators(batch);
        console.log(`✅ Seeded indicators batch ${Math.floor(i/batchSize) + 1}:`, result.length);
      }
      console.log('✅ All indicators seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding indicators:', error);
      throw error;
    }
  },

  // Run all seeding
  async seedAll() {
    console.log('🌱 Starting data seeding...');
    try {
      await this.seedPanels();
      await this.seedIndicators();
      console.log('✅ All data seeded successfully!');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
    }
  }
};

// Usage:
// 1. Seed panels only: await SeedData.seedPanels()
// 2. Seed indicators only: await SeedData.seedIndicators()
// 3. Seed everything: await SeedData.seedAll()

// Make it available globally
window.SeedData = SeedData;

