import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
import './premium.css';

import coaches from './data/coaches.json';
import schedules from './data/schedules.json';
import news from './data/news.json';
import gyms from './data/gyms.json';
import sponsors from './data/sponsors.json';
import schoolInfo from './data/schoolInfo.json';
import teamsFull from './data/teamsFull.json';
import gallery from './data/gallery.json';
import tournament from './data/tournament.json';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('mainContent')?.focus();
  });
  initRouter();
  initPillars();
  initSchedules();
  initNews();
  initCoaches();
  initTeams();
  initTournament();
  initGallery();
  initGymsMap();
  initSponsors();
  initAdmin();
  initCopyCode();
  initFormsAndModals();
  initMobileNav();
  initStickyHeader();
});

/* ==========================================================================
   1. ROUTER (All 11 Dedicated Pages + Subpages)
   ========================================================================== */
function initRouter() {
  const views = {
    '': 'view-home',
    '#home': 'view-home',
    '#apie-mokykla': 'view-apie-mokykla',
    '#naujienos': 'view-naujienos',
    '#perkuniuku-taure': 'view-perkuniuku-taure',
    '#komandos': 'view-komandos',
    '#treneriai': 'view-treneriai',
    '#priemimas': 'view-priemimas',
    '#sales': 'view-sales',
    '#sporto-sales': 'view-sales',
    '#foto': 'view-foto',
    '#video': 'view-video',
    '#istorija': 'view-istorija',
    '#parama': 'view-parama',
    '#kontaktai': 'view-kontaktai'
  };

  function handleRoute() {
    let hash = window.location.hash;

    // Subpage: Coach detail (#treneris/<id> or #treneriai/<id>)
    if (hash.startsWith('#treneris/') || hash.startsWith('#treneriai/')) {
      const slug = hash.split('/')[1];
      activateView('view-treneris');
      renderCoachSubpage(slug);
      updateNavHighlight('#treneriai');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // Subpage: Team detail (#komanda/<id> or #komandos/<id>)
    if (hash.startsWith('#komanda/') || hash.startsWith('#komandos/')) {
      const slug = hash.split('/')[1];
      activateView('view-komanda');
      renderTeamSubpage(slug);
      updateNavHighlight('#komandos');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // Subpage: Tournament editions (#perkuniuku-taure-2023, 2022, 2020)
    if (hash.startsWith('#perkuniuku-taure-') || hash === '#perkuniuku-taure') {
      activateView('view-perkuniuku-taure');
      const year = hash.includes('2022') ? '2022' : hash.includes('2020') ? '2020' : '2023';
      renderTournamentEdition(year);
      updateNavHighlight('#perkuniuku-taure');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const targetViewId = views[hash] || 'view-home';
    activateView(targetViewId);
    updateNavHighlight(hash === '' ? '#home' : hash);

    // Close any active focus
    if (document.activeElement && document.activeElement.classList.contains('dropdown-item')) {
      document.activeElement.blur();
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    if (hash === '#sales' || hash === '#sporto-sales') {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }

  function activateView(viewId) {
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    }
  }

  function updateNavHighlight(activeHash) {
    document.querySelectorAll('.nav-link, .mobile-nav-link, .dropdown-item').forEach(link => {
      link.classList.remove('active');
    });

    document.querySelectorAll(`a[href="${activeHash}"]`).forEach(link => {
      link.classList.add('active');
      const parentDropdown = link.closest('.has-dropdown');
      if (parentDropdown) {
        parentDropdown.querySelector('.nav-link')?.classList.add('active');
      }
    });
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

/* ==========================================================================
   2. PILLARS (Apie mus)
   ========================================================================== */
function initPillars() {
  const homeGrid = document.getElementById('pillarsGridHome');
  const pageGrid = document.getElementById('pillarsGridPage');

  const content = schoolInfo.pillars.map(p => `
    <div class="clean-card pillar-card">
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
    </div>
  `).join('');

  if (homeGrid) homeGrid.innerHTML = content;
  if (pageGrid) pageGrid.innerHTML = content;
}

/* ==========================================================================
   3. SCHEDULES (Priėmimas / Grupės)
   ========================================================================== */
function initSchedules() {
  const tabsContainer = document.getElementById('yearTabsPage');
  const displayArea = document.getElementById('scheduleDisplayPage');
  if (!tabsContainer || !displayArea) return;

  const years = schedules.map(s => s.year.replace(/\s*m\.\s*$/, ''));

  tabsContainer.innerHTML = years.map((y, idx) => `
    <button class="filter-pill ${idx === 0 ? 'active' : ''}" data-year="${y}">
      ${y} m.
    </button>
  `).join('');

  function renderYear(selectedYear) {
    const data = schedules.find(s => s.year.replace(/\s*m\.\s*$/, '') === selectedYear);
    if (!data) return;

    displayArea.innerHTML = data.groups.map(g => `
      <div class="timetable-card">
        <div class="timetable-header">
          <div>
            <h3>${g.title}</h3>
            <span class="group-level-badge">${data.badge}</span>
          </div>
        </div>
        <div class="timetable-coach-box">
          <div class="coach-meta">
            <span class="coach-label">Treneris</span>
            <span class="coach-name">${g.coach}</span>
          </div>
          <a href="tel:${g.phone.replace(/\s+/g, '')}" class="coach-phone-btn">
            ${g.phone}
          </a>
        </div>
        <div class="timetable-rows">
          ${g.slots.map(s => `
            <div class="timetable-row">
              <span class="day-name">${s.day}</span>
              <span class="time-slot">${s.time}</span>
              <span class="gym-location">${s.gym}</span>
            </div>
          `).join('')}
        </div>
        <div class="timetable-footer">
          <button class="btn btn-primary btn-sm btn-block open-reg-modal" data-year="${selectedYear}">
            Registruotis į šią grupę
          </button>
        </div>
      </div>
    `).join('');

    displayArea.querySelectorAll('.open-reg-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        openRegistrationModal(btn.dataset.year);
      });
    });
  }

  tabsContainer.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderYear(btn.dataset.year);
    });
  });

  renderYear(years[0]);
}

