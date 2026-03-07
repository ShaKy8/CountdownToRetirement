/**
 * BranyonTech Consulting - script.js
 * Minimal interactivity: nav toggle, smooth scroll,
 * scroll-triggered animations, active link tracking.
 * No frameworks. No build tools.
 */

(function () {
  'use strict';

  /* ----------------------------------------
     Elements
     ---------------------------------------- */
  var header    = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu   = document.getElementById('nav-menu');
  var navLinks  = document.querySelectorAll('.nav-link');
  var sections  = document.querySelectorAll('main section[id]');
  var fadeEls   = document.querySelectorAll('.fade-in');

  /* ----------------------------------------
     Mobile Nav Toggle
     ---------------------------------------- */
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a nav link is clicked
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ----------------------------------------
     Nav background on scroll
     ---------------------------------------- */
  function handleNavScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load

  /* ----------------------------------------
     Active nav link on scroll
     Uses IntersectionObserver to detect which
     section is currently in view.
     ---------------------------------------- */
  if (sections.length && navLinks.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              var href = link.getAttribute('href');
              if (href === '#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0
      }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ----------------------------------------
     Fade-in animations on scroll
     ---------------------------------------- */
  if (fadeEls.length) {
    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeEls.forEach(function (el) {
      fadeObserver.observe(el);
    });
  }

})();
