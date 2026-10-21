/* 8bit TOP rotary selector. Seven themes, five visible rows, continuous touch tracking. */
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
  const wrap = i => (i % total + total) % total;
  let selected = 2; // 03 SIGNAL is the approved initial theme.
  let gesture = null;
  let dragPosition = 0;
  let ignoreClickUntil = 0;
  let wheelAccumulated = 0;
  let lastWheelStep = 0;

  function stepSize() {
    // Five visible rows: center, two above and two below.
    return Math.max(64, Math.min(86, (wheel.clientHeight - 76) / 4.35));
  }
  function signedOffset(index) {
    let offset = index - selected;
    const half = Math.floor(total / 2);
    if (offset > half) offset -= total;
    if (offset < -half) offset += total;
    return offset;
  }
  function showDetail() {
    panels.forEach((panel, i) => { panel.hidden = i !== selected; });
    const scroller = panels[selected].querySelector(".detail-lessons-scroll");
    if (scroller) scroller.scrollTop = 0;
  }
  function renderWheel() {
    const step = stepSize();
    buttons.forEach((button, index) => {
      const position = signedOffset(index) - dragPosition;
      const distance = Math.abs(position);
      const visible = distance <= 2.48;
      button.style.setProperty("--wheel-y", (position * step) + "px");
      button.style.setProperty("--wheel-z", (-distance * 24) + "px");
      button.style.setProperty("--wheel-rotate", (-position * 8) + "deg");
      button.style.setProperty("--scale", String(Math.max(.84, 1 - distance * .055)));
      button.style.setProperty("--item-opacity", String(visible ? Math.max(.58, 1 - distance * .17) : 0));
      button.style.zIndex = String(30 - Math.round(distance * 2));
      button.style.pointerEvents = visible ? "auto" : "none";
      button.classList.toggle("is-selected", index === selected && !gesture);
      button.setAttribute("aria-pressed", String(index === selected));
      button.setAttribute("aria-hidden", String(!visible));
    });
    if (counter) counter.textContent = String(selected + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
    if (status) status.textContent = "選択中：" + buttons[selected].dataset.themeName;
  }
  function select(index) {
    selected = wrap(index);
    dragPosition = 0;
    renderWheel();
    showDetail();
  }
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (Date.now() < ignoreClickUntil || gesture) return;
      select(index);
    });
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
    if (event.target.closest(".wheel-control")) return;
    gesture = { id: event.pointerId, y: event.clientY, lastY: event.clientY, lastTime: performance.now(), velocity: 0, start: performance.now(), moved: false };
    dragPosition = 0;
    wheel.classList.add("is-dragging");
    try { wheel.setPointerCapture(event.pointerId); } catch (_) {}
  });
  wheel.addEventListener("pointermove", event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const now = performance.now();
    const dy = event.clientY - gesture.y;
    if (Math.abs(dy) > 7) gesture.moved = true;
    const dt = Math.max(1, now - gesture.lastTime);
    gesture.velocity = (event.clientY - gesture.lastY) / dt;
    gesture.lastY = event.clientY;
    gesture.lastTime = now;
    // Negative dy advances the index. The fractional position follows the finger.
    dragPosition = Math.max(-3.3, Math.min(3.3, -dy / stepSize()));
    renderWheel();
  });
  function finishGesture(event, cancelled = false) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const moved = gesture.moved;
    const velocity = gesture.velocity;
    const traveled = dragPosition;
    gesture = null;
    wheel.classList.remove("is-dragging");
    if (moved) ignoreClickUntil = Date.now() + 450;
    // A small release velocity only helps cross a nearby snap boundary.
    const projected = cancelled ? 0 : traveled + (moved ? Math.max(-.3, Math.min(.3, -velocity * .15)) : 0);
    const steps = moved && Math.abs(projected) >= .38 ? Math.max(-3, Math.min(3, Math.round(projected))) : 0;
    select(selected + steps);
  }
  wheel.addEventListener("pointerup", event => finishGesture(event));
  wheel.addEventListener("pointercancel", event => finishGesture(event, true));
  wheel.addEventListener("lostpointercapture", event => { if (gesture && event.pointerId === gesture.id) finishGesture(event, true); });

  wheel.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      select(selected + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Home") {
      event.preventDefault(); select(0);
    } else if (event.key === "End") {
      event.preventDefault(); select(total - 1);
    }
  });
  window.addEventListener("resize", renderWheel, { passive: true });
  renderWheel();
  showDetail();
})();
