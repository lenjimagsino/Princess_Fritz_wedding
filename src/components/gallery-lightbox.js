export function initGalleryLightbox() {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('galleryLightbox');
  const image = document.getElementById('lightboxImage');
  const caption = document.getElementById('lightboxCaption');
  const details = document.getElementById('lightboxDetails');
  if (!items.length || !lightbox || !image || !caption || !details) return;

  let activeIndex = 0;
  let trigger = null;
  let previousOverflow = '';

  const open = index => {
    activeIndex = (index + items.length) % items.length;
    const item = items[activeIndex];
    if (!lightbox.classList.contains('show')) {
      trigger = document.activeElement;
      previousOverflow = document.body.style.overflow;
    }
    image.src = item.querySelector('img')?.currentSrc || item.dataset.src || '';
    image.alt = item.dataset.alt || 'Wedding gallery image';
    caption.textContent = item.dataset.caption || '';
    details.textContent = item.dataset.details || '';
    details.hidden = !details.textContent;
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      if (lightbox.classList.contains('show')) lightbox.querySelector('.lightbox-close')?.focus({ preventScroll: true });
    });
  };

  const close = () => {
    if (!lightbox.classList.contains('show')) return;
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousOverflow;
    trigger?.focus({ preventScroll: true });
    trigger = null;
  };

  const move = direction => open(activeIndex + direction);
  items.forEach((item, index) => item.addEventListener('click', () => open(index)));
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) close();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('show')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowRight') move(1);
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key !== 'Tab') return;

    const controls = Array.from(lightbox.querySelectorAll('button:not(:disabled)'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (!lightbox.contains(document.activeElement) || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });

  window.openGalleryLightbox = open;
  window.closeGalleryLightbox = close;
  window.moveGallery = move;
}
