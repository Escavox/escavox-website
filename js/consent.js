/* Escavox — cookie consent. Google Analytics loads only after a visitor accepts.
   Choice is remembered in localStorage; any [data-cookie-settings] link reopens the banner. */
(function () {
  "use strict";

  var GA_ID = "G-3FF48SF577";
  var KEY = "escavox-consent";                              // "granted" | "denied"
  var script = document.currentScript;
  var POLICY = (script && script.getAttribute("data-policy")) || "cookie-policy.html";
  var banner = null;
  var gaLoaded = false;

  function getChoice() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { window.localStorage.setItem(KEY, v); } catch (e) { /* private mode: choice lasts this page only */ }
  }

  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID);
  }

  /* Remove GA cookies (set on this host or its parent domain) after consent is withdrawn */
  function clearGACookies() {
    var host = location.hostname;
    var domains = ["", host, "." + host, "." + host.replace(/^www\./, "")];
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") !== 0) return;
      domains.forEach(function (d) {
        document.cookie = name + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  function addStyles() {
    if (document.getElementById("ev-consent-css")) return;
    var css = document.createElement("style");
    css.id = "ev-consent-css";
    css.textContent =
      ".ev-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;" +
      "background:#072130;color:#fff;border-radius:12px;padding:18px 20px;box-shadow:0 12px 32px rgba(7,33,48,.35);" +
      "font:15px/1.5 'PT Sans',system-ui,sans-serif}" +
      ".ev-consent p{margin:0 0 14px;color:#fff}" +
      ".ev-consent a{color:#8FD0FA;text-decoration:underline}" +
      ".ev-consent-actions{display:flex;gap:10px;flex-wrap:wrap}" +
      ".ev-consent button{flex:1 1 140px;min-height:44px;border-radius:8px;font:700 15px 'PT Sans',system-ui,sans-serif;cursor:pointer;" +
      "border:2px solid #fff;background:transparent;color:#fff}" +
      ".ev-consent button.ev-accept{background:#EF8131;border-color:#EF8131}" +
      ".ev-consent button:focus-visible{outline:3px solid #2EA3F2;outline-offset:2px}";
    document.head.appendChild(css);
  }

  function hideBanner() {
    if (banner) { banner.remove(); banner = null; }
  }

  function decide(v) {
    var before = getChoice();
    setChoice(v);
    hideBanner();
    if (v === "granted") { loadGA(); return; }
    clearGACookies();
    if (before === "granted" && gaLoaded) location.reload();   // stop the already-running tag
  }

  function showBanner() {
    if (banner) return;
    addStyles();
    banner = document.createElement("div");
    banner.className = "ev-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie preferences");

    var p = document.createElement("p");
    p.appendChild(document.createTextNode(
      "We'd like to use Google Analytics cookies to understand how visitors use this site. " +
      "They're only set if you accept. "));
    var a = document.createElement("a");
    a.href = POLICY;
    a.textContent = "Cookie policy";
    p.appendChild(a);

    var actions = document.createElement("div");
    actions.className = "ev-consent-actions";
    [["Decline", "denied", "ev-decline"], ["Accept", "granted", "ev-accept"]].forEach(function (b) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = b[2];
      btn.textContent = b[0];
      btn.addEventListener("click", function () { decide(b[1]); });
      actions.appendChild(btn);
    });

    banner.appendChild(p);
    banner.appendChild(actions);
    document.body.appendChild(banner);
  }

  function init() {
    var choice = getChoice();
    if (choice === "granted") loadGA();
    else if (choice !== "denied") showBanner();

    document.addEventListener("click", function (ev) {
      var t = ev.target.closest && ev.target.closest("[data-cookie-settings]");
      if (!t) return;
      ev.preventDefault();
      showBanner();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
