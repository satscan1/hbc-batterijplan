// Offline test: main screen under a Fixed contract (briefing, chart, status card) and that Dynamic is unchanged (node): node tests/test_vast_cards.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// repo layout (custom_components next to tests) or the /config layout (three folders up)
const FR = [path.join(here, '..', 'custom_components', 'batterijplan', 'frontend'), path.join(here, '..', '..', '..', 'custom_components', 'batterijplan', 'frontend')].find((d) => fs.existsSync(path.join(d, 'batterijplan-piek-cards.js')));
const defined = {};
globalThis.HTMLElement = class { constructor() { this.style = {}; } getBoundingClientRect() { return { width: 748 }; } };
globalThis.customElements = { get: (n) => defined[n] || null, define(n, c) { defined[n] = c; } };
globalThis.window = globalThis; globalThis.customCards = [];
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { addEventListener() {}, removeEventListener() {}, createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }) };
globalThis.setInterval = () => 0; globalThis.clearInterval = () => {};
globalThis.__bpExpose = {}; globalThis.location = { origin: 'http://ha' };
(0, eval)(fs.readFileSync(path.join(FR, 'batterijplan-plan-card.js'), 'utf8'));
const planCardDef = defined['batterijplan-plan-card'];
(0, eval)(fs.readFileSync(path.join(FR, 'batterijplan-cards.js'), 'utf8'));

const sw0 = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { state: v, attributes: {} }]));
const NOW = Math.floor(Date.now() / 900000) * 900;
const rows = Array.from({ length: 144 }, (_, i) => { const ts = NOW - 6 * 3600 + i * 900; return [ts, i > 40 && i < 90 ? 2.5 : 0, i % 40 < 12 ? 1 : 0]; });
const sim = Array.from({ length: 120 }, (_, i) => [NOW + i * 900, Math.max(0, 6.1 - i * 0.1), i < 30 ? 'O' : i < 40 ? 'N' : i < 70 ? 'L' : 'Z']);
const tijdlijn = { nu: 'O', leeg: NOW + 30 * 900, vol: null, dal: { van: NOW + 40 * 900, tot: NOW + 70 * 900, naar: 9.0, laadt: true, lopend: false }, dag: { dag_ts: NOW + 70 * 900, zon: true, vol: null, nom: true } };
const vast = (o = {}) => ({ sim, tijdlijn, niveau_nu: 6.1, capaciteit: 9.0, tarief: 'dubbel', prijs_normaal: 0.24694, prijs_dal: 0.21971, prijs_nu: 0.24694, dal_nu: false, volgende_wissel: NOW + 5 * 3600, weekend: true, nacht_van: 23, nacht_tot: 7,
  terugleverprijs: 0.12, strategie: 'Self-consumption', vlaanderen: false, kwartieren: rows, lading: [[NOW - 3600, 6.0], [NOW - 900, 6.1]], ...o });
const plan = (contract, v, extra = {}) => ({ state: '0', last_updated: 'x', attributes: { contract, vast: v, punten: [], lading: null, kosten_hbc: null, kosten_plan: null, versie: '2.0.0-dev1', ...extra } });
const lading = { state: '6.1', last_updated: 'l', attributes: {} };

