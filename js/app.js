/**
 * app.js - Main renderer for MoneyClever
 * Page detection, routing, and rendering of all pages
 */

/* Scroll restoration */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('mc-scroll-' + location.pathname, window.scrollY);
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await Data.init();
    await I18n.init();
  } catch (e) {
    console.error('MoneyClever init failed:', e);
    return;
  }

  if (typeof StrategySelector !== 'undefined') StrategySelector.init();

  _setupTooltip();
  _setupScrollTop();

  const page = detectPage();
  renderPage(page);

  const savedY = sessionStorage.getItem('mc-scroll-' + location.pathname);
  if (savedY) {
    requestAnimationFrame(() => window.scrollTo(0, parseInt(savedY, 10)));
  }

  document.addEventListener('mc-lang-change', () => renderPage(detectPage()));
});

/* ========== PAGE DETECTION ========== */
function detectPage() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('trading-markets')) return 'trading-markets';
  if (path.includes('passive-income')) return 'passive-income';
  if (path.includes('business-entrepreneurship')) return 'business-entrepreneurship';
  if (path.includes('investment-fundamentals')) return 'investment-fundamentals';
  if (path.includes('productivity-time')) return 'productivity-time';
  if (path.includes('financial-literacy')) return 'financial-literacy';
  if (path.includes('strategy-detail')) return 'strategy-detail';
  if (path.includes('compare')) return 'compare';
  if (path.includes('quiz')) return 'quiz';
  if (path.includes('risk-calculator')) return 'risk-calculator';
  if (path.includes('thinkers')) return 'thinkers';
  if (path.includes('principles')) return 'principles';
  return 'index';
}

function renderPage(page) {
  const renderers = {
    'index': renderIndex,
    'trading-markets': () => renderCategory('trading-markets'),
    'passive-income': () => renderCategory('passive-income'),
    'business-entrepreneurship': () => renderCategory('business-entrepreneurship'),
    'investment-fundamentals': () => renderCategory('investment-fundamentals'),
    'productivity-time': () => renderCategory('productivity-time'),
    'financial-literacy': () => renderCategory('financial-literacy'),
    'strategy-detail': renderStrategyDetail,
    'compare': renderCompare,
    'quiz': renderQuiz,
    'risk-calculator': renderRiskCalculator,
    'thinkers': renderThinkers,
    'principles': renderPrinciples
  };
  if (renderers[page]) renderers[page]();
}

/* ========== HELPERS ========== */
function _t(key) { return I18n.t(key); }
function _strategyName(s) { return I18n.getStrategyName(s); }

function _categoryColor(catId) {
  const cat = Data.getCategory(catId);
  return cat ? cat.color : '#00695C';
}

function _riskBadge(level) {
  return `<span class="risk-badge risk-badge--${level}">${_t('risk.' + level)}</span>`;
}

function _difficultyBadge(level) {
  const color = Data.getDifficultyColor(level);
  return `<span class="diff-badge" style="background:${color}20;color:${color}">${_t('difficulty.' + level)}</span>`;
}

function _capitalBadge(tier) {
  if (!tier) return '';
  return `<span class="capital-badge capital-badge--${tier}">${_t('capital.' + tier)}</span>`;
}

function _timeBadge(time) {
  if (!time) return '';
  return `<span class="time-badge">${_t('time_to_results.' + time)}</span>`;
}

function _evidenceBadge(rating) {
  if (!rating) return '';
  const color = Data.getEvidenceColor(rating);
  return `<span class="evidence-badge" style="background:${color}">${_t('evidence.' + rating)}</span>`;
}

function _benefitBarHtml(dimension, value) {
  const info = Data.getBenefits()[dimension] || {};
  const pct = (value / 5) * 100;
  return `<div class="mini-bar" title="${_t(info.name_key || ('benefit.' + dimension))}: ${value}/5">
    <div class="mini-bar-fill" style="width:${pct}%;background:${info.color || '#26A69A'}"></div>
  </div>`;
}

function _benefitFullBar(dimension, value) {
  const info = Data.getBenefits()[dimension] || {};
  const pct = (value / 5) * 100;
  return `<div class="benefit-bar">
    <div class="benefit-bar-label">
      <span>${info.icon || ''} ${_t(info.name_key || ('benefit.' + dimension))}</span>
      <span>${value}/5</span>
    </div>
    <div class="benefit-bar-track">
      <div class="benefit-bar-fill" style="width:${pct}%;background:${info.color || '#26A69A'}"></div>
    </div>
  </div>`;
}

function _strategyCardHtml(strategy) {
  const name = _strategyName(strategy);
  const emoji = strategy.emoji || '';
  const catColor = _categoryColor(strategy.category);
  const benefits = strategy.benefits || {};
  const dims = ['income', 'time_freedom', 'scalability', 'stability', 'accessibility'];

  const benefitPreview = dims.map(d => _benefitBarHtml(d, benefits[d] || 0)).join('');

  const returnStr = strategy.expected_return
    ? `${strategy.expected_return.annual_pct}% ${_t('expected_return.annual')}`
    : '';

  return `<a href="strategy-detail.html?id=${strategy.id}" class="card strategy-card" style="border-left-color:${catColor}">
    <div class="strategy-card-header">
      <span class="card-icon">${emoji}</span>
      <span class="card-title">${name}</span>
    </div>
    <div class="strategy-card-badges">
      ${_riskBadge(strategy.risk_level)}
      ${_difficultyBadge(strategy.difficulty)}
    </div>
    <div class="strategy-card-badges-row2">
      ${_capitalBadge(strategy.capital_needed ? strategy.capital_needed.tier : null)}
      ${_timeBadge(strategy.time_to_results)}
    </div>
    ${returnStr ? `<div class="strategy-card-return">${returnStr}</div>` : ''}
    <div class="strategy-card-benefits">${benefitPreview}</div>
    <span class="card-link" style="color:${catColor}">${_t('detail.view')} \u2192</span>
  </a>`;
}

function _backLink() {
  return `<a href="index.html" class="back-link">\u2190 ${_t('detail.back')}</a>`;
}

