/* CleanFrame Home. Static materials, local preferences and public Tizen app controls. */
(function () {
  'use strict';

  /* ---------- Bundled data ---------- */
  const ASSETS = 'assets/';
  const ICONS = ASSETS + 'icons/';
  const WP = ASSETS + 'wallpapers/';
  const CAP = 9;
  const SCRIM_Y = 560;
  const DOCK_MODES = { both: { tw: 288, th: 200, pitch: 296 }, text: { tw: 288, th: 104, pitch: 296 }, icons: { tw: 176, th: 144, pitch: 184 } };
  const GRID_ROW = 240;
  const GRID_COL = 344;
  const COLS = 5;
  const ED_ROW = 80;
  const ED_SEP = 56;
  const ED_VIEW = 752;
  const PH_TOP = 220;
  const PH_PITCH = 128;
  const PH_FULL = 5;
  const PH_HEIGHT = 944;
  const PH_COMPACT_TOP = 144;
  const PH_COMPACT_PITCH = 88;
  const PH_COMPACT_VISIBLE = 9;
  const WALL_VISIBLE = 6;
  const WALL_ROW = 92;
  const WALL_DELAY = 200;
  const KEYS = { 37: 'left', 38: 'up', 39: 'right', 40: 'down', 13: 'ok', 27: 'back', 8: 'back', 10009: 'back', 461: 'back' };
  const FULL = 'Die Startseite fasst neun Apps. Zuerst eine entfernen.';
  const LAST = 'Mindestens eine App';

  const PRIMARY_APPS = [
    { id: 'stremio', name: 'Stremio', mark: true, appId: 'IkWsFHtOY9.Stremio' },
    { id: 'netflix', name: 'Netflix', mark: true, appId: 'org.tizen.netflix-app' },
    { id: 'disneyplus', name: 'Disney+', mark: true, appId: 'MCmYXNxgcu.DisneyPlus' },
    { id: 'youtube', name: 'YouTube', mark: true, appId: '9Ur5IzDKqV.TizenYouTube' },
    { id: 'appletv', name: 'Apple TV', mark: true, appId: 'com.samsung.tv.aria-video' },
    { id: 'primevideo', name: 'Prime Video', mark: true, appId: 'org.tizen.primevideo' },
    { id: 'abciview', name: 'ABC iview', mark: true, appId: 'mWK87Xghap.ABCiview' },
    { id: 'sbs', name: 'SBS On Demand', mark: true, appId: 'OyE7OuxlUi.SBSOnDemand' },
    { id: 'applemusic', name: 'Apple Music', mark: true, appId: 'org.tizen.apple.apple-music' }
  ];
  const EXTRA_MARKS = ['hbomax', 'spotify', 'tubi', 'zdf', 'ard', 'joyn'];
  function describe(appId) { const d = window.FrameDevice && FrameDevice.describe ? FrameDevice.describe(appId) : null; return { brand: d && EXTRA_MARKS.indexOf(d.brand) >= 0 ? d.brand : '', name: d && d.name || '' }; }
  const PRIMARY = PRIMARY_APPS.map(function (a) { return a.id; });
  const APPS = PRIMARY_APPS.slice();
  let ALPHA = [];
  const WALLS = window.CleanFrameWallpapers || [{ id: 'misty', name: 'Nebelküste', tone: 'light', ut: { tr: 'mist', br: 'mist' }, frostVeil: .20 }];
  const ADAPTIVE_INK = window.CleanFrameAdaptiveInk || {};
  WALLS.forEach(function (w) { w.ut = w.ut || { tr: 'light', br: 'light' }; w.frostVeil = w.frostVeil || .12; });
  const MODES = [
    { id: 'fixed', name: 'Fest', min: 0 }, { id: 'open', name: 'Bei jedem Öffnen der Startseite', min: 0 },
    { id: '5', name: 'Alle 5 Minuten', min: 5 }, { id: '15', name: 'Alle 15 Minuten', min: 15 },
    { id: '60', name: 'Stündlich', min: 60 }
  ];
  const KEY = 'cleanframe.home.v1';
  let storageOk = true;
  const catalog = { loading: false, loaded: false, error: null, request: 0, revision: 0 };
  const QA = window.ShoreQA = { minuteMs: window.ShoreQA && window.ShoreQA.minuteMs || 60000 };
  const FONTS = {
    manrope: { name: 'Manrope', family: 'Manrope', display: 600, ui: 500, clock: 500 },
    montreal: { name: 'Neue Montreal', family: 'Study Montreal', display: 300, ui: 400, clock: 300 },
    mori: { name: 'Mori', family: 'Study Mori', display: 200, ui: 400, clock: 200 },
    pangram: { name: 'Pangram Sans', family: 'Study Pangram', display: 300, ui: 400, clock: 300 },
    geist: { name: 'Geist', family: 'Study Geist', display: 300, ui: 400, clock: 300 },
    newsreader: { name: 'Newsreader', family: 'Study Newsreader', display: 400, ui: 400, clock: 400 }
  };
  const PRIVATE_FONTS = window.CleanFramePrivateFontIDs || [];
  const fontMetrics = {};
  const unavailableFonts = {};
  let widthCache = {};
  let fontRevision = 0;
  let fontsReady = false;
  const LOOK_VALUES = { bg: ['dark', 'light', 'photo'], layout: ['list', 'dock'], apps: ['icons', 'both', 'text'], font: Object.keys(FONTS).filter(function (id) { return id === 'manrope' || PRIVATE_FONTS.indexOf(id) >= 0; }), controls: ['icons', 'both', 'text'], focus: ['type', 'glass'], material: ['soft', 'frost', 'tint'] };
  const LOOK_NAMES = { bg: 'Hintergrund', layout: 'Layout', apps: 'Apps', font: 'Schrift', controls: 'Bedienelemente', focus: 'Fokus', material: 'Material' };
  const VALUE_NAMES = { dark: 'Dunkel', light: 'Hell', photo: 'Foto', list: 'Liste', dock: 'Dock', type: 'Schrift', glass: 'Glas', soft: 'Weich', frost: 'Milchglas', tint: 'Klar getönt', icons: 'Symbole', both: 'Symbole und Text', text: 'Text' };
  const UTIL = { art: ['Art Mode', 'art'], apps: ['Alle Apps', 'apps'], arrange: ['Anordnen', 'arrange'], settings: ['Einstellungen', 'settings'] };
  const MSG = {
    leave: { title: 'Startseite verlassen?', line: 'Samsung Home öffnen?', note: '', actions: [['stay', 'Bleiben'], ['samsung', 'Samsung Home']] }
  };
  const SVG = {
    art: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="9.8" r="1.5"/><path d="m4.5 17.5 4.5-4.5 3 3 2.5-2.5 5 5"/>',
    apps: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    arrange: '<path d="M4 8.5h14M15 5.5l3 3-3 3M20 15.5H6M9 12.5l-3 3 3 3"/>',
    settings: '<path d="m9 3-.6 2.4-2 1.2L4 6l-2 3.5L3.8 11v2L2 14.5 4 18l2.4-.6 2 1.2L9 21h6l.6-2.4 2-1.2 2.4.6 2-3.5-1.8-1.5v-2L22 9.5 20 6l-2.4.6-2-1.2L15 3Z"/><circle cx="12" cy="12" r="3.2"/>',
    home: '<path d="M4 11 12 4.5l8 6.5v8a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1Z"/>',
    undo: '<path d="M9 6 5 10l4 4"/><path d="M5 10h9.5a4.5 4.5 0 0 1 0 9H11"/>',
    check: '<path d="m5.5 12.5 4 4 9-9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    left: '<path d="m14.5 5-7 7 7 7"/>',
    right: '<path d="m9.5 5 7 7-7 7"/>',
    up: '<path d="m5 15.5 7-7 7 7"/>',
    down: '<path d="m5 8.5 7 7 7-7"/>',
    updown: '<path d="m7.5 9.5 4.5-4.5 4.5 4.5M7.5 14.5l4.5 4.5 4.5-4.5"/>',
    tv: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7"/>',
    warn: '<path d="M12 4 2.8 19.5h18.4Z"/><path d="M12 10v4.5M12 17.3v.1"/>'
  };

  /* ---------- State ---------- */
  const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const S = {
    variant: 'B', geom: 'broad', c: null, stack: null,
    sel: null, selIdx: 0, lastUtil: 0, appsFocus: null, settingsFocus: 'background', appearanceFocus: 'bg', detailFocus: {},
    undo: [], removedAt: {}, note: null, err: null,
    writes: 0, failed: 0, log: [], logN: 0, lastLaunch: null, press: null,
    wallShown: null, wallPending: null, wallError: null,
    shown: null, pending: null, lookError: null, bundleKey: null, previewBundle: null, reflow: false, fontSwitch: false
  };
  const scroll = { first: 0, off: 0, photo: 0, photoArrange: 0 };
  function pick(v, list, fallback) {
    v = String(v || '').toLowerCase();
    for (let i = 0; i < list.length; i++) if (list[i].toLowerCase() === v) return list[i];
    return fallback;
  }
  function lookOf(c) { return { bg: c.bg, wall: c.wall, layout: c.layout, apps: c.apps, font: c.font, controls: c.controls, focus: c.focus, material: c.material }; }
  function materialApplies(c) { c = c || S.c; return c.bg === 'photo' && (c.layout === 'dock' || c.focus === 'glass'); }

  /* ---------- Helpers ---------- */
  function app(id) { for (let i = 0; i < APPS.length; i++) if (APPS[i].id === id) return APPS[i]; return null; }
  function wall(id) { for (let i = 0; i < WALLS.length; i++) if (WALLS[i].id === id) return WALLS[i]; return null; }
  function wallIndex(id) { for (let i = 0; i < WALLS.length; i++) if (WALLS[i].id === id) return i; return 0; }
  function frostClass(w) { const i = [.12, .20, .30, .36, .44].indexOf(w.frostVeil); return i > 0 ? ' fv-' + (i + 1) : ''; }
  function wallClasses(w) { return frostClass(w) + (w.listColumn ? ' lc-' + w.listColumn : '') + (w.dockQuiet ? ' db-quiet' : '') + (w.clockMist ? ' tl-mist' : ''); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function without(list, id) { return list.filter(function (x) { return x !== id; }); }
  function same(a, b) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function onHome(id) { return S.c.home.indexOf(id) >= 0; }
  function top() { return S.stack[S.stack.length - 1]; }
  function push(e) { S.stack.push(e); return e; }
  function pop() { if (S.stack.length > 1) S.stack.pop(); }
  function px(n) { return n.toFixed(2) + 'px'; }
  function icon(name, cls, underlay) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">'
      + (underlay ? '<g class="ut-underlay" transform="translate(0 .5)">' + SVG[name] + '</g><g class="ut-ink">' + SVG[name] + '</g>' : SVG[name]) + '</svg>';
  }
  function badge(on) {
    return on
      ? '<svg class="badge is-on" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path class="badge-tick" d="m7.6 12.4 3 3 5.8-6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg class="badge is-off" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  }
  function log(text) { S.log.unshift('#' + (++S.logN) + ' ' + text); if (S.log.length > 10) S.log.pop(); }

  const maskSupport = 'webkitMaskImage' in document.documentElement.style || 'maskImage' in document.documentElement.style;
  const markProbes = {};
  function probeMark(id) {
    if (markProbes[id]) return;
    const im = new Image(); markProbes[id] = 'loading';
    im.onload = function () { markProbes[id] = 'ok'; };
    im.onerror = function () {
      markProbes[id] = 'bad';
      Array.prototype.forEach.call(document.querySelectorAll('[data-mark="' + id + '"]'), function (el) { el.className += ' is-bad'; });
    };
    im.src = ICONS + id + '.svg';
  }
  /* Optical placement is identical for the CSS mask and the image fallback. */
  function markHtml(id, w, h, size) {
    const m = window.FrameIconMetrics && window.FrameIconMetrics[id];
    let st;
    if (m) {
      const weight = clamp(Math.pow(0.45 / m.fill, 0.3), 0.84, 1.25);
      const k = Math.min(w / m.w, h / m.h, size * weight / Math.sqrt(m.w * m.h));
      const s = m.n * k;
      st = 'width:' + px(s) + ';height:' + px(s) + ';left:' + px(w / 2 - (m.x + m.w / 2) * k) + ';top:' + px(h / 2 - (m.y + m.h / 2) * k);
    } else st = 'width:' + w + 'px;height:' + h + 'px;left:0;top:0;object-fit:contain';
    probeMark(id);
    return '<span class="mark' + (markProbes[id] === 'bad' ? ' is-bad' : '') + '" data-mark="' + id + '" style="width:' + w + 'px;height:' + h + 'px">'
      + (maskSupport ? '<span class="mk" style="' + st + ';-webkit-mask-image:url(' + ICONS + id + '.svg);mask-image:url(' + ICONS + id + '.svg)"></span>' : '<img alt="" src="' + ICONS + id + '.svg" style="' + st + '">') + '</span>';
  }
  function appMark(a, w, h, size) {
    if (a.mark && (maskSupport || S.c.bg !== 'light')) return markHtml(a.brand || a.id, w, h, size);
    const words = a.name.split(/\s+/);
    const letters = words[0].charAt(0) + (words.length > 1 ? words[1].charAt(0) : '');
    return '<span class="mark monogram' + (a.icon ? ' native-icon' : '') + '" style="width:' + w + 'px;height:' + h + 'px;font-size:' + Math.round(size * .65) + 'px"><span>' + esc(letters.toUpperCase()) + '</span>'
      + (a.icon ? '<img alt="" data-native-icon="true" src="' + esc(a.icon) + '">' : '') + '</span>';
  }
  function smallMark(a) { return appMark(a, 56, 44, 36); }
  const measureCanvas = document.createElement('canvas');
  const measureContext = measureCanvas.getContext('2d');
  const measureSpan = document.createElement('span');
  measureSpan.setAttribute('aria-hidden', 'true');
  measureSpan.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;white-space:pre;font-synthesis:none;';
  document.body.appendChild(measureSpan);
  function homeFont() { return S.shown && S.shown.font || 'manrope'; }
  function fontRole(id, role, size) {
    const f = FONTS[id];
    const serif = id === 'newsreader';
    return { family: f.family,
      weight: role === 'display' ? f.display : role === 'clock' ? f.clock : serif ? 400 : f.ui,
      opsz: serif ? role === 'display' ? 72 : role === 'clock' ? 48 : role === 'ui' && (!size || size === 28) ? 28 : 36 : 0 };
  }
  function measureFace(id, faces) {
    const result = { roles: {}, digits: [], digitCell: 0 };
    const roles = { display: [88, 76, 56], clock: [48], primary: [30, 32, 34, 36, 40], ui: [28, 30, 48] };
    const face = id === 'newsreader' ? faces[0][0] : null;
    const original = face ? face.variationSettings : '';
    let r;
    Object.keys(roles).forEach(function (role) {
      result.roles[role] = {};
      // Canvas has no optical-size property. Set this face's default only while measuring;
      // CSS specifies each rendered role explicitly, and the descriptor is restored below.
      roles[role].forEach(function (size) {
        r = fontRole(id, role, size);
        if (face) face.variationSettings = r.opsz ? '"opsz" ' + r.opsz : original;
        measureContext.font = r.weight + ' ' + size + 'px "' + r.family + '"';
        const m = measureContext.measureText('H');
        const d = measureContext.measureText('gjpqy');
        result.roles[role][size] = { cap: m.actualBoundingBoxAscent || size * .72, ascent: m.fontBoundingBoxAscent || size * 1.066, descent: m.fontBoundingBoxDescent || size * .3, lower: d.actualBoundingBoxDescent || size * .255 };
      });
    });
    if (face) face.variationSettings = original;
    r = fontRole(id, 'clock');
    measureSpan.style.font = r.weight + ' 48px/64px "' + r.family + '"';
    measureSpan.style.letterSpacing = '0'; measureSpan.style.fontVariantNumeric = 'tabular-nums';
    measureSpan.style.fontVariationSettings = r.opsz ? '"opsz" ' + r.opsz : 'normal';
    const widths = '0123456789'.split('').map(function (n) { measureSpan.textContent = n; return measureSpan.getBoundingClientRect().width; });
    const min = Math.min.apply(Math, widths);
    const max = Math.max.apply(Math, widths);
    result.digits = widths; result.digitCell = max - min > .02 ? max : 0;
    return result;
  }
  function fontChoices() {
    LOOK_VALUES.font = Object.keys(FONTS).filter(function (id) { return id === 'manrope' || PRIVATE_FONTS.indexOf(id) >= 0 && !unavailableFonts[id]; });
  }
  function retryFontFaces(id) {
    // A rejected CSS FontFace cannot load again. Recreate only that failed family's
    // rules; the displayed family's faces and the rest of the stylesheet stay intact.
    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      let rules;
      let i;
      let rule;
      let family;
      let css;
      try { rules = sheet.cssRules; } catch (e) { return; }
      if (!rules) return;
      for (i = 0; i < rules.length; i++) {
        rule = rules[i];
        if (rule.type !== 5) continue;
        family = rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim();
        if (family !== FONTS[id].family) continue;
        css = rule.cssText; sheet.deleteRule(i); sheet.insertRule(css, i);
      }
    });
  }
  function loadFont(id, done) {
    const f = FONTS[id];
    const weights = [f.display];
    let timer;
    let ended = false;
    if (fontMetrics[id]) { done(true); return; }
    if (!document.fonts || !document.fonts.load) { if (id === 'manrope') { fontMetrics.manrope = measureFace('manrope', []); fontsReady = true; done(true); } else done(false, 'unsupported'); return; }
    if (unavailableFonts[id]) retryFontFaces(id);
    if (id !== 'newsreader' && weights.indexOf(f.ui) < 0) weights.push(f.ui);
    function finish(ok, reason, faces) {
      if (ended) return;
      ended = true; clearTimeout(timer);
      if (ok) {
        fontMetrics[id] = measureFace(id, faces); delete unavailableFonts[id];
        // Measurements and cached markup belong to a particular loaded font.
        widthCache = {}; fontRevision++;
        if (id === 'manrope') fontsReady = true;
      } else if (reason !== 'timeout') unavailableFonts[id] = true;
      fontChoices(); done(ok, reason);
    }
    timer = setTimeout(function () { finish(false, 'timeout'); }, 3000);
    Promise.all(weights.map(function (weight) { return document.fonts.load(weight + ' 88px "' + f.family + '"'); })).then(function (faces) {
      finish(faces.every(function (list) { return list.length > 0 && list.every(function (face) { return face.status === 'loaded'; }); }), 'load', faces);
    }, function () { finish(false, 'load'); });
  }
  let baselineRecovery = false;
  function ensureFont(id, done) {
    loadFont('manrope', function (ok, reason) {
      if (!ok && id === 'manrope') {
        // The local fallback keeps Home usable if the baseline face is slow or missing.
        fontMetrics.manrope = measureFace('manrope', []); fontMetrics.manrope.fallback = true; fontsReady = true;
        done(true, reason);
        if (!baselineRecovery && document.fonts && document.fonts.ready) {
          baselineRecovery = true;
          document.fonts.ready.then(function () {
            delete fontMetrics.manrope; delete unavailableFonts.manrope;
            loadFont('manrope', function (loaded) {
              if (!loaded) { fontMetrics.manrope = measureFace('manrope', []); fontMetrics.manrope.fallback = true; fontsReady = true; }
              render();
            });
          });
        }
        return;
      }
      if (!ok || id === 'manrope') done(ok, reason); else loadFont(id, done);
    });
  }
  function fontShift(role, size) {
    const id = homeFont();
    const base = fontMetrics.manrope;
    const metrics = fontMetrics[id]; 
    if (id === 'manrope' || !base || !metrics) return 0;
    const a = base.roles[role][size];
    const b = metrics.roles[role][size];
    return (a.ascent - a.descent - a.cap - b.ascent + b.descent + b.cap) / 2;
  }
  function textWidth(text, size, weight, spacing, role) {
    const id = homeFont();
    const r = fontRole(id, role || 'ui', size);
    let width;
    if (id !== 'manrope') { weight = r.weight; spacing = role === 'display' ? -size * .01 : 0; }
    const key = [id, role || 'ui', text, size, weight, spacing].join('|');
    if (widthCache.hasOwnProperty(key)) return widthCache[key];
    if (r.opsz) {
      measureSpan.style.font = weight + ' ' + size + 'px "' + r.family + '"';
      measureSpan.style.fontVariationSettings = '"opsz" ' + r.opsz;
      measureSpan.style.fontVariantNumeric = 'normal'; measureSpan.style.letterSpacing = '0'; measureSpan.textContent = text;
      width = measureSpan.getBoundingClientRect().width;
    } else {
      measureContext.font = (weight || 500) + ' ' + size + 'px "' + r.family + '", Arial, sans-serif';
      width = measureContext.measureText(text).width;
    }
    width += Math.max(0, text.length - 1) * (spacing || 0);
    // Do not retain fallback measurements made before the baseline font is ready.
    if (fontMetrics[id] && !fontMetrics[id].fallback) widthCache[key] = width;
    return width;
  }
  function dockLabelSize(id) { return S.c.apps === 'text' ? (textWidth(app(id).name, 40, 600, -.8, 'primary') > 264 ? 34 : 40) : textWidth(app(id).name, 36, 500, -.8, 'primary') > 280 ? 32 : 36; }
  function reducedDockLabel(id) { return S.c.apps !== 'icons' && dockLabelSize(id) === (S.c.apps === 'text' ? 34 : 32); }
  function actionWidth(text) { return clamp(Math.ceil(textWidth(text, 30, 500, -.3) + 40), 288, 400); }
  function photoLabel(id, compact) {
    const text = app(id).name;
    let size = compact ? 56 : 88;
    const limit = compact ? 640 : 992;
    let width = textWidth(text, size, 600, -1.8, 'display');
    if (!compact && width > limit) { size = 76; width = textWidth(text, size, 600, -1.8, 'display'); }
    // Newsreader's ninth compact Type row otherwise enters the lower fade by .63px.
    return { size: size, top: (compact ? 10.66 : size === 76 ? 10.36 : 9.68) + fontShift('display', size) - (compact && homeFont() === 'newsreader' ? .7 : 0), width: Math.min(limit, width), ellipsis: width > limit };
  }
  function listPlateWidth(id, compact) {
    if (S.c.apps === 'icons') return compact ? 120 : 144;
    const text = S.c.apps === 'text';
    return clamp(Math.ceil(photoLabel(id, compact).width + (text ? 84 : compact ? 156 : 184)), text ? 280 : 360, text ? compact ? 724 : 1076 : compact ? 796 : 1176);
  }

  /* Keyed children: elements persist by key so transforms animate instead of re-creating.
     Children are absolutely positioned, so DOM order never needs to change. */
  function keyed(parent, items, update) {
    const map = parent._k || (parent._k = {});
    const seen = {};
    let i;
    let it;
    let el;
    let isNew;
    let k;
    for (i = 0; i < items.length; i++) {
      it = items[i]; el = map[it.key]; isNew = !el;
      if (isNew) { el = document.createElement('div'); map[it.key] = el; }
      update(el, it, i);
      if (isNew) parent.appendChild(el);
      seen[it.key] = 1;
    }
    for (k in map) if (map.hasOwnProperty(k) && !seen[k]) { if (map[k].parentNode === parent) parent.removeChild(map[k]); delete map[k]; }
  }
  function setContent(el, sig, renderContent) {
    sig += '|' + catalog.revision + '|' + fontRevision;
    if (el._sig === sig) return;
    el.innerHTML = renderContent();
    el._sig = sig;
    Array.prototype.forEach.call(el.querySelectorAll('[data-native-icon]'), function (img) {
      function ready() { img.parentNode.classList.add('has-native-icon'); }
      function failed() { img.style.display = 'none'; img.parentNode.classList.remove('has-native-icon'); }
      img.onload = ready; img.onerror = failed;
      if (img.complete) { if (img.naturalWidth) ready(); else failed(); }
    });
  }
  function setHTML(el, html) { if (el._html !== html) { el._html = html; el.innerHTML = html; } }
  function attrs(el, z, i, action) { el.setAttribute('data-z', z); el.setAttribute('data-i', String(i)); el.setAttribute('data-action', action); }

  /* ---------- Saved preferences ---------- */
  function safeId(id) { return typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,160}$/.test(id) && ['constructor', 'prototype', '__proto__'].indexOf(id) < 0; }
  function safeIcon(path) { return typeof path === 'string' && path.length < 2048 && /^(?:\/[^\/]|file:\/\/\/|wgt-package:\/\/\/)/.test(path) ? path : ''; }
  function load() {
    const keys = [KEY, 'cleanframe.shore.v1'];
    let raw;
    let saved;
    let i;
    for (i = 0; i < keys.length; i++) {
      try {
        raw = localStorage.getItem(keys[i]);
        if (!raw) continue;
        saved = JSON.parse(raw);
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) return saved;
      } catch (e) { storageOk = false; }
    }
    return null;
  }
  function clean(saved) {
    const s = saved && typeof saved === 'object' ? saved : {};
    const modern = s.look && typeof s.look === 'object' ? s.look : s;
    const legacyList = s.theme === 'list';
    let h = [];
    const recent = [];
    const records = Array.isArray(s.appRecords) ? s.appRecords : [];
    records.slice(0, 256).forEach(function (a) {
      if (!a || !safeId(a.id) || !safeId(a.appId) || typeof a.name !== 'string' || !a.name.trim() || app(a.id)) return;
      const known = describe(a.appId);
      const brand = EXTRA_MARKS.indexOf(a.brand) >= 0 ? a.brand : known.brand;
      APPS.push({ id: a.id, appId: a.appId, name: (known.name || a.name).slice(0, 160), brand: brand, mark: !!brand, icon: safeIcon(a.icon) });
    });
    (Array.isArray(s.home) ? s.home : Array.isArray(s.dock) ? s.dock : []).forEach(function (id) {
      if (!safeId(id) || h.indexOf(id) >= 0 || h.length >= CAP) return;
      if (!app(id) && id.indexOf('.') > 0) { const known = describe(id); APPS.push({ id: id, appId: id, name: known.name || id.split('.').pop(), brand: known.brand, mark: !!known.brand }); }
      if (app(id)) h.push(id);
    });
    if (!h.length) h = PRIMARY.slice();
    (Array.isArray(s.recent) ? s.recent : []).forEach(function (id) { if (safeId(id) && app(id) && h.indexOf(id) < 0 && recent.indexOf(id) < 0 && recent.length < 5) recent.push(id); });
    return {
      bg: pick(modern.bg, LOOK_VALUES.bg, legacyList ? 'dark' : 'photo'), layout: pick(modern.layout, LOOK_VALUES.layout, legacyList ? 'list' : 'dock'),
      apps: pick(modern.apps, LOOK_VALUES.apps, legacyList ? 'text' : 'both'), controls: pick(modern.controls, LOOK_VALUES.controls, 'both'),
      focus: pick(modern.focus, LOOK_VALUES.focus, legacyList ? 'type' : 'glass'), material: pick(modern.material, LOOK_VALUES.material, 'soft'),
      font: pick(modern.font, LOOK_VALUES.font, 'manrope'), wall: wall(modern.wall || s.wallpaper) ? modern.wall || s.wallpaper : WALLS[0].id,
      home: h, recent: recent, lastApp: h.indexOf(s.lastApp) >= 0 ? s.lastApp : h[0],
      mode: pick(s.mode, MODES.map(function (m) { return m.id; }), 'fixed')
    };
  }
  function serialise(c) {
    const out = {};
    Object.keys(c).forEach(function (key) { out[key] = c[key]; });
    out.version = 2; out.look = lookOf(c); out.dock = c.home.slice(); out.wallpaper = c.wall;
    out.theme = c.layout === 'list' ? 'list' : 'shore';
    out.appRecords = [];
    c.home.concat(c.recent).forEach(function (key) {
      const a = app(key);
      if (a && PRIMARY.indexOf(key) < 0 && !out.appRecords.some(function (r) { return r.id === key; })) out.appRecords.push({ id: a.id, appId: a.appId, name: a.name, brand: a.brand || '', icon: a.icon || '' });
    });
    return out;
  }
  function initialise() {
    const saved = load(); S.c = clean(saved);
    const initial = next(S.c.home.slice(), S.c.recent.slice());
    S.stack = [{ id: 'home', f: { zone: 'apps', u: 0 } }];
    S.sel = S.c.lastApp; S.selIdx = S.c.home.indexOf(S.sel);
    if (saved && initial.mode === 'open') initial.wall = WALLS[(wallIndex(initial.wall) + 1) % WALLS.length].id;
    // Keep the old schema keys alongside the builder values for in-place updates.
    try { localStorage.setItem(KEY, JSON.stringify(serialise(initial))); S.c = initial; storageOk = true; } catch (e) { storageOk = false; }
  }
  function clearSession() { S.undo = []; S.removedAt = {}; S.note = null; S.err = null; }
  function begin() { S.note = null; }
  function next(home, recent) { const c = lookOf(S.c); c.home = home; c.recent = recent; c.lastApp = S.c.lastApp; c.mode = S.c.mode; return c; }
  function snap() { return { home: S.c.home.slice(), recent: S.c.recent.slice() }; }
  function pushRecent(list, id) { return [id].concat(without(list, id)).slice(0, 5); }
  function write(c, label) {
    try { localStorage.setItem(KEY, JSON.stringify(serialise(c))); }
    catch (e) { storageOk = false; S.failed++; S.err = label; log('Not saved: ' + label); return false; }
    if (c.wall !== S.c.wall || c.mode !== S.c.mode) resetRotation();
    storageOk = true; S.c = c; S.writes++; S.err = null; log('Saved: ' + label);
    return true;
  }
  function errText(lifted) {
    return 'Speichern fehlgeschlagen. Nichts wurde geändert.';
  }
  function statusHtml(def, lifted) {
    if (S.err) return '<span class="warn error-chip">' + esc(errText(lifted)) + '</span>';
    return esc(S.note || def);
  }

  function ensureSel() {
    const h = S.c.home;
    let i;
    if (!h.length) { S.sel = null; return -1; }
    i = h.indexOf(S.sel);
    if (i < 0) { i = clamp(S.selIdx, 0, h.length - 1); S.sel = h[i]; }
    S.selIdx = i;
    return i;
  }
  function setSel(id) { S.sel = id; S.selIdx = S.c.home.indexOf(id); }

  /* Membership and order operations shared by B and C. A works on slots (below). */
  function homeRemove(id) {
    const a = app(id);
    const i = S.c.home.indexOf(id);
    const before = snap(); 
    if (i < 0) return false;
    if (S.c.home.length <= 1) { S.note = LAST; return false; }
    const h = S.c.home.slice(); h.splice(i, 1);
    if (!write(next(h, pushRecent(S.c.recent, id)), 'Remove ' + a.name + ' from Home')) return false;
    S.removedAt[id] = i;
    S.undo.push({ label: a.name + ' entfernen', snap: before });
    return true;
  }
  function homeAdd(id) {
    const a = app(id);
    const before = snap();
    const h = S.c.home.slice(); 
    if (h.length >= CAP) { S.note = FULL; return false; }
    const at = S.removedAt.hasOwnProperty(id) ? Math.min(S.removedAt[id], h.length) : h.length;
    h.splice(at, 0, id);
    if (!write(next(h, without(S.c.recent, id)), 'Add ' + a.name + ' to Home')) return false;
    S.undo.push({ label: a.name + ' hinzufügen', snap: before });
    return true;
  }
  function homeMove(order, id, before) {
    const a = app(id);
    if (!write(next(order, S.c.recent.slice()), 'Move ' + a.name)) return false;
    S.undo.push({ label: a.name + ' verschieben', snap: before });
    return true;
  }
  function undoLast(arr) {
    const u = S.undo[S.undo.length - 1];
    if (!u) { S.note = 'Nichts rückgängig zu machen'; return false; }
    if (!write(next(u.snap.home.slice(), u.snap.recent.slice()), 'Undo ' + u.label)) return false;
    S.undo.pop();
    S.note = 'Rückgängig gemacht: ' + u.label + '.';
    return true;
  }
  function undoLabel() { const u = S.undo[S.undo.length - 1]; return u ? u.label : ''; }
  function undoCaption() { const label = undoLabel(); return label ? 'Rückgängig: ' + label : 'Nichts rückgängig zu machen'; }
  function editStatus(hint, move) {
    if (S.err) return statusHtml('', !!move);
    if (S.note === FULL || S.note === LAST) return '<span class="warn">' + esc(S.note) + '</span>';
    if (hint === FULL || hint === LAST) return '<span class="warn">' + esc(hint) + '</span>';
    return esc(move || hint || S.note || '');
  }

  let busy = false;
  let busyTimer = 0;
  function release() { busy = false; clearTimeout(busyTimer); S.press = null; }
  function message(title, line, note) {
    push({ id: 'message', msg: 'error', content: { title: title, line: line, note: note || '', actions: [['back', 'Zurück']] }, f: { b: 0 } });
  }
  function perform(title, run) {
    if (busy) return;
    busy = true; busyTimer = setTimeout(release, 10000);
    run(function (err) {
      release();
      if (err) message(title, err.message || 'Der Fernseher konnte diese Ansicht nicht öffnen.', err.detail || '');
      render(); syncRotation();
    });
  }
  function launch(id) {
    const a = app(id);
    let c;
    if (!a || busy) return;
    if (S.c.home.indexOf(id) >= 0) { c = next(S.c.home.slice(), S.c.recent.slice()); c.lastApp = id; write(c, 'Last app'); }
    S.press = id; S.lastLaunch = a.name;
    perform(a.name, function (done) { FrameDevice.launchApp(a.appId, done); });
  }
  function refreshCatalog() {
    let oldFocus;
    if (catalog.loading) return;
    const request = ++catalog.request; catalog.loading = true; catalog.error = null;
    FrameDevice.apps(function (err, entries) {
      if (request !== catalog.request) return;
      catalog.loading = false;
      if (err) { catalog.error = err.message || 'Installierte Apps konnten nicht gelesen werden.'; if (!catalog.loaded) ALPHA = []; render(); return; }
      oldFocus = top().id === 'apps' ? ALPHA[top().f.i] : null;
      ALPHA = [];
      entries.forEach(function (entry) {
        const id = PRIMARY.indexOf(entry.brand) >= 0 ? entry.brand : entry.appId;
        let a;
        if (!safeId(id) || !safeId(entry.appId) || ALPHA.indexOf(id) >= 0) return;
        a = app(id);
        if (!a) { a = { id: id }; APPS.push(a); }
        a.appId = entry.appId; a.brand = entry.brand || ''; a.mark = !!entry.brand;
        a.icon = safeIcon(entry.icon);
        a.name = PRIMARY.indexOf(id) >= 0 ? PRIMARY_APPS[PRIMARY.indexOf(id)].name : String(entry.name).slice(0, 160);
        ALPHA.push(id);
      });
      ALPHA.sort(function (a, b) { return app(a).name.toLowerCase().localeCompare(app(b).name.toLowerCase()); });
      catalog.loaded = true; catalog.error = null; catalog.revision++;
      if (top().id === 'apps' && oldFocus && ALPHA.indexOf(oldFocus) >= 0) top().f.i = ALPHA.indexOf(oldFocus);
      norm(); render();
    });
  }

  /* ---------- Navigation targets ---------- */
  function utils() { return ['art', 'apps', 'settings']; }
  /* prev/next run along the apps; out goes to the controls, inn comes back (or to a per-app action). */
  function axes() {
    const v = S.c.layout === 'list';
    return { prev: v ? 'up' : 'left', next: v ? 'down' : 'right', out: v ? 'right' : 'up', inn: v ? 'left' : 'down' };
  }
  function utilAction(u) {
    if (u === 'art') perform('Art Mode', FrameDevice.art);
    else if (u === 'apps') openApps();
    else openSettings();
  }
  function addAppsRoute() { openEditor('home'); }
  function openSettings() { push({ id: 'settings', f: { id: S.settingsFocus } }); }
  function openAppearance(group) {
    const axis = { background: 'bg', layout: 'layout', typography: 'font', focus: 'focus' }[group];
    const action = S.detailFocus[group] || (axis ? 'choice.' + axis + '.' + S.c[axis] : group === 'rotation' ? 'rotation.' + S.c.mode : 'samsung.home');
    push({ id: 'appearance', group: group, f: { action: action } });
  }
  function openMessage(key) { push({ id: 'message', msg: key, f: { b: 0 } }); }
  function openApps() {
    const e = { id: 'apps', mode: 'browse', top: 0, f: { zone: 'grid', i: Math.max(0, ALPHA.indexOf(S.appsFocus)), h: 0 } };
    push(e); refreshCatalog(); return e;
  }
  function openEditor(origin) {
    const i = ensureSel();
    clearSession();
    refreshCatalog();
    push({ id: 'editor', origin: origin, lifted: null, top: 0, otherReturn: { id: otherList()[0] || null, index: 0, top: 0 }, f: { zone: S.c.home.length ? 'home' : 'other', i: Math.max(0, i), part: 'name', h: 1, j: 0 } });
  }
  function openWallpaper() {
    const i = wallIndex(S.c.wall);
    S.err = null; S.wallError = null;
    push({ id: 'wallpaper', i: i, top: clamp(i - 2, 0, Math.max(0, WALLS.length - WALL_VISIBLE)), f: { zone: 'photo' },
      previewTimer: 0, previewDue: null, applyPending: null, failedId: null, failedApply: false, retryBundle: null });
  }
  function isSettingsDetail(t) { return t.id === 'appearance' || t.id === 'wallpaper'; }

  const V = {};

  /* ---------- Home (browse) ---------- */
  V.home = {
    key: function (t, k) {
      const f = t.f;
      const h = S.c.home;
      const U = utils();
      const x = axes();
      const i = ensureSel();
      if (S.c.layout === 'list') { listHomeKey(t, k, i, U); return; }
      if (f.zone === 'util') {
        f.u = clamp(f.u, 0, U.length - 1);
        if (k === x.prev && f.u > 0) f.u--;
        else if (k === x.next && f.u < U.length - 1) f.u++;
        else if (k === x.inn || k === 'back') f.zone = 'apps';
        else if (k === 'ok') { S.lastUtil = f.u; utilAction(U[f.u]); return; }
        S.lastUtil = f.u;
        return;
      }
      f.zone = 'apps';
      if (k === x.out) { f.zone = 'util'; f.u = clamp(S.lastUtil, 0, U.length - 1); }
      else if (k === 'back') openMessage('leave');
      else if (!h.length) { if (k === 'ok') addAppsRoute(); }
      else if (k === x.prev && i > 0) setSel(h[i - 1]);
      else if (k === x.next && i < h.length - 1) setSel(h[i + 1]);
      else if (k === 'ok') launch(S.sel);
    },
    point: function (t, z, i) {
      if (z === 'util') { t.f.zone = 'util'; t.f.u = i; S.lastUtil = i; }
      else if (z === 'app') { t.f.zone = 'apps'; setSel(S.c.home[i]); }
      else if (z === 'empty') t.f.zone = 'apps';
      else return;
      this.key(t, 'ok');
    }
  };
  function listHomeKey(t, k, i, U) {
    const f = t.f;
    const h = S.c.home;
    if (f.zone === 'util') {
      f.u = clamp(f.u, 0, U.length - 1);
      if (k === 'up' && f.u > 0) f.u--;
      else if (k === 'down' && f.u < U.length - 1) f.u++;
      else if (k === 'left' || k === 'back') f.zone = 'apps';
      else if (k === 'ok') { S.lastUtil = f.u; utilAction(U[f.u]); return; }
      S.lastUtil = f.u;
      return;
    }
    f.zone = 'apps';
    if (k === 'up' && i > 0) setSel(h[i - 1]);
    else if (k === 'right') { f.zone = 'util'; f.u = clamp(S.lastUtil, 0, U.length - 1); }
    else if (k === 'down' && i < h.length - 1) setSel(h[i + 1]);
    else if (k === 'back') openMessage('leave');
    else if (k === 'ok') { if (h.length) launch(S.sel); else addAppsRoute(); }
  }

  /* ---------- Wallpaper child: focus previews, activation applies ---------- */
  function cancelWallpaperTimer(t) {
    clearTimeout(t.previewTimer); t.previewTimer = 0; t.previewDue = null;
  }
  function failWallpaper(t, id, apply, bundle) {
    t.applyPending = null; t.failedId = id; t.failedApply = apply; t.retryBundle = bundle || null;
    restoreLook();
    if (!bundle) S.wallError = id;
  }
  function applyWallpaper(t, prepared) {
    const w = WALLS[t.i];
    const bundle = prepared || S.previewBundle;
    if (!prepared && (S.wallPending || t.previewDue || S.wallShown !== w.id || S.wallError)) {
      t.applyPending = w.id;
      if (t.previewDue || S.wallPending !== w.id) { cancelWallpaperTimer(t); loadWallpaperPreview(t); }
      return;
    }
    t.applyPending = null;
    if (w.id === S.c.wall) { S.err = null; t.failedId = null; t.failedApply = false; t.retryBundle = null; return; }
    if (!bundle || bundle.key !== bundleKey({ wall: w.id, material: S.c.material })) { t.applyPending = w.id; loadWallpaperPreview(t); return; }
    const c = next(S.c.home.slice(), S.c.recent.slice()); c.wall = w.id;
    if (!write(c, 'Wallpaper ' + w.name)) { failWallpaper(t, w.id, true, bundle); return; }
    installBundle(bundle, c); committedBundle = bundle; S.previewBundle = null;
    t.failedId = null; t.failedApply = false; t.retryBundle = null;
  }
  function loadWallpaperPreview(t) {
    const id = WALLS[t.i].id;
    cancelWallpaperTimer(t);
    showWall(id, function (ok) {
      if (top() !== t || WALLS[t.i].id !== id) return;
      if (!ok) failWallpaper(t, id, t.applyPending === id, null);
      else if (t.applyPending === id) applyWallpaper(t);
      render(); syncRotation();
    });
  }
  function previewWallpaper(t, index, apply, immediate) {
    
    cancelWallpaperTimer(t); cancelLook();
    t.i = index; t.f.zone = 'photo'; const id = WALLS[index].id;
    t.applyPending = apply ? id : null; t.failedId = null; t.failedApply = false; t.retryBundle = null;
    S.err = null; S.wallError = null;
    if (id === S.c.wall && committedBundle) {
      installBundle(committedBundle, S.c, true); S.previewBundle = null;
      if (apply) applyWallpaper(t);
      return;
    }
    if (S.wallShown === id && S.previewBundle && S.previewBundle.key === bundleKey({ wall: id, material: S.c.material })) {
      if (apply) applyWallpaper(t);
      return;
    }
    if (apply || immediate) { loadWallpaperPreview(t); return; }
    const target = lookOf(S.c); target.wall = id;
    S.pending = { patch: { wall: id }, target: target, row: 'bg', preview: true, transient: false, deferred: true };
    t.previewDue = id;
    t.previewTimer = setTimeout(function () { if (top() === t && WALLS[t.i].id === id) loadWallpaperPreview(t); }, WALL_DELAY);
  }
  function retryWallpaper(t) {
    const apply = t.failedApply;
    const bundle = t.retryBundle;
    t.f.zone = 'photo';
    if (bundle && apply) applyWallpaper(t, bundle);
    else previewWallpaper(t, t.i, apply, true);
  }
  function closeWallpaper(t) {
    cancelWallpaperTimer(t); t.applyPending = null; S.err = null; pop(); restoreLook();
    if (top().id === 'appearance' && top().group === 'background') detailFocus(top(), { action: 'background.wallpaper' }, 0);
  }
  V.wallpaper = {
    norm: function (t) {
      t.i = clamp(t.i, 0, WALLS.length - 1);
      if (t.f.zone === 'retry' && !t.failedId) t.f.zone = 'photo';
      if (t.i < t.top) t.top = t.i;
      if (t.i >= t.top + WALL_VISIBLE) t.top = t.i - WALL_VISIBLE + 1;
      t.top = clamp(t.top, 0, Math.max(0, WALLS.length - WALL_VISIBLE));
    },
    key: function (t, k) {
      if (k === 'back') { closeWallpaper(t); return; }
      if (t.f.zone === 'back') {
        if (k === 'ok') closeWallpaper(t);
        else if (k === 'down' || k === 'right') t.f.zone = 'photo';
        return;
      }
      if (t.f.zone === 'retry') {
        if (k === 'ok') retryWallpaper(t);
        else if (k === 'up' || k === 'left') t.f.zone = 'photo';
        return;
      }
      if (k === 'left' || k === 'up' && t.i === 0) { t.f.zone = 'back'; t.applyPending = null; }
      else if (k === 'up' && t.i > 0) previewWallpaper(t, t.i - 1, false);
      else if (k === 'down' && t.i < WALLS.length - 1) previewWallpaper(t, t.i + 1, false);
      else if ((k === 'right' || k === 'down') && t.failedId) t.f.zone = 'retry';
      else if (k === 'ok') { if (t.retryBundle) applyWallpaper(t, t.retryBundle); else applyWallpaper(t); }
    },
    point: function (t, z, i) {
      if (z === 'wall-back') closeWallpaper(t);
      else if (z === 'wall-retry') retryWallpaper(t);
      else if (z === 'wall-choice' && i >= 0 && i < WALLS.length) {
        if (i === t.i) { t.f.zone = 'photo'; this.key(t, 'ok'); }
        else previewWallpaper(t, i, true);
      }
    }
  };

  /* ---------- Installed apps ---------- */
  function appsItems() { return catalog.error ? [] : ALPHA; }
  function appsHead() { return catalog.error ? [['retry', 'Erneut versuchen', '', '']] : [['editor', 'Apps auf der Startseite', '', 'home']]; }
  V.apps = {
    sheet: true,
    norm: function (t) {
      const n = appsItems().length;
      t.f.i = clamp(t.f.i, 0, Math.max(0, n - 1));
      if (!n) t.f.zone = 'head';
    },
    key: function (t, k) {
      const f = t.f;
      const items = appsItems();
      const n = items.length;
      const col = f.i % COLS;
      const row = Math.floor(f.i / COLS);
      if (k === 'back') { pop(); return; }
      if (f.zone === 'head') {
        if (k === 'down' && n) f.zone = 'grid';
        else if (k === 'ok') { if (catalog.error) refreshCatalog(); else openEditor('apps'); }
        return;
      }
      if (k === 'left' && col > 0) f.i--;
      else if (k === 'right' && col < COLS - 1 && f.i < n - 1) f.i++;
      else if (k === 'down' && row < Math.ceil(n / COLS) - 1) f.i = Math.min(f.i + COLS, n - 1);
      else if (k === 'up') { if (row > 0) f.i -= COLS; else f.zone = 'head'; }
      else if (k === 'ok' && n) launch(items[f.i]);
      S.appsFocus = items[f.i] || null;
    },
    point: function (t, z, i) { if (z === 'grid') { t.f.zone = 'grid'; t.f.i = i; } else if (z === 'head') t.f.zone = 'head'; else return; this.key(t, 'ok'); }
  };

  /* ---------- B: two-zone Home editor ---------- */
  function otherGroups() {
    const rec = S.c.recent.filter(function (id) { return !onHome(id) && app(id); });
    return { recent: rec, rest: ALPHA.filter(function (id) { return !onHome(id) && rec.indexOf(id) < 0; }) };
  }
  function otherList() { const o = otherGroups(); return o.recent.concat(o.rest); }
  function editorCut() { return 5; }
  function editorHomeY(i) { return i * ED_ROW + (i >= editorCut() ? 24 : 0); }
  function editorOtherY(j) {
    const o = otherGroups();
    return j * ED_ROW + (o.recent.length ? ED_SEP : 0) + (o.recent.length && j >= o.recent.length ? ED_SEP : 0);
  }
  function rememberOther(t) {
    const list = otherList();
    t.otherReturn = { id: list[t.f.j] || null, index: t.f.j, top: t.top };
  }
  function returnOther(t) {
    const list = otherList();
    const memory = t.otherReturn;
    const i = memory ? list.indexOf(memory.id) : -1;
    t.f.zone = 'other';
    t.f.j = i >= 0 ? i : clamp(memory ? memory.index : 0, 0, Math.max(0, list.length - 1));
    if (memory) t.top = memory.top;
  }
  function nearestHome(t, count) {
    const target = editorOtherY(t.f.j) - t.top + 36;
    let best = 0;
    let distance = Infinity;
    let i;
    let d;
    for (i = 0; i < count; i++) {
      d = Math.abs(editorHomeY(i) + 36 - target);
      if (d < distance) { best = i; distance = d; }
    }
    return best;
  }
  V.editor = {
    sheet: true,
    norm: function (t) {
      const f = t.f;
      const nh = (t.lifted ? t.lifted.order : S.c.home).length;
      const no = otherList().length;
      f.i = clamp(f.i, 0, Math.max(0, nh - 1));
      f.j = clamp(f.j, 0, Math.max(0, no - 1));
      if (f.zone === 'home' && !nh) f.zone = no ? 'other' : 'head';
      if (f.zone === 'other' && !no) f.zone = nh ? 'home' : 'head';
    },
    key: function (t, k) {
      const f = t.f;
      const H = t.lifted ? t.lifted.order : S.c.home;
      const O = otherList();
      const nh = H.length;
      const no = O.length;
      let d;
      let tmp;
      if (t.lifted) {
        d = k === 'up' ? -1 : k === 'down' ? 1 : 0;
        if (d && f.i + d >= 0 && f.i + d < nh) { tmp = H[f.i + d]; H[f.i + d] = H[f.i]; H[f.i] = tmp; f.i += d; S.err = null; }
        else if (k === 'ok') editorPlace(t);
        else if (k === 'back') { f.i = t.lifted.from; t.lifted = null; S.err = null; }
        return;
      }
      if (k === 'back') { closeEditor(t); return; }
      if (f.zone === 'head') {
        if (k === 'left' && f.h > 0) f.h--;
        else if (k === 'right' && f.h < 1) f.h++;
        else if (k === 'down') { if (no) returnOther(t); else if (nh) f.zone = 'home'; }
        else if (k === 'ok') { begin(); if (f.h === 0) undoLast(null); else closeEditor(t); }
      } else if (f.zone === 'home') {
        if (k === 'up') { if (f.i > 0) f.i--; else f.zone = 'head'; }
        else if (k === 'down') { if (f.i < nh - 1) f.i++; }
        else if (k === 'right') { if (f.part === 'name') f.part = 'remove'; else if (no) returnOther(t); }
        else if (k === 'left') { if (f.part === 'remove') f.part = 'name'; }
        else if (k === 'ok') {
          begin();
          if (f.part === 'name') t.lifted = { id: H[f.i], from: f.i, order: H.slice(), snap: snap() };
          else editorRemove(t, H[f.i]);
        }
      } else {
        if (k === 'up') { if (f.j > 0) { f.j--; rememberOther(t); } else f.zone = 'head'; }
        else if (k === 'down') { if (f.j < no - 1) { f.j++; rememberOther(t); } }
        else if (k === 'left') { if (nh) { rememberOther(t); f.i = nearestHome(t, nh); f.zone = 'home'; f.part = 'name'; } }
        else if (k === 'ok') { begin(); editorAdd(t, O[f.j]); }
      }
    },
    point: function (t, z, i) {
      if (t.lifted) { if (z === 'name' && i === t.f.i) this.key(t, 'ok'); return; }
      if (z === 'name' || z === 'remove') { t.f.zone = 'home'; t.f.i = i; t.f.part = z; }
      else if (z === 'other') { t.f.zone = 'other'; t.f.j = i; rememberOther(t); }
      else if (z === 'head') { t.f.zone = 'head'; t.f.h = i; }
      else return;
      this.key(t, 'ok');
    }
  };
  /* Focus follows the app between zones, so a repeated OK toggles the same app. */
  function editorRemove(t, id) {
    if (!homeRemove(id)) return;
    t.f.zone = 'other'; t.f.j = otherList().indexOf(id);
    S.note = app(id).name + ' steht unter „Zuletzt entfernt“. OK fügt die App wieder hinzu.';
  }
  function editorAdd(t, id) {
    rememberOther(t);
    if (!homeAdd(id)) return;
    const remaining = otherList();
    const at = clamp(t.otherReturn.index, 0, Math.max(0, remaining.length - 1));
    t.otherReturn.id = remaining[at] || null; t.otherReturn.index = at;
    t.f.zone = 'home'; t.f.i = S.c.home.indexOf(id); t.f.part = 'remove';
    S.note = app(id).name + ' ist auf der Startseite, Position ' + (t.f.i + 1) + '.';
  }
  function editorPlace(t) {
    const L = t.lifted;
    begin();
    if (same(L.order, S.c.home)) { t.lifted = null; return; }
    if (!homeMove(L.order.slice(), L.id, L.snap)) return;
    t.lifted = null;
    S.note = app(L.id).name + ' auf Position ' + (t.f.i + 1) + ' verschoben.';
  }
  function closeEditor() { clearSession(); pop(); }

  /* ---------- Settings, Layout and messages ---------- */
  function mode() { for (let i = 0; i < MODES.length; i++) if (MODES[i].id === S.c.mode) return MODES[i]; return MODES[0]; }
  function settingsRows() {
    const n = S.c.home.length;
    return [{ id: 'background', label: 'Hintergrund', value: S.c.bg === 'photo' ? wall(S.c.wall).name : VALUE_NAMES[S.c.bg] },
      { id: 'layout', label: 'Layout', value: VALUE_NAMES[S.c.layout] },
      { id: 'typography', label: 'Schrift', value: FONTS[S.c.font].name },
      { id: 'focus', label: 'Fokus', value: VALUE_NAMES[S.c.focus] + (materialApplies() ? ', ' + VALUE_NAMES[S.c.material] : '') },
      { id: 'editor', label: 'Apps auf der Startseite', value: n + (n === 1 ? ' App' : ' Apps') },
      { id: 'samsung', label: 'Samsung', value: 'Samsung Home und TV-Einstellungen' }];
  }
  function settingsIds() { return settingsRows().map(function (r) { return r.id; }); }
  V.settings = {
    sheet: true,
    norm: function (t) { const ids = settingsIds(); if (ids.indexOf(t.f.id) < 0) t.f.id = ids[0]; },
    key: function (t, k) {
      const ids = settingsIds();
      let i = Math.max(0, ids.indexOf(t.f.id));
      if (k === 'up' && i > 0) i--;
      else if (k === 'down' && i < ids.length - 1) i++;
      else if (k === 'back') { pop(); return; }
      t.f.id = ids[i]; S.settingsFocus = ids[i];
      if (k === 'ok') settingsOk(ids[i]);
    },
    point: function (t, z, i, id) { if (z === 'row' && id) { t.f.id = id; this.key(t, 'ok'); } }
  };
  function settingsOk(id) {
    if (id === 'editor') openEditor('settings');
    else openAppearance(id);
  }
  const DETAIL_NAMES = { background: 'Hintergrund', layout: 'Layout', typography: 'Schrift', focus: 'Fokus', rotation: 'Bildwechsel', samsung: 'Samsung', inputs: 'Eingänge' };
  function choice(axis, value, disabled) {
    return { action: axis === 'mode' ? 'rotation.' + value : 'choice.' + axis + '.' + value, axis: axis, value: value, disabled: !!disabled,
      label: axis === 'font' ? FONTS[value].name : axis === 'mode' ? MODES.filter(function (m) { return m.id === value; })[0].name : value === 'both' ? 'Beides' : VALUE_NAMES[value] };
  }
  function detailSections(t) {
    const flat = S.c.bg !== 'photo';
    const inactive = !materialApplies();
    function options(axis, values, disabled) { return values.map(function (value) { return choice(axis, value, disabled); }); }
    if (t.group === 'inputs') return [{ id: 'inputs', title: '', items: t.inputs.length ? t.inputs.map(function (input) {
      return { action: 'input.' + input.number, label: input.name, description: input.active ? 'Aktiv' : input.connected ? 'Verbunden' : 'Getrennt – evtl. im Ruhemodus' };
    }) : [{ action: 'inputs.retry', label: t.loading ? 'Eingänge werden geladen …' : 'Erneut versuchen', disabled: t.loading }],
      reason: t.inputError || (!t.loading && !t.inputs.length ? 'Dieser Fernseher meldet keine HDMI-Eingänge.' : '') }];
    if (t.group === 'background') return [
      { id: 'bg', title: 'Hintergrundart', items: options('bg', ['photo', 'light', 'dark']) },
      { id: 'wall', title: 'Hintergrundbild', items: [{ action: 'background.wallpaper', label: wall(S.c.wall).name, thumbnail: true, disabled: flat }] },
      { id: 'rotation', title: 'Bildwechsel', items: [{ action: 'background.rotation', label: mode().name, disabled: flat }], reason: flat ? '„Foto“ wählen, um Hintergrundbild und Bildwechsel zu nutzen.' : '' }
    ];
    if (t.group === 'layout') return [
      { id: 'layout', title: 'Layout', horizontal: true, items: options('layout', ['list', 'dock']) },
      { id: 'apps', title: 'App-Darstellung', horizontal: true, items: options('apps', ['text', 'icons', 'both']) },
      { id: 'controls', title: 'Bedienelemente', horizontal: true, items: options('controls', ['text', 'icons', 'both']) }
    ];
    if (t.group === 'typography') return [{ id: 'font', title: '', items: options('font', LOOK_VALUES.font) }];
    if (t.group === 'focus') return [
      { id: 'focus', title: 'Fokusstil', horizontal: true, items: options('focus', ['type', 'glass']) },
      { id: 'material', title: 'Material', horizontal: true, items: options('material', ['soft', 'frost', 'tint'], inactive),
        reason: inactive ? flat ? 'Materialien gibt es nur mit Foto-Hintergrund.' : 'Für Materialien den Glas-Fokus oder das Dock-Layout wählen.' : '' }
    ];
    if (t.group === 'rotation') return [{ id: 'mode', title: '', items: options('mode', MODES.map(function (m) { return m.id; }), flat),
      reason: flat ? 'Für den Bildwechsel unter „Hintergrund“ „Foto“ wählen.' : 'Zeitgesteuerte Wechsel pausieren, solange die Einstellungen oder ein anderes Fenster offen sind.' }];
    return [{ id: 'samsung', title: '', items: [
      { action: 'samsung.home', label: 'Samsung Home', description: 'Samsung-Startbildschirm öffnen' },
      { action: 'samsung.settings', label: 'TV-Einstellungen', description: 'Bild, Ton und Netzwerk' },
      { action: 'samsung.inputs', label: 'Eingänge', description: 'HDMI-Eingang wählen' }
    ] }];
  }
  function detailRows(t) {
    const rows = [[{ action: 'settings.back', label: t.group === 'rotation' ? 'Hintergrund' : t.group === 'inputs' ? 'Samsung' : 'Einstellungen' }]];
    detailSections(t).forEach(function (section) {
      const enabled = section.items.filter(function (item) { return !item.disabled; });
      if (section.horizontal && enabled.length) rows.push(enabled);
      else enabled.forEach(function (item) { rows.push([item]); });
    });
    if (S.lookError) rows.push([{ action: 'settings.retry', label: 'Erneut versuchen' }]);
    return rows;
  }
  function detailLocation(t) {
    const rows = detailRows(t);
    let row = 0;
    let column = 0;
    rows.forEach(function (items, r) { items.forEach(function (item, c) { if (item.action === t.f.action) { row = r; column = c; } }); });
    return { rows: rows, row: row, column: column, item: rows[row][column] };
  }
  function detailFocus(t, item, column) {
    t.f.action = item.action;
    if (item.action !== 'settings.back') S.detailFocus[t.group] = item.action;
    if (column !== undefined) t.f.column = column;
    if (item.axis) S.appearanceFocus = item.axis;
  }
  function applyRotation(value) {
    
    if (S.c.bg !== 'photo') return;
    S.err = null; S.lookError = null;
    if (value === S.c.mode) return;
    const c = next(S.c.home.slice(), S.c.recent.slice()); c.mode = value;
    if (!write(c, 'Wallpaper rotation')) S.lookError = { type: 'save', patch: { mode: value }, row: 'mode', transient: false };
  }
  function loadInputs(t) {
    t.loading = true; t.inputError = null;
    FrameDevice.sources(function (err, list) {
      if (top() !== t) return;
      t.loading = false; t.inputs = list || []; t.inputError = err ? err.message : null; after();
    });
  }
  function openInputs() {
    openAppearance('inputs'); const t = top(); t.inputs = []; loadInputs(t);
  }
  function detailBack() { cancelLook(); S.err = null; pop(); FrameDevice.cancelSource(); }
  function detailOk(t, item) {
    const patch = {};
    const error = S.lookError;
    if (item.action === 'settings.back') { detailBack(); return; }
    if (item.disabled || S.pending) return;
    if (item.action === 'settings.retry') {
      if (error && error.patch[error.row] !== undefined) detailFocus(t, choice(error.row, error.patch[error.row]), 0);
      if (error && error.row === 'mode') applyRotation(error.patch.mode);
      else if (error) setLook(error.patch, { row: error.row });
    } else if (item.axis === 'mode') applyRotation(item.value);
    else if (item.axis) { patch[item.axis] = item.value; setLook(patch, { row: item.axis }); }
    else if (item.action === 'background.wallpaper') openWallpaper();
    else if (item.action === 'background.rotation') openAppearance('rotation');
    else if (item.action === 'samsung.home') perform('Samsung Home', FrameDevice.home);
    else if (item.action === 'samsung.settings') perform('TV-Einstellungen', FrameDevice.settings);
    else if (item.action === 'samsung.inputs') openInputs();
    else if (item.action === 'inputs.retry') loadInputs(t);
    else if (item.action.indexOf('input.') === 0) perform(item.label, function (done) {
      FrameDevice.setSource(Number(item.action.slice(6)), function (err) {
        t.refreshInputs = true;
        done(top() === t && !document.hidden && !(err && err.cancelled) ? err : null);
      });
    });
  }
  V.appearance = {
    norm: function (t) {
      const rows = detailRows(t);
      let exists = false;
      let applied = null;
      const axis = { background: 'bg', layout: 'layout', typography: 'font', focus: 'focus', rotation: 'mode' }[t.group];
      rows.forEach(function (items) { items.forEach(function (item) {
        if (item.action === t.f.action) exists = true;
        if (item.axis === axis && item.value === S.c[axis]) applied = item;
      }); });
      if (!exists) detailFocus(t, applied || (rows[1] || rows[0])[0], 0);
      if (t.f.column === undefined) t.f.column = detailLocation(t).column;
    },
    key: function (t, k) {
      const at = detailLocation(t);
      let row = at.row;
      let column = at.column;
      if (k === 'back') { detailBack(); return; }
      if (k === 'ok') { detailOk(t, at.item); return; }
      if (k === 'up' || k === 'down') {
        row = clamp(row + (k === 'up' ? -1 : 1), 0, at.rows.length - 1);
        column = Math.min(t.f.column || 0, at.rows[row].length - 1);
        detailFocus(t, at.rows[row][column]);
      } else if (k === 'left' || k === 'right') {
        column = clamp(column + (k === 'left' ? -1 : 1), 0, at.rows[row].length - 1);
        detailFocus(t, at.rows[row][column], column);
      }
    },
    point: function (t, z, i, action) {
      if (z !== 'detail') return;
      detailRows(t).some(function (items) { return items.some(function (item, column) {
        if (item.action !== action) return false;
        detailFocus(t, item, column); detailOk(t, item); return true;
      }); });
    }
  };
  function messageContent(t) { return t.content || MSG[t.msg]; }
  V.message = {
    sheet: true,
    key: function (t, k) {
      const A = messageContent(t).actions;
      let a;
      if (k === 'left') t.f.b = Math.max(0, t.f.b - 1);
      else if (k === 'right') t.f.b = Math.min(A.length - 1, t.f.b + 1);
      else if (k === 'back') pop();
      else if (k === 'ok') { a = A[t.f.b][0]; pop(); if (a === 'samsung') perform('Samsung Home', FrameDevice.home); }
    },
    point: function (t, z, i) { if (z === 'act') { t.f.b = i; this.key(t, 'ok'); } }
  };

  /* ---------- Dispatch ---------- */
  function norm() { const t = top();
  const v = V[t.id]; if (v.norm) v.norm(t); }
  function press(k) {
    norm();
    const t = top();
    V[t.id].key(t, k);
    norm();
    render();
    syncRotation();
  }

  /* ---------- Rendering ---------- */
  const $ = function (id) { return document.getElementById(id); };
  const stage = $('stage');
  const homeEl = $('home');
  const caption = $('caption');
  const utilsEl = $('utils');
  const utilFocusLabel = $('utilFocusLabel');
  let utilFocusKey = '';
  const appFocusName = $('appFocusName');
  const dock = $('dock');
  const shelf = $('shelf');
  const track = $('track');
  const plate = $('plate');
  const matScrim = $('matScrim');
  const dockEmpty = $('dockEmpty');
  const cueL = $('cueL');
  const cueR = $('cueR');
  const dockAction = $('dockAction');
  const focusStatus = $('focusStatus');
  const sceneEl = $('scene');
  const appearanceEl = $('appearance');
  const appearanceRows = $('appearanceRows');
  const appearanceDesc = $('appearanceDesc');
  const appearanceBack = $('appearanceBack');
  const appearanceTitle = $('appearanceTitle');
  const appearanceStatus = $('appearanceStatus');
  const phScene = $('phScene');
  const phPlate = $('phPlate');
  const phField = $('phField');
  const phList = $('phList');
  const phRows = $('phRows');
  const phAction = $('phAction');
  const phEmpty = $('phEmpty');
  const phPlates = [phPlate, $('phPlateAlt')];
  const phFields = [phField, $('phFieldAlt')];
  let photoPlateIndex = 0;
  let photoPlateKey = null;
  const utPlates = [$('utLens'), $('utLensAlt')];
  const utFields = [$('utField'), $('utFieldAlt')];
  let utPlateIndex = 0;
  let utPlateKey = null;
  let photoMode = null;
  let photoTransitionToken = 0;
  const sheetEl = $('sheet');
  const sheetView = $('sheetView');
  const IMG = { photo: $('photo'), mat: $('matImg'), bg: $('sheetBg'), field: $('phFieldImg'), fieldAlt: $('phFieldImgAlt'), utility: $('utFieldImg'), utilityAlt: $('utFieldImgAlt') };
  let sheetKey = '';
  let slotEls = {};
  let dockEdgeFrame = 0;
  let dockEdgeUntil = 0;
  let dockAnchorCenter = 960;
  let appliedPalette = null;
  let appliedPhoto = null;
  let appliedFont = null;
  let appliedFontMetrics = null;

  /* Curated locked palettes keep the existing rendering path exactly. */
  function applyAdaptiveInk(palette) {
    const active = S.c.bg === 'photo' && palette && !palette.locked && palette.light && palette.tl && palette.tr && palette.br;
    if (appliedPalette === palette && appliedPhoto === (S.c.bg === 'photo')) return !!active;
    appliedPalette = palette; appliedPhoto = S.c.bg === 'photo';
    ['tl', 'tr', 'br'].forEach(function (zone) {
      const r = active ? palette[zone] : null;
      const values = r ? { ink: r.ink, 'clock-ink': r.clockInk || r.ink, 'rest-ink': r.restInk, 'peer-ink': r.peerInk, rest: r.restAlpha, peer: r.peerAlpha, under: r.halo, shadow: r.shadow } : {};
      ['ink', 'clock-ink', 'rest-ink', 'peer-ink', 'rest', 'peer', 'under', 'shadow'].forEach(function (key) {
        const name = '--' + zone + '-' + key;
        const value = values[key];
        if (value !== undefined && value !== null) stage.style.setProperty(name, String(value));
        else stage.style.removeProperty(name);
      });
    });
    if (active && palette.light) stage.style.setProperty('--home-app-ink', palette.light);
    else stage.style.removeProperty('--home-app-ink');
    return !!active;
  }
  function inkRungClasses(palette, active) {
    if (!active) return '';
    return ['tl', 'tr', 'br'].map(function (zone) {
      const rung = palette[zone].rung;
      return ['light', 'mist', 'mist-high', 'dark', 'dark-halo'].indexOf(rung) >= 0 ? ' ink-' + zone + '-' + rung : '';
    }).join('');
  }
  function render() {
    const t = top();
    const sheet = !!V[t.id].sheet;
    const shown = wall(S.shown ? S.shown.wall : S.c.wall);
    const palette = ADAPTIVE_INK[shown.id];
    const adaptive = applyAdaptiveInk(palette);
    const tr = adaptive && palette.tr ? palette.tr.pol : shown.ut.tr;
    const br = adaptive && palette.br ? palette.br.pol : shown.ut.br;
    stage.className = 'stage bg-' + S.c.bg + ' l-' + S.c.layout + ' v-' + S.variant + ' m-' + (materialApplies() ? S.c.material : 'none') + ' f-' + S.c.focus + ' a-' + S.c.apps + ' u-' + S.c.controls + ' g-' + S.geom + ' tone-' + shown.tone + ' tr-' + tr + ' br-' + br + wallClasses(shown) + inkRungClasses(palette, adaptive) + ' at-' + t.id + ' font-' + homeFont() + (homeFont() !== 'manrope' ? ' font-custom' : '') + (S.fontSwitch ? ' is-font-switch' : '') + (adaptive ? ' has-adaptive-ink adaptive-tl-' + palette.tl.pol : '') + (!adaptive && shown.clockInk ? ' has-clock-ink' : '') + (!adaptive && shown.dockClockInk ? ' has-dock-clock-ink' : '') + (registeredMaterial(shown.id) ? ' registered-material' : '') + (sheet ? ' is-sheet' : '') + (S.reflow ? ' is-reflow' : '');
    if (!adaptive && shown.clockInk) stage.style.setProperty('--clock-ink', shown.clockInk);
    else stage.style.removeProperty('--clock-ink');
    if (!adaptive && shown.dockClockInk) stage.style.setProperty('--dock-clock-ink', shown.dockClockInk);
    else stage.style.removeProperty('--dock-clock-ink');
    applyHomeFont();
    if (!sheet) renderHome(t);
    renderSheet(t, sheet);
    renderAppearance(t);
    renderFocusStatus(t);
  }

  function applyHomeFont() {
    const id = homeFont();
    const f = FONTS[id];
    const primary = fontRole(id, 'primary');
    const ui = fontRole(id, 'ui');
    const metrics = fontMetrics[id];
    if (appliedFont === id && appliedFontMetrics === metrics) return;
    appliedFont = id; appliedFontMetrics = metrics;
    const values = { 'display-family': '"' + f.family + '"', 'ui-family': '"' + ui.family + '"', 'primary-family': '"' + primary.family + '"', 'display-weight': f.display, 'ui-weight': ui.weight, 'primary-weight': primary.weight, 'clock-weight': f.clock,
      'clock-shift': px(fontShift('clock', 48)), 'utility-shift': px(fontShift('ui', 28)), 'action-shift': px(fontShift('ui', 30)), 'heading-shift': px(fontShift('ui', 48)), 'full-name-shift': px(fontShift('primary', 30)), 'clock-digit': px(metrics ? metrics.digitCell : 0) };
    Object.keys(values).forEach(function (key) { homeEl.style.setProperty('--font-' + key, String(values[key])); });
  }

  function homeState(t) {
    const h = S.c.home;
    const hs = { mode: 'browse', zone: null, i: Math.max(0, ensureSel()), u: -1, lifted: false, from: -1, arr: null, items: h.map(function (id) { return { key: id, kind: 'app', id: id }; }) };
    if (isSettingsDetail(t)) hs.zone = 'preview';
    else if (t.id === 'home') { hs.zone = t.f.zone; hs.u = t.f.u; }
    return hs;
  }

  function renderHome(t) {
    const hs = homeState(t);
    renderCaption(t, hs);
    renderUtils(hs);
    if (S.c.layout === 'list') renderList(hs);
    else { photoMode = null; renderDock(hs); }
    renderAppFocusName(hs);
  }

  function clockText() {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  function dateText() {
    const d = new Date();
    return WEEKDAYS[d.getDay()] + ', ' + d.getDate() + '. ' + MONTHS[d.getMonth()];
  }
  /* Weather for Paderborn from Open-Meteo: current temperature and condition, cached apart from the
     preferences. Shown on its own line under the date only while the reading is under three hours old. */
  const WEATHER_PLACE = { name: 'Paderborn', latitude: 51.7189, longitude: 8.7575 };
  const WEATHER_KEY = 'cleanframe.weather';
  const WEATHER_TTL = 1800000;
  const WEATHER_MAX_AGE = 10800000;
  const WEATHER_RETRY = 300000;
  let weather = { temp: null, code: null, day: true, at: 0 };
  let weatherTried = 0;
  let weatherBusy = false;
  /* Line icons on the 24-unit grid, adapted from bathoryalex/CleanFrame (MIT). */
  const WX = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
    moon: '<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z"/>',
    partly: '<path d="M8.6 7.6V5.2M4.1 9.4 2.4 8.6M5 4.6l1.3 1.3M13.1 4.6l-1.3 1.3"/><path d="M5.5 12.6a3.8 3.8 0 0 1 6.9-2.4"/><path d="M8.5 20h9.2a3.8 3.8 0 0 0 .3-7.6 5 5 0 0 0-9.6 1.2A3.2 3.2 0 0 0 8.5 20Z"/>',
    partlyNight: '<path d="M11.8 8.4A4.6 4.6 0 0 1 6 2.7a4.6 4.6 0 1 0 5.8 5.7Z"/><path d="M8.5 20h9.2a3.8 3.8 0 0 0 .3-7.6 5 5 0 0 0-9.6 1.2A3.2 3.2 0 0 0 8.5 20Z"/>',
    cloud: '<path d="M7 19h10.5a4.2 4.2 0 0 0 .4-8.4 5.8 5.8 0 0 0-11.1 1.6A3.5 3.5 0 0 0 7 19Z"/>',
    fog: '<path d="M7 14.5h10.5a4.2 4.2 0 0 0 .4-8.4 5.8 5.8 0 0 0-11.1 1.6"/><path d="M3.5 18h17M6.5 21h11"/>',
    rain: '<path d="M7 15h10.5a4.2 4.2 0 0 0 .4-8.4 5.8 5.8 0 0 0-11.1 1.6A3.5 3.5 0 0 0 7 15Z"/><path d="m8.5 17.5-1 3M12.5 17.5l-1 3M16.5 17.5l-1 3"/>',
    snow: '<path d="M7 15h10.5a4.2 4.2 0 0 0 .4-8.4 5.8 5.8 0 0 0-11.1 1.6A3.5 3.5 0 0 0 7 15Z"/><path d="M8 18.5h.1M12 20.5h.1M16 18.5h.1M10 21.5h.1M14 17.5h.1"/>',
    storm: '<path d="M7 15h10.5a4.2 4.2 0 0 0 .4-8.4 5.8 5.8 0 0 0-11.1 1.6A3.5 3.5 0 0 0 7 15Z"/><path d="m12.5 15-2.5 4h3.5l-2 3.5"/>'
  };
  /* WMO weather interpretation codes, as used by Open-Meteo. */
  function weatherIcon(code, day) {
    if (code === 0 || code === 1) return day ? 'sun' : 'moon';
    if (code === 2) return day ? 'partly' : 'partlyNight';
    if (code === 45 || code === 48) return 'fog';
    if (code >= 95) return 'storm';
    if (code >= 71 && code <= 77 || code === 85 || code === 86) return 'snow';
    if (code >= 51) return 'rain';
    return 'cloud';
  }
  function loadWeather() {
    try {
      const s = JSON.parse(localStorage.getItem(WEATHER_KEY));
      if (s && typeof s.temp === 'number' && typeof s.at === 'number') weather = { temp: s.temp, code: typeof s.code === 'number' ? s.code : null, day: s.day !== false, at: s.at };
    } catch (e) { /* the cache is optional */ }
  }
  function refreshWeather(done) {
    const now = Date.now();
    if (weatherBusy || now - weather.at < WEATHER_TTL || now - weatherTried < WEATHER_RETRY) return;
    weatherBusy = true; weatherTried = now;
    const xhr = new XMLHttpRequest();
    let finished = false;
    function finish() { if (finished) return; finished = true; weatherBusy = false; if (done) done(); }
    xhr.timeout = 8000;
    xhr.onload = function () {
      try {
        const cur = xhr.status >= 200 && xhr.status < 300 ? JSON.parse(xhr.responseText).current : null;
        if (cur && typeof cur.temperature_2m === 'number') {
          weather = { temp: Math.round(cur.temperature_2m), code: typeof cur.weather_code === 'number' ? cur.weather_code : null, day: cur.is_day !== 0, at: Date.now() };
          try { localStorage.setItem(WEATHER_KEY, JSON.stringify(weather)); } catch (e) { /* the cache is optional */ }
        }
      } catch (e) { /* keep the previous reading */ }
      finish();
    };
    xhr.onerror = xhr.ontimeout = xhr.onabort = finish;
    try {
      xhr.open('GET', 'https://api.open-meteo.com/v1/forecast?latitude=' + WEATHER_PLACE.latitude + '&longitude=' + WEATHER_PLACE.longitude + '&current=temperature_2m,weather_code,is_day&timezone=auto', true);
      xhr.send();
    } catch (e) { finish(); }
  }
  function weatherHtml() {
    if (weather.temp === null || Date.now() - weather.at > WEATHER_MAX_AGE) return '';
    return '<span class="clock-weather" aria-label="Wetter in ' + WEATHER_PLACE.name + ': ' + weather.temp + ' Grad">'
      + (weather.code !== null ? '<svg class="ico wx-icon" viewBox="0 0 24 24" aria-hidden="true">' + WX[weatherIcon(weather.code, weather.day)] + '</svg>' : '')
      + '<span class="wx-temp">' + weather.temp + '°</span><span class="wx-place">' + WEATHER_PLACE.name + '</span></span>';
  }
  function clockHtml() {
    const text = clockText();
    const metrics = fontMetrics[homeFont()];
    if (!metrics || !metrics.digitCell) return text;
    return text.replace(/[0-9]/g, function (digit) { return '<span class="clock-digit">' + digit + '</span>'; });
  }
  function renderCaption(t, hs) {
    let html = '<span class="clock">' + clockHtml() + '</span><span class="clock-date">' + dateText() + '</span>' + weatherHtml();
    if (S.c.apps !== 'icons' && hs.items[hs.i] && (S.c.layout === 'list' ? photoLabel(hs.items[hs.i].id, false).size < 88 || photoLabel(hs.items[hs.i].id, false).ellipsis : hs.zone === 'apps' && reducedDockLabel(hs.items[hs.i].id))) html += '<span class="cap-line full-name">' + esc(app(hs.items[hs.i].id).name) + '</span>';
    setHTML(caption, html);
  }

  function utilBtn(z, i, action, inner, extra, name) {
    return '<button type="button" tabindex="-1" class="u' + (extra || '') + '" data-z="' + z + '" data-i="' + i + '" data-action="' + action + '" aria-label="' + esc(name) + '"><span class="u-content">' + inner + '</span></button>';
  }
  function renderUtils(hs) {
    let html = '';
    const style = hs.mode === 'arrange' && S.c.controls !== 'text' ? 'both' : S.c.controls;
    const iconsOnly = style === 'icons';
    const U = utils();
    let focused = null;
    utilsEl.className = 'utils quiet-utils is-' + style + (hs.zone === 'util' || hs.zone === 'ctl' ? ' is-awake' : '');
    U.forEach(function (u, i) { html += utilBtn('util', i, 'util.' + u, icon(UTIL[u][1], '', true) + '<span class="u-label">' + UTIL[u][0] + '</span>', '', UTIL[u][0]); });
    setHTML(utilsEl, html);
    Array.prototype.forEach.call(utilsEl.querySelectorAll('.u'), function (b) {
      const z = b.getAttribute('data-z');
      const focus = hs.zone === z && hs.u === Number(b.getAttribute('data-i'));
      b.className = b.className.replace(/\s+is-focus/g, '') + (focus ? ' is-focus' : '');
      if (focus) focused = b;
    });
    renderUtilFocusLabel(iconsOnly ? focused : null);
    renderUtilityLens(focused, iconsOnly);
  }
  function renderUtilFocusLabel(button) {
    let x;
    if (!button) { utilFocusLabel.className = 'util-focus-label'; utilFocusKey = ''; return; }
    const text = S.err ? 'Nicht gespeichert. OK versucht es erneut.' : button.getAttribute('aria-label');
    const key = button.getAttribute('data-action') + '|' + text + '|' + homeFont();
    if (key !== utilFocusKey) {
      utilFocusLabel.className = 'util-focus-label'; utilFocusLabel.textContent = text;
      utilFocusLabel.offsetWidth;
      utilFocusKey = key;
    }
    const r = button.getBoundingClientRect();
    const sr = sceneEl.getBoundingClientRect();
    const scale = sr.width / 1920 || 1;
    const width = Math.ceil(textWidth(text, 28, 500, -.2) + 8); x = (r.left + r.width / 2 - sr.left) / scale - width / 2;
    if (S.c.layout === 'list') x = 1730 - width;
    utilFocusLabel.style.width = width + 'px'; utilFocusLabel.style.left = clamp(x, 112, 1808 - width) + 'px';
    utilFocusLabel.style.top = ((S.c.layout === 'list' ? (r.top + r.height / 2 - sr.top) / scale - 19 : 140) + fontShift('ui', 28)) + 'px';
    utilFocusLabel.className = 'util-focus-label is-on';
  }
  function renderUtilityLens(button, iconsOnly) {
    let label;
    let x;
    let width;
    let el;
    if (!button || S.c.focus !== 'glass') {
      utPlates.forEach(function (plateEl) { plateEl.className = 'ph-plate ut-lens is-outgoing'; });
      utPlateKey = null;
      return;
    }
    const r = button.getBoundingClientRect();
    const sr = sceneEl.getBoundingClientRect();
    const scale = sr.width / 1920 || 1;
    const y = (r.top - sr.top) / scale + 2;
    if (S.c.layout === 'list') {
      label = iconsOnly ? utilFocusLabel : button.querySelector('.u-label');
      x = (label.getBoundingClientRect().left - sr.left) / scale - 24;
      width = 1800 - x;
    } else {
      // Dock icons keep a fixed lens; the separate caption cannot overlap its neighbours.
      x = (r.left - sr.left) / scale; width = r.width / scale;
    }
    const key = button.getAttribute('data-action') + '|' + x + '|' + y + '|' + width;
    if (key !== utPlateKey) {
      utPlates[utPlateIndex].className = 'ph-plate ut-lens is-outgoing';
      utPlateIndex = 1 - utPlateIndex; el = utPlates[utPlateIndex];
      el.className = 'ph-plate ut-lens is-preparing';
      el.style.width = width + 'px'; el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      fieldTransform(utFields[utPlateIndex], x, y, width, 60);
      el.offsetWidth;
      utPlateKey = key;
    }
    fieldTransform(utFields[utPlateIndex], x, y, width, 60);
    utPlates[utPlateIndex].className = 'ph-plate ut-lens is-current on-focus';
  }
  function renderAppFocusName(hs) {
    const it = hs.items[hs.i];
    let x;
    let y;
    let placement;
    if (S.c.apps !== 'icons' || hs.mode !== 'browse' || hs.zone !== 'apps' || !it) { appFocusName.className = 'app-focus-name'; return; }
    appFocusName.textContent = app(it.id).name;
    const width = Math.min(S.c.layout === 'list' ? 1056 : 1640, Math.ceil(textWidth(app(it.id).name, S.c.layout === 'list' ? 40 : 36, 500, -.6, 'primary') + 8));
    appFocusName.style.width = width + 'px';
    if (S.c.layout === 'list') {
      x = 280; placement = phFields[photoPlateIndex]._placement;
      y = placement.y + placement.height / 2 - 24;
    } else {
      x = clamp(dockAnchorCenter - width / 2, 140, 1780 - width); y = 932;
    }
    appFocusName.style.left = x + 'px'; appFocusName.style.top = (y + fontShift('primary', S.c.layout === 'list' ? 40 : 36)) + 'px';
    appFocusName.className = 'app-focus-name is-on';
  }

  function dockGeom(n) {
    const m = DOCK_MODES[S.c.apps];
    const vis = Math.max(1, Math.min(5, n));
    let shelfW = vis * m.pitch - 8;
    let w = shelfW + 32;
    const broad = S.geom === 'broad' && n > 5;
    if (n < 0) { w = 912; shelfW = 880; }
    else if (broad) { w = 1728; shelfW = 1696; }
    return { x: Math.round((1920 - w) / 2), y: 908 - m.th - 32, h: m.th + 32, w: w, shelf: shelfW, vis: vis, broad: broad, empty: n < 0, tw: m.tw, th: m.th, pitch: m.pitch };
  }
  /* Five centred: the window moves one tile when focus passes an edge. Broad: keep a
     148px glimpse of the neighbour, as the current dock does. */
  function dockOffset(n, i, g) {
    let off;
    let left;
    let first;
    const glimpse = g.tw / 2;
    if (g.broad) {
      off = scroll.off * g.pitch; left = i * g.pitch;
      if (left - off < (i > 0 ? glimpse : 0)) off = left - (i > 0 ? glimpse : 0);
      if (left + g.tw - off > g.shelf - (i < n - 1 ? glimpse : 0)) off = left + g.tw - g.shelf + (i < n - 1 ? glimpse : 0);
      off = clamp(off, 0, Math.max(0, n * g.pitch - 8 - g.shelf));
      if (!S.reflow) { scroll.off = off / g.pitch; scroll.first = Math.round(scroll.off); }
      return off;
    }
    first = clamp(scroll.first, 0, Math.max(0, n - g.vis));
    if (i < first) first = i;
    if (i > first + g.vis - 1) first = i - g.vis + 1;
    if (!S.reflow) { scroll.first = first; scroll.off = first; }
    return first * g.pitch;
  }
  function dockTileHtml(it, full) {
    
    if (it.kind === 'add') return '<span class="add">' + icon('plus') + '</span><span class="label">' + (full ? 'Startseite ist voll' : 'App hinzufügen') + '</span>';
    const a = app(it.id);
    const body = S.c.apps === 'text' ? '' : appMark(a, S.c.apps === 'icons' ? 136 : 120, S.c.apps === 'icons' ? 88 : 72, S.c.apps === 'icons' ? 72 : 58);
    return body + (S.c.apps === 'icons' ? '' : '<span class="label" style="font-size:' + dockLabelSize(a.id) + 'px;top:' + ((S.c.apps === 'text' ? 28 : 128) + fontShift('primary', dockLabelSize(a.id))) + 'px"><span class="label-ink">' + esc(a.name) + '</span></span>') + '<span class="nudge nudge-l">' + icon('left') + '</span><span class="nudge nudge-r">' + icon('right') + '</span>';
  }
  /* A wide label can reach the shelf before its icon. Check the rendered icon box,
     including during the track's 180ms transition, so both disappear together. */
  function syncDockEdges() {
    const broad = S.c.layout === 'dock' && S.geom === 'broad';
    const clip = shelf.getBoundingClientRect();
    const changes = [];
    Array.prototype.forEach.call(track.querySelectorAll('.tile'), function (tile) {
      const content = tile.querySelector(S.c.apps === 'text' ? '.label-ink' : '.mark');
      const r = content ? content.getBoundingClientRect() : null;
      const outside = broad && r && (r.right <= clip.left || r.left >= clip.right);
      const cls = tile.className.replace(/\s+is-outside-icon/g, '') + (outside ? ' is-outside-icon' : '');
      if (tile.className !== cls) changes.push({ tile: tile, cls: cls });
    });
    changes.forEach(function (change) { change.tile.className = change.cls; });
  }
  function trackDockEdges() {
    dockEdgeFrame = 0;
    if (S.c.layout !== 'dock' || S.geom !== 'broad') return;
    syncDockEdges();
    if (Date.now() < dockEdgeUntil) dockEdgeFrame = window.requestAnimationFrame(trackDockEdges);
  }

  function renderDock(hs) {
    const items = hs.items;
    const n = items.length;
    const empty = hs.mode !== 'arrange' && !n;
    const g = dockGeom(empty ? -1 : n);
    const anchor = clamp(hs.i, 0, Math.max(0, n - 1));
    const off = empty ? 0 : dockOffset(n, anchor, g);
    const full = false;
    const ns = n;
    const tileFocus = hs.zone === 'apps' || hs.zone === 'tiles';
    const tileSel = hs.zone === 'util' || hs.zone === 'act' || hs.zone === 'ctl' || hs.zone === 'preview';
    const focusItem = items[anchor];
    let s;
    let ax;
    let label;
    let width;

    dock.className = 'dock' + (empty ? ' is-empty' : '');
    dock.style.left = g.x + 'px'; dock.style.top = g.y + 'px'; dock.style.width = g.w + 'px'; dock.style.height = g.h + 'px';
    dock.style.setProperty('--tile-w', g.tw + 'px'); dock.style.setProperty('--tile-h', g.th + 'px'); dock.style.setProperty('--dock-h', g.h + 'px');
    dock.style.setProperty('--nudge-top', ((g.th - 48) / 2) + 'px');
    dockAnchorCenter = g.x + 16 + anchor * g.pitch - off + g.tw / 2;
    IMG.mat.style.left = (-g.x) + 'px'; IMG.mat.style.top = (-g.y) + 'px';
    IMG.mat.style.transformOrigin = '960px ' + (g.y + g.h / 2) + 'px';
    matScrim.style.left = (-g.x) + 'px'; matScrim.style.top = (SCRIM_Y - g.y) + 'px';
    matScrim.style.transformOrigin = '960px ' + (g.y + g.h / 2 - SCRIM_Y) + 'px';
    shelf.style.width = g.shelf + 'px';
    shelf.className = 'shelf' + (g.broad && off > 0 ? ' fade-l' : '') + (g.broad && off + g.shelf < n * g.pitch - 8 ? ' fade-r' : '');

    keyed(track, empty ? [] : items, function (el, it, i) {
      const a = it.id ? app(it.id) : null;
      const left = i * g.pitch;
      const focus = tileFocus && i === anchor;
      const sel = tileSel && i === anchor;
      const lifted = hs.lifted && i === anchor;
      const partial = g.broad && (left - off < -1 || left + g.tw - off > g.shelf + 1);
      setContent(el, it.kind + '|' + (it.id || '') + '|' + (it.id ? dockLabelSize(it.id) : full) + '|' + S.c.bg + '|' + S.c.apps + '|' + homeFont(), function () { return '<span class="tile-content">' + dockTileHtml(it, full) + '</span>'; });
      el.className = 'tile k-' + it.kind + (focus ? ' is-focus' : '') + (sel ? ' is-sel' : '') + (lifted ? ' is-lifted' : '') + (partial ? ' is-partial' : '')
        + (a && !a.mark ? ' is-text' : '') + (it.kind === 'add' && full ? ' is-full' : '') + (it.kind === 'app' && S.press === it.id ? ' is-press' : '')
        + (lifted && i === 0 ? ' no-l' : '') + (lifted && i >= ns - 1 ? ' no-r' : '');
      el.style.transform = 'translate3d(' + left + 'px,0,0)';
      el.setAttribute('role', 'button');
      if (a) el.setAttribute('aria-label', a.name);
      if (hs.mode === 'arrange') attrs(el, 'tile', i, 'arrange.' + (it.kind === 'add' ? 'add' : (it.kind === 'ph' ? 'placeholder.' : 'tile.') + it.id));
      else attrs(el, 'app', i, 'home.app.' + it.id);
    });
    track.style.transform = 'translate3d(' + (-off) + 'px,0,0)';
    syncDockEdges();
    if (g.broad) {
      dockEdgeUntil = Date.now() + 220;
      if (!dockEdgeFrame) dockEdgeFrame = window.requestAnimationFrame(trackDockEdges);
    }
    plate.className = 'plate' + (!n || empty || hs.zone === null ? '' : hs.lifted ? ' on-lift' : tileFocus ? ' on-focus' : tileSel ? ' on-sel' : '');
    plate.style.transform = 'translate3d(' + (anchor * g.pitch) + 'px,0,0)';

    cueL.style.left = (g.x - 72) + 'px'; cueR.style.left = (g.x + g.w + 24) + 'px';
    cueL.style.top = cueR.style.top = (g.y + g.h / 2 - 24) + 'px';
    cueL.className = 'cue' + (!g.broad && !empty && scroll.first > 0 ? ' is-on' : '');
    cueR.className = 'cue' + (!g.broad && !empty && scroll.first + g.vis < n ? ' is-on' : '');

    ax = g.x + 16 + anchor * g.pitch - off;
    if (hs.mode === 'arrange' && !hs.lifted && (hs.zone === 'tiles' || hs.zone === 'act') && focusItem && focusItem.kind !== 'add') {
      s = hs.arr.slots[anchor];
      label = app(s.id).name + (s.removed ? ' wiederherstellen' : ' entfernen'); width = actionWidth(label);
      ax = clamp(ax + (g.tw - width) / 2, 112, 1808 - width);
      setHTML(dockAction, '<span>' + esc(label) + '</span>');
      dockAction.className = 'dock-action is-on' + (hs.zone === 'act' ? ' is-focus' : '');
      dockAction.style.width = width + 'px';
      dockAction.style.transform = 'translate3d(' + ax + 'px,0,0)';
      attrs(dockAction, 'act', anchor, 'arrange.' + (s.removed ? 'restore.' : 'remove.') + s.id);
    } else {
      dockAction.className = 'dock-action';
      dockAction.removeAttribute('data-z'); dockAction.removeAttribute('data-action');
    }
    setHTML(dockEmpty, empty ? '<p>Keine Apps auf der Startseite</p><button type="button" tabindex="-1" class="btn' + (hs.zone === 'empty' ? ' is-focus' : '') + '" data-z="empty" data-i="0" data-action="home.add-apps">' + icon('plus') + '<span>Apps hinzufügen</span></button>' : '');
  }

  function photoModeTransition(compact) {
    if (photoMode !== null && photoMode !== compact) {
      const ghost = phScene.cloneNode(true);
      const token = ++photoTransitionToken;
      ghost.removeAttribute('id'); ghost.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(ghost.querySelectorAll('[id],[data-action],[data-z]'), function (el) {
        el.removeAttribute('id'); el.removeAttribute('data-action'); el.removeAttribute('data-z');
      });
      ghost.className = 'ph-scene ph-ghost';
      phScene.parentNode.appendChild(ghost);
      phScene.className = 'ph-scene ph-incoming';
      setTimeout(function () {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
        if (token === photoTransitionToken) phScene.className = 'ph-scene';
      }, 180);
    }
    photoMode = compact;
  }
  /* Each plate keeps a stationary, stage-registered field while its opacity changes.
     Reuse the hidden group for the next label; never animate plate width or position. */
  function renderPhotoPlate(id, width, height, y, state) {
    const key = id + '|' + width + '|' + height + '|' + y;
    let plateEl;
    let fieldEl;
    if (key !== photoPlateKey) {
      phPlates[photoPlateIndex].className = phPlates[photoPlateIndex].className.replace(' is-current', '') + ' is-outgoing';
      photoPlateIndex = 1 - photoPlateIndex;
      plateEl = phPlates[photoPlateIndex]; fieldEl = phFields[photoPlateIndex];
      plateEl.className = 'ph-plate is-preparing';
      plateEl.style.width = width + 'px'; plateEl.style.height = height + 'px';
      plateEl.style.transform = 'translate3d(0,' + y + 'px,0)';
      fieldTransform(fieldEl, 112, y, width, height);
      plateEl.offsetWidth; // Establish zero opacity before the incoming crossfade.
      photoPlateKey = key;
    }
    fieldTransform(phFields[photoPlateIndex], 112, y, width, height);
    phPlates[photoPlateIndex].className = 'ph-plate is-current' + (state ? ' ' + state : '');
  }
  function fieldTransform(el, x, y, width, height) {
    el._placement = { x: x, y: y, width: width, height: height };
    el.style.transformOrigin = (x + width / 2) + 'px ' + (y + height / 2) + 'px';
    el.style.transform = 'translate3d(' + (-x) + 'px,' + (-y) + 'px,0)' + (S.c.bg === 'photo' && S.c.material === 'tint' && !REDUCED_MOTION ? ' scale(1.04)' : '');
  }
  function renderList(hs) {
    const items = hs.items;
    const n = items.length;
    const compact = hs.mode === 'arrange';
    const pitch = compact ? PH_COMPACT_PITCH : PH_PITCH;
    const anchor = clamp(hs.i, 0, Math.max(0, n - 1));
    let first;
    let s;
    let label;
    let aw;
    const rowFocus = hs.zone === 'apps' || hs.zone === 'tiles';
    const remembered = hs.zone === 'util' || hs.zone === 'act' || hs.zone === 'ctl' || hs.zone === 'preview';
    photoModeTransition(compact);
    if (compact) {
      first = clamp(scroll.photoArrange, anchor - 7, anchor - 1);
      first = clamp(first, 0, Math.max(0, n - PH_COMPACT_VISIBLE));
      scroll.photoArrange = first;
    } else {
      first = clamp(scroll.photo, anchor - 3, anchor - 1);
      first = clamp(first, 0, Math.max(0, n - PH_FULL));
      scroll.photo = first;
    }
    const off = first * pitch;
    const slot = anchor - first;
    const width = items[anchor] ? listPlateWidth(items[anchor].id, compact) : 360;
    phList.className = 'ph-list' + (compact ? ' is-compact' : '');
    phList.style.height = PH_HEIGHT + 'px';
    phRows.style.top = (compact ? 72 : 148) + 'px';
    keyed(phRows, items, function (row, it, i) {
      const typography = photoLabel(it.id, compact);
      const focus = rowFocus && i === anchor;
      const lifted = hs.lifted && i === anchor;
      let body = '';
      setContent(row, it.id + '|' + typography.size + '|' + S.c.bg + '|' + S.c.apps + '|' + homeFont(), function () {
        if (S.c.apps !== 'text') body += appMark(app(it.id), S.c.apps === 'icons' ? compact ? 64 : 88 : compact ? 60 : 84, S.c.apps === 'icons' ? compact ? 64 : 88 : compact ? 44 : 64, S.c.apps === 'icons' ? compact ? 52 : 72 : compact ? 42 : 54);
        if (S.c.apps !== 'icons') body += '<span class="ph-name" style="font-size:' + typography.size + 'px;top:' + typography.top + 'px">' + esc(app(it.id).name) + '</span>';
        return '<span class="ph-group">' + body + '</span><span class="ph-move ph-move-up">' + icon('up') + '</span><span class="ph-move ph-move-down">' + icon('down') + '</span>';
      });
      const markImage = row.querySelector('.mark img');
      if (markImage) {
        markImage.onerror = function () { this.style.visibility = 'hidden'; };
        if (markImage.complete && !markImage.naturalWidth) markImage.style.visibility = 'hidden';
      }
      row.className = 'ph-row k-' + it.kind + (focus ? ' is-focus' : '') + (remembered && i === anchor ? ' is-sel' : '') + (lifted ? ' is-lifted' : '')
        + (lifted && i === 0 ? ' no-up' : '') + (lifted && i === n - 1 ? ' no-down' : '')
        + (it.kind === 'app' && S.press === it.id ? ' is-press' : '');
      row.style.width = (compact ? listPlateWidth(it.id, compact) : 1200) + 'px'; row.style.height = pitch + 'px';
      row.style.transform = 'translate3d(0,' + (i * pitch) + 'px,0)';
      row.setAttribute('role', 'button'); row.setAttribute('aria-label', app(it.id).name);
      attrs(row, compact ? 'tile' : 'app', i, compact ? 'arrange.' + (it.kind === 'ph' ? 'placeholder.' : 'tile.') + it.id : 'home.app.' + it.id);
    });
    phRows.style.transform = 'translate3d(0,' + (-off) + 'px,0)';
    const y = (compact ? PH_COMPACT_TOP + 2 : PH_TOP + 1) + slot * pitch;
    const plateState = !n || hs.zone === null ? '' : hs.lifted ? 'on-lift' : S.c.focus === 'glass' && rowFocus ? 'on-focus' : S.c.focus === 'glass' && remembered ? 'on-sel' : '';
    renderPhotoPlate(items[anchor] ? items[anchor].id : '', width, compact ? 88 : 134, y, plateState);
    if (compact && !hs.lifted && (hs.zone === 'tiles' || hs.zone === 'act') && items[anchor]) {
      s = hs.arr.slots[anchor]; label = app(s.id).name + (s.removed ? ' wiederherstellen' : ' entfernen'); aw = actionWidth(label);
      setHTML(phAction, '<span>' + esc(label) + '</span>');
      phAction.className = 'ph-action is-on' + (hs.zone === 'act' ? ' is-focus' : '');
      phAction.style.width = aw + 'px';
      phAction.style.transform = 'translate3d(' + (112 + width + 24) + 'px,' + (PH_COMPACT_TOP + slot * pitch + 12) + 'px,0)';
      attrs(phAction, 'act', anchor, 'arrange.' + (s.removed ? 'restore.' : 'remove.') + s.id);
    } else { phAction.className = 'ph-action'; phAction.removeAttribute('data-z'); phAction.removeAttribute('data-action'); }
    phEmpty.className = 'ph-empty' + (!compact && !n ? ' is-on' : '');
    setHTML(phEmpty, !compact && !n ? '<p>Keine Apps auf der Startseite</p><button type="button" tabindex="-1" class="btn' + (hs.zone === 'empty' ? ' is-focus' : '') + '" data-z="empty" data-i="0" data-action="home.add-apps">' + icon('plus') + '<span>Apps hinzufügen</span></button>' : '');
  }

  /* Sheets: a frame is built once per view/mode; fill() updates its slots. Persistent
     scrollers let transforms animate. */
  function renderSheet(t, sheet) {
    
    sheetEl.hidden = !(sheet || isSettingsDetail(t));
    sheetView.hidden = !sheet;
    if (sheet) sheetView.setAttribute('aria-modal', 'true');
    else sheetView.removeAttribute('aria-modal');
    sceneEl.setAttribute('aria-hidden', sheet || isSettingsDetail(t) ? 'true' : 'false');
    if (!sheet) { sheetView.innerHTML = ''; sheetKey = ''; return; }
    const key = t.id + '|' + (t.mode || '') + '|' + (t.msg || '') + '|' + S.variant + '|' + S.c.bg;
    if (key !== sheetKey) {
      sheetView.innerHTML = FRAMES[t.id](t);
      sheetKey = key; slotEls = {};
      Array.prototype.forEach.call(sheetView.querySelectorAll('[data-slot]'), function (el) { slotEls[el.getAttribute('data-slot')] = el; });
    }
    FILLS[t.id](t, slotEls);
  }
  function renderAppearance(t) {
    appearanceEl.hidden = !isSettingsDetail(t);
    if (appearanceEl.hidden) { appearanceEl.removeAttribute('aria-modal'); return; }
    appearanceEl.setAttribute('aria-modal', 'true');
    if (t.id === 'wallpaper') { renderWallpaper(t); return; }
    V.appearance.norm(t);
    appearanceEl.className = 'appearance detail-' + t.group;
    appearanceRows.className = 'appearance-rows';
    appearanceTitle.textContent = DETAIL_NAMES[t.group];
    const at = detailLocation(t);
    const selected = at.item;
    const error = S.lookError;
    let status = '';
    function command(item, inner, cls) {
      const applied = item.axis && S.c[item.axis] === item.value;
      const loading = !!(item.axis && S.pending && S.pending.target[item.axis] === item.value && S.pending.row === item.axis);
      return '<button type="button" tabindex="-1" class="setting-choice' + (cls ? ' ' + cls : '') + (t.f.action === item.action ? ' is-focus' : '') + (item.disabled ? ' is-disabled' : '') + (applied ? ' is-applied' : '') + (loading ? ' is-loading' : '') + '"'
        + (item.axis ? ' role="radio" aria-checked="' + !!applied + '"' : '') + ' aria-label="' + esc(item.axis && item.value === 'both' ? 'Symbole und Text' : item.label) + '" aria-disabled="' + !!item.disabled + '" aria-busy="' + loading + '"'
        + ' data-z="detail" data-i="0" data-id="' + item.action + '" data-action="' + item.action + '">' + inner
        + (item.axis ? '<span class="setting-tick" aria-hidden="true">' + (applied ? icon('check') : '') + '</span>' : '') + '</button>';
    }
    setHTML(appearanceBack, command({ action: 'settings.back', label: t.group === 'rotation' ? 'Hintergrund' : t.group === 'inputs' ? 'Samsung' : 'Einstellungen' }, icon('left') + '<span>' + (t.group === 'rotation' ? 'Hintergrund' : t.group === 'inputs' ? 'Samsung' : 'Einstellungen') + '</span>', 'setting-back'));
    setHTML(appearanceRows, detailSections(t).map(function (section) {
      return '<section class="setting-section' + (section.horizontal ? ' is-horizontal' : '') + ' section-' + section.id + '">'
        + (section.title ? '<h3 class="setting-label" id="setting-' + section.id + '">' + section.title + '</h3>' : '')
        + '<div class="setting-options"' + (section.items[0].axis ? ' role="radiogroup" aria-label="' + esc(section.title || LOOK_NAMES[section.id] || DETAIL_NAMES[t.group]) + '"' : '') + '>'
        + section.items.map(function (item) {
          const swatch = item.axis === 'bg';
          let body = '';
          if (swatch || item.thumbnail) body += item.value === 'light' || item.value === 'dark'
            ? '<span class="setting-swatch swatch-' + item.value + '" aria-hidden="true"></span>'
            : '<img class="setting-swatch" src="' + WP + S.c.wall + '-thumb.jpg" alt="">';
          body += '<span class="setting-copy"><span class="setting-name">' + esc(item.label) + '</span>'
            + (item.description ? '<span class="setting-description">' + esc(item.description) + '</span>' : '') + '</span>';
          if (!item.axis) body += icon('right', 'setting-forward');
          return command(item, body, item.description ? 'has-description' : '');
        }).join('') + '</div>'
        + (section.reason ? '<p class="setting-reason">' + esc(section.reason) + '</p>' : '') + '</section>';
    }).join(''));
    if (S.pending) status = '<p>' + esc(S.pending.row === 'font' ? FONTS[S.pending.target.font].name : 'Auswahl') + ' wird geladen …</p><p>Zurück bricht diese Änderung ab.</p>';
    else if (error) {
      status = '<p class="setting-error">' + (error.type === 'save' ? 'Diese Änderung konnte nicht gespeichert werden.' : error.type === 'font' ? esc(FONTS[error.font].name) + ' konnte nicht geladen werden.' : 'Diese Darstellung konnte nicht geladen werden.') + ' Die bisherige Auswahl bleibt erhalten.</p>'
        + command({ action: 'settings.retry', label: 'Erneut versuchen' }, '<span>Erneut versuchen</span>', 'setting-retry');
    }
    setHTML(appearanceStatus, status);
    const hint = selected.disabled ? '' : selected.action === 'settings.back' ? 'Zurück zu ' + (t.group === 'rotation' ? 'Hintergrund' : t.group === 'inputs' ? 'Samsung' : 'Einstellungen') : selected.action === 'settings.retry' ? 'Änderung erneut versuchen' : selected.axis ? 'Ausgewählte Einstellung übernehmen' : selected.action === 'background.wallpaper' ? 'Hintergrundbild wählen' : selected.action === 'background.rotation' ? 'Wechselintervall wählen' : 'Auf dem Fernseher öffnen';
    setHTML(appearanceDesc, hint ? '<span class="remote-key">OK</span><span>' + esc(hint) + '</span>' : '');
  }
  function renderWallpaper(t) {
    V.wallpaper.norm(t);
    appearanceEl.className = 'appearance detail-wallpaper';
    appearanceTitle.textContent = 'Hintergrundbild';
    appearanceRows.className = 'appearance-rows wallpaper-picker';
    setHTML(appearanceBack, '<button type="button" tabindex="-1" class="setting-choice setting-back' + (t.f.zone === 'back' ? ' is-focus' : '') + '" data-z="wall-back" data-action="wallpaper.back">' + icon('left') + '<span>Hintergrund</span></button>');
    setHTML(appearanceRows, '<div class="wallpaper-edge wallpaper-before" aria-hidden="true">' + icon('up') + '</div><div class="wallpaper-list" role="radiogroup" aria-label="Hintergrundbild"><div class="wallpaper-rows"></div></div><div class="wallpaper-edge wallpaper-after" aria-hidden="true">' + icon('down') + '</div>');
    const rows = appearanceRows.querySelector('.wallpaper-rows');
    const shown = wall(S.wallShown) || wall(S.c.wall);
    const candidate = WALLS[t.i];
    let status;
    let note;
    let hint;
    keyed(rows, WALLS.map(function (w) { return { key: w.id, wall: w }; }), function (row, item, i) {
      const visible = i >= t.top && i < t.top + WALL_VISIBLE;
      const w = item.wall; 
      setContent(row, w.id + '|' + visible, function () { return '<span class="wallpaper-thumb">' + (visible ? '<img src="' + WP + w.id + '-thumb.jpg" alt="">' : '') + '</span><span class="setting-copy"><span class="setting-name">' + esc(w.name) + '</span></span><span class="setting-tick" aria-hidden="true"></span>'; });
      row.className = 'setting-choice wallpaper-choice' + (t.f.zone === 'photo' && t.i === i ? ' is-focus' : '') + (w.id === S.c.wall ? ' is-applied' : '');
      row.style.transform = 'translate3d(0,' + (i * WALL_ROW) + 'px,0)'; row.style.visibility = visible ? 'visible' : 'hidden';
      row.setAttribute('role', 'radio'); row.setAttribute('tabindex', '-1'); row.setAttribute('aria-label', w.name);
      row.setAttribute('aria-checked', String(w.id === S.c.wall)); row.setAttribute('aria-posinset', String(i + 1)); row.setAttribute('aria-setsize', String(WALLS.length));
      row.setAttribute('aria-busy', String(t.previewDue === w.id || S.wallPending === w.id));
      attrs(row, 'wall-choice', i, 'wallpaper.choose.' + w.id);
      setHTML(row.querySelector('.setting-tick'), w.id === S.c.wall ? icon('check') : '');
      const image = row.querySelector('img');
      if (image && !image._wallBound) {
        image._wallBound = true;
        image.onerror = function () { this.parentNode.className = 'wallpaper-thumb is-missing'; };
        if (image.complete && !image.naturalWidth) image.onerror();
      }
    });
    rows.style.transform = 'translate3d(0,' + (-t.top * WALL_ROW) + 'px,0)';
    appearanceRows.querySelector('.wallpaper-before').className = 'wallpaper-edge wallpaper-before' + (t.top > 0 ? ' is-on' : '');
    appearanceRows.querySelector('.wallpaper-after').className = 'wallpaper-edge wallpaper-after' + (t.top + WALL_VISIBLE < WALLS.length ? ' is-on' : '');
    note = t.previewDue ? candidate.name + ' wird vorbereitet …' : S.wallPending ? candidate.name + (t.applyPending ? ' wird übernommen …' : ' wird geladen …') : shown.id === S.c.wall ? 'Übernommen' : 'Vorschau';
    if (t.failedId) note = S.err ? wall(t.failedId).name + ' konnte nicht gespeichert werden.' : wall(t.failedId).name + ' konnte nicht geladen werden.';
    status = '<p class="wallpaper-preview-name"><span>' + esc(shown.name) + '</span><span class="wallpaper-count">' + (wallIndex(shown.id) + 1) + ' von ' + WALLS.length + '</span></p><p class="wallpaper-preview-state' + (t.failedId ? ' setting-error' : '') + '">' + esc(note) + '</p>';
    if (t.failedId) status += '<button type="button" tabindex="-1" class="setting-choice setting-retry' + (t.f.zone === 'retry' ? ' is-focus' : '') + '" data-z="wall-retry" data-action="wallpaper.retry">Erneut versuchen</button>';
    setHTML(appearanceStatus, status);
    hint = t.f.zone === 'back' ? 'Zurück zu Hintergrund' : t.f.zone === 'retry' ? 'Dieses Foto erneut versuchen' : 'Ausgewähltes Foto übernehmen';
    if (t.f.zone === 'photo' && candidate.id === S.c.wall && !S.pending && !t.failedId) hint = '';
    setHTML(appearanceDesc, hint ? '<span class="remote-key">OK</span><span>' + hint + '</span>' : '');
  }
  /* Keep the retry or membership state on the focused control. The stage-level line
     shares its position without changing the control's identity or key behaviour. */
  function renderFocusStatus(t) {
    if (isSettingsDetail(t)) { focusStatus.className = 'focus-status'; return; }
    const root = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl;
    const active = root.querySelectorAll('.is-focus[data-action]');
    let target = null;
    let text = S.err ? 'Nicht gespeichert. OK versucht es erneut.' : '';
    let i;
    let x;
    let y;
    let w;
    let solid;
    let photoRow = false;
    let photoFree = false;
    Array.prototype.forEach.call(stage.querySelectorAll('.has-local-status'), function (el) { el.className = el.className.replace(/\s+has-local-status/g, ''); });
    for (i = 0; i < active.length; i++) if (renderedAction(active[i])) { target = active[i]; break; }
    if (!text && t.id === 'arrange' && (t.f.zone === 'act' || t.f.zone === 'tiles')) {
      const slot = t.slots[t.f.i];
      if (slot && !slot.removed && t.f.zone === 'act' && S.c.home.length === 1) text = LAST;
    }
    if (!text && S.note === LAST && t.id === 'arrange') text = LAST;
    if (!target || !text) { focusStatus.className = 'focus-status'; return; }
    if (target.parentNode === utilsEl && utilsEl.className.indexOf('is-icons') >= 0) { renderUtilFocusLabel(target); focusStatus.className = 'focus-status'; return; }
    // Photo action pills stay on one line; the header already carries this status.
    if (S.c.layout === 'list' && t.id === 'arrange' && !t.lifted && (t.f.zone === 'act' || t.f.zone === 'tiles')) { focusStatus.className = 'focus-status'; return; }
    photoRow = S.c.layout === 'list' && target.className.indexOf('ph-row') >= 0;
    if (photoRow && phAction.className.indexOf('is-on') >= 0) target = phAction;
    else if (photoRow) photoFree = true;
    target.className += ' has-local-status';
    const action = target.getAttribute('data-action');
    const r = target.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const scale = sr.width / 1920 || 1;
    x = (r.left - sr.left) / scale; y = (r.top - sr.top) / scale; w = r.width / scale;
    if (photoFree) { x = 112 + parseFloat(phPlates[photoPlateIndex].style.width) + 24; y += (r.height / scale - 28) / 2; w = 400; }
    else if (action.indexOf('home.app.') === 0 || action.indexOf('arrange.tile.') === 0 || action.indexOf('arrange.placeholder.') === 0) y += 171;
    else if (action.indexOf('apps.order.') === 0) y += 86;
    else if (action.indexOf('apps.toggle.') === 0 || action.indexOf('apps.add.') === 0) y += 164;
    else if (action.indexOf('layout.') === 0) y += 54;
    else y += action.indexOf('arrange.remove.') === 0 || action.indexOf('arrange.restore.') === 0 ? 43 : 40;
    solid = /(?:^|\s)(?:u|btn|er-rm|dock-action|set-row|ph-action)(?:\s|$)/.test(target.className) && target.parentNode !== utilsEl && target.parentNode.className.indexOf('s-head') < 0;
    if (target === phAction && target.className.indexOf('is-focus') < 0) solid = false;
    focusStatus.className = 'focus-status is-on' + (solid ? ' dark-ink' : '') + (photoFree ? ' photo-status' : '');
    focusStatus.textContent = text;
    focusStatus.style.left = clamp(x + 8, 112, 1808 - Math.min(w - 16, 800)) + 'px';
    focusStatus.style.top = clamp(y, 72, 988) + 'px';
    focusStatus.style.width = Math.min(w - 16, 800) + 'px';
  }
  function headButtons(list, fi, prefix) {
    return list.map(function (b, i) {
      return '<button type="button" tabindex="-1" class="btn' + (i === fi ? ' is-focus' : '') + (b[2] ? ' ' + b[2] : '') + '" data-z="head" data-i="' + i + '" data-action="' + prefix + '.' + b[0] + '" aria-label="' + esc(b[0] === 'undo' ? undoCaption() : b[1]) + '">' + (b[3] ? icon(b[3]) : '') + '<span>' + b[1] + '</span></button>';
    }).join('');
  }
  const FRAMES = {
    apps: function () {
      return '<h2 class="s-title" data-slot="title"></h2><p class="s-sub" data-slot="sub"></p><div class="s-head" data-slot="head"></div>'
        + '<div class="grid-view" data-slot="view"><div class="grid-in" data-slot="grid"></div></div>'
        + '<div class="row-cue grid-before" data-slot="before" aria-hidden="true">' + icon('up') + '</div><div class="row-cue grid-after" data-slot="after" aria-hidden="true">' + icon('down') + '</div>';
    },
    editor: function () {
      return '<h2 class="s-title">Apps auf der Startseite</h2><p class="s-sub" data-slot="sub"></p><div class="s-head" data-slot="head"></div>'
        + '<p class="s-label z-home" data-slot="lh"></p><p class="s-label z-other">Nicht auf der Startseite</p>'
        + '<div class="ed-home" data-slot="home"></div><div class="ed-order-break" data-slot="break">Danach scrollen</div><div class="ed-other-view" data-slot="ov"><div class="ed-other" data-slot="other"></div></div><div class="ed-origin" data-slot="origin"></div>'
        + '<div class="row-cue editor-before" data-slot="otherBefore" aria-hidden="true">' + icon('up') + '</div><div class="row-cue editor-after" data-slot="otherAfter" aria-hidden="true">' + icon('down') + '</div>';
    },
    settings: function () { return '<h2 class="s-title">Einstellungen</h2><div class="settings-overview" data-slot="list"></div><p class="settings-overview-hint"><span class="remote-key">OK</span><span>Ausgewählte Gruppe öffnen</span></p>'; },
    message: function (t) {
      const m = messageContent(t);
      return '<h2 class="msg-title">' + esc(m.title) + '</h2><p class="msg-line">' + esc(m.line) + '</p><p class="msg-note">' + esc(m.note) + '</p><div class="msg-acts" data-slot="acts"></div>';
    }
  };
  function gridTileHtml(id) {
    const a = app(id);
    const state = onHome(id) ? badge(true) + '<span>Auf Startseite</span>' : '';
    return '<span class="panel-content">' + appMark(a, 120, 72, 58) + '<span class="label">' + esc(a.name) + '</span></span><span class="state">' + state + '</span>';
  }
  const FILLS = {
    apps: function (t, el) {
      const f = t.f;
      const items = appsItems();
      const n = items.length;
      const rows = Math.ceil(n / COLS);
      const vis = 3;
      const row = Math.floor(f.i / COLS);
      setHTML(el.title, 'Alle Apps');
      setHTML(el.sub, esc(catalog.loading ? 'Installierte Apps werden geladen …' : catalog.error || (!n ? 'Keine installierten Apps gefunden.' : '')));
      setHTML(el.head, headButtons(appsHead(), f.zone === 'head' ? 0 : -1, 'apps'));
      el.head.className = 's-head' + (f.zone === 'head' ? ' is-awake' : '');
      if (f.zone === 'grid') { if (row < t.top) t.top = row; if (row > t.top + vis - 1) t.top = row - vis + 1; }
      t.top = clamp(t.top, 0, Math.max(0, rows - vis));
      keyed(el.grid, items.map(function (id) { return { key: id, id: id }; }), function (tile, it, i) {
        const focus = f.zone === 'grid' && i === f.i;
        setContent(tile, [it.id, app(it.id).name, onHome(it.id)].join('|'), function () { return gridTileHtml(it.id); });
        tile.className = 'gt' + (focus ? ' is-focus' : '');
        tile.style.transform = 'translate3d(' + ((i % COLS) * GRID_COL) + 'px,' + (Math.floor(i / COLS) * GRID_ROW) + 'px,0)';
        tile.setAttribute('role', 'button'); tile.setAttribute('aria-label', app(it.id).name);
        attrs(tile, 'grid', i, 'apps.open.' + it.id);
      });
      el.grid.style.transform = 'translate3d(0,' + (-t.top * GRID_ROW) + 'px,0)';
      el.view.className = 'grid-view' + (t.top > 0 ? ' more-before' : '') + (rows - t.top > vis ? ' more-after' : '');
      el.before.className = 'row-cue grid-before' + (t.top > 0 ? ' is-on' : '');
      el.after.className = 'row-cue grid-after' + (rows - t.top > vis ? ' is-on' : '');
    },
    editor: function (t, el) {
      const f = t.f;
      const H = t.lifted ? t.lifted.order : S.c.home;
      const O = otherGroups();
      const list = O.recent.concat(O.rest);
      const full = S.c.home.length >= CAP;
      const entries = [];
      const ys = [];
      let y = 0;
      let yf;
      let minTop;
      let maxTop = 0;
      let rowEnd;
      let before = false;
      let afterRows = false;
      const hint = catalog.error ? catalog.error : catalog.loading ? 'Installierte Apps werden geladen …' : f.zone === 'head' && f.h === 0 ? undoCaption() : f.zone === 'home' && f.part === 'remove' ? (H.length <= 1 ? LAST : app(H[f.i]).name + ' bleibt installiert.') : '';
      setHTML(el.sub, editStatus(hint, t.lifted ? app(t.lifted.id).name + ' wird verschoben. OK legt die App ab, Zurück setzt sie zurück.' : ''));
      setHTML(el.head, headButtons([['undo', 'Rückgängig', S.undo.length ? '' : 'is-idle', 'undo'], ['done', 'Fertig', '', 'check']], f.zone === 'head' ? f.h : -1, 'editor'));
      el.head.className = 's-head' + (f.zone === 'head' ? ' is-awake' : '');
      setHTML(el.lh, 'Auf der Startseite <span class="s-count">' + S.c.home.length + ' von ' + CAP + '</span>');
      el['break'].className = 'ed-order-break' + (H.length > editorCut() ? ' is-on' : '');
      el['break'].style.top = (264 + editorCut() * ED_ROW) + 'px';

      keyed(el.home, H.map(function (id) { return { key: id, id: id }; }), function (row, it, i) {
        const a = app(it.id);
        const here = f.zone === 'home' && i === f.i;
        const lifted = !!t.lifted && i === f.i;
        setContent(row, it.id, function () { return '<div class="er-name" role="button"><span class="panel-content"><span class="er-num"></span>' + smallMark(a) + '<span class="er-text">' + esc(a.name) + '</span><span class="er-move">' + icon('updown') + '</span></span></div><div class="er-rm" role="button"><span></span></div>'; });
        row.className = 'er' + (here ? ' is-active' : '') + (lifted ? ' is-lifted' : '');
        row.style.transform = 'translate3d(' + (lifted ? 16 : 0) + 'px,' + editorHomeY(i) + 'px,0)';
        row.querySelector('.er-num').textContent = String(i + 1);
        row.firstChild.className = 'er-name' + (here && (f.part === 'name' || lifted) ? ' is-focus' : '');
        row.lastChild.className = 'er-rm' + (here && f.part === 'remove' && !lifted ? ' is-focus' : '') + (H.length <= 1 ? ' is-limit' : '');
        row.lastChild.firstChild.textContent = H.length <= 1 ? LAST : 'Entfernen';
        attrs(row.firstChild, 'name', i, 'editor.move.' + it.id);
        attrs(row.lastChild, 'remove', i, 'editor.remove.' + it.id);
      });
      el.origin.className = 'ed-origin' + (t.lifted && t.lifted.from !== f.i ? ' is-on' : '');
      if (t.lifted) el.origin.style.transform = 'translate3d(0,' + (264 + editorHomeY(t.lifted.from) + 16) + 'px,0)';

      if (O.recent.length) { entries.push({ key: 'sep-recent', sep: 'Zuletzt entfernt', y: y }); y += ED_SEP; }
      O.recent.forEach(function (id) { entries.push({ key: id, id: id, y: y }); ys.push(y); y += ED_ROW; });
      if (O.recent.length && O.rest.length) { entries.push({ key: 'sep-rest', sep: 'Weitere installierte Apps', y: y }); y += ED_SEP; }
      O.rest.forEach(function (id) { entries.push({ key: id, id: id, y: y }); ys.push(y); y += ED_ROW; });
      if (f.zone === 'other' && ys.length) {
        yf = ys[f.j] - (O.recent.length && (f.j === 0 || f.j === O.recent.length) ? ED_SEP : 0);
        if (yf < t.top) t.top = yf;
        if (ys[f.j] + 72 > t.top + ED_VIEW) {
          minTop = ys[f.j] + 72 - ED_VIEW;
          entries.some(function (it) { if (it.y < minTop) return false; t.top = it.y; return true; });
        }
      }
      entries.some(function (it) { if (it.y < Math.max(0, y - ED_VIEW)) return false; maxTop = it.y; return true; });
      t.top = clamp(t.top, 0, maxTop);
      keyed(el.other, entries, function (row, it) {
        
        row.style.transform = 'translate3d(0,' + it.y + 'px,0)';
        rowEnd = it.y + (it.sep ? ED_SEP : 72);
        row.style.visibility = it.y >= t.top && rowEnd <= t.top + ED_VIEW ? 'visible' : 'hidden';
        before = before || it.y < t.top; afterRows = afterRows || rowEnd > t.top + ED_VIEW;
        if (it.sep) { setContent(row, 'sep|' + it.sep, function () { return esc(it.sep); }); row.className = 'eo-sep'; return; }
        const j = list.indexOf(it.id);
        const focus = f.zone === 'other' && j === f.j;
        const a = app(it.id);
        setContent(row, it.id, function () { return '<span class="panel-content">' + smallMark(a) + '<span class="eo-text">' + esc(a.name) + '</span><span class="eo-verb"></span></span>'; });
        setHTML(row.querySelector('.eo-verb'), focus ? '<span class="verb' + (full ? ' is-off' : '') + '">' + (full ? 'Startseite ist voll' : 'Zur Startseite hinzufügen') + '</span>' : '');
        row.className = 'eo' + (focus ? ' is-focus' : '');
        row.setAttribute('role', 'button');
        attrs(row, 'other', j, 'editor.add.' + it.id);
      });
      el.other.style.transform = 'translate3d(0,' + (-t.top) + 'px,0)';
      el.ov.className = 'ed-other-view';
      el.otherBefore.className = 'row-cue editor-before' + (before ? ' is-on' : '');
      el.otherAfter.className = 'row-cue editor-after' + (afterRows ? ' is-on' : '');
    },
    settings: function (t, el) {
      let html = '';
      settingsRows().forEach(function (r) {
        html += '<button type="button" tabindex="-1" class="settings-group' + (r.id === t.f.id ? ' is-focus' : '') + '" data-z="row" data-i="0" data-id="' + r.id + '" data-action="settings.' + (r.id === 'editor' ? 'editor' : 'group.' + r.id) + '"><span class="settings-group-copy"><span class="settings-group-name">' + esc(r.label) + '</span><span class="settings-group-value">' + esc(r.value) + '</span></span>' + icon('right') + '</button>';
      });
      setHTML(el.list, html);
    },
    message: function (t, el) {
      setHTML(el.acts, messageContent(t).actions.map(function (a, i) {
        return '<button type="button" tabindex="-1" class="btn' + (i === t.f.b ? ' is-focus' : '') + '" data-z="act" data-i="' + i + '" data-action="message.' + a[0] + '"><span>' + a[1] + '</span></button>';
      }).join(''));
    }
  };

  /* ---------- Atomic appearance bundles ---------- */
  let wallToken = 0;
  let committedBundle = null;
  let reflowToken = 0;
  let fontSwitchToken = 0;
  function registeredMaterial(id) { return S.c.bg === 'photo' && S.c.material === 'soft' && !!wall(id); }
  function matSrc(id, material) { return 'assets/materials/' + id + (material === 'soft' ? '-study-soft.jpg' : material === 'tint' ? '-field-clear.jpg' : '-field-frost.jpg'); }
  function fieldSrc(id, material) { return 'assets/materials/' + id + (material === 'soft' ? '-field-blur.jpg' : material === 'tint' ? '-field-clear.jpg' : '-field-frost.jpg'); }
  function makeImg(cls, src) { const im = document.createElement('img'); im.className = cls; im.alt = ''; im._src = src; im.src = src; return im; }
  function whenReady(im, done) {
    let fin = false;
    const timer = setTimeout(function () { finish(!!(im.complete && im.naturalWidth)); }, document.hidden ? 20000 : 8000);
    function finish(ok) { if (fin) return; fin = true; clearTimeout(timer); done(ok); }
    function ready() {
      // Hidden TV prelaunch may suspend decode even after a valid image loads.
      if (document.hidden || !im.decode) { finish(true); return; }
      im.decode().then(function () { finish(true); }, function () { finish(!!(im.complete && im.naturalWidth)); });
    }
    if (im.complete) { if (im.naturalWidth) ready(); else finish(false); }
    else { im.onload = ready; im.onerror = function () { finish(false); }; }
  }
  function swapImg(k, im) { const old = IMG[k]; if (old === im) return; im.style.cssText = old.style.cssText; if (old.id) im.id = old.id; old.parentNode.replaceChild(im, old); IMG[k] = im; }
  function bundleKey(look) { return look.wall + '|' + look.material; }
  function loadBundle(look, token, done) {
    const imgs = { photo: makeImg('photo', WP + look.wall + '.jpg'), bg: makeImg('sheet-bg', WP + look.wall + '-panel.jpg') };
    let left;
    let allOk = true;
    imgs.mat = makeImg('mat-img', matSrc(look.wall, look.material));
    imgs.field = makeImg('ph-field-img', fieldSrc(look.wall, look.material));
    imgs.fieldAlt = makeImg('ph-field-img', fieldSrc(look.wall, look.material));
    imgs.utility = makeImg('ph-field-img', fieldSrc(look.wall, look.material));
    imgs.utilityAlt = makeImg('ph-field-img', fieldSrc(look.wall, look.material));
    const keys = Object.keys(imgs); left = keys.length;
    keys.forEach(function (k) { whenReady(imgs[k], function (ok) {
      allOk = allOk && ok;
      if (--left || token !== wallToken) return;
      done(allOk ? { key: bundleKey(look), imgs: imgs } : null);
    }); });
  }
  function installBundle(bundle, look, previewOnly) {
    if (bundle) {
      Object.keys(bundle.imgs).forEach(function (k) { if (!previewOnly || k !== 'bg') swapImg(k, bundle.imgs[k]); });
      S.bundleKey = bundle.key;
    }
    S.shown = { bg: look.bg, wall: look.wall, material: look.material, font: look.font };
    phFields.concat(utFields).forEach(function (el) { const p = el._placement; if (p) fieldTransform(el, p.x, p.y, p.width, p.height); });
    S.wallShown = look.wall; S.wallPending = null; S.wallError = null;
  }
  function cleanPatch(patch) {
    const out = {};
    let k;
    if (!patch || typeof patch !== 'object') throw new Error('look needs an appearance patch');
    for (k in patch) if (patch.hasOwnProperty(k)) {
      if (k === 'wall') { if (!wall(patch[k])) throw new Error('Unknown wallpaper: ' + patch[k]); }
      else if (k === 'font') { if (!FONTS[patch[k]] || patch[k] !== 'manrope' && PRIVATE_FONTS.indexOf(patch[k]) < 0) throw new Error('Unavailable font: ' + patch[k]); }
      else if (!LOOK_VALUES[k] || LOOK_VALUES[k].indexOf(patch[k]) < 0) throw new Error('Invalid appearance value: ' + k);
      out[k] = patch[k];
    }
    return out;
  }
  function cancelLook() { wallToken++; S.pending = null; S.wallPending = null; S.lookError = null; }
  function setLook(patch, options) {
    const opts = options || {};
    const changes = cleanPatch(patch);
    const target = lookOf(S.c);
    let k;
    let loadedBundle = null;
    let imageDone;
    let fontDone;
    let failed = false;
    for (k in changes) if (changes.hasOwnProperty(k)) target[k] = changes[k];
    const changed = Object.keys(target).some(function (key) { return target[key] !== S.c[key]; });
    cancelLook(); S.err = null; const token = wallToken;
    function finish(bundle) {
      const c = next(S.c.home.slice(), S.c.recent.slice());
      const fontChanged = target.font !== S.c.font;
      const reflow = target.apps !== S.c.apps || target.controls !== S.c.controls || fontChanged;
      let frame;
      let fontFrame;
      Object.keys(target).forEach(function (key) { c[key] = target[key]; });
      S.pending = null; S.wallPending = null;
      if (!opts.transient && changed && !write(c, 'Appearance')) { S.lookError = { type: 'save', patch: changes, row: opts.row || S.appearanceFocus, transient: false }; render(); syncRotation(); return; }
      if (opts.transient) S.c = c;
      if (reflow) { S.reflow = true; frame = ++reflowToken; }
      if (fontChanged) { S.fontSwitch = true; fontFrame = ++fontSwitchToken; }
      installBundle(bundle, target);
      if (bundle) committedBundle = bundle;
      S.lookError = null; S.previewBundle = null;
      render(); syncRotation();
      if (reflow) window.requestAnimationFrame(function () { window.requestAnimationFrame(function () {
        if (frame !== reflowToken) return;
        S.reflow = false; stage.className = stage.className.replace(/\s+is-reflow/g, '');
      }); });
      if (fontChanged) setTimeout(function () {
        if (fontFrame !== fontSwitchToken) return;
        S.fontSwitch = false; stage.className = stage.className.replace(/\s+is-font-switch/g, '');
      }, REDUCED_MOTION ? 130 : 170);
    }
    function fail(type, reason) {
      if (token !== wallToken || failed) return;
      failed = true; S.pending = null; S.wallPending = null;
      if (type === 'load') S.wallError = target.wall;
      S.lookError = { type: type, reason: reason || null, patch: changes, row: opts.row || (type === 'font' ? 'font' : S.appearanceFocus), transient: !!opts.transient, wall: target.wall, font: target.font };
      if (type === 'font') log((opts.startup ? 'font fallback: ' : 'Font kept: ') + (opts.startup ? target.font : FONTS[S.c.font].name) + (opts.startup ? '' : ' (' + reason + ')'));
      if (type === 'font' && opts.startup && target.font !== 'manrope') { setLook({ font: 'manrope' }, { transient: true }); return; }
      render(); syncRotation();
    }
    function complete() {
      if (!imageDone || !fontDone || failed || token !== wallToken) return;
      if (document.hidden) { finish(loadedBundle); return; }
      window.requestAnimationFrame(function () { if (!failed && token === wallToken) finish(loadedBundle); });
    }
    const needs = target.bg === 'photo' && S.bundleKey !== bundleKey(target) && (!S.shown || S.shown.bg !== 'photo' || target.wall !== S.c.wall || materialApplies(target));
    const needsFont = !fontMetrics[target.font]; imageDone = !needs; fontDone = !needsFont;
    if (!needs && !needsFont) { finish(null); return; }
    S.pending = { patch: changes, target: target, row: opts.row || (needsFont ? 'font' : S.appearanceFocus), transient: !!opts.transient, preview: false };
    if (needs) {
      S.wallPending = target.wall;
      loadBundle(target, token, function (bundle) {
        if (!bundle) { fail('load'); return; }
        loadedBundle = bundle; imageDone = true; complete();
      });
    }
    if (needsFont) ensureFont(target.font, function (ok, reason) {
      if (!ok) { fail('font', reason); return; }
      fontDone = true; complete();
    });
    render();
  }
  function showWall(id, done) {
    const target = lookOf(S.c); 
    target.bg = 'photo'; target.wall = id;
    cancelLook(); const token = wallToken; S.wallError = null;
    S.pending = { patch: { wall: id }, target: target, row: 'bg', preview: true, transient: false }; S.wallPending = id;
    loadBundle(target, token, function (bundle) {
      S.pending = null; S.wallPending = null;
      if (!bundle) { S.wallError = id; done(false); return; }
      S.previewBundle = bundle; installBundle(bundle, target, true); done(true);
    });
    render();
  }
  function restoreLook() {
    cancelLook(); S.previewBundle = null;
    if (S.c.bg === 'photo' && committedBundle && committedBundle.key === bundleKey(S.c)) installBundle(committedBundle, S.c);
    else if (S.c.bg !== 'photo' || S.bundleKey === bundleKey(S.c)) installBundle(null, S.c);
    else setLook({}, { transient: true });
  }

  /* ---------- Lifecycle and remote input ---------- */
  let clockTimer = 0;
  let rotationTimer = 0;
  let activeSince = 0;
  let activeMs = 0;
  let rotationKey = '';
  function rotationActive() { return !document.hidden && top().id === 'home' && S.c.bg === 'photo' && !S.pending && mode().min > 0; }
  function pauseRotation() {
    if (activeSince) { activeMs += Date.now() - activeSince; activeSince = 0; }
    clearTimeout(rotationTimer); rotationTimer = 0;
  }
  function resetRotation() { pauseRotation(); activeMs = 0; rotationKey = ''; }
  function syncRotation() {
    const key = S.c.wall + '|' + S.c.mode;
    pauseRotation();
    if (key !== rotationKey) { activeMs = 0; rotationKey = key; }
    if (!rotationActive()) return;
    activeSince = Date.now();
    rotationTimer = setTimeout(function () {
      pauseRotation(); activeMs = 0;
      if (rotationActive()) setLook({ wall: WALLS[(wallIndex(S.c.wall) + 1) % WALLS.length].id }, { row: 'bg' });
    }, Math.max(10, mode().min * QA.minuteMs - activeMs));
  }
  function updateClock() {
    clearTimeout(clockTimer);
    if (document.hidden) return;
    paintCaption();
    refreshWeather(paintCaption);
    clockTimer = setTimeout(updateClock, 60000 - (Date.now() % 60000) + 30);
  }
  function paintCaption() {
    if (!document.hidden && (top().id === 'home' || isSettingsDetail(top()))) renderCaption(top(), homeState(top()));
  }
  function focusStage() { try { stage.focus({ preventScroll: true }); } catch (e) { stage.focus(); } }
  function after() {
    norm(); const t = top();
    if (t.group === 'inputs' && t.refreshInputs && !t.loading && !document.hidden) { t.refreshInputs = false; loadInputs(t); }
    render(); syncRotation();
  }
  function refreshInputsOnReturn() { const t = top(); if (t.group === 'inputs' && !t.loading) t.refreshInputs = true; }
  function goScene(name) {
    FrameDevice.cancelSource();
    if (top().id === 'wallpaper') cancelWallpaperTimer(top());
    S.stack = [S.stack[0]]; S.stack[0].f.zone = 'apps'; clearSession(); restoreLook();
    if (name === 'apps') openApps();
    else if (name === 'settings') openSettings();
    else if (name === 'appearance') { openSettings(); top().f.id = 'background'; S.settingsFocus = 'background'; openAppearance('background'); }
    else if (name === 'editor') { openSettings(); openEditor('settings'); }
    after();
  }
  function fit() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'scale(' + scale + ')';
    stage.style.left = ((window.innerWidth - 1920 * scale) / 2) + 'px';
    stage.style.top = ((window.innerHeight - 1080 * scale) / 2) + 'px';
  }
  function renderedAction(el) {
    return el.getClientRects().length > 0 && window.getComputedStyle(el).visibility !== 'hidden';
  }
  function focusedAction() {
    const root = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl;
    const els = root.querySelectorAll('.is-focus[data-action]');
    let i;
    for (i = 0; i < els.length; i++) if (renderedAction(els[i])) return els[i].getAttribute('data-action');
    return null;
  }
  function activate(action) {
    const root = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl;
    const els = root.querySelectorAll('[data-action]');
    let i;
    if (action === 'appearance.bg' && top().id === 'appearance' && top().group === 'background') action = 'background.wallpaper';
    if (action === 'settings.appearance' && top().id === 'settings') action = 'settings.group.background';
    for (i = 0; i < els.length; i++) if (renderedAction(els[i]) && els[i].getAttribute('data-action') === action) { pointAt(els[i]); return true; }
    return false;
  }
  function pointAt(el) {
    const t = top();
    const v = V[t.id];
    norm();
    if (v.point) v.point(t, el.getAttribute('data-z'), +el.getAttribute('data-i'), el.getAttribute('data-id'));
    norm();
    render();
    syncRotation();
  }

  utilsEl.addEventListener('mouseover', function (ev) {
    let b = ev.target;
    const t = top(); 
    if (utilsEl.className.indexOf('quiet-utils') < 0 || t.lifted) return;
    while (b && b !== utilsEl && !(b.getAttribute && b.getAttribute('data-z'))) b = b.parentNode;
    if (!b || b === utilsEl || (ev.relatedTarget && b.contains(ev.relatedTarget))) return;
    const z = b.getAttribute('data-z');
    const i = Number(b.getAttribute('data-i'));
    if ((t.id !== 'home' || z !== 'util') && (t.id !== 'arrange' || z !== 'ctl')) return;
    if (t.f.zone === z && t.f.u === i) return;
    t.f.zone = z; t.f.u = i;
    if (z === 'util') S.lastUtil = i;
    render();
  });
  stage.addEventListener('click', function (ev) {
    let el = ev.target;
    while (el && el !== stage && !(el.getAttribute && el.getAttribute('data-z'))) el = el.parentNode;
    focusStage();
    if (!el || el === stage) return;
    pointAt(el);
  });
  let heldKeys = {};
  document.addEventListener('keydown', function (ev) {
    const code = ev.keyCode;
    const k = KEYS[code];
    if (code === 9) { ev.preventDefault(); return; }
    if (!k || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    ev.preventDefault();
    if (k === 'ok' || k === 'back') { if (ev.repeat || heldKeys[code]) return; heldKeys[code] = true; }
    press(k);
  });
  document.addEventListener('keyup', function (ev) { delete heldKeys[ev.keyCode]; });
  window.addEventListener('blur', function () { heldKeys = {}; });
  window.addEventListener('focus', function () { FrameDevice.cancelSource(); release(); refreshInputsOnReturn(); focusStage(); after(); updateClock(); });
  document.addEventListener('visibilitychange', function () {
    heldKeys = {};
    if (document.hidden) { FrameDevice.cancelSource(); pauseRotation(); clearTimeout(clockTimer); }
    else {
      release();
      if (S.c.bg === 'photo' && !S.pending && !S.previewBundle && (!committedBundle || S.bundleKey !== bundleKey(S.c))) setLook({}, { transient: true, startup: true });
      refreshInputsOnReturn(); after(); updateClock(); focusStage();
    }
  });
  window.addEventListener('resize', fit);

  /* Readable browser checks use the real state and actions, without fake outcomes. */
  const NAV = { left: 'left', right: 'right', up: 'up', down: 'down', ok: 'ok', enter: 'ok', back: 'back', escape: 'back' };
  QA.state = function () {
    const out = serialise(S.c);
    const t = top();
    const item = t.id === 'appearance' ? detailLocation(t).item : null;
    out.committed = S.c; out.shown = S.shown; out.pending = S.pending; out.view = t.id; out.selected = S.sel;
    out.focusAction = focusedAction(); out.writes = S.writes; out.failedWrites = S.failed; out.error = S.err;
    out.catalog = { loading: catalog.loading, loaded: catalog.loaded, error: catalog.error, ids: ALPHA.slice() };
    out.fonts = { available: LOOK_VALUES.font.slice(), loaded: Object.keys(fontMetrics).filter(function (id) { return !fontMetrics[id].fallback; }), baselineFallback: !!(fontMetrics.manrope && fontMetrics.manrope.fallback), error: S.lookError && S.lookError.type === 'font' ? S.lookError : null };
    out.rotation = { activeMs: activeMs + (activeSince ? Date.now() - activeSince : 0), active: !!activeSince };
    out.draft = t.lifted ? { id: t.lifted.id, order: t.lifted.order.slice() } : null;
    out.settingsGroup = t.id === 'wallpaper' ? 'wallpaper' : t.id === 'appearance' ? t.group : null;
    out.focusedChoice = item && item.axis ? { axis: item.axis, value: item.value, action: item.action, disabled: item.disabled } : null;
    out.candidate = out.focusedChoice ? { axis: item.axis, value: item.value, action: item.action, pending: !!S.pending, pendingTarget: S.pending ? S.pending.target : null } : null;
    out.wallpaperPicker = t.id === 'wallpaper' ? { candidate: WALLS[t.i].id, applied: S.c.wall, shown: S.wallShown, pending: t.previewDue || S.wallPending,
      queuedApplying: !!t.applyPending, applyPending: t.applyPending, failed: t.failedId, zone: t.f.zone, top: t.top, visible: WALL_VISIBLE, backdrop: IMG.bg.src } : null;
    out.undo = S.undo.map(function (u) { return u.label; }); out.storageOk = storageOk;
    return JSON.parse(JSON.stringify(out));
  };
  QA.where = function () {
    const action = focusedAction();
    const active = stage.querySelectorAll('.is-focus[data-action]');
    let count = 0;
    let name = '';
    Array.prototype.forEach.call(active, function (el) { if (renderedAction(el)) { count++; if (el.getAttribute('data-action') === action) name = el.getAttribute('aria-label') || el.textContent.replace(/\s+/g, ' ').trim(); } });
    return { view: top().id, settingsGroup: top().id === 'wallpaper' ? 'wallpaper' : top().id === 'appearance' ? top().group : null, focus: name, focusAction: action, focusCount: count, wallpaper: S.wallShown, zone: top().f.zone || null };
  };
  QA.ready = function () { return fontsReady && !S.pending && !!S.shown && S.shown.bg === S.c.bg && S.shown.wall === S.c.wall && S.shown.font === S.c.font; };
  QA.nav = function () { const keys = arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments); keys.forEach(function (key) { if (!NAV[key]) throw new Error('Unknown key'); press(NAV[key]); }); return QA.state(); };
  QA.look = function (patch) { setLook(patch, {}); return QA.state(); };
  QA.scene = function (name) { if (['home', 'apps', 'settings', 'appearance', 'editor'].indexOf(name) < 0) throw new Error('Unknown view'); goScene(name); return QA.state(); };
  QA.activate = function (action) { return activate(action) ? QA.state() : null; };
  QA.actions = function () { const view = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl; return Array.prototype.filter.call(view.querySelectorAll('[data-action]'), renderedAction).map(function (el) { return el.getAttribute('data-action'); }); };

  /* ---------- Start ---------- */
  cueL.innerHTML = icon('left'); cueR.innerHTML = icon('right');
  initialise();
  loadWeather();
  setLook({}, { transient: true, startup: true });
  norm(); render(); fit(); focusStage(); updateClock(); syncRotation();
})();