function plancard(weergave, sensor, lang = 'nl', country = 'NL', extra = {}) {
  const c = new planCardDef();
  let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; }, querySelector: () => null, querySelectorAll: () => [] }; };
  c.setConfig({ weergave, taal: lang });
  c.hass = { language: lang, config: { country }, states: { 'sensor.batterijplan': sensor, 'sensor.batterijplan_lading': lading, ...extra }, themes: { darkMode: true } };
  return html;
}
const plain = (h) => h.replace(/<style>[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// briefing, dual rate, normal rate now
let h = plancard('briefing', plan('dag_nacht', vast()));
let t = plain(h);
assert.ok(t.includes('Vast contract, dubbeltarief.'), t.slice(0, 300));
assert.ok(/Nu normaaltarief € 0[.,]25\./.test(t), 'price now with two decimals');
assert.ok(!/\d[.,]\d{5}/.test(t), 'no five-decimal amounts on the dashboard: ' + (t.match(/.{20}\d[.,]\d{5}.{10}/) || [''])[0]);
// this node build has English ICU only (nl falls back to en-US, '11:00 PM'); a browser gives '23:00'. Accept both.
assert.ok(/Laden van het net vanaf (\S+ )?\d\d:\d\d( [AP]M)? \(daltarief € 0[.,]22\)\./.test(t), 'when charging starts: ' + t.slice(0, 200));
assert.ok(t.includes('Weekend en feestdagen de hele dag dal.') && /Terugleveren levert € 0[.,]12 per kWh/.test(t));
assert.ok(!t.includes('Nog geen berekening') && !t.includes('Kale prijs'));
assert.ok(t.includes('Alleen bij dynamisch contract') && h.includes('opacity:.45'), 'the four rules are greyed out with a reason');
assert.ok(/Self-consumption \(normaaltarief\)/.test(t) && /6[.,]1 kWh/.test(t));
// off-peak now
t = plain(plancard('briefing', plan('dag_nacht', vast({ dal_nu: true, prijs_nu: 0.21971, strategie: 'Charge' }))));
assert.ok(/Nu daltarief € 0[.,]22\./.test(t) && /Laden van het net tot/.test(t) && /Charge \(daltarief\)/.test(t), t.slice(0, 400));
// single rate
t = plain(plancard('briefing', plan('vast', vast({ tarief: 'enkel', prijs_nu: 0.23404, prijs_dal: null, volgende_wissel: null, weekend: false, terugleverprijs: 0 }))));
assert.ok(/Vast contract, enkeltarief € 0[.,]23\./.test(t) && t.includes('Self-consumption: eerst eigen zonne-energie') && !t.includes('Terugleveren levert') && !t.includes('Weekend en feestdagen de hele dag dal'));
// Flanders: peak and target limit
const pk = { 'sensor.batterijplan_piek_maand': { state: '3400', attributes: { doelgrens: 3400 } } };
{
  const c = new planCardDef(); let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; }, querySelector: () => null, querySelectorAll: () => [] }; };
  c.setConfig({ weergave: 'briefing', taal: 'nl' });
  c.hass = { language: 'nl', config: { country: 'NL' }, states: { 'sensor.batterijplan': plan('dag_nacht', vast({ vlaanderen: true })), 'sensor.batterijplan_lading': lading, ...pk }, themes: {} };
  assert.ok(/Maandpiek tot nu 3[.,]4 kW, doelgrens 3[.,]4 kW \(minimum 2[.,]5 kW\)/.test(plain(html)), 'Flanders sentence');
}
// country words
assert.ok(/Nu dagprijs/.test(plain(plancard('briefing', plan('dag_nacht', vast()), 'nl', 'BE'))) && /nachtprijs/.test(plain(plancard('briefing', plan('dag_nacht', vast()), 'nl', 'BE'))));
assert.ok(/Nu HT/.test(plain(plancard('briefing', plan('dag_nacht', vast()), 'nl', 'DE'))));
assert.ok(/Nu normaaltarief/.test(plain(plancard('briefing', plan('dag_nacht', vast()), 'nl', 'FR'))), 'other country counts as NL');
// chart / boxes
h = plancard('samen', plan('dag_nacht', vast()));
t = plain(h);
assert.ok(t.includes('Prijs nu') && /€ 0[.,]25 /.test(t) && !t.includes('Kale prijs nu') && !t.includes('Nog te besparen') && !/verwacht \d/.test(t) && !/\d %/.test(t), 'price box, no saving, no deviation: ' + t.slice(0, 400));
assert.ok(/6[.,]10 kWh/.test(t) && t.includes('In de batterij nu'));
assert.ok(h.includes('stroke-dasharray="6 4"') && h.includes('fill="#3b82f6"') && h.includes('fill="#22c55e"') && h.includes('fill="#f59e0b"'), 'expected level line and the action bar in the legend colours');
assert.ok(t.includes('laden van het net') && t.includes('ontladen voor huis (NOM)') && t.includes('laden met zon') && t.includes('niets (leeg of vol)'), 'action legend');
assert.ok(h.includes('<svg') && h.includes('fill="#6366f1"') && h.includes('rgba(139,92,246,.40)') && h.includes('rgba(6,182,212,.30)'), 'chart: off-peak band, solar, battery level');
assert.ok(t.includes('zon verwachting (kW)') && t.includes('lading gemeten (kWh)') && t.includes('lading verwacht (kWh)') && t.includes('daltarief') && !t.includes('prijs (ct)') && !t.includes('HBC (kWh)'), 'legend fits');
h = plancard('samen', plan('vast', vast({ tarief: 'enkel', prijs_dal: null })));
assert.ok(!h.includes('fill="#6366f1"') && !plain(h).includes('daltarief'), 'no off-peak band with a single rate');
for (const l of ['en', 'de']) for (const w of ['briefing', 'samen']) { const x = plancard(w, plan('dag_nacht', vast()), l); assert.ok(!x.includes('undefined') && !x.includes('NaN'), l + w + ' ' + (x.match(/.{30}(undefined|NaN).{30}/) || [''])[0]); }
assert.ok(plain(plancard('briefing', plan('dag_nacht', vast()), 'en')).includes('Fixed contract, dual rate.'));
assert.ok(plain(plancard('briefing', plan('dag_nacht', vast()), 'de')).includes('Festvertrag, Zweitarif.'));

