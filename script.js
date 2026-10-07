/* =========================================================
   Preeti Janawade — Bridal & Party Makeup Artist
   script.js — all site interactivity
   ========================================================= */
(function () {
  'use strict';

  // =========================================================
  // CONFIG
  // =========================================================
  
  const API_URL =
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : "https://preeti-website-1.onrender.com";

  const WHATSAPP_NUMBER = "919019672643";

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  // =========================================================
  // LOADING SCREEN
  // =========================================================
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');

    if (loader) {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 500);
    }
  });


  // =========================================================
  // DARK MODE
  // =========================================================
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  const savedTheme = (() => {
    try {
      return localStorage.getItem('pj-theme');
    } catch (e) {
      return null;
    }
  })();

  if (savedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';

      if (isDark) {
        root.removeAttribute('data-theme');

        try {
          localStorage.setItem('pj-theme', 'light');
        } catch (e) { }

      } else {
        root.setAttribute('data-theme', 'dark');

        try {
          localStorage.setItem('pj-theme', 'dark');
        } catch (e) { }
      }
    });
  }


  // =========================================================
  // HEADER SCROLL + PROGRESS + BACK TO TOP
  // =========================================================
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('scrollProgressBar');
  const backTop = document.getElementById('backTop');

  function onScroll() {

    const y = window.scrollY;

    if (header) {
      header.classList.toggle('scrolled', y > 40);
    }

    if (backTop) {
      backTop.classList.toggle('show', y > 600);
    }

    if (progressBar) {

      const docHeight = document.documentElement.scrollHeight -
        window.innerHeight;

      const pct = docHeight > 0
        ? (y / docHeight) * 100
        : 0;

      progressBar.style.width = pct + '%';
    }
  }

  window.addEventListener(
    'scroll',
    onScroll,
    { passive: true }
  );

  onScroll();

  if (backTop) {
    backTop.addEventListener('click', () => {

      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });

    });
  }


  // =========================================================
  // MOBILE NAV
  // =========================================================
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  const navScrim = document.getElementById('navScrim');

  function closeNav() {

    if (siteNav) {
      siteNav.classList.remove('open');
    }

    if (navToggle) {
      navToggle.classList.remove('open');
    }

    if (navScrim) {
      navScrim.classList.remove('show');
    }
  }

  if (navToggle && siteNav && navScrim) {

    navToggle.addEventListener('click', () => {

      const willOpen = !siteNav.classList.contains('open');

      siteNav.classList.toggle('open', willOpen);
      navToggle.classList.toggle('open', willOpen);
      navScrim.classList.toggle('show', willOpen);

    });

    navScrim.addEventListener('click', closeNav);
  }

  document
    .querySelectorAll('.nav-link')
    .forEach(link => {
      link.addEventListener('click', closeNav);
    });


  // =========================================================
  // CURSOR GLOW
  // =========================================================
  const glow = document.getElementById('cursorGlow');

  if (glow &&
    window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches) {

    window.addEventListener('mousemove', (e) => {

      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';

      glow.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
      glow.classList.remove('active');
    });
  }


  // =========================================================
  // HERO FLOATING PARTICLES
  // =========================================================
  const particlesBox = document.getElementById('heroParticles');

  if (particlesBox && !reduceMotion) {

    const count = window.innerWidth < 700 ? 12 : 26;

    for (let i = 0; i < count; i++) {

      const p = document.createElement('span');

      const size = 2 + Math.random() * 4;

      p.style.width = size + 'px';
      p.style.height = size + 'px';

      p.style.left =
        Math.random() * 100 + '%';

      p.style.bottom = '-10px';

      p.style.animationDuration =
        10 + Math.random() * 14 + 's';

      p.style.animationDelay =
        Math.random() * 12 + 's';

      particlesBox.appendChild(p);
    }
  }


  // =========================================================
  // SCROLL REVEAL
  // =========================================================
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {

    const io = new IntersectionObserver(
      (entries) => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add('in');

            io.unobserve(entry.target);
          }
        });

      },
      {
        threshold: 0.15
      }
    );

    revealEls.forEach(el => io.observe(el));

  } else {

    revealEls.forEach(el => {
      el.classList.add('in');
    });
  }


  // =========================================================
  // ANIMATED COUNTERS
  // =========================================================
  const counters = document.querySelectorAll('.count');

  if ('IntersectionObserver' in window) {

    const counterIO = new IntersectionObserver(
      (entries) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) {
            return;
          }

          const el = entry.target;

          const target = parseInt(
            el.getAttribute('data-count'),
            10
          ) || 0;

          const duration = 1400;
          const start = performance.now();

          function tick(now) {

            const progress = Math.min(
              (now - start) / duration,
              1
            );

            const eased = 1 - Math.pow(
              1 - progress,
              3
            );

            el.textContent =
              Math.round(
                eased * target
              );

            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          }

          requestAnimationFrame(tick);

          counterIO.unobserve(el);
        });

      },
      {
        threshold: 0.5
      }
    );

    counters.forEach(el => counterIO.observe(el)
    );
  }


  // =========================================================
  // BUTTON RIPPLE
  // =========================================================
  document
    .querySelectorAll('.btn-ripple')
    .forEach(btn => {

      btn.addEventListener('click', function (e) {

        const rect = btn.getBoundingClientRect();

        const ripple = document.createElement('span');

        const size = Math.max(
          rect.width,
          rect.height
        );

        ripple.className = 'ripple';

        ripple.style.width =
          size + 'px';

        ripple.style.height =
          size + 'px';

        ripple.style.left =
          (
            e.clientX -
            rect.left -
            size / 2
          ) + 'px';

        ripple.style.top =
          (
            e.clientY -
            rect.top -
            size / 2
          ) + 'px';

        btn.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 650);
      });
    });


  // =========================================================
  // GALLERY FILTER
  // =========================================================
  const filterBtns = document.querySelectorAll('.g-filter');

  const galleryItems = document.querySelectorAll('.g-item');

  filterBtns.forEach(btn => {

    btn.addEventListener('click', () => {

      filterBtns.forEach(b => b.classList.remove('active')
      );

      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {

        const match = filter === 'all' ||
          item.getAttribute('data-cat') === filter;

        item.classList.toggle(
          'hide',
          !match
        );
      });
    });
  });


  // =========================================================
  // LIGHTBOX
  // =========================================================
  const lightbox = document.getElementById('lightbox');

  const lbImg = document.getElementById('lbImg');

  const lbCaption = document.getElementById('lbCaption');

  const lbClose = document.getElementById('lbClose');

  const lbPrev = document.getElementById('lbPrev');

  const lbNext = document.getElementById('lbNext');

  let lbIndex = 0;

  function visibleItems() {

    return Array.from(galleryItems)
      .filter(item => !item.classList.contains('hide')
      );
  }

  function openLightbox(item) {

    if (!lightbox) {
      return;
    }

    const items = visibleItems();

    lbIndex =
      items.indexOf(item);

    renderLightbox();

    lightbox.classList.add('open');
  }

  function renderLightbox() {

    const items = visibleItems();

    if (!items.length) {
      return;
    }

    if (lbIndex < 0) {
      lbIndex = items.length - 1;
    }

    if (lbIndex >= items.length) {
      lbIndex = 0;
    }

    const item = items[lbIndex];

    const bg = item.style.backgroundImage
      .slice(5, -2);

    if (lbImg) {

      lbImg.src = bg;

      lbImg.alt =
        item.getAttribute(
          'data-caption'
        ) || '';
    }

    if (lbCaption) {

      lbCaption.textContent =
        item.getAttribute(
          'data-caption'
        ) || '';
    }
  }

  galleryItems.forEach(item => {

    item.addEventListener('click', () => {
      openLightbox(item);
    });

  });

  if (lbClose && lightbox) {

    lbClose.addEventListener(
      'click',
      () => {
        lightbox.classList.remove('open');
      }
    );

    lightbox.addEventListener(
      'click',
      (e) => {

        if (e.target === lightbox) {
          lightbox.classList.remove('open');
        }
      }
    );
  }

  if (lbPrev) {

    lbPrev.addEventListener(
      'click',
      () => {
        lbIndex--;
        renderLightbox();
      }
    );
  }

  if (lbNext) {

    lbNext.addEventListener(
      'click',
      () => {
        lbIndex++;
        renderLightbox();
      }
    );
  }

  document.addEventListener(
    'keydown',
    (e) => {

      if (!lightbox ||
        !lightbox.classList.contains('open')) {
        return;
      }

      if (e.key === 'Escape') {
        lightbox.classList.remove('open');
      }

      if (e.key === 'ArrowLeft') {
        lbIndex--;
        renderLightbox();
      }

      if (e.key === 'ArrowRight') {
        lbIndex++;
        renderLightbox();
      }
    }
  );


  // =========================================================
  // TESTIMONIAL SLIDER
  // =========================================================
  const tTrack = document.getElementById('tTrack');

  const tSlides = document.querySelectorAll(
    '.testimonial-card'
  );

  const tDotsBox = document.getElementById('tDots');

  let tIndex = 0;
  let tTimer;

  if (tTrack && tSlides.length && tDotsBox) {

    tSlides.forEach((_, i) => {

      const dot = document.createElement('button');

      dot.type = 'button';

      dot.setAttribute(
        'aria-label',
        'Go to testimonial ' + (i + 1)
      );

      if (i === 0) {
        dot.classList.add('active');
      }

      dot.addEventListener(
        'click',
        () => {
          goToSlide(i);
          restartAutoplay();
        }
      );

      tDotsBox.appendChild(dot);
    });

    const tDots = tDotsBox.querySelectorAll('button');

    function goToSlide(i) {

      tIndex =
        (i + tSlides.length) %
        tSlides.length;

      tTrack.style.transform =
        `translateX(-${tIndex * 100}%)`;

      tDots.forEach(dot => dot.classList.remove('active')
      );

      if (tDots[tIndex]) {
        tDots[tIndex].classList.add('active');
      }
    }

    function restartAutoplay() {

      clearInterval(tTimer);

      if (reduceMotion) {
        return;
      }

      tTimer = setInterval(() => {
        goToSlide(tIndex + 1);
      }, 5000);
    }

    restartAutoplay();
  }


  // =========================================================
  // FAQ ACCORDION
  // =========================================================
  document
    .querySelectorAll('.faq-item')
    .forEach(item => {

      const q = item.querySelector('.faq-q');

      const a = item.querySelector('.faq-a');

      if (!q || !a) {
        return;
      }

      q.addEventListener(
        'click',
        () => {

          const isOpen = item.classList.contains('open');

          document
            .querySelectorAll('.faq-item.open')
            .forEach(other => {

              if (other !== item) {

                other.classList.remove(
                  'open'
                );

                const otherAnswer = other.querySelector('.faq-a');

                if (otherAnswer) {
                  otherAnswer.style.maxHeight =
                    null;
                }
              }
            });

          item.classList.toggle(
            'open',
            !isOpen
          );

          a.style.maxHeight =
            !isOpen
              ? a.scrollHeight + 'px'
              : null;
        }
      );
    });


  // =========================================================
  // BOOKING FORM
  // FASTAPI + MONGODB + WHATSAPP
  // =========================================================
  const bookingForm = document.getElementById('bookingForm');

  const bookingPopup = document.getElementById('bookingPopup');

  const popupClose = document.getElementById('popupClose');


  function setFieldValid(fieldWrap, valid) {

    if (!fieldWrap) {
      return;
    }

    fieldWrap.classList.toggle(
      'invalid',
      !valid
    );
  }


  if (bookingForm) {

    bookingForm.addEventListener(
      'submit',
      async function (e) {

        e.preventDefault();

        console.log(
          'BOOKING FORM SUBMITTED'
        );


        // -------------------------------------------------
        // GET INPUTS
        // -------------------------------------------------
        const nameInput = document.getElementById('bName');

        const phoneInput = document.getElementById('bPhone');

        const serviceInput = document.getElementById('bService');

        const dateInput = document.getElementById('bDate');

        const notesInput = document.getElementById('bNotes');


        if (!nameInput ||
          !phoneInput ||
          !serviceInput ||
          !dateInput ||
          !notesInput) {

          console.error(
            'Booking form fields are missing.'
          );

          alert(
            'Booking form fields are missing. Please check your HTML IDs.'
          );

          return;
        }


        const name = nameInput.value.trim();

        const phone = phoneInput.value.trim();

        const service = serviceInput.value;

        const date = dateInput.value;

        const notes = notesInput.value.trim();


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------
        let valid = true;


        const nameValid = name.length >= 2;

        setFieldValid(
          nameInput.closest('.form-field'),
          nameValid
        );

        if (!nameValid) {
          valid = false;
        }


        const cleanPhone = phone.replace(/\D/g, '');

        const phoneValid = /^[0-9]{10}$/.test(cleanPhone);

        setFieldValid(
          phoneInput.closest('.form-field'),
          phoneValid
        );

        if (!phoneValid) {
          valid = false;
        }


        if (!valid) {

          console.warn(
            'Booking validation failed.'
          );

          return;
        }


        // -------------------------------------------------
        // BUTTON
        // -------------------------------------------------
        const submitButton = document.getElementById(
          'bookingSubmit'
        );

        let originalButtonText = 'Send Booking via WhatsApp';


        if (submitButton) {

          const span = submitButton.querySelector('span');

          if (span) {
            originalButtonText =
              span.textContent;
          }

          submitButton.disabled = true;

          if (span) {
            span.textContent =
              'Sending...';
          }
        }


        try {

          // -------------------------------------------------
          // CREATE BOOKING DATA
          // -------------------------------------------------
          const bookingData = {
            name: name,

            phone: cleanPhone,

            email: null,

            event_type: service,

            event_date: date || null,

            event_time: null,

            location: null,

            package: service,

            message: notes || null
          };


          console.log(
            '--------------------------------'
          );

          console.log(
            'Sending booking to FastAPI:'
          );

          console.log(
            `${API_URL}/api/bookings`
          );

          console.log(
            'Booking data:',
            bookingData
          );

          console.log(
            '--------------------------------'
          );


          // -------------------------------------------------
          // SEND TO FASTAPI
          // -------------------------------------------------
          const response = await fetch(
            `${API_URL}/api/bookings`,
            {
              method: 'POST',

              headers: {
                'Content-Type': 'application/json'
              },

              body: JSON.stringify(
                bookingData
              )
            }
          );


          console.log(
            'FastAPI response status:',
            response.status
          );


          // -------------------------------------------------
          // READ RESPONSE
          // -------------------------------------------------
          const responseText = await response.text();

          console.log(
            'FastAPI response:',
            responseText
          );


          if (!response.ok) {

            throw new Error(
              `Booking API returned ${response.status}: ${responseText}`
            );
          }


          let result;

          try {

            result =
              JSON.parse(responseText);

          } catch (jsonError) {

            result =
              responseText;
          }


          console.log(
            'BOOKING SAVED SUCCESSFULLY:',
            result
          );

          const bookingReference = document.getElementById(
            'bookingReference'
          );

          if (bookingReference && result && result.booking_id) {
            bookingReference.textContent =
              `Your booking reference is #${result.booking_id}. Keep it for your records.`;
            bookingReference.hidden = false;
          }


          // -------------------------------------------------
          // WHATSAPP MESSAGE
          // -------------------------------------------------
          let msg = "Hi Preeti, I'd like to book an appointment.\n";

          msg +=
            `Name: ${name}\n`;

          msg +=
            `Phone: ${cleanPhone}\n`;

          msg +=
            `Service: ${service}\n`;


          if (date) {

            msg +=
              `Preferred Date: ${date}\n`;
          }


          if (notes) {

            msg +=
              `Notes: ${notes}\n`;
          }


          // -------------------------------------------------
          // SHOW SUCCESS POPUP
          // -------------------------------------------------
          if (bookingPopup) {

            bookingPopup.classList.add(
              'open'
            );
          }


          // -------------------------------------------------
          // OPEN WHATSAPP
          // -------------------------------------------------
          const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;


          console.log(
            'Opening WhatsApp:',
            whatsappURL
          );


          window.open(
            whatsappURL,
            '_blank'
          );


          // -------------------------------------------------
          // CLEAR FORM AFTER SUCCESS
          // -------------------------------------------------
          bookingForm.reset();


        } catch (error) {

          // -------------------------------------------------
          // ERROR
          // -------------------------------------------------
          console.error(
            '================================'
          );

          console.error(
            'BOOKING ERROR'
          );

          console.error(
            error
          );

          console.error(
            '================================'
          );


          alert(
            'Booking could not be saved to the server.\n\n' +
            'Please check the browser Console (F12) ' +
            'and make sure FastAPI is running.'
          );


        } finally {

          // -------------------------------------------------
          // RESTORE BUTTON
          // -------------------------------------------------
          if (submitButton) {

            submitButton.disabled =
              false;

            const span = submitButton.querySelector('span');

            if (span) {

              span.textContent =
                originalButtonText;
            }
          }
        }
      }
    );
  }


  // =========================================================
  // CLOSE BOOKING POPUP
  // =========================================================
  if (popupClose && bookingPopup) {

    popupClose.addEventListener(
      'click',
      () => {
        bookingPopup.classList.remove(
          'open'
        );
      }
    );


    bookingPopup.addEventListener(
      'click',
      (e) => {

        if (e.target === bookingPopup) {

          bookingPopup.classList.remove(
            'open'
          );
        }
      }
    );
  }


  // =========================================================
  // REMOVE VALIDATION ERROR WHILE TYPING
  // =========================================================
  ['bName', 'bPhone'].forEach(id => {

    const input = document.getElementById(id);

    if (input) {

      input.addEventListener(
        'input',
        function () {

          const field = this.closest('.form-field');

          if (field) {

            field.classList.remove(
              'invalid'
            );
          }
        }
      );
    }
  });


