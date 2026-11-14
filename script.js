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

  /* ------------------------------------------------------------------------
     Shared Image Lightbox (Infographics, Charts, Galleries)
     ------------------------------------------------------------------------ */
  let lightboxEl = null;

  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    const backdrop = document.createElement('div');
    backdrop.className = 'lightbox-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'ดูภาพขยาย');
    backdrop.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="ปิดภาพขยาย">✕</button>' +
      '<div class="lightbox-frame">' +
      '<img src="" alt="" />' +
      '<div class="lightbox-caption"></div>' +
      '</div>';
    document.body.appendChild(backdrop);

    const closeBtn = backdrop.querySelector('.lightbox-close');
    function closeLightbox() {
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('is-open')) closeLightbox();
    });

    lightboxEl = backdrop;
    return backdrop;
  }

  document.addEventListener('click', function (e) {
    const img = e.target.closest('img[data-lightbox="true"], .figure-card img');
    if (!img) return;
    const box = ensureLightbox();
    const boxImg = box.querySelector('img');
    const caption = box.querySelector('.lightbox-caption');
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt || '';
    const fig = img.closest('figure, .figure-card');
    const figCap = fig ? fig.querySelector('figcaption, .figure-caption') : null;
    caption.textContent = img.getAttribute('data-caption') || (figCap ? figCap.textContent.trim() : '') || img.alt || '';
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });

  /* ------------------------------------------------------------------------
     Shared Tab Groups (e.g., Kadence-style Staff/Student Tabs, O-NET Tabs)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-tab-group]').forEach(function (group) {
    const buttons = group.querySelectorAll('[data-tab-target]');
    const panels = group.querySelectorAll('[data-tab-panel]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = btn.getAttribute('data-tab-target');
        buttons.forEach(function (b) {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', String(active));
        });
        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-tab-panel') !== target;
        });
      });
    });
  });

  /* ------------------------------------------------------------------------
     Lazy Inline PDF Preview Toggle
     ------------------------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-pdf-toggle]');
    if (!btn) return;
    const url = btn.getAttribute('data-pdf-toggle');
    const card = btn.closest('.doc-download-card');
    const slot = card ? card.querySelector('.doc-embed-slot') : null;
    if (!slot || !url) return;

    const isHidden = slot.hidden;
    slot.hidden = !isHidden;
    if (isHidden && !slot.querySelector('iframe')) {
      slot.innerHTML = '<iframe class="pdf-iframe" src="' + url + '" title="ตัวอย่างเอกสาร PDF"></iframe>';
    }
    btn.textContent = isHidden ? 'ซ่อนตัวอย่างเอกสาร' : 'แสดงตัวอย่างเอกสาร';
  });

  /* ------------------------------------------------------------------------
     Inner Page Live Search & Pill Filter (Staff, Awards, Parents)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    const pills = root.querySelectorAll('[data-filter-pill]');
    const searchEl = root.querySelector('[data-filter-search]');
    const items = root.querySelectorAll('[data-filter-item]');
    const groupBlocks = root.querySelectorAll('[data-filter-group]');
    const countEl = root.querySelector('[data-filter-count]');
    const emptyEl = root.querySelector('[data-filter-empty]');
    let currentCat = 'all';

    function runFilter() {
      const q = (searchEl ? searchEl.value : '').trim().toLowerCase();
      let visible = 0;

      items.forEach(function (item) {
        const itemCat = item.getAttribute('data-filter-cat') || '';
        const catOk = currentCat === 'all' || itemCat === currentCat || itemCat.split('|').includes(currentCat);
        const qOk = !q || item.textContent.toLowerCase().includes(q);
        const show = catOk && qOk;
        item.hidden = !show;
        if (show) visible += 1;
      });

      groupBlocks.forEach(function (grp) {
        const grpCat = grp.getAttribute('data-filter-group');
        const visibleInGrp = grp.querySelectorAll('[data-filter-item]:not([hidden])').length;
        grp.hidden = (currentCat !== 'all' && grpCat !== currentCat) || visibleInGrp === 0;
      });

      if (countEl) countEl.textContent = String(visible);
      if (emptyEl) emptyEl.hidden = visible > 0;
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        currentCat = pill.getAttribute('data-filter-pill') || 'all';
        pills.forEach(function (p) {
          p.classList.toggle('is-active', p === pill);
        });
        runFilter();
      });
    });

    if (searchEl) {
      searchEl.addEventListener('input', runFilter);
    }
  });

  /* ------------------------------------------------------------------------
     Post Archive Renderer (news.html, activities.html, procurement.html)
     ------------------------------------------------------------------------ */
  const archiveHost = document.getElementById('archivePostsRoot');
  if (archiveHost) {
    initArchivePage(archiveHost);
  }

  function initArchivePage(host) {
    const mode = host.getAttribute('data-archive-category') || 'all';
    const grid = document.getElementById('archiveGrid');
    const searchEl = document.getElementById('archiveSearchInput');
    const yearTabsWrap = document.getElementById('archiveYearTabs');
    const statsEl = document.getElementById('archiveResultCount');
    const emptyEl = document.getElementById('archiveEmptyState');
    const loadMoreBtn = document.getElementById('archiveLoadMoreBtn');
    const loadMoreWrap = document.getElementById('archiveLoadMoreWrap');

    const PAGE_SIZE = 20;
    let activeYear = 'all';
    let shownLimit = PAGE_SIZE;
    let allPosts = [];

    const TAG_MAP = {
      pr: { cls: 'post-tag--pr', label: 'ข่าวประชาสัมพันธ์', cta: 'อ่านประกาศ →' },
      activity: { cls: 'post-tag--activity', label: 'ภาพกิจกรรม TNS', cta: 'ดูภาพกิจกรรม →' },
      procurement: { cls: 'post-tag--procurement', label: 'จัดซื้อจัดจ้าง', cta: 'อ่านประกาศ →' },
      general: { cls: 'post-tag--pr', label: 'ข้อมูลทั่วไป', cta: 'อ่านรายละเอียด →' }
    };

    function matchesMode(post) {
      if (mode === 'all') return true;
      if (mode === 'pr-all') return post.primaryCategory === 'pr' || post.primaryCategory === 'general';
      return post.primaryCategory === mode;
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function render() {
      const q = (searchEl ? searchEl.value : '').trim().toLowerCase();
      const filtered = allPosts.filter(function (p) {
        if (!matchesMode(p)) return false;
        if (activeYear !== 'all' && p.yearBe !== activeYear) return false;
        if (q && !(p.title + ' ' + p.excerpt + ' ' + p.dateTh).toLowerCase().includes(q)) return false;
        return true;
      });

      const slice = filtered.slice(0, shownLimit);
      if (statsEl) statsEl.textContent = String(filtered.length);
      if (emptyEl) emptyEl.hidden = filtered.length > 0;

      grid.innerHTML = slice
        .map(function (p) {
          const tag = TAG_MAP[p.primaryCategory] || TAG_MAP.general;
          const squareClass = p.primaryCategory === 'pr' || p.primaryCategory === 'general' ? ' post-thumb-wrap--square' : '';
          const pdfPill = p.pdfLinks && p.pdfLinks.length > 0 ? '<span class="badge-role" style="margin-top:8px;">📄 แนบ PDF (' + p.pdfLinks.length + ')</span>' : '';
          return (
            '<a href="article.html?id=' + p.id + '" class="post-card">' +
            '<div class="post-thumb-wrap' + squareClass + '">' +
            '<img src="' + escapeHtml(p.thumb) + '" alt="' + escapeHtml(p.title) + '" loading="lazy" />' +
            '<span class="post-tag ' + tag.cls + '">' + tag.label + '</span>' +
            '</div>' +
            '<div class="post-body">' +
            '<div>' +
            '<div class="post-meta">' + escapeHtml(p.dateTh) + ' (พ.ศ. ' + escapeHtml(p.yearBe) + ')</div>' +
            '<h3 class="post-title">' + escapeHtml(p.title) + '</h3>' +
            pdfPill +
            '</div>' +
            '<span class="post-read-more">' + tag.cta + '</span>' +
            '</div>' +
            '</a>'
          );
        })
        .join('');

      if (loadMoreWrap && loadMoreBtn) {
        loadMoreWrap.hidden = slice.length >= filtered.length;
        loadMoreBtn.textContent = 'โหลดเพิ่มเติม (' + (filtered.length - slice.length) + ' รายการ)';
      }
    }

    fetch('data/posts.json')
      .then(function (r) { return r.json(); })
      .then(function (posts) {
        allPosts = posts;
        const years = Array.from(new Set(posts.filter(matchesMode).map(function (p) { return p.yearBe; }).filter(Boolean))).sort().reverse();
        if (yearTabsWrap) {
          yearTabsWrap.innerHTML =
            '<button type="button" class="pill-tab is-active" data-year="all">ทุกปี พ.ศ.</button>' +
            years.map(function (y) {
              return '<button type="button" class="pill-tab" data-year="' + y + '">พ.ศ. ' + y + '</button>';
            }).join('');
          yearTabsWrap.querySelectorAll('[data-year]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              activeYear = btn.getAttribute('data-year') || 'all';
              shownLimit = PAGE_SIZE;
              yearTabsWrap.querySelectorAll('[data-year]').forEach(function (b) {
                b.classList.toggle('is-active', b === btn);
              });
              render();
            });
          });
        }
        render();
      })
      .catch(function () {
        if (emptyEl) {
          emptyEl.hidden = false;
          emptyEl.textContent = 'ไม่สามารถโหลดรายการข่าวสารได้ กรุณาเปิดผ่านเว็บเซิร์ฟเวอร์ (npm start)';
        }
      });

    if (searchEl) {
      searchEl.addEventListener('input', function () {
        shownLimit = PAGE_SIZE;
        render();
      });
    }
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        shownLimit += PAGE_SIZE;
        render();
      });
    }
  }

  /* ------------------------------------------------------------------------
     Single Article Reader (article.html?id=<post_id>)
     ------------------------------------------------------------------------ */
  const articleHost = document.getElementById('articleDetailRoot');
  if (articleHost) {
    initArticleReader(articleHost);
  }

  function initArticleReader(host) {
    const params = new URLSearchParams(window.location.search);
    const idParam = Number(params.get('id'));

    const BACK_ROUTES = {
      pr: { href: 'news.html', label: 'ข่าวประชาสัมพันธ์' },
      general: { href: 'news.html', label: 'ข่าวประชาสัมพันธ์และข้อมูลทั่วไป' },
      activity: { href: 'activities.html', label: 'ภาพกิจกรรม : TNS Studio' },
      procurement: { href: 'procurement.html', label: 'ข่าวการจัดซื้อจัดจ้าง' }
    };

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    fetch('data/posts.json')
      .then(function (r) { return r.json(); })
      .then(function (posts) {
        const index = posts.findIndex(function (p) { return p.id === idParam; });
        const post = index >= 0 ? posts[index] : posts[0];
        if (!post) {
          host.innerHTML = '<div class="surface-card">ไม่พบบทความที่ต้องการ</div>';
          return;
        }

        const route = BACK_ROUTES[post.primaryCategory] || BACK_ROUTES.pr;
        document.title = post.title + ' – โรงเรียนเตรียมอุดมศึกษาน้อมเกล้า นครราชสีมา';

        const titleEl = document.getElementById('articleHeroTitle');
        const metaEl = document.getElementById('articleHeroMeta');
        const crumbCatEl = document.getElementById('articleBreadcrumbCat');
        const crumbTitleEl = document.getElementById('articleBreadcrumbTitle');

        if (titleEl) titleEl.textContent = post.title;
        if (crumbCatEl) {
          crumbCatEl.textContent = route.label;
          crumbCatEl.href = route.href;
        }
        if (crumbTitleEl) {
          crumbTitleEl.textContent = post.title.length > 52 ? post.title.slice(0, 49) + '…' : post.title;
        }
        if (metaEl) {
          metaEl.innerHTML =
            '<span class="hero-stat-pill">หมวดหมู่: <strong>' + escapeHtml(post.categoryLabel) + '</strong></span>' +
            '<span class="hero-stat-pill">เผยแพร่: <strong>' + escapeHtml(post.dateTh) + ' (พ.ศ. ' + escapeHtml(post.yearBe) + ')</strong></span>';
        }

        const prevPost = index > 0 ? posts[index - 1] : null;
        const nextPost = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;
        const navCardsHtml =
          '<div class="article-nav-cards">' +
          (prevPost
            ? '<a href="article.html?id=' + prevPost.id + '" class="article-nav-link"><div class="article-nav-label">← บทความที่ใหม่กว่า</div><div class="article-nav-title">' + escapeHtml(prevPost.title) + '</div></a>'
            : '<div></div>') +
          (nextPost
            ? '<a href="article.html?id=' + nextPost.id + '" class="article-nav-link" style="text-align:right;"><div class="article-nav-label">บทความก่อนหน้า →</div><div class="article-nav-title">' + escapeHtml(nextPost.title) + '</div></a>'
            : '<div></div>') +
          '</div>';

        const related = posts
          .filter(function (p) { return p.id !== post.id && p.primaryCategory === post.primaryCategory; })
          .slice(0, 4);

        const relatedHtml = related.length
          ? '<section class="section-block" style="margin-top:40px;"><div class="section-header"><div class="section-title-group"><span class="section-accent-bar"></span><div><h2 class="section-title">ข่าวในหมวดเดียวกัน</h2></div></div><a href="' + route.href + '" class="section-action-link">ดูทั้งหมด →</a></div><div class="cards-grid-4">' +
            related.map(function (r) {
              return (
                '<a href="article.html?id=' + r.id + '" class="post-card">' +
                '<div class="post-thumb-wrap"><img src="' + escapeHtml(r.thumb) + '" alt="' + escapeHtml(r.title) + '" loading="lazy" /></div>' +
                '<div class="post-body"><div><div class="post-meta">' + escapeHtml(r.dateTh) + '</div><h3 class="post-title">' + escapeHtml(r.title) + '</h3></div><span class="post-read-more">อ่านต่อ →</span></div>' +
                '</a>'
              );
            }).join('') +
            '</div></section>'
          : '';

        const hasBodyContent = post.contentHtml && post.contentHtml.replace(/<[^>]+>/g, '').trim().length > 0;
        const fallbackFeature = !hasBodyContent || (post.imageCount === 0 && post.pdfLinks.length === 0)
          ? '<figure style="margin:0 0 22px;text-align:center;"><img src="' + escapeHtml(post.thumb) + '" alt="' + escapeHtml(post.title) + '" data-lightbox="true" style="max-width:420px;margin:0 auto;border-radius:14px;" /></figure>'
          : '';

        host.innerHTML =
          '<article class="article-card">' +
          '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border-subtle);">' +
          '<a href="' + route.href + '" class="btn-doc-preview">← กลับหน้ารวม' + escapeHtml(route.label) + '</a>' +
          '<a href="' + escapeHtml(post.originalUrl) + '" target="_blank" rel="noopener" class="section-action-link">ลิงก์ต้นฉบับ tns.ac.th ↗</a>' +
          '</div>' +
          fallbackFeature +
          '<div class="article-body prose">' + (post.contentHtml || '<p>' + escapeHtml(post.excerpt || post.title) + '</p>') + '</div>' +
          '</article>' +
          navCardsHtml +
          relatedHtml;
      })
      .catch(function () {
        host.innerHTML = '<div class="surface-card">ไม่สามารถโหลดเนื้อหาบทความได้ กรุณาเปิดผ่านเว็บเซิร์ฟเวอร์ (npm start)</div>';
      });
  }
})();