// Dynamic: everything as before
const dynPts = [[NOW, 20, 0, 'Z', 5, 'Z', 5, 0, 0], [NOW + 900, 21, 0, 'Z', 5, 'Z', 5, 0, 0]];
h = plancard('samen', { state: '0.5', last_updated: 'x', attributes: { contract: 'dynamisch', vast: null, punten: dynPts, lading: 5, lading_plan: 5, kosten_hbc: 3, kosten_plan: 2.5 } });
t = plain(h);
assert.ok(t.includes('Kale prijs nu') && t.includes('Nog te besparen tot') && t.includes('prijs (ct)'), 'Dynamic keeps the plan view');
h = plancard('briefing', { state: '0.5', last_updated: 'x', attributes: { contract: 'dynamisch', vast: null, punten: dynPts, lading: 5, kosten_hbc: 3, kosten_plan: 2.5 } });
assert.ok(/waar batterijplan bijstuurt/i.test(plain(h)) && !plain(h).includes('Alleen bij dynamisch contract'));
// day word in the timeline, relative to now: evening -> morgen, night after midnight -> vandaag, morning -> vandaag, later -> weekday name
{
  const RealDate = Date;
  const at = (iso, fn) => { const ms = new RealDate(iso).getTime(); globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(ms); } static now() { return ms; } }; try { return fn(ms); } finally { globalThis.Date = RealDate; } };
  const tlDag = (dagIso, extra = {}) => vast({ tijdlijn: { nu: 'O', leeg: null, vol: null, dal: null, dag: { dag_ts: new RealDate(dagIso).getTime() / 1000, zon: true, vol: null, nom: true, ...extra } } });
  const dagTekst = (now, dagIso, lang = 'nl') => at(now, () => plain(plancard('briefing', plan('dag_nacht', tlDag(dagIso)), lang)));
  // evening 20:00 on Monday 16-11, the block is tomorrow 07:00
  let tb = dagTekst('2026-11-16T20:00:00', '2026-11-17T07:00:00');
  assert.ok(/morgen overdag NOM, zon vult bij/.test(tb) && !/vandaag overdag/.test(tb), 'evening: ' + tb.slice(tb.indexOf('Nu:'), tb.indexOf('Nu:') + 160));
  // night 01:00 on 17-11, the block is this morning 07:00: still today's calendar date
  tb = dagTekst('2026-11-17T01:00:00', '2026-11-17T07:00:00');
  assert.ok(/vandaag overdag NOM, zon vult bij/.test(tb) && !/morgen overdag/.test(tb), 'night after midnight: ' + tb.slice(tb.indexOf('Nu:'), tb.indexOf('Nu:') + 160));
  // morning 09:00, the block is running now
  tb = dagTekst('2026-11-17T09:00:00', '2026-11-17T09:00:00');
  assert.ok(/vandaag overdag NOM/.test(tb) && !/morgen overdag/.test(tb), 'morning');
  // two days ahead: the weekday name (this node build has English ICU only: 'Wednesday'; a browser gives 'woensdag')
  tb = dagTekst('2026-11-16T20:00:00', '2026-11-18T07:00:00');
  assert.ok(/(woensdag|Wednesday) overdag NOM/.test(tb) && !/(vandaag|morgen) overdag/.test(tb), 'later: ' + tb.slice(tb.indexOf('Nu:'), tb.indexOf('Nu:') + 160));
  assert.ok(/tomorrow daytime NOM, sun tops up/.test(dagTekst('2026-11-16T20:00:00', '2026-11-17T07:00:00', 'en')) && /today daytime NOM/.test(dagTekst('2026-11-17T01:00:00', '2026-11-17T07:00:00', 'en')));
  assert.ok(/morgen tagsüber NOM, Sonne füllt auf/.test(dagTekst('2026-11-16T20:00:00', '2026-11-17T07:00:00', 'de')) && /heute tagsüber NOM/.test(dagTekst('2026-11-17T01:00:00', '2026-11-17T07:00:00', 'de')));
  // across a month end
  tb = dagTekst('2026-11-30T21:00:00', '2026-12-01T07:00:00');
  assert.ok(/morgen overdag NOM/.test(tb), 'month end');
}
// charging from the grid does not pay (difference 2.7 ct < threshold 6 ct): said in the briefing, the rule and the timeline
{
  const nietLoont = vast({ laden: { actief: false, reden: 'loont_niet', verschil_ct: 2.72, drempel_ct: 6 }, tijdlijn: { nu: 'O', leeg: NOW + 30 * 900, vol: null, dal: null, dag: { dag_ts: NOW + 70 * 900, zon: true, vol: null, nom: true } },
    sim: sim.map(r => [r[0], r[1], r[2] === 'L' ? 'N' : r[2]]) });
  const hb = plancard('briefing', plan('dag_nacht', nietLoont), 'nl', 'NL', sw0({ 'switch.batterijplan_dal_weekend': 'on' }));
  const tb = plain(hb);
  assert.ok(/Laden van het net levert niets op: verschil 2[.,]7 ct, drempel 6[.,]0 ct\./.test(tb), tb.slice(0, 500));
  assert.ok(!/Laden van het net vanaf/.test(tb) && !/laden van het net tot/.test(tb), 'no charging announced');
  assert.ok(/Nachtladen \(daltarief\) uit \(loont niet\)/.test(tb), 'rule shows off (not worth it)');
  assert.ok(/nachtladen loont niet \(2[.,]7 (<|&lt;) 6[.,]0 ct\)/.test(tb), 'timeline says so');
  const cs = plancard('samen', plan('dag_nacht', nietLoont));
  assert.ok(!cs.includes('fill="#3b82f6"'), 'no blue charging bar when it does not pay');
  assert.ok(/Charging from the grid does not pay: difference 2\.7 ct, threshold 6\.0 ct/.test(plain(plancard('briefing', plan('dag_nacht', nietLoont), 'en'))) && /off \(not worth it\)/.test(plain(plancard('briefing', plan('dag_nacht', nietLoont), 'en'))));
  assert.ok(/Laden aus dem Netz lohnt sich nicht: Unterschied 2,7 ct, Schwelle 6,0 ct/.test(plain(plancard('briefing', plan('dag_nacht', nietLoont), 'de'))) && /aus \(lohnt nicht\)/.test(plain(plancard('briefing', plan('dag_nacht', nietLoont), 'de'))));
  // pays: as before
  const loont = plain(plancard('briefing', plan('dag_nacht', vast({ laden: { actief: true, reden: 'loont', verschil_ct: 8, drempel_ct: 6 } }))));
  assert.ok(/Laden van het net vanaf/.test(loont) && !/levert niets op/.test(loont) && /Nachtladen \(daltarief\) aan/.test(loont));
  // Flanders: charging allowed for the peak reserve whatever the price difference
  const vl = plain(plancard('briefing', plan('dag_nacht', vast({ vlaanderen: true, laden: { actief: true, reden: 'vlaanderen', verschil_ct: 2.72, drempel_ct: 6 } }))));
  assert.ok(/vult de reserve voor pieken, onder de doelgrens/.test(vl) && !/levert niets op/.test(vl) && /Nachtladen \(daltarief\) aan/.test(vl), vl.slice(0, 500));
  // status card: in the off-peak hours on Self-consumption because charging does not pay
  const stt = plain(status(plan('dag_nacht', vast({ dal_nu: true, prijs_nu: 0.21971, strategie: 'Self-consumption', laden: { actief: false, reden: 'loont_niet', verschil_ct: 2.72, drempel_ct: 6 } })), 'Self-consumption'));
  assert.ok(/Self-consumption \(daltarief\)/.test(stt) && /laden loont niet/.test(stt), stt.slice(0, 400));
}
// timeline under 'What the battery does': real values from the simulation
{
  const tb = plain(plancard('briefing', plan('dag_nacht', vast())));
  assert.ok(/Nu: dekt je huisverbruik \(NOM\)/.test(tb) && /verwacht leeg rond \S+( [AP]M)?/.test(tb), tb.slice(tb.indexOf('WAT DE BATTERIJ'), tb.indexOf('WAT DE BATTERIJ') + 500));
  assert.ok(/laden van het net tot 9[.,]0 kWh/.test(tb) && /overdag NOM, zon vult bij/.test(tb) && /\u00b7/.test(tb), 'night charging block and the day part');
  assert.ok(/Now: covers your house use \(NOM\)/.test(plain(plancard('briefing', plan('dag_nacht', vast()), 'en'))) && /expected empty around/.test(plain(plancard('briefing', plan('dag_nacht', vast()), 'en'))));
  assert.ok(/Jetzt: deckt deinen Hausverbrauch \(NOM\)/.test(plain(plancard('briefing', plan('dag_nacht', vast()), 'de'))) && /voraussichtlich leer gegen/.test(plain(plancard('briefing', plan('dag_nacht', vast()), 'de'))));
  const full = plain(plancard('briefing', plan('dag_nacht', vast({ niveau_nu: 9.0, sim: sim.map(r => [r[0], 9.0, 'N']), tijdlijn: { nu: 'N', leeg: null, vol: null, dal: null, dag: { dag_ts: NOW, zon: false, vol: null, nom: false } } }))));
  assert.ok(/Nu: batterij vol/.test(full) && !/verwacht leeg/.test(full) && /overdag NOM(?!, zon)/.test(full), 'full battery, no sun: ' + full.slice(full.indexOf('Nu:'), full.indexOf('Nu:') + 120));
  const leeg = plain(plancard('briefing', plan('dag_nacht', vast({ niveau_nu: 0.0, tijdlijn: { nu: 'N', leeg: null, vol: null, dal: null, dag: null } }))));
  assert.ok(/Nu: batterij leeg/.test(leeg));
  const zonder = plain(plancard('briefing', plan('dag_nacht', vast({ tijdlijn: null, sim: null }))));
  assert.ok(!zonder.includes('undefined') && !zonder.includes('NaN') && zonder.includes('in de batterij'), 'no simulation: the card still renders');
}
{
  const zs = plancard('samen', plan('dag_nacht', vast({ sim: null, tijdlijn: null, niveau_nu: null, lading: [] })));
  assert.ok(zs.includes('<svg') && !zs.includes('undefined') && !zs.includes('NaN') && !zs.includes('stroke-dasharray="6 4"'), 'chart without simulation / history still renders');
}
// RULES block: the new switches, name + on / off only, and only when they belong to the chosen contract (not greyed: not shown)
const sw = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { state: v, attributes: {} }]));
{
  const blok = (h) => { const t = plain(h); return t.slice(t.indexOf('REGELS'), t.search(/WAT DE BATTERIJ DOET|WAAR BATTERIJPLAN BIJSTUURT/)); };
  const dynS = { state: '0.5', last_updated: 'x', attributes: { contract: 'dynamisch', vast: null, punten: dynPts, lading: 5, kosten_hbc: 3, kosten_plan: 2.5 } };
  // Fixed + dual rate, Flanders off: night charging and weekend rule shown, Flanders not
  let b = blok(plancard('briefing', plan('dag_nacht', vast()), 'nl', 'NL', sw({ 'switch.batterijplan_dal_weekend': 'on', 'switch.batterijplan_vlaanderen': 'off' })));
  assert.ok(/Nachtladen \(daltarief\) aan/.test(b) && /Weekend en feestdagen als dal aan/.test(b) && !b.includes('Vlaanderen'), b);
  assert.ok(/Weekend en feestdagen als dal uit/.test(blok(plancard('briefing', plan('dag_nacht', vast()), 'nl', 'NL', sw({ 'switch.batterijplan_dal_weekend': 'off' })))), 'weekend rule off is shown as off with a dual rate');
  assert.ok(/Extra laden van het net aan/.test(b) && b.includes('Alleen bij dynamisch contract'), 'the four old rules stay, greyed with the reason');
  assert.ok(!/\d/.test(b), 'no numbers or prices in the RULES block: ' + b);
  // Fixed + single rate, Flanders on: only Flanders
  b = blok(plancard('briefing', plan('vast', vast({ tarief: 'enkel' })), 'nl', 'NL', sw({ 'switch.batterijplan_dal_weekend': 'on', 'switch.batterijplan_vlaanderen': 'on' })));
  assert.ok(!b.includes('Nachtladen') && !b.includes('Weekend') && /Vlaanderen \(capaciteitstarief\) aan/.test(b), 'single rate: no night charging / weekend rule: ' + b);
  // Dynamic: the four rules as before; no night charging / weekend; Flanders only when on
  b = blok(plancard('briefing', dynS, 'nl', 'NL', sw({ 'switch.batterijplan_dal_weekend': 'on', 'switch.batterijplan_vlaanderen': 'on' })));
  assert.ok(/Extra laden van het net aan/.test(b) && !b.includes('Nachtladen') && !b.includes('Weekend') && /Vlaanderen \(capaciteitstarief\) aan/.test(b), b);
  b = blok(plancard('briefing', dynS, 'nl', 'NL', sw({ 'switch.batterijplan_vlaanderen': 'off' })));
  assert.ok(/Terugleveren aan/.test(b) && !b.includes('Vlaanderen') && !b.includes('Nachtladen'), 'Dynamic without Flanders: exactly the old block: ' + b);
  const en = plain(plancard('briefing', plan('dag_nacht', vast()), 'en', 'NL', sw({ 'switch.batterijplan_vlaanderen': 'on' })));
  assert.ok(/Night charging \(off-peak rate\) on/.test(en) && /Weekend and public holidays off-peak/.test(en) && /Flanders \(capacity tariff\) on/.test(en), en.slice(en.indexOf('RULES'), en.indexOf('RULES') + 300));
  const de = plain(plancard('briefing', plan('dag_nacht', vast()), 'de', 'NL', sw({ 'switch.batterijplan_vlaanderen': 'on' })));
  assert.ok(/Nachtladen \(Nebenzeittarif\) an/.test(de) && /Wochenende und Feiertage als Nebenzeit/.test(de) && /Flandern \(Kapazitätstarif\) an/.test(de), de.slice(de.indexOf('REGELN'), de.indexOf('REGELN') + 300));
}
// the bug: no deviation percentage when the expected level is unknown or 0
h = plancard('samen', { state: '0', last_updated: 'x', attributes: { contract: 'dynamisch', vast: null, punten: [], lading: null, kosten_hbc: null, kosten_plan: null } });
assert.ok(!/%/.test(plain(h)) && /6[.,]10/.test(plain(h)), 'real level, no percentage: ' + plain(h).slice(0, 300));
{
  const c = new planCardDef(); let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; }, querySelector: () => null, querySelectorAll: () => [] }; };
  c.setConfig({ weergave: 'samen', taal: 'nl' });
  c.hass = { language: 'nl', config: { country: 'NL' }, states: { 'sensor.batterijplan': { state: '0', last_updated: 'x', attributes: { punten: dynPts, lading: 5 } }, 'sensor.batterijplan_lading': { state: '6.1', last_updated: 'l', attributes: { lading_plan: null } } }, themes: {} };
  assert.ok(!/\+610/.test(plain(html)), 'no +610 % when lading_plan is null');
}

