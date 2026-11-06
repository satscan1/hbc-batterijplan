// Offline test: nothing from card config, states or attributes reaches innerHTML unescaped (node tests/test_escaping.mjs)
// HESC was rejected for exactly this: an `icon` from the card config went into innerHTML.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'custom_components', 'batterijplan', 'frontend');
const P = `"'<i id=BPXSS>`;  // breaks out of attributes (both quotes) and of text (tag)
const writes = [];
const mkEl = (name) => { const e = { _h: '', style: { setProperty() {} }, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, textContent: '', value: '',
  set innerHTML(v) { writes.push([name, String(v)]); this._h = v; }, get innerHTML() { return this._h; },
  addEventListener() {}, removeEventListener() {}, appendChild() {}, remove() {}, setAttribute() {}, getBoundingClientRect: () => ({ left: 0, width: 800, top: 0, height: 300 }),
  querySelectorAll: () => [], querySelector: () => mkEl(name + '>'), nextElementSibling: null, firstChild: null };
  return e; };
globalThis.HTMLElement = class { constructor() { this.style = {}; } };
const defined = {};
globalThis.customElements = { get: () => null, define(n, c) { defined[n] = c; }, whenDefined: () => Promise.resolve() };
globalThis.window = globalThis; globalThis.customCards = [];
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { addEventListener() {}, removeEventListener() {}, createElement: () => mkEl('doc'), body: mkEl('body') };
globalThis.location = { origin: 'http://ha' };
globalThis.setInterval = () => 0; globalThis.clearInterval = () => {}; globalThis.requestAnimationFrame = (f) => { f(); return 0; };
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.loadCardHelpers = async () => ({ createCardElement: () => mkEl('card') });
for (const f of ['batterijplan-cards.js', 'batterijplan-plan-card.js']) (0, eval)(fs.readFileSync(path.join(dir, f), 'utf8'));

const T0 = Math.floor(Date.UTC(2026, 10, 6, 10, 0) / 1000);
const pts = Array.from({ length: 8 }, (_, i) => [T0 + i * 900, P, 0, i === 1 ? P : 'Z', P, i === 2 ? 'L' : P, P, P, P]);
const evil = { friendly_name: P, unit_of_measurement: P, icon: P, options: [P, 'b'], min: 0, max: 10, step: 1, versie: P, actie: P, hbc_actie: P, modus: P, hbc_strategie: P, sinds: P, periode_start: P,
  eur_live: P, eur_schaduw: P, kwartieren_ontladen: P, kwartieren_vastgehouden: P, kwartieren_teruggeleverd: P, lading: P, kosten_hbc: P, kosten_plan: P,
  punten: pts, komend_kwartier: P, bijladen: 'true', nachtladen_kwh: 5, bijladen_kwartieren: [P], status: P, cheapest_advies: P, berekend: P, duur_s: P, n: [P], uur: [P], voorspelling: P };
const ids = ['sensor.batterijplan', 'sensor.batterijplan_2', 'sensor.batterijplan_meerwaarde', 'sensor.batterijplan_meerwaarde_periode', 'sensor.batterijplan_lading', 'sensor.batterijplan_voorspelling',
  'sensor.batterijplan_verbruiksprofiel', 'sensor.batterijplan_advies_hbc', 'sensor.batterijplan_advies_zon_na_goedkoop_laden', 'sensor.batterijplan_prijs', 'sensor.batterijplan_huisverbruik',
  'switch.batterijplan_live', 'switch.batterijplan_hbc_auto', 'input_select.house_battery_strategy', 'input_number.house_battery_solar_reserved_for_house', 'number.batterijplan_capaciteit',
  'select.batterijplan_hbc_prijzen', 'text.batterijplan_sensor_net', 'date.batterijplan_contractstart', 'sensor.' + P, 'sensor.evil'];
const states = {};
for (const id of ids) states[id] = { entity_id: id, state: P, attributes: { ...evil }, last_changed: new Date().toISOString(), last_updated: new Date().toISOString() };
states['switch.batterijplan_live'].state = 'on';
const hass = { language: 'nl', locale: { language: 'nl' }, config: { version: P }, states, callWS: () => new Promise(() => {}), callService() {} };

