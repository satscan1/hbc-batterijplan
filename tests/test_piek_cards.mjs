// Offline test of the cards 'Piek deze maand' and 'Lopend kwartier' (node, no browser): node tests/test_piek_cards.mjs
// Reads the source in /config/custom_components/batterijplan/frontend (the release copy is not kept in step).
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// repo layout (custom_components next to tests) or the /config layout (three folders up)
const FR = [path.join(here, '..', 'custom_components', 'batterijplan', 'frontend'), path.join(here, '..', '..', '..', 'custom_components', 'batterijplan', 'frontend')].find((d) => fs.existsSync(path.join(d, 'batterijplan-piek-cards.js')));
const src = fs.readFileSync(path.join(FR, 'batterijplan-piek-cards.js'), 'utf8');
globalThis.HTMLElement = class {};
const defined = {};
globalThis.customElements = { get: (n) => defined[n] || null, define(n, c) { defined[n] = c; } };
globalThis.window = globalThis; globalThis.customCards = [];
(0, eval)(src);

function render(name, states, lang = 'nl') {
  const C = defined[name];
  const c = new C();
  let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; } }; };
  c.setConfig({ taal: lang });
  c.hass = { language: lang, states };
  return html;
}

const piek = {
  state: '3400',
  last_updated: 'x',
  attributes: {
    proef: false, maand: '2026-11', doelgrens: 3400, eigen_grens: 0, minimum: 2500, piek_zonder: 5100,
    dagen: [['2026-11-01', 2100], ['2026-11-02', 3400], ['2026-11-03', 2900], ['2026-11-10', 3100]],
    dagen_zonder: [['2026-11-01', 3000], ['2026-11-02', 5100], ['2026-11-03', 4000], ['2026-11-10', 4200]],
    maanden: [
      { maand: '2026-11', piek: 3400, zonder: 5100, trend: 'up', lopend: true, besparing_kw: 1.7, besparing_eur: 7.79 },
      { maand: '2026-10', piek: 2800, zonder: 3900, trend: 'down', lopend: false, besparing_kw: 1.1, besparing_eur: 5.04 },
      { maand: '2026-09', piek: 3000, zonder: null, trend: null, lopend: false, besparing_kw: null, besparing_eur: null },
    ],
    gemiddelde: 3033, aantal_maanden: 3, gemiddelde_zonder: 4500, aantal_maanden_zonder: 2, besparing_jaar: 96, tarief: 55, kosten_jaar: 166.82,
  },
};

// piek card: chart, dotted target line, extra line without battery, table order, trend first, with / without / saving
let h = render('batterijplan-piek', { 'sensor.batterijplan_piek_maand': piek });
assert.ok(h.includes('<svg'), 'chart');
assert.ok(h.includes('stroke-dasharray'), 'dotted target line');
assert.ok(h.includes('fill-opacity'), 'filled line');
assert.ok(h.includes('#9ca3af" stroke-width="1.6"'), 'line without battery');
const tb = h.slice(h.indexOf('<table'));
// this node build has English ICU only (nl falls back to English); a browser gives 'nov'/'okt'. Accept both.
const pos = (re) => tb.search(re);
assert.ok(pos(/nov/i) < pos(/o[ck]t/i) && pos(/o[ck]t/i) < pos(/sep/i), 'new to old: ' + tb.slice(0, 600));
assert.ok(tb.indexOf('▲') < tb.search(/3[.,]4 kW/), 'trend before the peak value, in kW with 1 decimal');
assert.ok(/5[.,]1 kW/.test(tb) && /€ 7[.,]79/.test(tb) && /€ 5[.,]04/.test(tb), 'without battery and monthly saving');
assert.ok(!/\d[.,]\d\d kW/.test(h), 'powers in kW with one decimal only');
assert.ok(tb.includes('–'), 'unknown without-battery month shown as a dash');
assert.ok(/met batterij 3[.,]0 kW; zonder batterij 4[.,]5 kW/.test(h), 'Fluvius averages with and without');
assert.ok(/minstens 2[.,]5 kW/.test(h), 'minimum 2.5 kW');
assert.ok(/€ 96 per jaar/.test(h) && /ongeveer € 167/.test(h), 'yearly saving and cost');
assert.ok(!h.includes('voorkomen') && !h.includes('Voorkomen'), 'old "voorkomen" text is gone');
assert.ok(!h.includes('undefined') && !h.includes('NaN'), 'no undefined / NaN: ' + h.match(/.{20}(undefined|NaN).{20}/));

