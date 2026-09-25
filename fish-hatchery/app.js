(() => {
  'use strict';
  document.querySelectorAll('.comparison').forEach(comparison => {
    const buttons = [...comparison.querySelectorAll('[data-view]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      comparison.dataset.mode = button.dataset.view;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
  });

  const dialog = document.querySelector('#lightbox');
  const photoButtons = [...document.querySelectorAll('button[data-image]')];
  const image = dialog.querySelector('.lightbox-image');
  const title = dialog.querySelector('#lightbox-title');
  const caption = dialog.querySelector('.lightbox-caption p');
  const counter = dialog.querySelector('.lightbox-counter');
  let activeIndex = 0;
  let trigger = null;

  function display(index) {
    activeIndex = (index + photoButtons.length) % photoButtons.length;
    const item = photoButtons[activeIndex];
    image.src = item.dataset.image;
    image.alt = item.querySelector('img').alt;
    title.textContent = item.dataset.title;
    caption.textContent = item.dataset.caption;
    counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${photoButtons.length}`;
  }
  photoButtons.forEach((button, index) => {
    button.setAttribute('aria-label', `Enlarge photograph: ${button.dataset.title}`);
    button.addEventListener('click', () => {
      trigger = button;
      display(index);
      dialog.showModal();
      document.body.classList.add('modal-open');
    });
  });
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click', () => display(activeIndex - 1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => display(activeIndex + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      display(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    trigger?.focus({preventScroll: true});
  });
  let touchStart = null;
  image.addEventListener('touchstart', event => {
    if(event.touches.length === 1) touchStart = {x:event.touches[0].clientX,y:event.touches[0].clientY};
  }, {passive:true});
  image.addEventListener('touchend', event => {
    if(!touchStart || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) display(activeIndex + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive:true});

  const bar = document.querySelector('.reading-progress span');
  let scheduled = false;
  function updateProgress() {
    const total = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${total > 0 ? Math.min(100, Math.max(0, scrollY / total * 100)) : 0}%`;
    scheduled = false;
  }
  addEventListener('scroll', () => {
    if(!scheduled) { requestAnimationFrame(updateProgress); scheduled = true; }
  }, {passive:true});
  addEventListener('resize', updateProgress);
  addEventListener('load', updateProgress);
  updateProgress();
})();
