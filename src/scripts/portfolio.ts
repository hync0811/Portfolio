const root = document.querySelector<HTMLElement>("[data-portfolio]");

if (root) {
  const loader = root.querySelector<HTMLElement>("[data-loader]");
  const appShell = root.querySelector<HTMLElement>("[data-app-shell]");
  const progress = root.querySelector<HTMLElement>("[data-loader-progress]");
  const mascot = root.querySelector<HTMLElement>("[data-loader-mascot]");
  const status = root.querySelector<HTMLElement>("[data-loader-status]");
  const enter = root.querySelector<HTMLButtonElement>("[data-loader-enter]");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const reveal = () => {
    if (!loader || !appShell || loader.dataset.state === "leaving") return;
    loader.dataset.state = "leaving";
    appShell.ariaHidden = "false";
    sessionStorage.setItem("portfolio-intro-seen", "true");
    window.setTimeout(() => { loader.dataset.state = "hidden"; }, reduceMotion ? 0 : 700);
  };

  const introSeen = sessionStorage.getItem("portfolio-intro-seen") === "true";
  if (introSeen) {
    appShell?.setAttribute("aria-hidden", "false");
    loader?.setAttribute("data-state", "hidden");
  } else if (loader && progress && mascot && status && enter) {
    let value = 0;
    const tick = window.setInterval(() => {
      value = Math.min(100, value + Math.max(4, Math.round((100 - value) / 5)));
      progress.style.width = `${value}%`;
      mascot.style.left = `${value}%`;
      if (value === 100) {
        window.clearInterval(tick);
        status.textContent = "Ready when you are.";
        enter.hidden = false;
        enter.focus({ preventScroll: true });
      }
    }, reduceMotion ? 20 : 120);

    enter.addEventListener("click", reveal);
    window.addEventListener("wheel", reveal, { passive: true, once: true });
  }

  const date = root.querySelector<HTMLTimeElement>("[data-current-date]");
  const time = root.querySelector<HTMLTimeElement>("[data-current-time]");
  const updateClock = () => {
    const now = new Date();
    if (date) {
      date.dateTime = now.toISOString().slice(0, 10);
      date.textContent = new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }).format(now);
    }
    if (time) {
      time.dateTime = now.toISOString();
      time.textContent = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(now);
    }
  };
  updateClock();
  window.setInterval(updateClock, 30_000);

  root.querySelectorAll<HTMLElement>("[data-draggable]").forEach((item) => {
    const handle = item.querySelector<HTMLElement>("[data-drag-handle]") ?? item;
    handle.addEventListener("pointerdown", (event) => {
      if ((event.target as HTMLElement).closest("button, a")) return;
      const bounds = item.getBoundingClientRect();
      const parentBounds = item.parentElement?.getBoundingClientRect();
      if (!parentBounds) return;
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = bounds.left - parentBounds.left;
      const startTop = bounds.top - parentBounds.top;
      item.style.translate = "0 0";
      handle.setPointerCapture(event.pointerId);

      const move = (moveEvent: PointerEvent) => {
        const left = Math.min(parentBounds.width - bounds.width, Math.max(0, startLeft + moveEvent.clientX - startX));
        const top = Math.min(parentBounds.height - bounds.height, Math.max(0, startTop + moveEvent.clientY - startY));
        item.style.left = `${left}px`;
        item.style.top = `${top}px`;
      };
      const end = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    });
  });
}
