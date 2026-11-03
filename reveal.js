// Scroll reveal: fades elements in as they enter the viewport.
// Attach with: new Reveal(rootEl, { mode, distance, stagger })
export class Reveal {
  constructor(root, opts = {}) {
    this.root = root;
    this.mode = opts.mode || "Fade up";
    this.distance = opts.distance ?? 28;
    this.stagger = opts.stagger ?? 90;
    this.seen = new WeakSet();
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.io = null;
    this.start();
  }

  hidden(el) {
    const d = this.distance;
    if (this.mode === "Scale in") return { opacity: "0", transform: "scale(0.94)" };
    if (this.mode === "Slide in") return { opacity: "0", transform: "translateX(" + d + "px)" };
    return { opacity: "0", transform: "translateY(" + d + "px)" };
  }

  prime(el) {
    const h = this.hidden(el);
    el.style.willChange = "opacity, transform";
    el.style.transition = "opacity 720ms cubic-bezier(.22,.61,.36,1), transform 720ms cubic-bezier(.22,.61,.36,1)";
    el.style.opacity = h.opacity;
    el.style.transform = h.transform;
  }

  show(el, i) {
    const delay = this.mode === "Fade up" || this.mode === "Scale in" ? (i % 4) * this.stagger : 0;
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "none";
      setTimeout(() => { el.style.willChange = "auto"; }, 800);
    }, delay);
  }

  clear() {
    if (this.io) this.io.disconnect();
    this.els().forEach(el => {
      el.style.transition = "";
      el.style.opacity = "";
      el.style.transform = "";
      el.style.willChange = "";
    });
    this.seen = new WeakSet();
  }

  els() {
    return Array.from(this.root.querySelectorAll("[data-reveal]"));
  }

  start() {
    const els = this.els();
    if (this.mode === "Off" || this.reduced) return;
    els.forEach(el => this.prime(el));
    this.io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (this.seen.has(entry.target)) return;
        const passed = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        if (!entry.isIntersecting && !passed) return;
        this.seen.add(entry.target);
        if (passed) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "none";
          entry.target.style.willChange = "auto";
        } else {
          this.show(entry.target, els.indexOf(entry.target));
        }
        this.io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    els.forEach(el => this.io.observe(el));
  }

  update(opts) {
    this.clear();
    Object.assign(this, opts);
    this.start();
  }

  destroy() { if (this.io) this.io.disconnect(); }
}
