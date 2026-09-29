const SPLASH_EXIT_DURATION = 360;
const SPLASH_PAUSE_DURATION = 4200;
const ENVELOPE_DURATION = 900;

function resetScrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function clearEntryHash() {
  if (!window.location.hash) return;
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`);
}

export function initEntryFlow() {
  const splash = document.getElementById('weddingSplash');
  const enterButton = document.getElementById('splashEnter');
  const envelopeScreen = document.getElementById('env-screen');
  const envelope = document.getElementById('envWrap');
  const main = document.getElementById('main');
  const musicButton = document.getElementById('musicBtn');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let envelopeOpened = false;

  if (!splash || !enterButton || !envelopeScreen || !envelope || !main) return;
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  clearEntryHash();
  resetScrollToTop();

  splash.hidden = false;
  splash.classList.remove('is-leaving');
  splash.setAttribute('aria-hidden', 'false');
  splash.inert = false;
  document.body.classList.add('splash-active');
  document.body.classList.remove('invitation-locked');
  main.classList.remove('visible');
  main.inert = true;
  envelopeScreen.inert = true;

  enterButton.disabled = false;
  enterButton.setAttribute('aria-disabled', 'false');
  enterButton.focus({ preventScroll: true });

  const finishSplash = () => {
    splash.hidden = true;
    envelope.focus({ preventScroll: true });
  };

  const enterInvitation = () => {
    if (enterButton.disabled || splash.hidden || splash.classList.contains('is-leaving')) return;
    enterButton.disabled = true;
    enterButton.setAttribute('aria-disabled', 'true');
    enterButton.setAttribute('data-loading', 'true');
    enterButton.classList.add('is-loading');
    enterButton.innerHTML = `
      <span class="splash-loading-text">Opening invitation</span>
      <span class="splash-loading-spinner" aria-hidden="true"></span>
    `;
    splash.dataset.state = 'loading';
    splash.setAttribute('aria-hidden', 'true');
    splash.inert = true;
    document.body.classList.remove('splash-active');
    document.body.classList.add('invitation-locked');
    envelopeScreen.inert = false;

    const showInvitationCard = () => {
      splash.classList.add('is-leaving');
      if (reduceMotion.matches) finishSplash();
      else window.setTimeout(finishSplash, SPLASH_EXIT_DURATION);
    };

    window.setTimeout(showInvitationCard, 3000);
  };

  const openEnvelope = () => {
    if (envelopeOpened) return;
    envelopeOpened = true;
    envelope.classList.add('opening');
    window.startMusic?.();

    window.setTimeout(() => {
      envelopeScreen.classList.add('gone');
      document.body.classList.remove('invitation-locked');
      clearEntryHash();
      resetScrollToTop();
      requestAnimationFrame(() => {
        main.classList.add('visible');
        main.inert = false;
        if (musicButton) musicButton.inert = false;
        resetScrollToTop();
        const hero = document.getElementById('sec-hero');
        hero?.focus({ preventScroll: true });
        requestAnimationFrame(() => {
          resetScrollToTop();
        });
      });
    }, ENVELOPE_DURATION);
  };

  window.enterWeddingSplash = enterInvitation;
  window.openEnvelope = openEnvelope;
  enterButton.addEventListener('click', enterInvitation);
  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openEnvelope();
  });
  splash.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      enterInvitation();
      return;
    }
    if (event.key !== 'Tab') return;
    event.preventDefault();
    enterButton.focus();
  });
  window.addEventListener('popstate', () => {
    if (!main.classList.contains('visible')) return;
    let targetId = window.location.hash.slice(1);
    try { targetId = decodeURIComponent(targetId); } catch {}
    if (!targetId) {
      resetScrollToTop();
      requestAnimationFrame(resetScrollToTop);
      return;
    }
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });

  enterButton.focus({ preventScroll: true });
}
