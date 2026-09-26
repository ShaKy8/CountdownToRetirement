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
  const allPhotoButtons = [...document.querySelectorAll('button[data-image]')];
  // A photograph can appear in both a comparison and the finished-property overview.
  const photoButtons = [...new Map(allPhotoButtons.filter(button => !button.closest('.transformation-tour')).map(button => [button.dataset.image, button])).values()];
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
  allPhotoButtons.forEach(button => {
    const index = photoButtons.findIndex(photo => photo.dataset.image === button.dataset.image);
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


  const tour = document.querySelector('.transformation-tour');
  if (tour) {
    const panels = [...tour.querySelectorAll('.tour-panel')];
    const choices = [...tour.querySelectorAll('[data-tour-select]')];
    const status = tour.querySelector('.tour-status');
    let selected = 0;

    function showPanel(index) {
      selected = (index + panels.length) % panels.length;
      panels.forEach((panel, i) => { panel.hidden = i !== selected; });
      choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
      const name = choices[selected].textContent.replace(/^\s*\d+\s*/, '').trim();
      status.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')} · ${name}`;
    }
    choices.forEach((button, i) => button.addEventListener('click', () => showPanel(i)));
    tour.querySelector('.tour-prev').addEventListener('click', () => showPanel(selected - 1));
    tour.querySelector('.tour-next').addEventListener('click', () => showPanel(selected + 1));
    tour.querySelectorAll('.tour-nav,.tour-footer').forEach(el => { el.hidden = false; });
    tour.classList.add('tour-ready');
    showPanel(0);
  }

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
