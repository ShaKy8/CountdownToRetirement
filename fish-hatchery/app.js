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
    const play = tour.querySelector('.tour-play');
    const playText = tour.querySelector('.tour-play-text');
    const playIcon = tour.querySelector('.tour-play-icon');
    const status = tour.querySelector('.tour-status');
    const progress = tour.querySelector('.tour-track span');
    const slideDuration = 20000;
    let selected = 0;
    let playing = false;
    let started = false;
    let elapsed = 0;
    let beganAt = 0;
    let timer = null;

    function setStatus(suffix = '') {
      const name = panels[selected].querySelector('.tour-kicker').textContent.slice(5);
      status.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')} · ${name}${suffix}`;
    }
    function paintProgress() {
      const part = elapsed + (playing ? performance.now() - beganAt : 0);
      progress.style.width = `${Math.min(100, (selected + part / slideDuration) / panels.length * 100)}%`;
    }
    function pauseTour() {
      if (!playing) return;
      elapsed = Math.min(slideDuration, elapsed + performance.now() - beganAt);
      playing = false;
      clearInterval(timer);
      timer = null;
      playText.textContent = 'Resume the tour';
      playIcon.textContent = '▷';
      setStatus(' · Paused');
      paintProgress();
    }
    function showPanel(index) {
      selected = (index + panels.length) % panels.length;
      panels.forEach((panel, i) => { panel.hidden = i !== selected; });
      choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
      setStatus();
      paintProgress();
    }
    function choosePanel(index) {
      pauseTour();
      started = false;
      elapsed = 0;
      playText.textContent = 'Play the 60-second tour';
      showPanel(index);
    }
    choices.forEach((button, i) => button.addEventListener('click', () => choosePanel(i)));
    tour.querySelector('.tour-prev').addEventListener('click', () => choosePanel(selected - 1));
    tour.querySelector('.tour-next').addEventListener('click', () => choosePanel(selected + 1));
    play.addEventListener('click', () => {
      if (playing) { pauseTour(); return; }
      if (!started) { elapsed = 0; showPanel(0); started = true; }
      playing = true;
      beganAt = performance.now();
      playText.textContent = 'Pause the tour';
      playIcon.textContent = 'Ⅱ';
      setStatus(' · Playing');
      timer = setInterval(() => {
        if (elapsed + performance.now() - beganAt >= slideDuration) {
          if (selected === panels.length - 1) {
            pauseTour();
            started = false;
            elapsed = slideDuration;
            playText.textContent = 'Replay the 60-second tour';
            setStatus(' · Tour complete');
            paintProgress();
            return;
          }
          elapsed = 0;
          beganAt = performance.now();
          showPanel(selected + 1);
          setStatus(' · Playing');
        }
        paintProgress();
      }, 100);
    });
    tour.querySelectorAll('button[data-image], .tour-chapter-link').forEach(item => item.addEventListener('click', pauseTour));
    document.addEventListener('visibilitychange', () => { if (document.hidden) pauseTour(); });
    document.querySelector('#lightbox').addEventListener('close', pauseTour);
    // Leaving the tour pauses it; scrolling back never restarts it automatically.
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) pauseTour();
    });
    observer.observe(tour);
    tour.querySelectorAll('.tour-play,.tour-play-note,.tour-nav,.tour-footer,.tour-track').forEach(el => { el.hidden = false; });
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
