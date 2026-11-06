// Offline test of the "Advies voor HBC" card and the orange dot on its button (node, no browser): node tests/test_advice_card.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'custom_components', 'batterijplan', 'frontend', 'batterijplan-cards.js'), 'utf8');
globalThis.HTMLElement = class {};
const defined = {};
globalThis.customElements = { get: () => null, define(n, c) { defined[n] = c; } };
globalThis.window = globalThis; globalThis.customCards = [];
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { addEventListener() {}, removeEventListener() {}, createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }) };
globalThis.setInterval = () => 0; globalThis.clearInterval = () => {};
(0, eval)(src);

function mkCard(states, lang = 'nl') {
  const Adv = defined['batterijplan-advies'];
  const c = new Adv();
  const els = {};
  const el = (sel) => (els[sel] ||= { _h: '', style: {}, set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; }, addEventListener() {}, querySelector() { return null; }, classList: { add() {}, remove() {} } });
  const calls = [];
  c.shadowRoot = { set innerHTML(v) {}, get innerHTML() { return ''; }, querySelector: (q) => { const e = el(q); if (q === '.body') { e.querySelector = (s) => s === '[data-auto]' && e._h.includes('data-auto') ? { addEventListener(_k, f) { e.click = f; } } : null; } return e; }, querySelectorAll: () => [] };
  c.attachShadow = () => {};
  c.setConfig({ title: 'Advies voor HBC', taal: lang });
  c._hass = { language: lang, states, callService: (d, s, p) => calls.push([d, s, p]), callWS: () => new Promise(() => {}) };
  c._render();
  return { c, body: els['.body'], calls };
}
const adv = (extra) => ({ state: 'berekend', attributes: { dag: 7, dagen: 7, van: 7, berekend: '2026-11-07T03:10:12+01:00', duur_s: 8.2, besparing: 0.42,
  cheapest_nu: 8, cheapest_advies: 5, cheapest_verschil: true, expensive_nu: 8, expensive_advies: 8, expensive_verschil: false,
  solar_nu: 8, solar_advies: 8.5, solar_verschil: true, ...extra } });
const base = { 'sensor.batterijplan_advies_zon_na_goedkoop_laden': { state: '8', attributes: { voorlopig: false } }, 'switch.batterijplan_hbc_auto': { state: 'off' } };

// ready: three rows, current vs advice, orange dot where it differs, also with the switch off
let r = mkCard({ ...base, 'sensor.batterijplan_advies_hbc': adv() });
let h = r.body.innerHTML;
for (const w of ['Aantal goedkope uren', 'Aantal dure uren', 'Huisverbruik op zon', 'cheapest hrs', 'expensive hrs', 'Solar reserved for house', '5 h']) assert.ok(h.includes(w), 'missing ' + w);
assert.match(h, /8[.,]5 kWh/);
assert.equal((h.match(/border-radius:50%;background:#ff9800/g) || []).length, 2, 'dot on cheapest and solar only');
assert.match(h, /€ 0[.,]42 goedkoper dan nu/, 'one-line reason with the saving');
assert.ok(h.includes('Past het best bij de laatste 7 dagen.'), 'expensive row: current is best');
assert.ok(h.includes('data-auto') && h.includes('>uit<'), 'switch shown as off');
r.body.click(); assert.deepEqual(r.calls[0], ['switch', 'turn_on', { entity_id: 'switch.batterijplan_hbc_auto' }]);

// switch on
r = mkCard({ ...base, 'switch.batterijplan_hbc_auto': { state: 'on' }, 'sensor.batterijplan_advies_hbc': adv() });
assert.ok(r.body.innerHTML.includes('>aan<')); r.body.click(); assert.equal(r.calls[0][1], 'turn_off');

// 0 hours is HBC's 'no limit', not '0 h'
r = mkCard({ ...base, 'sensor.batterijplan_advies_hbc': adv({ cheapest_advies: 0, cheapest_nu: 8 }) });
assert.ok(r.body.innerHTML.includes('geen grens') && !r.body.innerHTML.includes('>0 h<'));

// measuring: day x of 7, no advice values
r = mkCard({ ...base, 'sensor.batterijplan_advies_hbc': { state: 'meten', attributes: { dag: 3, dagen: 2, van: 7, cheapest_nu: 8, cheapest_advies: null, cheapest_verschil: false, expensive_nu: 8, expensive_advies: null, expensive_verschil: false, solar_nu: 8, solar_advies: null, solar_verschil: false, besparing: null } } });
assert.ok(r.body.innerHTML.includes('Nog aan het meten: dag 3 van 7'));
assert.equal((r.body.innerHTML.match(/– –/g) || []).length, 3, 'null advice shows – –, not 0');
assert.ok( !r.body.innerHTML.includes('border-radius:50%;background:#ff9800'));

// languages
r = mkCard({ ...base, 'sensor.batterijplan_advies_hbc': adv() }, 'en');
assert.ok(r.body.innerHTML.includes('Cheapest hours') && r.body.innerHTML.includes('cheaper than now') && r.body.innerHTML.includes('Auto-adjust HBC settings'));
r = mkCard({ ...base, 'sensor.batterijplan_advies_hbc': adv() }, 'de');
assert.ok(r.body.innerHTML.includes('Günstigste Stunden') && r.body.innerHTML.includes('günstiger als jetzt') && r.body.innerHTML.includes('HBC-Einstellungen automatisch anpassen'));

// the dot on the button
const Kn = defined['batterijplan-knoppen'];
const k = new Kn();
k._hass = { states: { 'sensor.batterijplan_advies_hbc': adv() } };
assert.equal(k._melding('advies'), true);
k._hass = { states: { 'sensor.batterijplan_advies_hbc': adv({ cheapest_verschil: false, solar_verschil: false, solar_advies: 8, solar_nu: 8 }) } };
assert.equal(k._melding('advies'), false);
// the solar dot of the button and of the card come from the same helper (input_number as the current value)
k._hass = { states: { 'sensor.batterijplan_advies_hbc': adv({ cheapest_verschil: false, solar_verschil: false, solar_advies: 8.5, solar_nu: 8 }), 'input_number.house_battery_solar_reserved_for_house': { state: '8' } } };
assert.equal(k._melding('advies'), true, 'solar 8 -> 8.5 differs by 0.5');
k._hass.states['input_number.house_battery_solar_reserved_for_house'].state = '8.4';
assert.equal(k._melding('advies'), false);
console.log('ok advice card');
