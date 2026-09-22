/* Escavox — site interactions (Motion-powered animations with graceful fallback) */
(function () {
  "use strict";

  var M = window.Motion;                                   // vendored motion.js (UMD global)
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canAnimate = !!(M && M.animate && M.inView) && !reduce;

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Sticky header shadow on scroll */
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Reveal on scroll — Motion when available, instant reveal otherwise */
  var reveals = document.querySelectorAll(".reveal");
  var delayFor = function (el) {
    if (el.classList.contains("d1")) return 0.08;
    if (el.classList.contains("d2")) return 0.16;
    if (el.classList.contains("d3")) return 0.24;
    if (el.classList.contains("d4")) return 0.32;
    return 0;
  };
  if (reveals.length) {
    if (canAnimate) {
      reveals.forEach(function (el) {
        M.inView(el, function () {
          M.animate(
            el,
            { opacity: [0, 1], transform: ["translateY(24px)", "translateY(0px)"] },
            { duration: 0.7, delay: delayFor(el), ease: [0.22, 0.7, 0.3, 1] }
          );
        }, { amount: 0.15, margin: "0px 0px -40px 0px" });
      });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); }); // instant fallback
    }
  }

  /* Count-up for elements with data-count */
  var counters = document.querySelectorAll("[data-count]");
  counters.forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var start = el.getAttribute("data-count-start") ? parseFloat(el.getAttribute("data-count-start")) : 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
    var format = el.getAttribute("data-format");
    var compact = function (v) {
      if (v >= 1e6) { var m = v / 1e6; return (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + "M+"; }
      return Math.round(v / 1e3) + "k";
    };
    var render = format === "compact"
      ? function (v) { el.textContent = compact(v); }
      : function (v) { el.textContent = v.toFixed(decimals) + suffix; };
    if (canAnimate) {
      M.inView(el, function () {
        M.animate(start, target, {
          duration: 1.4,
          ease: [0.22, 0.7, 0.3, 1],
          onUpdate: render,
          onComplete: function () { render(target); }
        });
      }, { amount: 0.6 });
    } else {
      render(target); // instant fallback
    }
  });

  /* Hero entrance — subtle spring lift on the live-tracker visual */
  if (canAnimate) {
    var heroVisual = document.querySelector(".hero-visual .tracker-card");
    if (heroVisual) {
      M.animate(
        heroVisual,
        { opacity: [0, 1], transform: ["translateY(28px) scale(0.98)", "translateY(0px) scale(1)"] },
        { duration: 0.9, delay: 0.15, type: "spring", stiffness: 90, damping: 16 }
      );
    }
  }

  /* Contact form — submits to Web3Forms via AJAX, keeps inline success message */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (form.checkValidity && !form.checkValidity()) { form.reportValidity(); return; }

      var ok = document.querySelector("#form-success");
      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      var payload = {};
      new FormData(form).forEach(function (value, key) { payload[key] = value; });

      fetch(form.getAttribute("action") || "https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) { return res.json(); }).then(function (json) {
        if (!json.success) throw new Error(json.message || "Submission failed");
        form.style.display = "none";
        if (ok) { ok.style.display = "block"; ok.scrollIntoView({ behavior: "smooth", block: "center" }); }
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        alert("Sorry — your message couldn't be sent just now. Please email info@escavox.com and we'll get straight back to you.");
      });
    });
  }

  /* Footer year */
  var yr = document.querySelector("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* Particle globe (hero orbiting visual) */
  document.querySelectorAll(".orbit-globe-canvas").forEach(function (canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var COUNT = 480;
    var points = [];
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < COUNT; i++) {
      var y = 1 - (i / (COUNT - 1)) * 2;
      var r = Math.sqrt(1 - y * y);
      var theta = golden * i;
      points.push({ x: Math.cos(theta) * r, y: y, z: Math.sin(theta) * r });
    }

    var width = 0, height = 0, colorStr = "rgb(3,126,176)";
    var readColor = function () {
      var c = getComputedStyle(canvas).color;
      if (c) colorStr = c;
    };
    var resize = function () {
      var rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColor();
    };
    resize();
    if ("ResizeObserver" in window) { new ResizeObserver(resize).observe(canvas); }
    else { window.addEventListener("resize", resize, { passive: true }); }

    var angle = 0;
    var draw = function () {
      var cx = width / 2, cy = height / 2;
      var radius = (Math.min(width, height) / 2) * 0.94;
      var cos = Math.cos(angle), sin = Math.sin(angle);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colorStr;
      for (var j = 0; j < points.length; j++) {
        var p = points[j];
        var x = p.x * cos - p.z * sin;
        var z = p.x * sin + p.z * cos;
        var depth = (z + 1) / 2;
        ctx.globalAlpha = 0.1 + depth * 0.7;
        ctx.beginPath();
        ctx.arc(cx + x * radius, cy + p.y * radius, 0.6 + depth * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      angle += reduce ? 0.0012 : 0.005;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  });
})();
