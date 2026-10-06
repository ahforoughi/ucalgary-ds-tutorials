// Header: each button shows and hides the panel named in its aria-controls: the menu, the toolbox
// (search and quick links), the Faculty Websites dropdown inside the toolbox, and each navigation
// item's sub-menu (uc-header__nav-toggle, one open at a time).
// Escape closes the innermost open panel that holds the focus and returns focus to its button.
// Dropdowns and sub-menus also close when the focus or a click goes outside them.
// A sub-menu's tabs (uc-header__mega-tab) each show their own panel; one is always showing: the one the
// markup marks as chosen (the tab on the way to the page), else the first.
// Progressive enhancement: without JavaScript the menu and toolbox panels stay open (markup has no
// `hidden`); the script closes them and wires up the buttons. Sub-menus need the script, as on UCWS.
// Wrapped in a function so it adds no globals.
(() => {
  const toggles = [...document.querySelectorAll('.uc-header__toggle, .uc-header__dropdown-toggle, .uc-header__nav-toggle')];
  const panelOf = (button) => document.getElementById(button.getAttribute('aria-controls'));
  const isOpen = (button) => button.getAttribute('aria-expanded') === 'true';

  function setOpen(button, open) {
    const panel = panelOf(button);
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    // Closing a panel also closes any dropdown or sub-menu inside it, so it opens closed next time.
    if (!open) {
      panel.querySelectorAll('.uc-header__dropdown-toggle[aria-expanded="true"], .uc-header__nav-toggle[aria-expanded="true"]').forEach((inner) => setOpen(inner, false));
    }
  }

  toggles.forEach((button) => {
    setOpen(button, false);
    button.addEventListener('click', () => setOpen(button, !isOpen(button)));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    // Buttons are in document order, so the last match is the innermost panel.
    const focus = document.activeElement;
    const button = toggles.filter((b) => isOpen(b) && (b === focus || panelOf(b).contains(focus))).pop();
    if (button) {
      setOpen(button, false);
      button.focus();
    }
  });

  // A dropdown or sub-menu lives in its button's list item; focus or a click outside that item closes it
  // (so opening another sub-menu closes the first).
  toggles.filter((button) => button.matches('.uc-header__dropdown-toggle, .uc-header__nav-toggle')).forEach((button) => {
    const item = button.parentElement;
    item.addEventListener('focusout', (event) => {
      if (isOpen(button) && event.relatedTarget && !item.contains(event.relatedTarget)) setOpen(button, false);
    });
    document.addEventListener('click', (event) => {
      if (isOpen(button) && !item.contains(event.target)) setOpen(button, false);
    });
  });

  // Sub-menu tabs: choosing one shows its panel and hides the others'.
  document.querySelectorAll('.uc-header__mega-tablist').forEach((list) => {
    const tabs = [...list.querySelectorAll('button.uc-header__mega-tab')];
    const choose = (chosen) => tabs.forEach((tab) => {
      tab.setAttribute('aria-expanded', String(tab === chosen));
      panelOf(tab).hidden = tab !== chosen;
    });
    choose(tabs.find((tab) => tab.getAttribute('aria-expanded') === 'true') || tabs[0]);
    tabs.forEach((tab) => tab.addEventListener('click', () => choose(tab)));
  });
})();
