(function () {
  "use strict";

  var lastFocusedEl = null;

  // ---------- Fixed nav offset ----------
  // The nav is position:fixed so content can scroll — and blur —
  // underneath it. Its height varies by breakpoint (and slightly
  // once web fonts swap in), so measure it rather than hardcoding
  // a padding value in CSS.

  function debounce(fn, wait) {
    var timer;
    return function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(fn, wait);
    };
  }

  function syncNavOffset() {
    var navWrapper = document.querySelector(".nav-wrapper");
    if (!navWrapper) return;
    document.body.style.paddingTop = navWrapper.offsetHeight + "px";
  }

  syncNavOffset();
  window.addEventListener("load", syncNavOffset);
  window.addEventListener("resize", debounce(syncNavOffset, 150));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncNavOffset);
  }

  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  function openModal(modal) {
    if (!modal) return;
    lastFocusedEl = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    var scrollbarWidth = getScrollbarWidth();
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = scrollbarWidth + "px";
    }

    var focusTarget = modal.querySelector(
      'input, textarea, button:not([data-close-modal])'
    );
    if (focusTarget) {
      window.requestAnimationFrame(function () {
        focusTarget.focus();
      });
    }
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  }

  function closeAllModals() {
    var openModals = document.querySelectorAll(".modal-overlay.is-open");
    openModals.forEach(closeModal);
  }

  // Open triggers
  document.querySelectorAll("[data-open-modal]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var id = trigger.getAttribute("data-open-modal");
      var modal = document.getElementById(id);
      openModal(modal);
    });
  });

  // Close triggers (X button, "Got it")
  document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var modal = btn.closest(".modal-overlay");
      closeModal(modal);
    });
  });

  // Click on scrim (outside the card) closes the modal
  document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // Escape key closes any open modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });

  // ---------- Toast ----------

  var toastEl = document.getElementById("toast");
  var toastMessageEl = document.getElementById("toast-message");
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    if (message) {
      toastMessageEl.textContent = message;
    }
    toastEl.classList.add("is-visible");

    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 4000);
  }

  // ---------- Contact form (faked — no backend yet) ----------
  // Per project decision: submitting mimics a successful send, the
  // modal closes, and a success toast appears. Real backend (Formspree
  // or a small serverless function) gets wired up after the site is
  // deployed — this intentionally does not send anything yet.

  var contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var submitBtn = contactForm.querySelector(".form-submit");
      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      window.setTimeout(function () {
        var modal = document.getElementById("contact-modal");
        closeModal(modal);
        showToast("Message sent — we'll be in touch soon.");

        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }, 500);
    });
  }
})();
