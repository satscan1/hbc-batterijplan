// Offline test of the plan card tooltip (node, no browser): node tests/test_plan_card_hover.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'custom_components', 'batterijplan', 'frontend', 'batterijplan-plan-card.js'), 'utf8');
globalThis.HTMLElement = class {};
globalThis.customElements = { get: () => null, define(n, c) { globalThis.Card = c; } };
globalThis.window = globalThis; globalThis.customCards = [];
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { addEventListener() {}, removeEventListener() {} };
globalThis.requestAnimationFrame = fn => { fn(); return 0; };
(0, eval)(src);

const mkEl = (rect) => ({ attrs: {}, style: {}, listeners: {}, innerHTML: '', offsetWidth: 214, rect,
  setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(k, f) { this.listeners[k] = f; }, getBoundingClientRect() { return this.rect; } });
const cw = mkEl({ left: 0, width: 800, top: 0, height: 300 }), sv = mkEl({ left: 0, width: 800 }), hl = mkEl({}), tip = mkEl({});

const card = new Card();
card.shadowRoot = { _h: '', set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; },
  querySelector(q) { return { '.cw': cw, '.cw svg': sv, '.hl': hl, '.tip': tip }[q] || null; }, querySelectorAll: () => [] };
card.attachShadow = () => {}; card.getBoundingClientRect = () => ({ width: 828 });
card._c = { entity: 'sensor.batterijplan', weergave: 'samen', taal: 'en' };
card._h = { language: 'en', states: {} };

const T0 = Math.floor(Date.UTC(2026, 10, 6, 10, 0) / 1000);
const pts = Array.from({ length: 8 }, (_, i) => [T0 + i * 900, 20 + i, 0, 'Z', 2, i === 2 ? 'L' : 'Z', 3, 1.5, 0.9]);
card._render({ state: '0.5', attributes: { punten: pts, lading: 1, kosten_hbc: 2, kosten_plan: 1.5 } });
const before = card.shadowRoot.innerHTML;
assert.ok(before.includes('class="hl"') && before.includes('class="tip"'), 'line and box are in the card');

const W = Math.max(480, 828 - 28), L = 34, R = 30, bw = (W - L - R) / pts.length;
const at = i => L + (i + 0.5) * bw;  // svg width == css width here, so css x == svg x
const move = x => { cw.listeners.pointermove({ clientX: x, pointerType: 'mouse' }); };

move(at(2));
assert.equal(hl.attrs.visibility, 'visible');
assert.equal(+hl.attrs.x1, at(2), 'line follows the pointer exactly');
assert.equal(tip.style.display, 'block');
for (const w of ['Bare price', 'Solar expected', '1.50 kW', 'Solar cautious', '0.90 kW', 'Charge HBC', '2.00 kWh', 'Charge Batterijplan', '3.00 kWh', 'Action HBC', 'Action Batterijplan', 'charge from the grid']) assert.ok(tip.innerHTML.includes(w), w + ' in tooltip: ' + tip.innerHTML);
assert.ok(tip.innerHTML.includes('22.0 ct'), 'bare price of quarter 2');

const html2 = tip.innerHTML;
move(at(2) + 2);  // same quarter: only the line moves, text untouched
assert.equal(tip.innerHTML, html2);
assert.equal(+hl.attrs.x1, at(2) + 2);
move(at(5));
assert.notEqual(tip.innerHTML, html2, 'text changes with the quarter');
assert.ok(tip.innerHTML.includes('25.0 ct'));
assert.equal(card.shadowRoot.innerHTML, before, 'card not re-rendered on pointer move');

move(at(7));  // near the right edge the box flips to the left of the line
assert.ok(parseFloat(tip.style.transform.match(/-?[\d.]+/)[0]) < at(7), 'box flips left');
move(at(0));
assert.ok(parseFloat(tip.style.transform.match(/-?[\d.]+/)[0]) > at(0), 'box right of the line');

move(5);  // left of the plot area: hidden
assert.equal(hl.attrs.visibility, 'hidden'); assert.equal(tip.style.display, 'none');
move(at(3)); cw.listeners.pointerleave({ pointerType: 'mouse' });
assert.equal(tip.style.display, 'none', 'mouse leave hides');
move(at(3)); cw.listeners.pointerleave({ pointerType: 'touch' });
assert.equal(tip.style.display, 'block', 'touch stays until tapped elsewhere');

// view only HBC: no Batterijplan rows
card._c.weergave = 'hbc'; card._render({ state: '0', attributes: { punten: pts, lading: 1 } });
move(at(1));
assert.ok(tip.innerHTML.includes('Charge HBC') && !tip.innerHTML.includes('Charge Batterijplan'));
// language
card._c = { entity: 'sensor.batterijplan', weergave: 'samen', taal: 'de' }; card._render({ state: '0', attributes: { punten: pts, lading: 1 } });
move(at(1));
assert.ok(tip.innerHTML.includes('Reiner Preis') && tip.innerHTML.includes('Sonne vorsichtig') && tip.innerHTML.includes('Aktion Batterijplan'));
// older points without the cautious value: dash, no NaN
const old = pts.map(p => p.slice(0, 8));
card._c = { entity: 'sensor.batterijplan', weergave: 'samen', taal: 'nl' }; card._render({ state: '0', attributes: { punten: old, lading: 1 } });
move(at(1));
assert.ok(tip.innerHTML.includes('Zon voorzichtig') && !tip.innerHTML.includes('NaN') && tip.innerHTML.includes('–'));
console.log('ok plan card hover');

// live charge level in the card header comes from sensor.batterijplan_lading (_2 first), the chart keeps the plan value
const st = (state) => ({ state, last_updated: state });
const planSt = { state: '0.5', attributes: { punten: pts, lading: 1, kosten_hbc: 2, kosten_plan: 1.5 }, last_updated: 'p' };
card._h = { language: 'en', states: { 'sensor.batterijplan': planSt, 'sensor.batterijplan_lading': st('2.5') } };
card._c.weergave = 'briefing';
card._sig = null; card._render(planSt);
assert.ok(card.shadowRoot.innerHTML.includes("2,5 kWh"), 'live value shown');
card._h.states['sensor.batterijplan_lading_2'] = st('3.1'); card._render(planSt);
assert.ok(card.shadowRoot.innerHTML.includes("3,1 kWh"), '_2 fallback');
card._h.states = { 'sensor.batterijplan': planSt }; card._render(planSt);
assert.ok(card.shadowRoot.innerHTML.includes("1,0 kWh"), 'no sensor: plan value');
// a change of the small sensor alone re-renders the card
let n = 0; const orig = card._render; card._render = function (x) { n++; return orig.call(this, x); };
card._h.states = { 'sensor.batterijplan': planSt, 'sensor.batterijplan_lading': st('2.5') };
card.hass = card._h; card.hass = { ...card._h, states: { ...card._h.states, 'sensor.batterijplan_lading': st('2.6') } };
assert.equal(n, 2, 'render on first and on changed live sensor');
console.log('ok live');
