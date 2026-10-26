/* ZFNAFA : fonctionne sans internet. La page est prise sur le réseau quand il y en a, sinon dans la mémoire du téléphone. */
var CACHE = "zfnafa-v3";
var CORE = ["./ZF-Cahier.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
function fromCache(req) { return caches.match(req).then(function (m) { return m || caches.match("./ZF-Cahier.html"); }); }
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (u.pathname.slice(-13) === "/messages.json") return;
  if (u.origin === self.location.origin) {
    e.respondWith(
      Promise.race([fetch(r), new Promise(function (_, no) { setTimeout(no, 4000); })])
        .then(function (res) { if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); } return res; })
        .catch(function () { return fromCache(r).then(function (m) { return m || fetch(r); }); })
    );
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(function (m) {
      return m || fetch(r).then(function (res) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); return res; });
    }));
  }
});
