/**
 * Zimmer TV landing page interactions.
 * This project is static HTML/CSS, so we attach event listeners directly.
 */

/**
 * Mock service layer for actions that would normally call an API.
 * Keeping it in one place makes it easy to swap for real network calls later.
 */
const ZimmerService = {
  /**
   * Simulate sending a room-service request.
   * @returns {Promise<{ok: true, etaMinutes: number}>}
   */
  async requestRoomService() {
    await delay(700);

    // Simulate occasional failure to exercise error handling/UI feedback.
    if (Math.random() < 0.12) {
      throw new Error("Room service is temporarily unavailable.");
    }

    const etaMinutes = 15 + Math.floor(Math.random() * 20);
    return { ok: true, etaMinutes };
  },

  /**
   * Simulate a checkout attempt.
   * @returns {Promise<{ok: true}>}
   */
  async checkout() {
    await delay(650);
    return { ok: true };
  },
};

/**
 * Small promise-based delay helper for mock async actions.
 * @param {number} ms
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Show a lightweight toast message for UI feedback.
 * @param {string} message
 * @param {"info" | "success" | "error"} [variant]
 */
function toast(message, variant = "info") {
  const el = document.createElement("div");
  el.className = `toast toast--${variant}`;
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.textContent = message;

  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("toast--show"));

  window.setTimeout(() => {
    el.classList.remove("toast--show");
    window.setTimeout(() => el.remove(), 220);
  }, 2200);
}

/**
 * Put a button-like link into a busy state while an async action runs.
 * @param {HTMLElement} el
 * @param {boolean} busy
 * @param {string} [busyLabel]
 */
function setBusy(el, busy, busyLabel = "Working…") {
  if (!(el instanceof HTMLElement)) return;

  if (busy) {
    el.dataset.label = el.dataset.label || el.textContent || "";
    el.textContent = busyLabel;
    el.setAttribute("aria-busy", "true");
    el.setAttribute("aria-disabled", "true");
    el.classList.add("is-busy");
  } else {
    el.textContent = el.dataset.label || el.textContent || "";
    el.removeAttribute("aria-busy");
    el.removeAttribute("aria-disabled");
    el.classList.remove("is-busy");
  }
}

/**
 * Handle clicks on the "Room Service" action.
 * Uses a mock service call and shows success/error feedback.
 * @param {HTMLElement} el
 */
async function handleRoomService(el) {
  try {
    setBusy(el, true, "Requesting…");
    const res = await ZimmerService.requestRoomService();
    toast(`Room service requested. ETA ~${res.etaMinutes} minutes.`, "success");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Something went wrong.";
    toast(msg, "error");
  } finally {
    setBusy(el, false);
  }
}

/**
 * Handle clicks on the "Check Out" action.
 * Navigates to the checkout page; if you later add a real checkout API,
 * you can call ZimmerService.checkout() here first, then navigate.
 * @param {MouseEvent} event
 */
function handleCheckoutNavigation(event) {
  // Allow normal navigation for real links (we just add a toast for feedback).
  toast("Opening checkout…", "info");
}

/**
 * Handle clicks on the "Watch TV" action.
 * Navigation is a normal link; we add a small toast for feedback.
 * @param {MouseEvent} event
 */
function handleWatchTvNavigation(event) {
  toast("Loading TV…", "info");
}

/**
 * Attach all event listeners in one place (best practice for static pages).
 */
function init() {
  const actionEls = document.querySelectorAll("[data-action]");

  for (const el of actionEls) {
    el.addEventListener("click", (event) => {
      const target = /** @type {HTMLElement} */ (event.currentTarget);
      const action = target.getAttribute("data-action");

      if (target.classList.contains("is-busy")) {
        event.preventDefault();
        return;
      }

      switch (action) {
        case "room-service": {
          // Action button: keep user on page, run async handler.
          event.preventDefault();
          void handleRoomService(target);
          break;
        }
        case "check-out": {
          // Navigation button: allow the link to navigate.
          handleCheckoutNavigation(event);
          break;
        }
        case "watch-tv": {
          // Navigation button: allow the link to navigate.
          handleWatchTvNavigation(event);
          break;
        }
        default:
          break;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", init);

