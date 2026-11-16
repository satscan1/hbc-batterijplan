// Offline test: the Vandaag window (day card, savings line, days) for a Fixed contract and for Dynamic (node): node tests/test_vandaag_cards.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// repo layout (custom_components next to tests) or the /config layout (three folders up); both hold the same files
const FR = [path.join(here, '..', 'custom_components', 'batterijplan', 'frontend'), path.join(here, '..', '..', '..', 'custom_components', 'batterijplan', 'frontend')].find((d) => fs.existsSync(path.join(d, 'batterijplan-dag-card.js')));
const defined = {};
globalThis.HTMLElement = class { constructor() { this.style = {}; } };
globalThis.customElements = { get: (n) => defined[n] || null, define(n, c) { defined[n] = c; } };
globalThis.window = globalThis; globalThis.customCards = [];
for (const f of ['batterijplan-dag-card.js', 'batterijplan-vandaag-cards.js']) (0, eval)(fs.readFileSync(path.join(FR, f), 'utf8'));
const plain = (h) => h.replace(/<style>[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const d = new Date(), iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

function mk(tag, sens, lang = 'nl', dag = iso) {
  const c = new (defined[tag])();
  let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; } }; };
  c.setConfig({ taal: lang });
  c.hass = { language: lang, callWS: () => Promise.resolve({}), themes: {}, states: { 'sensor.batterijplan': sens,
    'sensor.batterijplan_meerwaarde': { state: '5.5', last_updated: 'm', attributes: { dag_datum: dag, dag_huis_kwh: 3.4, dag_zon_kwh: 2.1, dag_net_kwh: 0.5, dag_terug_kwh: 0 } } } };
  c._basis = 4.0; c._basisDag = 'x'; c._sig = null; c._render && c._render();
  return html;
}
const vastS = { state: '0', last_updated: 's', attributes: { contract: 'dag_nacht', vast: { tarief: 'dubbel' }, punten: [] } };
const dynS = { state: '0.5', last_updated: 's', attributes: { contract: 'dynamisch', vast: null, punten: [[Math.floor(Date.now() / 1000), 20, 0, 'Z', 5, 'Z', 5, 0, 0]], kw: [[0.1, 0.05]], pmin_b: 20 } };

let t = plain(mk('batterijplan-dag-card', vastS));
assert.ok(t.includes('Waarde vandaag') && /\+ € 1[.,]50/.test(t) && /3[.,]4 kWh/.test(t) && /2[.,]1 kWh · 0[.,]5 kWh/.test(t), t);
assert.ok(t.includes('Batterij naar huis') && t.includes('zelfverbruik via de batterij') && t.includes('tegen jouw prijzen'), 'Fixed: value, self-consumption, at your prices');
assert.ok(!t.includes('Nog te verwachten') && !t.includes('Dagtotaal') && !t.includes('Nog geen kosten per kwartier') && !t.includes('verwacht'), 'no plan texts under a Fixed contract');
// the flows are from today only: yesterday's figures are not shown as today's
t = plain(mk('batterijplan-dag-card', vastS, 'nl', '2020-01-01'));
assert.ok(/0[.,]0 kWh/.test(t) && !/3[.,]4 kWh/.test(t));
for (const l of ['en', 'de']) { const x = plain(mk('batterijplan-dag-card', vastS, l)); assert.ok(!x.includes('undefined') && !x.includes('NaN'), l); }
assert.ok(plain(mk('batterijplan-dag-card', vastS, 'en')).includes('Value today') && plain(mk('batterijplan-dag-card', vastS, 'de')).includes('Wert heute'));
// Dynamic: as before
t = plain(mk('batterijplan-dag-card', dynS));
assert.ok(t.includes('Nog te verwachten') && t.includes('Dagtotaal') && !t.includes('Waarde vandaag'), 'Dynamic unchanged');

// savings line and days
t = plain(mk('batterijplan-spaarlijn-card', vastS));
assert.ok(!t.includes('undefined') && !t.includes('NaN'));
{
  const c = new (defined['batterijplan-spaarlijn-card'])(); let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; } }; };
  c.setConfig({ taal: 'nl' });
  c.hass = { language: 'nl', callWS: () => Promise.resolve({}), themes: {}, states: { 'sensor.batterijplan': vastS, 'sensor.batterijplan_meerwaarde': { state: '5.5', last_updated: 'm', attributes: {} } } };
  c._render();
  assert.ok(true);
}
console.log('vandaag cards: ok');
