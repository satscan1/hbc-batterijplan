// Versie: 12-11-2026 19:00 (compact hoofdscherm - statusregel, besparingslijn, dagen; Adrie 12-11-2026)
// Project tag: [BATTERIJPLAN]
// Drie proefkaarten voor het compacte hoofdscherm met vensters:
//   batterijplan-regel-card      statusregel (modus, strategie, voorspelling, komend kwartier)
//   batterijplan-spaarlijn-card  besparing vandaag als lijn: doorgetrokken tot nu, gestippeld tot 24:00
//   batterijplan-dagen-card      opbrengst per dag: label, trend, bedrag; vandaag (verwacht) bovenaan, nieuw naar oud
(function () {
  var TXT = {
    nl: { loc: 'nl-NL', live: 'Live', schaduw: 'Schaduw', strat: 'HBC', voorsp: 'voorspelling', kw: 'Kwartier', zelfde: 'hetzelfde als HBC', zou: 'HBC zou', nu: 'Nu', dag: 'Dag', trend: 'Trend', opl: 'Opgeleverd', vandaag: 'Vandaag', verwacht: 'verwacht', alb: 'al bespaard', gem: 'Gemiddeld per dag', beste: 'Beste dag', leg: '▲ meer dan de dag ervoor · ▼ minder · = ongeveer gelijk (±10 %)', titelL: 'Besparing vandaag', legL: 'doorgetrokken = al bespaard · gestippeld = verwacht', geen: 'Nog geen gegevens', wacht: 'Wacht op het plan', act: { L: 'laden van het net', O: 'ontladen', H: 'vasthouden', V: 'terugleveren', Z: 'zon / niets' } },
    en: { loc: 'en-GB', live: 'Live', schaduw: 'Shadow', strat: 'HBC', voorsp: 'forecast', kw: 'Quarter', zelfde: 'same as HBC', zou: 'HBC would', nu: 'Now', dag: 'Day', trend: 'Trend', opl: 'Earned', vandaag: 'Today', verwacht: 'expected', alb: 'saved so far', gem: 'Average per day', beste: 'Best day', leg: '▲ more than the day before · ▼ less · = about the same (±10 %)', titelL: 'Savings today', legL: 'solid = saved so far · dashed = expected', geen: 'No data yet', wacht: 'Waiting for the plan', act: { L: 'charge from grid', O: 'discharge', H: 'hold', V: 'feed in', Z: 'solar / nothing' } },
    de: { loc: 'de-DE', live: 'Live', schaduw: 'Schatten', strat: 'HBC', voorsp: 'Prognose', kw: 'Viertelstunde', zelfde: 'wie HBC', zou: 'HBC würde', nu: 'Jetzt', dag: 'Tag', trend: 'Trend', opl: 'Ertrag', vandaag: 'Heute', verwacht: 'erwartet', alb: 'bisher gespart', gem: 'Durchschnitt pro Tag', beste: 'Bester Tag', leg: '▲ mehr als am Vortag · ▼ weniger · = ungefähr gleich (±10 %)', titelL: 'Ersparnis heute', legL: 'durchgezogen = bisher gespart · gestrichelt = erwartet', geen: 'Noch keine Daten', wacht: 'Warte auf den Plan', act: { L: 'aus dem Netz laden', O: 'entladen', H: 'halten', V: 'einspeisen', Z: 'Solar / nichts' } }
  };
  var GROEN = '#1dab52', ORANJE = '#f59e0b', GRIJS = 'var(--secondary-text-color)';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tx(c) { return TXT[(c && c.taal) || window.__bpLang || 'nl'] || TXT.nl; }
  function num(v, t, n) { return Math.abs(v).toLocaleString(t.loc, { minimumFractionDigits: n, maximumFractionDigits: n }); }
  function geld(v, t) {
    if (v === null || v === undefined || !isFinite(v)) return { tx: '–', kl: GRIJS };
    if (v > 0.005) return { tx: '+ € ' + num(v, t, 2), kl: GROEN };
    if (v < -0.005) return { tx: '– € ' + num(v, t, 2), kl: ORANJE };
    return { tx: '€ 0' + (0.5).toLocaleString(t.loc).charAt(1) + '00', kl: GRIJS };
  }
  function uur(ms) { var d = new Date(ms); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function mainId(h) { return h.states['sensor.batterijplan_2'] ? 'sensor.batterijplan_2' : 'sensor.batterijplan'; }
  function mwId(h) { return h.states['sensor.batterijplan_meerwaarde_2'] ? 'sensor.batterijplan_meerwaarde_2' : 'sensor.batterijplan_meerwaarde'; }
  function statTijd(x) { return typeof x.start === 'number' ? x.start : Date.parse(x.start); }

  // ---- gedeelde gegevens (1x per minuut, voor alle kaarten) --------------------------------------------------
  var SUBS = [], DATA = { basis: null, basisDag: null, real: null, dagen: null }, BUSY = {}, SLOT = {};
  function meld() { SUBS.forEach(function (c) { c._sig = null; c._render(); }); }
  function laad(h) {
    var d0 = new Date(); d0.setHours(0, 0, 0, 0);
    var dag = d0.toISOString(), slot = Math.floor(Date.now() / 60000), id = mwId(h);
    function eenmaal(naam, fn) { if (BUSY[naam] || SLOT[naam] === slot) return; BUSY[naam] = true; SLOT[naam] = slot; fn().then(function () { BUSY[naam] = false; meld(); }, function () { BUSY[naam] = false; }); }
    if (!(DATA.basisDag === dag && DATA.basis !== null)) {
      eenmaal('basis', function () {
        return h.callWS({ type: 'recorder/statistics_during_period', start_time: new Date(d0.getTime() - 20 * 60000).toISOString(), end_time: new Date(d0.getTime() + 20 * 60000).toISOString(), statistic_ids: [id], period: '5minute', types: ['state'] }).then(function (r) {
          var a = (r[id] || []).map(function (x) { return { t: statTijd(x), v: Number(x.state) }; }).filter(function (x) { return x.t < d0.getTime() && isFinite(x.v); });
          a.sort(function (p, q) { return q.t - p.t; });
          DATA.basis = a.length ? a[0].v : null; DATA.basisDag = dag;
        });
      });
    }
    eenmaal('real', function () {
      return h.callWS({ type: 'recorder/statistics_during_period', start_time: d0.toISOString(), statistic_ids: [id], period: '5minute', types: ['change'] }).then(function (r) {
        var cum = 0, pts = [];
        (r[id] || []).forEach(function (x) { cum += Number(x.change) || 0; pts.push([statTijd(x) + 300000, cum]); });
        DATA.real = pts;
      });
    });
    if (!DATA.dagen || DATA.dagenDag !== dag) {
      eenmaal('dagen', function () {
        return h.callWS({ type: 'recorder/statistics_during_period', start_time: new Date(d0.getTime() - 16 * 86400000).toISOString(), end_time: d0.toISOString(), statistic_ids: [id], period: 'day', types: ['change'] }).then(function (r) {
          DATA.dagen = (r[id] || []).map(function (x) { return { d: new Date(statTijd(x)), v: Number(x.change) || 0 }; }).filter(function (x) { return x.d.getTime() < d0.getTime(); });
          DATA.dagenDag = dag;
        });
      });
    }
  }
  function cijfers(h) {
    var s = h.states[mainId(h)], mw = h.states[mwId(h)], a = s ? s.attributes : {}, nu = mw ? Number(mw.state) : NaN;
    var bespaard = (isFinite(nu) && DATA.basis !== null) ? nu - DATA.basis : null;
    var pts = Array.isArray(a.punten) ? a.punten : [], kw = Array.isArray(a.kw) ? a.kw : null, pmin = Number(a.pmin_b);
    var n0 = new Date(); n0.setHours(24, 0, 0, 0);
    var exp = [], rest = null;
    if (kw && pts.length && isFinite(pmin) && kw.length >= pts.length) {
      var som = 0;
      for (var i = 0; i < pts.length; i++) {
        if (Number(pts[i][0]) * 1000 >= n0.getTime()) break;
        som += Number(kw[i][0]) - Number(kw[i][1]);
        exp.push([(Number(pts[i][0]) + 900) * 1000, som + (Number(pts[i][6]) - Number(pts[i][4])) * pmin]);
      }
      rest = exp.length ? exp[exp.length - 1][1] : 0;
    }
    var tot = (bespaard !== null && rest !== null) ? bespaard + rest : null;
    return { s: s, a: a, pts: pts, bespaard: bespaard, exp: exp, rest: rest, tot: tot, t0: pts.length ? Number(pts[0][0]) * 1000 : null };
  }

  class Basis extends HTMLElement {
    setConfig(c) { this._c = Object.assign({ taal: '' }, c || {}); if (!this.shadowRoot) this.attachShadow({ mode: 'open' }); this._sig = null; }
    getCardSize() { return 3; }
    connectedCallback() { if (SUBS.indexOf(this) < 0) SUBS.push(this); }
    disconnectedCallback() { var i = SUBS.indexOf(this); if (i >= 0) SUBS.splice(i, 1); }
    set hass(h) { window.__bpLang = String((h && h.language) || 'nl').slice(0, 2);
      this._h = h; laad(h);
      var s = h.states[mainId(h)], mw = h.states[mwId(h)];
      var sig = (s ? s.last_updated : '') + '|' + (mw ? mw.state : '') + '|' + DATA.basis + '|' + (DATA.real ? DATA.real.length : '') + '|' + (DATA.dagen ? DATA.dagen.length : '') + '|' + (h.themes && h.themes.darkMode);
      if (sig === this._sig) return;
      this._sig = sig; this._render();
    }
    _render() { }
  }

  // ---- 1. statusregel ----------------------------------------------------------------------------------------
  class Regel extends Basis {
    _render() {
      var h = this._h; if (!h || !this.shadowRoot) return;
      var t = tx(this._c), s = h.states[mainId(h)], a = s ? s.attributes : {}, p = Array.isArray(a.punten) && a.punten.length ? a.punten[0] : null;
      var live = a.modus === 'live', vs = h.states['sensor.batterijplan_voorspelling'];
      var l1 = '<span class="d" style="background:' + (live ? GROEN : '#8596ae') + '"></span><b>' + esc(live ? t.live : t.schaduw) + '</b>' +
        (a.hbc_strategie ? ' · ' + esc(t.strat) + ' ' + esc(a.hbc_strategie) : '') + (vs && vs.state && vs.state !== 'unknown' && vs.state !== 'unavailable' ? ' · ' + esc(t.voorsp) + ' ' + esc(vs.state) : '');
      var l2 = t.wacht;
      if (p) {
        var pa = t.act[p[5]] || p[5], ha = t.act[p[3]] || p[3];
        l2 = esc(t.kw) + ' ' + uur(Number(p[0]) * 1000) + ' (' + num(Number(p[1]), t, 1) + ' ct): <b style="color:#14b8d4">' + esc(pa) + '</b> — ' + (p[5] === p[3] ? esc(t.zelfde) : esc(t.zou) + ' <span style="color:#e6b800">' + esc(ha) + '</span>') + '.';
      }
      this.shadowRoot.innerHTML = '<style>ha-card{padding:10px 14px}.a{font-size:14px;color:var(--primary-text-color)}.b{font-size:13px;color:var(--secondary-text-color);margin-top:4px}.d{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}</style><ha-card><div class="a">' + l1 + '</div><div class="b">' + l2 + '</div></ha-card>';
    }
  }

  // ---- 2. besparingslijn ------------------------------------------------------------------------------------
  function mooiStap(r) { var m = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10]; for (var i = 0; i < m.length; i++) { if (r / m[i] <= 5) return m[i]; } return 10; }
  class Spaar extends Basis {
    _render() {
      var h = this._h; if (!h || !this.shadowRoot) return;
      var t = tx(this._c), c = cijfers(h), d0 = new Date(); d0.setHours(0, 0, 0, 0);
      var D0 = d0.getTime(), DAG = 86400000, now = Date.now();
      var real = [[D0, 0]]; (DATA.real || []).forEach(function (p) { if (p[0] <= now + 300000) real.push([Math.min(p[0], now), p[1]]); });
      if (c.bespaard !== null) real.push([now, c.bespaard]);
      var exp = []; if (c.bespaard !== null && c.exp.length) { exp.push([now, c.bespaard]); c.exp.forEach(function (p) { if (p[0] > now) exp.push([p[0], c.bespaard + p[1]]); }); }
      var all = real.concat(exp).map(function (p) { return p[1]; });
      if (!all.length) { this.shadowRoot.innerHTML = '<ha-card style="padding:12px 14px">' + esc(t.geen) + '</ha-card>'; return; }
      var W = 700, H = 250, L = 52, R = 14, T = 16, B = 28;
      var ymin = Math.min(0, Math.min.apply(null, all)), ymax = Math.max(0.1, Math.max.apply(null, all)); ymax = ymax + (ymax - ymin) * 0.08;
      var st = mooiStap((ymax - ymin) / 1);
      var X = function (ms) { return L + (ms - D0) / DAG * (W - L - R); }, Y = function (v) { return T + (ymax - v) / (ymax - ymin) * (H - T - B); };
      var g = '';
      for (var v = Math.ceil(ymin / st) * st; v <= ymax + 1e-9; v += st) { g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="var(--divider-color,#444)" stroke-dasharray="2 4" opacity=".7"/><text x="' + (L - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="' + GRIJS + '">' + (v < -1e-9 ? '– ' : '') + '€ ' + num(v, t, 2) + '</text>'; }
      for (var uurT = 0; uurT <= 24; uurT += 6) { g += '<text x="' + X(D0 + uurT * 3600000).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="' + GRIJS + '">' + ('0' + uurT).slice(-2) + ':00</text>'; }
      var pad = function (a) { return a.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' '); };
      var area = real.length > 1 ? pad(real) + ' L' + X(real[real.length - 1][0]).toFixed(1) + ' ' + Y(0).toFixed(1) + ' L' + X(D0).toFixed(1) + ' ' + Y(0).toFixed(1) + ' Z' : '';
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block">' + g +
        (area ? '<path d="' + area + '" fill="' + GROEN + '" opacity=".15"/>' : '') +
        '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '" stroke="' + GRIJS + '" opacity=".6"/>' +
        (exp.length > 1 ? '<path d="' + pad(exp) + '" fill="none" stroke="' + GROEN + '" stroke-width="2.5" stroke-dasharray="6 5" opacity=".9"/>' : '') +
        '<path d="' + pad(real) + '" fill="none" stroke="' + GROEN + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<line x1="' + X(now).toFixed(1) + '" x2="' + X(now).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="#14b8d4" stroke-width="1.5"/>' +
        '<text x="' + (X(now) + 4).toFixed(1) + '" y="' + (T + 10) + '" font-size="11" fill="#14b8d4">' + esc(t.nu) + '</text>' +
        (c.tot !== null ? '<text x="' + (W - R - 2) + '" y="' + (Y(c.bespaard + c.rest) - 8).toFixed(1) + '" text-anchor="end" font-size="13" font-weight="600" fill="' + geld(c.tot, t).kl + '">' + esc(geld(c.tot, t).tx) + '</text>' : '') + '</svg>';
      this.shadowRoot.innerHTML = '<style>ha-card{padding:12px 14px}.k{display:flex;align-items:baseline;gap:6px 14px;flex-wrap:wrap}.tt{font-size:16px;font-weight:600;color:var(--primary-text-color)}.s{font-size:12px;color:var(--secondary-text-color)}</style><ha-card><div class="k"><span class="tt">' + esc(t.titelL) + '</span><span class="s">' + esc(t.legL) + '</span></div>' + svg + '</ha-card>';
    }
  }

  // ---- 3. opbrengst per dag -------------------------------------------------------------------------------------
  class Dagen extends Basis {
    _render() {
      var h = this._h; if (!h || !this.shadowRoot) return;
      var t = tx(this._c), c = cijfers(h), rows = [];
      if (c.tot !== null) rows.push({ lab: t.vandaag + ' (' + t.verwacht + ')', sub: t.alb + ' ' + geld(c.bespaard, t).tx, v: c.tot, nu: true });
      (DATA.dagen || []).slice().sort(function (p, q) { return q.d - p.d; }).forEach(function (x) { rows.push({ lab: x.d.toLocaleDateString(t.loc, { weekday: 'short', day: 'numeric', month: 'numeric' }), v: x.v }); });
      if (!rows.length) { this.shadowRoot.innerHTML = '<ha-card style="padding:12px 14px">' + esc(t.geen) + '</ha-card>'; return; }
      var mx = Math.max.apply(null, rows.slice(0, 8).map(function (r) { return Math.abs(r.v); }).concat([0.01]));
      var voorbij = rows.filter(function (r) { return !r.nu; }).slice(0, 7), gem = voorbij.length ? voorbij.reduce(function (s, r) { return s + r.v; }, 0) / voorbij.length : null;
      var best = voorbij.length ? voorbij.reduce(function (m, r) { return r.v > m.v ? r : m; }, voorbij[0]) : null;
      var tr = '';
      rows.slice(0, 7 + (rows[0] && rows[0].nu ? 1 : 0)).forEach(function (r, i) {
        var vorige = rows[i + 1], gl = '=', kl = GRIJS, tip = '';
        if (vorige) { var dv = r.v - vorige.v, drem = Math.max(Math.abs(vorige.v), 0.05); if (dv > 0.1 * drem) { gl = '▲'; kl = GROEN; } else if (dv < -0.1 * drem) { gl = '▼'; kl = ORANJE; } } else { gl = ''; }
        var g = geld(r.v, t);
        tr += '<tr' + (r.nu ? ' class="nu"' : '') + '><td class="l">' + esc(r.lab) + (r.sub ? '<small>' + esc(r.sub) + '</small>' : '') + '</td><td class="tr" style="color:' + kl + '">' + gl + '</td><td class="v" style="color:' + g.kl + '">' + esc(g.tx) + '</td><td class="bb"><i style="width:' + Math.round(Math.abs(r.v) / mx * 100) + '%;background:' + (r.v < -0.005 ? ORANJE : GROEN) + (r.nu ? ';opacity:.55' : '') + '"></i></td></tr>';
      });
      var kop = (gem !== null ? '<span>' + esc(t.gem) + ': <b style="color:' + geld(gem, t).kl + '">' + esc(geld(gem, t).tx) + '</b></span>' : '') + (best ? '<span>' + esc(t.beste) + ': <b style="color:' + geld(best.v, t).kl + '">' + esc(geld(best.v, t).tx) + '</b> (' + esc(best.lab) + ')</span>' : '');
      this.shadowRoot.innerHTML = '<style>ha-card{padding:12px 14px}.kp{display:flex;gap:6px 22px;flex-wrap:wrap;font-size:13px;color:var(--secondary-text-color);margin-bottom:6px}table{width:100%;border-collapse:collapse;font-size:14px}th{font-size:12px;font-weight:500;color:var(--secondary-text-color);text-align:left;padding:4px 6px}td{padding:6px;border-top:1px solid var(--divider-color,#333)}td.l{color:var(--primary-text-color);white-space:nowrap}td.l small{display:block;font-size:11px;color:var(--secondary-text-color)}td.tr{width:38px;text-align:center}td.v{text-align:right;white-space:nowrap;font-weight:600}td.bb{width:30%;min-width:60px}td.bb i{display:block;height:6px;border-radius:3px}tr.nu td{border-top:none}.lg{font-size:11px;color:var(--secondary-text-color);margin-top:8px}</style><ha-card><div class="kp">' + kop + '</div><table><tr><th>' + esc(t.dag) + '</th><th style="text-align:center">' + esc(t.trend) + '</th><th style="text-align:right">' + esc(t.opl) + '</th><th></th></tr>' + tr + '</table><div class="lg">' + esc(t.leg) + '</div></ha-card>';
    }
  }
  [['batterijplan-regel-card', Regel, 'Batterijplan statusregel'], ['batterijplan-spaarlijn-card', Spaar, 'Batterijplan besparing vandaag'], ['batterijplan-dagen-card', Dagen, 'Batterijplan opbrengst per dag']].forEach(function (x) {
    if (!customElements.get(x[0])) customElements.define(x[0], x[1]);
    window.customCards = window.customCards || []; window.customCards.push({ type: x[0], name: x[2], description: 'Proefkaart compact hoofdscherm' });
  });
})();
