const REVEAL_SELECTOR = 'section, .info-card, .light-card, .reminder-card, .cd-box, .wish-card, .gallery-item, .tl-item';

function initReveals(reduceMotion) {
  const targets = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
  if (!targets.length) return;

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach(target => target.classList.add('is-visible'));
  } else {
    targets.forEach(target => {
      const siblings = Array.from(target.parentElement?.children ?? []).filter(sibling => sibling.matches(REVEAL_SELECTOR));
      const order = siblings.indexOf(target);
      const direction = target.matches('section') ? 'reveal-from-up' : order % 2 ? 'reveal-from-right' : 'reveal-from-left';
      target.classList.add('reveal-item', direction);
      target.style.setProperty('--reveal-delay', `${Math.min(Math.max(order, 0), 4) * 70}ms`);
    });

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(target => revealObserver.observe(target));
  }

  if (!('IntersectionObserver' in window)) return;
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) window.setActiveNavLink?.(entry.target.id);
    });
  }, { threshold: 0.35, rootMargin: '-15% 0px -45% 0px' });
  document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
}

function initParallax(reduceMotion) {
  const targets = Array.from(document.querySelectorAll('[data-parallax-speed]'));
  if (!targets.length || !('IntersectionObserver' in window)) return;

  const visibleTargets = new Set();
  let pageVisible = !document.hidden;
  let reduced = reduceMotion.matches;
  let frameId = 0;

  const reset = () => {
    document.documentElement.style.setProperty('--ambient-drift-y', '0px');
    targets.forEach(target => target.style.setProperty('--parallax-y', '0px'));
  };

  const render = () => {
    frameId = 0;
    if (!pageVisible || reduced) return;
    const mobile = window.matchMedia('(max-width:640px)').matches;
    const scale = mobile ? 0.4 : 1;
    const maxDrift = mobile ? 18 : 42;
    const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / range));
    document.documentElement.style.setProperty('--ambient-drift-y', `${(-maxDrift * progress).toFixed(1)}px`);

    visibleTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      const distance = window.innerHeight / 2 - (rect.top + rect.height / 2);
      const speed = Number(target.dataset.parallaxSpeed) || 0.1;
      const offset = Math.max(-14 * scale, Math.min(14 * scale, distance * speed * scale));
      target.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
    });
  };

  const schedule = () => {
    if (!frameId && pageVisible && !reduced) frameId = requestAnimationFrame(render);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visibleTargets.add(entry.target) : visibleTargets.delete(entry.target));
    schedule();
  }, { rootMargin: '15% 0px' });
  targets.forEach(target => observer.observe(target));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    document.body.classList.toggle('motion-paused', !pageVisible);
    if (!pageVisible && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    } else schedule();
  });
  reduceMotion.addEventListener('change', () => {
    reduced = reduceMotion.matches;
    if (reduced) {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      reset();
    } else schedule();
  });
  document.body.classList.toggle('motion-paused', !pageVisible);
  if (reduced) reset();
  else render();
}

export function initScrollEffects() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  initReveals(reduceMotion);
  initParallax(reduceMotion);
}
