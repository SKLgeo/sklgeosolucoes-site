// Comportamento mínimo do site: menu no celular, cabeçalho ao rolar e entrada suave das seções.
// Sem bibliotecas nem chamadas externas.
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function fecharMenu() {
    document.body.classList.remove("nav-open");
    if (burger) { burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Abrir menu"); }
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var aberto = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", aberto ? "true" : "false");
      burger.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) fecharMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fecharMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1080) fecharMenu(); });
  }

  // Aba com subabas: abre/fecha no toque ou clique (no computador também abre ao passar o mouse)
  document.querySelectorAll(".menu-grupo").forEach(function (grupo) {
    var botao = grupo.querySelector(".menu-topo");
    botao.addEventListener("click", function (e) {
      e.stopPropagation();
      var aberto = grupo.classList.toggle("aberto");
      botao.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!grupo.contains(e.target)) { grupo.classList.remove("aberto"); botao.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { grupo.classList.remove("aberto"); botao.setAttribute("aria-expanded", "false"); }
    });
  });

  // Zoom: clicar numa tela abre a versão grande (assets/<nome>-g.webp), com setas para as outras telas da página
  var telas = Array.prototype.slice.call(document.querySelectorAll(".device img"));
  if (telas.length) {
    var lb = document.createElement("div");
    lb.className = "lb"; lb.hidden = true;
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Tela ampliada");
    lb.innerHTML = '<button type="button" class="lb-fechar" aria-label="Fechar">×</button>' +
      '<button type="button" class="lb-ant" aria-label="Tela anterior">‹</button>' +
      '<button type="button" class="lb-prox" aria-label="Próxima tela">›</button><img alt=""><p></p>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img"), lbTxt = lb.querySelector("p"), atual = 0, origem = null;
    function grande(src) { return /\/(logo|banner)/.test(src) || /-g\.webp$/.test(src) ? src : src.replace(/\.webp$/, "-g.webp"); }
    function mostrar(i) {
      atual = (i + telas.length) % telas.length;
      var t = telas[atual], fig = t.closest("figure"), cap = fig && fig.querySelector("figcaption");
      lbImg.onerror = function () { lbImg.onerror = null; lbImg.src = t.currentSrc || t.src; };
      lbImg.src = grande(t.getAttribute("src"));
      lbImg.alt = t.alt;
      lbTxt.textContent = cap ? cap.textContent : t.alt;
    }
    function abrir(i) { origem = document.activeElement; mostrar(i); lb.hidden = false; document.body.classList.add("lb-aberto"); lb.querySelector(".lb-fechar").focus(); }
    function fechar() { lb.hidden = true; document.body.classList.remove("lb-aberto"); if (origem && origem.focus) origem.focus(); }
    telas.forEach(function (t, i) {
      t.setAttribute("tabindex", "0");
      t.addEventListener("click", function () { abrir(i); });
      t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(i); } });
      var dica = document.createElement("span");
      dica.className = "zoom-dica"; dica.textContent = "⤢ Ampliar";
      t.parentNode.appendChild(dica);
    });
    lb.querySelector(".lb-fechar").addEventListener("click", fechar);
    lb.querySelector(".lb-ant").addEventListener("click", function () { mostrar(atual - 1); });
    lb.querySelector(".lb-prox").addEventListener("click", function () { mostrar(atual + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) fechar(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowLeft") mostrar(atual - 1);
      else if (e.key === "ArrowRight") mostrar(atual + 1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
    });
  }

  var itens = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    itens.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  itens.forEach(function (el, i) {
    el.style.transitionDelay = (i % 3) * 80 + "ms";
    obs.observe(el);
  });
})();
