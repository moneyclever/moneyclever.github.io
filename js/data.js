/**
 * data.js - Data loader and cache for MoneyClever
 * Fetches and caches all strategy data JSON files
 */
const Data = (() => {
  let _strategies = null;
  let _categories = null;
  let _benefits = null;
  let _thinkers = null;
  let _principles = null;

  async function _load(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    return resp.json();
  }

  async function _loadSafe(url) {
    try { return await _load(url); } catch(e) { console.warn('Optional data not loaded:', url); return null; }
  }

  async function init() {
    if (!_strategies || !_categories) {
      const [strategies, categories, benefits, thinkers, principles] = await Promise.all([
        _load('data/strategies.json'),
        _load('data/categories.json'),
        _loadSafe('data/benefits.json'),
        _loadSafe('data/thinkers.json'),
        _loadSafe('data/principles.json')
      ]);
      _strategies = strategies;
      _categories = categories;
      _benefits = benefits;
      _thinkers = thinkers;
      _principles = principles;
    }
  }

  // Strategies
  function getAllStrategies() { return _strategies || []; }
  function getStrategy(id) { return (_strategies || []).find(s => s.id === id) || null; }
  function getStrategiesByCategory(cat) { return (_strategies || []).filter(s => s.category === cat); }
  function getStrategiesByTag(tag) { return (_strategies || []).filter(s => s.tags && s.tags.includes(tag)); }
  function getStrategiesByRisk(level) { return (_strategies || []).filter(s => s.risk_level === level); }
  function getStrategiesByDifficulty(level) { return (_strategies || []).filter(s => s.difficulty === level); }
  function getStrategiesByCapitalTier(tier) { return (_strategies || []).filter(s => s.capital_needed && s.capital_needed.tier === tier); }
  function getStrategiesByBestFor(need) { return (_strategies || []).filter(s => s.best_for && s.best_for.includes(need)); }
  function getRelatedStrategies(id) {
    const s = getStrategy(id);
    if (!s || !s.related_strategies) return [];
    return s.related_strategies.map(rid => getStrategy(rid)).filter(Boolean);
  }

  // Categories
  function getCategories() { return _categories || []; }
  function getCategory(id) { return (_categories || []).find(c => c.id === id) || null; }

  // Benefits
  function getBenefits() { return _benefits || {}; }
  function getBenefitScore(strategy, dimension) {
    if (!strategy || !strategy.benefits) return 0;
    return strategy.benefits[dimension] || 0;
  }
  function getOverallBenefitScore(strategy) {
    if (!strategy || !strategy.benefits) return 0;
    const dims = ['income', 'time_freedom', 'scalability', 'stability', 'accessibility'];
    let total = 0;
    dims.forEach(d => { total += strategy.benefits[d] || 0; });
    return Math.round((total / (dims.length * 5)) * 100);
  }

  // Risk
  function getRiskLabel(level) {
    const labels = { 1: 'very_low', 2: 'low', 3: 'moderate', 4: 'high', 5: 'very_high' };
    return labels[level] || 'unknown';
  }
  function getRiskColor(level) {
    const colors = { 1: '#2E7D32', 2: '#66BB6A', 3: '#FFA726', 4: '#E53935', 5: '#B71C1C' };
    return colors[level] || '#999';
  }

  // Difficulty
  function getDifficultyLabel(level) {
    const labels = { 1: 'beginner', 2: 'easy', 3: 'moderate', 4: 'challenging', 5: 'advanced' };
    return labels[level] || 'unknown';
  }
  function getDifficultyColor(level) {
    const colors = { 1: '#4CAF50', 2: '#8BC34A', 3: '#FFC107', 4: '#FF9800', 5: '#F44336' };
    return colors[level] || '#999';
  }

  // Capital tier
  function getCapitalLabel(tier) {
    const labels = { 1: 'low_capital', 2: 'moderate_capital', 3: 'high_capital' };
    return labels[tier] || 'unknown';
  }

  // Evidence
  function getEvidenceLabel(rating) {
    const labels = { 1: 'anecdotal', 2: 'some_data', 3: 'well_documented', 4: 'strong_evidence', 5: 'extensive_proof' };
    return labels[rating] || 'unknown';
  }
  function getEvidenceColor(rating) {
    const colors = { 1: '#E0E0E0', 2: '#80CBC4', 3: '#26A69A', 4: '#00897B', 5: '#004D40' };
    return colors[rating] || '#999';
  }

  // Thinkers
  function getThinkers() { return _thinkers || []; }
  function getThinker(id) { return (_thinkers || []).find(t => t.id === id) || null; }
  function getThinkersByCategory(cat) { return (_thinkers || []).filter(t => t.category === cat); }

  // Principles
  function getPrinciples() { return _principles || []; }
  function getPrinciple(id) { return (_principles || []).find(p => p.id === id) || null; }

  // Top strategies
  function getTopByEvidence(limit) {
    return getAllStrategies().filter(s => s.evidence_rating > 0)
      .sort((a, b) => b.evidence_rating - a.evidence_rating).slice(0, limit || 10);
  }
  function getTopByPassive(limit) {
    return getAllStrategies().filter(s => s.passive_potential > 0)
      .sort((a, b) => b.passive_potential - a.passive_potential).slice(0, limit || 10);
  }
  function getMostAccessible(limit) {
    return getAllStrategies().filter(s => s.difficulty <= 2 && s.capital_needed && s.capital_needed.tier === 1)
      .sort((a, b) => a.risk_level - b.risk_level).slice(0, limit || 10);
  }

  return {
    init,
    getAllStrategies, getStrategy, getStrategiesByCategory, getStrategiesByTag,
    getStrategiesByRisk, getStrategiesByDifficulty, getStrategiesByCapitalTier,
    getStrategiesByBestFor, getRelatedStrategies,
    getCategories, getCategory,
    getBenefits, getBenefitScore, getOverallBenefitScore,
    getRiskLabel, getRiskColor,
    getDifficultyLabel, getDifficultyColor,
    getCapitalLabel, getEvidenceLabel, getEvidenceColor,
    getThinkers, getThinker, getThinkersByCategory,
    getPrinciples, getPrinciple,
    getTopByEvidence, getTopByPassive, getMostAccessible
  };
})();
