(function(){
  var HEARTFIRST_LOGO = ''
    + '<svg class="brand-logo" aria-hidden="true" fill="none" height="32" viewBox="0 0 100 100" width="32">'
    + '<path d="M50 85 C50 85 8 55 8 33 C8 18 18 10 29 10 C38 10 45 16 50 22 C50 22 50 85 50 85Z" fill="#102A43"></path>'
    + '<path d="M50 85 C50 85 92 55 92 33 C92 18 82 10 71 10 C62 10 55 16 50 22 C50 22 50 85 50 85Z" fill="#C0392B"></path>'
    + '<polyline fill="none" points="20,42 30,42 36,28 42,55 47,38 53,38 58,38 64,28 70,55 75,38 81,42" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.5"></polyline>'
    + '</svg>';

  var RISK_ATLAS_HOME = 'https://heartfirst.shyntesy.com/risks/';
  var HEARTFIRST_HOME = 'https://heartfirst.shyntesy.com/';
  var SHYNTESY_FUNNEL_HOME = 'https://shyntesy.com/';
  var LEGAL_HOME = 'https://legal.shyntesy.com/';

  var FULL_NAV = [
    ['HeartFirst', HEARTFIRST_HOME],
    ['Risks', RISK_ATLAS_HOME],
    ['Products', SHYNTESY_FUNNEL_HOME],
    ['Toolkit','https://heartfirst.shyntesy.com/toolkit/'],
    ['Glossary','https://heartfirst.shyntesy.com/glossary/'],
    ['Research','https://heartfirst.shyntesy.com/research/'],
    ['Articles','https://heartfirst.shyntesy.com/articles/'],
    ['Briefings','https://heartfirst.shyntesy.com/briefings/'],
    ['Lp(a)','https://heartfirst.shyntesy.com/lpa/'],
    ['Legals', LEGAL_HOME]
  ];

  function renderTopbar(container, options){
    options = options || {};
    container = typeof container === 'string' ? document.getElementById(container) : container;
    if(!container) return;
    var topic = options.topic || (document.body && document.body.dataset ? document.body.dataset.atlasTopic : '') || 'Risk Atlas';
    var menuLinks = FULL_NAV.map(function(item){ return '<a href="' + item[1] + '">' + item[0] + '</a>'; }).join('');
    container.className = container.className || 'topbar';
    container.setAttribute('aria-label', 'Site header');
    container.innerHTML = ''
      + '<div class="topbar-inner">'
      + '<a class="brand" href="' + RISK_ATLAS_HOME + '" aria-label="HeartFirst Risk Atlas">'
      + HEARTFIRST_LOGO
      + '<div><div>HeartFirst Risk Atlas</div><small id="atlasTopicLabel">' + escapeHtml(topic) + '</small></div>'
      + '</a>'
      + '<div class="top-actions">'
      + '<a class="pill optional-link" href="' + HEARTFIRST_HOME + '">HeartFirst</a>'
      + '<a class="pill" href="' + SHYNTESY_FUNNEL_HOME + '">Products</a>'
      + '<a class="pill optional-link" href="https://heartfirst.shyntesy.com/glossary/">Glossary</a>'
      + '<a class="pill optional-link" href="' + LEGAL_HOME + '">Legals</a>'
      + '<button id="themeBtn" class="pill theme-toggle" type="button" aria-label="Switch colour theme">Dark</button>'
      + '<button id="menuBtn" class="pill menu-btn" type="button" aria-controls="siteMenu" aria-expanded="false" aria-label="Open navigation menu">'
      + '<span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span><span class="sr-only">Menu</span>'
      + '</button>'
      + '</div></div>'
      + '<div id="siteMenuBackdrop" class="site-menu-backdrop" aria-hidden="true"></div>'
      + '<nav id="siteMenu" class="site-menu" aria-label="HeartFirst navigation" aria-hidden="true">' + menuLinks + '</nav>';
  }

  function setInitialTheme(){
    try{
      var t = localStorage.getItem('hf-theme');
      if(t === 'dark' || t === 'light'){
        document.documentElement.setAttribute('data-theme', t);
      }else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
        document.documentElement.setAttribute('data-theme', 'dark');
      }else{
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }catch(e){
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function currentTheme(){
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function syncThemeLabel(themeBtn){
    if(!themeBtn) return;
    var active = currentTheme();
    var next = active === 'dark' ? 'Light' : 'Dark';
    themeBtn.textContent = next;
    themeBtn.setAttribute('aria-label', active === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.setAttribute('title', active === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function initThemeToggle(){
    var themeBtn = document.getElementById('themeBtn');
    if(!themeBtn || themeBtn.dataset.hfThemeBound === 'true') return;
    themeBtn.dataset.hfThemeBound = 'true';
    syncThemeLabel(themeBtn);
    themeBtn.addEventListener('click', function(){
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try{ localStorage.setItem('hf-theme', next); }catch(e){}
      syncThemeLabel(themeBtn);
    });
  }



  function initMenuToggle(){
    var menuBtn = document.getElementById('menuBtn');
    var menu = document.getElementById('siteMenu');
    var backdrop = document.getElementById('siteMenuBackdrop');
    if(!menuBtn || !menu || menuBtn.dataset.hfMenuBound === 'true') return;
    menuBtn.dataset.hfMenuBound = 'true';

    function menuLinks(){ return Array.prototype.slice.call(menu.querySelectorAll('a')); }

    function setMenu(open, returnFocus){
      document.body.classList.toggle('atlas-menu-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if(backdrop){ backdrop.setAttribute('aria-hidden', open ? 'false' : 'true'); }
      menuLinks().forEach(function(a){
        if(open){ a.removeAttribute('tabindex'); }
        else{ a.setAttribute('tabindex','-1'); }
      });
      if(!open && returnFocus){ menuBtn.focus(); }
    }

    setMenu(false, false);

    menuBtn.addEventListener('click', function(){
      setMenu(!document.body.classList.contains('atlas-menu-open'), false);
    });

    if(backdrop){
      backdrop.addEventListener('click', function(){ setMenu(false, false); });
    }

    // Robust outside-click close. This is deliberately document-level rather
    // than relying only on the backdrop, because sticky/backdrop-filter
    // header contexts can stop a fixed backdrop from behaving consistently
    // across browsers and embedding contexts.
    document.addEventListener('pointerdown', function(e){
      if(!document.body.classList.contains('atlas-menu-open')) return;
      if(menu.contains(e.target) || menuBtn.contains(e.target)) return;
      setMenu(false, false);
    }, true);

    menuLinks().forEach(function(a){
      a.addEventListener('click', function(){ setMenu(false, false); });
    });

    document.addEventListener('keydown', function(e){
      if(!document.body.classList.contains('atlas-menu-open')) return;
      if(e.key === 'Escape'){
        e.preventDefault();
        setMenu(false, true);
        return;
      }
      if(e.key !== 'Tab') return;
      var focusable = [menuBtn].concat(menuLinks().filter(function(a){ return a.getAttribute('tabindex') !== '-1'; }));
      if(!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault();
        last.focus();
      }else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault();
        first.focus();
      }
    });
  }



  var RISK_ITEMS = [
    { slug:'plaque', label:'Plaque', desc:'What plaque is, what it contains, and how it narrows an artery.' },
    { slug:'inflammation', label:'Inflammation', desc:'How inflammation can affect cardiovascular risk and plaque behaviour.' },
    { slug:'rupture', label:'Rupture', desc:'How the fibrous cap over a plaque can break and expose plaque contents.' },
    { slug:'clot', label:'Clot', desc:'How a clot can form at a rupture site and reduce blood flow.' },
    { slug:'cascade', label:'Cascade', desc:'How plaque, inflammation, rupture, and clot can connect in an event pathway.' },
    { slug:'heart-attack', label:'Heart attack', desc:'How a clot or blockage can cut blood flow to heart muscle.' },
    { slug:'stroke', label:'Stroke', desc:'How a clot or blockage can cut blood flow to the brain.' },
    { slug:'valve-calcification', label:'Valve calcification', desc:'How calcium can build up on the aortic valve.' },
    { slug:'aortic-stenosis', label:'Aortic stenosis', desc:'How a stiff, narrowed aortic valve can strain the heart.' }
  ];

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g, function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
    });
  }

  function currentSlugFromPath(pathname){
    var path = String(pathname || window.location.pathname || '').toLowerCase();
    for(var i=0;i<RISK_ITEMS.length;i++){
      if(path.indexOf('/' + RISK_ITEMS[i].slug + '/') !== -1 || path.endsWith('/' + RISK_ITEMS[i].slug)){
        return RISK_ITEMS[i].slug;
      }
    }
    return '';
  }

  function buildSidebar(containerId, currentPath, options){
    options = options || {};
    var container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if(!container) return;
    var activeSlug = options.active || currentSlugFromPath(currentPath);
    var baseHref = options.baseHref;
    if(!baseHref){
      baseHref = activeSlug ? '../' : './';
    }
    var title = options.title || 'Risk Atlas';
    var html = '<h2 id="nav-h" class="nav-title">' + escapeHtml(title) + '</h2>';
    html += '<div class="risk-list">';
    html += RISK_ITEMS.map(function(item){
      var active = item.slug === activeSlug;
      var inner = '<span class="risk-dot" aria-hidden="true"></span>'
        + '<div><strong>' + escapeHtml(item.label) + '</strong>'
        + '<span>' + escapeHtml(item.desc) + (item.soon ? '<br><em class="coming-pill">Coming soon</em>' : '') + '</span></div>';
      if(item.soon){
        return '<div class="risk-item" aria-disabled="true">' + inner + '</div>';
      }
      var href = active ? './' : (baseHref + item.slug + '/');
      var cls = 'risk-item' + (active ? ' active' : '');
      var aria = active ? ' aria-current="page"' : '';
      return '<a class="' + cls + '" href="' + href + '"' + aria + '>' + inner + '</a>';
    }).join('');
    html += '</div>';
    container.innerHTML = html;
  }

  function renderFooter(container){
    container = typeof container === 'string' ? document.getElementById(container) : container;
    if(!container) return;
    container.innerHTML = ''
      + '<div><strong>HeartFirst Risk Atlas</strong> is a visual education system from HeartFirst by Shyntesy.</div>'
      + '<div style="margin-top:8px">'
      + '<a href="' + HEARTFIRST_HOME + '">HeartFirst</a> · '
      + '<a href="https://heartfirst.shyntesy.com/about/">About</a> · '
      + '<a href="' + RISK_ATLAS_HOME + '">Risks</a> · '
      + '<a href="' + SHYNTESY_FUNNEL_HOME + '">Products</a> · '
      + '<a href="https://heartfirst.shyntesy.com/toolkit/">Toolkit</a> · '
      + '<a href="https://heartfirst.shyntesy.com/glossary/">Glossary</a> · '
      + '<a href="https://heartfirst.shyntesy.com/research/">Research</a> · '
      + '<a href="https://heartfirst.shyntesy.com/articles/">Articles</a> · '
      + '<a href="https://heartfirst.shyntesy.com/briefings/">Briefings</a> · '
      + '<a href="https://heartfirst.shyntesy.com/lpa/">Lp(a)</a>'
      + '</div>'
      + '<div style="margin-top:8px">'
      + '<a href="' + LEGAL_HOME + '">Legal</a> · '
      + '<a href="https://legal.shyntesy.com/disclaimer/">Disclaimer</a> · '
      + '<a href="https://legal.shyntesy.com/terms/">Terms</a> · '
      + '<a href="https://legal.shyntesy.com/privacy/">Privacy</a> · '
      + '<a href="https://legal.shyntesy.com/cookies/">Cookies</a> · '
      + '<a href="https://legal.shyntesy.com/refunds/">Refunds</a> · '
      + '<a href="https://legal.shyntesy.com/accessibility/">Accessibility</a> · '
      + '<a href="https://legal.shyntesy.com/contact/">Contact</a>'
      + '</div>';
  }

  function setTopicLabel(label){
    var el = document.getElementById('atlasTopicLabel');
    if(el && label){ el.textContent = label; }
  }

  function initShellControls(){
    initThemeToggle();
    initMenuToggle();
    if(document.body && document.body.dataset && document.body.dataset.atlasTopic){
      setTopicLabel(document.body.dataset.atlasTopic);
    }
  }

  function setSliderValueText(slider, value, stageTitle){
    if(!slider) return;
    slider.setAttribute('aria-valuetext', String(value) + ', ' + String(stageTitle || 'Current stage'));
  }

  function allowMotion(){
    return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function ease(t){ return t<.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }
  function pct(v){ return clamp(v,0,100)/100; }

  setInitialTheme();
  window.HFAtlas = Object.assign(window.HFAtlas || {}, {
    RISK_ITEMS: RISK_ITEMS,
    RISK_ATLAS_HOME: RISK_ATLAS_HOME,
    HEARTFIRST_HOME: HEARTFIRST_HOME,
    SHYNTESY_FUNNEL_HOME: SHYNTESY_FUNNEL_HOME,
    LEGAL_HOME: LEGAL_HOME,
    renderTopbar: renderTopbar,
    currentTheme: currentTheme,
    initThemeToggle: initThemeToggle,
    initMenuToggle: initMenuToggle,
    initShellControls: initShellControls,
    buildSidebar: buildSidebar,
    setTopicLabel: setTopicLabel,
    renderFooter: renderFooter,
    setSliderValueText: setSliderValueText,
    allowMotion: allowMotion,
    clamp: clamp,
    lerp: lerp,
    ease: ease,
    pct: pct
  });
})();
