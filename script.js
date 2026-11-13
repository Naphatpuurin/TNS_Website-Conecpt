(function () {
  'use strict';

  const siteHeader = document.getElementById('siteHeader');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Mobile Drawer Controls
  const mobileMenuOpenBtn = document.getElementById('mobileMenuOpenBtn');
  const mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  const accordionButtons = document.querySelectorAll('.mobile-accordion-btn');

  // Filter & Search Controls
  const filterTabs = document.querySelectorAll('.filter-tab');
  const contentSections = document.querySelectorAll('.content-section');
  const searchInput = document.getElementById('newsSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const resetSearchBtn = document.getElementById('resetSearchBtn');
  const emptySearchState = document.getElementById('emptySearchState');

  let activeFilter = 'all';

  /* ------------------------------------------------------------------------
     Sticky Header & Back-to-Top Scroll Behavior
     ------------------------------------------------------------------------ */
  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', scrollY > 12);
    }
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('is-visible', scrollY > 360);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     Mobile Drawer & Accordion Submenus
     ------------------------------------------------------------------------ */
  function openMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerBackdrop) return;
    mobileDrawer.classList.add('is-open');
    mobileDrawerBackdrop.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (mobileMenuOpenBtn) mobileMenuOpenBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerBackdrop) return;
    mobileDrawer.classList.remove('is-open');
    mobileDrawerBackdrop.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (mobileMenuOpenBtn) mobileMenuOpenBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuOpenBtn) {
    mobileMenuOpenBtn.addEventListener('click', openMobileDrawer);
  }
  if (mobileMenuCloseBtn) {
    mobileMenuCloseBtn.addEventListener('click', closeMobileDrawer);
  }
  if (mobileDrawerBackdrop) {
    mobileDrawerBackdrop.addEventListener('click', closeMobileDrawer);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeMobileDrawer();
    }
  });

  accordionButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const group = btn.closest('.mobile-nav-group');
      const submenu = group ? group.querySelector('.mobile-submenu') : null;
      if (!submenu) return;
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      submenu.classList.toggle('is-open', !isExpanded);
    });
  });

  /* ------------------------------------------------------------------------
     Category Filtering & Live Search
     ------------------------------------------------------------------------ */
  function applyFilters() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    if (searchClearBtn) {
      searchClearBtn.classList.toggle('is-visible', query.length > 0);
    }

    let totalVisibleItems = 0;

    contentSections.forEach(function (section) {
      const sectionKey = section.getAttribute('data-section');
      const matchesTab = activeFilter === 'all' || activeFilter === sectionKey;

      if (!matchesTab) {
        section.classList.add('is-hidden');
        return;
      }

      let sectionVisibleCount = 0;
      const cards = section.querySelectorAll('.post-card, .video-card');

      cards.forEach(function (card) {
        const text = card.textContent.toLowerCase();
        const matchesQuery = !query || text.includes(query);
        card.classList.toggle('is-hidden', !matchesQuery);
        if (matchesQuery) {
          sectionVisibleCount += 1;
          totalVisibleItems += 1;
        }
      });

      const videoBlock = section.querySelector('.studio-video-block');
      if (videoBlock) {
        const visibleVideos = videoBlock.querySelectorAll('.video-card:not(.is-hidden)').length;
        videoBlock.style.display = visibleVideos > 0 ? '' : 'none';
      }

      section.classList.toggle('is-hidden', sectionVisibleCount === 0);
    });

    if (emptySearchState) {
      emptySearchState.classList.toggle('is-visible', totalVisibleItems === 0);
    }
  }

  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activeFilter = tab.getAttribute('data-filter') || 'all';
      filterTabs.forEach(function (btn) {
        const isCurrent = btn === tab;
        btn.classList.toggle('is-active', isCurrent);
        btn.setAttribute('aria-selected', String(isCurrent));
      });
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  function resetAllFilters() {
    if (searchInput) searchInput.value = '';
    activeFilter = 'all';
    filterTabs.forEach(function (btn) {
      const isAll = btn.getAttribute('data-filter') === 'all';
      btn.classList.toggle('is-active', isAll);
      btn.setAttribute('aria-selected', String(isAll));
    });
    applyFilters();
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      applyFilters();
      if (searchInput) searchInput.focus();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', resetAllFilters);
  }
})();