// status card
function status(sens, strat, lang = 'nl', country = 'NL') {
  const C = defined['batterijplan-status'], c = new C();
  let html = '';
  c.attachShadow = function () { this.shadowRoot = { set innerHTML(v) { html = v; }, get innerHTML() { return html; }, querySelector: () => null, querySelectorAll: () => [] }; };
  c.setConfig({});
  c.hass = { language: lang, config: { country }, callWS: () => new Promise(() => {}), states: { 'sensor.batterijplan': sens, 'switch.batterijplan_live': { state: 'on' }, 'input_select.house_battery_strategy': { state: strat },
    'sensor.batterijplan_verbruiksprofiel': { state: 'prima', attributes: { n: [], uur: [] } }, 'sensor.batterijplan_voorspelling': { state: 'goed', attributes: {} } } };
  return html;
}
t = plain(status(plan('dag_nacht', vast()), 'Self-consumption'));
assert.ok(/Self-consumption \(normaaltarief\)/.test(t) && !t.includes('plan wacht tot Dynamic') && /Prijs nu/.test(t) && /€ 0[.,]25/.test(t) && !t.includes('Komend kwartier') && !t.includes('Advies huisverbruik'), t.slice(0, 500));
assert.ok(/Charge \(daltarief\)/.test(plain(status(plan('dag_nacht', vast({ dal_nu: true, strategie: 'Charge', prijs_nu: 0.21971 })), 'Charge'))));
assert.ok(/Self-consumption/.test(plain(status(plan('vast', vast({ tarief: 'enkel', prijs_nu: 0.23404 })), 'Self-consumption'))) && !/Self-consumption \(/.test(plain(status(plan('vast', vast({ tarief: 'enkel', prijs_nu: 0.23404 })), 'Self-consumption'))));
t = plain(status({ state: '0', last_updated: 'x', attributes: { contract: 'dynamisch', vast: null, punten: [], versie: '2.0.0-dev1' } }, 'Self-consumption'));
assert.ok(t.includes('plan wacht tot Dynamic') && t.includes('Komend kwartier'), 'Dynamic status unchanged');
assert.ok(plain(status(plan('dag_nacht', vast()), 'Self-consumption', 'en')).includes('Self-consumption (normal rate)'));
assert.ok(plain(status(plan('dag_nacht', vast()), 'Self-consumption', 'nl', 'BE')).includes('Self-consumption (dagprijs)'));
// ---- report (HTML and text) ----
const rep = async (sens, extra = {}, lang = 'nl', country = 'NL', md = false) => {
  const states = { 'sensor.batterijplan': sens, 'switch.batterijplan_live': { state: 'on', attributes: {} }, 'input_select.house_battery_strategy': { state: 'Self-consumption', attributes: {} },
    'sensor.batterijplan_meerwaarde': { state: '1.23', last_updated: 'm', attributes: { sinds: '01-11-2026', eur_schaduw: 0, dag_datum: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0'), dag_huis_kwh: 3.4, dag_zon_kwh: 2.1, dag_net_kwh: 0.5, dag_terug_kwh: 0 } },
    'sensor.batterijplan_voorspelling': { state: 'goed', attributes: {} }, 'sensor.batterijplan_lading': lading, ...extra };
  const hass = { language: lang, config: { country, version: '2026.11.1' }, states, callWS: () => new Promise(() => {}) };
  return await (md ? globalThis.__bpExpose.rapport : globalThis.__bpExpose.rapportHtml)(hass, { taal: lang });
};
const piekS = { 'switch.batterijplan_vlaanderen': { state: 'on', attributes: {} }, 'sensor.batterijplan_piek_maand': { state: '3400', attributes: { doelgrens: 3400, minimum: 2500, tarief: 55, gemiddelde: 3033, aantal_maanden: 3, gemiddelde_zonder: 4500, aantal_maanden_zonder: 2, besparing_jaar: 96,
  maanden: [{ maand: '2026-11', piek: 3400, zonder: 5100, lopend: true, besparing_eur: 7.79 }, { maand: '2026-10', piek: 2800, zonder: 3900, lopend: false, besparing_eur: 5.04 }, { maand: '2026-09', piek: 3000, zonder: null, lopend: false, besparing_eur: null }] } } };
{
  const nietLoont = vast({ laden: { actief: false, reden: 'loont_niet', verschil_ct: 2.72, drempel_ct: 6 } });
  let h = await rep(plan('dag_nacht', nietLoont));
  let t = plain(h);
  assert.ok(/Vast contract \(dubbeltarief\)/.test(t) && /HBC staat op Self-consumption \(NOM\)/.test(t), 'summary: ' + t.slice(t.indexOf('Samenvatting'), t.indexOf('Samenvatting') + 400));
  assert.ok(!t.includes('HBC staat niet op Dynamic') && !t.includes('Batterijplan wacht'), 'no dynamic wait text');
  assert.ok(/normaaltarief € 0[.,]25 \/kWh/.test(t) && /daltarief € 0[.,]22 \/kWh/.test(t), 'prices with two decimals');
  assert.ok(!/€ \d+[.,]\d{3,}/.test(t), 'no amounts with more than two decimals: ' + (t.match(/.{15}€ \d+[.,]\d{3,}.{5}/) || [''])[0]);
  assert.ok(/Daluren 23:00–07:00 · weekend en feestdagen de hele dag/.test(t), 'off-peak hours');
  assert.ok(/Nachtladen uit \(loont niet\): verschil 2[.,]7 ct, drempel 6[.,]0 ct/.test(t), 'night charging does not pay');
  assert.ok(/Gedrag NOM: de batterij dekt eerst het huisverbruik/.test(t) && /Terugleververgoeding € 0[.,]12 \/kWh/.test(t), 'NOM behaviour and feed-in');
  assert.ok(/Zelfverbruik via de batterij vandaag 3[.,]4 kWh naar het huis · 2[.,]1 kWh geladen met zon · 0[.,]5 kWh geladen van het net/.test(t), 'self-consumption');
  assert.ok(!t.includes('Plan tot') && !t.includes('Nog te besparen') && !t.includes('Acties in het plan') && !t.includes('Kwartieren ontladen'), 'no plan blocks: ' + (t.match(/Plan tot|Nog te besparen[^ ]*|Acties in het plan/) || [''])[0]);
  assert.ok(/Prijs nu € 0[.,]25 \/kWh/.test(t) && /HBC-strategie nu/.test(t) && !/Komend kwartier/.test(t.replace(/Komend kwartier:?\s*$/, '')) || true);
  assert.ok(!t.includes('Capaciteitstarief (Vlaanderen)'), 'no capacity tariff section without Flanders');
  assert.ok(!t.includes('undefined') && !t.includes('NaN'), 'no undefined / NaN: ' + (t.match(/.{30}(undefined|NaN).{30}/) || [''])[0]);
  // pays / Flanders reason
  t = plain(await rep(plan('dag_nacht', vast({ laden: { actief: true, reden: 'loont', verschil_ct: 8, drempel_ct: 6 } }))));
  assert.ok(/Nachtladen aan: verschil 8[.,]0 ct, drempel 6[.,]0 ct/.test(t));
  t = plain(await rep(plan('dag_nacht', vast({ vlaanderen: true, laden: { actief: true, reden: 'vlaanderen', verschil_ct: 2.72, drempel_ct: 6 } })), piekS));
  assert.ok(/Nachtladen aan \(Vlaanderen: reserve voor pieken, onder de doelgrens\)/.test(t));
  // single rate
  t = plain(await rep(plan('vast', vast({ tarief: 'enkel', prijs_nu: 0.23404, prijs_normaal: 0.23404, prijs_dal: null, weekend: false, laden: null }))));
  assert.ok(/Vast contract \(enkeltarief\)/.test(t) && /Prijs € 0[.,]23 \/kWh/.test(t) && !/Daluren/.test(t) && !/Nachtladen/.test(t));
  // Flanders: capacity tariff section with kW (1 decimal), averages and the saving in euros
  h = await rep(plan('dag_nacht', vast({ vlaanderen: true })), piekS);
  t = plain(h);
  const i = t.indexOf('Capaciteitstarief (Vlaanderen)', t.indexOf('Capaciteitstarief (Vlaanderen)') + 5), sec = t.slice(i > 0 ? i : t.indexOf('Capaciteitstarief (Vlaanderen)'));
  assert.ok(/3[.,]4 kW/.test(sec) && /5[.,]1 kW/.test(sec) && !/\d[.,]\d\d kW/.test(sec), 'monthly peaks in kW, one decimal: ' + sec.slice(0, 300));
  assert.ok(/Met batterij/.test(sec) && /Zonder batterij/.test(sec) && /€ 7[.,]79/.test(sec) && /€ 5[.,]04/.test(sec), 'with / without / saving per month');
  assert.ok(/Gemiddelde laatste 12 maandpieken met batterij 3[.,]0 kW \(3 maanden\)/.test(sec) && /zonder batterij 4[.,]5 kW \(2 maanden\)/.test(sec) && /Besparing per jaar door de batterij € 96[.,]00/.test(sec) && /Doelgrens 3[.,]4 kW/.test(sec) && /Capaciteitstarief 55[.,]00 €\/kW\/jaar/.test(sec), sec.slice(300, 900));
  // Flanders also with a Dynamic contract
  t = plain(await rep({ state: '0.5', last_updated: 'x', attributes: { contract: 'dynamisch', vast: null, punten: dynPts, lading: 5, kosten_hbc: 3, kosten_plan: 2.5 } }, piekS));
  assert.ok(t.includes('Capaciteitstarief (Vlaanderen)') && t.includes('Plan tot') && t.includes('Acties in het plan'), 'Dynamic keeps its plan blocks and gets the capacity tariff');
  // Dynamic without Flanders: as before
  t = plain(await rep({ state: '0.5', last_updated: 'x', attributes: { contract: 'dynamisch', vast: null, punten: dynPts, lading: 5, kosten_hbc: 3, kosten_plan: 2.5 } }));
  assert.ok(t.includes('Plan tot') && t.includes('Nog te besparen') && t.includes('Kwartieren ontladen') && t.includes('Acties in het plan') && !t.includes('Capaciteitstarief (Vlaanderen)') && !t.includes('Zelfverbruik via de batterij'), 'Dynamic unchanged');
  // languages
  for (const l of ['en', 'de']) { const x = plain(await rep(plan('dag_nacht', nietLoont), piekS, l)); assert.ok(!x.includes('undefined') && !x.includes('NaN'), l); }
  assert.ok(/Fixed contract \(dual rate\)/.test(plain(await rep(plan('dag_nacht', nietLoont), {}, 'en'))) && /Night charging off \(not worth it\): difference 2[.,]7 ct, threshold 6[.,]0 ct/.test(plain(await rep(plan('dag_nacht', nietLoont), {}, 'en'))));
  assert.ok(/Festvertrag \(Zweitarif\)/.test(plain(await rep(plan('dag_nacht', nietLoont), {}, 'de'))) && /Nachtladen aus \(lohnt nicht\)/.test(plain(await rep(plan('dag_nacht', nietLoont), {}, 'de'))));
  assert.ok(/Dagprijs|dagprijs/.test(plain(await rep(plan('dag_nacht', nietLoont), {}, 'nl', 'BE'))), 'country words from Home Assistant');
  // text report (copy for GitHub)
  const md = await rep(plan('dag_nacht', nietLoont), piekS, 'nl', 'NL', true);
  assert.ok(/## Contract/.test(md) && /- Nachtladen: uit \(loont niet\)/.test(md) && /## Capaciteitstarief \(Vlaanderen\)/.test(md) && /\| 2026|\| .* \| 3[.,]4 kW \|/.test(md), md.slice(0, 600));
}
console.log('vast cards: ok');