/* ==========================================================================
   4. NEWS (Naujienos)
   ========================================================================== */
function initNews() {
  const homeGrid = document.getElementById('newsGridHome');
  const pageGrid = document.getElementById('newsGridPage');
  const filterGroup = document.getElementById('newsFiltersPage');

  function getNewsHtml(items) {
    return items.map(n => `
      <article class="clean-news-card" data-id="${n.id}">
        <div class="news-img-wrap">
          <img src="${n.image}" alt="${n.title}" class="news-img" loading="lazy">
          <span class="news-badge">${n.category}</span>
        </div>
        <div class="news-body">
          <div class="news-date">${n.date}</div>
          <h3>${n.title}</h3>
          <p>${n.excerpt}</p>
          <div class="news-card-action">
            <button class="read-more-link" aria-label="Skaityti: ${n.title.replace(/"/g, '&quot;')}">Skaityti daugiau</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  if (homeGrid) {
    homeGrid.innerHTML = getNewsHtml(news.slice(0, 3));
    attachNewsModalListeners(homeGrid);
  }

  if (pageGrid) {
    pageGrid.innerHTML = getNewsHtml(news);
    attachNewsModalListeners(pageGrid);

    if (filterGroup) {
      filterGroup.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          filterGroup.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const cat = pill.dataset.cat;
          const filtered = cat === 'all' ? news : news.filter(n => n.category === cat);
          pageGrid.innerHTML = getNewsHtml(filtered);
          attachNewsModalListeners(pageGrid);
        });
      });
    }
  }
}

function attachNewsModalListeners(container) {
  container.querySelectorAll('.clean-news-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const item = news.find(n => n.id === id);
      if (item) openNewsModal(item);
    });
  });
}

let activeNewsTrigger = null;

function closeNewsArticle() {
  const modal = document.getElementById('newsModal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeNewsTrigger?.focus({ preventScroll: true });
}

function openNewsModal(item) {
  const modal = document.getElementById('newsModal');
  const content = document.getElementById('newsModalContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="article-detail">
      <span class="article-cat">${item.category} • ${item.date}</span>
      <h2 id="newsArticleTitle">${item.title}</h2>
      <div class="article-img-wrap">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="article-lead">${item.excerpt}</div>
      <div class="article-content">${item.content}</div>
      <div class="article-footer">
        <button class="btn btn-primary open-reg-modal">Registruotis į treniruotes</button>
      </div>
    </div>
  `;

  activeNewsTrigger = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('closeNewsModal')?.focus();

  content.querySelector('.open-reg-modal')?.addEventListener('click', () => {
    closeNewsArticle();
    openRegistrationModal();
  });
}

/* ==========================================================================
   5. COACHES OVERVIEW & SUBPAGES
   ========================================================================== */
function initCoaches() {
  const grid = document.getElementById('coachesGridPage');
  if (!grid) return;

  grid.innerHTML = coaches.map(c => `
    <div class="clean-coach-card">
      <div class="coach-photo-wrap">
        <img src="${c.photo}" alt="${c.name}" loading="lazy">
      </div>
      <h3>${c.name}</h3>
      <span class="coach-role-text">${c.role}</span>
      <div class="coach-team-tag">${c.teamsSummary || c.teams}</div>
      <p class="coach-bio-text">${c.bio}</p>
      <div class="coach-contact-bar">
        <a href="tel:${c.phone.replace(/\s+/g, '')}" class="coach-contact-link">
          ${c.phone}
        </a>
        <a href="mailto:${c.email}" class="coach-contact-link">
          ${c.email}
        </a>
      </div>
      <a href="#treneris/${c.id}" class="btn btn-outline-dark btn-sm btn-block" style="margin-top: 14px;">
        Peržiūrėti profilį &rarr;
      </a>
    </div>
  `).join('');
}

function renderCoachSubpage(coachId) {
  const coach = coaches.find(c => c.id === coachId) || coaches[0];
  const container = document.getElementById('coachDetailContainer');
  const breadcrumb = document.getElementById('coachBreadcrumbName');
  const bannerName = document.getElementById('coachBannerName');
  const bannerRole = document.getElementById('coachBannerRole');

  if (breadcrumb) breadcrumb.textContent = coach.name;
  if (bannerName) bannerName.textContent = coach.name;
  if (bannerRole) bannerRole.textContent = `${coach.role} • ${coach.teamsSummary || coach.teams}`;

  if (!container) return;

  container.innerHTML = `
    <div class="subpage-split-layout">
      <!-- Profile Sidebar -->
      <aside class="subpage-sidebar">
        <div class="profile-card-sticky">
          <div class="profile-avatar-box">
            <img src="${coach.photo}" alt="${coach.name}" class="profile-avatar-img">
          </div>
          <h3 class="profile-name">${coach.name}</h3>
          <span class="profile-role-badge">${coach.role}</span>

          <div class="profile-info-list">
            <div class="profile-info-item">
              <span class="info-label">Telefonas:</span>
              <a href="tel:${coach.phone.replace(/\s+/g, '')}" class="info-val info-link">${coach.phone}</a>
            </div>
            <div class="profile-info-item">
              <span class="info-label">El. paštas:</span>
              <a href="mailto:${coach.email}" class="info-val info-link">${coach.email}</a>
            </div>
            ${coach.interview?.birthplace ? `
              <div class="profile-info-item">
                <span class="info-label">Gimė / Kilmė:</span>
                <span class="info-val">${coach.interview.birthplace}</span>
              </div>
            ` : ''}
          </div>

          <div class="coached-teams-box">
            <h4 class="box-subtitle">Treniruojamos komandos:</h4>
            <div class="coached-teams-chips">
              ${(coach.coachedTeamsList || []).map(t => `
                <a href="#komanda/${t.slug}" class="team-sublink-chip">${t.name} &rarr;</a>
              `).join('')}
            </div>
          </div>

          <div class="sidebar-action-box">
            <button class="btn btn-primary btn-block open-reg-modal">Registruotis pas trenerį</button>
            <a href="#treneriai" class="btn btn-outline-dark btn-sm btn-block">&larr; Visi treneriai</a>
          </div>
        </div>
      </aside>

      <!-- Main Profile Content -->
      <div class="subpage-main-content">
        <!-- Biography & Philosophy -->
        <div class="content-panel">
          <h2 class="panel-heading">Apie trenerį ir krepšinio filosofiją</h2>
          <p class="panel-bio-lead">${coach.bio}</p>

          ${coach.interview ? `
            <div class="qa-grid">
              ${coach.interview.philosophy ? `
                <div class="qa-card highlight">
                  <div class="qa-q">🏀 Krepšinio filosofija</div>
                  <div class="qa-a">„${coach.interview.philosophy}“</div>
                </div>
              ` : ''}
              ${coach.interview.adviceToPlayers ? `
                <div class="qa-card">
                  <div class="qa-q">⚡ Prieš varžybas auklėtiniams akcentuoju</div>
                  <div class="qa-a">„${coach.interview.adviceToPlayers}“</div>
                </div>
              ` : ''}
              ${coach.interview.startedBasketball ? `
                <div class="qa-card">
                  <div class="qa-q">🎯 Krepšinio pradžia</div>
                  <div class="qa-a">${coach.interview.startedBasketball}</div>
                </div>
              ` : ''}
              ${coach.interview.favoriteMoments ? `
                <div class="qa-card">
                  <div class="qa-q">🏆 Kas labiausiai žavi krepšinyje</div>
                  <div class="qa-a">${coach.interview.favoriteMoments}</div>
                </div>
              ` : ''}
              ${coach.interview.favoriteClub ? `
                <div class="qa-card">
                  <div class="qa-q">⭐ Mėgstamiausios komandos</div>
                  <div class="qa-a">${coach.interview.favoriteClub}</div>
                </div>
              ` : ''}
              ${coach.interview.favoritePlayer ? `
                <div class="qa-card">
                  <div class="qa-q">🌟 Mėgstamiausi krepšininkai</div>
                  <div class="qa-a">${coach.interview.favoritePlayer}</div>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Coach Photo Gallery -->
        ${coach.gallery && coach.gallery.length > 0 ? `
          <div class="content-panel" style="margin-top: 32px;">
            <h3 class="panel-heading">Treniruočių ir stovyklų akimirkos</h3>
            <div class="subpage-gallery-grid">
              ${coach.gallery.map(img => `
                <div class="subpage-photo-card" data-photo="${img.src}" data-title="${coach.name}" data-desc="${img.alt || img.caption || ''}">
                  <img src="${img.src}" alt="${img.alt || coach.name}" loading="lazy">
                  ${img.alt || img.caption ? `<span class="photo-caption-tag">${img.alt || img.caption}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Free Trial CTA -->
        <div class="subpage-cta-strip">
          <div>
            <h4>Nori tobulėti krepšinio aikštelėje?</h4>
            <p>Išbandyk nemokamą pirmąją treniruotę ir prisijunk prie KM „Perkūnas“ šeimos!</p>
          </div>
          <button class="btn btn-primary open-reg-modal">Nemokama registracija &rarr;</button>
        </div>
      </div>
    </div>
  `;

  // Attach gallery modal handlers
  container.querySelectorAll('.subpage-photo-card').forEach(card => {
    card.addEventListener('click', () => {
      openLightbox(card.dataset.photo, card.dataset.title, card.dataset.desc);
    });
  });

  // Attach modal trigger
  container.querySelectorAll('.open-reg-modal').forEach(btn => {
    btn.addEventListener('click', () => openRegistrationModal());
  });
}

/* ==========================================================================
   6. TEAMS OVERVIEW & SUBPAGES
   ========================================================================== */
function initTeams() {
  const grid = document.getElementById('teamsCardsGrid');
  if (!grid) return;

  grid.innerHTML = teamsFull.map(t => `
    <div class="team-profile-card">
      <div class="team-photo-wrap">
        <img src="${t.photo}" alt="${t.name}" class="team-photo" loading="lazy">
      </div>
      <div class="team-profile-body">
        <div class="team-badge-row">
          <span class="team-year-badge">${t.year}</span>
          <span class="team-league-badge">${t.league}</span>
        </div>
        <h3>${t.name}</h3>
        <div class="team-coach-name">Treneris: <strong>${t.coach}</strong></div>
        <p>${t.desc}</p>
        <div class="team-card-actions">
          <a href="#komanda/${t.slug}" class="btn btn-primary btn-sm btn-block">
            Komandos sudėtis ir pasiekimai &rarr;
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function renderTeamSubpage(teamSlug) {
  const team = teamsFull.find(t => t.slug === teamSlug) || teamsFull[0];
  const container = document.getElementById('teamDetailContainer');
  const breadcrumb = document.getElementById('teamBreadcrumbName');
  const bannerName = document.getElementById('teamBannerName');
  const bannerLeague = document.getElementById('teamBannerLeague');

  if (breadcrumb) breadcrumb.textContent = team.name;
  if (bannerName) bannerName.textContent = team.name;
  if (bannerLeague) bannerLeague.textContent = `${team.year} • ${team.league}`;

  if (!container) return;

  container.innerHTML = `
    <div class="subpage-split-layout">
      <!-- Team Sidebar -->
      <aside class="subpage-sidebar">
        <div class="profile-card-sticky">
          <div class="team-badge-row" style="margin-bottom: 12px;">
            <span class="team-year-badge">${team.year}</span>
            <span class="team-league-badge">${team.league}</span>
          </div>

          <h3 class="profile-name">${team.name}</h3>

          <div class="coach-mini-card">
            <span class="info-label">Vyriausiasis treneris:</span>
            <h4>${team.coach}</h4>
            <a href="#treneris/${team.coachSlug}" class="team-coach-link">Trenerio profilis ir filosofija &rarr;</a>
          </div>

          ${team.leagueUrl ? `
            <div class="league-btn-box" style="margin: 16px 0;">
              <a href="${team.leagueUrl}" target="_blank" rel="noopener" class="btn btn-outline-dark btn-sm btn-block">
                <span>MKL / KKML rungtynės ir lentelė</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>
            </div>
          ` : ''}

          <!-- Achievements Box -->
          <div class="achievements-box">
            <h4 class="box-subtitle">🏆 Komandos pasiekimai:</h4>
            ${(team.achievements || []).length > 0 ? `
              <ul class="achievements-list">
                ${team.achievements.map(a => `<li>${a}</li>`).join('')}
              </ul>
            ` : `
              <p class="text-muted" style="font-size: 0.825rem;">Rungtyniauja čempionatuose ir kaupia patirtį.</p>
            `}
          </div>

          <div class="sidebar-action-box" style="margin-top: 20px;">
            <a href="#priemimas" class="btn btn-secondary btn-sm btn-block">Treniruočių tvarkaraštis</a>
            <button class="btn btn-primary btn-block open-reg-modal" data-year="${team.year.replace(/\D/g, '')}">Prisijungti prie komandos</button>
            <a href="#komandos" class="btn btn-outline-dark btn-sm btn-block">&larr; Visos komandos</a>
          </div>
        </div>
      </aside>

      <!-- Main Team Content -->
      <div class="subpage-main-content">
        <!-- Team Hero Photo Card -->
        <div class="team-hero-card">
          <img src="${team.photo}" alt="${team.name}" class="team-hero-img">
          <div class="team-hero-overlay">
            <span class="team-hero-tag">KM „Perkūnas“ rinktinė</span>
            <h2>${team.name}</h2>
            <p>${team.desc}</p>
          </div>
        </div>

        <!-- Roster Grid -->
        <div class="content-panel" style="margin-top: 32px;">
          <div class="panel-header-flex">
            <div>
              <h3 class="panel-heading">Komandos sudėtis</h3>
            </div>
            <span class="roster-count-badge">${(team.roster || []).length} krepšininkai</span>
          </div>

          ${(team.roster || []).length > 0 ? `
            <div class="roster-grid">
              ${team.roster.map(player => `
                <div class="player-card">
                  <div class="player-photo-wrap">
                    <img src="${player.photo}" alt="${player.name}" loading="lazy">
                  </div>
                  <h4 class="player-name">${player.name}</h4>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="text-muted" style="padding: 20px 0;">Komandos sudėtis atnaujinama pagal MKL paraiškas.</p>
          `}
        </div>

        <!-- Team Photo Gallery -->
        ${team.gallery && team.gallery.length > 0 ? `
          <div class="content-panel" style="margin-top: 32px;">
            <h3 class="panel-heading">Stovyklos Dauguose ir čempionatų kovos</h3>
            <div class="subpage-gallery-grid">
              ${team.gallery.map(img => `
                <div class="subpage-photo-card" data-photo="${img.src}" data-title="${team.name}" data-desc="${img.caption || ''}">
                  <img src="${img.src}" alt="${team.name}" loading="lazy">
                  ${img.caption ? `<span class="photo-caption-tag">${img.caption}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Next Step CTA -->
        <div class="subpage-cta-strip">
          <div>
            <h4>Nori žaisti šioje komandoje?</h4>
            <p>KM „Perkūnas“ kviečia prisijungti – patikrink treniruočių laikus ir atvyk į bandomąją treniruotę!</p>
          </div>
          <a href="#priemimas" class="btn btn-primary">Treniruočių laikai &rarr;</a>
        </div>
      </div>
    </div>
  `;

  // Attach gallery modal handlers
  container.querySelectorAll('.subpage-photo-card').forEach(card => {
    card.addEventListener('click', () => {
      openLightbox(card.dataset.photo, card.dataset.title, card.dataset.desc);
    });
  });

  // Attach modal trigger
  container.querySelectorAll('.open-reg-modal').forEach(btn => {
    btn.addEventListener('click', () => openRegistrationModal(btn.dataset.year));
  });
}

/* ==========================================================================
   7. TOURNAMENT EDITIONS (PERKŪNIUKŲ taurė)
   ========================================================================== */
function initTournament() {
  const tabsContainer = document.getElementById('tournamentEditionTabs');
  if (!tabsContainer) return;

  tabsContainer.querySelectorAll('.edition-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.edition-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTournamentEdition(btn.dataset.year);
    });
  });
}

function renderTournamentEdition(year) {
  const displayArea = document.getElementById('tournamentEditionDisplay');
  const tabsContainer = document.getElementById('tournamentEditionTabs');
  const bannerTitle = document.getElementById('taureBannerTitle');
  const bannerDesc = document.getElementById('taureBannerDesc');

  const edition = tournament.editions.find(ed => ed.year === year) || tournament.editions[0];

  if (tabsContainer) {
    tabsContainer.querySelectorAll('.edition-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.year === edition.year);
    });
  }

  if (bannerTitle) bannerTitle.textContent = `Tarptautinis turnyras „PERKŪNIUKŲ“ taurė ${edition.year}`;
  if (bannerDesc) bannerDesc.textContent = edition.desc;

  if (!displayArea) return;

  displayArea.innerHTML = `
    <div class="edition-hero-summary">
      <div class="edition-stat">
        <span class="stat-num">${edition.teamsCount}</span>
        <span class="stat-lbl">Dalyvavusios komandos</span>
      </div>
      <div class="edition-stat">
        <span class="stat-num">${(edition.groups || []).length}</span>
        <span class="stat-lbl">Amžiaus grupės</span>
      </div>
      <div class="edition-stat">
        <span class="stat-num">${edition.status}</span>
        <span class="stat-lbl">Turnyro statusas</span>
      </div>
    </div>

    <!-- Groups & Results Grid -->
    <div class="tournament-divisions-grid" style="margin-top: 36px;">
      ${(edition.groups || []).map(g => `
        <div class="division-card">
          <div class="division-card-header">
            <h3>${g.name}</h3>
            ${g.scheduleUrl ? `
              <div class="kkml-quick-links">
                <a href="${g.scheduleUrl}" target="_blank" rel="noopener" class="kkml-tag-link">Tvarkaraštis</a>
                <a href="${g.tableUrl}" target="_blank" rel="noopener" class="kkml-tag-link">Rezultatai</a>
                <a href="${g.standingsUrl}" target="_blank" rel="noopener" class="kkml-tag-link">Lentelė</a>
              </div>
            ` : ''}
          </div>

          <ul class="podium-list">
            <li class="podium-item">
              <span class="podium-rank rank-1">1</span>
              <span class="podium-name"><strong>${g.winner}</strong></span>
            </li>
            <li class="podium-item">
              <span class="podium-rank rank-2">2</span>
              <span class="podium-name">${g.runnerUp}</span>
            </li>
            <li class="podium-item">
              <span class="podium-rank rank-3">3</span>
              <span class="podium-name">${g.third}</span>
            </li>
          </ul>

          ${g.mvp ? `
            <div class="division-mvp">
              <span>⭐ Naudingiausias žaidėjas (MVP):</span>
              <strong>${g.mvp}</strong>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <!-- Tournament Photos -->
    ${edition.gallery && edition.gallery.length > 0 ? `
      <div class="content-panel" style="margin-top: 40px;">
        <h3 class="panel-heading">Turnyro fotogalerija</h3>
        <div class="subpage-gallery-grid">
          ${edition.gallery.map(img => `
            <div class="subpage-photo-card" data-photo="${img.src}" data-title="PERKŪNIUKŲ taurė ${edition.year}" data-desc="${img.caption || ''}">
              <img src="${img.src}" alt="PERKŪNIUKŲ taurė ${edition.year}" loading="lazy">
              ${img.caption ? `<span class="photo-caption-tag">${img.caption}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  displayArea.querySelectorAll('.subpage-photo-card').forEach(card => {
    card.addEventListener('click', () => {
      openLightbox(card.dataset.photo, card.dataset.title, card.dataset.desc);
    });
  });
}

/* ==========================================================================
   8. PHOTO GALLERY (Foto)
   ========================================================================== */
function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  grid.innerHTML = gallery.map(item => `
    <div class="gallery-card" data-photo="${item.photo}" data-title="${item.title}" data-desc="${item.desc}">
      <div class="gallery-img-wrap">
        <img src="${item.photo}" alt="${item.title}" class="gallery-img" loading="lazy">
        <span class="gallery-cat-tag">${item.category}</span>
      </div>
      <div class="gallery-card-body">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      openLightbox(card.dataset.photo, card.dataset.title, card.dataset.desc);
    });
  });
}

function openLightbox(src, title, desc) {
  const modal = document.getElementById('photoModal');
  const modalContent = document.getElementById('photoModalContent');
  const closeBtn = document.getElementById('closePhotoModal');

  if (modal && modalContent) {
    modalContent.innerHTML = `
      <img src="${src}" alt="${title}" class="lightbox-img">
      <div class="lightbox-caption">
        <h3>${title}</h3>
        ${desc ? `<p>${desc}</p>` : ''}
      </div>
    `;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.remove('open');
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('open');
    };
  }
}

/* ==========================================================================
   9. SPONSORS
   ========================================================================== */
function initSponsors() {
  const grid = document.getElementById('sponsorsGrid');
  if (!grid) return;

  grid.innerHTML = sponsors.map(s => `
    <a href="${s.link}" target="_blank" rel="noopener" class="clean-sponsor-card" title="${s.name} (${s.category})">
      ${s.logo 
        ? `<img src="${s.logo}" alt="${s.name}" class="sponsor-img" loading="lazy">`
        : `<span class="sponsor-fallback-text">${s.name}</span>`
      }
    </a>
  `).join('');
}

/* ==========================================================================
   10. ADMINISTRATION
   ========================================================================== */
function initAdmin() {
  const container = document.getElementById('adminList');
  if (!container) return;

  container.innerHTML = schoolInfo.contacts.admin.map(adm => `
    <div class="clean-admin-item">
      <img src="${adm.photo}" alt="${adm.name}" class="clean-admin-avatar" loading="lazy">
      <div class="admin-meta-info">
        <span class="admin-meta-role">${adm.role}</span>
        <strong>${adm.name}</strong>
        <div class="admin-contact-links">
          ${adm.phones.map(p => `<a href="tel:${p.replace(/\s+/g, '')}">${p}</a>`).join(' • ')}
          <a href="mailto:${adm.email}">${adm.email}</a>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   11. 1.2% CODE COPY
   ========================================================================== */
function initCopyCode() {
  const btn = document.getElementById('copyCodeBtn');
  const codeEl = document.getElementById('gpmCode');
  const btnText = document.getElementById('copyBtnText');
  if (!btn || !codeEl) return;

  btn.addEventListener('click', async () => {
    const code = codeEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(code);
      btnText.textContent = 'Nukopijuota! ✓';
      showToast('Paramos gavėjo kodas 300053618 nukopijuotas.');
      setTimeout(() => {
        btnText.textContent = 'Kopijuoti kodą';
      }, 2500);
    } catch (err) {
      showToast('Kodas: ' + code);
    }
  });
}

/* ==========================================================================
   12. FORMS & MODALS
   ========================================================================== */
function initFormsAndModals() {
  document.querySelectorAll('.open-reg-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const year = btn.dataset.year;
      openRegistrationModal(year);
    });
  });

  const newsModal = document.getElementById('newsModal');
  const closeNewsModal = document.getElementById('closeNewsModal');
  if (closeNewsModal && newsModal) {
    closeNewsModal.addEventListener('click', closeNewsArticle);
    newsModal.addEventListener('click', (e) => {
      if (e.target === newsModal) closeNewsArticle();
    });
    newsModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNewsArticle();
      if (e.key !== 'Tab') return;
      const controls = [...newsModal.querySelectorAll('button, a[href]')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    });
  }

  const regForm = document.getElementById('registrationForm');
  const successModal = document.getElementById('regSuccessModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');
  const confirmSuccessBtn = document.getElementById('confirmSuccessBtn');

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        childName: document.getElementById('childName').value,
        birthYear: document.getElementById('birthYear').value,
        preferredGym: document.getElementById('preferredGym').value,
        parentPhone: document.getElementById('parentPhone').value,
        parentEmail: document.getElementById('parentEmail').value,
        notes: document.getElementById('notes').value,
        date: new Date().toISOString()
      };

      try {
        const list = JSON.parse(localStorage.getItem('km_registrations') || '[]');
        list.push(formData);
        localStorage.setItem('km_registrations', JSON.stringify(list));
      } catch (err) {}

      if (successModal) successModal.classList.add('open');
      regForm.reset();
    });
  }

  if (closeSuccessModal && successModal) {
    closeSuccessModal.addEventListener('click', () => successModal.classList.remove('open'));
  }
  if (confirmSuccessBtn && successModal) {
    confirmSuccessBtn.addEventListener('click', () => successModal.classList.remove('open'));
  }
}

