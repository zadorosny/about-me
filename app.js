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

/* ---------------- GitHub repos ---------------- */

const GH_USER = 'zadorosny';
let ghLoaded = false;

async function loadGithub() {
  if (ghLoaded) return;
  ghLoaded = true;
  const reposEl = document.getElementById('gh-stat-repos');
  if (!reposEl) return;

  try {
    const res = await fetch(`https://api.github.com/users/${GH_USER}`);
    if (!res.ok) throw new Error('API error');
    const user = await res.json();
    document.getElementById('gh-stat-repos').textContent = user.public_repos ?? '—';
    document.getElementById('gh-stat-followers').textContent = user.followers ?? '—';
    document.getElementById('gh-stat-following').textContent = user.following ?? '—';
  } catch (err) {
    console.error('[GH]', err);
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
  router();
  window.addEventListener('hashchange', router);
});
