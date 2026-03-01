export function showOverlay(opts: {
  className: string;
  title: string;
  subtitle?: string;
  topDecor: string;
  bottomDecor: string;
  duration?: number;
}): void {
  const overlay = document.createElement("div");
  overlay.className = `celebration-overlay ${opts.className}`;

  overlay.innerHTML = `
    <div class="celebration-content">
      <div class="celebration-stars">${opts.topDecor}</div>
      <div class="celebration-title">${opts.title}</div>
      ${opts.subtitle ? `<div class="celebration-level">${opts.subtitle}</div>` : ""}
      <div class="celebration-stars">${opts.bottomDecor}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add("show"));

  const dismiss = () => {
    if (!overlay.parentNode) return;
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    setTimeout(() => overlay.remove(), 500);
  };

  setTimeout(dismiss, opts.duration ?? 3000);
  overlay.addEventListener("click", dismiss);
}
