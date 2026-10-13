/* 8bit Lighting Theatre — TOP rotary theme selector.
   Only the left wheel rotates; right detail content stays in place.
   No external libraries or network requests. */
(() => {
  "use strict";
  const root = document.getElementById("lessons");
  if (!root) return;
  const wheel = root.querySelector(".home-wheel-panel");
  const buttons = [...root.querySelectorAll(".wheel-theme")];
  const panels = [...root.querySelectorAll(".home-theme-detail")];
  const counter = root.querySelector(".wheel-counter");
  const status = root.querySelector(".wheel-status");
  const prev = root.querySelector(".wheel-control-prev");
  const next = root.querySelector(".wheel-control-next");
  if (!wheel || buttons.length !== 7 || panels.length !== buttons.length) return;

  const total = buttons.length;
  let selected = 2; // Initial reference design: 03 SIGNAL
  let visible = selected;
  let touchStart = null;
  let ignoreClickUntil = 0;
  let wheelAccumulated = 0;
  let lastWheelStep = 0;

  const wrap = index => (index % total + total) % total;

  function signedOffset(index) {
    let offset = index - selected;
    const half = Math.floor(total / 2);
    if (offset > half) offset -= total;
    if (offset < -half) offset += total;
    return offset;
  }

  function showDetail(index) {
    const nextVisible = wrap(index);
    if (nextVisible === visible && !panels[nextVisible].hidden) return;
    visible = nextVisible;
    panels.forEach((panel, i) => {
      panel.hidden = i !== visible;
    });
    const scroller = panels[visible].querySelector(".detail-lessons-scroll");
    if (scroller) scroller.scrollTop = 0;
  }

  function renderWheel() {
    const viewportWidth = window.innerWidth;
    const step = viewportWidth <= 760 ? 45 : Math.max(48, Math.min(57, viewportWidth * .041));
    buttons.forEach((button, index) => {
      const offset = signedOffset(index);
      const distance = Math.abs(offset);
      button.style.setProperty("--wheel-y", (offset * step) + "px");
      button.style.setProperty("--wheel-z", (-distance * 34) + "px");
      button.style.setProperty("--wheel-rotate", (-offset * 10) + "deg");
      button.style.setProperty("--scale", String(1 - distance * .065));
      button.style.setProperty("--item-opacity", String(1 - distance * .15));
      button.style.zIndex = String(20 - distance);
      button.classList.toggle("is-selected", index === selected);
      button.setAttribute("aria-pressed", String(index === selected));
    });
    if (counter) counter.textContent = String(selected + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
    if (status) status.textContent = "選択中：" + buttons[selected].dataset.themeName;
  }

  function select(index) {
    selected = wrap(index);
    renderWheel();
    showDetail(selected);
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (Date.now() < ignoreClickUntil) return;
      select(index);
    });
    button.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse") showDetail(index);
    });
    button.addEventListener("focus", () => {
      // Keyboard focus previews the theme, without moving the wheel.
      showDetail(index);
    });
  });

  wheel.addEventListener("pointerleave", event => {
    if (event.pointerType === "mouse") showDetail(selected);
  });
  wheel.addEventListener("focusout", event => {
    if (!wheel.contains(event.relatedTarget)) showDetail(selected);
  });

  prev?.addEventListener("click", () => select(selected - 1));
  next?.addEventListener("click", () => select(selected + 1));

  wheel.addEventListener("wheel", event => {
    if (!event.deltaY) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
    const now = performance.now();
    if (now - lastWheelStep > 350) wheelAccumulated = 0;
    wheelAccumulated += delta;
    if (Math.abs(wheelAccumulated) >= 28 && now - lastWheelStep >= 125) {
      select(selected + (wheelAccumulated > 0 ? 1 : -1));
      wheelAccumulated = 0;
      lastWheelStep = now;
    }
  }, { passive: false });

  wheel.addEventListener("pointerdown", event => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    touchStart = { id: event.pointerId, y: event.clientY, time: performance.now() };
  });
  wheel.addEventListener("pointerup", event => {
    if (!touchStart || touchStart.id !== event.pointerId) return;
    const dy = event.clientY - touchStart.y;
    const elapsed = performance.now() - touchStart.time;
    touchStart = null;
    if (Math.abs(dy) < 28) return;
    // Snap to the closest theme; a longer swipe can advance more than one.
    const steps = Math.min(3, Math.max(1, Math.round(Math.abs(dy) / 72)));
    select(selected + (dy < 0 ? steps : -steps));
    ignoreClickUntil = Date.now() + 400;
  });
  wheel.addEventListener("pointercancel", () => { touchStart = null; });

  wheel.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      select(selected + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0);
    } else if (event.key === "End") {
      event.preventDefault();
      select(total - 1);
    }
  });

  window.addEventListener("resize", renderWheel, { passive: true });

  // Keep the initial render correct before any hover or swipe.
  renderWheel();
  showDetail(selected);
})();
