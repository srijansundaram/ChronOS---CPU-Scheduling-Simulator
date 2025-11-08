// Utility helpers window.$ = (sel, ctx=document) => ctx.querySelector(sel);
window.$$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
window.uid = (prefix = "id") =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
window.todayTag = () => new Date().toISOString().slice(0, 10);
window.toast = (msg) => {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
};