const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const btn = newsletterForm.querySelector("button");
        const input = newsletterForm.querySelector("#nlEmail");

        if (!btn || !input) return;

        const email = input.value.trim();

        if (!email) return;

        const original = btn.textContent;

        btn.disabled = true;
        btn.textContent = "Subscribing...";

        try {
            const response = await fetch(
                `${API_URL}/api/newsletter/subscribe`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Subscription failed"
                );
            }

        console.log("Newsletter response:", data);

            if (data.message === "Email is already subscribed") {
                    btn.textContent = "Already Subscribed ✓";
               } else {
                    btn.textContent = "Subscribed ✓";
            }

             input.value = "";

        } catch (error) {
            console.error("Newsletter error:", error);

            btn.textContent = "Try Again";
        }

        setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
        }, 2500);
    });
}
//

async function submitUpiPaymentReport(event) {
    event.preventDefault();

    const form = document.getElementById("upiPaymentReportForm");
    const nameInput = document.getElementById("upiPayerName");
    const amountInput = document.getElementById("upiPaymentAmount");
    const submitButton = document.getElementById("upiPaymentReportBtn");
    const message = document.getElementById("upiPaymentReportMessage");

    if (!form || !nameInput || !amountInput || !submitButton || !message) {
        return;
    }

    const customerName = nameInput.value.trim();
    const amount = Number(amountInput.value);
    if (customerName.length < 2 || !Number.isFinite(amount) || amount < 1) {
        message.textContent = "Enter your name and a valid amount of at least ₹1.";
        return;
    }

    submitButton.disabled = true;
    message.textContent = "Saving your payment report...";

    try {
        const response = await fetch(`${API_URL}/api/payments/upi-report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer_name: customerName,
                amount
            })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to save your payment report");
        }

        message.textContent =
            "Your payment report was saved. It will appear as pending until Preeti verifies the payment.";
        form.reset();
    } catch (error) {
        console.error("UPI payment report failed:", error);
        message.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
}


// Load bookings into Follow-Up dropdown
async function loadBookingsForFollowup() {

    const select = document.getElementById("followupBooking");

    if (!select) return;

    try {

        const response = await fetch(
            `${API_URL}/api/bookings`
        );

        if (!response.ok) {
            throw new Error("Failed to load bookings");
        }

        const data = await response.json();

        select.innerHTML =
            '<option value="">Select Booking</option>';

        data.bookings.forEach(booking => {

            const option = document.createElement("option");

            option.value = booking.booking_id;

            option.textContent =
                `#${booking.booking_id} - ${booking.name} - ${booking.event_type} - ${booking.event_date}`;

            select.appendChild(option);
        });

    } catch (error) {

        console.error(
            "Error loading bookings:",
            error
        );
    }
}