// languages
for (const l of ['en', 'de']) {
  const x = render('batterijplan-piek', { 'sensor.batterijplan_piek_maand': piek }, l);
  assert.ok(!x.includes('undefined') && !x.includes('NaN'), l);
}
assert.ok(/with battery 3\.0 kW; without battery 4\.5 kW/.test(render('batterijplan-piek', { 'sensor.batterijplan_piek_maand': piek }, 'en')));
assert.ok(render('batterijplan-piek', { 'sensor.batterijplan_piek_maand': piek }, 'de').includes('Zielgrenze'));

// not BE / no data / trial label
assert.ok(render('batterijplan-piek', { 'sensor.batterijplan_piek_maand': { state: 'unavailable', attributes: {}, last_updated: 'x' } }).includes('Alleen met Vlaanderen aan'));
assert.ok(render('batterijplan-piek', {}).includes('Alleen met Vlaanderen aan'));
assert.ok(render('batterijplan-piek', { 'sensor.batterijplan_piek_maand': { state: '0', last_updated: 'x', attributes: { dagen: [], maanden: [], maand: '2026-11' } } }).includes('Nog geen kwartieren'));
assert.ok(!render('batterijplan-piek', { 'sensor.batterijplan_piek_maand': piek }).includes('Proefmodus'), 'no trial mode any more');

// quarter card
const kw = {
  state: '1800', last_updated: 'y',
  attributes: { stuurt: true, start: 0, verstreken_s: 300, verbruikt_kwh: 0.15, budget_kwh: 0.85, doelgrens: 3400, toegestaan_w: 4200, hbc_grens_w: 4200, hbc_grens_aan: true },
};
const hbc = { 'input_number.house_battery_control_power_limit_import': { state: '4100' }, 'input_boolean.house_battery_control_has_power_limit_import': { state: 'on' } };
h = render('batterijplan-kwartier', { 'sensor.batterijplan_kwartier': kw, ...hbc });
assert.ok(/1[.,]8 kW/.test(h), 'average so far in kW');
assert.ok(/4[.,]2 kW/.test(h), 'still allowed in kW');
assert.ok(/4[.,]1 kW/.test(h), 'HBC limit read live from the helper, in kW');
assert.ok(!/\d W</.test(h), 'no watts shown');
assert.ok(h.includes('5:00 / 15:00'), 'time');
assert.ok(h.includes('stuurt de HBC-grens'), 'steering note');
assert.ok(render('batterijplan-kwartier', { 'sensor.batterijplan_kwartier': { ...kw, attributes: { ...kw.attributes, stuurt: false } }, ...hbc }).includes('Live staat uit'));
assert.ok(render('batterijplan-kwartier', { 'sensor.batterijplan_kwartier': kw, 'input_boolean.house_battery_control_has_power_limit_import': { state: 'off' }, 'input_number.house_battery_control_power_limit_import': { state: '4100' } }).includes('>uit<'), 'limit off');
assert.ok(render('batterijplan-kwartier', {}).includes('Alleen met Vlaanderen aan'));
for (const l of ['en', 'de']) { const x = render('batterijplan-kwartier', { 'sensor.batterijplan_kwartier': kw, ...hbc }, l); assert.ok(!x.includes('undefined') && !x.includes('NaN'), l); }
console.log('piek cards: ok');
