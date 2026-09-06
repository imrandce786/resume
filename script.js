/**
 * Executive Resume Interactions — Md Irman Ansari
 * Production & Quality Manager
 */

(function () {
  'use strict';

  // 1. Theme Switcher (System-aware + LocalStorage persistence)
  const themeToggleBtn = document.getElementById('themeToggle');
  const prefersDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const htmlEl = document.documentElement;

  function getCurrentTheme() {
    const saved = localStorage.getItem('resume-theme');
    if (saved) return saved;
    return prefersDarkMedia.matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.content = theme === 'dark' ? 'dark' : 'light';
    }

    if (themeToggleBtn) {
      const isDark = theme === 'dark';
      themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      themeToggleBtn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      
      const sunIcon = themeToggleBtn.querySelector('.sun-icon');
      const moonIcon = themeToggleBtn.querySelector('.moon-icon');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'block' : 'none';
        moonIcon.style.display = isDark ? 'none' : 'block';
      }
    }
  }

  // Initialize theme
  const initialTheme = getCurrentTheme();
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const current = htmlEl.getAttribute('data-theme') || getCurrentTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('resume-theme', next);
      applyTheme(next);
      showToast(`Switched to ${next} theme`);
    });
  }

  // Listen to OS theme changes if user hasn't explicitly set preference
  prefersDarkMedia.addEventListener('change', function (e) {
    if (!localStorage.getItem('resume-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // 2. Animated Metric Counters
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kpiNumbers = document.querySelectorAll('.kpi-number[data-target]');

  if (kpiNumbers.length > 0) {
    if (prefersReducedMotion) {
      kpiNumbers.forEach(el => {
        el.textContent = el.getAttribute('data-target');
      });
    } else {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      kpiNumbers.forEach(el => observer.observe(el));
    }
  }

  function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target')) || 0;
    const duration = 1400; // ms
    const startTime = performance.now();
    const isNegative = element.getAttribute('data-prefix') === '-';
    const isPositive = element.getAttribute('data-prefix') === '+';

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(target * easeOut);

      let prefix = '';
      if (isNegative) prefix = '-';
      else if (isPositive) prefix = '+';

      element.textContent = prefix + currentVal;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = prefix + target;
      }
    }

    requestAnimationFrame(update);
  }

  // 3. Skill Category Filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillChips = document.querySelectorAll('.skill-chip');

  filterButtons.forEach(button => {
    button.addEventListener('click', function () {
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.getAttribute('data-filter');

      skillChips.forEach(chip => {
        if (filter === 'all') {
          chip.classList.remove('hidden');
        } else {
          const categories = chip.getAttribute('data-category') || '';
          if (categories.split(' ').includes(filter)) {
            chip.classList.remove('hidden');
          } else {
            chip.classList.add('hidden');
          }
        }
      });
    });
  });

  // 4. Toast Notification System
  const toast = document.getElementById('toastNotice');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    const messageEl = toast.querySelector('.toast-message');
    if (messageEl) messageEl.textContent = message;

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 5. Copy to Clipboard Handlers
  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = this.getAttribute('data-copy');
      const label = this.getAttribute('data-copy-label') || 'Text';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied ${label} to clipboard!`);
        }).catch(() => {
          fallbackCopy(textToCopy, label);
        });
      } else {
        fallbackCopy(textToCopy, label);
      }
    });
  });

  function fallbackCopy(text, label) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(`Copied ${label} to clipboard!`);
    } catch (err) {
      showToast('Could not copy to clipboard.');
    }
    document.body.removeChild(textarea);
  }

  // 6. Print Trigger
  const printButtons = document.querySelectorAll('.action-print');
  printButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.print();
    });
  });

})();
