/* =========================================================
   香港 12/5–12/7 聖誕限定行程 — 互動邏輯
   - 三日行程分頁切換
   - Leaflet 互動地圖：座標標記、依日期／分類上色、圖例切換
   ========================================================= */
(function () {
  'use strict';

  var D = window.HK_DATA || {};
  var COLORS = D.DAY_COLORS || {};
  var LABELS = D.DAY_LABELS || {};

  /* ---------- 1. 三日行程分頁 ---------- */
  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.day-tab'));
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var day = tab.getAttribute('data-day');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        document.querySelectorAll('.day-panel').forEach(function (p) {
          p.classList.toggle('active', p.id === 'panel-' + day);
        });
      });
      // 鍵盤左右切換
      tab.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(tab);
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); next.focus(); next.click(); }
      });
    });
  }

  /* ---------- 2. 地圖 ---------- */
  var CAT_ORDER = ['d1', 'd2', 'd3', 'hotel', 'airport', 'move', 'food', 'gift', 'dead'];
  var CAT_ICON = { d1: '🎄', d2: '🎄', d3: '🎄', hotel: '🏨', airport: '✈', move: '🚇', food: '🍚', gift: '🎁', dead: '·' };

  // 三日動線（依實際行程順序）
  var ROUTES = {
    d1: [[22.3080,113.9185],[22.2775,114.1730],[22.2776,114.1747],[22.2820,114.1580],[22.2850,114.1590],[22.2830,114.1595],[22.2820,114.1545],[22.2819,114.1600],[22.2820,114.1585],[22.2775,114.1645],[22.2836,114.1533],[22.2768,114.1712],[22.2755,114.1710]],
    d2: [[22.2757,114.1740],[22.2870,114.2110],[22.2865,114.2160],[22.2783,114.1830],[22.2795,114.1840],[22.2800,114.1830],[22.2810,114.1868],[22.2936,114.1700],[22.2950,114.1680],[22.2955,114.1685],[22.2965,114.1755],[22.2970,114.1720],[22.3005,114.1725],[22.2965,114.1785],[22.2995,114.1730],[22.2988,114.1735]],
    d3: [[22.2775,114.1730],[22.2865,114.1520],[22.2868,114.1512],[22.2890,113.9420],[22.2890,113.9430],[22.2895,113.9425],[22.3080,113.9185]]
  };

  function buildPoints() {
    var pts = [];
    function push(list, cat) {
      (list || []).forEach(function (o) {
        if (typeof o.lat !== 'number' || typeof o.lng !== 'number') return;
        pts.push({
          n: o.n, v: o.v || '', a: o.a || '', d: o.d || '', plan: o.plan || '',
          lat: o.lat, lng: o.lng, cat: cat, day: o.day || cat
        });
      });
    }
    push(D.EVENTS, null);   // EVENTS 自帶 day
    push(D.MOVES, null);    // MOVES 自帶 day
    push(D.FOOD, null);     // FOOD 自帶 day
    push(D.GIFTS, null);    // GIFTS 自帶 day
    // 修正：EVENTS/MOVES/FOOD/GIFTS 的 day 欄位即分類
    pts.forEach(function (p) { p.cat = p.day; });
    return pts;
  }

  function initMap() {
    var el = document.getElementById('hkmap');
    if (!el || typeof L === 'undefined') return;

    var map = L.map(el, { scrollWheelZoom: false, zoomControl: true })
      .setView([22.295, 114.13], 11);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var points = buildPoints();
    var layers = {};   // cat -> array of markers
    var routeLayers = {};

    // 三日動線（虛線）
    Object.keys(ROUTES).forEach(function (day) {
      var line = L.polyline(ROUTES[day], {
        color: COLORS[day] || '#888',
        weight: 3, opacity: 0.55, dashArray: '7 8', lineJoin: 'round'
      }).addTo(map);
      routeLayers[day] = line;
    });

    // 標記
    points.forEach(function (p) {
      var color = COLORS[p.cat] || '#888';
      var isDead = p.cat === 'dead';
      var m = L.circleMarker([p.lat, p.lng], {
        radius: isDead ? 5 : 7,
        color: '#fff', weight: 2,
        fillColor: color, fillOpacity: isDead ? 0.55 : 0.95
      });
      var tag = LABELS[p.cat] || p.cat;
      var html = '<div class="p-tag" style="background:' + color + '">' + esc(tag) + '</div>' +
        '<h4>' + esc(p.n) + '</h4>' +
        (p.v ? '<div class="p-loc">' + esc(p.v) + '</div>' : '') +
        (p.a ? '<div class="p-loc">' + esc(p.a) + '</div>' : '') +
        (p.d ? '<div class="p-date">📅 ' + esc(p.d) + '</div>' : '') +
        (p.plan ? '<p class="p-plan">' + esc(p.plan) + '</p>' : '');
      m.bindPopup(html, { maxWidth: 300 });
      m.bindTooltip(p.n, { direction: 'top', offset: [0, -6] });
      m.addTo(map);
      (layers[p.cat] = layers[p.cat] || []).push(m);
    });

    // 圖例
    var legend = document.getElementById('mapLegend');
    var active = {};
    CAT_ORDER.forEach(function (cat) { active[cat] = true; });

    function applyFilter() {
      CAT_ORDER.forEach(function (cat) {
        var on = active[cat];
        (layers[cat] || []).forEach(function (m) {
          if (on) { if (!map.hasLayer(m)) m.addTo(map); }
          else { if (map.hasLayer(m)) map.removeLayer(m); }
        });
      });
      Object.keys(routeLayers).forEach(function (day) {
        var on = active[day];
        if (on) { if (!map.hasLayer(routeLayers[day])) routeLayers[day].addTo(map); }
        else { if (map.hasLayer(routeLayers[day])) map.removeLayer(routeLayers[day]); }
      });
    }

    if (legend) {
      CAT_ORDER.forEach(function (cat) {
        var count = (layers[cat] || []).length;
        if (!count) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'legend-btn';
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('data-cat', cat);
        btn.innerHTML = '<span class="swatch" style="background:' + (COLORS[cat] || '#888') + '"></span>' +
          esc(LABELS[cat] || cat) + ' <span style="opacity:.6">' + count + '</span>';
        btn.addEventListener('click', function () {
          active[cat] = !active[cat];
          btn.setAttribute('aria-pressed', active[cat] ? 'true' : 'false');
          applyFilter();
        });
        legend.appendChild(btn);
      });
    }

    // 讓地圖在分頁／視窗變化後正確重繪
    window.addEventListener('resize', function () { map.invalidateSize(); });
    setTimeout(function () { map.invalidateSize(); }, 300);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- boot ---------- */
  function boot() {
    initTabs();
    initMap();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
