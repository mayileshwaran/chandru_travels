
/* ==========================================================================
   madurai chandru travels — SITE SCRIPT
   ========================================================================== */

/* --------------------------------------------------------------------------
   1) WHATSAPP CONFIG
   Change ONLY this number to update every "Book Now" / WhatsApp button
   on the entire site. Use the country code with no "+", spaces or dashes.
   Example: India number +91 90871 37006  ->  "919087137006"
   -------------------------------------------------------------------------- */
const WHATSAPP_NUMBER = "919087137006"; // TODO: replace with the real business number

const DEFAULT_WHATSAPP_MESSAGE =
  "Hello madurai chandru travels, I would like to book a travel service.";

function buildWhatsAppLink(message) {
  const text = encodeURIComponent(message || DEFAULT_WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

/* Wire up every element flagged as a WhatsApp trigger (buttons, links, the
   floating button, etc). Each element can carry its own data-msg. */
function initWhatsAppButtons() {
  document.querySelectorAll(".js-wa").forEach((el) => {
    const message = el.getAttribute("data-msg") || DEFAULT_WHATSAPP_MESSAGE;
    el.setAttribute("href", buildWhatsAppLink(message));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });
}

/* --------------------------------------------------------------------------
   1b) BOOKING MODAL
   Every "Book Now" style button (class="js-book") opens this form instead of
   jumping straight to WhatsApp. Whatever the visitor fills in — name, phone,
   trip start/end dates, notes — plus the context of which button they clicked
   (e.g. "Ooty tour", "Corporate Travel") is assembled into one message and
   THAT is what gets pushed to WhatsApp on submit.
   -------------------------------------------------------------------------- */
function initBookingModal() {
  const modal = document.getElementById("bookingModal");
  const backdrop = document.getElementById("bookingModalBackdrop");
  const closeBtn = document.getElementById("bookingModalClose");
  const contextText = document.getElementById("bookingModalContextText");
  const form = document.getElementById("bookingForm");
  if (!modal || !form) return;

  const nameEl = document.getElementById("bookName");
  const phoneEl = document.getElementById("bookPhone");
  const startEl = document.getElementById("bookStartDate");
  const endEl = document.getElementById("bookEndDate");
  const pickupEl = document.getElementById("bookPickup");
  const membersEl = document.getElementById("bookMembers");
  const notesEl = document.getElementById("bookNotes");

  let currentContext = DEFAULT_WHATSAPP_MESSAGE;

  const todayISO = () => new Date().toISOString().split("T")[0];

  const open = (contextMessage) => {
    currentContext = contextMessage || DEFAULT_WHATSAPP_MESSAGE;
    contextText.textContent = currentContext;

    const min = todayISO();
    startEl.min = min;
    endEl.min = min;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => nameEl?.focus(), 200);
  };

  const close = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  // Wire up every "Book Now" trigger on the page
  document.querySelectorAll(".js-book").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open(el.getAttribute("data-msg"));
    });
  });

  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });

  // Keep end-date always >= start-date
  startEl.addEventListener("change", () => {
    endEl.min = startEl.value || todayISO();
    if (endEl.value && endEl.value < endEl.min) endEl.value = endEl.min;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const startDate = startEl.value;
    const endDate = endEl.value;
    const pickup = pickupEl.value.trim();
    const members = membersEl.value.trim();
    const notes = notesEl.value.trim();

    if (!name || !phone || !startDate || !endDate || !pickup || !members) {
      form.reportValidity();
      return;
    }
    if (endDate < startDate) {
      endEl.setCustomValidity("Trip end date can't be before the start date.");
      form.reportValidity();
      endEl.setCustomValidity("");
      return;
    }

    const formatDate = (iso) =>
      new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });

    // Build the full WhatsApp message from everything the visitor entered
    const lines = [
      currentContext,
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Trip Dates: ${formatDate(startDate)} to ${formatDate(endDate)}`,
      `Pickup Point: ${pickup}`,
      `No. of Members: ${members}`,
    ];
    if (notes) lines.push(`Notes: ${notes}`);

    const finalMessage = lines.join("\n");

    window.open(buildWhatsAppLink(finalMessage), "_blank", "noopener,noreferrer");

    close();
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   2) NAVBAR: solid background after scroll + active link highlight
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initActiveNavLink() {
  const links = document.querySelectorAll(".nav-link[href^='#']");
  const sections = Array.from(links)
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          links.forEach((l) =>
            l.classList.toggle("active", l.getAttribute("href") === id)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((s) => observer.observe(s));
}

/* --------------------------------------------------------------------------
   3) MOBILE OFFCANVAS MENU
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("offcanvasClose");
  const backdrop = document.getElementById("offcanvasBackdrop");
  if (!hamburger || !menu) return;

  const open = () => {
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  hamburger.addEventListener("click", () => {
    menu.classList.contains("open") ? close() : open();
  });
  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  menu.querySelectorAll(".offcanvas__link, .js-wa").forEach((link) =>
    link.addEventListener("click", close)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* --------------------------------------------------------------------------
   4) SCROLL-REVEAL ANIMATIONS
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    observer.observe(el);
  });
}

/* --------------------------------------------------------------------------
   5) DEPARTURE-BOARD STAT COUNTERS
   -------------------------------------------------------------------------- */
function initStatCounters() {
  const stats = document.querySelectorAll(".stat[data-count]");
  if (stats.length === 0) return;

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const numEl = el.querySelector(".stat__num");
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      numEl.textContent = value.toLocaleString("en-IN") + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    stats.forEach(animateCount);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  stats.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   6) GALLERY LIGHTBOX
   -------------------------------------------------------------------------- */
function initLightbox() {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.getElementById("lightbox");
  const imgEl = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");
  if (items.length === 0 || !lightbox) return;

  let index = 0;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const item = items[index];
    imgEl.src = item.getAttribute("data-full") || item.querySelector("img").src;
    imgEl.alt = item.querySelector("img").alt || "";
  };

  const open = (i) => {
    show(i);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  items.forEach((item, i) =>
    item.addEventListener("click", () => open(i))
  );
  closeBtn?.addEventListener("click", close);
  prevBtn?.addEventListener("click", () => show(index - 1));
  nextBtn?.addEventListener("click", () => show(index + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
}

/* --------------------------------------------------------------------------
   7) MISC: footer year
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* --------------------------------------------------------------------------
   INIT
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initWhatsAppButtons();
  initBookingModal();
  initNavbarScroll();
  initActiveNavLink();
  initMobileMenu();
  initScrollReveal();
  initStatCounters();
  initLightbox();
  initFooterYear();
});

