const root = document.querySelector<HTMLElement>("[data-portfolio]");

if (root) {
  const loader = root.querySelector<HTMLElement>("[data-loader]");
  const appShell = root.querySelector<HTMLElement>("[data-app-shell]");
  const progress = root.querySelector<HTMLElement>("[data-loader-progress]");
  const mascot = root.querySelector<HTMLElement>("[data-loader-mascot]");
  const bloom = root.querySelector<HTMLElement>("[data-loader-bloom]");
  const status = root.querySelector<HTMLElement>("[data-loader-status]");
  const welcomeEnter = root.querySelector<HTMLButtonElement>("[data-welcome-enter]");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bloomDuration = reduceMotion ? 1 : 1400;

  const revealApp = () => {
    if (!loader || !appShell || loader.dataset.state === "leaving") return;
    loader.dataset.state = "leaving";
    appShell.ariaHidden = "false";
    sessionStorage.setItem("portfolio-intro-seen", "true");
    window.setTimeout(() => { loader.dataset.state = "hidden"; }, reduceMotion ? 0 : 700);
  };

  const showWelcome = () => {
    if (!loader || loader.dataset.state === "blooming") return;
    if (mascot && bloom) {
      const mascotBounds = mascot.getBoundingClientRect();
      bloom.style.left = `${mascotBounds.left + mascotBounds.width / 2}px`;
      bloom.style.top = `${mascotBounds.top + mascotBounds.height / 2}px`;
    }
    loader.dataset.state = "blooming";
    window.setTimeout(() => {
      loader.dataset.state = "welcome";
      welcomeEnter?.focus({ preventScroll: true });
      window.setTimeout(() => { loader.dataset.welcomeReady = "true"; }, reduceMotion ? 0 : 750);
    }, bloomDuration);
  };

  const forceIntro = new URLSearchParams(window.location.search).has("intro");
  const introSeen = !forceIntro && sessionStorage.getItem("portfolio-intro-seen") === "true";
  if (introSeen) {
    appShell?.setAttribute("aria-hidden", "false");
    loader?.setAttribute("data-state", "hidden");
  } else if (loader && progress && mascot && status) {
    let value = 0;
    const tick = window.setInterval(() => {
      value = Math.min(100, value + Math.max(4, Math.round((100 - value) / 5)));
      progress.style.width = `${value}%`;
      mascot.style.left = `${value}%`;
      if (value === 100) {
        window.clearInterval(tick);
        status.textContent = "Ready!";
        window.setTimeout(showWelcome, reduceMotion ? 0 : 300);
      }
    }, reduceMotion ? 20 : 120);
  }

  welcomeEnter?.addEventListener("click", revealApp);
  window.addEventListener("wheel", () => {
    if (loader?.dataset.state === "welcome" && loader.dataset.welcomeReady === "true") revealApp();
  }, { passive: true });

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
    item.addEventListener("dragstart", (event) => event.preventDefault());
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

  const windowTitle = root.querySelector<HTMLElement>(".window__titlebar span");
  const windowAddressTitle = root.querySelector<HTMLElement>("[data-window-address-title]");
  const panels = root.querySelectorAll<HTMLElement>("[data-panel]");
  const selectPanel = (target: string) => {
    if (target !== "about" && target !== "works" && target !== "contact") return;
    panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== target; });
    const title = target === "works" ? "Works" : target === "contact" ? "Contact" : "About me";
    if (windowTitle) windowTitle.textContent = title;
    if (windowAddressTitle) windowAddressTitle.textContent = title;
    root.querySelectorAll<HTMLAnchorElement>("aside [data-window-target]").forEach((link) => {
      const isActive = link.dataset.windowTarget === target;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  root.querySelectorAll<HTMLAnchorElement>("[data-window-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = link.dataset.windowTarget;
      if (target !== "about" && target !== "works" && target !== "contact") return;
      event.preventDefault();
      selectPanel(target);
    });
  });

  const detail = root.querySelector<HTMLElement>("[data-work-detail]");
  const detailTitle = root.querySelector<HTMLElement>("[data-work-detail-title]");
  root.querySelectorAll<HTMLButtonElement>("[data-folder]").forEach((folder) => {
    folder.addEventListener("click", () => {
      root.querySelectorAll<HTMLElement>("[data-folder]").forEach((item) => item.setAttribute("aria-expanded", "false"));
      folder.setAttribute("aria-expanded", "true");
      if (detail && detailTitle) {
        detailTitle.textContent = folder.dataset.project ?? "Project";
        detail.hidden = false;
      }
    });
  });
  root.querySelector<HTMLButtonElement>("[data-work-detail-close]")?.addEventListener("click", () => {
    detail?.setAttribute("hidden", "");
    root.querySelectorAll<HTMLElement>("[data-folder]").forEach((item) => item.setAttribute("aria-expanded", "false"));
  });
}
