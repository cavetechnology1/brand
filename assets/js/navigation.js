/* Progressive navigation disclosure: links remain visible if JavaScript is unavailable. */
(function () {
  const button = document.getElementById('nav-toggle');
  const nav = document.getElementById('brand-navigation');
  if (!button || !nav || !window.matchMedia) return;
  const small = window.matchMedia('(max-width: 1024px)');
  const header = button.closest('.top');
  header.classList.add('mobile-nav-ready');

  function closeTheme() {
    const panel = document.getElementById('theme-options');
    const themeButton = document.getElementById('theme-button');
    if (panel) panel.hidden = true;
    if (themeButton) themeButton.setAttribute('aria-expanded', 'false');
  }
  function expanded(value) {
    button.setAttribute('aria-expanded', String(value));
    button.setAttribute('aria-label', button.dataset[value ? 'closeLabel' : 'openLabel']);
  }
  function close(restoreFocus) {
    if (!small.matches) return;
    closeTheme();
    nav.hidden = true;
    expanded(false);
    if (restoreFocus) button.focus();
  }
  function layout() {
    const focusInNav = nav.contains(document.activeElement);
    const focusOnButton = document.activeElement === button;
    button.hidden = !small.matches;
    expanded(false);
    closeTheme();
    nav.hidden = small.matches;
    if (small.matches && focusInNav) button.focus();
    else if (!small.matches && focusOnButton) nav.querySelector('a').focus();
  }
  button.addEventListener('click', function () {
    if (button.getAttribute('aria-expanded') === 'true') close(false);
    else { nav.hidden = false; expanded(true); }
  });
  nav.addEventListener('click', function (event) {
    const link = event.target.closest('a');
    if (!link || !small.matches) return;
    close(false);
    if (link.getAttribute('href').startsWith('#')) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
    }
  });
  document.addEventListener('keydown', function (event) {
    // The nested appearance picker consumes its own first Escape.
    if (event.key !== 'Escape' || event.defaultPrevented || !small.matches || nav.hidden) return;
    const themePanel = document.getElementById('theme-options');
    if (themePanel && !themePanel.hidden) return;
    close(true);
    event.preventDefault();
  });
  document.addEventListener('click', function (event) {
    if (nav.hidden || nav.contains(event.target) || button.contains(event.target)) return;
    close(nav.contains(document.activeElement));
  });
  document.addEventListener('focusin', function (event) {
    if (!nav.hidden && !nav.contains(event.target) && !button.contains(event.target)) close(false);
  });
  if (small.addEventListener) small.addEventListener('change', layout);
  else small.addListener(layout);
  layout();
})();
