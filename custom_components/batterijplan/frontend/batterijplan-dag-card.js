// Versie: 12-11-2026 18:00 (dagkaart vandaag - al bespaard / nog te verwachten / dagtotaal; Adrie 12-11-2026)
// Project tag: [BATTERIJPLAN]
// Kaart "vandaag" (kalenderdag 00:00-24:00). Config: entity (sensor.batterijplan), taal: nl|en|de.
// Al bespaard   = stand van sensor.batterijplan_meerwaarde nu minus de stand van vannacht 00:00 (recorder-statistiek).
// Nog te verwachten = plan van nu tot 24:00: som van (kosten HBC alleen - kosten plan) per kwartier (attribuut kw)
//                     plus het verschil in batterij-inhoud op 24:00 (plan - HBC) maal de laagste inkoopprijs (pmin_b).
(function () {
  var TXT = {
    nl: { vWaarde: 'Waarde vandaag', vWaardeSub: 'van 00:00 tot nu, tegen jouw prijzen', vHuis: 'Batterij naar huis', vHuisSub: 'zelfverbruik via de batterij', vLaad: 'Geladen', vLaadSub: 'met zon · van het net', vZon: 'zon', vNet: 'net', vNoot: 'Bij een vast contract maakt Batterijplan geen plan. De waarde is wat de batterij vandaag opleverde tegen jouw prijzen: ontladen voor het huis telt tegen de prijs, laden van het net kost de prijs, laden met zon kost de terugleververgoeding.', titel: 'Vandaag', bespaard: 'Al bespaard', nog: 'Nog te verwachten', totaal: 'Dagtotaal', subB: 'van 00:00 tot nu', subN: 'tot 24:00', subT: 'bespaard + verwacht', wacht: 'Nog geen kosten per kwartier in het plan (na herstart van Home Assistant)', loc: 'nl-NL' },
    en: { vWaarde: 'Value today', vWaardeSub: 'from 00:00 until now, at your prices', vHuis: 'Battery to the house', vHuisSub: 'self-consumption via the battery', vLaad: 'Charged', vLaadSub: 'with solar · from the grid', vZon: 'solar', vNet: 'grid', vNoot: 'With a fixed contract Batterijplan makes no plan. The value is what the battery earned today at your prices: discharging for the house counts at the price, charging from the grid costs the price, charging with solar costs the feed-in price.', titel: 'Today', bespaard: 'Saved so far', nog: 'Still expected', totaal: 'Day total', subB: 'from 00:00 until now', subN: 'until 24:00', subT: 'saved + expected', wacht: 'No per-quarter costs in the plan yet (after restarting Home Assistant)', loc: 'en-GB' },
    de: { vWaarde: 'Wert heute', vWaardeSub: 'von 00:00 bis jetzt, zu deinen Preisen', vHuis: 'Batterie ins Haus', vHuisSub: 'Eigenverbrauch über die Batterie', vLaad: 'Geladen', vLaadSub: 'mit Sonne · aus dem Netz', vZon: 'Sonne', vNet: 'Netz', vNoot: 'Bei einem Festvertrag macht Batterijplan keinen Plan. Der Wert ist, was die Batterie heute zu deinen Preisen eingebracht hat: Entladen fürs Haus zählt zum Preis, Laden aus dem Netz kostet den Preis, Laden mit Sonne kostet die Einspeisevergütung.', titel: 'Heute', bespaard: 'Bisher gespart', nog: 'Noch erwartet', totaal: 'Tagessumme', subB: 'von 00:00 bis jetzt', subN: 'bis 24:00', subT: 'gespart + erwartet', wacht: 'Noch keine Viertelstundenkosten im Plan (nach Neustart von Home Assistant)', loc: 'de-DE' }
  };
  var GROEN = '#1dab52', ORANJE = '#f59e0b';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  class BatterijplanDagCard extends HTMLElement {
    setConfig(c) {
      this._c = Object.assign({ entity: 'sensor.batterijplan', taal: '' }, c || {});
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      this._sig = null;
    }
    getCardSize() { return 3; }
    _t() { var l = (this._c && this._c.taal) || String((this._h && this._h.language) || 'nl').slice(0, 2); return TXT[l] || TXT.nl; }
    set hass(h) {
      this._h = h;
      var id = this._c.entity === 'sensor.batterijplan' && h.states['sensor.batterijplan_2'] ? 'sensor.batterijplan_2' : this._c.entity;
      var s = h.states[id];
      var mw = h.states['sensor.batterijplan_meerwaarde_2'] || h.states['sensor.batterijplan_meerwaarde'];
      this._laadBasis();
      var sig = (s ? s.last_updated : '') + '|' + (mw ? mw.state : '') + '|' + this._basis + '|' + (h.themes && h.themes.darkMode);
      this._s = s; this._mw = mw;
      if (sig === this._sig) return;
      this._sig = sig;
      this._render();
    }
    // stand van de teller op 00:00 vannacht (laatste 5-minuten-statistiek voor middernacht); 1x per 5 minuten opnieuw
    _laadBasis() {
      var h = this._h; if (!h) return;
      var d0 = new Date(); d0.setHours(0, 0, 0, 0);
      var dag = d0.toISOString();
      if (this._basisDag === dag && this._basis !== undefined && this._basis !== null) return;
      var slot = Math.floor(Date.now() / 60000);
      if (this._busy || this._slot === slot) return;
      this._busy = true; this._slot = slot;
      var id = 'sensor.batterijplan_meerwaarde';
      var van = new Date(d0.getTime() - 20 * 60000).toISOString(), tot = new Date(d0.getTime() + 20 * 60000).toISOString();
      var self = this;
      h.callWS({ type: 'recorder/statistics_during_period', start_time: van, end_time: tot, statistic_ids: [id], period: '5minute', types: ['state'] }).then(function (r) {
        var a = (r[id] || []).map(function (x) { return { t: typeof x.start === "number" ? x.start : Date.parse(x.start), v: Number(x.state) }; }).filter(function (x) { return x.t < d0.getTime() && isFinite(x.v); });
        a.sort(function (p, q) { return q.t - p.t; });
        self._basis = a.length ? a[0].v : null; self._basisDag = dag; self._sig = null; self._render();
      }).catch(function () { self._basis = null; }).then(function () { self._busy = false; });
    }
    _rest() {
      var s = this._s; if (!s) return null;
      var a = s.attributes || {}, pts = Array.isArray(a.punten) ? a.punten : [], kw = Array.isArray(a.kw) ? a.kw : null, pmin = Number(a.pmin_b);
      if (!kw || !pts.length || !isFinite(pmin) || kw.length < pts.length) return null;
      var n0 = new Date(); n0.setHours(24, 0, 0, 0);
      var m = -1; for (var i = 0; i < pts.length; i++) { if (Number(pts[i][0]) * 1000 < n0.getTime()) m = i; }
      if (m < 0) return 0;
      var som = 0; for (var j = 0; j <= m; j++) som += Number(kw[j][0]) - Number(kw[j][1]);
      som += (Number(pts[m][6]) - Number(pts[m][4])) * pmin;
      return isFinite(som) ? som : null;
    }
    _geld(v) {
      var t = this._t();
      if (v === null || v === undefined || !isFinite(v)) return { tx: '–', kl: 'var(--secondary-text-color)' };
      var f = function (x) { return Math.abs(x).toLocaleString(t.loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
      if (v > 0.005) return { tx: '+ € ' + f(v), kl: GROEN };
      if (v < -0.005) return { tx: '– € ' + f(v), kl: ORANJE };
      return { tx: '€ 0' + (0.5).toLocaleString(t.loc).charAt(1) + '00', kl: 'var(--secondary-text-color)' };
    }
    // Fixed contract (2.0.0-dev1): value of the battery today at your prices and the battery flows (self-consumption), no plan texts
    _renderVast(t, bespaard, a0) {
      var ma = (this._mw && this._mw.attributes) || {}, d0 = new Date(), iso = d0.getFullYear() + '-' + ('0' + (d0.getMonth() + 1)).slice(-2) + '-' + ('0' + d0.getDate()).slice(-2);
      var vandaag = ma.dag_datum === iso, kw = function (v) { return Number(v || 0).toLocaleString(t.loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kWh'; };
      var huis = vandaag ? ma.dag_huis_kwh : 0, zon = vandaag ? ma.dag_zon_kwh : 0, net = vandaag ? ma.dag_net_kwh : 0;
      var g = this._geld(bespaard);
      var blok = function (tx, kl, lab, sub) { return '<div class="b"><div class="g" style="color:' + kl + '">' + esc(tx) + '</div><div class="o">' + esc(lab) + '</div><div class="s">' + esc(sub) + '</div></div>'; };
      var datum = d0.toLocaleDateString(t.loc, { weekday: 'long', day: 'numeric', month: 'long' });
      this.shadowRoot.innerHTML = '<style>ha-card{padding:12px 14px}.k{display:flex;align-items:baseline;gap:6px 14px;flex-wrap:wrap;margin-bottom:6px}.tt{font-size:16px;font-weight:600;color:var(--primary-text-color)}.dt{font-size:13px;color:var(--secondary-text-color)}' +
        '.r{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}@media (max-width:560px){.r{grid-template-columns:1fr}}.b{border:1px solid rgba(148,163,184,.25);border-radius:10px;padding:8px 12px}.g{font-size:22px;line-height:1.2}.o{font-size:12px;color:var(--primary-text-color);margin-top:2px}.s{font-size:11px;color:var(--secondary-text-color)}.w{font-size:11.5px;line-height:1.5;color:var(--secondary-text-color);margin-top:10px}</style>' +
        '<ha-card><div class="k"><span class="tt">' + esc(t.titel) + '</span><span class="dt">' + esc(datum) + ' · 00:00–24:00</span></div><div class="r">' +
        blok(g.tx, g.kl, t.vWaarde, t.vWaardeSub) + blok(kw(huis), 'var(--primary-text-color)', t.vHuis, t.vHuisSub) +
        blok(kw(zon) + ' · ' + kw(net), 'var(--primary-text-color)', t.vLaad, t.vLaadSub) + '</div><div class="w">' + esc(t.vNoot) + '</div></ha-card>';
    }
    _render() {
      var t = this._t();
      var nu = this._mw ? Number(this._mw.state) : NaN;
      var bespaard = (isFinite(nu) && this._basis !== null && this._basis !== undefined) ? Math.max(nu - this._basis, 0) : null;
      if (isFinite(nu) && this._basis !== null && this._basis !== undefined) bespaard = nu - this._basis;
      var rest = this._rest();
      var a0 = (this._s && this._s.attributes) || {};
      if (a0.contract && a0.contract !== 'dynamisch' && a0.vast) { this._renderVast(t, bespaard, a0); return; }  // Fixed contract: no plan, so no 'still expected'
      var tot = (bespaard !== null && rest !== null) ? bespaard + rest : null;
      var gB = this._geld(bespaard), gN = this._geld(rest), gT = this._geld(tot);
      var pct = (tot !== null && tot > 0.005 && bespaard !== null) ? Math.max(0, Math.min(100, Math.round(bespaard / tot * 100))) : null;
      var blok = function (g, lab, sub, groot) { return '<div class="b' + (groot ? ' t' : '') + '"><div class="g" style="color:' + g.kl + '">' + esc(g.tx) + '</div><div class="o">' + esc(lab) + '</div><div class="s">' + esc(sub) + '</div></div>'; };
      var d = new Date(); var datum = d.toLocaleDateString(t.loc, { weekday: 'long', day: 'numeric', month: 'long' });
      var html = '<style>ha-card{padding:12px 14px}.k{display:flex;align-items:baseline;gap:6px 14px;flex-wrap:wrap;margin-bottom:6px}.tt{font-size:16px;font-weight:600;color:var(--primary-text-color)}.dt{font-size:13px;color:var(--secondary-text-color)}.r{display:flex;justify-content:space-around;gap:10px;flex-wrap:wrap;text-align:center}.b{min-width:120px;padding:6px 4px}.g{font-size:26px;font-weight:600;line-height:1.2}.b.t .g{font-size:30px}.o{font-size:13px;color:var(--primary-text-color);margin-top:2px}.s{font-size:12px;color:var(--secondary-text-color)}.bar{height:6px;border-radius:3px;background:var(--divider-color,#444);margin-top:10px;overflow:hidden}.bar i{display:block;height:100%;background:' + GROEN + '}.w{font-size:12px;color:var(--secondary-text-color);margin-top:8px;text-align:center}</style>' +
        '<ha-card><div class="k"><span class="tt">' + esc(t.titel) + '</span><span class="dt">' + esc(datum) + ' · 00:00–24:00</span></div>' +
        '<div class="r">' + blok(gB, t.bespaard, t.subB, false) + blok(gN, t.nog, t.subN, false) + blok(gT, t.totaal, t.subT, true) + '</div>' +
        (pct !== null ? '<div class="bar"><i style="width:' + pct + '%"></i></div>' : '') +
        (rest === null ? '<div class="w">' + esc(t.wacht) + '</div>' : '') + '</ha-card>';
      this.shadowRoot.innerHTML = html;
    }
  }
  if (!customElements.get('batterijplan-dag-card')) customElements.define('batterijplan-dag-card', BatterijplanDagCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'batterijplan-dag-card', name: 'Batterijplan vandaag', description: 'Al bespaard, nog te verwachten en dagtotaal voor de kalenderdag' });
})();
