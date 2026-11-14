"""Turn the canvas page Soft.dc.html into a standalone index.html for the repo."""
import re, sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()

BLOBS = {
    "4ae60bfa655a5c133816c6ee050b849b": "/img/bloop-home.webp",
    "10b8a56e3be39fa345d6d383c5b043dc": "/img/bloop-search.webp",
    "27dbc27fe4256ece08ce601ec8715879": "/img/bloop-results.webp",
    "8cd4dfa4b6393ef22d2da5983b63d8b7": "/img/merkorn-home.webp",
    "69828cb31758eb9e4517a349b30ef4a8": "/img/merkorn-clients.webp",
    "25cbf4d64538364b8496549e7699de42": "/img/merkorn-services.webp",
    "1a0eed9fc18966b9a74b41d81c2066a8": "/img/trainee-home.webp",
    "3a2354e63497deab5907e88e924e861d": "/img/trainee-path.webp",
    "a9615e7ab300ad0dc74f65ffc7b34ee8": "/img/trainee-news.webp",
    "d448e4735837a13ac8f9a5d618cbdd79": "/img/trainee-friends.webp",
    "4fee12b2561c20dce6cbd132a76d7268": "/img/orsini-home.webp",
    "db4485044ba387d15848df8b155ffa2b": "/img/orsini-manifesto.webp",
    "7fb71c031fbc47301bd9b4a2e7f11c0e": "/img/orsini-work.webp",
    "7696a5f2a1bf7da6ac5edd15967fe0f4": "/img/trainee-icon.webp",
    "fe63535f7cba4011a430e83a8f77ad62": "/img/gianmarco.webp",
}
def blob(m):
    return BLOBS[m.group(1)]
s = re.sub(r"/_blob/([0-9a-f]{32})", blob, s)
assert "/_blob/" not in s

helmet = re.search(r"<helmet>(.*?)</helmet>", s, re.S).group(1)
body = re.search(r"<x-dc>(.*?)</x-dc>", s, re.S).group(1)
body = re.sub(r"<helmet>.*?</helmet>", "", body, flags=re.S)
script = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', s, re.S).group(1)

# The send button composes an email from the form fields
body = body.replace('<a class="btn" href="mailto:giamma.antonacci@gmail.com?subject=Nuovo%20progetto"',
                    '<a class="btn" id="send" href="mailto:giamma.antonacci@gmail.com?subject=Nuovo%20progetto"')
assert 'id="send"' in body

