// Batterijplan plan card: HBC and Batterijplan chart (weergave: samen | hbc | plan) and the briefing (weergave: briefing).
// Config: entity (default sensor.batterijplan), weergave, titel (optional), taal: nl | en | de (default: user profile).
// Areas (kWh / kW, right axis): solar forecast (purple), Batterijplan charge (teal), HBC charge (yellow dashed line).
// Price (ct, left axis): thin grey step line. Bar: HBC row (muted), Plan row (only where it differs).
// Rule switches: switch.batterijplan_regel_laden|ontladen|vasthouden|terugleveren|elk_kwartier|verkoopreserve.
const BP_PLAN_TX = {
  en: {
    'laden van het net': 'charge from the grid', 'ontladen': 'discharge', 'vasthouden': 'hold', 'terugleveren': 'feed in', 'niet laden / niet ontladen': 'no charge / no discharge', 'alleen zon / niets': 'solar only / nothing',
    'extra laden van het net': 'extra charge from the grid', 'extra ontladen': 'extra discharge', 'vasthouden voor later': 'hold for later',
    'Briefing en plan': 'Briefing and plan', 'HBC origineel': 'HBC original', 'klik: alleen deze / beide': 'click: only this / both', 'klik: tonen / verbergen': 'click: show / hide',
    'Nog geen berekening.': 'No calculation yet.', 'in de batterij': 'in the battery', 'Kwartier': 'Quarter', 'hetzelfde als HBC': 'same as HBC', 'HBC zou': 'HBC would', 'Tot': 'Until', 'einde': 'end of', 'verwacht': 'expected', 'verschil': 'difference',
    'Geen bijsturing nodig: Batterijplan doet hetzelfde als HBC.': 'No steering needed: Batterijplan does the same as HBC.',
    'Extra laden van het net': 'Extra charging from the grid', 'Ontladen buiten HBC-uren': 'Discharging outside HBC hours', 'Vasthouden voor later': 'Holding for later', 'Terugleveren': 'Feeding in', 'Laden in elk goedkoop kwartier': 'Charging in any cheap quarter', 'Verkoopreserve automatisch': 'Sell reserve automatic', 'aan': 'on', 'uit': 'off',
    'Waar Batterijplan bijstuurt': 'Where Batterijplan steers', 'Regels': 'Rules',
    'zon verwachting (kW)': 'solar forecast (kW)', 'lading Batterijplan (kWh)': 'charge Batterijplan (kWh)', 'lading HBC (kWh)': 'charge HBC (kWh)', 'prijs (ct)': 'price (ct)',
    'bijgestuurd kwartier (kleur = actie)': 'steered quarter (colour = action)', 'balk HBC': 'HBC bar', 'balk Plan': 'Plan bar', 'Nu': 'Now', 'Plan': 'Plan',
    'Kale prijs': 'Bare price', 'Zon verwacht': 'Solar expected', 'Zon voorzichtig': 'Solar cautious', 'Lading HBC': 'Charge HBC', 'Lading Batterijplan': 'Charge Batterijplan', 'Actie HBC': 'Action HBC', 'Actie Batterijplan': 'Action Batterijplan',
    'stroomkosten': 'electricity cost', 't.o.v. HBC': 'vs HBC', 'stroomkosten tot': 'electricity cost until', 'Kale prijs nu': 'Bare price now', 'Verwachte besparing t.o.v. HBC alleen': 'Expected saving versus HBC alone', 'Nog te besparen tot': 'Still to save until', 'vandaag': 'today', 'In de batterij nu': 'In the battery now',
  },
  de: {
    'laden van het net': 'aus dem Netz laden', 'ontladen': 'entladen', 'vasthouden': 'halten', 'terugleveren': 'einspeisen', 'niet laden / niet ontladen': 'nicht laden / nicht entladen', 'alleen zon / niets': 'nur Sonne / nichts',
    'extra laden van het net': 'zusätzlich aus dem Netz laden', 'extra ontladen': 'zusätzlich entladen', 'vasthouden voor later': 'für später halten',
    'Briefing en plan': 'Briefing und Plan', 'HBC origineel': 'HBC Original', 'klik: alleen deze / beide': 'Klick: nur diese / beide', 'klik: tonen / verbergen': 'Klick: anzeigen / ausblenden',
    'Nog geen berekening.': 'Noch keine Berechnung.', 'in de batterij': 'in der Batterie', 'Kwartier': 'Viertelstunde', 'hetzelfde als HBC': 'dasselbe wie HBC', 'HBC zou': 'HBC würde', 'Tot': 'Bis', 'einde': 'Ende', 'verwacht': 'erwartet', 'verschil': 'Differenz',
    'Geen bijsturing nodig: Batterijplan doet hetzelfde als HBC.': 'Kein Nachsteuern nötig: Batterijplan tut dasselbe wie HBC.',
    'Extra laden van het net': 'Zusätzliches Laden aus dem Netz', 'Ontladen buiten HBC-uren': 'Entladen außerhalb der HBC-Zeiten', 'Vasthouden voor later': 'Halten für später', 'Terugleveren': 'Einspeisen', 'Laden in elk goedkoop kwartier': 'In jeder günstigen Viertelstunde laden', 'Verkoopreserve automatisch': 'Verkaufsreserve automatisch', 'aan': 'an', 'uit': 'aus',
    'Waar Batterijplan bijstuurt': 'Wo Batterijplan nachsteuert', 'Regels': 'Regeln',
    'zon verwachting (kW)': 'Sonnenprognose (kW)', 'lading Batterijplan (kWh)': 'Ladung Batterijplan (kWh)', 'lading HBC (kWh)': 'Ladung HBC (kWh)', 'prijs (ct)': 'Preis (ct)',
    'bijgestuurd kwartier (kleur = actie)': 'nachgesteuerte Viertelstunde (Farbe = Aktion)', 'balk HBC': 'Balken HBC', 'balk Plan': 'Balken Plan', 'Nu': 'Jetzt', 'Plan': 'Plan',
    'Kale prijs': 'Reiner Preis', 'Zon verwacht': 'Sonne erwartet', 'Zon voorzichtig': 'Sonne vorsichtig', 'Lading HBC': 'Ladung HBC', 'Lading Batterijplan': 'Ladung Batterijplan', 'Actie HBC': 'Aktion HBC', 'Actie Batterijplan': 'Aktion Batterijplan',
    'stroomkosten': 'Stromkosten', 't.o.v. HBC': 'ggü. HBC', 'stroomkosten tot': 'Stromkosten bis', 'Kale prijs nu': 'Reiner Preis jetzt', 'Verwachte besparing t.o.v. HBC alleen': 'Erwartete Ersparnis gegenüber HBC allein', 'Nog te besparen tot': 'Noch zu sparen bis', 'vandaag': 'heute', 'In de batterij nu': 'Jetzt in der Batterie',
  },
};
// 2.0.0-dev1: Fixed contract (single / dual rate): the card shows tariffs instead of a plan (see _briefingVast / _renderVast)
Object.assign(BP_PLAN_TX.en, {
  'Vast contract, {x}.': 'Fixed contract, {x}.', 'Vast contract, {e} {p}.': 'Fixed contract, {e} {p}.', 'Nu {n} {p}.': 'Now {n} {p}.', 'Nu {d} {p}.': 'Now {d} {p}.',
  'Laden van het net vanaf {t} ({d} {p}).': 'Charging from the grid from {t} ({d} {p}).', 'Laden van het net tot {t}; daarna {n} {p}.': 'Charging from the grid until {t}; then {n} {p}.',
  'Weekend en feestdagen de hele dag dal.': 'Weekend and public holidays off-peak all day.',
  'Batterij op Self-consumption: eerst eigen zonne-energie, niet van het net laden.': 'Battery on Self-consumption: own solar first, no charging from the grid.',
  'Terugleveren levert {p} per kWh.': 'Feeding in earns {p} per kWh.', 'Maandpiek tot nu {m} kW, doelgrens {g} kW (minimum 2,5 kW).': 'Monthly peak so far {m} kW, target limit {g} kW (minimum 2.5 kW).',
  'Wat de batterij doet': 'What the battery does', 'HBC-strategie nu': 'HBC strategy now', 'Volgende wissel': 'Next change', '{d} vanaf {t}': '{d} from {t}', '{n} vanaf {t}': '{n} from {t}',
  'Alleen bij dynamisch contract': 'Only with a dynamic contract', 'Prijs nu': 'Price now', 'lading batterij (kWh)': 'battery charge (kWh)', 'Lading batterij': 'Battery charge',
  'Terugleververgoeding': 'Feed-in price', 'Tarief': 'Rate', 'Nu': 'Now', 'Nachtladen ({d})': 'Night charging ({d})',
  'Weekend en feestdagen als dal': 'Weekend and public holidays off-peak', 'Vlaanderen (capaciteitstarief)': 'Flanders (capacity tariff)',
  'Nu: dekt je huisverbruik (NOM)': 'Now: covers your house use (NOM)', 'Nu: laadt met zon': 'Now: charging with solar', 'Nu: laadt van het net (dal)': 'Now: charging from the grid (off-peak)',
  'Nu: batterij leeg, het huis draait op het net of de zon': 'Now: battery empty, the house runs on the grid or the sun', 'Nu: batterij vol': 'Now: battery full',
  'Nu: lading op het HBC-doel, niets te doen': 'Now: charge at the HBC target, nothing to do', 'verwacht leeg rond {t}': 'expected empty around {t}', 'verwacht vol rond {t}': 'expected full around {t}',
  '{a}–{b} laden van het net tot {x} kWh': '{a}–{b} charging from the grid up to {x} kWh', '{d} overdag NOM, zon vult bij': '{d} daytime NOM, sun tops up', '{d} overdag NOM': '{d} daytime NOM', 'vandaag': 'today', 'morgen': 'tomorrow',
  'lading gemeten (kWh)': 'measured charge (kWh)', 'lading verwacht (kWh)': 'expected charge (kWh)', 'ontladen voor huis (NOM)': 'discharging for the house (NOM)', 'laden met zon': 'charging with solar', 'niets (leeg of vol)': 'nothing (empty or full)',
  'Verwachte lading': 'Expected charge', 'Actie': 'Action',
  'Laden van het net levert niets op: verschil {v} ct, drempel {g} ct.': 'Charging from the grid does not pay: difference {v} ct, threshold {g} ct.',
  'Laden van het net in het dal vult de reserve voor pieken, onder de doelgrens.': 'Charging from the grid in the off-peak hours fills the reserve for peaks, below the target limit.',
  'uit (loont niet)': 'off (not worth it)', 'nachtladen loont niet ({v} < {g} ct)': 'night charging does not pay ({v} < {g} ct)'
});
Object.assign(BP_PLAN_TX.de, {
  'Vast contract, {x}.': 'Festvertrag, {x}.', 'Vast contract, {e} {p}.': 'Festvertrag, {e} {p}.', 'Nu {n} {p}.': 'Jetzt {n} {p}.', 'Nu {d} {p}.': 'Jetzt {d} {p}.',
  'Laden van het net vanaf {t} ({d} {p}).': 'Laden aus dem Netz ab {t} ({d} {p}).', 'Laden van het net tot {t}; daarna {n} {p}.': 'Laden aus dem Netz bis {t}; danach {n} {p}.',
  'Weekend en feestdagen de hele dag dal.': 'Wochenende und Feiertage ganztägig Nebenzeit.',
  'Batterij op Self-consumption: eerst eigen zonne-energie, niet van het net laden.': 'Batterie auf Self-consumption: zuerst eigener Solarstrom, kein Laden aus dem Netz.',
  'Terugleveren levert {p} per kWh.': 'Einspeisen bringt {p} pro kWh.', 'Maandpiek tot nu {m} kW, doelgrens {g} kW (minimum 2,5 kW).': 'Monatsspitze bisher {m} kW, Zielgrenze {g} kW (Minimum 2,5 kW).',
  'Wat de batterij doet': 'Was die Batterie tut', 'HBC-strategie nu': 'HBC-Strategie jetzt', 'Volgende wissel': 'Nächster Wechsel', '{d} vanaf {t}': '{d} ab {t}', '{n} vanaf {t}': '{n} ab {t}',
  'Alleen bij dynamisch contract': 'Nur bei dynamischem Vertrag', 'Prijs nu': 'Preis jetzt', 'lading batterij (kWh)': 'Batterieladung (kWh)', 'Lading batterij': 'Batterieladung',
  'Terugleververgoeding': 'Einspeisevergütung', 'Tarief': 'Tarif', 'Nu': 'Jetzt', 'Nachtladen ({d})': 'Nachtladen ({d})',
  'Weekend en feestdagen als dal': 'Wochenende und Feiertage als Nebenzeit', 'Vlaanderen (capaciteitstarief)': 'Flandern (Kapazitätstarif)',
  'Nu: dekt je huisverbruik (NOM)': 'Jetzt: deckt deinen Hausverbrauch (NOM)', 'Nu: laadt met zon': 'Jetzt: lädt mit Sonne', 'Nu: laadt van het net (dal)': 'Jetzt: lädt aus dem Netz (Nebenzeit)',
  'Nu: batterij leeg, het huis draait op het net of de zon': 'Jetzt: Batterie leer, das Haus läuft auf Netz oder Sonne', 'Nu: batterij vol': 'Jetzt: Batterie voll',
  'Nu: lading op het HBC-doel, niets te doen': 'Jetzt: Ladung am HBC-Ziel, nichts zu tun', 'verwacht leeg rond {t}': 'voraussichtlich leer gegen {t}', 'verwacht vol rond {t}': 'voraussichtlich voll gegen {t}',
  '{a}–{b} laden van het net tot {x} kWh': '{a}–{b} Laden aus dem Netz bis {x} kWh', '{d} overdag NOM, zon vult bij': '{d} tagsüber NOM, Sonne füllt auf', '{d} overdag NOM': '{d} tagsüber NOM', 'vandaag': 'heute', 'morgen': 'morgen',
  'lading gemeten (kWh)': 'gemessene Ladung (kWh)', 'lading verwacht (kWh)': 'erwartete Ladung (kWh)', 'ontladen voor huis (NOM)': 'Entladen fürs Haus (NOM)', 'laden met zon': 'Laden mit Sonne', 'niets (leeg of vol)': 'nichts (leer oder voll)',
  'Verwachte lading': 'Erwartete Ladung', 'Actie': 'Aktion',
  'Laden van het net levert niets op: verschil {v} ct, drempel {g} ct.': 'Laden aus dem Netz lohnt sich nicht: Unterschied {v} ct, Schwelle {g} ct.',
  'Laden van het net in het dal vult de reserve voor pieken, onder de doelgrens.': 'Laden aus dem Netz in der Nebenzeit füllt die Reserve für Spitzen, unter der Zielgrenze.',
  'uit (loont niet)': 'aus (lohnt nicht)', 'nachtladen loont niet ({v} < {g} ct)': 'Nachtladen lohnt sich nicht ({v} < {g} ct)'
});
// words per language and Home Assistant country: n = normal rate, d = off-peak rate, e = single rate, x = dual rate
const BP_VAST_WORDS = {
  nl: { nl: { n: 'normaaltarief', d: 'daltarief', e: 'enkeltarief', x: 'dubbeltarief' }, be: { n: 'dagprijs', d: 'nachtprijs', e: 'enkelvoudig', x: 'tweevoudig' }, de: { n: 'HT', d: 'NT', e: 'Eintarif', x: 'Zweitarif' } },
  en: { nl: { n: 'normal rate', d: 'off-peak rate', e: 'single rate', x: 'dual rate' }, be: { n: 'day price', d: 'night price', e: 'single rate', x: 'dual rate' }, de: { n: 'HT', d: 'NT', e: 'single rate', x: 'dual rate' } },
  de: { nl: { n: 'Normaltarif', d: 'Nebenzeittarif', e: 'Eintarif', x: 'Zweitarif' }, be: { n: 'Tagpreis', d: 'Nachtpreis', e: 'Eintarif', x: 'Zweitarif' }, de: { n: 'HT', d: 'NT', e: 'Eintarif', x: 'Zweitarif' } }
};
const BP_VAST_CSS = `
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
    `;
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
  _openVandaag() {
    if (this._pop) return;
    const self = this, taal = (this._c && this._c.taal) || 'nl';
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;background:rgba(0,0,0,.6);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:40px 12px;box-sizing:border-box;';
    const pn = document.createElement('div');
    pn.style.cssText = 'width:min(820px,100%);background:var(--card-background-color,#1c1c1c);border-radius:18px;padding:12px;box-shadow:0 8px 40px rgba(0,0,0,.6);box-sizing:border-box;';
    const kop = document.createElement('div'); kop.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';
    const mk = (tekst, rond) => { const b = document.createElement('button'); b.textContent = tekst; b.style.cssText = 'cursor:pointer;border:1px solid var(--divider-color,#555);background:transparent;color:var(--primary-text-color,#fff);font-size:13px;padding:' + (rond ? '6px 11px' : '5px 12px') + ';border-radius:' + (rond ? '50%' : '16px') + ';'; return b; };
    const sluit = () => { document.removeEventListener('keydown', esc); ov.remove(); self._pop = null; self._popCards = null; };
    const esc = (e) => { if (e.key === 'Escape') sluit(); };
    const terug = mk('‹ ' + ({ nl: 'Terug', en: 'Back', de: 'Zurück' }[taal] || 'Terug'), false), x = mk('✕', true);
    terug.addEventListener('click', sluit); x.addEventListener('click', sluit);
    kop.appendChild(terug); kop.appendChild(x); pn.appendChild(kop);
    this._popCards = ['batterijplan-dag-card', 'batterijplan-spaarlijn-card', 'batterijplan-dagen-card'].map((tag) => {
      const el = document.createElement(tag); el.style.cssText = 'display:block;margin-bottom:12px;';
      if (el.setConfig) el.setConfig({ taal }); if (self._h) el.hass = self._h; pn.appendChild(el); return el;
    });
    ov.addEventListener('click', (e) => { if (e.target === ov) sluit(); });
    ov.appendChild(pn); document.body.appendChild(ov); document.addEventListener('keydown', esc); this._pop = ov;
  }
  _eind(ts) { const L = BP_PLAN_LOC[this._lng()]; const d = new Date((ts + 900) * 1000); if (d.getHours() === 0 && d.getMinutes() === 0) return this._T('einde') + ' ' + new Date(ts * 1000).toLocaleDateString(L, { weekday: 'long' }) + ' (24:00)'; return d.toLocaleString(L, { weekday: 'short', hour: '2-digit', minute: '2-digit' }); }
  set hass(h) {
    this._h = h;
    if (this._popCards) this._popCards.forEach((e) => { e.hass = h; });
    // like the status card: with a second Batterijplan (sensor.batterijplan_2) the _2 one is the live one
    const id = this._c.entity === 'sensor.batterijplan' && h.states['sensor.batterijplan_2'] ? 'sensor.batterijplan_2' : this._c.entity;
    const s = h.states[id];
    const rg = ['laden', 'ontladen', 'vasthouden', 'terugleveren', 'elk_kwartier', 'verkoopreserve'].map(k => (h.states['switch.batterijplan_regel_' + k] || {}).state).join() + this._lng();
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
  // ---- Fixed contract (2.0.0-dev1) ----------------------------------------------------------------------------------
  _vastOf(s) { const a = s ? s.attributes : null; return a && a.contract && a.contract !== 'dynamisch' && a.vast && typeof a.vast === 'object' ? a.vast : null; }
  _wd() { const c = String(((this._h || {}).config || {}).country || '').toLowerCase(), co = ['nl', 'be', 'de'].includes(c) ? c : 'nl'; return BP_VAST_WORDS[this._lng()][co]; }
  _F(k, o) { return this._T(k).replace(/\{(\w+)\}/g, (m, x) => (o[x] != null ? o[x] : m)); }
  _eur(v) { const d = x => (this._lng() === 'en' ? x : String(x).replace('.', ',')); return v == null || isNaN(v) ? '–' : '€ ' + d((+v).toFixed(2)); }  // amounts on the dashboard: two decimals (the settings fields keep five)
  _wanneer(ts) { const L = BP_PLAN_LOC[this._lng()], d = new Date(ts * 1000), t = d.toLocaleTimeString(L, { hour: '2-digit', minute: '2-digit' }); return d.toDateString() === new Date().toDateString() ? t : d.toLocaleDateString(L, { weekday: 'short' }) + ' ' + t; }
  _levelNu() { const v = parseFloat(this._liveState().state); return Number.isFinite(v) ? v : null; }
  // the one-line story of the contract: price now, when charging from the grid starts or stops, weekend rule, feed-in, Flanders peak
  _vastTekst(vd) {
    const w = this._wd(), dec = x => (this._lng() === 'en' ? x : String(x).replace('.', ',')), dual = vd.tarief === 'dubbel', d = [];
    if (dual) {
      d.push(this._F('Vast contract, {x}.', { x: w.x }));
      const ld = vd.laden || { actief: true }, c1 = x => dec((+x).toFixed(1));
      // charging from the grid in the off-peak hours only when it pays (rate difference >= HBC's threshold), or in Flanders for the peak reserve
      if (vd.dal_nu) { d.push(this._F('Nu {d} {p}.', { d: w.d, p: this._eur(vd.prijs_nu) }));
        if (ld.actief && vd.volgende_wissel) d.push(this._F('Laden van het net tot {t}; daarna {n} {p}.', { t: this._wanneer(vd.volgende_wissel), n: w.n, p: this._eur(vd.prijs_normaal) })); }
      else { d.push(this._F('Nu {n} {p}.', { n: w.n, p: this._eur(vd.prijs_nu) }));
        if (ld.actief && vd.volgende_wissel) d.push(this._F('Laden van het net vanaf {t} ({d} {p}).', { t: this._wanneer(vd.volgende_wissel), d: w.d, p: this._eur(vd.prijs_dal) })); }
      if (!ld.actief) d.push(this._F('Laden van het net levert niets op: verschil {v} ct, drempel {g} ct.', { v: c1(ld.verschil_ct), g: c1(ld.drempel_ct) }));
      else if (ld.reden === 'vlaanderen' && +ld.verschil_ct < +ld.drempel_ct) d.push(this._T('Laden van het net in het dal vult de reserve voor pieken, onder de doelgrens.'));
      if (vd.weekend) d.push(this._T('Weekend en feestdagen de hele dag dal.'));
    } else {
      d.push(this._F('Vast contract, {e} {p}.', { e: w.e, p: this._eur(vd.prijs_nu) }));
      d.push(this._T('Batterij op Self-consumption: eerst eigen zonne-energie, niet van het net laden.'));
    }
    if (+vd.terugleverprijs > 0) d.push(this._F('Terugleveren levert {p} per kWh.', { p: this._eur(vd.terugleverprijs) }));
    const pk = ((this._h || {}).states || {})['sensor.batterijplan_piek_maand'], pw = pk ? parseFloat(pk.state) : NaN;
    if (vd.vlaanderen && Number.isFinite(pw)) d.push(this._F('Maandpiek tot nu {m} kW, doelgrens {g} kW (minimum 2,5 kW).', { m: dec((pw / 1000).toFixed(1)), g: dec((((pk.attributes || {}).doelgrens || 2500) / 1000).toFixed(1)) }));
    return d.join(' ');
  }
  // the switches of 2.0.0-dev1 in the RULES block: name + on / off only (no numbers or prices), and only when they belong to the chosen
  // contract: night charging and the weekend rule with Fixed + dual rate, Flanders only when it is on. Otherwise not shown at all.
  _nieuweRegels(a, ACT) {
    const T = k => this._T(k), S = (this._h || {}).states || {}, w = this._wd(), dual = !!a && a.contract === 'dag_nacht', st = id => (S[id] || {}).state === 'on';
    const row = (n, on) => `<div><span style="color:var(--secondary-text-color)">${n}</span> <b style="color:${on ? ACT.O : ACT.H}">${on ? T('aan') : T('uit')}</b></div>`;
    const ld = dual && a.vast && a.vast.laden ? a.vast.laden : null, pays = !ld || ld.actief;
    const nacht = pays ? row(this._F('Nachtladen ({d})', { d: w.d }), true)
      : `<div><span style="color:var(--secondary-text-color)">${this._F('Nachtladen ({d})', { d: w.d })}</span> <b style="color:${ACT.H}">${T('uit (loont niet)')}</b></div>`;
    return (dual ? nacht + row(T('Weekend en feestdagen als dal'), st('switch.batterijplan_dal_weekend')) : '')
      + (st('switch.batterijplan_vlaanderen') ? row(T('Vlaanderen (capaciteitstarief)'), true) : '');
  }
  // day word relative to now by calendar day: 'vandaag' only when the block is still on today's date, then 'morgen', then the weekday name
  _dagnaam(ts) {
    const d = new Date(ts * 1000), n = new Date(), L = BP_PLAN_LOC[this._lng()];
    const dd = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 86400000);
    return dd <= 0 ? this._T('vandaag') : (dd === 1 ? this._T('morgen') : d.toLocaleDateString(L, { weekday: 'long' }));
  }
  // the short timeline under 'What the battery does': from the simulated levels (see vastsim.py), real calculated values
  _tijdlijn(vd) {
    const tl = vd.tijdlijn; if (!tl) return '';
    const T = k => this._T(k), L = BP_PLAN_LOC[this._lng()], dec = x => (this._lng() === 'en' ? x : String(x).replace('.', ','));
    const tm = ts => new Date(ts * 1000).toLocaleTimeString(L, { hour: '2-digit', minute: '2-digit' });
    const lv = vd.niveau_nu, cap = +vd.capaciteit || 0, d = [];
    const nu = { O: 'Nu: dekt je huisverbruik (NOM)', Z: 'Nu: laadt met zon', L: 'Nu: laadt van het net (dal)' }[tl.nu];
    d.push(T(nu || (lv != null && lv <= 0.05 ? 'Nu: batterij leeg, het huis draait op het net of de zon' : (lv != null && cap && lv >= cap - 0.05 ? 'Nu: batterij vol' : 'Nu: lading op het HBC-doel, niets te doen'))));
    if (tl.leeg) d.push(this._F('verwacht leeg rond {t}', { t: this._wanneer(tl.leeg) }));
    else if (tl.vol && !(tl.dal && tl.dal.van <= tl.vol)) d.push(this._F('verwacht vol rond {t}', { t: this._wanneer(tl.vol) }));
    if (vd.laden && !vd.laden.actief) d.push(this._F('nachtladen loont niet ({v} < {g} ct)', { v: dec((+vd.laden.verschil_ct).toFixed(1)), g: dec((+vd.laden.drempel_ct).toFixed(1)) }));
    if (tl.dal && tl.dal.laadt) d.push(this._F('{a}–{b} laden van het net tot {x} kWh', { a: tm(tl.dal.van), b: tm(tl.dal.tot), x: dec((+tl.dal.naar).toFixed(1)) }));
    if (tl.dag && tl.dag.dag_ts) {
      d.push(this._F(tl.dag.zon ? '{d} overdag NOM, zon vult bij' : '{d} overdag NOM', { d: this._dagnaam(tl.dag.dag_ts) }));
    }
    return d.join(' · ');
  }
  _briefingVast(s, vd) {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const LICHT = !!(this._h && this._h.themes && this._h.themes.darkMode === false); const BG = LICHT ? '#05a1bb' : '#06B6D4', BGT = LICHT ? '#047f94' : BG, ACT = LICHT ? '#1dab52' : '#22c55e';
    const T = k => this._T(k), w = this._wd(), dec = x => (this._lng() === 'en' ? x : String(x).replace('.', ','));
    const lv = this._levelNu(), dual = vd.tarief === 'dubbel';
    const strat = vd.strategie === 'Charge' ? `Charge (${w.d})` : (dual ? `Self-consumption (${vd.dal_nu ? w.d : w.n})` : 'Self-consumption');
    const rij = (kl, txt) => `<div class="r"><i style="background:${kl}"></i><span>${txt}</span></div>`;
    let lijst = rij(BG, `<b>${lv != null ? dec(lv.toFixed(1)) : '–'} kWh</b> ${T('in de batterij')}`) + rij(ACT, `${T('HBC-strategie nu')}: <b>${bpEsc(strat)}</b>`);
    const tlTxt = this._tijdlijn(vd); if (tlTxt) lijst += rij('#8b5cf6', bpEsc(tlTxt));
    if (dual && vd.volgende_wissel) lijst += rij('#8b5cf6', `${T('Volgende wissel')}: <b>${this._F(vd.dal_nu ? '{n} vanaf {t}' : '{d} vanaf {t}', { n: w.n, d: w.d, t: this._wanneer(vd.volgende_wissel) })}</b>`);
    const RG = [['laden', T('Extra laden van het net')], ['ontladen', T('Ontladen buiten HBC-uren')], ['vasthouden', T('Vasthouden voor later')], ['terugleveren', T('Terugleveren')], ['elk_kwartier', T('Laden in elk goedkoop kwartier')], ['verkoopreserve', T('Verkoopreserve automatisch')]];
    const a = s ? s.attributes : {}, ACTC = { O: ACT, H: LICHT ? '#ca8208' : '#f59e0b' };
    const regels = RG.map(([k, n]) => { const on = ((this._h && this._h.states['switch.batterijplan_regel_' + k]) || {}).state !== 'off'; return `<div style="opacity:.45"><span style="color:var(--secondary-text-color)">${n}</span> <b style="color:${on ? ACTC.O : ACTC.H}">${on ? T('aan') : T('uit')}</b></div>`; }).join('')
      + `<div class="rn">${T('Alleen bij dynamisch contract')}</div>` + this._nieuweRegels(a, ACTC);
    this.shadowRoot.innerHTML = `<style>
      ha-card{padding:12px 16px}
      .t{font-size:16px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px}
      .b{display:grid;grid-template-columns:1fr auto;gap:6px 24px;align-items:start;border-left:3px solid ${BG};background:rgba(6,182,212,.08);padding:8px 12px;border-radius:6px;font-size:13px;line-height:1.6;color:var(--primary-text-color)}
      .rg{font-size:12px;line-height:1.7;white-space:nowrap}.rh{font-size:11px;letter-spacing:.06em;color:var(--secondary-text-color)}.rn{font-size:11px;font-style:italic;color:var(--secondary-text-color);margin:0 0 4px;white-space:normal;max-width:190px;opacity:.8}
      @media (max-width:700px){.b{grid-template-columns:1fr}}
      .h{font-size:11px;letter-spacing:.06em;color:var(--secondary-text-color);margin:12px 0 4px}
      .r{display:flex;align-items:baseline;gap:8px;padding:5px 0;border-bottom:1px solid rgba(148,163,184,.12);font-size:13px}
      .r i{width:10px;height:10px;border-radius:2px;flex:none;display:inline-block}
    </style><ha-card>
      <div class="t">${bpEsc(this._c.titel || T('Briefing en plan'))}</div>
      <div class="b"><div>${bpEsc(this._vastTekst(vd))}</div><div class="rg"><div class="rh">${T('Regels').toUpperCase()}</div>${regels}</div></div>
      <div class="h">${T('Wat de batterij doet').toUpperCase()}</div>
      ${lijst}
    </ha-card>`;
  }
  _renderVast(s, vd) {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const LICHT = !!(this._h && this._h.themes && this._h.themes.darkMode === false); const BG = LICHT ? '#05a1bb' : '#06B6D4', BGT = LICHT ? '#047f94' : BG, ZON = '#8b5cf6', DAL = '#6366f1';
    const T = k => this._T(k), LOC = BP_PLAN_LOC[this._lng()], w = this._wd(), dec = x => (this._lng() === 'en' ? x : String(x).replace('.', ','));
    const rows = Array.isArray(vd.kwartieren) ? vd.kwartieren : [], hist = Array.isArray(vd.lading) ? vd.lading : [], dual = vd.tarief === 'dubbel', sim = Array.isArray(vd.sim) ? vd.sim : [];
    const AC = LICHT ? { L: '#3b82f6', O: '#1dab52', Z: '#ca8208' } : { L: '#3b82f6', O: '#22c55e', Z: '#f59e0b' };  // same colours as the legend of the plan chart
    const W = Math.max(480, Math.round((this.getBoundingClientRect().width || 748) - 28)), H = 272, L = 14, R = 30, Tp = 22, B = 48;
    const iw = W - L - R, ih = H - Tp - B, n = rows.length || 1, bw = iw / n, first = rows.length ? rows[0][0] : 0;
    const lv = this._levelNu(), nowTs = Date.now() / 1000;
    const cap = Math.max(9, Math.ceil(Math.max(0, ...rows.map(r => r[1]), ...hist.map(h => h[1]), ...sim.map(r => r[1]), lv || 0) / 3) * 3);
    const yE = v => Tp + ih - v / cap * ih, x0 = L, xn = L + n * bw, y0 = yE(0);
    let svg = '';
    for (let k = 0; k <= cap; k += 3) svg += `<line x1="${x0}" x2="${xn}" y1="${yE(k)}" y2="${yE(k)}" stroke="rgba(148,163,184,.10)" stroke-dasharray="2 4"/>`;
    // off-peak hours as a background band (instead of prices)
    let run = null;
    rows.forEach((r, i) => { const dl = dual && r[2]; if (dl && run == null) run = i; if ((!dl || i === rows.length - 1) && run != null) { const e = dl ? i + 1 : i; svg += `<rect x="${L + run * bw}" y="${Tp}" width="${(e - run) * bw}" height="${ih}" fill="${DAL}" fill-opacity=".16"/>`; run = null; } });
    const zp = rows.map((r, i) => [L + (i + 0.5) * bw, yE(r[1] || 0)]);
    if (zp.length > 1 && rows.some(r => (r[1] || 0) > 0.01)) { const d = this._glad(zp); svg += `<path d="${d}L${zp[zp.length - 1][0]},${y0}L${zp[0][0]},${y0}Z" fill="rgba(139,92,246,.40)"/><path d="${d}" fill="none" stroke="${ZON}" stroke-width="2.5"/>`; }
    const lp = hist.map(h => [L + ((h[0] - first) / 900 + 0.5) * bw, yE(h[1])]).filter(q => q[0] >= x0 && q[0] <= xn);
    const xNu = Math.min(xn, Math.max(x0, L + ((nowTs - first) / 900) * bw));
    if (lv != null) lp.push([xNu, yE(lv)]);
    if (lp.length > 1) { const d = this._glad(lp); svg += `<path d="${d}L${lp[lp.length - 1][0]},${y0}L${lp[0][0]},${y0}Z" fill="rgba(6,182,212,.30)"/><path d="${d}" fill="none" stroke="${BG}" stroke-width="2.5"/>`; }
    // expected level: dashed line from now on, one coloured bar per quarter with the action
    if (sim.length && lv != null) {
      const sp = [[xNu, yE(lv)]].concat(sim.map(r => [L + ((r[0] - first) / 900 + 1) * bw, yE(r[1])])).filter(q => q[0] <= xn + 0.5);
      if (sp.length > 1) svg += `<path d="${this._glad(sp)}" fill="none" stroke="${BG}" stroke-width="2.2" stroke-dasharray="6 4"/>`;
      sim.forEach(r => { const x = L + (r[0] - first) / 900 * bw; if (x + bw <= xn + 0.5) svg += `<rect x="${x}" y="${y0 + 6}" width="${bw + 0.2}" height="9" fill="${AC[r[2]] || 'rgba(148,163,184,.10)'}"/>`; });
    }
    if (lp.length) svg += `<circle cx="${lp[lp.length - 1][0]}" cy="${lp[lp.length - 1][1]}" r="4" fill="${BG}"/>`;
    svg += `<line x1="${x0}" x2="${xn}" y1="${y0}" y2="${y0}" stroke="rgba(148,163,184,.35)"/>`;
    svg += `<line class="hl" x1="0" x2="0" y1="${Tp}" y2="${H - B}" stroke="var(--secondary-text-color)" stroke-width="1" visibility="hidden" pointer-events="none"/>`;
    svg += `<line x1="${xNu}" x2="${xNu}" y1="${Tp}" y2="${y0}" stroke="${BG}" stroke-width="1.5"/><rect x="${xNu - 13}" y="${Tp - 11}" width="26" height="13" rx="3" fill="#0e7490"/><text x="${xNu}" y="${Tp - 1}" font-size="9" text-anchor="middle" fill="#fff">${T('Nu')}</text>`;
    rows.forEach((r, i) => { if (i % 12 === 0) { const x = L + i * bw, tl = new Date(r[0] * 1000).toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' });
      svg += `<line x1="${x}" x2="${x}" y1="${Tp}" y2="${y0}" stroke="rgba(148,163,184,.10)" stroke-dasharray="2 4"/><text x="${x}" y="${H - 8}" font-size="10" fill="var(--secondary-text-color)">${tl}</text>`; } });
    for (let k = 0; k <= cap; k += 3) svg += `<text x="${W - R + 4}" y="${yE(k) + 3}" font-size="10" fill="var(--secondary-text-color)">${k}</text>`;
    const i = (k, t, lijn) => `<span><i style="background:${k}${lijn ? ';height:3px;vertical-align:3px' : ''}"></i>${t}</span>`;
    const leg = i('rgba(139,92,246,.7)', T('zon verwachting (kW)')) + i(BG, T('lading gemeten (kWh)')) + (sim.length ? i(BG, T('lading verwacht (kWh)'), 1) : '') + (dual ? i('rgba(99,102,241,.5)', bpEsc(w.d)) : '');
    const legAct = sim.length ? ['L', 'O', 'Z'].map(k => i(AC[k], T({ L: 'laden van het net', O: 'ontladen voor huis (NOM)', Z: 'laden met zon' }[k]))).join('') + i('rgba(148,163,184,.35)', T('niets (leeg of vol)')) : '';
    const titel = this._c.titel ? bpEsc(this._c.titel) : `<span style="color:${BGT}">Batterijplan</span>`;
    const second = dual ? `<div class="f">${bpEsc(this._F(vd.dal_nu ? '{n} vanaf {t}' : '{d} vanaf {t}', { n: w.n + ' ' + this._eur(vd.prijs_normaal), d: w.d + ' ' + this._eur(vd.prijs_dal), t: vd.volgende_wissel ? this._wanneer(vd.volgende_wissel) : '–' }))}</div>` : '';
    const top = `<div class="top vast"><div class="kader"><div class="g">${this._eur(vd.prijs_nu)}<small> /kWh</small></div><div class="o">${T('Prijs nu')} · ${bpEsc(dual ? (vd.dal_nu ? w.d : w.n) : w.e)}</div>${second}</div>
      <div class="re"><div class="g" style="color:${BGT}">${lv != null ? dec(lv.toFixed(2)) : '–'}<small> kWh</small></div><div class="o">${T('In de batterij nu')}</div>${+vd.terugleverprijs > 0 ? `<div class="f">${T('Terugleververgoeding')} ${this._eur(vd.terugleverprijs)}</div>` : ''}</div></div>`;
    this.shadowRoot.innerHTML = `<style>${BP_VAST_CSS}
      .top.vast{grid-template-columns:1fr 1fr}</style><ha-card>
      <div class="k"><span class="t">${titel}</span></div>${top}
      ${rows.length ? `<div class="cw"><svg viewBox="0 0 ${W} ${H}">${svg}</svg><div class="tip"></div></div>` : `<div class="s">${T('Nog geen berekening.')}</div>`}
      <div class="l">${leg}</div>${legAct ? `<div class="l">${legAct}</div>` : ''}
    </ha-card>`;
    if (!this._ro && window.ResizeObserver) { this._ro = new ResizeObserver(() => { const cw = this.getBoundingClientRect().width; if (Math.abs(cw - (this._cw || 0)) > 20) { this._cw = cw; this._render(this._s); } }); this._ro.observe(this); }
    const f2 = v => (v == null || isNaN(v) ? '–' : dec((+v).toFixed(2)));
    const hvHtml = r => {
      const d = new Date(r[0] * 1000), tm = t => t.toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' });
      const row = (k, v) => `<div class="tr"><span>${T(k)}</span><b>${v}</b></div>`;
      const near = hist.filter(h => Math.abs(h[0] - r[0]) <= 450)[0], sr = sim.filter(x => x[0] === r[0])[0];
      return `<div class="th">${d.toLocaleDateString(LOC, { weekday: 'short' })} ${tm(d)}–${tm(new Date(d.getTime() + 900000))}</div>`
        + row('Tarief', bpEsc(dual ? (r[2] ? w.d + ' ' + this._eur(vd.prijs_dal) : w.n + ' ' + this._eur(vd.prijs_normaal)) : w.e + ' ' + this._eur(vd.prijs_nu)))
        + row('Zon verwacht', `${f2(r[1])} kW`) + (near ? row('Lading batterij', `${f2(near[1])} kWh`) : '')
        + (sr ? row('Verwachte lading', `${f2(sr[1])} kWh`) + row('Actie', `<i style="background:${AC[sr[2]] || 'rgba(148,163,184,.35)'}"></i>${T({ L: 'laden van het net', O: 'ontladen voor huis (NOM)', Z: 'laden met zon', N: 'niets (leeg of vol)' }[sr[2]] || 'niets (leeg of vol)')}`) : '');
    };
    this._hover(rows, { W, L, xn, bw }, hvHtml);
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
        + `<br>${T('Tot')} ${this._eind(pts[pts.length - 1][0])}: HBC <span style="color:${GEELT}">${eur(a.kosten_hbc)}</span>, Batterijplan <span style="color:${BGT}">${eur(a.kosten_plan)}</span>, ${T('verschil')} <b style="color:${opb >= 0 ? ACT.O : ACT.H}">${opb >= 0 ? '+' : ''}${eur(opb)}</b>.`;
      const runs = [];
      pts.forEach(q => { const k = q[5] !== q[3] ? q[5] : null; const l = runs[runs.length - 1]; if (l && l.k === k) { l.e = q; l.p.push(q[1]); } else runs.push({ k, b: q, e: q, p: [q[1]] }); });
      const bij = runs.filter(r => r.k).slice(0, 16);
      lijst = bij.length ? bij.map(r => { const mn = Math.min(...r.p), mx = Math.max(...r.p);
        return `<div class="r"><i style="background:${ACT[r.k]}"></i><b>${dag(r.b[0])} ${tijd(r.b[0])}–${tijd(r.e[0] + 900)}</b> <span>${NAAMB[r.k]} (${mn === mx ? dec(mn) : dec(mn) + '–' + dec(mx)} ct)</span></div>`; }).join('')
        : '<div class="r"><span>' + T('Geen bijsturing nodig: Batterijplan doet hetzelfde als HBC.') + '</span></div>';
    }
    const RG = [['laden', T('Extra laden van het net')], ['ontladen', T('Ontladen buiten HBC-uren')], ['vasthouden', T('Vasthouden voor later')], ['terugleveren', T('Terugleveren')], ['elk_kwartier', T('Laden in elk goedkoop kwartier')], ['verkoopreserve', T('Verkoopreserve automatisch')]];
    const vrs = a && a.verkoopreserve && typeof a.verkoopreserve === 'object' ? a.verkoopreserve : null;  // 2.0.0: chosen sell reserve
    const vrk = vrs && vrs.actief && vrs.kwh !== null && vrs.kwh !== undefined && Number.isFinite(Number(vrs.kwh)) ? ` · ${dec(Number(vrs.kwh).toFixed(1))} kWh` : '';
    const regels = RG.map(([k, n]) => { const on = ((this._h && this._h.states['switch.batterijplan_regel_' + k]) || {}).state !== 'off'; return `<div><span style="color:var(--secondary-text-color)">${n}</span> <b style="color:${on ? ACT.O : ACT.H}">${on ? T('aan') : T('uit')}</b>${k === 'verkoopreserve' && on ? vrk : ''}</div>`; }).join('') + this._nieuweRegels(a, ACT);
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
    const vd = this._vastOf(s);
    if (vd) { if (this._c.weergave === 'briefing') this._briefingVast(s, vd); else this._renderVast(s, vd); return; }
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
    const tEind = pts.length ? this._eind(pts[pts.length - 1][0]) : '';
    // 14-11-2026 (Adrie): the figure runs from now to the end of the plan, so say until when (today or the named day)
    const tNog = (() => { if (!pts.length) return ''; const ls = pts[pts.length - 1][0], e = new Date((ls + 900) * 1000), d = new Date(ls * 1000);
      if (e.getHours() !== 0 || e.getMinutes() !== 0) return tEind;
      return T('einde') + ' ' + (d.toDateString() === new Date().toDateString() ? T('vandaag') : d.toLocaleDateString(LOC, { weekday: 'long' })) + ' (24:00)'; })();
    const kop3 = `<div class="top"><div class="kader"><div class="g">${pNu != null ? dec((+pNu).toFixed(1)) : '–'}<small> ct</small></div><div class="o">${T('Kale prijs nu')}</div><div class="f"><span style="color:${GEELT}">HBC ${eur(a.kosten_hbc)}</span> · <span style="color:${BGT}">Batterijplan ${eur(a.kosten_plan)}</span><br>${T('stroomkosten tot')} ${tEind}</div></div><div class="mid"><div class="g" style="color:${ok}">${opb >= 0 ? '+' : ''}${eur(opb)}</div><div class="o">${T('Nog te besparen tot')} ${tNog}</div></div><div class="re">${(() => {
      const ls = this._liveState() || {};
      const real = parseFloat(ls.state);
      // never a deviation when the expected level is unknown or 0 (Number(null) is 0: that gave "+610 %" without a plan)
      const e0 = (ls.attributes || {}).lading_plan, eP = e0 != null ? Number(e0) : (a.lading != null ? Number(a.lading) : NaN);
      const e = Number.isFinite(eP) && eP > 0 ? eP : NaN;
      if (!Number.isFinite(real) || !Number.isFinite(e)) return `<div class="g" style="color:${BGT}">${Number.isFinite(real) ? dec(real.toFixed(2)) : (a.lading != null ? dec((+a.lading).toFixed(2)) : '–')}<small> kWh</small></div><div class="o">${T('In de batterij nu')}</div>`;
      const dev = (real - e) / Math.max(e, 1);
      const kl = dev > 0.10 ? '#a855f7' : dev < -0.25 ? '#ef4444' : dev < -0.10 ? '#f97316' : '#1dab52';
      const pct = Math.round(dev * 100);
      return `<div class="g" style="color:${kl}">${dec(real.toFixed(2))}<small> kWh</small></div><div class="o">${T('In de batterij nu')}</div><div class="o" style="color:${kl}">${T('verwacht')} ${dec(e.toFixed(2))} kWh (${pct > 0 ? '+' : ''}${pct} %)</div>`;
    })()}</div></div>`;
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
    const midEl = this.shadowRoot.querySelector('.mid');
    if (midEl) { midEl.style.cursor = 'pointer'; midEl.title = ({ nl: 'Tik voor vandaag in detail', en: 'Tap for today in detail', de: 'Tippen für heute im Detail' })[this._lng()] || ''; midEl.addEventListener('click', () => this._openVandaag()); }
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
