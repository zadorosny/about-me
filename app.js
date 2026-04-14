/* =========================================================
   app.js — SPA router + menu + BGM + Pix form wiring
   ========================================================= */

const SECTIONS = ['sobre', 'curriculo'];
const DEFAULT_SECTION = 'sobre';

/* ---------------- Intro screen ---------------- */

function setupIntro() {
  const intro = document.getElementById('intro');
  if (!intro) return;

  let dismissed = false;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    intro.classList.add('leaving');
    intro.addEventListener('animationend', () => {
      intro.classList.add('gone');
    }, { once: true });
  };

  intro.addEventListener('click', dismiss);
  intro.addEventListener('keydown', (e) => {
    // Enter/Space on the focused intro dismisses it
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dismiss();
    }
  });
  // Any key anywhere
  const onKey = () => { dismiss(); window.removeEventListener('keydown', onKey); };
  window.addEventListener('keydown', onKey);

  // Auto-focus so screen-reader/keyboard users know where they are
  setTimeout(() => intro.focus(), 100);
}

/* ---------------- Router ---------------- */

function currentSection() {
  const hash = (location.hash || '').replace('#', '');
  return SECTIONS.includes(hash) ? hash : DEFAULT_SECTION;
}

function activate(target) {
  const sections = document.querySelectorAll('.section');
  const items = document.querySelectorAll('.menu-item');

  sections.forEach(s => {
    const isTarget = s.dataset.section === target;
    if (isTarget) {
      s.classList.remove('leaving');
      s.classList.add('active');
    } else if (s.classList.contains('active')) {
      s.classList.remove('active');
    }
  });

  items.forEach(i => {
    i.classList.toggle('active', i.dataset.target === target);
  });

  // Scroll to top of stage on change
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (target === 'sobre') loadGithub();
}

function router() {
  activate(currentSection());
}

/* ---------------- BGM ---------------- */

function setupBgm() {
  const btn = document.getElementById('bgm-btn');
  const audio = document.getElementById('bgm');
  if (!btn || !audio) return;

  const ico = btn.querySelector('.bgm-ico');
  audio.volume = 0.5;

  const setPlaying = (on) => {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    ico.textContent = on ? '\u2016' : '\u266A';
  };

  audio.addEventListener('error', () => {
    const e = audio.error;
    const codes = { 1:'ABORTED', 2:'NETWORK', 3:'DECODE', 4:'SRC_NOT_SUPPORTED' };
    const reason = e ? (codes[e.code] || e.code) : 'unknown';
    console.error('[BGM] erro ao carregar assets/bgm.mp3:', reason);
    setPlaying(false);
  });
  audio.addEventListener('playing', () => setPlaying(true));
  audio.addEventListener('pause',   () => setPlaying(false));
  audio.addEventListener('ended',   () => setPlaying(false));

  btn.addEventListener('click', () => {
    if (!audio.paused && !audio.ended) {
      audio.pause();
      return;
    }
    const p = audio.play();
    if (p && p.then) {
      p.then(() => setPlaying(true))
       .catch((err) => {
         console.error('[BGM] play() falhou:', err && err.name, err && err.message);
         setPlaying(false);
       });
    }
  });
}

/* ---------------- Clock + Heart Burst ---------------- */

const DAYS_PT = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];

function tickClock() {
  const el = document.getElementById('hdr-clock-txt');
  if (!el) return;
  const d = new Date();
  const dow = DAYS_PT[d.getDay()];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  el.textContent = `${dow} \u00B7 ${hh}:${mm}`;
}

const BURST_PHRASES = [
  'TAKE YOUR HEART',
  'TAKE YOUR BACKLOG',
  'STEAL THE BUG',
  'NO MORE DEADLOCKS',
  'UNLOCK THE DATA',
  'SHOW YOUR TRUE FORM',
  'LET\u2019S CONNECT',
  'PING ME',
  'REACH OUT',
  'DROP A LINE',
];

function spawnHeartBurst() {
  const host = document.getElementById('heart-burst');
  if (!host) return;
  const el = document.createElement('span');
  const phrase = BURST_PHRASES[Math.floor(Math.random() * BURST_PHRASES.length)];
  el.textContent = phrase;
  if (phrase === 'LET\u2019S CONNECT') {
    window.open('https://linkedin.com/in/zadorosny', '_blank', 'noopener');
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  el.style.left = `${30 + Math.random() * 40}vw`;
  el.style.top = `${35 + Math.random() * 30}vh`;
  el.style.fontSize = `${Math.min(vw, vh) * 0.09}px`;
  host.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

function setupHeaderClock() {
  const btn = document.getElementById('hdr-clock');
  if (!btn) return;
  tickClock();
  setInterval(tickClock, 1000 * 15);
  btn.addEventListener('click', spawnHeartBurst);
}

/* ---------------- GitHub repos ---------------- */

const GH_USER = 'zadorosny';
let ghLoaded = false;

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

async function loadGithub() {
  if (ghLoaded) return;
  ghLoaded = true;
  const reposEl = document.getElementById('gh-repos');

  try {
    const [userRes, repoRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`),
      fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`),
    ]);
    if (!userRes.ok || !repoRes.ok) throw new Error('API error');
    const user = await userRes.json();
    const repos = await repoRes.json();

    document.getElementById('gh-stat-repos').textContent = user.public_repos ?? '—';
    document.getElementById('gh-stat-followers').textContent = user.followers ?? '—';
    document.getElementById('gh-stat-following').textContent = user.following ?? '—';

    if (!reposEl) return;

    const list = repos
      .filter(r => !r.fork)
      .sort((a, b) =>
        (b.stargazers_count - a.stargazers_count) ||
        (new Date(b.pushed_at) - new Date(a.pushed_at))
      );

    if (!list.length) {
      reposEl.innerHTML = '<p class="gh-loading">NENHUM REPOSITÓRIO PÚBLICO.</p>';
      return;
    }

    reposEl.innerHTML = list.map(r => `
      <a class="gh-repo" href="${escapeHtml(r.html_url)}" target="_blank" rel="noopener">
        <h4 class="gh-repo-name">${escapeHtml(r.name)}</h4>
        <p class="gh-repo-desc">${escapeHtml(r.description || 'Sem descrição.')}</p>
        <div class="gh-repo-meta">
          ${r.language ? `<span class="gh-repo-lang">${escapeHtml(r.language)}</span>` : ''}
          <span>&#9733; ${r.stargazers_count}</span>
          <span>&#8644; ${r.forks_count}</span>
        </div>
      </a>
    `).join('');
  } catch (err) {
    console.error('[GH]', err);
    if (reposEl) reposEl.innerHTML = '<p class="gh-error">FALHA AO CARREGAR REPOSITÓRIOS.</p>';
    ghLoaded = false;
  }
}

/* ---------------- Menu clicks ---------------- */

function setupMenu() {
  document.querySelectorAll('.menu-item').forEach(el => {
    el.addEventListener('click', (e) => {
      // Deixa o hashchange fazer o trabalho — só previne se já estiver ativo
      if (el.classList.contains('active')) {
        e.preventDefault();
      }
    });
  });
}

/* ---------------- Boot ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  setupIntro();
  setupMenu();
  setupBgm();
  setupHeaderClock();
  router();
  window.addEventListener('hashchange', router);
});