function _shareBarHtml(id) {
  return `<div class="share-bar" id="${id}">
    <span>${_t('share.label')}:</span>
    <button class="share-btn" data-share="twitter">${_t('share.twitter')}</button>
    <button class="share-btn" data-share="facebook">${_t('share.facebook')}</button>
    <button class="share-btn" data-share="linkedin">${_t('share.linkedin')}</button>
    <button class="share-btn" data-share="copy">${_t('share.copy')}</button>
  </div>`;
}

function _warningBox(warnings, danger) {
  if (!warnings || !warnings.length) return '';
  const cls = danger ? 'warning-box warning-box--danger' : 'warning-box';
  return `<div class="${cls}">
    <strong>\u26a0 ${_t('detail.warnings')}</strong>
    ${warnings.map(w => `<p>${w}</p>`).join('')}
  </div>`;
}

/* ========== SETUP ========== */
function _setupTooltip() {
  const tip = document.createElement('div');
  tip.className = 'tooltip';
  document.body.appendChild(tip);

  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tooltip]');
    if (!el) { tip.style.display = 'none'; return; }
    tip.textContent = el.getAttribute('data-tooltip');
    tip.style.display = 'block';
    const r = el.getBoundingClientRect();
    tip.style.left = r.left + 'px';
    tip.style.top = (r.bottom + 6) + 'px';
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-tooltip]')) tip.style.display = 'none';
  });
}

function _setupScrollTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.innerHTML = '\u2191';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function _bindShareButtons(container, shareText, shareUrl) {
  if (!container) return;
  const url = shareUrl || window.location.href;
  const text = shareText || document.title;
  container.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.share;
      if (type === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      else if (type === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      else if (type === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      else if (type === 'copy') {
        navigator.clipboard.writeText(url).then(() => {
          btn.textContent = _t('share.copied');
          setTimeout(() => { btn.textContent = _t('share.copy'); }, 2000);
        });
      }
    });
  });
}

function _setupScrollArrows(wrapper, scrollContainer) {
  if (!wrapper || !scrollContainer) return;
  const leftArrow = wrapper.querySelector('.featured-arrow-left');
  const rightArrow = wrapper.querySelector('.featured-arrow-right');
  if (!leftArrow || !rightArrow) return;

  leftArrow.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
  });
  rightArrow.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
  });
}

/* ========== RENDER: INDEX ========== */
function renderIndex() {
  const strategies = Data.getAllStrategies();
  const categories = Data.getCategories();

  /* Hero stats */
  const heroStats = document.getElementById('hero-stats');
  if (heroStats) {
    heroStats.textContent = _t('hero.stats')
      .replace('{count}', strategies.length)
      .replace('{cats}', categories.length);
  }

  /* Wisdom box */
  const wisdomBox = document.getElementById('body-wisdom-box');
  if (wisdomBox) {
    wisdomBox.innerHTML = `<div class="wisdom-box">
      <h2>${_t('wisdom.title')}</h2>
      <p>${_t('wisdom.text')}</p>
    </div>`;
  }

  /* Daily quote */
  const quoteBox = document.getElementById('daily-quote-box');
  if (quoteBox) {
    const thinkers = Data.getThinkers();
    if (thinkers && thinkers.length) {
      const dayIdx = Math.floor(Date.now() / 86400000) % thinkers.length;
      const thinker = thinkers[dayIdx];
      quoteBox.innerHTML = `<div class="daily-quote-box">
        <div class="daily-quote-text">"${thinker.quote}"</div>
        <div class="daily-quote-author">— ${thinker.name} <span class="author-info-trigger" tabindex="0" aria-label="About ${thinker.name}">ℹ️<span class="author-info-balloon"><strong>${thinker.name}</strong> (${thinker.years})<br>${thinker.tradition} · ${thinker.origin}<br><em>${thinker.relevance}</em></span></span></div>
      </div>`;
    }
  }

  /* Wisdom library (nav cards) */
  const libraryCards = document.getElementById('wisdom-library-cards');
  if (libraryCards) {
    libraryCards.innerHTML = [
      { href: 'thinkers.html', icon: '\ud83e\udde0', key: 'nav.thinkers' },
      { href: 'principles.html', icon: '\ud83d\udcdc', key: 'nav.principles' },
      { href: 'risk-calculator.html', icon: '\ud83e\uddee', key: 'nav.risk_calculator' },
      { href: 'compare.html', icon: '\u2696\ufe0f', key: 'nav.compare' },
      { href: 'quiz.html', icon: '\ud83c\udfc6', key: 'nav.quiz' }
    ].map(item => `<a href="${item.href}" class="wisdom-library-card">${item.icon} ${_t(item.key)}</a>`).join('');
  }

  /* Category cards */
  const catCards = document.getElementById('category-cards');
  if (catCards) {
    catCards.innerHTML = categories.map(cat => {
      const count = Data.getStrategiesByCategory(cat.id).length;
      return `<a href="${cat.page}" class="card overview-card" style="border-left-color:${cat.color}">
        <span class="card-icon">${cat.icon}</span>
        <span class="card-title">${_t(cat.name_key)}</span>
        <p class="card-description">${_t(cat.desc_key)}</p>
        <span class="card-count">${count} strategies</span>
        <span class="card-link" style="color:${cat.color}">${_t(cat.link_key)} \u2192</span>
      </a>`;
    }).join('');
  }

  /* Featured strategies */
  const featuredCards = document.getElementById('featured-cards');
  if (featuredCards) {
    const featured = [
      ...Data.getTopByEvidence(3),
      ...Data.getTopByPassive(2)
    ].filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i).slice(0, 6);

    featuredCards.innerHTML = featured.map(s => {
      const catColor = _categoryColor(s.category);
      const tags = (s.tags || []).slice(0, 3).map(t => `<span class="featured-tag">${t}</span>`).join('');
      return `<a href="strategy-detail.html?id=${s.id}" class="card featured-card" style="border-left-color:${catColor}">
        <span class="card-icon">${s.emoji || ''}</span>
        <div>
          <span class="card-title">${_strategyName(s)}</span>
          <div class="featured-tags">${tags}</div>
          <div style="margin-top:0.3rem">${_riskBadge(s.risk_level)} ${_difficultyBadge(s.difficulty)}</div>
        </div>
      </a>`;
    }).join('');

    const wrapper = featuredCards.closest('.featured-scroll-wrapper');
    if (wrapper) _setupScrollArrows(wrapper, featuredCards);
  }

  /* Disclaimer */
  const disclaimerBox = document.getElementById('disclaimer-box');
  if (disclaimerBox) {
    disclaimerBox.innerHTML = `<div class="warning-box">
      <strong>${_t('general.disclaimer')}</strong>
      <p>${_t('general.disclaimer.text')}</p>
    </div>`;
  }

  /* Share */
  _bindShareButtons(document.getElementById('share-bar-home'), 'MoneyClever — Build Wealth. Know the Risks.');
}

