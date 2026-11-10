// Batterijplan plan card: HBC and Batterijplan chart (weergave: samen | hbc | plan) and the briefing (weergave: briefing).
// Config: entity (default sensor.batterijplan), weergave, titel (optional), taal: nl | en | de (default: user profile).
// Areas (kWh / kW, right axis): solar forecast (purple), Batterijplan charge (teal), HBC charge (yellow dashed line).
// Price (ct, left axis): thin grey step line. Bar: HBC row (muted), Plan row (only where it differs).
// Rule switches: switch.batterijplan_regel_laden|ontladen|vasthouden|terugleveren.
const BP_PLAN_TX = {
  en: {
    'laden van het net': 'charge from the grid', 'ontladen': 'discharge', 'vasthouden': 'hold', 'terugleveren': 'feed in', 'niet laden / niet ontladen': 'no charge / no discharge', 'alleen zon / niets': 'solar only / nothing',
    'extra laden van het net': 'extra charge from the grid', 'extra ontladen': 'extra discharge', 'vasthouden voor later': 'hold for later',
    'Briefing en plan': 'Briefing and plan', 'HBC origineel': 'HBC original', 'klik: alleen deze / beide': 'click: only this / both', 'klik: tonen / verbergen': 'click: show / hide',
    'Nog geen berekening.': 'No calculation yet.', 'in de batterij': 'in the battery', 'Kwartier': 'Quarter', 'hetzelfde als HBC': 'same as HBC', 'HBC zou': 'HBC would', 'Tot': 'Until', 'verschil': 'difference',
    'Geen bijsturing nodig: Batterijplan doet hetzelfde als HBC.': 'No steering needed: Batterijplan does the same as HBC.',
    'Extra laden van het net': 'Extra charging from the grid', 'Ontladen buiten HBC-uren': 'Discharging outside HBC hours', 'Vasthouden voor later': 'Holding for later', 'Terugleveren': 'Feeding in', 'aan': 'on', 'uit': 'off',
    'Waar Batterijplan bijstuurt': 'Where Batterijplan steers', 'Regels': 'Rules',
    'zon verwachting (kW)': 'solar forecast (kW)', 'lading Batterijplan (kWh)': 'charge Batterijplan (kWh)', 'lading HBC (kWh)': 'charge HBC (kWh)', 'prijs (ct)': 'price (ct)',
    'bijgestuurd kwartier (kleur = actie)': 'steered quarter (colour = action)', 'balk HBC': 'HBC bar', 'balk Plan': 'Plan bar', 'Nu': 'Now', 'Plan': 'Plan',
    'Kale prijs': 'Bare price', 'Zon verwacht': 'Solar expected', 'Zon voorzichtig': 'Solar cautious', 'Lading HBC': 'Charge HBC', 'Lading Batterijplan': 'Charge Batterijplan', 'Actie HBC': 'Action HBC', 'Actie Batterijplan': 'Action Batterijplan',
    'stroomkosten': 'electricity cost', 't.o.v. HBC': 'vs HBC', 'stroomkosten tot': 'electricity cost until', 'Kale prijs nu': 'Bare price now', 'Verwachte besparing t.o.v. HBC alleen': 'Expected saving versus HBC alone', 'In de batterij nu': 'In the battery now',
  },
  de: {
    'laden van het net': 'aus dem Netz laden', 'ontladen': 'entladen', 'vasthouden': 'halten', 'terugleveren': 'einspeisen', 'niet laden / niet ontladen': 'nicht laden / nicht entladen', 'alleen zon / niets': 'nur Sonne / nichts',
    'extra laden van het net': 'zusätzlich aus dem Netz laden', 'extra ontladen': 'zusätzlich entladen', 'vasthouden voor later': 'für später halten',
    'Briefing en plan': 'Briefing und Plan', 'HBC origineel': 'HBC Original', 'klik: alleen deze / beide': 'Klick: nur diese / beide', 'klik: tonen / verbergen': 'Klick: anzeigen / ausblenden',
    'Nog geen berekening.': 'Noch keine Berechnung.', 'in de batterij': 'in der Batterie', 'Kwartier': 'Viertelstunde', 'hetzelfde als HBC': 'dasselbe wie HBC', 'HBC zou': 'HBC würde', 'Tot': 'Bis', 'verschil': 'Differenz',
    'Geen bijsturing nodig: Batterijplan doet hetzelfde als HBC.': 'Kein Nachsteuern nötig: Batterijplan tut dasselbe wie HBC.',
    'Extra laden van het net': 'Zusätzliches Laden aus dem Netz', 'Ontladen buiten HBC-uren': 'Entladen außerhalb der HBC-Zeiten', 'Vasthouden voor later': 'Halten für später', 'Terugleveren': 'Einspeisen', 'aan': 'an', 'uit': 'aus',
    'Waar Batterijplan bijstuurt': 'Wo Batterijplan nachsteuert', 'Regels': 'Regeln',
    'zon verwachting (kW)': 'Sonnenprognose (kW)', 'lading Batterijplan (kWh)': 'Ladung Batterijplan (kWh)', 'lading HBC (kWh)': 'Ladung HBC (kWh)', 'prijs (ct)': 'Preis (ct)',
    'bijgestuurd kwartier (kleur = actie)': 'nachgesteuerte Viertelstunde (Farbe = Aktion)', 'balk HBC': 'Balken HBC', 'balk Plan': 'Balken Plan', 'Nu': 'Jetzt', 'Plan': 'Plan',
    'Kale prijs': 'Reiner Preis', 'Zon verwacht': 'Sonne erwartet', 'Zon voorzichtig': 'Sonne vorsichtig', 'Lading HBC': 'Ladung HBC', 'Lading Batterijplan': 'Ladung Batterijplan', 'Actie HBC': 'Aktion HBC', 'Actie Batterijplan': 'Aktion Batterijplan',
    'stroomkosten': 'Stromkosten', 't.o.v. HBC': 'ggü. HBC', 'stroomkosten tot': 'Stromkosten bis', 'Kale prijs nu': 'Reiner Preis jetzt', 'Verwachte besparing t.o.v. HBC alleen': 'Erwartete Ersparnis gegenüber HBC allein', 'In de batterij nu': 'Jetzt in der Batterie',
  },
};
// escape everything that ends up in innerHTML (card config, state attributes): & < > " '
const bpEsc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// plan points from an attribute (the entity is set in the card config, so it can be any entity): only numbers and action letters get through
const bpPts = (s) => {
  let v = [];
  try { v = s && s.attributes && s.attributes.punten ? (typeof s.attributes.punten === 'string' ? JSON.parse(s.attributes.punten.replace(/'/g, '"')) : s.attributes.punten) : []; } catch (e) { v = []; }
  if (!Array.isArray(v)) return [];
  const num = (x) => { const n = Number(x); return Number.isFinite(n) ? n : 0; }, act = (x) => ('LOHVZ'.includes(String(x)) && String(x).length === 1 ? String(x) : 'Z');
  return v.filter(Array.isArray).map((p) => [num(p[0]), num(p[1]), num(p[2]), act(p[3]), num(p[4]), act(p[5]), num(p[6]), num(p[7]), num(p[8])]);
};
const BP_PLAN_LOC = { nl: 'nl-NL', en: 'en-GB', de: 'de-DE' };
class BatterijplanPlanCard extends HTMLElement {
  setConfig(c) { this._c = Object.assign({ entity: 'sensor.batterijplan', weergave: 'samen' }, c); this.style.display = 'block'; this._sig = null; this.style.display = 'block'; }
  // language: config taal first, then the user profile; anything else falls back to English
  _lng() {
    const o = String(this._c.taal || '').slice(0, 2).toLowerCase();
    if (['nl', 'en', 'de'].includes(o)) return o;
    const h = this._h, l = String((h && ((h.locale && h.locale.language) || h.language)) || 'nl').slice(0, 2).toLowerCase();
    return l === 'nl' || l === 'de' ? l : 'en';
  }
  _T(k) { const d = BP_PLAN_TX[this._lng()]; return (d && d[k]) || k; }
  set hass(h) {
    this._h = h;
    // like the status card: with a second Batterijplan (sensor.batterijplan_2) the _2 one is the live one
    const id = this._c.entity === 'sensor.batterijplan' && h.states['sensor.batterijplan_2'] ? 'sensor.batterijplan_2' : this._c.entity;
    const s = h.states[id];
    const rg = ['laden', 'ontladen', 'vasthouden', 'terugleveren'].map(k => (h.states['switch.batterijplan_regel_' + k] || {}).state).join() + this._lng();
    if (rg !== this._rg) { this._rg = rg; this._sig = null; }
    const sig = (s ? s.last_updated : '') + '|' + this._liveState().last_updated + '|' + (h.themes && h.themes.darkMode);
    this._s = s;
    if (sig === this._sig) return;
    this._sig = sig;
    this._render(s);
  }
  // live charge level: small sensor sensor.batterijplan_lading (_2 when a second Batterijplan exists)
  _liveState() { const S = (this._h || {}).states || {}; return S['sensor.batterijplan_lading_2'] || S['sensor.batterijplan_lading'] || {}; }
  _liveLading(a) { const v = parseFloat(this._liveState().state); return Number.isFinite(v) ? v : +a.lading; }
  getCardSize() { return 5; }
  // Tooltip: only the line and the box move on pointer move; the card is not re-rendered. Mouse: hover; phone: tap.
  _hover(pts, g, html) {
    const sr = this.shadowRoot, cw = sr.querySelector('.cw'), sv = sr.querySelector('.cw svg'), hl = sr.querySelector('.hl'), tip = sr.querySelector('.tip');
    this._hide = null;
    if (!cw || !sv || !hl || !tip || !pts.length) return;
    let last = -1, raf = 0, px = null;
    const hide = () => { hl.setAttribute('visibility', 'hidden'); tip.style.display = 'none'; last = -1; this._hvOn = false; };
    const show = () => {
      raf = 0;
      const r = sv.getBoundingClientRect();
      if (!r.width || px == null) return;
      const sx = (px - r.left) * (g.W / r.width);
      if (sx < g.L || sx > g.xn) { hide(); return; }
      const i = Math.min(pts.length - 1, Math.floor((sx - g.L) / g.bw));
      hl.setAttribute('x1', sx); hl.setAttribute('x2', sx); hl.setAttribute('visibility', 'visible');
      if (i !== last) { last = i; tip.innerHTML = html(pts[i]); }  // text only changes per quarter
      tip.style.display = 'block';
      const c = cw.getBoundingClientRect(), tw = tip.offsetWidth;
      let left = px - c.left + 14;
      if (left + tw > c.width) left = px - c.left - 14 - tw;
      tip.style.transform = 'translateX(' + Math.max(0, left) + 'px)';
    };
    const move = e => { px = e.clientX; this._hvOn = true; this._hvX = px; if (!raf) raf = requestAnimationFrame(show); };
    cw.addEventListener('pointermove', move);
    cw.addEventListener('pointerdown', move);
    cw.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hide(); });
    this._hide = hide;
    if (!this._docDown) { this._docDown = e => { if (this._hide && !e.composedPath().includes(this)) this._hide(); }; document.addEventListener('pointerdown', this._docDown); }
    if (this._hvOn && this._hvX != null) { px = this._hvX; show(); }  // card was redrawn while the pointer is over it
  }
  disconnectedCallback() {
    if (this._docDown) { document.removeEventListener('pointerdown', this._docDown); this._docDown = null; }
    if (this._ro) { this._ro.disconnect(); this._ro = null; this._sig = null; }  // re-observed at the next render
  }
  _glad(pt) {
    if (pt.length < 2) return '';
    let d = `M${pt[0][0]},${pt[0][1]}`;
    for (let i = 0; i < pt.length - 1; i++) {
      const p0 = pt[i - 1] || pt[i], p1 = pt[i], p2 = pt[i + 1], p3 = pt[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  }
  _briefing(s) {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const LICHT = !!(this._h && this._h.themes && this._h.themes.darkMode === false); const GEEL = LICHT ? '#b49104' : '#facc15', BG = LICHT ? '#05a1bb' : '#06B6D4', GEELT = LICHT ? '#8c7103' : GEEL, BGT = LICHT ? '#047f94' : BG;
    const ACT = LICHT ? { L: '#3b82f6', O: '#1dab52', H: '#ca8208', V: '#ec4899', Z: '#8596ae' } : { L: '#3b82f6', O: '#22c55e', H: '#f59e0b', V: '#ec4899', Z: '#94a3b8' };
    const T = k => this._T(k), LOC = BP_PLAN_LOC[this._lng()];
    const NAAM = { L: T('laden van het net'), O: T('ontladen'), H: T('vasthouden'), V: T('terugleveren'), Z: T('alleen zon / niets') };
    const NAAMB = { L: T('extra laden van het net'), O: T('extra ontladen'), H: T('vasthouden voor later'), V: T('terugleveren'), Z: T('niet laden / niet ontladen') };
    let pts = [];
    pts = bpPts(s);
    const a = s ? s.attributes : {};
    const tijd = t => new Date(t * 1000).toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' });
    const dag = t => new Date(t * 1000).toLocaleDateString(LOC, { weekday: 'short' });
    const dec = x => (this._lng() === 'en' ? x : String(x).replace('.', ','));
    const eur = v => (v == null || isNaN(v) ? '–' : '€ ' + dec((+v).toFixed(2)));
    const opb = s ? parseFloat(s.state) : NaN;
    let kop = T('Nog geen berekening.'), lijst = '';
    if (pts.length) {
      const p = pts[0];
      const zelfde = p[5] === p[3];
      kop = `<b>${dec(this._liveLading(a).toFixed(1))} kWh</b> ${T('in de batterij')}. ${T('Kwartier')} ${tijd(p[0])} (${dec(p[1])} ct): Batterijplan <b style="color:${BGT}">${NAAM[p[5]]}</b>`
        + (zelfde ? ` — ${T('hetzelfde als HBC')}.` : ` — ${T('HBC zou')} <span style="color:${GEELT}">${NAAM[p[3]]}</span>.`)
        + `<br>${T('Tot')} ${dag(pts[pts.length - 1][0])} ${tijd(pts[pts.length - 1][0] + 900)}: HBC <span style="color:${GEELT}">${eur(a.kosten_hbc)}</span>, Batterijplan <span style="color:${BGT}">${eur(a.kosten_plan)}</span>, ${T('verschil')} <b style="color:${opb >= 0 ? ACT.O : ACT.H}">${opb >= 0 ? '+' : ''}${eur(opb)}</b>.`;
      const runs = [];
      pts.forEach(q => { const k = q[5] !== q[3] ? q[5] : null; const l = runs[runs.length - 1]; if (l && l.k === k) { l.e = q; l.p.push(q[1]); } else runs.push({ k, b: q, e: q, p: [q[1]] }); });
      const bij = runs.filter(r => r.k).slice(0, 16);
      lijst = bij.length ? bij.map(r => { const mn = Math.min(...r.p), mx = Math.max(...r.p);
        return `<div class="r"><i style="background:${ACT[r.k]}"></i><b>${dag(r.b[0])} ${tijd(r.b[0])}–${tijd(r.e[0] + 900)}</b> <span>${NAAMB[r.k]} (${mn === mx ? dec(mn) : dec(mn) + '–' + dec(mx)} ct)</span></div>`; }).join('')
        : '<div class="r"><span>' + T('Geen bijsturing nodig: Batterijplan doet hetzelfde als HBC.') + '</span></div>';
    }
    const RG = [['laden', T('Extra laden van het net')], ['ontladen', T('Ontladen buiten HBC-uren')], ['vasthouden', T('Vasthouden voor later')], ['terugleveren', T('Terugleveren')]];
    const regels = RG.map(([k, n]) => { const on = ((this._h && this._h.states['switch.batterijplan_regel_' + k]) || {}).state !== 'off'; return `<div><span style="color:var(--secondary-text-color)">${n}</span> <b style="color:${on ? ACT.O : ACT.H}">${on ? T('aan') : T('uit')}</b></div>`; }).join('');
    this.shadowRoot.innerHTML = `<style>
      ha-card{padding:12px 16px}
      .t{font-size:16px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px}
      .b{display:grid;grid-template-columns:1fr auto;gap:6px 24px;align-items:start}
      .rg{font-size:12px;line-height:1.7;white-space:nowrap}.rg b{font-weight:600}.rh{font-size:11px;letter-spacing:.06em;color:var(--secondary-text-color)}
      @media (max-width:700px){.b{grid-template-columns:1fr}}
      .b{border-left:3px solid ${BG};background:rgba(6,182,212,.08);padding:8px 12px;border-radius:6px;font-size:13px;line-height:1.6;color:var(--primary-text-color)}
      .h{font-size:11px;letter-spacing:.06em;color:var(--secondary-text-color);margin:12px 0 4px}
      .r{display:flex;align-items:baseline;gap:8px;padding:5px 0;border-bottom:1px solid rgba(148,163,184,.12);font-size:13px}
      .cols{display:grid;grid-template-columns:1fr 1fr;column-gap:24px}
      @media (max-width:700px){.cols{grid-template-columns:1fr}}
      .r i{width:10px;height:10px;border-radius:2px;flex:none;display:inline-block}
      .r span{color:var(--secondary-text-color)}
    </style><ha-card>
      <div class="t">${bpEsc(this._c.titel || T('Briefing en plan'))}</div>
      <div class="b"><div>${kop}</div><div class="rg"><div class="rh">${T('Regels').toUpperCase()}</div>${regels}</div></div>
      <div class="h">${T('Waar Batterijplan bijstuurt').toUpperCase()}</div>
      <div class="cols">${lijst}</div>
    </ha-card>`;
  }
  _render(s) {
    if (this._c.weergave === 'briefing') { this._briefing(s); return; }
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const w = this._c.weergave;
    let toonH = w !== 'plan', toonP = w !== 'hbc';
    if (w === 'samen' && this._solo === 'hbc') toonP = false;
    if (w === 'samen' && this._solo === 'plan') toonH = false;
    if (!this._uit) { try { this._uit = new Set(JSON.parse(localStorage.getItem('bp_legenda_' + w) || '[]')); } catch (e) { this._uit = new Set(); } }
    const aan = k => !this._uit.has(k);
    const LICHT = !!(this._h && this._h.themes && this._h.themes.darkMode === false); const GEEL = LICHT ? '#b49104' : '#facc15', BG = LICHT ? '#05a1bb' : '#06B6D4', ZON = '#8b5cf6', GEELT = LICHT ? '#8c7103' : GEEL, BGT = LICHT ? '#047f94' : BG;
    const ACT = LICHT ? { L: '#3b82f6', O: '#1dab52', H: '#ca8208', V: '#ec4899', Z: '#8596ae' } : { L: '#3b82f6', O: '#22c55e', H: '#f59e0b', V: '#ec4899', Z: '#94a3b8' };
    const T = k => this._T(k), LOC = BP_PLAN_LOC[this._lng()];
    const dec = x => (this._lng() === 'en' ? x : String(x).replace('.', ','));
    const NAAM = { L: T('laden van het net'), O: T('ontladen'), H: T('vasthouden'), V: T('terugleveren'), Z: T('niet laden / niet ontladen') };
    const sol = k => `data-solo="${k}" class="solo${this._solo && this._solo !== k ? ' uit' : ''}" title="${T('klik: alleen deze / beide')}"`;
    const titel = this._c.titel ? bpEsc(this._c.titel) : (w === 'samen' ? `<span ${sol('hbc')} style="color:${GEELT}">HBC</span> + <span ${sol('plan')} style="color:${BGT}">Batterijplan</span>` : w === 'plan' ? `<span style="color:${BGT}">Batterijplan</span>` : `<span style="color:${GEELT}">${T('HBC origineel')}</span>`);
    let pts = [];
    pts = bpPts(s);
    const a = s ? s.attributes : {};
    const W = Math.max(480, Math.round((this.getBoundingClientRect().width || 748) - 28)), H = 290, L = 34, R = 30, Tp = 22, B = 64;
    const iw = W - L - R, ih = H - Tp - B;
    const n = pts.length || 1, bw = iw / n;
    const pmax = Math.max(40, ...pts.map(p => p[1])), pmin = Math.min(0, ...pts.map(p => p[1]));
    const cap = Math.max(9, ...pts.map(p => Math.max(p[4], p[6], p[7] || 0)));
    const yP = v => Tp + ih - (v - pmin) / (pmax - pmin) * ih;
    const yE = v => Tp + ih - v / cap * ih;
    const x0 = L, xn = L + n * bw, y0 = yE(0);
    const anders = p => p[5] !== p[3];
    const r1 = H - B + 8, r2 = r1 + 12;
    let svg = '';
    // raster
    for (let k = 0; k <= cap; k += 3) svg += `<line x1="${x0}" x2="${xn}" y1="${yE(k)}" y2="${yE(k)}" stroke="rgba(148,163,184,.10)" stroke-dasharray="2 4"/>`;
    // bijgestuurde kwartieren: zachte band
    if (toonP && aan('band')) pts.forEach((p, i) => { if (anders(p)) svg += `<rect x="${L + i * bw}" y="${Tp}" width="${bw + 0.2}" height="${ih}" fill="${ACT[p[5]]}" fill-opacity=".16"/>`; });
    // zon verwachting (paars vlak)
    const zp = pts.map((p, i) => [L + (i + 0.5) * bw, yE(p[7] || 0)]);
    if (aan('zon') && zp.length > 1 && pts.some(p => (p[7] || 0) > 0.01)) {
      const d = this._glad(zp);
      svg += `<path d="${d}L${zp[zp.length - 1][0]},${y0}L${zp[0][0]},${y0}Z" fill="rgba(139,92,246,.40)"/>`;
      svg += `<path d="${d}" fill="none" stroke="${ZON}" stroke-width="2.5"/>`;
    }
    // prijs (dunne trap)
    let dp = '';
    pts.forEach((p, i) => { const x = L + i * bw; dp += (i ? `L${x},${yP(p[1])}` : `M${x},${yP(p[1])}`) + `L${x + bw},${yP(p[1])}`; });
    if (aan('prijs')) svg += `<path d="${dp}" fill="none" stroke="${LICHT ? 'rgba(100,116,139,.8)' : 'rgba(203,213,225,.55)'}" stroke-width="1.2"/>`;
    // lading
    const lp = idx => [[x0, yE(a.lading != null ? +a.lading : pts[0] ? pts[0][idx] : 0)]].concat(pts.map((p, i) => [L + (i + 1) * bw, yE(p[idx])]));
    if (toonP && aan('plan')) {
      const q = lp(6), d = this._glad(q);
      svg += `<path d="${d}L${xn},${y0}L${x0},${y0}Z" fill="rgba(6,182,212,.30)"/>`;
      svg += `<path d="${d}" fill="none" stroke="${BG}" stroke-width="2.5"/>`;
    }
    if (toonH && aan('hbc')) svg += `<path d="${this._glad(lp(4))}" fill="none" stroke="${GEEL}" stroke-width="2" stroke-dasharray="5 4"/>`;
    svg += `<line x1="${x0}" x2="${xn}" y1="${y0}" y2="${y0}" stroke="rgba(148,163,184,.35)"/>`;
    svg += `<line class="hl" x1="0" x2="0" y1="${Tp}" y2="${(toonH && toonP ? r2 : r1) + 8}" stroke="var(--secondary-text-color)" stroke-width="1" visibility="hidden" pointer-events="none"/>`;
    // nu-lijn
    if (pts.length) { const xs = Math.min(xn, Math.max(x0, L + ((Date.now() / 1000 - pts[0][0]) / 900) * bw)); svg += `<line x1="${xs}" x2="${xs}" y1="${Tp}" y2="${y0}" stroke="${BG}" stroke-width="1.5"/><rect x="${xs - 13}" y="${Tp - 11}" width="26" height="13" rx="3" fill="#0e7490"/><text x="${xs}" y="${Tp - 1}" font-size="9" text-anchor="middle" fill="#fff">${T('Nu')}</text>`; }
    // balk
    pts.forEach((p, i) => {
      const x = L + i * bw;
      if (toonH && aan('rijH')) svg += `<rect x="${x}" y="${r1}" width="${bw + 0.2}" height="8" fill="${p[3] === 'Z' ? 'rgba(148,163,184,.10)' : ACT[p[3]]}" opacity="${toonP ? .45 : 1}"/>`;
      if (toonP && aan('rijP')) svg += `<rect x="${x}" y="${toonH ? r2 : r1}" width="${bw + 0.2}" height="8" fill="${anders(p) ? ACT[p[5]] : 'rgba(148,163,184,.10)'}"/>`;
      if (i % 12 === 0) {
        const tl = new Date(p[0] * 1000).toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' });
        svg += `<line x1="${x}" x2="${x}" y1="${Tp}" y2="${y0}" stroke="rgba(148,163,184,.10)" stroke-dasharray="2 4"/>`;
        svg += `<text x="${x}" y="${H - 6}" font-size="10" fill="var(--secondary-text-color)">${tl}</text>`;
      }
    });
    if (toonH) svg += `<text x="${L - 4}" y="${r1 + 7}" font-size="9" text-anchor="end" fill="${GEEL}">HBC</text>`;
    if (toonP) svg += `<text x="${L - 4}" y="${(toonH ? r2 : r1) + 7}" font-size="9" text-anchor="end" fill="${BG}">${T('Plan')}</text>`;
    for (let k = 0; k <= cap; k += 3) svg += `<text x="${W - R + 4}" y="${yE(k) + 3}" font-size="10" fill="var(--secondary-text-color)">${k}</text>`;
    for (let k = 0; k <= pmax; k += 10) svg += `<text x="${L - 6}" y="${yP(k) + 3}" font-size="10" text-anchor="end" fill="var(--secondary-text-color)">${k}</text>`;
    const eur = v => (v == null || isNaN(v) ? '–' : '€ ' + dec((+v).toFixed(2)));
    const opb = s ? parseFloat(s.state) : NaN;
    const ok = isNaN(opb) ? 'var(--secondary-text-color)' : opb > 0.005 ? ACT.O : opb < -0.005 ? ACT.H : 'var(--secondary-text-color)';
    const kop = w === 'samen' ? `<span style="color:${GEELT}">HBC ${eur(a.kosten_hbc)}</span> · <span style="color:${BGT}">Batterijplan ${eur(a.kosten_plan)}</span> · <b style="color:${ok}">${opb >= 0 ? '+' : ''}${eur(opb)}</b>`
      : w === 'plan' ? `${T('stroomkosten')} ${eur(a.kosten_plan)} · <b style="color:${ok}">${eur(opb)} ${T('t.o.v. HBC')}</b>` : `${T('stroomkosten')} ${eur(a.kosten_hbc)}`;
    const i = (k, t, lijn, id, tk) => `<span${tk ? ` style="color:${tk}"` : ''}${id ? ` data-k="${id}" class="kl${aan(id) ? '' : ' uit'}" title="${T('klik: tonen / verbergen')}"` : ''}><i style="background:${k}${lijn ? ';height:3px;vertical-align:3px' : ''}"></i>${t}</span>`;
    const legLijn = i('rgba(139,92,246,.7)', T('zon verwachting (kW)'), 0, 'zon') + (toonP ? i(BG, T('lading Batterijplan (kWh)'), 0, 'plan', BG) : '') + (toonH ? i(GEEL, T('lading HBC (kWh)'), 1, 'hbc', GEEL) : '') + i(LICHT ? 'rgba(100,116,139,.9)' : 'rgba(203,213,225,.7)', T('prijs (ct)'), 1, 'prijs') + (toonP ? i('linear-gradient(90deg,rgba(59,130,246,.45),rgba(34,197,94,.45),rgba(245,158,11,.45))', T('bijgestuurd kwartier (kleur = actie)'), 0, 'band') : '')
      + (toonH ? i(LICHT ? GEEL : 'rgba(250,204,21,.6)', T('balk HBC'), 0, 'rijH', GEEL) : '') + (toonP ? i(LICHT ? BG : 'rgba(6,182,212,.8)', T('balk Plan'), 0, 'rijP', BG) : '');
    const legAct = ['L', 'O', 'H', 'V', 'Z'].filter(k => toonP || k !== 'Z').map(k => i(ACT[k], NAAM[k])).join('');
    const pNu = pts.length ? pts[0][1] : null;
    const tEind = pts.length ? new Date((pts[pts.length - 1][0] + 900) * 1000).toLocaleString(LOC, { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    const kop3 = `<div class="top"><div class="kader"><div class="g">${pNu != null ? dec((+pNu).toFixed(1)) : '–'}<small> ct</small></div><div class="o">${T('Kale prijs nu')}</div><div class="f"><span style="color:${GEELT}">HBC ${eur(a.kosten_hbc)}</span> · <span style="color:${BGT}">Batterijplan ${eur(a.kosten_plan)}</span><br>${T('stroomkosten tot')} ${tEind}</div></div><div class="mid"><div class="g" style="color:${ok}">${opb >= 0 ? '+' : ''}${eur(opb)}</div><div class="o">${T('Verwachte besparing t.o.v. HBC alleen')}</div></div><div class="re"><div class="g" style="color:${BGT}">${a.lading != null ? dec((+a.lading).toFixed(2)) : '–'}<small> kWh</small></div><div class="o">${T('In de batterij nu')}</div></div></div>`;
    this.shadowRoot.innerHTML = `<style>
      ha-card{padding:12px 14px}
      .k{display:flex;justify-content:flex-start;align-items:baseline;flex-wrap:wrap;gap:6px 18px}
      .t{font-size:16px;font-weight:600;color:var(--primary-text-color)}
      .s{font-size:13px;color:var(--secondary-text-color)}
      svg{width:100%;height:auto;display:block;margin-top:6px}
      .cw{position:relative;touch-action:pan-y;-webkit-user-select:none;user-select:none}
      .tip{position:absolute;top:10px;left:0;width:214px;display:none;pointer-events:none;z-index:2;will-change:transform;background:var(--card-background-color,#fff);color:var(--primary-text-color);border:1px solid var(--divider-color,rgba(148,163,184,.4));border-radius:8px;box-shadow:var(--ha-card-box-shadow,0 2px 8px rgba(0,0,0,.3));padding:6px 10px;font-size:12px;line-height:1.55;box-sizing:border-box}
      .tip .th{font-weight:600;margin-bottom:2px}.tip .tr{display:flex;justify-content:space-between;gap:10px;white-space:nowrap}.tip .tr span:first-child{color:var(--secondary-text-color)}.tip .tr i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:5px}
      .top{display:grid;grid-template-columns:1fr 1fr 1fr;align-items:end;gap:10px;margin-top:8px}
      .kader{border:1px solid rgba(148,163,184,.25);border-radius:8px;padding:6px 10px;justify-self:start}
      .mid{text-align:center}.re{text-align:right}
      .g{font-size:26px;font-weight:400;color:var(--primary-text-color);line-height:1.1}.g small{font-size:13px}
      .o{font-size:12px;color:var(--secondary-text-color);text-decoration:underline dotted;text-underline-offset:3px}
      .f{font-size:11px;color:var(--secondary-text-color);margin-top:4px;line-height:1.5}
      .l{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:11px;color:var(--secondary-text-color);margin-top:4px}
      .solo{cursor:pointer;user-select:none}.solo.uit{opacity:.35;text-decoration:line-through}.kl{cursor:pointer;user-select:none}.kl:hover{color:var(--primary-text-color)}.kl.uit{opacity:.35;text-decoration:line-through}
      .l i{display:inline-block;width:12px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px}
    </style><ha-card>
      <div class="k"><span class="t">${titel}</span>${w === 'samen' ? '' : `<span class="s">${kop}</span>`}</div>${w === 'samen' ? kop3 : ''}
      ${pts.length ? `<div class="cw"><svg viewBox="0 0 ${W} ${H}">${svg}</svg><div class="tip"></div></div>` : `<div class="s">${T('Nog geen berekening.')}</div>`}
      <div class="l">${legLijn}</div><div class="l">${legAct}</div>
    </ha-card>`;
    if (!this._ro && window.ResizeObserver) { this._ro = new ResizeObserver(() => { const cw = this.getBoundingClientRect().width; if (Math.abs(cw - (this._cw || 0)) > 20) { this._cw = cw; this._render(this._s); } }); this._ro.observe(this); }
    const f2 = v => (v == null || isNaN(v) ? '–' : dec((+v).toFixed(2)));
    const hvHtml = p => {
      const d = new Date(p[0] * 1000), tm = t => t.toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' });
      const row = (k, v) => `<div class="tr"><span>${T(k)}</span><b>${v}</b></div>`;
      const act = (k, c) => `<i style="background:${ACT[c]}"></i>${NAAM[c] || '–'}`;
      return `<div class="th">${d.toLocaleDateString(LOC, { weekday: 'short' })} ${tm(d)}–${tm(new Date(d.getTime() + 900000))}</div>`
        + row('Kale prijs', `${dec((+p[1]).toFixed(1))} ct`) + row('Zon verwacht', `${f2(p[7])} kW`) + row('Zon voorzichtig', `${f2(p[8])} kW`)
        + (toonH ? row('Lading HBC', `${f2(p[4])} kWh`) : '') + (toonP ? row('Lading Batterijplan', `${f2(p[6])} kWh`) : '')
        + (toonH ? row('Actie HBC', act('h', p[3])) : '') + (toonP ? row('Actie Batterijplan', act('p', p[5])) : '');
    };
    this._hover(pts, { W, L, xn, bw }, hvHtml);
    this.shadowRoot.querySelectorAll('.solo').forEach(el => el.addEventListener('click', () => {
      const k = el.dataset.solo;
      this._solo = this._solo === k ? null : k;
      this._render(this._s);
    }));
    this.shadowRoot.querySelectorAll('.kl').forEach(el => el.addEventListener('click', () => {
      const k = el.dataset.k;
      if (this._uit.has(k)) this._uit.delete(k); else this._uit.add(k);
      try { localStorage.setItem('bp_legenda_' + w, JSON.stringify([...this._uit])); } catch (e) {}
      this._render(this._s);
    }));
  }
}
if (!customElements.get('batterijplan-plan-card')) customElements.define('batterijplan-plan-card', BatterijplanPlanCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'batterijplan-plan-card', name: 'Batterijplan plan', description: 'HBC and Batterijplan chart (together or separate) and briefing' });
