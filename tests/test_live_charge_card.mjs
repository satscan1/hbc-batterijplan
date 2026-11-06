// Offline test: report card 'In de batterij nu' shows the live value (sensor.batterijplan_lading), not the plan value (node tests/test_live_charge_card.mjs)
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'custom_components', 'batterijplan', 'frontend', 'batterijplan-cards.js'), 'utf8');
assert.ok(!src.includes('lading_nu'), 'no lading_nu attribute any more');
globalThis.HTMLElement = class {};
const defined = {};
globalThis.customElements = { get: () => null, define(n, c) { defined[n] = c; } };
globalThis.window = globalThis; globalThis.customCards = [];
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { addEventListener() {}, removeEventListener() {}, createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }) };
globalThis.location = { origin: 'http://ha' };
globalThis.setInterval = () => 0; globalThis.clearInterval = () => {};
(0, eval)(src);

async function report(planAttrs, extra = {}, lang = 'nl') {
  const c = new defined['batterijplan-rapport']();
  const els = {};
  const el = (sel) => (els[sel] ||= { _h: '', style: {}, set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; }, textContent: '', addEventListener(k, f) { this['on_' + k] = f; }, querySelector: (s) => el(s), classList: { add() {}, remove() {} } });
  c.shadowRoot = { set innerHTML(v) {}, get innerHTML() { return ''; }, querySelector: (q) => el(q), querySelectorAll: () => [] };
  c.attachShadow = () => {};
  c.setConfig({ title: 'Rapport', taal: lang });
  c._hass = { language: lang, config: { version: '2026.11' }, states: { 'sensor.batterijplan': { state: '0.5', attributes: planAttrs }, ...extra }, callWS: () => new Promise(() => {}) };
  c._render();
  const Rap = c._body;
  let html = '';
  globalThis.window.open = () => ({ document: { open() {}, write(h) { html = h; }, close() {} } });
  const b = Rap.querySelector("[data-r='bekijk']");
  assert.ok(b.on_click, 'bekijk button wired');
  b.on_click();
  for (let i = 0; i < 50 && !html.includes('kWh'); i++) await new Promise((r) => setTimeout(r, 20));
  return html;
}

const lad = (v) => ({ state: v, attributes: {} });
let h = await report({ lading: 1.72, punten: [] }, { 'sensor.batterijplan_lading': lad('2.5') });
assert.match(h, /In de batterij nu[\s\S]{0,200}2[.,]5 kWh/, 'live value from sensor.batterijplan_lading');
assert.ok(!/1[.,]7 kWh/.test(h), 'plan value not shown as current charge');
h = await report({ lading: 1.72, punten: [] }, { 'sensor.batterijplan_lading': lad('2.5'), 'sensor.batterijplan_lading_2': lad('3.1') });
assert.match(h, /In de batterij nu[\s\S]{0,200}3[.,]1 kWh/, '_2 fallback wins');
h = await report({ lading: 1.72, punten: [] }, { 'sensor.batterijplan_lading': lad('unavailable') });
assert.match(h, /In de batterij nu[\s\S]{0,200}1[.,]7 kWh/, 'unavailable sensor: plan value');
h = await report({ lading: 1.72, punten: [] });
assert.match(h, /In de batterij nu[\s\S]{0,200}1[.,]7 kWh/, 'no sensor: plan value');
console.log('ok'); process.exit(0);
