// Offline test: grey-out of settings rows that do not fit the contract / country (node): node tests/test_velden_grijs.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// repo layout (custom_components next to tests) or the /config layout (three folders up)
const FR = [path.join(here, '..', 'custom_components', 'batterijplan', 'frontend'), path.join(here, '..', '..', '..', 'custom_components', 'batterijplan', 'frontend')].find((d) => fs.existsSync(path.join(d, 'batterijplan-piek-cards.js')));
const src = fs.readFileSync(path.join(FR, 'batterijplan-cards.js'), 'utf8');
globalThis.HTMLElement = class {};
const defined = {};
globalThis.customElements = { get: () => null, define(n, c) { defined[n] = c; } };
globalThis.window = globalThis; globalThis.customCards = [];
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { addEventListener() {}, removeEventListener() {}, createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }) };
globalThis.setInterval = () => 0; globalThis.clearInterval = () => {};
(0, eval)(src);

const num = (state) => ({ state, attributes: { min: 0, max: 100, step: 1, unit_of_measurement: 'W' } });
const rows = [
  { entity: 'number.a', name: 'Vaste prijs', beschikbaar: [[{ entity: 'select.contract', state: ['vast'] }]], reden: 'Alleen bij contract Vast' },
  { entity: 'number.b', name: 'Capaciteitstarief', beschikbaar: [[{ entity: 'switch.vlaanderen', state: ['on'] }]], reden: 'Alleen met Vlaanderen aan' },
  { entity: 'number.c', name: 'Gewoon' },
];
function render(states, lang = 'nl') {
  const C = defined['batterijplan-velden'], c = new C();
  let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; }, querySelectorAll: () => [], querySelector: () => null }; };
  c.setConfig({ title: 'Instellingen', rows });
  c._hass = { language: lang, states, callService() {} };
  c.hass = c._hass;
  return html;
}
const base = { 'number.a': num(5), 'number.b': num(55), 'number.c': num(1), 'select.contract': { state: 'dynamisch' }, 'switch.vlaanderen': { state: 'off' } };
let h = render(base);
assert.equal((h.match(/class='gr'/g) || []).length, 2, 'two rows greyed: ' + h.length);
assert.ok(h.includes('Alleen bij contract Vast') && h.includes('Alleen met Vlaanderen aan'));
assert.ok(h.includes('inert'), 'controls disabled');
h = render({ ...base, 'select.contract': { state: 'vast' } });
assert.equal((h.match(/class='gr'/g) || []).length, 1, 'fixed price available with contract vast');
h = render({ ...base, 'switch.vlaanderen': { state: 'on' } });
assert.equal((h.match(/class='gr'/g) || []).length, 1, 'capacity tariff available with Flanders on');
assert.ok(render(base, 'en').includes('Only with a fixed contract') && render(base, 'de').includes('Nur bei einem Festvertrag'));
assert.ok(render({ ...base, 'number.c': num(2) }).includes('Gewoon'), 'ordinary row unchanged');
// country dependent names and chip labels (NL Enkeltarief/Dubbeltarief, BE Enkelvoudig/Tweevoudig, DE Eintarif/Zweitarif)
const selRow = [{ entity: 'select.tarief', name: 'Tarief', name_land: { nl: 'Tarief', de: 'Tarif' }, labels_land: { nl: { enkel: 'Enkeltarief', dubbel: 'Dubbeltarief' }, be: { enkel: 'Enkelvoudig', dubbel: 'Tweevoudig' }, de: { enkel: 'Eintarif', dubbel: 'Zweitarif' } } }];
function renderSel(land) {
  const C = defined['batterijplan-velden'], c = new C();
  let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; }, querySelectorAll: () => [], querySelector: () => null }; };
  c.setConfig({ title: 'x', rows: selRow });
  c._hass = { language: 'nl', config: { country: land === 'xx' ? 'FR' : land.toUpperCase() }, states: { 'select.tarief': { state: 'enkel', attributes: { options: ['enkel', 'dubbel'] } } }, callService() {} };
  c.hass = c._hass;
  return html;
}
assert.ok(renderSel('nl').includes('Enkeltarief') && renderSel('nl').includes('Dubbeltarief'));
assert.ok(renderSel('be').includes('Enkelvoudig') && renderSel('be').includes('Tweevoudig') && !renderSel('be').includes('Enkeltarief'));
assert.ok(renderSel('xx').includes('Enkeltarief'), 'other country counts as NL');
assert.ok(renderSel('de').includes('Eintarif') && renderSel('de').includes('Zweitarif') && renderSel('de').includes('>Tarif<'));
// price fields: step 0.00001 on the entity gives five decimals (energy suppliers quote five), whatever step the +/- buttons use
{
  const C = defined['batterijplan-velden'], c = new C();
  let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; }, querySelectorAll: () => [], querySelector: () => null }; };
  c.setConfig({ title: 'x', rows: [{ entity: 'number.prijs', name: 'Prijs', kind: 'stepper', step: 0.001 }] });
  c._hass = { language: 'nl', states: { 'number.prijs': { state: '0.23404', attributes: { min: 0, max: 2, step: 0.00001, unit_of_measurement: 'EUR/kWh' } } }, callService() {} };
  c.hass = c._hass;
  assert.ok(/0[.,]23404/.test(html), 'five decimals shown: ' + html.slice(html.indexOf('data-ne'), html.indexOf('data-ne') + 120));
}
console.log('velden grijs: ok');
