/**
 * strategy-selector.js - Searchable strategy dropdown for nav
 */
const StrategySelector = (() => {
  let _panel = null;
  let _btn = null;
  let _searchInput = null;
  let _list = null;

  function init() {
    const container = document.getElementById('strategy-selector');
    if (!container) return;

    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'strategy-selector-wrap';

    _btn = document.createElement('button');
    _btn.className = 'strategy-selector-btn';
    _btn.textContent = I18n.t('nav.strategy_search');
    _btn.type = 'button';

    _panel = document.createElement('div');
    _panel.className = 'strategy-selector-panel';

    _searchInput = document.createElement('input');
    _searchInput.className = 'strategy-selector-search';
    _searchInput.type = 'text';
    _searchInput.setAttribute('data-i18n-placeholder', 'nav.strategy_search');
    _searchInput.placeholder = I18n.t('nav.strategy_search');

    _list = document.createElement('div');
    _list.className = 'strategy-selector-list';

    _panel.appendChild(_searchInput);
    _panel.appendChild(_list);
    wrap.appendChild(_btn);
    wrap.appendChild(_panel);
    container.appendChild(wrap);

    _btn.addEventListener('click', _toggle);
    _searchInput.addEventListener('input', _filter);
    document.addEventListener('click', _outsideClick);
    document.addEventListener('keydown', _onKey);
    document.addEventListener('mc-lang-change', _rebuild);

    _renderList();
  }

  function _toggle(e) {
    e.stopPropagation();
    const isOpen = _panel.classList.contains('open');
    if (isOpen) {
      _close();
    } else {
      if (window.innerWidth <= 768 && _panel.parentElement !== document.body) {
        document.body.appendChild(_panel);
      }
      _panel.classList.add('open');
      _searchInput.value = '';
      _renderList();
      _searchInput.focus();
    }
  }

  function _close() {
    if (!_panel) return;
    _panel.classList.remove('open');
    const wrap = document.querySelector('.strategy-selector-wrap');
    if (wrap && _panel.parentElement === document.body) {
      wrap.appendChild(_panel);
    }
  }

  function _outsideClick(e) {
    if (_panel && !_panel.contains(e.target) && e.target !== _btn) {
      _close();
    }
  }

  function _onKey(e) {
    if (e.key === 'Escape') _close();
  }

  function _filter() {
    const q = _searchInput.value.toLowerCase();
    const items = _list.querySelectorAll('a');
    items.forEach(a => {
      const name = a.getAttribute('data-name').toLowerCase();
      a.style.display = name.includes(q) ? '' : 'none';
    });
  }

  function _renderList() {
    if (!_list) return;
    const strategies = Data.getAllStrategies();
    const lang = I18n.getLang();

    const sorted = strategies.map(s => ({
      id: s.id,
      name: I18n.getStrategyName(s),
      cat: s.category,
      emoji: s.emoji || '',
      risk: s.risk_level
    })).sort((a, b) => a.name.localeCompare(b.name, lang));

    _list.innerHTML = sorted.map(s =>
      `<a href="strategy-detail.html?id=${s.id}" data-name="${s.name}">
        <span>${s.emoji} ${s.name}</span>
        <span class="strategy-cat-badge">${I18n.t('cat.' + s.cat.replace(/-/g, '_'))}</span>
      </a>`
    ).join('');
  }

  function _rebuild() {
    if (_btn) _btn.textContent = I18n.t('nav.strategy_search');
    if (_searchInput) _searchInput.placeholder = I18n.t('nav.strategy_search');
    _renderList();
  }

  return { init };
})();
