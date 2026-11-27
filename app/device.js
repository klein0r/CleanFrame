/* Public Tizen application APIs. No Mac server, network address or credentials. */
(function () {
  'use strict';
  const IDS = {
    stremio: 'IkWsFHtOY9.Stremio', netflix: 'org.tizen.netflix-app',
    disneyplus: 'MCmYXNxgcu.DisneyPlus', youtube: '9Ur5IzDKqV.TizenYouTube',
    appletv: 'com.samsung.tv.aria-video', primevideo: 'org.tizen.primevideo',
    abciview: 'mWK87Xghap.ABCiview', sbs: 'OyE7OuxlUi.SBSOnDemand',
    applemusic: 'org.tizen.apple.apple-music'
  };
  const STREAMING = ['as6cYRgkPy.Binge', '73iTZRTc34.Stan', '5b8c3eb16b.BeamCTVDev',
    'cj37Ni3qXM.HBONow', 'LBUAQX1exg.Hulu', 'gzcc4LRFBF.Peacock', 'rJyOSqC6Up.CBSAllAccess',
    'Rk72oKFsRS.OtterKidsProd', '70fRFUwYlD.OtterGAProd', 'PvWgqxV3Xa.YouTubeTV',
    'XtU8fQk2gN.ESPN', 'ZmmGjO6VKO.slingtv', 'VtuWAiZdHN.STARZPlay', 'ckfgqqzvt0.dplus',
    'kk8MbItQ0H.VUDU', 'Jz7aUrV2Q4.Twitch', 'OK2Rdkjmsi.IMDbTV', 'Ob3XhAVMu6.amcplus',
    'KaLitts8bq.tenplaySamsungTizen', 'eYuOiOLYQX.KayoSports', 'Ne2ZsPWdKl.9NOW',
    '3KA0pm7a7V.TubiTV', 'rJeHak5zRg.Spotify', 'icp4AvUPiA.7plus',
    'yPSlpvfeTf.ZDFmediathek', 'SrAoJxGQUf.ARD', 'cg2m3QSB89.7tv'];
  const CONSUMER_SYSTEM = ['org.tizen.browser', 'com.microsoft.copilot'];
  const EXTRA_BRANDS = {'rJeHak5zRg.Spotify': 'spotify', '5b8c3eb16b.BeamCTVDev': 'hbomax', 'cj37Ni3qXM.HBONow': 'hbomax', '3KA0pm7a7V.TubiTV': 'tubi',
    'yPSlpvfeTf.ZDFmediathek': 'zdf', 'SrAoJxGQUf.ARD': 'ard', 'cg2m3QSB89.7tv': 'joyn'};
  // Shorter display names where the TV's own name is a long store title.
  const EXTRA_NAMES = {'SrAoJxGQUf.ARD': 'ARD Mediathek', 'yPSlpvfeTf.ZDFmediathek': 'ZDF'};
  const INTERNAL = ['adplatform.ADPlayer', 'WykOS4t4F0.cmsWebApp', '25emanual3.emanual',
    'd0m1lV1nt2.emanual', '2022ePop01.SmartTV',
    'ZODRT12q2l.WebAccountExtension', 'ByJlgt0XeD.CastSettingsApp', 'tv6pbVMQFF.PrivacyChoices'];
  const SELF = 'nClrkHome1.FrameHome';
  function api() { return window.tizen && window.tizen.application; }
  function selfId() {
    try { return api().getCurrentApplication().appInfo.id || SELF; }
    catch (err) { return SELF; }
  }
  function unavailable(done) {
    done({ message: 'CleanFrame auf dem Fernseher öffnen, um diese Funktion zu nutzen.', detail: 'Die Web-Vorschau kann den Fernseher nicht steuern.' });
  }
  function failure(err) {
    return { message: 'Der Fernseher konnte diese Ansicht nicht öffnen.', detail: err && (err.message || err.name) || 'Erneut versuchen oder mit der Home-Taste der Fernbedienung zu CleanFrame zurückkehren.' };
  }
  function bounded(done, timeout) {
    let finished = false;
    const timer = setTimeout(function () { finish({ message: 'Der Fernseher hat nicht reagiert. Bitte erneut versuchen.', timeout: true }); }, timeout || 8000);
    function finish(err, value) { if (finished) return; finished = true; clearTimeout(timer); done(err, value); }
    return finish;
  }
  let sourceCancel = null;
  function cancelSource() { if (sourceCancel) sourceCancel(); }
  function sources(done) {
    const sys = window.tizen && window.tizen.systeminfo;
    const tvw = window.tizen && window.tizen.tvwindow;
    if (!sys || typeof sys.getPropertyValue !== 'function' || !tvw || typeof tvw.setSource !== 'function') { unavailable(done); return; }
    const finish = bounded(done);
    try {
      sys.getPropertyValue('VIDEOSOURCE', function (video) {
        const list = [];
        const byPort = {};
        let active = null;
        try { if (typeof tvw.getSource === 'function') active = tvw.getSource(); } catch (err) { /* Status may be unavailable while discovery still works. */ }
        function record(src, connected) {
          if (!src || src.type !== 'HDMI' || typeof src.number !== 'number' || !isFinite(src.number) || src.number < 0 || Math.floor(src.number) !== src.number) return;
          const key = String(src.number);
          let item = byPort[key];
          if (!item) {
            item = { number: src.number, name: 'HDMI ' + src.number, connected: false, active: !!(active && active.type === 'HDMI' && active.number === src.number), source: src };
            byPort[key] = item; list.push(item);
          }
          if (connected) { item.connected = true; item.source = src; }
        }
        if (video && Array.isArray(video.disconnected)) video.disconnected.forEach(function (src) { record(src, false); });
        if (video && Array.isArray(video.connected)) video.connected.forEach(function (src) { record(src, true); });
        list.sort(function (a, b) { return a.number - b.number; });
        finish(null, list);
      }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  function setSource(port, done) {
    cancelSource();
    const tvw = window.tizen && window.tizen.tvwindow;
    const app = api();
    let finished = false;
    if (typeof port !== 'number' || !isFinite(port) || port < 0 || Math.floor(port) !== port) { done({ message: 'Dieser HDMI-Eingang ist nicht verfügbar.' }); return; }
    if (!tvw || typeof tvw.setSource !== 'function' || !app || typeof app.launch !== 'function') { unavailable(done); return; }
    const timer = setTimeout(function () { finish({ message: 'Der Fernseher hat nicht reagiert. Bitte erneut versuchen.' }); }, 8000);
    function finish(err, value) {
      if (finished) return;
      finished = true; clearTimeout(timer);
      if (sourceCancel === cancel) sourceCancel = null;
      done(err, value);
    }
    function cancel() { finish({ message: 'Eingangswechsel abgebrochen.', cancelled: true }); }
    sourceCancel = cancel;
    sources(function (err, list) {
      if (finished) return;
      if (err) { finish(err); return; }
      let input = null;
      list.some(function (item) { if (item.number === port) { input = item; return true; } return false; });
      if (!input) { finish({ message: 'Dieser HDMI-Eingang ist nicht mehr verfügbar.' }); return; }
      try {
        tvw.setSource(input.source, function (selected) {
          if (finished) return;
          if (selected && (selected.type !== 'HDMI' || selected.number !== port)) { finish({ message: 'Der Fernseher hat einen anderen Eingang gewählt. Bitte erneut versuchen.' }); return; }
          try {
            app.launch('org.tizen.tv-viewer', function () { finish(null, input); }, function () {
              finish({ message: 'Der Eingang wurde gewählt, aber die TV-Ansicht ließ sich nicht öffnen.', detail: 'Den Eingang über die Source-Taste der Fernbedienung anzeigen.' });
            });
          } catch (error) { finish({ message: 'Der Eingang wurde gewählt, aber die TV-Ansicht ließ sich nicht öffnen.' }); }
        }, function (error) { if (!finished) finish(failure(error)); });
      } catch (error) { finish(failure(error)); }
    });
  }
  function launchApp(id, done) {
    if (!api()) { unavailable(done); return; }
    const finish = bounded(done);
    try { api().launch(id, function () { finish(null); }, function (err) { finish(failure(err)); }); }
    catch (err) { finish(failure(err)); }
  }
  function launch(brand, done) {
    if (!IDS[brand]) { done({message: 'Für diese App ist kein Startziel hinterlegt.'}); return; }
    launchApp(IDS[brand], done);
  }
  function art(done) {
    if (!api()) { unavailable(done); return; }
    const finish = bounded(done);
    try {
      const data = [new tizen.ApplicationControlData('mode', ['fullscreen']), new tizen.ApplicationControlData('requester', ['mobile'])];
      const control = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/default', null, null, null, data);
      api().launchAppControl(control, 'org.tizen.art-app', function () { finish(null); }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  function home(done) { launchApp('com.samsung.tv.csfs', done); }
  /* TV settings: the 2022 Frame (Tizen 6.5) reports a launch of com.samsung.tv.coba.setting but shows
     nothing, while org.tizen.menu opens the full menu there. The reference TV (Tizen 9) uses
     com.samsung.tv.coba.setting. Below Tizen 7 the menu is tried first; the other ID follows only
     when the first launch is refused, never after a timeout, so two menus cannot both open. */
  function platformMajor() {
    try {
      const sys = window.tizen && window.tizen.systeminfo;
      const major = sys && typeof sys.getCapability === 'function' ? parseInt(String(sys.getCapability('http://tizen.org/feature/platform.version')), 10) : 0;
      return major > 0 ? major : 0;
    } catch (err) { return 0; }
  }
  function settings(done) {
    const major = platformMajor();
    const ids = major && major < 7 ? ['org.tizen.menu', 'com.samsung.tv.coba.setting'] : ['com.samsung.tv.coba.setting', 'org.tizen.menu'];
    launchApp(ids[0], function (err) {
      if (err && !err.timeout && api()) launchApp(ids[1], done);
      else done(err);
    });
  }
  function apps(done) {
    if (!api()) { unavailable(done); return; }
    // Large installed catalogues can take longer than a launch response.
    const finish = bounded(done, 20000);
    try {
      api().getAppsInfo(function (list) {
        const known = {};
        const seen = {};
        const result = [];
        const self = selfId();
        Object.keys(IDS).forEach(function (brand) { known[IDS[brand]] = brand; });
        list.forEach(function (a) {
          const primary = !!known[a.id];
          const stream = STREAMING.indexOf(a.id) >= 0;
          const consumer = /^[A-Za-z0-9]{10}\.[A-Za-z0-9_-]+$/.test(a.id) || CONSUMER_SYSTEM.indexOf(a.id) >= 0;
          if (a.id === self || INTERNAL.indexOf(a.id) >= 0 || seen[a.id] || !a.name || (!primary && !stream && (!a.show || !consumer))) return;
          if (!primary && /(?:service|worker|preview|promotion|plugin|launcher|test|sdk|^ep[ -]|factory|daemon)/i.test(a.name + ' ' + a.id)) return;
          if (/-dummy$/.test(a.id) || a.id === 'com.samsung.tv.cobalt-yt') return;
          seen[a.id] = true;
          result.push({ appId: a.id, name: EXTRA_NAMES[a.id] || a.name, brand: known[a.id] || EXTRA_BRANDS[a.id] || '', icon: a.iconPath || '', rank: primary ? Object.keys(IDS).indexOf(known[a.id]) : (stream ? 20 : 30) });
        });
        result.sort(function (a, b) { return a.rank - b.rank || a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
        finish(null, result);
      }, function (err) { finish(failure(err)); });
    } catch (err) { finish(failure(err)); }
  }
  // Offline brand and display name for a known app ID, so stored Home entries need no catalogue read.
  function describe(appId) { return { brand: EXTRA_BRANDS[appId] || '', name: EXTRA_NAMES[appId] || '' }; }
  window.FrameDevice = { describe: describe, launch: launch, launchApp: launchApp, art: art, home: home, settings: settings, apps: apps, sources: sources, setSource: setSource, cancelSource: cancelSource };
}());
