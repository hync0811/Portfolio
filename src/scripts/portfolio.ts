const root = document.querySelector<HTMLElement>("[data-portfolio]");

if (root) {
  const loader = root.querySelector<HTMLElement>("[data-loader]");
  const appShell = root.querySelector<HTMLElement>("[data-app-shell]");
  const progress = root.querySelector<HTMLElement>("[data-loader-progress]");
  const mascot = root.querySelector<HTMLElement>("[data-loader-mascot]");
  const bloom = root.querySelector<HTMLElement>("[data-loader-bloom]");
  const status = root.querySelector<HTMLElement>("[data-loader-status]");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bloomDuration = reduceMotion ? 1 : 1400;
  const welcomeDuration = reduceMotion ? 0 : 1400;

  const revealApp = () => {
    if (!loader || !appShell || loader.dataset.state === "dropping") return;
    loader.dataset.state = "dropping";
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
      window.setTimeout(revealApp, welcomeDuration);
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
      if ((event.target as HTMLElement).closest("button, a, [data-no-drag]")) return;
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

  const windowAddressTitle = root.querySelector<HTMLElement>("[data-window-address-title]");
  const panels = root.querySelectorAll<HTMLElement>("[data-panel]");
  const selectPanel = (target: string) => {
    if (target !== "about" && target !== "works" && target !== "contact") return;
    panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== target; });
    const title = target === "works" ? "Works" : target === "contact" ? "Contact" : "About me";
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

  const workModal = root.querySelector<HTMLElement>("[data-work-modal]");
  // The work dialog belongs to the viewport, not to the scrollable DesktopWindow.
  // Moving it to body prevents the window's overflow from clipping its backdrop.
  if (workModal && workModal.parentElement !== document.body) {
    document.body.append(workModal);
  }
  const modalPanels = workModal?.querySelectorAll<HTMLElement>("[data-work-modal-panel]") ?? [];
  let modalTrigger: HTMLButtonElement | null = null;
  const closeWorkModal = () => {
    if (!workModal) return;
    workModal.hidden = true;
    workModal.setAttribute("aria-hidden", "true");
    modalPanels.forEach((panel) => { panel.hidden = true; });
    root.querySelectorAll<HTMLElement>("[data-folder]").forEach((item) => item.setAttribute("aria-expanded", "false"));
    modalTrigger?.focus();
    modalTrigger = null;
  };

  root.querySelectorAll<HTMLButtonElement>("[data-work-modal-trigger]").forEach((folder) => {
    folder.addEventListener("click", () => {
      const project = folder.dataset.workModalTrigger;
      if (!project || !workModal) return;
      modalTrigger = folder;
      root.querySelectorAll<HTMLElement>("[data-folder]").forEach((item) => item.setAttribute("aria-expanded", "false"));
      folder.setAttribute("aria-expanded", "true");
      modalPanels.forEach((panel) => { panel.hidden = panel.dataset.workModalPanel !== project; });
      workModal.hidden = false;
      workModal.setAttribute("aria-hidden", "false");
      workModal.querySelector<HTMLButtonElement>("[data-work-modal-close]")?.focus();
    });
  });
  workModal?.querySelectorAll<HTMLButtonElement>("[data-work-modal-close]").forEach((button) => button.addEventListener("click", closeWorkModal));
  workModal?.querySelectorAll<HTMLButtonElement>("[data-work-modal-top]").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest<HTMLElement>(".work-modal__body")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  workModal?.querySelectorAll<HTMLButtonElement>("[data-work-modal-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTrigger = root.querySelector<HTMLButtonElement>('[data-work-modal-trigger="2"]');
      nextTrigger?.click();
    });
  });
  workModal?.querySelectorAll<HTMLElement>("[data-work2-gallery]").forEach((gallery) => {
    const image = gallery.querySelector<HTMLImageElement>("[data-work2-gallery-image]");
    const sources = JSON.parse(gallery.dataset.work2GallerySources ?? "[]") as string[];
    let current = 0;
    const setImage = (direction: number) => {
      if (!image || sources.length === 0) return;
      current = (current + direction + sources.length) % sources.length;
      image.src = sources[current];
    };
    gallery.querySelector<HTMLButtonElement>("[data-work2-gallery-previous]")?.addEventListener("click", () => setImage(-1));
    gallery.querySelector<HTMLButtonElement>("[data-work2-gallery-next]")?.addEventListener("click", () => setImage(1));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && workModal && !workModal.hidden) closeWorkModal();
  });

  let modalDrag: { item: HTMLElement; parentBounds: DOMRect; bounds: DOMRect; startX: number; startY: number; startLeft: number; startTop: number } | null = null;
  document.addEventListener("pointerdown", (event) => {
    const item = (event.target as Element).closest<HTMLElement>("[data-modal-draggable]");
    if (event.button !== 0 || !item || !workModal?.contains(item)) return;
    const parent = item.parentElement;
    if (!parent) return;
    event.preventDefault();
    const bounds = item.getBoundingClientRect();
    const parentBounds = parent.getBoundingClientRect();
    modalDrag = { item, parentBounds, bounds, startX: event.clientX, startY: event.clientY, startLeft: bounds.left - parentBounds.left, startTop: bounds.top - parentBounds.top };
    item.style.right = "auto";
    item.style.left = `${modalDrag.startLeft}px`;
    item.style.top = `${modalDrag.startTop}px`;
  });
  document.addEventListener("pointermove", (event) => {
    if (!modalDrag) return;
    const { item, parentBounds, bounds, startX, startY, startLeft, startTop } = modalDrag;
    item.style.left = `${Math.min(parentBounds.width - bounds.width, Math.max(0, startLeft + event.clientX - startX))}px`;
    item.style.top = `${Math.min(parentBounds.height - bounds.height, Math.max(0, startTop + event.clientY - startY))}px`;
  });
  document.addEventListener("pointerup", () => { modalDrag = null; });
  document.addEventListener("pointercancel", () => { modalDrag = null; });

  root.querySelectorAll<HTMLButtonElement>("[data-scroll-top]").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".window__content")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}