document
    .getElementById("followupForm")
    ?.addEventListener("submit", async function (event) {

        event.preventDefault();

        const bookingId =
            document.getElementById("followupBooking").value;

        const followupDate =
            document.getElementById("followupDate").value;

        const followupTime =
            document.getElementById("followupTime").value;

        const remarks =
            document.getElementById("followupRemarks").value;

        if (!bookingId) {
            alert("Please select a booking.");
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/api/followups`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        booking_id: Number(bookingId),
                        followup_date: followupDate,
                        followup_time: followupTime,
                        remarks: remarks,
                        status: "Pending"
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to create follow-up"
                );
            }

            console.log(
                "Follow-up created:",
                data
            );

            document.getElementById(
                "followupMessage"
            ).textContent =
                "Follow-up scheduled successfully!";

            document.getElementById(
                "followupForm"
            ).reset();

            loadFollowups();

        } catch (error) {

            console.error(
                "Follow-up error:",
                error
            );

            document.getElementById(
                "followupMessage"
            ).textContent =
                error.message;
        }
    });

    async function loadFollowups() {

    try {

        const response = await fetch(
            `${API_URL}/api/followups`
        );

        if (!response.ok) {
            throw new Error("Failed to load follow-ups");
        }

        const data = await response.json();

        console.log(
            "Follow-ups:",
            data.followups
        );

        // We'll display these in a table next.

    } catch (error) {

        console.error(
            "Error loading follow-ups:",
            error
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadBookingsForFollowup();

        loadFollowups();

    }
);

document
    .getElementById("upiPaymentReportForm")
    ?.addEventListener("submit", submitUpiPaymentReport);



// ============================================================
// END OF SCRIPT
// ============================================================

})();