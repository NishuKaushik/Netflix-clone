// ================= Netflix Clone Interactivity =================

(function () {
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ===== 1) Hero resize for mobile =====
  const main = qs('.main');
  function sizeHero() {
    if (!main) return;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const target = Math.max(520, Math.min(740, vh));
    main.style.height = target + 'px';
    const overlay = qs('.main .box');
    if (overlay) overlay.style.height = target + 'px';
  }
  sizeHero();
  window.addEventListener('resize', sizeHero);

  // ===== 2) Sticky nav background =====
  const nav = qs('nav');
  const SCROLL_BG = 'rgba(0,0,0,0.75)';
  function setNavBg() {
    if (!nav) return;
    if (window.scrollY > 10) {
      nav.style.background = SCROLL_BG;
      nav.style.backdropFilter = 'saturate(120%) blur(6px)';
      nav.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    } else {
      nav.style.background = 'transparent';
      nav.style.backdropFilter = 'none';
      nav.style.borderBottom = 'none';
    }
  }
  setNavBg();
  window.addEventListener('scroll', setNavBg, { passive: true });

  // ===== 3) Lazy load images =====
  qsa('img').forEach(img => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  // ===== 4) FAQ Accordion =====
  const faqAnswers = {
    'What is NetFlix': `Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries and more on thousands of internet-connected devices.`,
    'How much does Netflix cost?': `Plans vary by country and features. In India, Netflix offers multiple plans so you can choose what fits your needs. You can change or cancel anytime.`,
    'What can I watch on Netflix?': `You’ll find movies, series, documentaries, anime, and Netflix Originals across many genres — new titles are added every week.`,
    'Where can I watch?': `Watch anywhere — on your phone, tablet, laptop, or TV. Use the Netflix app to download select titles on mobile devices and watch offline.`
  };

  const faqBoxes = qsa('.faqbox');

  faqBoxes.forEach(box => {
    const span = box.querySelector('span');
    const icon = box.querySelector('svg');

    // Wrap span + icon in header
    const header = document.createElement('div');
    header.className = 'faqbox-header';
    header.appendChild(span);
    header.appendChild(icon);
    box.insertBefore(header, box.firstChild);

    // Add panel for answer
    const panel = document.createElement('div');
    panel.className = 'faq-panel';
    panel.textContent = faqAnswers[span.textContent.trim()] || '...';
    box.appendChild(panel);

    // Toggle accordion
    header.addEventListener('click', () => {
      const isOpen = box.classList.contains('open');

      // Close all
      faqBoxes.forEach(b => {
        b.classList.remove('open');
        b.querySelector('.faq-panel').style.maxHeight = '0';
        b.querySelector('.faq-panel').style.padding = '0 24px';
        b.querySelector('svg').style.transform = 'rotate(0deg)';
      });

      // Open clicked
      if (!isOpen) {
        box.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.padding = '20px 24px 24px';
        icon.style.transform = 'rotate(45deg)';
      }
    });
  });

  // ===== 5) Email validation =====
  const emailInput = qs('.hero input[type="text"]');
  const startBtn = qs('.hero .btn.btn-red');

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  }

  function showMsg(msg, color) {
    let box = qs('.email-msg', emailInput?.parentElement);
    if (!box) {
      box = document.createElement('div');
      box.className = 'email-msg';
      box.style.fontSize = '12px';
      box.style.marginTop = '4px';
      box.style.textAlign = 'center';
      emailInput.parentElement.appendChild(box);
    }
    box.textContent = msg;
    box.style.color = color;
  }

  function handleStart() {
    if (!emailInput) return;
    const val = emailInput.value.trim();
    if (!isValidEmail(val)) {
      showMsg('Please enter a valid email address.', '#ff8080');
      emailInput.style.borderColor = '#ff4d4d';
      return;
    }
    showMsg('Great! Redirecting to signup…', '#9cff9c');
    emailInput.style.borderColor = 'rgba(246,238,238,0.5)';
    setTimeout(() => {
      const faq = qs('.faq');
      if (faq) faq.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  }

  if (startBtn) startBtn.addEventListener('click', handleStart);
  if (emailInput) {
    emailInput.setAttribute('inputmode', 'email');
    emailInput.setAttribute('autocomplete', 'email');
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStart();
      }
    });
    emailInput.addEventListener('input', () => {
      emailInput.style.borderColor = 'rgba(246,238,238,0.5)';
      showMsg('', 'white');
    });
  }

  // ===== 6) Video autoplay on scroll =====
  const videos = qsa('.secImg video');
  if ('IntersectionObserver' in window && videos.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (isIntersecting) {
          target.play().catch(() => {});
        } else {
          target.pause();
        }
      });
    }, { threshold: 0.35 });
    videos.forEach(v => {
      v.muted = true;
      v.playsInline = true;
      io.observe(v);
    });
  } else {
    videos.forEach(v => {
      v.muted = true;
      v.playsInline = true;
      v.play().catch(()=>{});
    });
  }

  // ===== 7) Keyboard focus outline =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('using-keyboard');
  });
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard');
  });
  const style = document.createElement('style');
  style.textContent = `
    body.using-keyboard :focus {
      outline: 2px solid rgba(255,255,255,0.7) !important;
      outline-offset: 2px !important;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);

  // ===== 8) Keep video aligned with images =====
  function syncVideoSizes() {
    qsa('.secImg').forEach(wrapper => {
      const img = qs('img', wrapper);
      const vid = qs('video', wrapper);
      if (img && vid) {
        vid.style.width = img.clientWidth + 'px';
      }
    });
  }
  syncVideoSizes();
  window.addEventListener('resize', syncVideoSizes);

})();