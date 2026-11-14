// Versie: 12-11-2026 23:30 (één ideaal: tekst = groene lijn, gemiddelde; bedragregel van de kaart tot het weekbedrag er is; Adrie 12-11-2026)
// Project tag: [BATTERIJPLAN]
// Kaart "capaciteit": per kalenderdag wat de dure kwartieren (HBC "high") netto nodig hadden naast wat de batterij
// kon leveren. Neutraal: alleen tellingen, geen oordeel. Bron: sensor.batterijplan_capaciteitsadvies (attribuut reeks).
// Config: taal: nl|en|de (standaard: taal van het profiel).
(function () {
  var TXT = {
    nl: { titel: 'Capaciteit', exp: 'experiment', sub: 'Wat de dure kwartieren per dag nodig hadden, naast wat je batterij kon leveren',
      nodig: 'Nodig', besch: 'Beschikbaar', vl: 'voorlopig', gem: 'gemiddeld, rolling', opt: 'Ideaal nodig', kwh: 'kWh',
      weinig: 'Nog te weinig dagen: {n} van minimaal {min}. Vanaf {min} dagen volgt een eerste schatting.',
      leeg: 'Nog geen gegevens. De eerste dag verschijnt na middernacht.',
      f1: 'Op {a} van {n} dagen was er minder beschikbaar dan nodig.',
      f2: 'Op {a} van {n} dagen bleef meer dan {p}% van de capaciteit ongebruikt.',
      f3: 'Nodig per dag: gemiddeld {g} kWh, hoogste {m} kWh.',
      f4: 'Nu beschikbaar: {b} kWh. Ideaal nodig (gemiddeld): {o} kWh.',
      buiten: 'Het optimum ligt boven {max} kWh; de bedragen hieronder gebruiken {max} kWh.',
      eur: 'Berekening (plan tegen HBC alleen) over deze {n} dagen: bij jouw capaciteit {e1}, bij {o} kWh {e2}, verschil {e3}. Dit is een berekening, niet je gemeten besparing.',
      voet1: 'Experiment: eerste schatting op {n} dagen. Degelijk vanaf {goed} dagen.',
      voet2: 'Het advies geldt voor het seizoen waarin je het meet; in de zomer ziet het er anders uit.', dag: 'dag',
      ptit: 'Hoe goed past je batterij?', week: 'Week', maand: 'Maand', kwartaal: 'Kwartaal', jaar: 'Jaar', wk: 'wk', kw: 'K', dg: 'dg',
      puitleg: 'Opgebracht = wat Batterijplan met jouw batterij bespaarde. Mogelijk = met de optimale capaciteit van die periode. Benut = opgebracht gedeeld door mogelijk. Alleen echte dagbedragen, niets doorgerekend. Grijs = minder dan de helft van de dagen gemeten.', hBat: 'Jouw batterij', hOp: 'Opgebracht', hMog: 'Mogelijk', hBen: 'Benut', hGem: 'Gemist', hOpt: 'Optimum', ruim: 'past ruim' },
    en: { titel: 'Capacity', exp: 'experiment', sub: 'What the expensive quarters needed each day, next to what your battery could deliver',
      nodig: 'Needed', besch: 'Available', vl: 'provisional', gem: 'average, rolling', opt: 'Ideal needed', kwh: 'kWh',
      weinig: 'Too few days yet: {n} of at least {min}. A first estimate follows from {min} days.',
      leeg: 'No data yet. The first day appears after midnight.',
      f1: 'On {a} of {n} days less was available than needed.',
      f2: 'On {a} of {n} days more than {p}% of the capacity stayed unused.',
      f3: 'Needed per day: on average {g} kWh, highest {m} kWh.',
      f4: 'Available now: {b} kWh. Ideal needed (average): {o} kWh.',
      buiten: 'The optimum is above {max} kWh; the amounts below use {max} kWh.',
      eur: 'Calculation (plan against HBC alone) over these {n} days: at your capacity {e1}, at {o} kWh {e2}, difference {e3}. This is a calculation, not your measured savings.',
      voet1: 'Experiment: first estimate on {n} days. Solid from {goed} days.',
      voet2: 'The advice applies to the season in which you measure it; summer will look different.', dag: 'day',
      ptit: 'How well does your battery fit?', week: 'Week', maand: 'Month', kwartaal: 'Quarter', jaar: 'Year', wk: 'wk', kw: 'Q', dg: 'd',
      puitleg: 'Earned = what Batterijplan saved with your battery. Possible = with the optimal capacity of that period. Used = earned divided by possible. Only real day amounts, nothing extrapolated. Grey = less than half of the days measured.', hBat: 'Your battery', hOp: 'Earned', hMog: 'Possible', hBen: 'Used', hGem: 'Missed', hOpt: 'Optimum', ruim: 'fits' },
    de: { titel: 'Kapazität', exp: 'Experiment', sub: 'Was die teuren Viertelstunden pro Tag brauchten, neben dem, was deine Batterie liefern konnte',
      nodig: 'Benötigt', besch: 'Verfügbar', vl: 'vorläufig', gem: 'Durchschnitt, rollierend', opt: 'Ideal benötigt', kwh: 'kWh',
      weinig: 'Noch zu wenige Tage: {n} von mindestens {min}. Ab {min} Tagen folgt eine erste Schätzung.',
      leeg: 'Noch keine Daten. Der erste Tag erscheint nach Mitternacht.',
      f1: 'An {a} von {n} Tagen war weniger verfügbar als benötigt.',
      f2: 'An {a} von {n} Tagen blieb mehr als {p}% der Kapazität ungenutzt.',
      f3: 'Benötigt pro Tag: im Schnitt {g} kWh, höchstens {m} kWh.',
      f4: 'Jetzt verfügbar: {b} kWh. Ideal benötigt (Durchschnitt): {o} kWh.',
      buiten: 'Das Optimum liegt über {max} kWh; die Beträge unten verwenden {max} kWh.',
      eur: 'Berechnung (Plan gegen HBC allein) über diese {n} Tage: bei deiner Kapazität {e1}, bei {o} kWh {e2}, Unterschied {e3}. Das ist eine Berechnung, nicht deine gemessene Ersparnis.',
      voet1: 'Experiment: erste Schätzung auf {n} Tagen. Belastbar ab {goed} Tagen.',
      voet2: 'Die Empfehlung gilt für die Jahreszeit, in der du misst; im Sommer sieht es anders aus.', dag: 'Tag',
      ptit: 'Wie gut passt deine Batterie?', week: 'Woche', maand: 'Monat', kwartaal: 'Quartal', jaar: 'Jahr', wk: 'KW', kw: 'Q', dg: 'T',
      puitleg: 'Gebracht = was Batterijplan mit deiner Batterie gespart hat. Möglich = mit der optimalen Kapazität dieses Zeitraums. Genutzt = gebracht geteilt durch möglich. Nur echte Tagesbeträge, nichts hochgerechnet. Grau = weniger als die Hälfte der Tage gemessen.', hBat: 'Deine Batterie', hOp: 'Gebracht', hMog: 'Möglich', hBen: 'Genutzt', hGem: 'Verpasst', hOpt: 'Optimum', ruim: 'passt' }
  };
  // Kleuren zoals de zonnegrafiek in HESC: verwachting/ideaal = paars (achtergrond), wat je hebt = geel/oranje (voorgrond)
  var PAARS = '#8B5CF6', GEEL = '#F59E0B', OPTK = '#22C55E';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  class BatterijplanCapaciteitCard extends HTMLElement {
    setConfig(c) {
      this._c = Object.assign({ taal: '' }, c || {});
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._sig = null;
    }
    getCardSize() { return 6; }
    _lng() { return this._c.taal || String((this._h && this._h.language) || 'nl').slice(0, 2); }
    _t() { return TXT[this._lng()] || TXT.nl; }
    _num(v, d) { return Number(v).toLocaleString(this._lng(), { minimumFractionDigits: d, maximumFractionDigits: d }); }
    _eur(v) { return (v < 0 ? '-' : '') + '€ ' + this._num(Math.abs(v), 2); }
    _fill(s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] !== undefined ? o[k] : m; }); }
    _state(h) {
      var id = 'sensor.batterijplan_capaciteitsadvies';
      if (h.states[id]) return h.states[id];
      var k = Object.keys(h.states).filter(function (x) { return x.indexOf('sensor.batterijplan_capaciteit') === 0; })[0];
      return k ? h.states[k] : null;
    }
    set hass(h) {
      this._h = h;
      var s = this._state(h);
      var sig = (s ? s.last_updated : '') + '|' + this._lng();
      if (sig === this._sig) return;
      this._sig = sig;
      this._render(s);
    }
    _rolling(reeks) {
      // Ideaal nodig = gemiddelde van wat de dure kwartieren (volgens de HBC-instellingen van die dag) nodig hadden,
      // over de dagen tot en met die dag (min. 3, groeiend tot 28). Geen oordeel, geen eigen grens.
      var out = [];
      for (var i = 0; i < reeks.length; i++) {
        var win = reeks.slice(Math.max(0, i - 27), i + 1);
        if (win.length < 3) { out.push(null); continue; }
        out.push(win.reduce(function (s, r) { return s + r[1]; }, 0) / win.length);
      }
      return out;
    }
    _chart(reeks, ideal, t) {
      // Vlakken zoals de zonnegrafiek in HESC: paars (nodig/ideaal) op de achtergrond, geel (beschikbaar) op de voorgrond
      var W = 700, H = 230, L = 40, R = 12, T = 14, B = 32, n = reeks.length, self = this;
      var mx = 1;
      reeks.forEach(function (r) { mx = Math.max(mx, r[1], r[2]); });
      ideal.forEach(function (v) { if (v !== null) mx = Math.max(mx, v); });
      mx = Math.ceil(mx / 2) * 2;
      var pw = W - L - R, ph = H - T - B, bw = pw / n;
      function y(v) { return T + ph - (v / mx) * ph; }
      function px(i) { return n === 1 ? L + pw / 2 : L + bw / 2 + i * (pw - bw) / (n - 1); }
      function pad(idx, v) { return [px(idx), y(v)]; }
      function curve(pts) {
        if (pts.length < 2) return 'M' + pts[0][0] + ',' + pts[0][1];
        var d = 'M' + pts[0][0] + ',' + pts[0][1];
        for (var i = 0; i < pts.length - 1; i++) {
          var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
          var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
          var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
          var lo = Math.min(p1[1], p2[1]), hi = Math.max(p1[1], p2[1]);
          c1y = Math.min(Math.max(c1y, lo), hi); c2y = Math.min(Math.max(c2y, lo), hi);
          d += ' C' + c1x + ',' + c1y + ' ' + c2x + ',' + c2y + ' ' + p2[0] + ',' + p2[1];
        }
        return d;
      }
      var nod = reeks.map(function (r, i) { return pad(i, r[1]); });
      var bes = reeks.map(function (r, i) { return pad(i, r[2]); });
      var base0 = y(0);
      function area(pts, col, op) {
        return '<path d="' + curve(pts) + ' L' + pts[pts.length - 1][0] + ',' + base0 + ' L' + pts[0][0] + ',' + base0 + ' Z" fill="' + col + '" fill-opacity="' + op + '"/>';
      }
      var o = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img">';
      for (var g = 0; g <= 4; g++) {
        var gv = mx * g / 4;
        o += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(gv) + '" y2="' + y(gv) + '" stroke="#ffffff" stroke-opacity=".08"/>';
        o += '<text x="' + (L - 6) + '" y="' + (y(gv) + 4) + '" text-anchor="end" font-size="11" fill="#9ca3af">' + this._num(gv, 0) + '</text>';
      }
      o += area(nod, PAARS, 0.45);
      // 14-11-2026 (Adrie): the battery is the constant, so it is drawn light (thin fill + line); 'needed' stays the eye-catcher
      o += area(bes, GEEL, 0.22);
      o += '<path d="' + curve(bes) + '" fill="none" stroke="' + GEEL + '" stroke-width="1.5" stroke-opacity=".8"/>';
      // 14-11-2026 (Adrie): the purple 'needed' line on top of the yellow, so it stays visible on days that needed less than the battery holds
      o += '<path d="' + curve(nod) + '" fill="none" stroke="' + PAARS + '" stroke-width="2.2"/>';
      var gp = [];
      ideal.forEach(function (v, i) { if (v !== null) gp.push(pad(i, v)); });
      if (gp.length >= 2) {
        o += '<path d="' + curve(gp) + '" fill="none" stroke="' + OPTK + '" stroke-width="2.2" stroke-dasharray="7 4"/>';
        var lw = gp[gp.length - 1], lv = ideal[ideal.length - 1];
        o += '<text x="' + (W - R - 4) + '" y="' + (lw[1] - 8) + '" text-anchor="end" font-size="11.5" font-weight="600" fill="' + OPTK + '">' + esc(t.opt) + ' ' + self._num(lv, 1) + ' ' + t.kwh + '</text>';
      }
      reeks.forEach(function (r, i) {
        var x = L + i * bw;
        o += '<rect x="' + x + '" y="' + T + '" width="' + bw + '" height="' + ph + '" fill="transparent"><title>' + esc(r[0] + ': ' + t.nodig + ' ' + self._num(r[1], 1) + ' kWh, ' + t.besch + ' ' + self._num(r[2], 1) + ' kWh') + '</title></rect>';
        if (n <= 14) o += '<circle cx="' + px(i) + '" cy="' + y(r[1]) + '" r="3" fill="' + PAARS + '"/>';
        var stap = Math.ceil(n / 14);
        if (n <= 14 || (i % stap === 0 && n - 1 - i >= stap) || i === n - 1) {
          var p = String(r[0]).split('-');
          o += '<text x="' + px(i) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="10.5" fill="#9ca3af">' + p[2] + '-' + p[1] + '</text>';
        }
      });
      o += '</svg>';
      return o;
    }
    _perioden(p, t) {
      // 14-11-2026 (Adrie): one row per period, newest first, trend first - how well the battery you had fitted that period
      var self = this, lng = this._lng();
      var naam = function (k, pk) {
        if (k === 'maand') return new Date(+pk.slice(0, 4), +pk.slice(5, 7) - 1, 1).toLocaleDateString(lng, { month: 'short', year: 'numeric' });
        if (k === 'kwartaal') return t.kw + pk.split('-Q')[1] + ' ' + pk.slice(0, 4);
        return pk;
      };
      var kwh = function (v) { return self._num(v, 0) + ' kWh'; };
      var blok = function (k, titel) {
        var r = p[k] || [];
        if (!r.length) return '';
        var rows = r.map(function (c, i) {
          var o = r[i + 1], tr = '';
          if (o && c[5] > 0 && o[5] > 0) { var x = c[4] / c[5], y = o[4] / o[5]; tr = x > y + 0.02 ? '▲' : (x < y - 0.02 ? '▼' : '='); }
          var ruim = c[5] <= c[4] + 0.005, benut = c[5] > 0 ? Math.min(100, Math.round(c[4] / c[5] * 100)) : null;
          var bat = c[7] ? (c[7][0] === c[7][1] ? kwh(c[7][0]) : self._num(c[7][0], 0) + ' → ' + kwh(c[7][1])) : '–';
          var deel = c[1] < c[2] ? ' <span class="ps">' + c[1] + '/' + c[2] + ' ' + esc(t.dg) + '</span>' : '';
          var onv = i > 0 && c[1] < c[2] / 2;
          return '<tr' + (onv ? ' class="grijs"' : '') + '><th>' + esc(naam(k, c[0])) + deel + '</th><td class="tr">' + tr + '</td><td>' + esc(bat) + '</td><td>' + esc(self._eur(c[4])) + '</td><td>' + esc(self._eur(Math.max(c[5], c[4]))) +
            '</td><td class="pv">' + (ruim ? '100 %' : benut === null ? '–' : benut + ' %') + '</td><td>' + esc(ruim ? t.ruim : self._eur(c[6])) + '</td><td>' + esc(kwh(c[3])) + '</td></tr>';
        }).join('');
        return '<div class="psub">' + esc(titel) + '</div><div class="pwrap"><table class="per"><tr class="phd"><th></th><th></th><th>' + esc(t.hBat) + '</th><th>' + esc(t.hOp) + '</th><th>' + esc(t.hMog) + '</th><th>' + esc(t.hBen) + '</th><th>' + esc(t.hGem) + '</th><th>' + esc(t.hOpt) + '</th></tr>' + rows + '</table></div>';
      };
      var html = blok('jaar', t.jaar) + blok('kwartaal', t.kwartaal) + blok('maand', t.maand);
      if (!html) return '';
      return '<div class="ptit">' + esc(t.ptit) + '</div>' + html + '<div class="voet">' + esc(t.puitleg) + '</div>';
    }
    _render(s) {
      var t = this._t(), a = s ? s.attributes : {}, st = s ? s.state : '', n = a.dagen || 0, reeks = a.reeks || [];
      var kop = '<div class="kop"><span class="titel">' + esc(t.titel) + '</span><span class="exp">' + esc(t.exp) + '</span></div><div class="sub">' + esc(t.sub) + '</div>';
      var body = '';
      if (!s || !reeks.length) {
        body = '<div class="tekst">' + esc(t.leeg) + '</div>';
      } else {
        var opt = a.optimaal || 0, ideal = this._rolling(reeks);
        body += this._chart(reeks, ideal, t);
        body += '<div class="leg"><span><i style="background:' + GEEL + ';opacity:.45"></i>' + esc(t.besch) + '</span><span><i style="background:' + PAARS + ';opacity:.6"></i>' + esc(t.nodig) + '</span>' +
          (ideal.some(function (v) { return v !== null; }) ? '<span><i style="background:' + OPTK + '"></i>' + esc(t.opt) + ' (' + t.gem + ')</span>' : '') + '</div>';
        if (st === 'te_weinig_dagen') {
          body += '<div class="tekst">' + esc(this._fill(t.weinig, { n: n, min: a.min_dagen || 7 })) + '</div>';
        } else {
          var f = this._fill.bind(this);
          body += '<ul>' +
            '<li>' + esc(f(t.f1, { a: a.dagen_te_weinig, n: n })) + '</li>' +
            '<li>' + esc(f(t.f2, { a: a.dagen_over, n: n, p: 15 })) + '</li>' +
            '<li>' + esc(f(t.f3, { g: this._num(a.nodig_gem, 1), m: this._num(a.nodig_max, 1) })) + '</li>' +
            '<li><b>' + esc(f(t.f4, { b: this._num(a.beschikbaar, 1), o: this._num(ideal[ideal.length - 1] || a.nodig_gem || 0, 1) })) + '</b></li></ul>';
        }
        if (a.perioden) body += this._perioden(a.perioden, t);
        body += '<div class="voet">' + esc(this._fill(t.voet1, { n: n, goed: a.goed_dagen || 28 })) + '<br>' + esc(t.voet2) + '</div>';
      }
      this.shadowRoot.innerHTML = '<style>:host{display:block}.ptit{margin-top:14px;font-weight:600;color:var(--primary-text-color,#fff)}.pwrap{overflow-x:auto}.per{border-collapse:collapse;width:100%;font-size:13px;margin-top:6px}.per th{text-align:left;padding:6px 8px 6px 0;color:var(--secondary-text-color);font-weight:500}.per td{padding:6px 8px;vertical-align:top;white-space:nowrap}.per .tr{font-size:14px;color:var(--secondary-text-color)}.pv{font-weight:600}.psub{margin-top:12px;font-size:13px;font-weight:600;color:var(--secondary-text-color)}.per tr.phd th{font-size:11px;font-weight:500;padding:2px 8px 4px 0;white-space:normal;vertical-align:bottom}.per tr.grijs{opacity:.5}.ps{font-size:11px;color:var(--secondary-text-color)}ha-card{padding:16px 18px;box-sizing:border-box}' +
        '.kop{display:flex;align-items:baseline;gap:10px}.titel{font-size:18px;font-weight:600;color:var(--primary-text-color,#fff)}' +
        '.exp{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#f59e0b;border:1px solid #f59e0b;border-radius:10px;padding:1px 8px}' +
        '.sub{font-size:12.5px;color:var(--secondary-text-color,#9ca3af);margin:2px 0 8px}' +
        '.leg{display:flex;gap:16px;font-size:12px;color:var(--secondary-text-color,#9ca3af);margin:4px 0 8px}.leg i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px}' +
        'ul{margin:6px 0 8px;padding-left:18px;font-size:14px;line-height:1.55;color:var(--primary-text-color,#fff)}' +
        '.tekst{font-size:13px;line-height:1.5;color:var(--primary-text-color,#fff);margin:6px 0}.klein{font-size:12.5px;color:var(--secondary-text-color,#9ca3af)}' +
        '.voet{font-size:11.5px;line-height:1.5;color:var(--secondary-text-color,#9ca3af);border-top:1px solid #ffffff14;margin-top:10px;padding-top:8px}</style>' +
        '<ha-card>' + kop + body + '</ha-card>';
    }
  }
  if (!customElements.get('batterijplan-capaciteit')) customElements.define('batterijplan-capaciteit', BatterijplanCapaciteitCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'batterijplan-capaciteit', name: 'Batterijplan capaciteit (experiment)', description: 'Nodig per dag naast beschikbaar' });
})();
