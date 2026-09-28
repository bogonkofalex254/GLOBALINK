/* =========================================================
   GLOBALINK MENTORS — shared script.js
   Every block guards for the elements it needs, so this one
   file can be safely included on every page.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const nav = document.querySelector('.nav');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      nav.classList.toggle('mobile-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        nav.classList.remove('mobile-open');
      });
    });
  }

  /* =========================================================
     HOME HERO SLIDER (3 rotating images)
     ========================================================= */
  const slider = document.querySelector('.slider');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const dotsWrap = slider.querySelector('.slider-dots');
    let current = 0;
    let timer;

    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show slide ${i + 1}`);
        if (i === 0) dot.classList.add('is-active');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    function render() {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('is-active', i === current));
      }
    }
    function goTo(i) {
      current = (i + slides.length) % slides.length;
      render();
      restart();
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function restart() {
      clearInterval(timer);
      timer = setInterval(next, 5000);
    }

    const nextBtn = slider.querySelector('.slider-next');
    const prevBtn = slider.querySelector('.slider-prev');
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    render();
    restart();
  }

  /* =========================================================
     ANIMATED COUNTERS (schools / mentors / mentees)
     ========================================================= */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const duration = 1800;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString();
        }
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(c => observer.observe(c));
  }

  /* =========================================================
     TEAM — modal profiles
     ========================================================= */
  const teamGrid = document.querySelector('[data-team-grid]');
  const modalOverlay = document.querySelector('.modal-overlay');
  if (teamGrid && modalOverlay) {
    const modalPhoto = modalOverlay.querySelector('[data-modal-photo]');
    const modalName = modalOverlay.querySelector('[data-modal-name]');
    const modalRole = modalOverlay.querySelector('[data-modal-role]');
    const modalBio = modalOverlay.querySelector('[data-modal-bio]');

    teamGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.team-card');
      if (!card) return;
      modalPhoto.src = card.dataset.photo;
      modalPhoto.alt = card.dataset.name;
      modalName.textContent = card.dataset.name;
      modalRole.textContent = card.dataset.role;
      modalBio.textContent = card.dataset.bio;
      modalOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });

    const closeModal = () => {
      modalOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ---------- team filter (by department) ---------- */
  const teamFilter = document.querySelector('.team-filter');
  if (teamFilter && teamGrid) {
    teamFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      teamFilter.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const group = btn.dataset.group;
      teamGrid.querySelectorAll('.team-card').forEach(card => {
        card.style.display = (group === 'all' || card.dataset.group === group) ? '' : 'none';
      });
    });
  }

  /* =========================================================
     GALLERY — filter + lightbox
     ========================================================= */
  const galleryGrid = document.querySelector('[data-gallery-grid]');
  const galleryFilter = document.querySelector('.gallery-filter');
  if (galleryFilter && galleryGrid) {
    galleryFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      galleryFilter.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const cat = btn.dataset.cat;
      galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
      });
    });
  }

  const lightbox = document.querySelector('.lightbox');
  if (galleryGrid && lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const items = () => Array.from(galleryGrid.querySelectorAll('.gallery-item')).filter(i => i.style.display !== 'none');
    let idx = 0;

    const open = (item) => {
      const visible = items();
      idx = visible.indexOf(item);
      show();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const show = () => {
      const visible = items();
      const img = visible[idx].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    };
    const close = () => {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    const next = () => { const v = items(); idx = (idx + 1) % v.length; show(); };
    const prev = () => { const v = items(); idx = (idx - 1 + v.length) % v.length; show(); };

    galleryGrid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) open(item);
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-next').addEventListener('click', next);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', prev);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

  /* =========================================================
     DONATE — amount selection + M-Pesa STK push request
     =========================================================
     NOTE ON THE M-PESA INTEGRATION:
     Safaricom's Daraja API requires a server-side call (it
     needs a Consumer Key/Secret and a Passkey that must never
     sit in browser JavaScript). This file therefore POSTs the
     donation details to YOUR backend endpoint, `/api/mpesa/stkpush`,
     which is where the real Daraja "STK Push" request should be
     made. Point MPESA_ENDPOINT below at that backend route once
     it exists. Until then the form will show a friendly error
     instead of pretending to charge anyone.
     ========================================================= */
  const MPESA_ENDPOINT = '/api/mpesa/stkpush';

  const donateForm = document.querySelector('[data-donate-form]');
  if (donateForm) {
    const amountButtons = donateForm.querySelectorAll('.amount-btn');
    const customInput = donateForm.querySelector('[name="customAmount"]');
    const hiddenAmount = donateForm.querySelector('[name="amount"]');
    const statusBox = donateForm.querySelector('.donate-status');
    const submitBtn = donateForm.querySelector('[type="submit"]');

    amountButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        amountButtons.forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        hiddenAmount.value = btn.dataset.amount;
        customInput.value = '';
      });
    });

    customInput.addEventListener('input', () => {
      amountButtons.forEach(b => b.classList.remove('is-selected'));
      hiddenAmount.value = customInput.value;
    });

    const setStatus = (msg, type) => {
      statusBox.textContent = msg;
      statusBox.className = `donate-status show ${type}`;
    };

    donateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = parseFloat(hiddenAmount.value || customInput.value || '0');
      const phone = donateForm.querySelector('[name="phone"]').value.trim();
      const name = donateForm.querySelector('[name="donorName"]').value.trim();

      if (!amount || amount < 10) {
        setStatus('Please choose or enter a valid donation amount.', 'error');
        return;
      }
      if (!/^(?:\+?254|0)7\d{8}$/.test(phone)) {
        setStatus('Enter a valid Safaricom M-Pesa number, e.g. 07XXXXXXXX.', 'error');
        return;
      }

      submitBtn.disabled = true;
      setStatus('Sending the M-Pesa prompt to your phone… please wait.', 'pending');

      try {
        const res = await fetch(MPESA_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, phone, name })
        });
        if (!res.ok) throw new Error('Backend responded with an error');
        const data = await res.json();
        setStatus(data.message || 'Check your phone and enter your M-Pesa PIN to complete the donation.', 'success');
        donateForm.reset();
        amountButtons.forEach(b => b.classList.remove('is-selected'));
      } catch (err) {
        setStatus(
          'We could not reach the M-Pesa payment service right now. This demo form needs a live backend at /api/mpesa/stkpush connected to the Safaricom Daraja API — please try again shortly or contact us to donate directly.',
          'error'
        );
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* =========================================================
     CONTACT — form + FAQ accordion
     ========================================================= */
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = contactForm.querySelector('.form-status');
      status.textContent = 'Thank you! Your message has been received — our team will reply within 2 working days.';
      status.classList.add('show');
      contactForm.reset();
    });
  }

  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('button').addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });

});