/* ========== RENDER: CATEGORY ========== */
function renderCategory(catId) {
  const el = document.getElementById('category-content');
  if (!el) return;
  const cat = Data.getCategory(catId);
  if (!cat) { el.innerHTML = '<p>Category not found.</p>'; return; }

  const strategies = Data.getStrategiesByCategory(catId);

  /* Sort controls */
  let sortBy = 'name';
  let filterRisk = 0;

  function render() {
    let filtered = filterRisk ? strategies.filter(s => s.risk_level === filterRisk) : strategies;

    if (sortBy === 'name') filtered.sort((a, b) => _strategyName(a).localeCompare(_strategyName(b)));
    else if (sortBy === 'risk') filtered.sort((a, b) => a.risk_level - b.risk_level);
    else if (sortBy === 'difficulty') filtered.sort((a, b) => a.difficulty - b.difficulty);
    else if (sortBy === 'evidence') filtered.sort((a, b) => b.evidence_rating - a.evidence_rating);
    else if (sortBy === 'passive') filtered.sort((a, b) => b.passive_potential - a.passive_potential);

    el.innerHTML = `
      ${_backLink()}
      <div class="detail-header">
        <h1>${cat.icon} ${_t(cat.name_key)}</h1>
        <p class="section-subtitle">${_t(cat.desc_key)}</p>
      </div>

      <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem;align-items:center">
        <label style="font-size:0.9rem;font-weight:600">${_t('risk.label')}:</label>
        <select id="cat-filter-risk" style="padding:0.3rem 0.5rem;border:1px solid #e0e0e0;border-radius:4px">
          <option value="0">All</option>
          ${[1,2,3,4,5].map(r => `<option value="${r}" ${filterRisk===r?'selected':''}>${_t('risk.' + r)}</option>`).join('')}
        </select>
        <label style="font-size:0.9rem;font-weight:600;margin-left:1rem">Sort:</label>
        <select id="cat-sort" style="padding:0.3rem 0.5rem;border:1px solid #e0e0e0;border-radius:4px">
          <option value="name" ${sortBy==='name'?'selected':''}>Name</option>
          <option value="risk" ${sortBy==='risk'?'selected':''}>Risk</option>
          <option value="difficulty" ${sortBy==='difficulty'?'selected':''}>Difficulty</option>
          <option value="evidence" ${sortBy==='evidence'?'selected':''}>Evidence</option>
          <option value="passive" ${sortBy==='passive'?'selected':''}>Passive</option>
        </select>
      </div>

      <div class="cards-grid grid-3x2">
        ${filtered.map(s => _strategyCardHtml(s)).join('')}
      </div>
      ${filtered.length === 0 ? `<p style="text-align:center;color:var(--text-gray);margin:2rem 0">${_t('general.no_results')}</p>` : ''}
    `;

    el.querySelector('#cat-filter-risk').addEventListener('change', e => {
      filterRisk = parseInt(e.target.value);
      render();
    });
    el.querySelector('#cat-sort').addEventListener('change', e => {
      sortBy = e.target.value;
      render();
    });
  }
  render();
}

