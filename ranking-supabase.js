// Ranking Page with Supabase Integration
// This updates the ranking page to display accepted reviews

document.addEventListener('DOMContentLoaded', async () => {
  // Load accepted reviews from Supabase
  const acceptedReviews = await AdminService.getAcceptedReviews();

  // Group reviews by panel category
  const reviewsByCategory = {
    environmental: [],
    social: [],
    governance: [],
    all: acceptedReviews
  };

  acceptedReviews.forEach(review => {
    const panel = review.panels;
    if (panel && panel.category) {
      if (reviewsByCategory[panel.category]) {
        reviewsByCategory[panel.category].push(review);
      }
    }
  });

  // Calculate rankings based on accepted reviews
  // Group by champion and calculate scores
  const championScores = {};

  acceptedReviews.forEach(review => {
    const champion = review.champions;
    if (!champion) return;

    const championId = champion.id;
    if (!championScores[championId]) {
      championScores[championId] = {
        champion: champion,
        totalScore: 0,
        reviewCount: 0,
        environmental: { score: 0, count: 0 },
        social: { score: 0, count: 0 },
        governance: { score: 0, count: 0 }
      };
    }

    const panel = review.panels;
    const rating = review.rating || 0;
    const necessary = review.necessary === 'yes' ? 1 : 0;

    // Calculate score: rating (0-5) * 20 + necessary bonus (20 points)
    const reviewScore = (rating * 20) + (necessary * 20);

    championScores[championId].totalScore += reviewScore;
    championScores[championId].reviewCount += 1;

    if (panel && panel.category) {
      if (championScores[championId][panel.category]) {
        championScores[championId][panel.category].score += reviewScore;
        championScores[championId][panel.category].count += 1;
      }
    }
  });

  // Convert to array and calculate averages
  const championsRanked = Object.values(championScores).map(champ => {
    const avgScore = champ.reviewCount > 0 
      ? Math.round(champ.totalScore / champ.reviewCount)
      : 0;
    
    const eAvg = champ.environmental.count > 0
      ? Math.round(champ.environmental.score / champ.environmental.count)
      : 0;
    
    const sAvg = champ.social.count > 0
      ? Math.round(champ.social.score / champ.social.count)
      : 0;
    
    const gAvg = champ.governance.count > 0
      ? Math.round(champ.governance.score / champ.governance.count)
      : 0;

    return {
      name: champ.champion.organization || `${champ.champion.first_name} ${champ.champion.last_name}`,
      sector: champ.champion.organization || 'N/A',
      score: avgScore,
      e: eAvg,
      s: sAvg,
      g: gAvg,
      reviewCount: champ.reviewCount
    };
  }).sort((a, b) => b.score - a.score);

  // Update champions data
  const championsData = {
    all: championsRanked,
    environmental: championsRanked.filter(c => c.e > 0),
    social: championsRanked.filter(c => c.s > 0),
    governance: championsRanked.filter(c => c.g > 0)
  };

  // Update top 3 podium if we have champions
  if (championsRanked.length > 0) {
    const top3 = championsRanked.slice(0, 3);
    const podiumContainer = document.querySelector('.grid.grid-cols-3.gap-8.mb-16');
    
    if (podiumContainer && top3.length > 0) {
      const medals = ['🥇', '🥈', '🥉'];
      podiumContainer.innerHTML = top3.map((champ, index) => {
        const order = index === 0 ? 2 : index === 1 ? 1 : 3;
        return `
          <div class="card text-center" style="order: ${order}; ${index === 0 ? 'transform: scale(1.1);' : ''}">
            <div style="font-size: ${index === 0 ? '2.5rem' : '2rem'}; margin-bottom: 1rem;">${medals[index]}</div>
            <h3 style="margin-bottom: 0.5rem;">${champ.name}</h3>
            <p class="text-gray mb-4" style="font-size: 0.875rem;">${champ.sector}</p>
            <div style="font-size: ${index === 0 ? '3rem' : '2.5rem'}; font-weight: 700; color: #0D4D6C; margin-bottom: 0.5rem;">${champ.score}</div>
            <span class="text-gray" style="font-size: 0.875rem;">Overall Score</span>
          </div>
        `;
      }).join('');
    }
  }

  // Update stats
  const statsContainer = document.querySelector('.grid.grid-cols-3.gap-8');
  if (statsContainer) {
    const totalChampions = championsRanked.length;
    const avgImprovement = championsRanked.length > 0 
      ? Math.round(championsRanked.reduce((sum, c) => sum + c.score, 0) / championsRanked.length)
      : 0;
    const industries = new Set(championsRanked.map(c => c.sector)).size;

    statsContainer.innerHTML = `
      <div class="card text-center">
        <div class="text-primary mb-2" style="font-size: 2.5rem; font-weight: 700;">${totalChampions}+</div>
        <p class="text-gray mb-2" style="font-weight: 600;">Total Champions</p>
        <p class="text-gray" style="font-size: 0.875rem;">Organizations recognized globally</p>
      </div>
      <div class="card text-center">
        <div class="text-primary mb-2" style="font-size: 2.5rem; font-weight: 700;">${avgImprovement}%</div>
        <p class="text-gray mb-2" style="font-weight: 600;">Average ESG Score</p>
        <p class="text-gray" style="font-size: 0.875rem;">Based on accepted reviews</p>
      </div>
      <div class="card text-center">
        <div class="text-primary mb-2" style="font-size: 2.5rem; font-weight: 700;">${industries}</div>
        <p class="text-gray mb-2" style="font-weight: 600;">Industries Covered</p>
        <p class="text-gray" style="font-size: 0.875rem;">Across all major sectors</p>
      </div>
    `;
  }

  // Render champions function (from original ranking.html)
  function renderChampions(category) {
    const champions = championsData[category] || championsData.all;
    const gridId = `champions-grid-${category}`;
    const grid = document.getElementById(gridId);
    
    if (!grid) return;

    if (champions.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p class="text-gray">No champions found in this category yet.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = champions.map((champion, index) => `
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div style="font-size: 1.5rem; font-weight: 700; color: #0D4D6C;">#${index + 1}</div>
          <div style="font-size: 2rem; font-weight: 700; color: #0D4D6C;">${champion.score}</div>
        </div>
        <h3 style="margin-bottom: 0.5rem;">${champion.name}</h3>
        <p class="text-gray mb-4" style="font-size: 0.875rem;">${champion.sector}</p>
        <div style="padding-top: 1rem; border-top: 1px solid #e5e7eb;">
          <div class="flex justify-between mb-2" style="font-size: 0.875rem;">
            <span class="text-gray">Environmental:</span>
            <span style="font-weight: 600;">${champion.e}</span>
          </div>
          <div class="flex justify-between mb-2" style="font-size: 0.875rem;">
            <span class="text-gray">Social:</span>
            <span style="font-weight: 600;">${champion.s}</span>
          </div>
          <div class="flex justify-between" style="font-size: 0.875rem;">
            <span class="text-gray">Governance:</span>
            <span style="font-weight: 600;">${champion.g}</span>
          </div>
        </div>
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
          <p class="text-gray" style="font-size: 0.75rem;">${champion.reviewCount} review${champion.reviewCount !== 1 ? 's' : ''}</p>
        </div>
      </div>
    `).join('');
  }

  // Initial render
  renderChampions('all');
  renderChampions('environmental');
  renderChampions('social');
  renderChampions('governance');

  // Tab functionality (from original ranking.html)
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Update active button
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      
      const activeContent = document.getElementById(`tab-${tab}`);
      if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
      }
    });
  });
});