RUNTIME = r"""
(function () {
  var RE = /\{\{([^}]*)\}\}/g;
  function get(scope, path) {
    return path.replace(/[{}]/g, "").trim().split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, scope);
  }
  function interp(str, scope) {
    return str.replace(RE, function (_, p) { var v = get(scope, p); return v == null ? "" : String(v); });
  }
  function build(node, scope, out) {
    if (node.nodeType === 3) { out.push(document.createTextNode(interp(node.data, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName, i, c;
    if (tag === "sc-for") {
      var list = get(scope, node.getAttribute("list")) || [], as = node.getAttribute("as");
      list.forEach(function (it, idx) {
        var sc = Object.create(scope); sc[as] = it; sc.index = idx;
        for (i = 0; i < node.childNodes.length; i++) build(node.childNodes[i], sc, out);
      });
      return;
    }
    if (tag === "sc-if") {
      if (get(scope, node.getAttribute("value")))
        for (i = 0; i < node.childNodes.length; i++) build(node.childNodes[i], scope, out);
      return;
    }
    var el = document.createElementNS(node.namespaceURI, node.localName);
    el.__h = {};
    for (i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i];
      if (a.name.indexOf("hint-") === 0) continue;
      if (a.name.indexOf("on") === 0 && a.value.indexOf("{{") >= 0) { el.__h[a.name.slice(2)] = get(scope, a.value); continue; }
      el.setAttribute(a.name, interp(a.value, scope));
    }
    var kids = [];
    for (i = 0; i < node.childNodes.length; i++) build(node.childNodes[i], scope, kids);
    for (i = 0; i < kids.length; i++) el.appendChild(kids[i]);
    out.push(el);
  }
  function patch(parent, kids) {
    var old = Array.prototype.slice.call(parent.childNodes), i;
    kids.forEach(function (n, idx) {
      var o = old[idx];
      if (!o) { parent.appendChild(n); return; }
      if (o.nodeType !== n.nodeType || (o.nodeType === 1 && o.localName !== n.localName)) { parent.replaceChild(n, o); return; }
      if (o.nodeType === 3) { if (o.data !== n.data) o.data = n.data; return; }
      if (o.nodeType !== 1) { parent.replaceChild(n, o); return; }
      var oa = Array.prototype.slice.call(o.attributes);
      for (i = 0; i < oa.length; i++) if (!n.hasAttribute(oa[i].name)) o.removeAttribute(oa[i].name);
      for (i = 0; i < n.attributes.length; i++) { var a = n.attributes[i]; if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value); }
      o.__h = n.__h;
      patch(o, Array.prototype.slice.call(n.childNodes));
    });
    for (i = old.length - 1; i >= kids.length; i--) parent.removeChild(old[i]);
  }
  var comp, tpl, app;
  function render() {
    var vals = comp.renderVals(), kids = [], nodes = tpl.content.childNodes;
    for (var i = 0; i < nodes.length; i++) build(nodes[i], vals, kids);
    patch(app, kids);
  }
  window.DCLogic = function () { this.state = {}; this.props = {}; };
  window.DCLogic.prototype.setState = function (p, cb) {
    var next = typeof p === "function" ? p(this.state) : p;
    this.state = Object.assign({}, this.state, next);
    render();
    if (this.componentDidUpdate) this.componentDidUpdate();
    if (cb) cb();
  };
  window.dcMount = function (Component) {
    tpl = document.getElementById("tpl");
    app = document.getElementById("app");
    comp = new Component();
    ["click", "input", "change", "submit", "keydown"].forEach(function (type) {
      app.addEventListener(type, function (e) {
        for (var el = e.target; el && el !== app; el = el.parentNode) {
          var h = el.__h && el.__h[type];
          if (typeof h === "function") h(e);
        }
      });
    });
    render();
    if (comp.componentDidMount) comp.componentDidMount();
  };
})();
"""

SEND = r"""
document.addEventListener("click", function (e) {
  var btn = e.target.closest && e.target.closest("#send");
  if (!btn) return;
  var f = btn.closest("form");
  if (!f) return;
  e.preventDefault();
  var v = function (n) { var el = f.querySelector("[name=" + n + "]"); return el ? el.value.trim() : ""; };
  var types = Array.prototype.map.call(f.querySelectorAll('button[aria-pressed="true"]'), function (b) { return b.textContent.trim(); });
  var lines = [];
  if (types.length) lines.push("Mi serve: " + types.join(", "));
  if (v("nome")) lines.push("Nome: " + v("nome"));
  if (v("email")) lines.push("Email: " + v("email"));
  if (v("azienda")) lines.push("Azienda o progetto: " + v("azienda"));
  if (v("messaggio")) lines.push("", v("messaggio"));
  location.href = "mailto:giamma.antonacci@gmail.com?subject=" + encodeURIComponent("Nuovo progetto" + (v("nome") ? " — " + v("nome") : "")) + "&body=" + encodeURIComponent(lines.join("\n"));
});
"""

helmet_local = re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">\s*', '', helmet)
helmet_local = re.sub(r'<link href="https://fonts.googleapis.com/css2[^"]*" rel="stylesheet">', '<link rel="stylesheet" href="/fonts/fonts.css">', helmet_local).strip()
assert 'fonts.googleapis' not in helmet_local
out = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!--HEAD-->
<meta name="ga-site" content="1">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23111'/%3E%3Ccircle cx='16' cy='16' r='6' fill='%232fe06d'/%3E%3C/svg%3E">
{helmet_local}
</head>
<body>
<template id="tpl">{body}</template>
<div id="app"><!--APP--></div>
<noscript><p style="font-family: system-ui, sans-serif; padding: 24px">Questo sito ha bisogno di JavaScript. Scrivimi a <a href="mailto:giamma.antonacci@gmail.com">giamma.antonacci@gmail.com</a>.</p></noscript>
<script>{RUNTIME}</script>
<script>
{script}
dcMount(Component);
{SEND}
</script>
</body>
</html>
"""
open(dst, "w", encoding="utf-8").write(out)
print("ok", len(out))
