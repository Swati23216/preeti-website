/* =========================================================
   Preeti Janawade — Bridal & Party Makeup Artist
   script.js — all site interactivity
   ========================================================= */
(function () {
  'use strict';

  // ---------------- CONFIG ----------------
  // Edit this if Preeti confirms a different UPI ID linked to her PhonePe number.
  const UPI_ID = "9019672643@ybl";
  const PAYEE_NAME = "Preeti Janawade";
  const WHATSAPP_NUMBER = "919019672643";

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- loading screen ---------------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => loader.classList.add('hidden'), 500);
  });

  /* ---------------- dark mode ---------------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = (() => {
    try { return localStorage.getItem('pj-theme'); } catch (e) { return null; }
  })();
  if (savedTheme === 'dark') root.setAttribute('data-theme', 'dark');

  themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      try { localStorage.setItem('pj-theme', 'light'); } catch (e) {}
    } else {
      root.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('pj-theme', 'dark'); } catch (e) {}
    }
  });

  /* ---------------- header scroll state + scroll progress + back-to-top ---------------- */
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('scrollProgressBar');
  const backTop = document.getElementById('backTop');

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    backTop.classList.toggle('show', y > 600);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------------- mobile nav ---------------- */
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  const navScrim = document.getElementById('navScrim');

  function closeNav() {
    siteNav.classList.remove('open');
    navToggle.classList.remove('open');
    navScrim.classList.remove('show');
  }
  navToggle.addEventListener('click', () => {
    const willOpen = !siteNav.classList.contains('open');
    siteNav.classList.toggle('open', willOpen);
    navToggle.classList.toggle('open', willOpen);
    navScrim.classList.toggle('show', willOpen);
  });
  navScrim.addEventListener('click', closeNav);
  document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeNav));

  /* ---------------- cursor glow (desktop only) ---------------- */
  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.classList.add('active');
    });
    document.addEventListener('mouseleave', () => glow.classList.remove('active'));
  }

  /* ---------------- hero floating particles ---------------- */
  const particlesBox = document.getElementById('heroParticles');
  if (particlesBox && !reduceMotion) {
    const count = window.innerWidth < 700 ? 12 : 26;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      const size = 2 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.bottom = '-10px';
      p.style.animationDuration = (10 + Math.random() * 14) + 's';
      p.style.animationDelay = (Math.random() * 12) + 's';
      particlesBox.appendChild(p);
    }
  }

  /* ---------------- scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------------- animated counters ---------------- */
  const counters = document.querySelectorAll('.count');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterIO.observe(el));

  /* ---------------- button ripple effect ---------------- */
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------------- gallery filter ---------------- */
  const filterBtns = document.querySelectorAll('.g-filter');
  const galleryItems = document.querySelectorAll('.g-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.getAttribute('data-cat') === filter;
        item.classList.toggle('hide', !match);
      });
    });
  });

  /* ---------------- lightbox ---------------- */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  let lbIndex = 0;

  function visibleItems() {
    return Array.from(galleryItems).filter(i => !i.classList.contains('hide'));
  }
  function openLightbox(item) {
    const items = visibleItems();
    lbIndex = items.indexOf(item);
    renderLightbox();
    lightbox.classList.add('open');
  }
  function renderLightbox() {
    const items = visibleItems();
    if (!items.length) return;
    if (lbIndex < 0) lbIndex = items.length - 1;
    if (lbIndex >= items.length) lbIndex = 0;
    const item = items[lbIndex];
    const bg = item.style.backgroundImage.slice(5, -2);
    lbImg.src = bg;
    lbImg.alt = item.getAttribute('data-caption') || '';
    lbCaption.textContent = item.getAttribute('data-caption') || '';
  }
  galleryItems.forEach(item => item.addEventListener('click', () => openLightbox(item)));
  lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  lbPrev.addEventListener('click', () => { lbIndex--; renderLightbox(); });
  lbNext.addEventListener('click', () => { lbIndex++; renderLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lightbox.classList.remove('open');
    if (e.key === 'ArrowLeft') { lbIndex--; renderLightbox(); }
    if (e.key === 'ArrowRight') { lbIndex++; renderLightbox(); }
  });

  /* ---------------- testimonial slider ---------------- */
  const tTrack = document.getElementById('tTrack');
  const tSlides = document.querySelectorAll('.testimonial-card');
  const tDotsBox = document.getElementById('tDots');
  let tIndex = 0;
  let tTimer;

  tSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => { goToSlide(i); restartAutoplay(); });
    tDotsBox.appendChild(dot);
  });
  const tDots = tDotsBox.querySelectorAll('button');

  function goToSlide(i) {
    tIndex = (i + tSlides.length) % tSlides.length;
    tTrack.style.transform = `translateX(-${tIndex * 100}%)`;
    tDots.forEach(d => d.classList.remove('active'));
    tDots[tIndex].classList.add('active');
  }
  function restartAutoplay() {
    clearInterval(tTimer);
    if (reduceMotion) return;
    tTimer = setInterval(() => goToSlide(tIndex + 1), 5000);
  }
  restartAutoplay();

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });

  /* ---------------- booking form -> WhatsApp (with validation + popup) ---------------- */
  const bookingForm = document.getElementById('bookingForm');
  const bookingPopup = document.getElementById('bookingPopup');
  const popupClose = document.getElementById('popupClose');

  function setFieldValid(fieldWrap, valid) {
    fieldWrap.classList.toggle('invalid', !valid);
  }

  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameInput = document.getElementById('bName');
    const phoneInput = document.getElementById('bPhone');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const service = document.getElementById('bService').value;
    const date = document.getElementById('bDate').value;
    const notes = document.getElementById('bNotes').value.trim();

    let valid = true;
    const nameValid = name.length >= 2;
    setFieldValid(nameInput.closest('.form-field'), nameValid);
    if (!nameValid) valid = false;

    const phoneValid = /^[0-9]{10}$/.test(phone.replace(/\D/g, '').slice(-10)) && phone.replace(/\D/g, '').length >= 10;
    setFieldValid(phoneInput.closest('.form-field'), phoneValid);
    if (!phoneValid) valid = false;

    if (!valid) return;

    let msg = `Hi Preeti, I'd like to book an appointment.%0A`;
    msg += `Name: ${encodeURIComponent(name)}%0A`;
    msg += `Phone: ${encodeURIComponent(phone)}%0A`;
    msg += `Service: ${encodeURIComponent(service)}%0A`;
    if (date) msg += `Preferred Date: ${encodeURIComponent(date)}%0A`;
    if (notes) msg += `Notes: ${encodeURIComponent(notes)}%0A`;

    bookingPopup.classList.add('open');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  });

  popupClose.addEventListener('click', () => bookingPopup.classList.remove('open'));
  bookingPopup.addEventListener('click', (e) => { if (e.target === bookingPopup) bookingPopup.classList.remove('open'); });

  ['bName', 'bPhone'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () {
      this.closest('.form-field').classList.remove('invalid');
    });
  });

  /* ---------------- newsletter (front-end only) ---------------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'Subscribed ✓';
      newsletterForm.querySelector('input').value = '';
      setTimeout(() => { btn.textContent = original; }, 2500);
    });
  }

  /* ---------------- UPI payment ---------------- */
  function buildUpiLink(amount, scheme = 'upi') {
    const prefix = scheme === 'phonepe' ? 'phonepe://pay?' : 'upi://pay?';
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: PAYEE_NAME,
      cu: 'INR',
      tn: 'Makeup Service Payment'
    });
    if (amount && Number(amount) > 0) params.set('am', amount);
    return `${prefix}${params.toString()}`;
  }

  function launchUpiPayment(amount) {
    const phonepeLink = buildUpiLink(amount, 'phonepe');
    const upiLink = buildUpiLink(amount, 'upi');
    window.location.href = phonepeLink;
    setTimeout(() => { window.location.href = upiLink; }, 1200);
  }

  function renderQr(amount) {
    const box = document.getElementById('qrcode');
    if (!box || typeof QRCode === 'undefined') return;
    box.innerHTML = '';
    // eslint-disable-next-line no-undef
    new QRCode(box, {
      text: buildUpiLink(amount),
      width: 180,
      height: 180,
      colorDark: "#2E0716",
      colorLight: "#FFFBF6"
    });
  }

  const amountInput = document.getElementById('payAmount');
  const upiBtn = document.getElementById('upiPayBtn');
  const amountDisplay = document.getElementById('payAmountDisplay');

  function refreshPayLink() {
    const amt = amountInput.value;
    upiBtn.setAttribute('href', buildUpiLink(amt));
    renderQr(amt);
    if (amountDisplay) {
      amountDisplay.textContent = '₹' + (amt ? Number(amt).toLocaleString('en-IN') : '0');
      amountDisplay.classList.add('bump');
      setTimeout(() => amountDisplay.classList.remove('bump'), 200);
    }
  }
  amountInput.addEventListener('input', refreshPayLink);
  upiBtn.addEventListener('click', function (e) {
    e.preventDefault();
    launchUpiPayment(amountInput.value);
  });

  window.addEventListener('load', () => {
    refreshPayLink();
  });

  /* ---------------- footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();