(() => {
  const API_BASE = 'https://api.themoviedb.org/3';
  const IMG_BASE = 'https://image.tmdb.org/t/p';
  const KEY_STORAGE = 'cineverse_tmdb_key';
  const LIST_STORAGE = 'cineverse_watchlist';

  const state = {
    tab: 'trending',
    page: 1,
    query: '',
    items: [],
    loading: false,
  };

  const el = (id) => document.getElementById(id);
  const grid = el('grid');
  const gridStatus = el('grid-status');
  const loadMoreBtn = el('load-more');
  const sectionTitle = el('section-title');
  const hero = el('hero');

  const TAB_LABELS = {
    trending: 'Trending Now',
    hollywood: 'Hollywood Movies',
    nollywood: 'Nollywood Films',
    kdrama: 'Korean Dramas',
    watchlist: 'My List',
    search: 'Search Results',
  };

  function getKey() {
    return localStorage.getItem(KEY_STORAGE) || '';
  }

  function isBearerToken(key) {
    return key.startsWith('eyJ');
  }

  async function tmdbFetch(path, params = {}) {
    const key = getKey();
    const url = new URL(API_BASE + path);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const headers = {};
    if (isBearerToken(key)) {
      headers['Authorization'] = `Bearer ${key}`;
    } else {
      url.searchParams.set('api_key', key);
    }

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const err = new Error(`TMDB request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  // ---------- Watchlist ----------
  function getWatchlist() {
    try {
      return JSON.parse(localStorage.getItem(LIST_STORAGE) || '[]');
    } catch {
      return [];
    }
  }
  function saveWatchlist(list) {
    localStorage.setItem(LIST_STORAGE, JSON.stringify(list));
  }
  function isInWatchlist(id, mediaType) {
    return getWatchlist().some((i) => i.id === id && i.mediaType === mediaType);
  }
  function toggleWatchlist(item) {
    const list = getWatchlist();
    const idx = list.findIndex((i) => i.id === item.id && i.mediaType === item.mediaType);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(item);
    }
    saveWatchlist(list);
    return idx < 0;
  }

  // ---------- Category queries ----------
  async function fetchForTab(tab, page) {
    switch (tab) {
      case 'trending':
        return tmdbFetch('/trending/all/week', { page });
      case 'hollywood':
        return tmdbFetch('/discover/movie', {
          page,
          with_original_language: 'en',
          region: 'US',
          sort_by: 'popularity.desc',
          include_adult: false,
        });
      case 'nollywood':
        return tmdbFetch('/discover/movie', {
          page,
          with_origin_country: 'NG',
          sort_by: 'popularity.desc',
          include_adult: false,
        });
      case 'kdrama':
        return tmdbFetch('/discover/tv', {
          page,
          with_origin_country: 'KR',
          with_genres: 18,
          sort_by: 'popularity.desc',
          include_adult: false,
        });
      case 'search':
        return tmdbFetch('/search/multi', { page, query: state.query, include_adult: false });
      default:
        return { results: [], total_pages: 1 };
    }
  }

  function normalizeItem(raw, fallbackType) {
    const mediaType = raw.media_type || fallbackType ||
      (raw.first_air_date ? 'tv' : 'movie');
    if (mediaType !== 'movie' && mediaType !== 'tv') return null;
    return {
      id: raw.id,
      mediaType,
      title: raw.title || raw.name || 'Untitled',
      posterPath: raw.poster_path,
      backdropPath: raw.backdrop_path,
      overview: raw.overview || '',
      rating: raw.vote_average ? raw.vote_average.toFixed(1) : null,
      year: (raw.release_date || raw.first_air_date || '').slice(0, 4),
    };
  }

  // ---------- Rendering ----------
  function renderCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    const poster = item.posterPath
      ? `${IMG_BASE}/w342${item.posterPath}`
      : '';
    card.innerHTML = `
      ${poster
        ? `<img loading="lazy" src="${poster}" alt="${escapeHtml(item.title)}">`
        : `<div style="aspect-ratio:2/3;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:0.8em;padding:10px;text-align:center;">${escapeHtml(item.title)}</div>`}
      <div class="card-info">
        <p class="card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</p>
        <div class="card-meta">
          <span>${item.year || ''}</span>
          ${item.rating ? `<span class="rating-badge">★ ${item.rating}</span>` : ''}
        </div>
      </div>
    `;
    card.addEventListener('click', () => openDetail(item));
    return card;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function renderGrid(items, { append = false } = {}) {
    if (!append) grid.innerHTML = '';
    items.forEach((item) => grid.appendChild(renderCard(item)));
  }

  function renderHero(item) {
    if (!item || !item.backdropPath) {
      hero.hidden = true;
      return;
    }
    hero.hidden = false;
    el('hero-backdrop').style.backgroundImage = `url(${IMG_BASE}/w1280${item.backdropPath})`;
    el('hero-title').textContent = item.title;
    el('hero-overview').textContent = item.overview;
    el('hero-info-btn').onclick = () => openDetail(item);
    const listBtn = el('hero-list-btn');
    const syncListBtn = () => {
      listBtn.textContent = isInWatchlist(item.id, item.mediaType) ? '✓ In My List' : '+ My List';
    };
    syncListBtn();
    listBtn.onclick = () => {
      toggleWatchlist({ id: item.id, mediaType: item.mediaType, title: item.title, posterPath: item.posterPath, year: item.year, rating: item.rating });
      syncListBtn();
    };
  }

  // ---------- Detail modal ----------
  async function openDetail(item) {
    const overlay = el('modal-overlay');
    const body = el('modal-body');
    overlay.hidden = false;
    body.innerHTML = `<p style="padding:40px;text-align:center;color:var(--text-dim);">Loading…</p>`;

    try {
      const [details, videos, providers] = await Promise.all([
        tmdbFetch(`/${item.mediaType}/${item.id}`, {}),
        tmdbFetch(`/${item.mediaType}/${item.id}/videos`, {}),
        tmdbFetch(`/${item.mediaType}/${item.id}/watch/providers`, {}),
      ]);

      const trailer = (videos.results || []).find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer'
      ) || (videos.results || []).find((v) => v.site === 'YouTube');

      const region = (providers.results && (providers.results.US || providers.results.NG || Object.values(providers.results)[0])) || null;
      const flatrate = region?.flatrate || [];
      const rentBuy = [...(region?.rent || []), ...(region?.buy || [])];

      const genres = (details.genres || []).map((g) => g.name);
      const runtime = details.runtime || details.episode_run_time?.[0];
      const title = details.title || details.name;

      body.innerHTML = `
        ${details.backdrop_path ? `<img class="detail-backdrop" src="${IMG_BASE}/w1280${details.backdrop_path}" alt="">` : ''}
        <div class="detail-body">
          <h2>${escapeHtml(title)}</h2>
          <div class="detail-meta">
            <span>${(details.release_date || details.first_air_date || '').slice(0, 4)}</span>
            ${details.vote_average ? `<span class="rating-badge">★ ${details.vote_average.toFixed(1)}</span>` : ''}
            ${runtime ? `<span>${runtime} min</span>` : ''}
            ${details.number_of_seasons ? `<span>${details.number_of_seasons} season${details.number_of_seasons > 1 ? 's' : ''}</span>` : ''}
          </div>
          <div class="detail-genres">
            ${genres.map((g) => `<span class="genre-pill">${escapeHtml(g)}</span>`).join('')}
          </div>
          ${trailer ? `
            <div class="trailer-wrap">
              <iframe src="https://www.youtube.com/embed/${trailer.key}" title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
            </div>` : ''}
          <p class="detail-overview">${escapeHtml(details.overview || 'No synopsis available.')}</p>
          <div class="watch-section">
            <h3>Where to Watch (legally)</h3>
            ${flatrate.length || rentBuy.length ? `
              <div class="provider-list">
                ${[...flatrate, ...rentBuy].slice(0, 8).map((p) => `
                  <a class="provider-link" href="${region.link}" target="_blank" rel="noopener">
                    <img class="provider-logo" src="${IMG_BASE}/w92${p.logo_path}" alt="${escapeHtml(p.provider_name)}">
                    <span>${escapeHtml(p.provider_name)}</span>
                  </a>
                `).join('')}
              </div>
              <p class="no-providers">Availability data via TMDB/JustWatch, may vary by region.</p>
            ` : `<p class="no-providers">No legal streaming/rental info found for this title yet.</p>`}
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary" id="detail-list-btn">+ My List</button>
          </div>
        </div>
      `;

      const listBtn = el('detail-list-btn');
      const normalized = { id: item.id, mediaType: item.mediaType, title, posterPath: details.poster_path, year: (details.release_date || details.first_air_date || '').slice(0, 4), rating: details.vote_average?.toFixed(1) };
      const syncBtn = () => {
        listBtn.textContent = isInWatchlist(item.id, item.mediaType) ? '✓ In My List' : '+ My List';
      };
      syncBtn();
      listBtn.onclick = () => {
        toggleWatchlist(normalized);
        syncBtn();
      };
    } catch (e) {
      body.innerHTML = `<p style="padding:40px;text-align:center;color:var(--text-dim);">Couldn't load details. ${e.status === 401 ? 'Check your API key.' : 'Please try again.'}</p>`;
    }
  }

  el('modal-close').addEventListener('click', () => (el('modal-overlay').hidden = true));
  el('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') el('modal-overlay').hidden = true;
  });

  // ---------- Tab / load logic ----------
  async function loadTab(tab, { reset = true } = {}) {
    if (state.loading) return;
    state.loading = true;
    if (reset) {
      state.page = 1;
      grid.innerHTML = '';
      gridStatus.textContent = 'Loading…';
      loadMoreBtn.hidden = true;
    }
    sectionTitle.textContent = TAB_LABELS[tab] || '';

    if (tab === 'watchlist') {
      hero.hidden = true;
      const list = getWatchlist();
      grid.innerHTML = '';
      if (!list.length) {
        gridStatus.textContent = 'Your list is empty. Add titles from any category.';
      } else {
        gridStatus.textContent = '';
        renderGrid(list.map((i) => ({ ...i, backdropPath: null, overview: '' })));
      }
      loadMoreBtn.hidden = true;
      state.loading = false;
      return;
    }

    try {
      const fallbackType = tab === 'kdrama' ? 'tv' : tab === 'hollywood' || tab === 'nollywood' ? 'movie' : undefined;
      const data = await fetchForTab(tab, state.page);
      const items = (data.results || [])
        .map((r) => normalizeItem(r, fallbackType))
        .filter(Boolean)
        .filter((i) => i.posterPath);

      gridStatus.textContent = items.length ? '' : 'No titles found.';
      renderGrid(items, { append: !reset });

      if (reset && tab !== 'search') {
        const withBackdrop = items.find((i) => i.backdropPath);
        renderHero(withBackdrop);
      } else if (tab === 'search') {
        hero.hidden = true;
      }

      loadMoreBtn.hidden = !(data.page < (data.total_pages || 1));
    } catch (e) {
      if (e.status === 401) {
        showKeyModal('Your saved API key was rejected. Please re-enter it.');
      } else {
        gridStatus.textContent = 'Something went wrong loading titles. Please try again.';
      }
    } finally {
      state.loading = false;
    }
  }

  el('load-more').addEventListener('click', () => {
    state.page += 1;
    loadTab(state.tab, { reset: false });
  });

  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.tab = btn.dataset.tab;
      state.query = '';
      el('search-input').value = '';
      loadTab(state.tab);
    });
  });

  el('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = el('search-input').value.trim();
    if (!q) return;
    state.query = q;
    state.tab = 'search';
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    loadTab('search');
  });

  // ---------- API key modal ----------
  function showKeyModal(message) {
    el('key-modal-overlay').hidden = false;
    const errEl = el('key-error');
    if (message) {
      errEl.hidden = false;
      errEl.textContent = message;
    } else {
      errEl.hidden = true;
    }
  }
  function hideKeyModal() {
    el('key-modal-overlay').hidden = true;
  }

  el('key-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = el('key-input').value.trim();
    if (!val) return;
    localStorage.setItem(KEY_STORAGE, val);
    try {
      await tmdbFetch('/configuration', {});
      hideKeyModal();
      loadTab(state.tab);
    } catch (err) {
      localStorage.removeItem(KEY_STORAGE);
      showKeyModal('That key was rejected by TMDB. Double check it and try again.');
    }
  });

  el('settings-btn').addEventListener('click', () => showKeyModal());

  // ---------- Init ----------
  (function init() {
    if (!getKey()) {
      showKeyModal();
    } else {
      loadTab(state.tab);
    }
  })();
})();
