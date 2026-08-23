/* 演示共享工具：主题跟随、canvas 高清适配、动画循环、随机数、颜色 */
export const THEME = new URLSearchParams(location.search).get('theme') || 'light';
document.documentElement.dataset.theme = THEME;

export const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export function fitCanvas(canvas) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(r.width * dpr));
  canvas.height = Math.max(1, Math.round(r.height * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* 观察容器尺寸变化，自动重设 canvas。
   返回 2D context（浏览器对同一 canvas 恒返回同一 ctx 对象，可安全长期持有）。
   onChange 延迟到下一帧调用，避免 `let ctx = autoFit(...)` 的暂时性死区（TDZ）错误 */
export function autoFit(canvas, onChange) {
  const ro = new ResizeObserver(() => { fitCanvas(canvas); onChange && onChange(); });
  ro.observe(canvas.parentElement);
  const ctx = fitCanvas(canvas);
  if (onChange) requestAnimationFrame(() => onChange());
  return ctx;
}

/* 可控随机数（种子固定 → 可复现实验） */
export function RNG(seed = 42) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function gauss(rng, mu = 0, sigma = 1) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;

export const PALETTE = ['#b4482b', '#0f766e', '#4338ca', '#b45309', '#be185d', '#0e7490', '#7c3aed', '#065f46'];

/* 简易动画循环：start/stop，每帧回调 (t 秒) */
export function loop(fn) {
  let raf = 0, t0 = performance.now(), running = true;
  function frame(now) {
    if (!running) return;
    fn((now - t0) / 1000);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return { stop() { running = false; cancelAnimationFrame(raf); } };
}

/* 通用 UI 构建器 */
export function slider(opts) {
  // {label, min, max, step, value, fmt, onInput} -> element
  const d = document.createElement('div');
  d.className = 'ctl';
  d.innerHTML = `<label><span>${opts.label}</span><b></b></label>
    <input type="range" min="${opts.min}" max="${opts.max}" step="${opts.step ?? 1}" value="${opts.value}">`;
  const b = d.querySelector('b'), r = d.querySelector('input');
  const fmt = opts.fmt || (v => v);
  b.textContent = fmt(opts.value);
  r.addEventListener('input', () => { b.textContent = fmt(+r.value); opts.onInput && opts.onInput(+r.value); });
  d.setValue = v => { r.value = v; b.textContent = fmt(+v); };
  return d;
}
export function brkSwitch(label, onChange, checked = false) {
  const l = document.createElement('label');
  l.className = 'switch';
  l.innerHTML = `<input type="checkbox" ${checked ? 'checked' : ''}><span class="tk"></span><span>${label}</span>`;
  l.querySelector('input').addEventListener('change', e => onChange(e.target.checked));
  return l;
}
