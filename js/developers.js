/* Developers page — renders "How to connect" and the API reference from
   window.ESCAVOX_API (js/developers-apis.js). Edit the data file, not this one. */
(function () {
  var data = window.ESCAVOX_API;
  var connectEl = document.getElementById("connect-render");
  var refEl = document.getElementById("api-render");
  if (!data || !connectEl || !refEl) return;

  /* ---------- tiny DOM helpers ---------- */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === "text") el.textContent = attrs[k];
      else if (k === "html") el.innerHTML = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  function jsonHtml(v) {
    var s = typeof v === "string" ? v : JSON.stringify(v, null, 2);
    return esc(s).replace(/("(?:[^"\\]|\\.)*")(\s*:)?|\b(-?\d+(?:\.\d+)?)\b|\b(true|false|null)\b/g, function (m, str, colon, num, lit) {
      if (str) return colon ? '<span class="k">' + str + "</span>" + colon : '<span class="s">' + str + "</span>";
      if (num) return '<span class="n">' + num + "</span>";
      return '<span class="n">' + lit + "</span>";
    });
  }

  var auth = (data.connect && data.connect.auth) || {};
  var base = (data.connect && data.connect.baseUrl) || "";
  function curlFor(ep) {
    if (ep.curl) return ep.curl;
    var lines = ["curl -X " + ep.method + ' "' + base + ep.path + '"'];
    if (auth.header) lines.push('  -H "' + auth.header + ": " + (auth.scheme || "{YOUR_API_KEY}") + '"');
    if (ep.body) {
      lines.push('  -H "Content-Type: application/json"');
      lines.push("  -d '" + JSON.stringify(ep.body) + "'");
    }
    return lines.join(" \\\n");
  }

  function codeCard(title, codeHtml, raw, tag) {
    var btn = h("button", { type: "button", class: "code-copy", "aria-label": "Copy " + title, text: "Copy" });
    btn.addEventListener("click", function () {
      var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(raw).then(done, function () {});
    });
    var cap = h("figcaption", null, [h("span", { class: "dots", "aria-hidden": "true", html: "<i></i><i></i><i></i>" }), title]);
    if (tag) cap.appendChild(h("span", { class: "tag", text: tag }));
    cap.appendChild(btn);
    return h("figure", { class: "code-card" }, [cap, h("pre", null, [h("code", { html: codeHtml })])]);
  }

  function badge() { return h("span", { class: "ph-badge", text: "Placeholder" }); }

  /* ---------- How to connect ---------- */
  var c = data.connect || {};
  var steps = h("ol", { class: "steps connect-steps" });
  (c.steps || []).forEach(function (s) {
    var p = h("p", { text: s.text });
    var kids = [h("div", { class: "n" }), h("h3", { text: s.title }), p];
    if (s.link) kids.push(h("a", { class: "btn-link", href: s.link.href, html: esc(s.link.label) + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' }));
    steps.appendChild(h("li", { class: "step" }, kids));
  });

  var facts = h("dl", { class: "api-facts" });
  [["Base URL", c.baseUrl], ["Format", c.format], ["Authentication", auth.type], ["Rate limit", c.rateLimit]].forEach(function (f) {
    if (!f[1]) return;
    facts.appendChild(h("div", null, [h("dt", { text: f[0] }), h("dd", null, [h("code", { text: f[1] })])]));
  });

  var authCurl = "curl \"" + base + "/...\" \\\n  -H \"" + (auth.header || "Authorization") + ": " + (auth.scheme || "{YOUR_API_KEY}") + "\"";
  connectEl.appendChild(steps);
  connectEl.appendChild(h("div", { class: "connect-grid" }, [
    h("div", null, [
      h("h3", null, ["Connection details", data.placeholder ? badge() : null]),
      facts,
      auth.note ? h("p", { class: "code-note", text: auth.note }) : null
    ]),
    h("div", null, [codeCard("Authenticated request", esc(authCurl), authCurl, data.placeholder ? "Placeholder" : null)])
  ]));

  /* ---------- API reference ---------- */
  var nav = h("nav", { class: "api-nav", "aria-label": "APIs" });
  var navList = h("ul");
  nav.appendChild(h("div", { class: "api-nav-title", text: "APIs" }));
  nav.appendChild(navList);
  var body = h("div", { class: "api-body" });

  if (data.placeholder) {
    body.appendChild(h("div", { class: "ph-banner", role: "note" }, [
      h("strong", { text: "Template. " }),
      "These APIs and endpoints are placeholders, shown to illustrate the layout. The published list will replace them."
    ]));
  }

  (data.apis || []).forEach(function (api) {
    var id = "api-" + (api.id || slug(api.name));
    var isPh = data.placeholder || api.placeholder;
    navList.appendChild(h("li", null, [h("a", { href: "#" + id, text: api.name })]));

    var sec = h("section", { class: "api", id: id }, [
      h("div", { class: "api-head" }, [h("h3", null, [api.name, isPh ? badge() : null]), api.summary ? h("p", { text: api.summary }) : null])
    ]);

    (api.endpoints || []).forEach(function (ep) {
      var m = String(ep.method || "GET").toUpperCase();
      var epId = id + "-" + m.toLowerCase() + "-" + slug(ep.path);
      var det = h("details", { class: "ep", id: epId }, [
        h("summary", null, [
          h("span", { class: "method m-" + m.toLowerCase(), text: m }),
          h("code", { class: "ep-path", text: ep.path }),
          h("span", { class: "ep-sum", text: ep.summary || "" })
        ])
      ]);
      var inner = h("div", { class: "ep-body" });
      if (ep.description) inner.appendChild(h("p", { text: ep.description }));

      if (ep.params && ep.params.length) {
        var tb = h("tbody");
        ep.params.forEach(function (p) {
          tb.appendChild(h("tr", null, [
            h("td", null, [h("code", { text: p.name }), p.required ? h("span", { class: "req", text: "required" }) : null]),
            h("td", { text: p.in || "" }),
            h("td", { text: p.type || "" }),
            h("td", { text: p.description || "" })
          ]));
        });
        inner.appendChild(h("div", { class: "param-wrap" }, [h("table", { class: "param-table" }, [
          h("thead", null, [h("tr", null, [h("th", { text: "Parameter" }), h("th", { text: "In" }), h("th", { text: "Type" }), h("th", { text: "Description" })])]),
          tb
        ])]));
      }

      var curl = curlFor(ep);
      var examples = h("div", { class: "ep-examples" }, [codeCard("Request", esc(curl), curl)]);
      if (ep.response != null) {
        var raw = typeof ep.response === "string" ? ep.response : JSON.stringify(ep.response, null, 2);
        examples.appendChild(codeCard("Response", jsonHtml(ep.response), raw, isPh ? "Placeholder" : null));
      }
      inner.appendChild(examples);
      det.appendChild(inner);
      sec.appendChild(det);
    });
    body.appendChild(sec);
  });

  refEl.appendChild(nav);
  refEl.appendChild(body);

  /* Open an endpoint when it is deep-linked (#api-tracks-get-tracks) */
  var target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.tagName === "DETAILS") target.open = true;
})();