/* ========== RENDER: STRATEGY DETAIL ========== */
function renderStrategyDetail() {
  const el = document.getElementById('strategy-detail-content');
  if (!el) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const strategy = Data.getStrategy(id);
  if (!strategy) { el.innerHTML = `${_backLink()}<p>Strategy not found.</p>`; return; }

  const name = _strategyName(strategy);
  const catColor = _categoryColor(strategy.category);
  const dims = ['income', 'time_freedom', 'scalability', 'stability', 'accessibility'];
  const benefits = strategy.benefits || {};
  const related = Data.getRelatedStrategies(strategy.id);

  el.innerHTML = `
    ${_backLink()}

    <div class="detail-header">
      <h1>${strategy.emoji || ''} ${name}</h1>
      <div class="detail-tags">
        <span class="tag category-tag" style="background:${catColor}">${_t('cat.' + strategy.category.replace(/-/g, '_'))}</span>
        ${strategy.subcategory ? `<span class="tag subcategory-tag">${strategy.subcategory}</span>` : ''}
        ${(strategy.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="quick-stat">
        <div class="quick-stat-label">${_t('risk.label')}</div>
        <div class="quick-stat-value">${_riskBadge(strategy.risk_level)}</div>
      </div>
      <div class="quick-stat">
        <div class="quick-stat-label">${_t('difficulty.label')}</div>
        <div class="quick-stat-value">${_difficultyBadge(strategy.difficulty)}</div>
      </div>
      <div class="quick-stat">
        <div class="quick-stat-label">${_t('capital.label')}</div>
        <div class="quick-stat-value">${strategy.capital_needed ? `$${strategy.capital_needed.minimum_usd.toLocaleString()} - $${strategy.capital_needed.recommended_usd.toLocaleString()}` : '-'}</div>
      </div>
      <div class="quick-stat">
        <div class="quick-stat-label">${_t('time_to_results.label')}</div>
        <div class="quick-stat-value">${_t('time_to_results.' + (strategy.time_to_results || 'months'))}</div>
      </div>
      <div class="quick-stat">
        <div class="quick-stat-label">${_t('hours_per_week.label')}</div>
        <div class="quick-stat-value">${strategy.time_investment ? strategy.time_investment.hours_per_week + 'h' : '-'}</div>
      </div>
      <div class="quick-stat">
        <div class="quick-stat-label">${_t('passive_potential.label')}</div>
        <div class="quick-stat-value">${strategy.passive_potential || 0}/5</div>
      </div>
    </div>

    <!-- Expected Return -->
    ${strategy.expected_return ? `<div class="detail-section">
      <h2>${_t('expected_return.label')}</h2>
      <div class="return-display">${strategy.expected_return.annual_pct}% ${_t('expected_return.annual')} (${_t('timeframe.' + strategy.expected_return.timeframe)})</div>
      <div class="return-disclaimer">${_t('expected_return.disclaimer')}</div>
    </div>` : ''}

    <!-- Warnings -->
    ${_warningBox(strategy.warnings, strategy.risk_level >= 4)}

    <!-- Benefits Chart -->
    <div class="detail-section">
      <h2>${_t('detail.benefits')}</h2>
      <div class="chart-container">
        <canvas id="benefits-radar"></canvas>
      </div>
      ${dims.map(d => _benefitFullBar(d, benefits[d] || 0)).join('')}
    </div>

    <!-- Pros & Cons -->
    <div class="detail-section">
      <div class="pros-cons">
        <div>
          <h2 style="color:var(--mc-safe)">${_t('detail.pros')}</h2>
          <ul class="pros-list">
            ${(strategy.pros || []).map(p => `<li>${p.replace(/_/g, ' ')}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h2 style="color:var(--mc-danger)">${_t('detail.cons')}</h2>
          <ul class="cons-list">
            ${(strategy.cons || []).map(c => `<li>${c.replace(/_/g, ' ')}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <!-- Best For -->
    ${strategy.best_for && strategy.best_for.length ? `<div class="detail-section">
      <h2>${_t('detail.best_for')}</h2>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        ${strategy.best_for.map(b => `<span class="tag">${_t('bestfor.' + b) !== 'bestfor.' + b ? _t('bestfor.' + b) : b.replace(/_/g, ' ')}</span>`).join('')}
      </div>
    </div>` : ''}

    <!-- Prerequisites -->
    ${strategy.prerequisites && strategy.prerequisites.length ? `<div class="detail-section">
      <h2>${_t('detail.prerequisites')}</h2>
      <ul class="prereq-list">
        ${strategy.prerequisites.map(p => `<li>${_t('prereq.' + p) !== 'prereq.' + p ? _t('prereq.' + p) : p.replace(/_/g, ' ')}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Evidence -->
    <div class="detail-section">
      <h2>${_t('evidence.label')}</h2>
      <div>${_evidenceBadge(strategy.evidence_rating)}</div>
    </div>

    <!-- Key Resources -->
    ${strategy.key_resources && strategy.key_resources.length ? `<div class="detail-section">
      <h2>${_t('detail.key_resources')}</h2>
      <ul class="resource-list">
        ${strategy.key_resources.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Fun Facts -->
    ${strategy.fun_facts && strategy.fun_facts.length ? `<div class="detail-section">
      <h2>${_t('detail.fun_facts')}</h2>
      ${strategy.fun_facts.map(f => `<div class="fun-fact">${f}</div>`).join('')}
    </div>` : ''}

    <!-- Related -->
    ${related.length ? `<div class="detail-section">
      <h2>${_t('detail.related')}</h2>
      <div class="related-grid">
        ${related.map(r => `<a href="strategy-detail.html?id=${r.id}" class="related-chip">${r.emoji || ''} ${_strategyName(r)}</a>`).join('')}
      </div>
    </div>` : ''}

    ${_shareBarHtml('share-bar-detail')}
  `;

  /* Radar chart */
  const ctx = document.getElementById('benefits-radar');
  if (ctx && typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: dims.map(d => _t('benefit.' + d)),
        datasets: [{
          label: name,
          data: dims.map(d => benefits[d] || 0),
          borderColor: '#00695C',
          backgroundColor: 'rgba(0,105,92,0.15)',
          borderWidth: 2,
          pointBackgroundColor: '#00695C'
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 5,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  _bindShareButtons(document.getElementById('share-bar-detail'), `${name} — MoneyClever`);
}

/* ========== RENDER: COMPARE ========== */
function renderCompare() {
  const el = document.getElementById('compare-content');
  if (!el) return;

  const allStrategies = Data.getAllStrategies();
  const sortedStrategies = [...allStrategies].sort((a, b) => _strategyName(a).localeCompare(_strategyName(b)));

  const optionsHtml = sortedStrategies.map(s =>
    `<option value="${s.id}">${s.emoji || ''} ${_strategyName(s)}</option>`
  ).join('');

  el.innerHTML = `
    ${_backLink()}
    <h1>${_t('compare.title')}</h1>
    <p class="section-subtitle">${_t('compare.subtitle')}</p>

    <div class="compare-controls">
      <div class="compare-selector">
        <label>${_t('compare.select_hint')} 1</label>
        <select id="compare-s1"><option value="">-- Select --</option>${optionsHtml}</select>
      </div>
      <div class="compare-selector">
        <label>${_t('compare.select_hint')} 2</label>
        <select id="compare-s2"><option value="">-- Select --</option>${optionsHtml}</select>
      </div>
      <div class="compare-selector">
        <label>${_t('compare.select_hint')} 3 (optional)</label>
        <select id="compare-s3"><option value="">-- Select --</option>${optionsHtml}</select>
      </div>
    </div>

    <button class="btn btn-primary" id="compare-btn">${_t('compare.run')}</button>

    <div id="compare-results" style="display:none">
      <div class="compare-chart-container">
        <canvas id="compare-radar"></canvas>
      </div>
      <div id="compare-bars" class="compare-bars"></div>
      <div id="compare-summary" class="compare-summary"></div>
    </div>
  `;

  /* Pre-fill from URL */
  const params = new URLSearchParams(window.location.search);
  if (params.get('a')) document.getElementById('compare-s1').value = params.get('a');
  if (params.get('b')) document.getElementById('compare-s2').value = params.get('b');
  if (params.get('c')) document.getElementById('compare-s3').value = params.get('c');

  document.getElementById('compare-btn').addEventListener('click', _runComparison);

  if (params.get('a') && params.get('b')) _runComparison();
}

let _compareChart = null;
function _runComparison() {
  const ids = ['compare-s1', 'compare-s2', 'compare-s3']
    .map(id => document.getElementById(id).value)
    .filter(Boolean);

  if (ids.length < 2) {
    alert(_t('compare.no_selection'));
    return;
  }

  const strategies = ids.map(id => Data.getStrategy(id)).filter(Boolean);
  const resultsEl = document.getElementById('compare-results');
  resultsEl.style.display = 'block';

  const chartColors = ['#00695C', '#D32F2F', '#1565C0'];
  const dims = ['income', 'time_freedom', 'scalability', 'stability', 'accessibility'];

  /* Radar chart */
  const ctx = document.getElementById('compare-radar');
  if (_compareChart) _compareChart.destroy();

  if (ctx && typeof Chart !== 'undefined') {
    _compareChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: dims.map(d => _t('benefit.' + d)),
        datasets: strategies.map((s, i) => ({
          label: _strategyName(s),
          data: dims.map(d => (s.benefits || {})[d] || 0),
          borderColor: chartColors[i],
          backgroundColor: chartColors[i] + '22',
          borderWidth: 2,
          pointBackgroundColor: chartColors[i]
        }))
      },
      options: {
        responsive: true,
        scales: { r: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  /* Comparison bars */
  const metrics = [
    { key: 'risk_level', label: _t('risk.label'), max: 5, get: s => s.risk_level },
    { key: 'difficulty', label: _t('difficulty.label'), max: 5, get: s => s.difficulty },
    { key: 'passive_potential', label: _t('passive_potential.label'), max: 5, get: s => s.passive_potential },
    { key: 'evidence_rating', label: _t('evidence.label'), max: 5, get: s => s.evidence_rating }
  ];

  const barsEl = document.getElementById('compare-bars');
  barsEl.innerHTML = metrics.map(m => `
    <div class="compare-bar-group">
      <h3>${m.label}</h3>
      ${strategies.map((s, i) => {
        const val = m.get(s) || 0;
        const pct = (val / m.max) * 100;
        return `<div class="compare-bar-row">
          <span class="compare-bar-label">${_strategyName(s)}</span>
          <div class="compare-bar-track">
            <div class="compare-bar-fill" style="width:${pct}%;background:${chartColors[i]}"></div>
          </div>
          <span class="compare-bar-value">${val}/${m.max}</span>
        </div>`;
      }).join('')}
    </div>
  `).join('');

  /* Summary */
  const summaryEl = document.getElementById('compare-summary');
  const scores = strategies.map(s => ({
    name: _strategyName(s),
    score: Data.getOverallBenefitScore(s),
    risk: s.risk_level
  }));
  scores.sort((a, b) => b.score - a.score);

  summaryEl.innerHTML = `
    <h3>${_t('compare.summary')}</h3>
    ${scores.map((s, i) => `<p>${i + 1}. <strong>${s.name}</strong> — Overall: ${s.score}%, Risk: ${_t('risk.' + s.risk)}</p>`).join('')}
  `;
}

/* ========== RENDER: QUIZ ========== */
function renderQuiz() {
  const el = document.getElementById('quiz-content');
  if (!el) return;

  let state = 'start';
  let difficulty = 'easy';
  let questions = [];
  let currentQ = 0;
  let score = 0;

  function render() {
    if (state === 'start') renderStart();
    else if (state === 'play') renderQuestion();
    else if (state === 'results') renderResults();
  }

  function renderStart() {
    el.innerHTML = `
      ${_backLink()}
      <div class="quiz-start">
        <h1>${_t('quiz.title')}</h1>
        <p class="section-subtitle">${_t('quiz.subtitle')}</p>
        <div class="quiz-difficulty">
          <button class="quiz-diff-btn ${difficulty==='easy'?'selected':''}" data-diff="easy">
            <span class="quiz-diff-emoji">\ud83d\udfe2</span>${_t('quiz.easy')}
          </button>
          <button class="quiz-diff-btn ${difficulty==='medium'?'selected':''}" data-diff="medium">
            <span class="quiz-diff-emoji">\ud83d\udfe1</span>${_t('quiz.medium')}
          </button>
          <button class="quiz-diff-btn ${difficulty==='hard'?'selected':''}" data-diff="hard">
            <span class="quiz-diff-emoji">\ud83d\udd34</span>${_t('quiz.hard')}
          </button>
        </div>
        <button class="btn btn-primary" id="quiz-start-btn">${_t('quiz.start')}</button>
      </div>
    `;

    el.querySelectorAll('.quiz-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        difficulty = btn.dataset.diff;
        el.querySelectorAll('.quiz-diff-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    el.querySelector('#quiz-start-btn').addEventListener('click', () => {
      questions = _generateQuestions(difficulty, 10);
      currentQ = 0;
      score = 0;
      state = 'play';
      render();
    });
  }

  function renderQuestion() {
    const q = questions[currentQ];
    const pct = ((currentQ) / questions.length) * 100;
    el.innerHTML = `
      ${_backLink()}
      <div class="quiz-progress"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <div class="quiz-score">${_t('quiz.score')}: ${score}/${currentQ} | ${_t('quiz.question')} ${currentQ + 1} ${_t('quiz.of')} ${questions.length}</div>
      <div class="quiz-question">${q.question}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `<button class="quiz-option" data-idx="${i}">${opt}</button>`).join('')}
      </div>
      <div id="quiz-feedback"></div>
    `;

    el.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const correct = idx === q.correctIndex;
        if (correct) score++;

        el.querySelectorAll('.quiz-option').forEach((b, i) => {
          b.classList.add('disabled');
          if (i === q.correctIndex) b.classList.add('correct');
          if (i === idx && !correct) b.classList.add('wrong');
        });

        const feedback = document.getElementById('quiz-feedback');
        feedback.innerHTML = `
          <div class="quiz-explanation">
            <strong>${correct ? _t('quiz.correct') : _t('quiz.wrong')}</strong>
            ${q.explanation ? `<p>${q.explanation}</p>` : ''}
          </div>
          <button class="btn btn-primary quiz-next-btn" id="quiz-next">${currentQ < questions.length - 1 ? _t('quiz.next') : _t('quiz.results')}</button>
        `;

        document.getElementById('quiz-next').addEventListener('click', () => {
          currentQ++;
          if (currentQ >= questions.length) { state = 'results'; }
          render();
        });
      });
    });
  }

  function renderResults() {
    const pct = Math.round((score / questions.length) * 100);
    let emoji = '\ud83c\udf1f';
    if (pct >= 90) emoji = '\ud83c\udfc6';
    else if (pct >= 70) emoji = '\ud83d\udcaa';
    else if (pct >= 50) emoji = '\ud83d\udc4d';
    else emoji = '\ud83d\udcda';

    el.innerHTML = `
      ${_backLink()}
      <div class="quiz-results">
        <div class="quiz-results-emoji">${emoji}</div>
        <div class="quiz-results-score">${pct}%</div>
        <p>${score} / ${questions.length} correct</p>
        <button class="btn btn-primary" id="quiz-retry" style="margin-top:2rem">${_t('quiz.retry')}</button>
      </div>
    `;

    document.getElementById('quiz-retry').addEventListener('click', () => {
      state = 'start';
      render();
    });
  }

  render();
}

function _generateQuestions(difficulty, count) {
  const strategies = Data.getAllStrategies();
  const questions = [];

  function pick(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }

  function randomOptions(correct, pool, n) {
    const others = pool.filter(x => x !== correct).sort(() => Math.random() - 0.5).slice(0, n - 1);
    const all = [correct, ...others].sort(() => Math.random() - 0.5);
    return { options: all, correctIndex: all.indexOf(correct) };
  }

  const cats = Data.getCategories();

  for (let i = 0; i < count * 3; i++) {
    if (questions.length >= count) break;
    const s = strategies[Math.floor(Math.random() * strategies.length)];

    if (difficulty === 'easy') {
      const type = Math.floor(Math.random() * 4);
      if (type === 0) {
        const catName = _t('cat.' + s.category.replace(/-/g, '_'));
        const allCatNames = cats.map(c => _t(c.name_key));
        const { options, correctIndex } = randomOptions(catName, allCatNames, 4);
        questions.push({
          question: `Which category does "${_strategyName(s)}" belong to?`,
          options, correctIndex,
          explanation: `${_strategyName(s)} is a ${catName} strategy.`
        });
      } else if (type === 1) {
        const riskLabel = _t('risk.' + s.risk_level);
        const allRisk = [1,2,3,4,5].map(r => _t('risk.' + r));
        const { options, correctIndex } = randomOptions(riskLabel, allRisk, 4);
        questions.push({
          question: `What is the risk level of "${_strategyName(s)}"?`,
          options, correctIndex,
          explanation: `${_strategyName(s)} has a ${riskLabel} risk level.`
        });
      } else if (type === 2) {
        const lowRisk = strategies.filter(x => x.risk_level <= 2);
        const highRisk = strategies.filter(x => x.risk_level >= 4);
        if (lowRisk.length && highRisk.length) {
          const safe = lowRisk[Math.floor(Math.random() * lowRisk.length)];
          const risky = pick(highRisk, 3);
          const all = [_strategyName(safe), ...risky.map(r => _strategyName(r))].sort(() => Math.random() - 0.5);
          questions.push({
            question: 'Which of these is considered LOW risk?',
            options: all,
            correctIndex: all.indexOf(_strategyName(safe)),
            explanation: `${_strategyName(safe)} has a risk level of ${safe.risk_level}/5.`
          });
        }
      } else {
        const passive = strategies.filter(x => x.passive_potential >= 4);
        const active = strategies.filter(x => x.passive_potential <= 2);
        if (passive.length && active.length) {
          const p = passive[Math.floor(Math.random() * passive.length)];
          const others = pick(active, 3);
          const all = [_strategyName(p), ...others.map(o => _strategyName(o))].sort(() => Math.random() - 0.5);
          questions.push({
            question: 'Which of these has the HIGHEST passive potential?',
            options: all,
            correctIndex: all.indexOf(_strategyName(p)),
            explanation: `${_strategyName(p)} has a passive potential of ${p.passive_potential}/5.`
          });
        }
      }
    } else if (difficulty === 'medium') {
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const diffLabel = _t('difficulty.' + s.difficulty);
        const allDiff = [1,2,3,4,5].map(d => _t('difficulty.' + d));
        const { options, correctIndex } = randomOptions(diffLabel, allDiff, 4);
        questions.push({
          question: `What difficulty level is "${_strategyName(s)}"?`,
          options, correctIndex,
          explanation: `${_strategyName(s)} is rated as ${diffLabel}.`
        });
      } else if (type === 1) {
        const capLabel = s.capital_needed ? `$${s.capital_needed.minimum_usd.toLocaleString()}` : '$0';
        const others = pick(strategies, 4).map(x => x.capital_needed ? `$${x.capital_needed.minimum_usd.toLocaleString()}` : '$0');
        const all = [...new Set([capLabel, ...others])].slice(0, 4).sort(() => Math.random() - 0.5);
        if (all.length >= 2) {
          questions.push({
            question: `What is the minimum capital needed for "${_strategyName(s)}"?`,
            options: all,
            correctIndex: all.indexOf(capLabel),
            explanation: `${_strategyName(s)} requires minimum $${s.capital_needed ? s.capital_needed.minimum_usd.toLocaleString() : '0'}.`
          });
        }
      } else {
        const overall = Data.getOverallBenefitScore(s);
        const bracket = overall >= 70 ? 'High (70%+)' : overall >= 40 ? 'Medium (40-69%)' : 'Low (<40%)';
        const allBrackets = ['High (70%+)', 'Medium (40-69%)', 'Low (<40%)', 'Very Low (<20%)'];
        const { options, correctIndex } = randomOptions(bracket, allBrackets, 4);
        questions.push({
          question: `What is the overall benefit score bracket for "${_strategyName(s)}"?`,
          options, correctIndex,
          explanation: `${_strategyName(s)} has an overall benefit score of ${overall}%.`
        });
      }
    } else {
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const topEvidence = [...strategies].sort((a, b) => b.evidence_rating - a.evidence_rating).slice(0, 1)[0];
        const others = pick(strategies.filter(x => x.evidence_rating < topEvidence.evidence_rating), 3);
        const all = [_strategyName(topEvidence), ...others.map(o => _strategyName(o))].sort(() => Math.random() - 0.5);
        questions.push({
          question: 'Which strategy has the STRONGEST evidence rating?',
          options: all,
          correctIndex: all.indexOf(_strategyName(topEvidence)),
          explanation: `${_strategyName(topEvidence)} has an evidence rating of ${topEvidence.evidence_rating}/5.`
        });
      } else if (type === 1) {
        const thinkers = Data.getThinkers();
        if (thinkers && thinkers.length >= 4) {
          const t = thinkers[Math.floor(Math.random() * thinkers.length)];
          const otherNames = thinkers.filter(x => x.id !== t.id).map(x => x.name);
          const { options, correctIndex } = randomOptions(t.name, [t.name, ...otherNames], 4);
          questions.push({
            question: `Who said: "${t.quote}"?`,
            options, correctIndex,
            explanation: `This is a famous quote by ${t.name}.`
          });
        }
      } else {
        const principles = Data.getPrinciples();
        if (principles && principles.length >= 4) {
          const p = principles[Math.floor(Math.random() * principles.length)];
          const allTitles = principles.map(x => _t(x.title_key));
          const correct = _t(p.title_key);
          const { options, correctIndex } = randomOptions(correct, allTitles, 4);
          const desc = _t(p.desc_key);
          questions.push({
            question: `Which money principle is described by: "${desc}"?`,
            options, correctIndex,
            explanation: `This describes the principle of "${correct}".`
          });
        }
      }
    }
  }

  return questions.slice(0, count);
}

/* ========== RENDER: RISK CALCULATOR ========== */
function renderRiskCalculator() {
  const el = document.getElementById('risk-calculator-content');
  if (!el) return;

  const steps = [
    {
      title: _t('calc.age'),
      options: [
        { label: _t('calc.age.18_25'), value: 1 },
        { label: _t('calc.age.26_35'), value: 2 },
        { label: _t('calc.age.36_45'), value: 3 },
        { label: _t('calc.age.46_55'), value: 4 },
        { label: _t('calc.age.55_plus'), value: 5 }
      ]
    },
    {
      title: _t('calc.income'),
      options: [
        { label: _t('calc.income.very_low'), value: 1 },
        { label: _t('calc.income.low'), value: 2 },
        { label: _t('calc.income.medium'), value: 3 },
        { label: _t('calc.income.high'), value: 4 },
        { label: _t('calc.income.very_high'), value: 5 }
      ]
    },
    {
      title: _t('calc.savings'),
      options: [
        { label: _t('calc.savings.none'), value: 1 },
        { label: _t('calc.savings.minimal'), value: 2 },
        { label: _t('calc.savings.basic'), value: 3 },
        { label: _t('calc.savings.solid'), value: 4 },
        { label: _t('calc.savings.strong'), value: 5 }
      ]
    },
    {
      title: _t('calc.risk_tolerance'),
      options: [
        { label: _t('calc.risk.very_conservative'), value: 1 },
        { label: _t('calc.risk.conservative'), value: 2 },
        { label: _t('calc.risk.moderate'), value: 3 },
        { label: _t('calc.risk.aggressive'), value: 4 },
        { label: _t('calc.risk.very_aggressive'), value: 5 }
      ]
    },
    {
      title: _t('calc.time_horizon'),
      options: [
        { label: _t('calc.horizon.under_1'), value: 1 },
        { label: _t('calc.horizon.1_3'), value: 2 },
        { label: _t('calc.horizon.3_5'), value: 3 },
        { label: _t('calc.horizon.5_10'), value: 4 },
        { label: _t('calc.horizon.10_plus'), value: 5 }
      ]
    },
    {
      title: _t('calc.goals'),
      options: [
        { label: _t('calc.goals.preserve'), value: 1 },
        { label: _t('calc.goals.side_income'), value: 2 },
        { label: _t('calc.goals.long_term'), value: 3 },
        { label: _t('calc.goals.independence'), value: 4 },
        { label: _t('calc.goals.max_growth'), value: 5 }
      ]
    }
  ];

  let currentStep = 0;
  let answers = [];

  function render() {
    if (currentStep >= steps.length) {
      renderCalcResults();
      return;
    }

    const step = steps[currentStep];
    el.innerHTML = `
      ${_backLink()}
      <h1>${_t('calc.title')}</h1>
      <p class="section-subtitle">${_t('calc.subtitle')}</p>

      <div class="calc-progress">
        ${steps.map((_, i) => `<div class="calc-dot ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}"></div>`).join('')}
      </div>

      <div class="calc-wizard">
        <div class="calc-step">
          <div class="calc-step-title">${_t('calc.step')} ${currentStep + 1}/${steps.length}: ${step.title}</div>
          <div class="calc-options">
            ${step.options.map((opt, i) => `<div class="calc-option ${answers[currentStep] === opt.value ? 'selected' : ''}" data-val="${opt.value}">${opt.label}</div>`).join('')}
          </div>
        </div>

        <div class="calc-nav">
          ${currentStep > 0 ? `<button class="btn" id="calc-back">${_t('calc.back')}</button>` : '<span></span>'}
          <button class="btn btn-primary" id="calc-next" ${answers[currentStep] === undefined ? 'disabled' : ''}>${currentStep === steps.length - 1 ? _t('calc.finish') : _t('calc.next')}</button>
        </div>
      </div>
    `;

    el.querySelectorAll('.calc-option').forEach(opt => {
      opt.addEventListener('click', () => {
        answers[currentStep] = parseInt(opt.dataset.val);
        el.querySelectorAll('.calc-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        document.getElementById('calc-next').disabled = false;
      });
    });

    const nextBtn = document.getElementById('calc-next');
    nextBtn.addEventListener('click', () => {
      if (answers[currentStep] !== undefined) {
        currentStep++;
        render();
      }
    });

    const backBtn = document.getElementById('calc-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        currentStep--;
        render();
      });
    }
  }

  function renderCalcResults() {
    const totalScore = answers.reduce((sum, v) => sum + v, 0);
    const maxScore = steps.length * 5;
    const normalized = totalScore / maxScore;

    let profile, profileColor;
    if (normalized <= 0.3) { profile = 'conservative'; profileColor = '#2E7D32'; }
    else if (normalized <= 0.45) { profile = 'moderate'; profileColor = '#66BB6A'; }
    else if (normalized <= 0.6) { profile = 'balanced'; profileColor = '#FFA726'; }
    else if (normalized <= 0.75) { profile = 'growth'; profileColor = '#E53935'; }
    else { profile = 'aggressive'; profileColor = '#B71C1C'; }

    /* Category allocation */
    const alloc = {
      conservative: { 'financial-literacy': 30, 'investment-fundamentals': 30, 'productivity-time': 20, 'passive-income': 15, 'business-entrepreneurship': 5, 'trading-markets': 0 },
      moderate: { 'financial-literacy': 20, 'investment-fundamentals': 30, 'productivity-time': 15, 'passive-income': 20, 'business-entrepreneurship': 10, 'trading-markets': 5 },
      balanced: { 'financial-literacy': 15, 'investment-fundamentals': 25, 'productivity-time': 15, 'passive-income': 20, 'business-entrepreneurship': 15, 'trading-markets': 10 },
      growth: { 'financial-literacy': 10, 'investment-fundamentals': 20, 'productivity-time': 10, 'passive-income': 20, 'business-entrepreneurship': 20, 'trading-markets': 20 },
      aggressive: { 'financial-literacy': 5, 'investment-fundamentals': 15, 'productivity-time': 10, 'passive-income': 15, 'business-entrepreneurship': 25, 'trading-markets': 30 }
    };

    const myAlloc = alloc[profile];
    const cats = Data.getCategories();

    /* Recommended strategies */
    const maxRisk = profile === 'conservative' ? 2 : profile === 'moderate' ? 3 : profile === 'balanced' ? 3 : profile === 'growth' ? 4 : 5;
    const recommended = Data.getAllStrategies()
      .filter(s => s.risk_level <= maxRisk)
      .sort((a, b) => b.evidence_rating - a.evidence_rating)
      .slice(0, 6);

    el.innerHTML = `
      ${_backLink()}
      <h1>${_t('calc.title')}</h1>

      <div class="calc-results">
        <div class="calc-profile">
          <div>${_t('calc.your_profile')}</div>
          <div class="calc-profile-label" style="color:${profileColor}">${_t('calc.profile.' + profile)}</div>
        </div>

        <h2>${_t('calc.allocation')}</h2>
        <div class="calc-chart-container">
          <canvas id="calc-pie"></canvas>
        </div>

        <div style="margin-top:1rem">
          ${cats.map(cat => {
            const pct = myAlloc[cat.id] || 0;
            return pct > 0 ? `<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem">
              <div style="width:16px;height:16px;border-radius:50%;background:${cat.color};flex-shrink:0"></div>
              <span style="flex:1">${_t(cat.name_key)}</span>
              <strong>${pct}%</strong>
            </div>` : '';
          }).join('')}
        </div>

        <h2 style="margin-top:2rem">${_t('calc.recommended')}</h2>
        <div class="cards-grid grid-3x2">
          ${recommended.map(s => _strategyCardHtml(s)).join('')}
        </div>

        ${_warningBox([_t('expected_return.disclaimer')])}

        <button class="btn btn-primary" id="calc-restart" style="margin-top:2rem">${_t('calc.restart')}</button>
      </div>
    `;

    /* Pie chart */
    const pieCtx = document.getElementById('calc-pie');
    if (pieCtx && typeof Chart !== 'undefined') {
      new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: cats.filter(c => myAlloc[c.id] > 0).map(c => _t(c.name_key)),
          datasets: [{
            data: cats.filter(c => myAlloc[c.id] > 0).map(c => myAlloc[c.id]),
            backgroundColor: cats.filter(c => myAlloc[c.id] > 0).map(c => c.color),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } }
        }
      });
    }

    document.getElementById('calc-restart').addEventListener('click', () => {
      currentStep = 0;
      answers = [];
      render();
    });
  }

  render();
}

/* ========== RENDER: THINKERS ========== */
function renderThinkers() {
  const el = document.getElementById('thinkers-content');
  if (!el) return;

  const thinkers = Data.getThinkers();
  const categories = [...new Set(thinkers.map(t => t.category))];
  let activeFilter = 'all';

  function render() {
    const filtered = activeFilter === 'all' ? thinkers : thinkers.filter(t => t.category === activeFilter);

    el.innerHTML = `
      ${_backLink()}
      <h1>${_t('thinkers.title')}</h1>
      <p class="section-subtitle">${_t('thinkers.subtitle')}</p>

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:2rem">
        <button class="btn ${activeFilter === 'all' ? 'btn-primary' : ''}" data-filter="all">${_t('thinkers.filter_all')}</button>
        ${categories.map(c => `<button class="btn ${activeFilter === c ? 'btn-primary' : ''}" data-filter="${c}">${c}</button>`).join('')}
      </div>

      <div class="thinker-grid">
        ${filtered.map(t => `
          <div class="thinker-card">
            <div class="thinker-header">
              <span class="thinker-emoji">${t.emoji}</span>
              <div>
                <div class="thinker-name">${t.name}</div>
                <div class="thinker-years">${t.years} | ${t.origin}</div>
                <div class="thinker-tradition">${t.tradition}</div>
              </div>
            </div>
            <div class="thinker-quote">"${t.quote}"</div>
            <h4>${_t('thinkers.ideas')}</h4>
            <ul class="thinker-ideas">
              ${t.main_ideas.map(idea => `<li>${idea}</li>`).join('')}
            </ul>
            <div class="thinker-works"><strong>${_t('thinkers.works')}:</strong> ${t.key_works.join(', ')}</div>
          </div>
        `).join('')}
      </div>
    `;

    el.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        render();
      });
    });
  }

  render();
}

/* ========== RENDER: PRINCIPLES ========== */
function renderPrinciples() {
  const el = document.getElementById('principles-content');
  if (!el) return;

  const principles = Data.getPrinciples();

  el.innerHTML = `
    ${_backLink()}
    <h1>${_t('principles.title')}</h1>
    <p class="section-subtitle">${_t('principles.subtitle')}</p>

    <div class="principle-grid">
      ${(principles || []).map(p => `
        <div class="principle-card" style="border-left:4px solid ${p.color}">
          <div class="principle-emoji">${p.emoji}</div>
          <div class="principle-title">${_t(p.title_key)}</div>
          <div class="principle-desc">${_t(p.desc_key)}</div>
          <div class="principle-quote">${_t(p.quote_key)}</div>
          ${p.related_strategies && p.related_strategies.length ? `<div class="principle-related">
            ${p.related_strategies.map(sid => {
              const s = Data.getStrategy(sid);
              return s ? `<a href="strategy-detail.html?id=${sid}" class="related-chip">${s.emoji || ''} ${_strategyName(s)}</a>` : '';
            }).join('')}
          </div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}