const cfg = { title: P, titel: P, icon: P, color: P, logo: P, info: P, taal: 'nl', live: 'switch.batterijplan_live', entity: 'sensor.batterijplan',
  perioden: true,
  knoppen: [{ naam: P, melding: P, kaarten: [] }],
  tabs: [{ naam: P, sub: P, kleur: P, rows: [] }],
  rows: [{ type: 'section', name: P }, { type: 'actie', name: P, label: P, warn: P, note: P, danger: true, hint: P, info: P },
    { entity: 'number.batterijplan_capaciteit', name: P, hint: P, info: P }, { entity: 'number.batterijplan_capaciteit', name: P, kind: 'stepper' },
    { entity: 'select.batterijplan_hbc_prijzen', name: P, labels: { [P]: P } }, { entity: 'text.batterijplan_sensor_net', name: P, pick: true, suggest: [P] },
    { entity: 'switch.batterijplan_live', name: P }, { entity: 'date.batterijplan_contractstart', name: P }] };
cfg.tabs[0].rows = cfg.rows;

let rendered = 0;
for (const [name, Cls] of Object.entries(defined)) {
  for (const weergave of name === 'batterijplan-plan-card' ? ['samen', 'hbc', 'plan', 'briefing'] : [undefined]) {
    for (const variant of [{}, { perioden: false }, { tabs: undefined }]) {
      const c = new Cls(); const root = mkEl(name);
      Object.defineProperty(c, 'shadowRoot', { value: root, writable: true, configurable: true }); c.attachShadow = () => {};
      c.getBoundingClientRect = () => ({ width: 828 });
      try { c.setConfig({ ...cfg, ...variant, ...(weergave ? { weergave } : {}) }); c.hass = hass; if (c._render && !c._hass) { c._hass = hass; c._render(); } rendered++; }
      catch (e) { if (process.env.BP_DEBUG) console.log(name, weergave || '', JSON.stringify(Object.keys(variant)), String(e.stack).split('\n').slice(0, 2).join(' ')); }
      if (c._hover && c._hass === undefined) { /* plan card */ }
    }
  }
}
assert.ok(writes.length > 20, 'the cards wrote HTML (' + writes.length + ' writes, ' + rendered + ' renders)');
const rawAt = (h) => { const i = h.indexOf('<i id=BPXSS'); return i >= 0 ? i : h.indexOf(P); };
const bad = writes.filter(([, h]) => rawAt(h) >= 0);
assert.deepEqual(bad.map(([n, h]) => n + ': ' + h.slice(Math.max(0, rawAt(h) - 100), rawAt(h) + 30)), [], 'unescaped config/state/attribute in innerHTML');
// the report builder too (it writes a whole HTML page)
const html = await (async () => { const c = new defined['batterijplan-rapport'](); const root = mkEl('rap'); const body = mkEl('rapbody'); const msg = mkEl('msg'); let btn = null;
  Object.defineProperty(c, 'shadowRoot', { value: { ...root, querySelector: (q) => (q === '.body' ? body : q === "[data-r='bekijk']" ? (btn ||= { ...mkEl('b'), addEventListener(k, f) { this.on = f; } }) : mkEl(q)), querySelectorAll: () => [], appendChild() {} }, writable: true });
  body.querySelector = (q) => (q === "[data-r='bekijk']" ? (btn ||= { ...mkEl('b'), addEventListener(k, f) { this.on = f; } }) : q === '.rmsg' ? msg : mkEl(q));
  c.attachShadow = () => {}; c.setConfig({ title: 'R', taal: 'nl' }); c._hass = hass; c._body = body; c._render();
  let out = ''; globalThis.window.open = () => ({ document: { open() {}, write(h) { out = h; }, close() {} } }); btn.on();
  for (let i = 0; i < 60 && !out.includes('<html'); i++) await new Promise((r) => setTimeout(r, 20)); return out; })();
assert.ok(html.includes('<html'), 'report built');
assert.ok(!html.includes('<i id=BPXSS') && !html.includes(P), 'report: everything escaped');
console.log('test_escaping ok:', writes.length, 'innerHTML writes,', rendered, 'renders');
// the plan card must have rendered (title from config escaped, plan points reduced to numbers and action letters)
const pc = writes.filter(([n]) => n === 'batterijplan-plan-card');
assert.ok(pc.length >= 4 && pc.every(([, h]) => h.includes('&lt;i id=BPXSS&gt;')), 'plan card rendered with the escaped title');
