// Versie: 16-11-2026 (Batterijplan 2.0.0-dev1, akkoord Adrie 16-11-2026)
// Project tag: [BATTERIJPLAN]
// Twee kaarten voor het Vlaamse capaciteitstarief (alleen met de schakelaar Vlaanderen aan):
//   custom:batterijplan-piek      "Piek deze maand": per dag de hoogste kwartierpiek (gevulde lijn) met de doelgrens (stippellijn),
//                                 daaronder de maandpieken van de laatste 12 maanden (trend eerst, nieuw naar oud), het gemiddelde dat
//                                 Fluvius rekent en het aantal voorkomen pieken. Bron: sensor.batterijplan_piek_maand.
//   custom:batterijplan-kwartier  "Lopend kwartier": gemiddelde tot nu, nog toegestaan, ingestelde HBC-grens.
//                                 Bron: sensor.batterijplan_kwartier.
// Config: taal: nl|en|de (standaard: taal van het profiel). De kaarten rekenen niets: alles komt uit de sensoren.
(function () {
  var TXT = {
    nl: { piekTitel: 'Piek deze maand', piekSub: 'Hoogste kwartierpiek per dag, met de doelgrens van Batterijplan',
      kwTitel: 'Lopend kwartier', kwSub: 'Wat dit kwartier al is afgenomen en wat nog mag',
      uit: 'Alleen met Vlaanderen aan. Nu is de kwartierberekening uit.',
      leeg: 'Nog geen kwartieren gemeten. Na het eerste volle kwartier verschijnt hier de piek.',
      lijn: 'Hoogste kwartier van de dag', grens: 'Doelgrens', kw: 'kW',
      maanden: 'Maandpieken, laatste 12 maanden', hMaand: 'Maand', hPiek: 'Piek', hVoork: 'Met batterij', hMet: 'Met batterij', hZonder: 'Zonder batterij', hBesp: 'Besparing', lz: 'Hoogste kwartier zonder batterij', lopend: 'lopend',
      fl: 'Gemiddelde dat Fluvius rekent (laatste 12 maandpieken, elke maand minstens {min} kW): met batterij {g} kW; zonder batterij {z} kW (over {nz} {mnd}).',
      fl2: 'Met batterij is dat ongeveer € {k} per jaar capaciteitstarief. De batterij scheelt ongeveer € {b} per jaar (verschil in kW × € {t} per kW per jaar).',
      uitleg: 'Maandpiek = het hoogste kwartiergemiddelde van je netafname in die maand. Zonder batterij = netafname + ontladen − laden, met dezelfde kwartierberekening. Besparing per maand = verschil in kW × tarief / 12; beide pieken tellen minstens 2,5 kW. ▲ = hoger dan de maand ervoor, ▼ = lager.',
      gem: 'Gemiddeld tot nu', toe: 'Nog toegestaan', hbc: 'Ingestelde HBC-grens', budget: 'Kwartierbudget',
      van: '{a} van {b} kWh', verstreken: 'Tijd', hbcUit: 'uit', stuurt: 'Batterijplan stuurt de HBC-grens elk kwartier.',
      stuurtNiet: 'Live staat uit: Batterijplan rekent mee maar verandert de HBC-grens niet.',
      kwUitleg: 'Nog toegestaan = (budget − al afgenomen) / resterende tijd, minstens 0,5 kW. Op elke kwartierwissel gaat de HBC-grens terug naar de doelgrens ({d} kW).' },
    en: { piekTitel: 'Peak this month', piekSub: 'Highest quarter-hour peak per day, with the Batterijplan target limit',
      kwTitel: 'Running quarter', kwSub: 'What this quarter has imported so far and what is still allowed',
      uit: 'Only with Flanders on. The quarter calculation is off now.',
      leeg: 'No quarters measured yet. The peak appears after the first full quarter.',
      lijn: 'Highest quarter of the day', grens: 'Target limit', kw: 'kW',
      maanden: 'Monthly peaks, last 12 months', hMaand: 'Month', hPiek: 'Peak', hVoork: 'With battery', hMet: 'With battery', hZonder: 'Without battery', hBesp: 'Saving', lz: 'Highest quarter without battery', lopend: 'running',
      fl: 'Average Fluvius calculates (last 12 monthly peaks, each month at least {min} kW): with battery {g} kW; without battery {z} kW (over {nz} {mnd}).',
      fl2: 'With the battery that is about € {k} per year capacity tariff. The battery saves about € {b} per year (difference in kW × € {t} per kW per year).',
      uitleg: 'Monthly peak = the highest quarter-hour average of your grid import in that month. Without battery = grid import + discharge − charge, with the same quarter calculation. Saving per month = difference in kW × tariff / 12; both peaks count at least 2.5 kW. ▲ = higher than the month before, ▼ = lower.',
      gem: 'Average so far', toe: 'Still allowed', hbc: 'HBC limit set', budget: 'Quarter budget',
      van: '{a} of {b} kWh', verstreken: 'Time', hbcUit: 'off', stuurt: 'Batterijplan sets the HBC limit every quarter.',
      stuurtNiet: 'Live is off: Batterijplan calculates along but does not change the HBC limit.',
      kwUitleg: 'Still allowed = (budget − already imported) / time left, at least 0.5 kW. At every quarter change the HBC limit goes back to the target limit ({d} kW).' },
    de: { piekTitel: 'Spitze diesen Monat', piekSub: 'Höchste Viertelstundenspitze pro Tag, mit der Zielgrenze von Batterijplan',
      kwTitel: 'Laufende Viertelstunde', kwSub: 'Was diese Viertelstunde schon bezogen wurde und was noch erlaubt ist',
      uit: 'Nur mit Flandern an. Die Viertelstundenberechnung ist jetzt aus.',
      leeg: 'Noch keine Viertelstunden gemessen. Nach der ersten vollen Viertelstunde erscheint hier die Spitze.',
      lijn: 'Höchste Viertelstunde des Tages', grens: 'Zielgrenze', kw: 'kW',
      maanden: 'Monatsspitzen, letzte 12 Monate', hMaand: 'Monat', hPiek: 'Spitze', hVoork: 'Mit Batterie', hMet: 'Mit Batterie', hZonder: 'Ohne Batterie', hBesp: 'Ersparnis', lz: 'Höchste Viertelstunde ohne Batterie', lopend: 'laufend',
      fl: 'Durchschnitt, den Fluvius rechnet (letzte 12 Monatsspitzen, jeder Monat mindestens {min} kW): mit Batterie {g} kW; ohne Batterie {z} kW (über {nz} {mnd}).',
      fl2: 'Mit Batterie sind das etwa € {k} pro Jahr Kapazitätstarif. Die Batterie spart etwa € {b} pro Jahr (Unterschied in kW × € {t} pro kW und Jahr).',
      uitleg: 'Monatsspitze = der höchste Viertelstundenmittelwert deines Netzbezugs in diesem Monat. Ohne Batterie = Netzbezug + Entladen − Laden, mit derselben Viertelstundenberechnung. Ersparnis pro Monat = Unterschied in kW × Tarif / 12; beide Spitzen zählen mindestens 2,5 kW. ▲ = höher als der Monat davor, ▼ = niedriger.',
      gem: 'Durchschnitt bisher', toe: 'Noch erlaubt', hbc: 'Eingestellte HBC-Grenze', budget: 'Viertelstundenbudget',
      van: '{a} von {b} kWh', verstreken: 'Zeit', hbcUit: 'aus', stuurt: 'Batterijplan setzt die HBC-Grenze jede Viertelstunde.',
      stuurtNiet: 'Live ist aus: Batterijplan rechnet mit, ändert aber die HBC-Grenze nicht.',
      kwUitleg: 'Noch erlaubt = (Budget − schon bezogen) / Restzeit, mindestens 0,5 kW. Bei jedem Viertelstundenwechsel geht die HBC-Grenze zurück auf die Zielgrenze ({d} kW).' }
  };
  // Kleuren zoals de capaciteitskaart: paars = wat nodig is/was, geel = grens, groen = ruimte
  var PAARS = '#8B5CF6', GEEL = '#F59E0B', GROEN = '#22C55E', ROOD = '#EF4444';
  var CSS = ':host{display:block}.kop{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}' +
    '.titel{font-size:18px;font-weight:600;color:var(--primary-text-color,#fff)}' +
    '.exp{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#f59e0b;border:1px solid #f59e0b;border-radius:10px;padding:1px 8px}' +
    '.sub{font-size:12.5px;color:var(--secondary-text-color,#9ca3af);margin:2px 0 8px}' +
    '.leg{display:flex;gap:16px;font-size:12px;color:var(--secondary-text-color,#9ca3af);margin:4px 0 8px;flex-wrap:wrap}.leg i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px}' +
    '.tekst{font-size:13px;line-height:1.5;color:var(--primary-text-color,#fff);margin:6px 0}' +
    '.ptit{margin-top:14px;font-weight:600;color:var(--primary-text-color,#fff)}' +
    'table{border-collapse:collapse;width:100%;font-size:13px;margin-top:6px;color:var(--primary-text-color,#fff)}' +
    'th,td{padding:5px 8px;border-bottom:1px solid #ffffff14;text-align:right;font-weight:400}th:first-child,td:first-child{text-align:center;width:28px}' +
    'td.m,th.m{text-align:left}tr.hd th{font-size:11.5px;color:var(--secondary-text-color,#9ca3af)}tr.nu td{font-weight:600}' +
    '.up{color:#f59e0b}.down{color:#22c55e}' +
    '.voet{font-size:11.5px;line-height:1.5;color:var(--secondary-text-color,#9ca3af);border-top:1px solid #ffffff14;margin-top:10px;padding-top:8px}' +
    '.fl{font-size:13px;line-height:1.55;color:var(--primary-text-color,#fff);margin-top:10px}' +
    '.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:8px 0}' +
    '.box{background:#ffffff0d;border-radius:12px;padding:10px 12px}.box b{display:block;font-size:22px;color:var(--primary-text-color,#fff)}' +
    '.box span{font-size:11.5px;color:var(--secondary-text-color,#9ca3af)}' +
    '.bar{height:8px;border-radius:4px;background:#ffffff14;margin:4px 0 10px;overflow:hidden}.bar i{display:block;height:100%}' +
    '.bl{font-size:12px;color:var(--secondary-text-color,#9ca3af);display:flex;justify-content:space-between}';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fill(s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] !== undefined ? o[k] : m; }); }

  class Basis extends HTMLElement {
    setConfig(c) {
      this._c = Object.assign({ taal: '' }, c || {});
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._sig = null;
    }
    getCardSize() { return 6; }
    getGridOptions() { return { columns: 'full', rows: 'auto' }; }
    _lng() { var l = this._c.taal || String((this._h && this._h.language) || 'nl').slice(0, 2); return TXT[l] ? l : 'nl'; }
    _t() { return TXT[this._lng()]; }
    _num(v, d) { return Number(v).toLocaleString(this._lng(), { minimumFractionDigits: d, maximumFractionDigits: d }); }
    _kw(w, d) { return this._num(Number(w) / 1000, d === undefined ? 1 : d); }
    set hass(h) {
      this._h = h;
      var s = h.states[this._id];
      var extra = this._extra ? this._extra(h) : '';
      var sig = (s ? s.last_updated + s.state : '-') + '|' + extra + '|' + this._lng();
      if (sig === this._sig) return;
      this._sig = sig;
      this.shadowRoot.innerHTML = '<style>' + CSS + '</style><ha-card>' + this._body(s, h) + '</ha-card>';
    }
    _kop(titel, sub) {
      return '<div class="kop"><span class="titel">' + esc(titel) + '</span></div><div class="sub">' + esc(sub) + '</div>';
    }
    _geen(titel, sub, t) { return this._kop(titel, sub) + '<div class="tekst">' + esc(t.uit) + '</div>'; }
  }

  // ---------- custom:batterijplan-piek ----------
  class BatterijplanPiekCard extends Basis {
    constructor() { super(); this._id = 'sensor.batterijplan_piek_maand'; }
    _chart(a, t) {
      var W = 700, H = 230, L = 44, R = 12, T = 14, B = 30, self = this;
      var mk = String(a.maand || ''), y0 = +mk.slice(0, 4), m0 = +mk.slice(5, 7);
      var n = new Date(y0, m0, 0).getDate();
      var pts = (a.dagen || []).map(function (d) { return [+String(d[0]).slice(8, 10), Number(d[1])]; });
      var ptz = (a.dagen_zonder || []).map(function (d) { return [+String(d[0]).slice(8, 10), Number(d[1])]; });
      var gr = Number(a.doelgrens) || 0, mx = Math.max(gr, 1000);
      pts.forEach(function (p) { mx = Math.max(mx, p[1]); });
      ptz.forEach(function (p) { mx = Math.max(mx, p[1]); });
      mx = Math.ceil(mx * 1.1 / 1000) * 1000;
      var pw = W - L - R, ph = H - T - B;
      function x(d) { return L + (d - 1) / Math.max(n - 1, 1) * pw; }
      function y(w) { return T + ph - (w / mx) * ph; }
      var base = y(0), o = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + esc(t.piekTitel) + '">';
      for (var g = 0; g <= 4; g++) {
        var gv = mx * g / 4;
        o += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(gv) + '" y2="' + y(gv) + '" stroke="#ffffff" stroke-opacity=".08"/>' +
          '<text x="' + (L - 6) + '" y="' + (y(gv) + 4) + '" text-anchor="end" font-size="11" fill="#9ca3af">' + self._num(gv / 1000, 1) + '</text>';
      }
      if (ptz.length > 1) {
        var dz = 'M' + x(ptz[0][0]) + ',' + y(ptz[0][1]);
        ptz.slice(1).forEach(function (p) { dz += ' L' + x(p[0]) + ',' + y(p[1]); });
        o += '<path d="' + dz + '" fill="none" stroke="#9ca3af" stroke-width="1.6" stroke-opacity=".8"/>';
      }
      if (pts.length) {
        var d = 'M' + x(pts[0][0]) + ',' + y(pts[0][1]);
        pts.slice(1).forEach(function (p) { d += ' L' + x(p[0]) + ',' + y(p[1]); });
        o += '<path d="' + d + ' L' + x(pts[pts.length - 1][0]) + ',' + base + ' L' + x(pts[0][0]) + ',' + base + ' Z" fill="' + PAARS + '" fill-opacity=".45"/>' +
          '<path d="' + d + '" fill="none" stroke="' + PAARS + '" stroke-width="2.2"/>';
        pts.forEach(function (p) {
          var over = gr > 0 && p[1] > gr;
          o += '<circle cx="' + x(p[0]) + '" cy="' + y(p[1]) + '" r="' + (n <= 31 ? 3 : 2) + '" fill="' + (over ? ROOD : PAARS) + '"><title>' + esc(p[0] + '-' + mk.slice(5, 7) + ': ' + self._kw(p[1], 1) + ' ' + t.kw) + '</title></circle>';
        });
      }
      if (gr > 0) {
        o += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(gr) + '" y2="' + y(gr) + '" stroke="' + GEEL + '" stroke-width="2.2" stroke-dasharray="7 4"/>' +
          '<text x="' + (W - R - 4) + '" y="' + (y(gr) - 7) + '" text-anchor="end" font-size="11.5" font-weight="600" fill="' + GEEL + '">' + esc(t.grens) + ' ' + self._kw(gr, 1) + ' ' + t.kw + '</text>';
      }
      for (var d2 = 1; d2 <= n; d2++) {
        if (d2 === 1 || d2 % 5 === 0 || d2 === n) o += '<text x="' + x(d2) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="10.5" fill="#9ca3af">' + d2 + '</text>';
      }
      return o + '</svg>';
    }
    _tabel(a, t) {
      var self = this, lng = this._lng(), rows = a.maanden || [];
      if (!rows.length) return '';
      var naam = function (mk) { return new Date(+mk.slice(0, 4), +mk.slice(5, 7) - 1, 1).toLocaleDateString(lng, { month: 'short', year: 'numeric' }); };
      var pijl = { up: '<span class="up">▲</span>', down: '<span class="down">▼</span>', same: '=' };
      var eur = function (v) { return v === null || v === undefined ? '–' : (v < 0 ? '-' : '') + '€ ' + self._num(Math.abs(v), 2); };
      var body = rows.map(function (r) {
        return '<tr' + (r.lopend ? ' class="nu"' : '') + '><td>' + (pijl[r.trend] || '') + '</td><td class="m">' + esc(naam(r.maand)) +
          (r.lopend ? ' <small>(' + esc(t.lopend) + ')</small>' : '') + '</td><td>' + self._kw(r.piek, 1) + ' ' + esc(t.kw) + '</td><td>' +
          (r.zonder === null || r.zonder === undefined ? '–' : self._kw(r.zonder, 1) + ' ' + esc(t.kw)) + '</td><td>' + eur(r.besparing_eur) + '</td></tr>';
      }).join('');
      return '<div class="ptit">' + esc(t.maanden) + '</div><table><tr class="hd"><th></th><th class="m">' + esc(t.hMaand) + '</th><th>' + esc(t.hMet) + '</th><th>' +
        esc(t.hZonder) + '</th><th>' + esc(t.hBesp) + '</th></tr>' + body + '</table>';
    }
    _body(s, h) {
      var t = this._t();
      if (!s || s.state === 'unavailable' || s.state === 'unknown') return this._geen(t.piekTitel, t.piekSub, t);
      var a = s.attributes || {};
      var out = this._kop(t.piekTitel, t.piekSub);
      if (!(a.dagen || []).length && !(a.maanden || []).length) return out + '<div class="tekst">' + esc(t.leeg) + '</div>';
      out += this._chart(a, t) + '<div class="leg"><span><i style="background:' + PAARS + ';opacity:.6"></i>' + esc(t.lijn) + '</span><span><i style="background:#9ca3af"></i>' + esc(t.lz) + '</span><span><i style="background:' + GEEL + '"></i>' + esc(t.grens) + '</span></div>';
      out += this._tabel(a, t);
      if (a.gemiddelde !== null && a.gemiddelde !== undefined) {
        var mnd = a.aantal_maanden_zonder === 1 ? t.maand1 : t.maand2;
        out += '<div class="fl">' + esc(fill(t.fl, { g: this._kw(a.gemiddelde, 1), z: a.gemiddelde_zonder === null || a.gemiddelde_zonder === undefined ? '–' : this._kw(a.gemiddelde_zonder, 1),
          nz: a.aantal_maanden_zonder || 0, mnd: mnd, min: this._kw(a.minimum || 2500, 1) })) + '</div>';
        if (a.besparing_jaar !== null && a.besparing_jaar !== undefined) {
          out += '<div class="fl">' + esc(fill(t.fl2, { k: this._num(a.kosten_jaar || 0, 0), b: this._num(a.besparing_jaar, 0), t: this._num(a.tarief || 0, 2) })) + '</div>';
        }
      }
      out += '<div class="voet">' + esc(t.uitleg) + '</div>';
      return out;
    }
  }

  // ---------- custom:batterijplan-kwartier ----------
  class BatterijplanKwartierCard extends Basis {
    constructor() { super(); this._id = 'sensor.batterijplan_kwartier'; }
    _extra(h) {  // the HBC helper values live outside the sensor: take them into the redraw signature
      var l = h.states['input_number.house_battery_control_power_limit_import'], b = h.states['input_boolean.house_battery_control_has_power_limit_import'];
      return (l ? l.state : '') + (b ? b.state : '');
    }
    _body(s, h) {
      var t = this._t();
      if (!s || s.state === 'unavailable' || s.state === 'unknown') return this._geen(t.kwTitel, t.kwSub, t);
      var a = s.attributes || {}, self = this;
      var l = h.states['input_number.house_battery_control_power_limit_import'], b = h.states['input_boolean.house_battery_control_has_power_limit_import'];
      var lim = l && !isNaN(parseFloat(l.state)) ? parseFloat(l.state) : a.hbc_grens_w;
      var limAan = b ? b.state === 'on' : a.hbc_grens_aan;
      var gem = Number(s.state), toe = Number(a.toegestaan_w), doel = Number(a.doelgrens);
      var vb = Number(a.verbruikt_kwh), bu = Number(a.budget_kwh), el = Number(a.verstreken_s) || 0;
      var pctB = bu > 0 ? Math.max(0, Math.min(100, vb / bu * 100)) : 0, pctT = Math.max(0, Math.min(100, el / 900 * 100));
      var kleur = gem > doel ? ROOD : (pctB > pctT ? GEEL : GROEN);
      var mm = Math.floor(el / 60), ss = ('0' + Math.round(el % 60)).slice(-2);
      var out = this._kop(t.kwTitel, t.kwSub);
      out += '<div class="grid3">' +
        '<div class="box"><span>' + esc(t.gem) + '</span><b style="color:' + kleur + '">' + this._kw(gem, 1) + ' kW</b></div>' +
        '<div class="box"><span>' + esc(t.toe) + '</span><b>' + this._kw(toe, 1) + ' kW</b></div>' +
        '<div class="box"><span>' + esc(t.hbc) + '</span><b>' + (lim !== null && lim !== undefined && limAan ? this._kw(lim, 1) + ' kW' : esc(t.hbcUit)) + '</b></div></div>';
      out += '<div class="bl"><span>' + esc(t.budget) + '</span><span>' + esc(fill(t.van, { a: this._num(vb, 3), b: this._num(bu, 3) })) + '</span></div>' +
        '<div class="bar"><i style="width:' + pctB + '%;background:' + kleur + '"></i></div>' +
        '<div class="bl"><span>' + esc(t.verstreken) + '</span><span>' + mm + ':' + ss + ' / 15:00</span></div>' +
        '<div class="bar"><i style="width:' + pctT + '%;background:' + PAARS + '"></i></div>';
      out += '<div class="voet">' + esc(a.stuurt ? t.stuurt : t.stuurtNiet) + '<br>' + esc(fill(t.kwUitleg, { d: this._kw(doel, 1) })) + '</div>';
      return out;
    }
  }

  if (!customElements.get('batterijplan-piek')) customElements.define('batterijplan-piek', BatterijplanPiekCard);
  if (!customElements.get('batterijplan-kwartier')) customElements.define('batterijplan-kwartier', BatterijplanKwartierCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'batterijplan-piek', name: 'Batterijplan piek deze maand', description: 'Capaciteitstarief: kwartierpiek per dag en maandpieken' },
    { type: 'batterijplan-kwartier', name: 'Batterijplan lopend kwartier', description: 'Capaciteitstarief: gemiddelde tot nu, nog toegestaan, HBC-grens' });
})();