function openRegistrationModal(preselectedYear) {
  window.location.hash = '#kontaktai';
  setTimeout(() => {
    if (preselectedYear) {
      const yearSelect = document.getElementById('birthYear');
      if (yearSelect) yearSelect.value = preselectedYear;
    }
    const nameInput = document.getElementById('childName');
    nameInput?.focus();
  }, 100);
}

/* ==========================================================================
   13. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const closeBtn = document.getElementById('closeDrawer');

  if (!toggle || !drawer || !overlay) return;

  function open() {
    drawer.inert = false;
    drawer.classList.add('open');
    overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function close() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (drawer.contains(document.activeElement)) toggle.focus();
    drawer.inert = true;
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', close);

  drawer.querySelectorAll('.mobile-nav-link, .mobile-sublink, .open-reg-modal, .drawer-contact-item').forEach(link => {
    link.addEventListener('click', close);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && drawer.classList.contains('open')) {
      const focusable = [...drawer.querySelectorAll('a[href], button')].filter(el => el.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      close();
    }
  });
}

/* ==========================================================================
   FLOATING ISLAND HEADER ON SCROLL
   ========================================================================== */
function initStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;
  const updateHeader = () => {
    if (window.scrollY > 30) {
      header.classList.add('is-floating');
    } else {
      header.classList.remove('is-floating');
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  updateHeader();
}

/* ==========================================================================
   TOAST HELPER
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ==========================================================================
   SPORTO SALIŲ ŽEMĖLAPIS (13 Treniruočių centrų Kaune)
   ========================================================================== */
function initGymsMap() {
  const mapContainer = document.getElementById('gymsMap');
  const cardsList = document.getElementById('gymsCardsList');
  const countBadge = document.getElementById('gymsCountBadge');
  const filterPills = document.querySelectorAll('.gym-district-pill');

  if (!mapContainer || !cardsList) return;

  const kaunasCenter = [54.902, 23.935];
  const map = L.map('gymsMap', {
    center: kaunasCenter,
    zoom: 12,
    scrollWheelZoom: false,
    touchZoom: true
  });

  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('blur', () => map.scrollWheelZoom.disable());

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(map);

  const markers = [];

  function createCustomPin(gym) {
    return L.divIcon({
      className: 'custom-gym-pin',
      html: `<div class="pin-marker" title="${gym.name}"><span class="pin-icon">🏀</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32]
    });
  }

  gyms.forEach(gym => {
    const marker = L.marker([gym.lat, gym.lng], {
      icon: createCustomPin(gym),
      title: gym.name
    }).addTo(map);

    const popupContent = `
      <div class="gym-popup-card">
        <span class="popup-district">${gym.district}</span>
        <h4 class="popup-title">${gym.name}</h4>
        <p class="popup-address">📍 ${gym.address}</p>
        <p class="popup-features">${gym.features}</p>
        <div class="popup-groups">
          <strong>Treniruojasi:</strong> ${gym.groups ? gym.groups.join(', ') : 'Vaikų ir jaunimo grupės'}
        </div>
        <div class="popup-actions">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(gym.name + ' ' + gym.address)}" 
             target="_blank" 
             rel="noopener" 
             class="popup-route-btn">Gauti maršrutą &rarr;</a>
          <a href="#priemimas" class="popup-sched-btn">Tvarkaraštis</a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 280 });
    marker.gymData = gym;
    markers.push({ gym, marker });

    marker.on('click', () => {
      highlightSidebarCard(gym.id);
    });
  });

  function renderSidebarCards(filteredGyms) {
    cardsList.innerHTML = filteredGyms.map(gym => `
      <div class="gym-sidebar-card" id="card-${gym.id}" data-id="${gym.id}">
        <div class="gym-card-top">
          <span class="gym-district-badge">${gym.district}</span>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(gym.name + ' ' + gym.address)}" 
             target="_blank" 
             rel="noopener" 
             class="gym-route-link" 
             title="Maršrutas Google Maps">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Naviguoti</span>
          </a>
        </div>
        <h4 class="gym-card-name">${gym.name}</h4>
        <p class="gym-card-address">${gym.address}</p>
        <p class="gym-card-features">${gym.features}</p>
        <div class="gym-card-groups">
          ${(gym.groups || []).map(g => `<span class="group-mini-badge">${g}</span>`).join('')}
        </div>
        <div class="gym-card-actions">
          <button class="btn btn-secondary btn-xs show-on-map-btn" data-id="${gym.id}">
            Rodyti žemėlapyje
          </button>
          <a href="#priemimas" class="btn btn-primary btn-xs">
            Tvarkaraštis
          </a>
        </div>
      </div>
    `).join('');

    cardsList.querySelectorAll('.show-on-map-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const match = markers.find(m => m.gym.id === id);
        if (match) {
          map.flyTo([match.gym.lat, match.gym.lng], 15, { duration: 0.8 });
          match.marker.openPopup();
          highlightSidebarCard(id);
          if (window.innerWidth <= 992) {
            document.getElementById('gymsMap')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });
  }

  function highlightSidebarCard(gymId) {
    document.querySelectorAll('.gym-sidebar-card').forEach(c => c.classList.remove('selected'));
    const targetCard = document.getElementById(`card-${gymId}`);
    if (targetCard) {
      targetCard.classList.add('selected');
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function filterGyms(district) {
    const filtered = district === 'all'
      ? gyms
      : gyms.filter(g => g.district.toLowerCase().includes(district.toLowerCase()));

    renderSidebarCards(filtered);
    if (countBadge) countBadge.textContent = `${filtered.length} salių`;

    const activeLatLngs = [];
    markers.forEach(({ gym, marker }) => {
      const isVisible = district === 'all' || gym.district.toLowerCase().includes(district.toLowerCase());
      if (isVisible) {
        if (!map.hasLayer(marker)) map.addLayer(marker);
        activeLatLngs.push([gym.lat, gym.lng]);
      } else {
        if (map.hasLayer(marker)) map.removeLayer(marker);
      }
    });

    if (activeLatLngs.length > 0) {
      const bounds = L.latLngBounds(activeLatLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filterGyms(pill.getAttribute('data-district'));
    });
  });

  renderSidebarCards(gyms);

  window.addEventListener('resize', () => map.invalidateSize());
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash === '' || hash === '#home' || hash === '#sales') {
      setTimeout(() => map.invalidateSize(), 200);
    }
  });
}
