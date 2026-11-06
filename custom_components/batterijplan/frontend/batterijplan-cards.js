// Batterijplan cards in the house style (same structure as hesc-cards.js).
//   custom:batterijplan-opbrengst Earnings (counters from sensor.batterijplan_meerwaarde), explanation behind the (i)
//   custom:batterijplan-knoppen   Row of buttons that open windows (Live switch first)
//   custom:batterijplan-velden    Own input fields (slider, - value + pill, chips, text on the line), with tabs
//   custom:batterijplan-status    Status with logo; every line has an (i) with an explanation
//   custom:batterijplan-rapport   Report window (view, download, copy)
// Texts in Dutch, English and German; the language follows the user profile unless the card config has taal: nl|en|de.
// Served by the integration under /batterijplan_frontend/.
(() => {
  if (customElements.get("batterijplan-status")) return;
  const BASE = "/batterijplan_frontend/";

  // House-style icons (own work) as icon set "batterijplan:", so the cards have their icons without any other integration.
  const BP_ICONS = {"kalender-klok":"M31.5 10.0L31.2 8.7L29.9 7.1L28.0 6.5L26.7 6.8L25.1 8.1L24.6 9.3L24.5 14.5L16.5 14.6L14.2 14.9L12.6 15.5L10.6 16.6L8.9 18.2L7.7 20.1L6.9 22.2L6.5 26.0L6.6 70.3L7.5 73.4L9.1 76.0L11.4 77.9L14.2 79.1L17.9 79.5L40.7 79.4L42.5 78.5L43.2 77.3L43.5 76.0L43.2 74.7L42.5 73.5L40.7 72.6L17.5 72.5L15.6 72.2L14.4 71.4L13.7 70.1L13.5 68.5L13.5 41.5L68.9 41.5L70.1 42.9L72.0 43.5L73.3 43.2L74.5 42.5L75.4 40.7L75.5 25.9L75.2 23.0L74.6 20.8L73.8 19.2L72.6 17.6L71.2 16.5L68.7 15.2L66.3 14.6L57.5 14.5L57.5 10.0L57.2 8.7L55.9 7.1L54.7 6.6L53.3 6.6L52.1 7.1L50.8 8.7L50.5 10.0L50.5 14.5L31.5 14.5ZM24.8 27.3L26.1 28.9L27.3 29.4L29.3 29.2L30.5 28.5L31.4 26.7L31.5 21.5L50.5 21.5L50.5 26.0L50.8 27.3L51.5 28.5L52.7 29.2L54.7 29.4L55.9 28.9L57.2 27.3L57.5 26.0L57.5 21.5L65.4 21.6L67.4 22.4L68.3 23.9L68.5 25.5L68.5 34.5L13.5 34.5L13.5 25.0L14.0 23.1L14.9 22.1L15.9 21.7L17.5 21.5L24.5 21.5L24.5 26.0ZM86.3 65.4L85.4 61.5L83.8 57.9L81.5 54.6L78.6 51.8L75.2 49.7L71.4 48.2L67.5 47.6L63.4 47.7L59.5 48.6L55.9 50.2L52.6 52.5L49.8 55.4L47.7 58.8L46.2 62.6L45.6 66.5L45.7 70.6L46.6 74.5L48.2 78.1L50.5 81.4L53.4 84.2L56.8 86.3L60.6 87.8L64.5 88.4L68.6 88.3L72.5 87.4L76.1 85.8L79.4 83.5L82.2 80.6L84.3 77.2L85.8 73.4L86.4 69.5ZM63.2 70.1L64.3 71.0L71.9 75.3L73.2 75.5L75.1 74.8L76.0 73.7L76.5 72.4L76.1 70.4L74.7 69.0L69.5 66.0L69.4 57.3L68.5 55.5L67.3 54.8L66.0 54.5L69.5 55.0L72.0 55.9L74.2 57.3L76.7 59.8L78.1 62.0L79.0 64.5L79.5 67.1L79.4 69.8L78.8 72.3L77.7 74.7L76.1 76.9L74.2 78.7L71.2 80.5L68.6 81.2L66.0 81.5L62.5 81.0L59.3 79.7L56.5 77.5L54.3 74.7L53.2 72.3L52.6 69.8L52.6 66.2L53.5 62.8L54.8 60.5L56.5 58.5L59.3 56.3L62.5 55.0L64.2 54.6L66.0 54.5L64.7 54.8L63.5 55.5L62.6 57.3L62.5 68.0L62.6 68.7Z","euro":"M58.7 44.4L59.9 43.9L60.9 42.9L61.5 41.0L60.9 39.1L59.9 38.1L58.7 37.6L30.2 37.5L31.6 35.1L34.5 31.6L38.2 28.9L42.3 26.9L46.7 25.8L51.3 25.6L55.8 26.3L60.1 27.9L63.9 30.4L68.0 34.2L69.3 34.7L71.3 34.5L72.8 33.2L73.4 31.3L72.8 29.3L68.0 24.7L62.9 21.5L58.0 19.6L51.3 18.5L45.4 18.9L40.2 20.2L34.8 22.7L29.5 26.8L25.6 31.4L23.0 36.0L22.5 37.5L17.3 37.6L16.1 38.1L15.1 39.1L14.5 41.0L14.8 42.3L15.5 43.5L17.3 44.4L20.8 44.5L20.5 47.6L20.8 51.5L17.3 51.6L16.1 52.1L14.8 53.7L14.6 55.7L15.1 56.9L16.7 58.2L18.0 58.5L22.5 58.5L23.0 60.0L26.0 65.2L30.0 69.7L34.8 73.3L40.2 75.8L45.4 77.1L51.3 77.5L57.3 76.6L63.5 74.2L68.6 70.9L72.3 67.2L73.1 66.1L73.3 64.1L72.4 62.3L70.6 61.3L68.6 61.4L67.5 62.2L63.9 65.6L60.1 68.1L55.8 69.7L51.3 70.4L46.7 70.2L42.3 69.1L38.2 67.1L34.5 64.4L31.6 60.9L30.2 58.5L58.7 58.4L59.9 57.9L61.2 56.3L61.4 54.3L60.9 53.1L59.3 51.8L58.0 51.5L27.8 51.5L27.5 48.0L27.8 44.5Z","euro-klok":"M43.3 39.2L44.9 37.9L45.5 36.0L44.9 34.1L43.3 32.8L42.0 32.5L22.6 32.5L24.7 30.0L27.3 28.0L30.4 26.5L33.6 25.7L36.9 25.5L40.2 26.1L43.4 27.3L46.2 29.0L49.4 32.0L50.7 32.5L52.0 32.5L53.3 32.0L54.6 30.4L54.8 29.0L54.2 27.1L50.3 23.3L46.8 21.1L42.4 19.4L37.0 18.5L32.2 18.8L28.3 19.8L24.0 21.8L20.1 24.7L17.0 28.3L14.5 32.5L9.3 32.6L8.1 33.1L7.1 34.1L6.5 36.0L6.8 37.3L7.5 38.5L9.3 39.4L12.8 39.5L12.5 41.6L12.8 44.5L9.3 44.6L8.1 45.1L6.8 46.7L6.6 48.7L7.1 49.9L8.7 51.2L10.0 51.5L14.5 51.5L16.6 55.2L19.6 58.8L23.4 61.8L27.6 63.9L32.9 65.3L37.0 65.5L41.7 64.8L46.8 62.9L50.8 60.2L53.7 57.4L54.5 56.3L54.8 55.0L54.6 53.6L53.8 52.5L52.0 51.5L50.0 51.6L48.9 52.4L46.2 55.0L43.4 56.7L40.2 57.9L36.9 58.5L33.6 58.3L30.4 57.5L27.3 56.0L24.7 54.0L22.6 51.5L42.7 51.4L43.9 50.9L45.2 49.3L45.4 47.3L44.9 46.1L43.3 44.8L42.0 44.5L19.8 44.5L19.5 42.0L19.8 39.5L42.0 39.5ZM90.4 69.7L89.6 66.2L88.1 62.9L86.0 59.9L83.4 57.4L80.3 55.5L76.9 54.2L73.3 53.5L69.7 53.6L66.2 54.4L62.9 55.9L59.9 58.0L57.4 60.6L55.5 63.7L54.2 67.1L53.5 70.7L53.6 74.3L54.4 77.8L55.9 81.1L58.0 84.1L60.6 86.6L63.7 88.5L67.1 89.8L70.7 90.5L74.3 90.4L77.8 89.6L81.1 88.1L84.1 86.0L86.6 83.4L88.5 80.3L89.8 76.9L90.5 73.3ZM69.1 73.9L70.1 74.9L76.7 79.2L78.0 79.5L79.9 78.9L81.2 77.3L81.4 75.3L80.5 73.5L75.5 70.1L75.5 63.0L75.2 61.7L74.7 60.8L76.4 61.4L78.4 62.4L80.1 63.9L81.6 65.6L82.9 68.3L83.5 72.0L82.9 75.7L81.6 78.4L79.6 80.6L76.4 82.6L72.8 83.5L69.8 83.3L66.9 82.3L63.9 80.1L62.0 77.7L60.7 74.2L60.6 70.5L61.4 67.6L63.4 64.4L65.6 62.4L67.6 61.4L69.3 60.8L68.8 61.7L68.5 63.0L68.5 72.0Z","schuifregelaars":"M18.8 20.6L17.1 21.0L15.5 21.7L14.1 22.7L12.9 24.3L12.2 25.8L11.9 27.3L11.9 32.3L12.2 34.0L12.8 35.4L13.7 36.6L14.9 37.7L17.5 39.0L21.1 39.2L21.1 84.2L21.4 85.3L22.0 86.3L23.0 87.0L24.1 87.2L25.3 87.0L26.3 86.3L26.9 85.3L27.1 84.2L27.1 39.2L29.5 39.2L31.4 38.7L33.2 37.7L34.6 36.4L35.5 35.0L36.1 33.1L36.2 27.6L35.4 24.7L34.4 23.2L33.3 22.2L32.1 21.4L30.5 20.8L27.1 20.6L27.1 11.2L26.6 10.1L25.3 9.0L24.1 8.8L23.0 9.0L21.7 10.1L21.1 11.8L21.1 20.6ZM21.1 33.2L18.9 33.2L18.3 32.8L17.9 32.2L17.9 27.8L18.2 27.1L18.9 26.7L21.1 26.6ZM28.8 26.6L29.7 27.0L30.1 27.7L30.1 32.1L29.8 32.7L29.2 33.1L27.1 33.2L27.1 26.6ZM65.7 31.1L64.3 31.4L62.9 32.2L61.6 33.3L60.8 34.7L60.2 36.8L60.2 43.2L60.5 44.6L61.2 45.9L63.0 47.8L65.3 48.7L68.8 48.8L68.8 84.2L69.1 85.3L70.2 86.7L71.3 87.1L72.4 87.1L73.5 86.7L74.3 85.9L74.8 84.2L74.8 48.8L78.8 48.7L81.2 47.7L82.3 46.7L83.3 45.4L83.8 44.0L84.0 42.5L83.9 36.4L83.4 34.8L82.6 33.4L81.2 32.2L79.6 31.4L78.0 31.1L74.8 31.0L74.8 11.8L74.3 10.1L73.0 9.0L71.8 8.8L70.7 9.0L69.7 9.7L69.1 10.7L68.8 11.8L68.8 31.0ZM77.7 37.1L77.9 37.3L77.9 42.6L77.7 42.8L74.8 42.8L74.8 37.0ZM66.5 42.8L66.2 42.5L66.2 37.2L66.4 37.1L68.8 37.0L68.8 42.8ZM45.4 85.3L46.5 86.7L48.2 87.2L49.3 87.0L50.7 85.9L51.2 84.2L51.2 70.8L54.9 70.7L57.2 69.7L58.3 68.8L59.1 67.6L59.7 66.3L59.9 65.0L59.9 58.5L59.5 56.9L58.7 55.5L57.2 54.1L55.6 53.3L54.3 53.1L51.2 53.0L51.2 11.8L51.0 10.7L50.3 9.7L49.3 9.0L48.2 8.8L47.1 9.0L46.1 9.7L45.4 10.7L45.2 11.8L45.2 53.0L41.5 53.1L39.1 54.0L38.0 54.9L37.0 56.2L36.5 57.5L36.3 58.9L36.3 65.4L36.7 66.9L37.5 68.3L38.9 69.7L40.5 70.5L42.1 70.8L45.2 70.8L45.2 84.2ZM51.2 59.0L53.9 59.2L53.9 64.7L51.2 64.8ZM42.4 64.8L42.2 64.6L42.3 59.1L45.2 59.0L45.2 64.8Z","thuisbatterij":"M84.2 51.0L86.2 51.5L87.5 51.2L88.6 50.3L89.3 49.2L89.5 47.8L88.8 45.9L50.3 11.4L49.7 11.0L48.4 10.5L46.9 10.7L45.7 11.4L7.7 45.4L6.8 46.5L6.5 47.8L6.7 49.2L7.4 50.3L8.5 51.2L10.5 51.5L12.3 50.6L16.5 46.9L16.5 84.0L16.8 85.3L17.5 86.5L18.7 87.2L20.0 87.5L76.0 87.5L77.9 86.9L79.2 85.3L79.5 84.0L79.5 46.9ZM72.7 40.8L72.5 80.5L23.5 80.5L23.5 42.0L23.3 40.8L48.0 18.7ZM35.4 52.5L33.0 53.1L30.8 54.6L29.2 56.8L28.6 59.1L28.6 73.4L29.1 75.0L30.0 76.5L31.1 77.7L32.4 78.6L34.2 79.3L35.9 79.5L56.0 79.5L57.6 79.3L60.1 78.3L62.0 76.5L63.2 74.1L63.5 71.4L64.7 72.2L66.0 72.5L67.9 71.9L68.9 70.9L69.5 69.0L69.5 63.0L69.2 61.7L67.9 60.1L66.7 59.6L64.7 59.8L63.5 60.6L63.3 58.4L62.6 56.4L61.2 54.6L59.6 53.4L58.1 52.8L56.4 52.5ZM56.0 59.5L56.4 59.7L56.5 60.1L56.5 71.9L56.3 72.4L36.1 72.5L35.6 72.3L35.5 60.1L35.7 59.6Z","info":"M52.8 30.8L52.4 29.0L51.2 27.5L49.6 26.5L47.7 26.2L45.9 26.7L44.4 27.8L43.4 29.4L43.2 31.3L43.6 33.1L44.8 34.6L46.4 35.6L48.3 35.9L50.1 35.4L51.6 34.3L52.6 32.7ZM49.6 31.2L49.0 32.2L47.9 32.6L46.8 32.1L46.4 30.9L47.0 29.9L48.1 29.5L49.2 30.0ZM87.0 47.9L86.7 43.0L86.2 40.3L85.0 35.6L84.0 33.0L81.8 28.6L80.4 26.3L77.4 22.4L75.5 20.4L71.8 17.1L69.6 15.5L65.3 13.1L62.8 11.9L58.2 10.4L55.5 9.7L50.6 9.1L47.9 9.0L43.0 9.3L40.3 9.8L35.6 11.0L33.0 12.0L28.6 14.2L26.3 15.6L22.4 18.6L20.4 20.5L17.1 24.2L15.5 26.4L13.1 30.7L11.9 33.2L10.4 37.8L9.7 40.5L9.1 45.4L9.0 48.1L9.3 53.0L9.8 55.7L11.0 60.4L12.0 63.0L14.2 67.4L15.6 69.7L18.6 73.6L20.5 75.6L24.2 78.9L26.4 80.5L30.7 82.9L33.2 84.1L37.8 85.6L40.5 86.3L45.4 86.9L48.1 87.0L53.0 86.7L55.7 86.2L60.4 85.0L63.0 84.0L67.4 81.8L69.7 80.4L73.6 77.4L75.6 75.5L78.9 71.8L80.5 69.6L82.9 65.3L84.1 62.8L85.6 58.2L86.3 55.5L86.9 50.6ZM80.7 52.3L79.2 58.6L76.6 64.5L72.8 69.8L68.1 74.2L62.6 77.6L56.5 79.9L50.2 80.9L43.7 80.7L37.4 79.2L31.5 76.6L26.2 72.8L21.8 68.1L18.4 62.6L16.1 56.5L15.1 50.2L15.3 43.7L16.8 37.4L19.4 31.5L23.2 26.2L27.9 21.8L33.4 18.4L39.5 16.1L45.8 15.1L52.3 15.3L58.6 16.8L64.5 19.4L69.8 23.2L74.2 27.9L77.6 33.4L79.9 39.5L80.9 45.8ZM45.4 67.4L46.5 68.8L48.2 69.3L49.3 69.1L50.3 68.4L51.1 66.9L51.2 43.8L51.0 42.7L50.3 41.7L48.8 40.9L47.6 40.9L46.5 41.3L45.7 42.1L45.3 43.2L45.2 66.3Z"};
  window.customIcons = window.customIcons || {};
  if (!window.customIcons.batterijplan) window.customIcons.batterijplan = {
    getIcon: async (name) => { const v = BP_ICONS[name]; if (!v) return undefined; return Array.isArray(v) ? { path: v[0], secondaryPath: v[1], viewBox: "0 0 96 96" } : { path: v, viewBox: "0 0 96 96" }; },
    getIconList: async () => Object.keys(BP_ICONS).map((name) => ({ name })),
  };

  const IDS = {
    plan: "sensor.batterijplan",
    marks: "sensor.hbc_energy_prices_data",
  };
  // Solcast sensors chosen by the backend (filled-in fields, then Solcast by platform, then known names); old backend: English ids
  const zonIds = (S) => { const pa = ((S["sensor.batterijplan_2"] || S[IDS.plan] || {}).attributes) || {};
    return { vandaag: "zon_vandaag" in pa ? pa.zon_vandaag : "sensor.solcast_pv_forecast_forecast_today",
             morgen: "zon_morgen" in pa ? pa.zon_morgen : "sensor.solcast_pv_forecast_forecast_tomorrow" }; };
  // Dutch is the source language; English and German come from I18N (below). Translation key = the Dutch text.
  const TIP = {};
  let LANG = "nl";
  const DAGEN = { nl: ["zo", "ma", "di", "wo", "do", "vr", "za"], en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] };
  const MAANDEN = { nl: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"], en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], de: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"] };
  const LOC = { nl: "nl-NL", en: "en-GB", de: "de-DE" };
  let DAG = DAGEN.nl, MAAND = MAANDEN.nl;
  const I18N = {
   "en": {
    "Goedkoopste en duurste kwartier van die dag.": "Cheapest and most expensive quarter of that day.",
    "Gemiddelde prijs van die dag zoals HBC hem geeft: inclusief energiebelasting, opslag en btw.": "Average price of that day as HBC gives it: including energy tax, supplier mark-up and VAT.",
    "Prijs van stroom dit kwartier zoals HBC hem geeft: inclusief energiebelasting, opslag en btw.": "Electricity price this quarter as HBC gives it: including energy tax, supplier mark-up and VAT.",
    "prijs all-in": "price all-in",
    "prijs all-in (ct)": "price all-in (ct)",
    "Gemiddelde prijs (all-in)": "Average price (all-in)",
    "Prijs nu (all-in)": "Price now (all-in)",
    "Terug": "Back",
    "Hoe lees je dit?": "How to read this?",
    "lading als HBC het alleen deed": "charge if HBC did it alone",
    "Extra t.o.v. HBC alleen": "Extra vs HBC alone",
    "Sensoren": "Sensors",
    "Instellingen": "Settings",
    "Advies HBC": "HBC advice",
    "Opbrengst": "Earnings",
    "Uit = schaduw: het plan rekent alleen mee. Aan = Batterijplan stuurt HBC bij.": "Off = shadow: the plan only calculates along. On = Batterijplan steers HBC.",
    "Hier is iets te doen": "Something needs attention here",
    "Sluiten": "Close",
    "schaduw": "shadow",
    "stuurt HBC": "steering HBC",
    "7 dagen": "7 days",
    "Aanpassen naar": "Change to",
    "Advies volgt als je verbruik geleerd is en er een week gemeten is": "Advice follows once your consumption is learned and a week has been measured",
    "Advies voor HBC": "Advice for HBC",
    "geen grens": "no limit",
    "Aantal goedkope uren": "Cheapest hours",
    "Aantal dure uren": "Expensive hours",
    "Huisverbruik op zon": "House use on solar",
    "Gemiddeld {x} kWh huisverbruik op zon in de laatste 7 dagen.": "On average {x} kWh of house use on solar in the last 7 days.",
    "De laatste 7 dagen opnieuw doorgerekend: {x} goedkoper dan nu.": "The last 7 days calculated again: {x} cheaper than now.",
    "Past het best bij de laatste 7 dagen.": "Fits the last 7 days best.",
    "Advies wijkt minder dan {x} af: Batterijplan laat het zoals het is.": "Advice differs by less than {x}: Batterijplan leaves it as it is.",
    "Nog aan het meten: dag {x} van 7": "Still measuring: day {x} of 7",
    "Batterijplan bewaart per kwartier de prijs, je huisverbruik en je zon. Na 7 volle dagen rekent het die opnieuw door en komt het advies. Tot die tijd verandert er niets.": "Batterijplan keeps the price, your house use and your solar per quarter. After 7 full days it calculates them again and the advice follows. Until then nothing changes.",
    "Zonnesensor ontbreekt: kies die bij Sensoren, anders kan er niet worden doorgerekend.": "Solar sensor missing: choose it under Sensors, otherwise nothing can be calculated.",
    "Advies nog niet te berekenen: de gegevens van HBC of de batterijcapaciteit ontbreken.": "Advice cannot be calculated yet: the HBC data or the battery capacity is missing.",
    "Berekend op": "Calculated on",
    "duurde": "took",
    "HBC-instellingen automatisch": "Auto-adjust HBC settings",
    "Aan: Batterijplan zet de waarden zelf in HBC, alleen als het verschil minstens 1 uur of 0,5 kWh is. Jouw eigen waarden worden onthouden en komen exact terug als je dit uitzet. Elke wijziging staat in het logboek.": "On: Batterijplan sets the values in HBC itself, only when the difference is at least 1 hour or 0.5 kWh. Your own values are remembered and come back exactly when you switch this off. Every change is in the logbook.",
    "Uit: Batterijplan verandert niets in HBC. Je ziet hierboven alleen het advies.": "Off: Batterijplan changes nothing in HBC. Above you only see the advice.",
    "In HBC stel je in hoeveel uur van de dag als goedkoop en als duur telt (cheapest hrs, expensive hrs) en hoeveel zonne-energie je huis zelf direct opmaakt (Solar reserved for house).": "In HBC you set how many hours of the day count as cheap and as expensive (cheapest hrs, expensive hrs) and how much solar energy your house uses directly (Solar reserved for house).",
    "Batterijplan bewaart 7 dagen per kwartier de prijs, je huisverbruik en je zon. Elke nacht rekent het die 7 dagen opnieuw door met zijn eigen plan, voor verschillende waarden van cheapest hrs en expensive hrs, en kiest de goedkoopste. Bij een gelijke uitkomst blijft het bij de waarde die het dichtst bij de huidige ligt.": "Batterijplan keeps 7 days of the price, your house use and your solar per quarter. Every night it calculates those 7 days again with its own plan, for different values of cheapest hrs and expensive hrs, and picks the cheapest. With an equal result it stays with the value closest to the current one.",
    "Een oranje stip betekent: het advies wijkt minstens 1 uur (of 0,5 kWh) af van wat in HBC staat. Je ziet dat ook als automatisch aanpassen uit staat.": "An orange dot means: the advice differs by at least 1 hour (or 0.5 kWh) from what is set in HBC. You see that also when auto-adjust is off.",
    "Alleen de momenten waarop Batterijplan iets anders doet dan HBC.": "Only the moments when Batterijplan does something different from HBC.",
    "Batterijplan rekent elke dag uit wat je huis op zon kan gebruiken vanaf het eerste goedkope kwartier tot het eind van de dag (geleerd verbruik naast de zonverwachting) en vergelijkt het gemiddelde van de laatste 7 dagen met jouw instelling.": "Every day Batterijplan works out how much solar your house can use from the first cheap quarter to the end of the day (learned usage next to the solar forecast) and compares the average of the last 7 days with your setting.",
    "Batterijplan staat stil": "Batterijplan is paused",
    "Batterijplan stuurt alleen bij als HBC op Dynamic staat en telt in de tussentijd niets op. Het leren van je verbruik gaat gewoon door.": "Batterijplan only steers when HBC is set to Dynamic and adds nothing up in the meantime. Learning your consumption simply continues.",
    "Beste dag": "Best day",
    "Beste dag:": "Best day:",
    "Beste maand:": "Best month:",
    "Bij overschot ontladen telt alleen de lading die echt uit de batterij ging: wat je daardoor niet hoeft te kopen, min wat het kost om die lading op het goedkope moment terug te laden (inclusief verlies in de batterij).": "For surplus discharging only the charge that really left the battery counts: what you did not have to buy, minus the cost of recharging that charge at the cheap moment (including battery losses).",
    "Bij vasthouden telt de lading mee tegen de gemiddelde prijs van de dure kwartieren waar het plan haar later voor inzet.": "For holding, the charge counts at the average price of the expensive quarters the plan uses it for later.",
    "Bruikbare lading van alle batterijen samen: het laadpercentage boven de ondergrens van HBC, maal de capaciteit uit de instellingen.": "Usable charge of all batteries together: the state of charge above the HBC lower limit, times the capacity from the settings.",
    "Daar laadt HBC weer bij en maakt Batterijplan een nieuw plan. Ga met de muis over een cijfer voor meer uitleg.": "There HBC recharges and Batterijplan makes a new plan. Hover over a number for more explanation.",
    "De blauwe lijn is de lading in kWh (as rechts): doorgetrokken = gemeten, gestreept = verwacht volgens het plan. Links van Nu is voorbij en iets gedempt.": "The blue line is the charge in kWh (right axis): solid = measured, dashed = expected by the plan. Left of Now is the past and slightly dimmed.",
    "Dure kwartieren waarin de batterij bewust niet ontlaadt, omdat dezelfde lading later in een nog duurder kwartier meer oplevert.": "Expensive quarters in which the battery deliberately does not discharge, because the same charge earns more later in an even more expensive quarter.",
    "Elk kwartier schat Batterijplan het verschil tussen HBC alleen en HBC met Batterijplan, inclusief btw.": "Every quarter Batterijplan estimates the difference between HBC alone and HBC with Batterijplan, including VAT.",
    "Gemiddeld per dag": "Average per day",
    "Gemiddeld per maand": "Average per month",
    "Gemiddelde inkoopprijs van die dag, zonder energiebelasting, opslag en btw.": "Average purchase price of that day, without energy tax, supplier mark-up and VAT.",
    "Gemiddelde kale prijs": "Average bare price",
    "Geschatte opbrengst bovenop wat HBC alleen had gedaan, opgeteld over de gekozen periode.": "Estimated gain on top of what HBC alone would have done, added up over the chosen period.",
    "Goedkoopste en duurste kwartier van die dag (kale prijs).": "Cheapest and most expensive quarter of that day (bare price).",
    "Groen": "Green",
    "HBC regelt het zelf.": "HBC handles it itself.",
    "HBC staat op": "HBC is set to",
    "Het blijft een schatting; je energierekening is het echte bewijs. Staat HBC niet op Dynamic, dan telt er niets bij.": "It remains an estimate; your energy bill is the real proof. If HBC is not on Dynamic, nothing is added.",
    "Het plan loopt tot het volgende goedkope moment": "The plan runs until the next cheap moment",
    "Hoe lang de batterij tot het volgende goedkope moment aan het huis levert, in de duurste kwartieren die Batterijplan daarvoor kiest.": "How long the battery supplies the house until the next cheap moment, in the most expensive quarters Batterijplan picks for it.",
    "Huisverbruik op zon (Solar reserved for house)": "House consumption on solar (Solar reserved for house)",
    "In HBC vul je in hoeveel zonne-energie je huis zelf direct opmaakt (Solar reserved for house). HBC trekt dat af van de zon die nog komt, op het moment dat het goedkoop laadt.": "In HBC you enter how much solar energy your house uses directly itself (Solar reserved for house). HBC subtracts that from the solar still to come, at the moment it charges cheaply.",
    "In de batterij nu": "In the battery now",
    "Ingesteld": "Set to",
    "Inkoopprijs van stroom dit kwartier, zonder energiebelasting, opslag en btw.": "Purchase price of electricity this quarter, without energy tax, supplier mark-up and VAT.",
    "Kale prijs nu": "Bare price now",
    "Kies de dag of periode met de datumkiezer erboven. Ga met de muis over de grafiek voor de cijfers per kwartier.": "Pick the day or period with the date picker above. Hover over the chart for the numbers per quarter.",
    "Kwartieren ontladen / vastgehouden / overschot": "Quarters discharged / held / surplus",
    "Laagste – hoogste": "Lowest – highest",
    "Lading die er tot het volgende goedkope moment te veel in zit. Batterijplan levert die nu al aan het huis, in plaats van met een volle batterij te gaan laden. Met de geschatte opbrengst.": "Charge that is more than needed until the next cheap moment. Batterijplan already supplies it to the house now, instead of going into charging with a full battery. With the estimated gain.",
    "Lading verschoven naar duurdere momenten": "Charge moved to more expensive moments",
    "Lege stukken in de balk: daar regelt HBC het zelf (laden met zon, ontladen, of niets). De blauwe streep is nu.": "Empty parts of the bar: there HBC handles it itself (charging on solar, discharging, or nothing). The blue line is now.",
    "Live": "Live",
    "Morgen": "Tomorrow",
    "Niets bij te sturen": "Nothing to steer",
    "Nog aan het meten": "Still measuring",
    "Nu": "Now",
    "Nu ingesteld": "Now set to",
    "Ontladen in dure kwartieren": "Discharging in expensive quarters",
    "Opgeleverd in deze periode": "Gained in this period",
    "Overschot ontladen": "Surplus discharging",
    "Pas als het 1 kWh of meer afwijkt, krijg je een advies. Batterijplan verandert zelf niets in HBC.": "Only when it differs by 1 kWh or more do you get advice. Batterijplan never changes anything in HBC itself.",
    "Per dag:": "Per day:",
    "Per week of maand:": "Per week or month:",
    "Plan": "Plan",
    "Plan vandaag en morgen": "Plan today and tomorrow",
    "Prijs en batterij": "Price and battery",
    "Schaduw": "Shadow",
    "Staat dat te hoog, dan laadt HBC meer van het net dan nodig; te laag, dan is de batterij 's avonds te leeg voor de dure uren.": "Set too high and HBC charges more from the grid than needed; too low and the battery is too empty in the evening for the expensive hours.",
    "Staat goed": "Set correctly",
    "Totaal sinds": "Total since",
    "Uitleg: wat zie ik hier?": "Explanation: what am I looking at?",
    "Vandaag": "Today",
    "Vannacht extra laden:": "Extra charging tonight:",
    "Vasthouden voor later": "Holding for later",
    "Voor deze dag zijn (nog) geen prijzen bekend.": "No prices are known (yet) for this day.",
    "Voor deze periode is nog niets opgeteld. Batterijplan telt vanaf de eerste dag dat het draait.": "Nothing has been added up for this period yet. Batterijplan counts from the first day it runs.",
    "Wat er gebeurde": "What happened",
    "Wat is dit?": "What is this?",
    "Wat levert het op": "What does it earn",
    "Wat telt hier?": "What counts here?",
    "Wat zie je?": "What do you see?",
    "de grijze lijn is de kale stroomprijs per kwartier. De gekleurde vlakken zijn de kwartieren waarin Batterijplan bijstuurt (zelfde kleuren als het plan).": "the grey line is the bare electricity price per quarter. The coloured areas are the quarters in which Batterijplan steers (same colours as the plan).",
    "duur volgens HBC — nog niet ingepland": "expensive according to HBC — not planned yet",
    "een andere strategie": "another strategy",
    "een groene staaf per dag met wat Batterijplan geschat opleverde bovenop HBC alleen.": "a green bar per day with what Batterijplan is estimated to have gained on top of HBC alone.",
    "geen gegevens": "no data",
    "gemiddeld nodig": "average needed",
    "gewoon — HBC laadt met zon (of doet niets)": "regular — HBC charges on solar (or does nothing)",
    "goedkoop volgens HBC": "cheap according to HBC",
    "kale prijs": "bare price",
    "kale prijs (ct)": "bare price (ct)",
    "laden van het net (goedkoop)": "charging from the grid (cheap)",
    "lading": "charge",
    "lading (kWh): doorgetrokken = gemeten, gestreept = verwacht volgens plan": "charge (kWh): solid = measured, dashed = expected by plan",
    "lading daarna ±": "charge afterwards ±",
    "lading vasthouden voor een later, duurder kwartier": "holding charge for a later, more expensive quarter",
    "paars": "purple",
    "nu ingesteld": "now set to",
    "om": "at",
    "ontladen in een duur kwartier": "discharging in an expensive quarter",
    "ontladen voor het huis": "discharging for the house",
    "opgeleverd": "gained",
    "opgeleverd bovenop HBC (geschat, € per dag)": "gained on top of HBC (estimated, € per day)",
    "opgeleverd bovenop HBC (geschat, € per maand)": "gained on top of HBC (estimated, € per month)",
    "oranje": "orange",
    "overschot ontladen": "surplus discharging",
    "start": "start",
    "tot": "until",
    "u": "h",
    "vasthouden (Batterijplan stuurt bij)": "holding (Batterijplan steers)",
    "voorbij": "past",
    "waarvan live (echt gestuurd)": "of which live (really steered)",
    "waarvan schaduw (zou opleveren)": "of which shadow (would earn)",
    "wat het had opgeleverd terwijl Live uit stond (niet echt verdiend).": "what it would have earned while Live was off (not really earned).",
    "wat het opleverde terwijl Batterijplan echt stuurde.": "what it earned while Batterijplan was really steering.",
    "Laatste back-up": "Last back-up",
    "instellingen": "settings",
    "Nog geen back-up": "No back-up yet",
    "Zeker? Tik nog een keer": "Sure? Tap once more",
    "niet gevonden": "not found",
    "zonvoorspelling vandaag": "solar forecast today",
    "zonvoorspelling morgen": "solar forecast tomorrow",
    "Zonvoorspelling niet gevonden. Vul de velden 'Zonvoorspelling vandaag' en 'Zonvoorspelling morgen' in bij Instellingen.": "Solar forecast not found. Fill in the fields 'Solar forecast today' and 'Solar forecast tomorrow' in Settings.",
    "Tik om te typen": "Tap to type",
    "minder": "less",
    "meer": "more",
    "nu": "now",
    "sensor niet gevonden": "sensor not found",
    "leeg · tik om in te vullen": "empty · tap to fill in",
    "Uitvoeren": "Run",
    "klaar met leren": "done learning",
    "voorspelling": "forecast",
    "aan het leren": "learning",
    "dag": "day",
    "van": "of",
    "van 24 uren al gezien": "of 24 hours seen so far",
    "Haalt de batterij meer uit de duurste kwartieren dan HBC alleen?": "Does the battery get more out of the most expensive quarters than HBC alone?",
    "Modus": "Mode",
    "live": "live",
    "rekent mee, stuurt niet": "calculates along, does not steer",
    "Verbruik leren": "Learning usage",
    "HBC-strategie": "HBC strategy",
    "plan wacht tot Dynamic": "plan waits for Dynamic",
    "Komend kwartier": "Next quarter",
    "zeer goed": "very good",
    "goed": "good",
    "redelijk": "fair",
    "wisselvallig": "variable",
    "nog aan het meten": "still measuring",
    "Ontladen": "Discharging",
    "Ontladen (HBC)": "Discharging (HBC)",
    "goedkoop: laden": "cheap: charging",
    "duur: ontladen": "expensive: discharging",
    "lading HBC alleen": "charge HBC alone",
    "zon": "solar",
    "Advies huisverbruik": "Advice house use",
"ingesteld": "set",
"advies": "advice",
"**Solar reserved for house** in HBC: eerst wat er nu in HBC is ingesteld, daarna het advies van Batterijplan (het gemiddelde van de laatste 7 dagen, afgerond op 0,5 kWh).\n\n- **– –**: er zijn nog geen 7 dagen gemeten; het advies komt vanzelf.\n- **groen**: staat goed, minder dan 1 kWh verschil.\n- **oranje**: aanpassen naar het advies. Staat *Solar reserved for house zelf instellen* aan (Instellingen, Expert), dan doet Batterijplan dat 's nachts zelf.\n\nMeer uitleg in het venster Advies HBC.": "**Solar reserved for house** in HBC: first what is set in HBC now, then the advice of Batterijplan (the average of the last 7 days, rounded to 0.5 kWh).\n\n- **– –**: 7 days have not been measured yet; the advice comes by itself.\n- **green**: set correctly, less than 1 kWh difference.\n- **orange**: change it to the advice. If *Set Solar reserved for house automatically* is on (Settings, Expert), Batterijplan does that itself at night.\n\nMore in the HBC advice window.",
"Batterijplan-rapport": "Batterijplan report",
"Rapport downloaden": "Download report",
"Samenvatting": "Summary",
"Status": "Status",
"Techniek": "Technical",
"Batterijplan staat op Live en stuurt HBC.": "Batterijplan is on Live and steers HBC.",
"Batterijplan staat in schaduw: het rekent mee maar stuurt niets.": "Batterijplan is in shadow mode: it calculates along but steers nothing.",
"HBC staat op Dynamic.": "HBC is on Dynamic.",
"HBC staat niet op Dynamic; Batterijplan wacht.": "HBC is not on Dynamic; Batterijplan waits.",
"Komend kwartier:": "Next quarter:",
"Verbruik leren:": "Learning consumption:",
"Advies voor HBC:": "Advice for HBC:",
"Opgeleverd sinds": "Earned since",
"Ontbreekt:": "Missing:",
"Alle sensoren en HBC-instellingen gevonden.": "All sensors and HBC settings found.",
"Prijs nu": "Price now",
"Huisverbruik nu": "House consumption now",
"Voorspelling": "Forecast",
"Plan tot": "Plan until",
"Dure kwartieren": "Expensive quarters",
"Tekort": "Shortfall",
"Bijsturen": "Adjusting",
"kwartieren": "quarters",
"Extra dit blok": "Extra this block",
"ja": "yes",
"nee": "no",
"Stand": "State",
"Toelichting": "Explanation",
"Ingesteld in HBC": "Set in HBC",
"Advies vandaag": "Advice today",
"Advies morgen": "Advice tomorrow",
"Dagen gemeten": "Days measured",
"Zelf instellen": "Set automatically",
"aan": "on",
"uit": "off",
"Totaal": "Total",
"Instelling": "Setting",
"Waarde": "Value",
"Sinds": "Since",
"Tijd": "Time",
"Besluit": "Decision",
"Laatst uitgevoerd": "Last run",
"Alle planwaarden": "All plan values",
"Batterijplan stuurt alleen de drie Dynamic-standen van HBC, en alleen als Live aan staat. Dit rapport is in je browser gemaakt; er is niets op de server bewaard. Er staan geen namen of adressen in. Lees het na voordat je het deelt.": "Batterijplan only steers the three Dynamic modes of HBC, and only when Live is on. This report was made in your browser; nothing is stored on the server. It contains no names or addresses. Read it before you share it.",
"Rapport bekijken opent het volledige rapport in een nieuw tabblad. Kopiëren voor GitHub zet een tekstversie klaar om in een melding te plakken.": "View report opens the full report in a new tab. Copy for GitHub prepares a text version to paste into an issue.",
"Rapport bekijken": "View report",
"Downloaden (.html)": "Download (.html)",
"Kopiëren voor GitHub": "Copy for GitHub",
"Het rapport opent in een nieuw tabblad.": "The report opens in a new tab.",
"Je browser blokkeerde het nieuwe tabblad. Sta pop-ups toe voor Home Assistant.": "Your browser blocked the new tab. Allow pop-ups for Home Assistant.",
"Kopiëren lukte niet. Download het rapport en voeg het bestand toe.": "Copying failed. Download the report and attach the file.",
"Het rapport wordt in je browser gemaakt uit wat Home Assistant al laat zien. Er wordt niets op de server bewaard.": "The report is made in your browser from what Home Assistant already shows. Nothing is stored on the server.",
"Opnieuw maken": "Make again",
"Nu ingesteld:": "Set now:",
"Wacht op het leren": "Waiting for the learning",
"Batterijplan leert eerst 7 dagen je verbruik (Verbruik leren). Daarna meet het 7 dagen hoeveel zon je huis gebruikt, en dan komt het eerste advies.": "Batterijplan first learns your consumption for 7 days (Learning consumption). Then it measures for 7 days how much solar your house uses, and then the first advice follows.",
"Gegevens ophalen…": "Fetching data…",
"Nog aan het meten:": "Still measuring:",
"van 7 dagen": "of 7 days",
"Wacht op 7 dagen meting van hoeveel zon je huis gebruikt na het goedkope laden. Eerste advies rond": "Waiting for 7 days of measuring how much solar your house uses after the cheap charging. First advice around",
"Back-up gemaakt.": "Back-up made.",
"Je hebt in dit venster nog geen back-up gemaakt.": "You have not made a back-up in this window yet.",
"Back-up maken": "Make back-up",
"Weet je het zeker?": "Are you sure?",
"Ik weet het zeker": "I am sure",
"Annuleren": "Cancel",
"Ja, uitvoeren": "Yes, run",
"Rapport": "Report",
"Alles wat Batterijplan nu weet en besluit, voor jezelf of als je om hulp vraagt. Er staan geen namen of adressen in. Lees het na voordat je het deelt.": "Everything Batterijplan knows and decides right now, for yourself or when you ask for help. It contains no names or addresses. Read it before you share it.",
"Kopiëren": "Copy",
"Downloaden (.md)": "Download (.md)",
"Melding maken op GitHub": "Open an issue on GitHub",
"Gekopieerd": "Copied",
"Selecteer de tekst en kopieer met Ctrl+C.": "Select the text and copy with Ctrl+C.",
"Gedownload:": "Downloaded:",
"Gekopieerd. Plak het rapport in de melding.": "Copied. Paste the report into the issue.",
"sinds": "since",
"Gemaakt op": "Made on",
"Er staan geen namen of adressen in. Lees het na voordat je het deelt.": "It contains no names or addresses. Read it before you share it.",
"Taal": "Language",
"tijdzone": "time zone",
"prijzen": "prices",
"Advies": "Advice",
"dagen gemeten": "days measured",
"gemiddeld": "average",
"Automatiseringen": "Automations",
"laatst": "last",
"Overige sensoren": "Other sensors",
"Laatste 24 uur": "Last 24 hours",
"Alle wisselingen": "All changes",
"geschiedenis niet beschikbaar": "history not available",
"Ontbreekt": "Missing",
"niets": "nothing",
"Per periode:": "Per period:",
"kies Dagen, Weken, Maanden, Kwartalen of Jaar. Elk vakje is wat Batterijplan in die periode opleverde bovenop HBC alleen. ▲ is meer dan de periode ervoor, ▼ minder, = ongeveer gelijk. De balk vergelijkt met de beste getoonde periode.": "choose Days, Weeks, Months, Quarters or Year. Each tile is what Batterijplan earned in that period on top of HBC alone. ▲ is more than the period before, ▼ less, = about the same. The bar compares with the best period shown.",
"Dagen": "Days",
"Weken": "Weeks",
"Maanden": "Months",
"Kwartalen": "Quarters",
"Jaar": "Year",
"HBC alleen": "HBC alone",
"nog niet geteld": "not counted yet",
"Week": "Week",
"Nog niets geteld.": "Nothing counted yet.",
"deze maand": "this month",
"laatste 12 weken": "last 12 weeks",
"laatste 12 maanden": "last 12 months",
"laatste 4 kwartalen": "last 4 quarters",
"dit jaar": "this year",
"Totalen": "Totals",
"geteld sinds": "counting since",
"Opgeleverd": "Earned",
"Live (echt gestuurd)": "Live (really steered)",
"Schaduw (zou opleveren)": "Shadow (would earn)",
"Balk: groen = live, grijs = schaduw (totaal sinds de start).": "Bar: green = live, grey = shadow (total since the start).",
"Kwartieren ontladen / vastgehouden / overschot:": "Quarters discharged / held / surplus:",
"lading verschoven:": "charge shifted:",
"▲ meer opgeleverd dan de periode ervoor · ▼ minder · = ongeveer gelijk. Balk: opbrengst vergeleken met de beste getoonde periode.": "▲ earned more than the period before · ▼ less · = about the same. Bar: earnings compared with the best period shown.",
"Exporteren naar spreadsheet (CSV)": "Export to spreadsheet (CSV)",
"Eén regel per dag, sinds de start. Wordt gedownload naar dit apparaat.": "One line per day, since the start. Downloaded to this device.",
"datum": "date",
"opgeleverd (EUR)": "earned (EUR)",
"dagen": "days",
"plan tot hier": "plan up to here",
"Batterijplan maakt het plan voor deze dag pas als hij dichterbij komt. Je ziet nu wat HBC van plan is.": "Batterijplan makes the plan for this day once it gets closer. For now you see what HBC intends to do.",
"Batterijplan stuurde deze dag niet bij: HBC regelde het zelf.": "Batterijplan did not adjust on this day: HBC handled it on its own.",
"Batterijplan stuurt nu niet bij: bijsturen levert te weinig op, dus HBC regelt het zelf.": "Batterijplan is not adjusting right now: adjusting would earn too little, so HBC handles it on its own.",
"Batterijplan stuurt nu niet bij: HBC regelt het zelf.": "Batterijplan is not adjusting right now: HBC handles it on its own.",
"Zodra bijsturen genoeg oplevert, krijgen die kwartieren hier een eigen kleur.": "As soon as adjusting pays off, those quarters get their own colour here.",
"Zie je geen gekleurde vlakken, dan stuurt Batterijplan niet bij en regelt HBC het zelf; dat staat dan ook onder de grafiek. Na de streepjeslijn “plan tot hier” zie je wat HBC van plan is; Batterijplan kleurt die kwartieren pas in als het plan zover is.": "No coloured areas means Batterijplan is not adjusting and HBC handles it on its own; the chart then says so underneath. After the dashed line “plan up to here” you see what HBC intends to do; Batterijplan colours those quarters once the plan gets there.",
    "lading (kWh)": "charge (kWh)",
    "vasthouden": "holding",
    "niet van het net geladen": "no grid charging",
    "niet van het net geladen (niet nodig)": "no grid charging (not needed)",
    "bijladen van het net (tekort)": "topping up from the grid (shortfall)",
    "bijladen van het net": "topping up from the grid",
    "Pas als het 1 kWh of meer afwijkt, krijg je een advies.": "Only when it differs by 1 kWh or more do you get advice.",
    "Zelf instellen staat aan (Instellingen, Expert): Batterijplan zet dit getal elke nacht om 23:50 zelf in HBC.": "Set automatically is on (Settings, Expert): every night at 23:50 Batterijplan puts this number in HBC itself.",
    "Batterijplan verandert zelf niets in HBC, tenzij je Solar reserved for house zelf instellen aanzet (Instellingen, Expert).": "Batterijplan changes nothing in HBC itself, unless you turn on Set Solar reserved for house automatically (Settings, Expert).",
    "Solar reserved for house zelf instellen": "Set Solar reserved for house automatically",
    "Briefing en plan": "Briefing and plan",
    "Bovenaan een korte briefing: wat er nu speelt, wat Batterijplan doet en wanneer de volgende laadkans is.": "At the top a short briefing: what is happening now, what Batterijplan does and when the next charging opportunity is.",
    "Daaronder het plan voor de komende 24 uur, in zinnen. Het rolt mee: elk kwartier rekent Batterijplan opnieuw, wat voorbij is valt eraf en aan de achterkant komt er een kwartier bij. Zolang de prijzen van morgen er nog niet zijn (rond 13:00), loopt het tot het einde van de bekende prijzen.": "Below it the plan for the next 24 hours, in sentences. It rolls along: every quarter Batterijplan recalculates, what has passed drops off and a quarter is added at the end. Until tomorrow's prices are in (around 13:00), it runs to the end of the known prices.",
    "Tot het volgende goedkope moment is het plan zeker: daar stuurt Batterijplan nu op. Na de streep 'verwacht' is het een vooruitblik, die zeker wordt zodra dat goedkope moment voorbij is. De bolletjes hebben dezelfde kleuren als de grafiek.": "Up to the next cheap moment the plan is firm: that is what Batterijplan steers on now. After the line 'expected' it is a look ahead, which becomes firm once that cheap moment has passed. The dots have the same colours as the chart.",
    "duur": "expensive",
    "duur, vasthouden": "expensive, holding",
    "goedkoop": "cheap",
    "goedkoop, niet van het net laden": "cheap, no grid charging",
    "in stukjes": "in pieces",
    "loopt door": "continues",
    "verwacht": "expected",
    "komende": "next",
    "uur": "hours",
    "De batterij levert aan het huis": "The battery supplies the house",
    "tot ca.": "until approx.",
    "dan is hij leeg": "then it is empty",
    "Lading bewaren voor het duurdere moment": "Keeping the charge for the more expensive moment",
    "HBC laadt van het net": "HBC charges from the grid",
    "Er zit genoeg in": "There is enough in it",
    "voor de dure kwartieren om": "for the expensive quarters at",
    "Er komt ca.": "Approx.",
    "bij": "is added",
    "levert ca.": "earns approx.",
    "op": " ",
    "Er zit ca.": "There is approx.",
    "te veel in tot het volgende goedkope moment; dat gaat nu al naar het huis.": "too much in it until the next cheap moment; it already goes to the house now.",
    "Duur blok tot": "Expensive block until",
    "De batterij": "The battery",
    "houdt het vol tot ca.": "lasts until approx.",
    "daarna komt ca.": "after that approx.",
    "van het net": "comes from the grid",
    "daarna komt de rest van het net": "after that the rest comes from the grid",
    "houdt het hele blok vol": "lasts the whole block",
    "Goedkoop tot": "Cheap until",
    "niet van het net laden, er zit genoeg in": "no grid charging, there is enough in it",
    "In de batterij": "In the battery",
    "in de batterij": "in the battery",
    "Volgend duur blok": "Next expensive block",
    "de batterij houdt het vol tot ca.": "the battery lasts until approx.",
    "daar is genoeg voor": "there is enough for it",
    "Geen duur blok in de komende uren": "No expensive block in the coming hours",
    "Batterijplan laat HBC bijladen van het net om": "Batterijplan has HBC top up from the grid at",
    "ca.": "approx.",
    "kwartier vasthouden": "quarter holding",
    "kwartieren vasthouden": "quarters holding",
    "Batterijplan stuurt bij": "Batterijplan adjusts",
    "en": "and",
    "Batterijplan stuurt niet bij: HBC regelt het zelf.": "Batterijplan does not adjust: HBC handles it itself.",
    "Volgende laadkans": "Next charging opportunity",
    "Geen goedkope of dure momenten in de komende uren: HBC laadt met zon.": "No cheap or expensive moments in the coming hours: HBC charges from the sun.",
    "Bijladen van het net": "Topping up from the grid",
    "Bijladen van het net:": "Topping up from the grid:",
    "Vasthouden": "Holding",
    "Laden (HBC)": "Charging (HBC)",
    "Zon laden (HBC)": "Solar charging (HBC)",
    "Niet ingesteld": "Not set up",
    "Geen batterijdata": "No battery data",
    "Geen prijsdata": "No price data",
    "HBC niet op Dynamic": "HBC not on Dynamic",
    "**Live**: Batterijplan zet elk kwartier de twee Dynamic-standen van HBC.\n\n**Schaduw**: Batterijplan rekent mee en laat zien wat het zou doen, maar verandert niets aan HBC.\n\nAan- en uitzetten doe je met de schakelaar Live bovenaan.": "**Live**: Batterijplan sets the two Dynamic settings of HBC every quarter.\n\n**Shadow**: Batterijplan calculates along and shows what it would do, but changes nothing in HBC.\n\nTurn it on and off with the Live switch at the top.",
    "Batterijplan leert per uur van de dag hoeveel je huis gebruikt. Na 7 dagen is het klaar met leren. Daarna leert het glijdend door, zodat het met de seizoenen meegaat.\n\nDe **voorspelling** zegt hoe goed het geleerde verbruik het echte verbruik raakt, per blok van 3 uur:\n- wisselvallig: minder dan 55 %\n- redelijk: 55 % of meer\n- goed: 65 % of meer\n- zeer goed: 75 % of meer\n- uitstekend: 85 % of meer\n\nZolang er nog geen blok van 3 uur gemeten is, staat er: nog aan het meten.\n\nIs de voorspelling **wisselvallig**, dan rekent het plan zelf met **extra marge**: de gemiddelde afwijking per blok van 3 uur, maximaal 1 kWh, bovenop je eigen veiligheidsmarge. De batterij raakt dan minder vaak te vroeg leeg. Wordt de voorspelling beter, dan valt die extra marge vanzelf weg.": "Batterijplan learns per hour of the day how much your house uses. After 7 days it is done learning. After that it keeps learning gradually, so it follows the seasons.\n\nThe **forecast** says how well the learned usage matches the real usage, per 3-hour block:\n- variable: less than 55 %\n- fair: 55 % or more\n- good: 65 % or more\n- very good: 75 % or more\n- excellent: 85 % or more\n\nAs long as no 3-hour block has been measured yet, it says: still measuring.\n\nIf the forecast is **variable**, the plan adds an **extra margin** itself: the average deviation per 3-hour block, at most 1 kWh, on top of your own safety margin. The battery then runs empty too early less often. When the forecast improves, the extra margin goes away by itself.",
    "Batterijplan werkt alleen als HBC op **Dynamic** staat. Staat HBC op iets anders, dan wacht het plan en verandert Batterijplan niets. Het leren gaat gewoon door.": "Batterijplan only works when HBC is on **Dynamic**. If HBC is on something else, the plan waits and Batterijplan changes nothing. Learning simply continues.",
    "Wat Batterijplan voor het volgende kwartier besluit:\n- **Ontladen**: de batterij levert aan het huis in een duur kwartier.\n- **Vasthouden**: de lading wordt bewaard voor een nog duurder moment.\n- **Overschot ontladen**: er zit meer in de batterij dan nodig is tot het volgende goedkope moment.\n- **Niet van het net laden**: een goedkoop kwartier, maar de zon vult de batterij genoeg voor de dure kwartieren die komen. HBC laadt dan alleen met zon.\n- **Bijladen van het net**: de batterij redt de dure kwartieren die komen niet (de zon valt tegen of HBC laadde 's nachts weinig). Batterijplan laat HBC in dit goedkopere kwartier alsnog van het net laden, niet meer dan het tekort.\n- **Ontladen (HBC)**, **Laden (HBC)** of **Zon laden (HBC)**: HBC regelt het zelf. Bijsturen levert dan minder dan € 0,10 op.": "What Batterijplan decides for the next quarter:\n- **Discharging**: the battery supplies the house in an expensive quarter.\n- **Holding**: the charge is kept for an even more expensive moment.\n- **Surplus discharging**: there is more in the battery than needed until the next cheap moment.\n- **No grid charging**: a cheap quarter, but the sun fills the battery enough for the expensive quarters to come. HBC then only charges from the sun.\n- **Topping up from the grid**: the battery will not last through the expensive quarters to come (less sun than expected, or HBC charged little overnight). Batterijplan has HBC charge from the grid in this cheaper quarter after all, no more than the shortfall.\n- **Discharging (HBC)**, **Charging (HBC)** or **Solar charging (HBC)**: HBC handles it itself. Adjusting would earn less than € 0.10.",
    "Geen vermogenssensor gevonden. Typ de naam zelf.": "No power sensor found. Type the name yourself.",
    "Kies je sensor; rechts staat wat hij nu meldt.": "Pick your sensor; on the right is what it reports now.",
    "Afname is +, teruglevering is −. Kies de sensor die nu het netvermogen van je hele huis meldt.": "Import is +, export is −. Pick the sensor that reports the grid power of your whole house now.",
    "Kies de sensor met wat al je zonnepanelen samen nu opwekken.": "Pick the sensor with what all your solar panels together produce now.",
    "Kies het totaal van al je batterijen (ontladen is +). Bij HBC meestal: house total battery power.": "Pick the total of all your batteries (discharging is +). With HBC usually: house total battery power.",
    "Kies het laadvermogen van je auto-lader.": "Pick the charging power of your EV charger.",
    "uitstekend": "excellent",
    "extra marge": "extra margin",
    "Niet van het net laden": "No grid charging",
    "hetzelfde als HBC": "same as HBC",
    "Regels": "Rules",
    "Regel": "Rule",
    "laden": "charging",
    "ontladen": "discharging",
    "terugleveren": "feeding in",
    "laden van het net": "charge from the grid",
    "alleen zon / niets": "solar only / nothing",
    "Dit contractjaar": "This contract year",
    "Kwartieren ontladen / vastgehouden / teruggeleverd": "Quarters discharged / held / fed in",
    "Kwartieren ontladen / vastgehouden / teruggeleverd:": "Quarters discharged / held / fed in:",
    "Kosten HBC alleen": "Cost HBC alone",
    "Kosten met Batterijplan": "Cost with Batterijplan",
    "Verwachte besparing t.o.v. HBC alleen": "Expected saving versus HBC alone",
    "Kwartieren in het plan": "Quarters in the plan",
    "Acties in het plan": "Actions in the plan",
    "Bij terugleveren telt wat je ontvangt, minus wat het kost om die lading later weer goedkoop in te kopen.": "When feeding in, what counts is what you receive, minus what it costs to buy that charge back cheaply later.",
    "**Live**: Batterijplan zet elk kwartier de Dynamic-standen van HBC.\n\n**Schaduw**: Batterijplan rekent mee en laat zien wat het zou doen, maar verandert niets aan HBC.\n\nAan- en uitzetten doe je met de schakelaar Live bovenaan.": "**Live**: Batterijplan sets the Dynamic modes of HBC every quarter.\n\n**Shadow**: Batterijplan calculates along and shows what it would do, but changes nothing in HBC.\n\nYou switch it on and off with the Live switch at the top.",
    "Wat Batterijplan voor het volgende kwartier besluit, naast wat HBC alleen zou doen:\n- **Laden van het net**: de batterij wordt van het net geladen.\n- **Ontladen**: de batterij levert aan het huis.\n- **Vasthouden**: de lading wordt bewaard voor een nog duurder moment.\n- **Terugleveren**: de batterij levert terug aan het net.\n- **Alleen zon / niets**: niet laden van het net en niet ontladen.\n\nIs het plan gelijk aan HBC, dan staat er dat het hetzelfde is.": "What Batterijplan decides for the next quarter, next to what HBC alone would do:\n- **Charge from the grid**: the battery is charged from the grid.\n- **Discharging**: the battery supplies the house.\n- **Holding**: the charge is kept for a more expensive moment.\n- **Feeding in**: the battery delivers back to the grid.\n- **Solar only / nothing**: no charging from the grid and no discharging.\n\nIf the plan equals HBC, it says that it is the same.",
    "De vier regels waarmee Batterijplan mag bijsturen. Je zet ze aan of uit onder Instellingen, tabblad Regels.\n\nStaat een regel uit, dan doet Batterijplan op dat punt wat HBC doet.": "The four rules Batterijplan may steer with. You switch them on or off under Settings, tab Rules.\n\nIf a rule is off, Batterijplan does what HBC does on that point.",
    "Het btw-percentage dat Batterijplan over de inkoopprijs rekent.\n\nIn Nederland is dat 21 %. Staat Prijzen van HBC op all-in, dan is dit niet nodig.": "The VAT percentage Batterijplan adds to the purchase price.\n\nIn the Netherlands that is 21 %. If Prices from HBC is set to all-in, this is not needed.",
    "Wat je per kWh bovenop de beursprijs ontvangt voor teruggeleverde stroom, zonder btw. Bij een negatief getal ontvang je minder.\n\nVoorbeeld: 0,02 betekent beurs + € 0,02 per kWh. Je vindt dit bij de voorwaarden van je contract.": "What you receive per kWh on top of the market price for electricity fed back, excluding VAT. A negative number means you receive less.\n\nExample: 0.02 means market + € 0.02 per kWh. You can find this in the terms of your contract.",
    "Extra percentage dat je overdag (met zon, of tussen 08:00 en 17:00) bovenop de terugleververgoeding krijgt, als die positief is.\n\nVoorbeeld: 10 % betekent dat de vergoeding overdag 10 % hoger is. Heeft je contract geen bonus, zet dit dan op 0.": "Extra percentage you receive during the day (with sun, or between 08:00 and 17:00) on top of the feed-in payment, when that is positive.\n\nExample: 10 % means the payment is 10 % higher in the daytime. If your contract has no bonus, set this to 0.",
    "Btw": "VAT",
    "Teruglever-toeslag (excl. btw)": "Feed-in supplement (excl. VAT)",
    "Teruglever-bonus overdag": "Daytime feed-in bonus"
   },
   "de": {
    "Goedkoopste en duurste kwartier van die dag.": "Günstigste und teuerste Viertelstunde dieses Tages.",
    "Gemiddelde prijs van die dag zoals HBC hem geeft: inclusief energiebelasting, opslag en btw.": "Durchschnittspreis dieses Tages, wie HBC ihn liefert: inklusive Energiesteuer, Aufschlag und MwSt.",
    "Prijs van stroom dit kwartier zoals HBC hem geeft: inclusief energiebelasting, opslag en btw.": "Strompreis dieser Viertelstunde, wie HBC ihn liefert: inklusive Energiesteuer, Aufschlag und MwSt.",
    "prijs all-in": "Preis all-in",
    "prijs all-in (ct)": "Preis all-in (ct)",
    "Gemiddelde prijs (all-in)": "Durchschnittspreis (all-in)",
    "Prijs nu (all-in)": "Preis jetzt (all-in)",
    "Terug": "Zurück",
    "Hoe lees je dit?": "Wie liest man das?",
    "lading als HBC het alleen deed": "Ladung, wenn HBC es allein täte",
    "Extra t.o.v. HBC alleen": "Mehr als HBC allein",
    "Sensoren": "Sensoren",
    "Instellingen": "Einstellungen",
    "Advies HBC": "HBC-Empfehlung",
    "Opbrengst": "Ertrag",
    "Uit = schaduw: het plan rekent alleen mee. Aan = Batterijplan stuurt HBC bij.": "Aus = Schatten: der Plan rechnet nur mit. An = Batterijplan steuert HBC.",
    "Hier is iets te doen": "Hier ist etwas zu tun",
    "Sluiten": "Schließen",
    "schaduw": "Schatten",
    "stuurt HBC": "steuert HBC",
    "7 dagen": "7 Tage",
    "Aanpassen naar": "Ändern auf",
    "Advies volgt als je verbruik geleerd is en er een week gemeten is": "Empfehlung folgt, sobald dein Verbrauch gelernt ist und eine Woche gemessen wurde",
    "Advies voor HBC": "Empfehlung für HBC",
    "geen grens": "keine Grenze",
    "Aantal goedkope uren": "Günstigste Stunden",
    "Aantal dure uren": "Teuerste Stunden",
    "Huisverbruik op zon": "Hausverbrauch aus Solar",
    "Gemiddeld {x} kWh huisverbruik op zon in de laatste 7 dagen.": "Im Durchschnitt {x} kWh Hausverbrauch aus Solar in den letzten 7 Tagen.",
    "De laatste 7 dagen opnieuw doorgerekend: {x} goedkoper dan nu.": "Die letzten 7 Tage neu berechnet: {x} günstiger als jetzt.",
    "Past het best bij de laatste 7 dagen.": "Passt am besten zu den letzten 7 Tagen.",
    "Advies wijkt minder dan {x} af: Batterijplan laat het zoals het is.": "Die Empfehlung weicht um weniger als {x} ab: Batterijplan lässt es so.",
    "Nog aan het meten: dag {x} van 7": "Noch am Messen: Tag {x} von 7",
    "Batterijplan bewaart per kwartier de prijs, je huisverbruik en je zon. Na 7 volle dagen rekent het die opnieuw door en komt het advies. Tot die tijd verandert er niets.": "Batterijplan speichert pro Viertelstunde den Preis, deinen Hausverbrauch und deine Solarerzeugung. Nach 7 vollen Tagen rechnet es sie neu durch und die Empfehlung folgt. Bis dahin ändert sich nichts.",
    "Zonnesensor ontbreekt: kies die bij Sensoren, anders kan er niet worden doorgerekend.": "Solarsensor fehlt: wähle ihn unter Sensoren, sonst kann nicht gerechnet werden.",
    "Advies nog niet te berekenen: de gegevens van HBC of de batterijcapaciteit ontbreken.": "Die Empfehlung kann noch nicht berechnet werden: die HBC-Daten oder die Batteriekapazität fehlen.",
    "Berekend op": "Berechnet am",
    "duurde": "dauerte",
    "HBC-instellingen automatisch": "HBC-Einstellungen automatisch anpassen",
    "Aan: Batterijplan zet de waarden zelf in HBC, alleen als het verschil minstens 1 uur of 0,5 kWh is. Jouw eigen waarden worden onthouden en komen exact terug als je dit uitzet. Elke wijziging staat in het logboek.": "An: Batterijplan stellt die Werte selbst in HBC ein, nur wenn der Unterschied mindestens 1 Stunde oder 0,5 kWh beträgt. Deine eigenen Werte werden gemerkt und kommen beim Ausschalten genau zurück. Jede Änderung steht im Logbuch.",
    "Uit: Batterijplan verandert niets in HBC. Je ziet hierboven alleen het advies.": "Aus: Batterijplan ändert nichts in HBC. Oben siehst du nur die Empfehlung.",
    "In HBC stel je in hoeveel uur van de dag als goedkoop en als duur telt (cheapest hrs, expensive hrs) en hoeveel zonne-energie je huis zelf direct opmaakt (Solar reserved for house).": "In HBC stellst du ein, wie viele Stunden des Tages als günstig und als teuer gelten (cheapest hrs, expensive hrs) und wie viel Solarenergie dein Haus direkt verbraucht (Solar reserved for house).",
    "Batterijplan bewaart 7 dagen per kwartier de prijs, je huisverbruik en je zon. Elke nacht rekent het die 7 dagen opnieuw door met zijn eigen plan, voor verschillende waarden van cheapest hrs en expensive hrs, en kiest de goedkoopste. Bij een gelijke uitkomst blijft het bij de waarde die het dichtst bij de huidige ligt.": "Batterijplan speichert 7 Tage lang pro Viertelstunde den Preis, deinen Hausverbrauch und deine Solarerzeugung. Jede Nacht rechnet es diese 7 Tage mit seinem eigenen Plan neu durch, für verschiedene Werte von cheapest hrs und expensive hrs, und wählt den günstigsten. Bei gleichem Ergebnis bleibt es bei dem Wert, der dem aktuellen am nächsten liegt.",
    "Een oranje stip betekent: het advies wijkt minstens 1 uur (of 0,5 kWh) af van wat in HBC staat. Je ziet dat ook als automatisch aanpassen uit staat.": "Ein oranger Punkt bedeutet: die Empfehlung weicht um mindestens 1 Stunde (oder 0,5 kWh) von der HBC-Einstellung ab. Du siehst das auch, wenn das automatische Anpassen aus ist.",
    "Alleen de momenten waarop Batterijplan iets anders doet dan HBC.": "Nur die Momente, in denen Batterijplan etwas anderes tut als HBC.",
    "Batterijplan rekent elke dag uit wat je huis op zon kan gebruiken vanaf het eerste goedkope kwartier tot het eind van de dag (geleerd verbruik naast de zonverwachting) en vergelijkt het gemiddelde van de laatste 7 dagen met jouw instelling.": "Batterijplan berechnet jeden Tag, wie viel Solarstrom dein Haus ab der ersten günstigen Viertelstunde bis zum Tagesende nutzen kann (gelerntes Verbrauchsprofil neben der Solarprognose) und vergleicht den Durchschnitt der letzten 7 Tage mit deiner Einstellung.",
    "Batterijplan staat stil": "Batterijplan pausiert",
    "Batterijplan stuurt alleen bij als HBC op Dynamic staat en telt in de tussentijd niets op. Het leren van je verbruik gaat gewoon door.": "Batterijplan steuert nur, wenn HBC auf Dynamic steht, und zählt in der Zwischenzeit nichts hinzu. Das Lernen deines Verbrauchs läuft einfach weiter.",
    "Beste dag": "Bester Tag",
    "Beste dag:": "Bester Tag:",
    "Beste maand:": "Bester Monat:",
    "Bij overschot ontladen telt alleen de lading die echt uit de batterij ging: wat je daardoor niet hoeft te kopen, min wat het kost om die lading op het goedkope moment terug te laden (inclusief verlies in de batterij).": "Beim Überschuss-Entladen zählt nur die Ladung, die wirklich aus der Batterie kam: was du dadurch nicht kaufen musst, abzüglich der Kosten, diese Ladung im günstigen Moment wieder zu laden (inklusive Batterieverluste).",
    "Bij vasthouden telt de lading mee tegen de gemiddelde prijs van de dure kwartieren waar het plan haar later voor inzet.": "Beim Halten zählt die Ladung zum Durchschnittspreis der teuren Viertelstunden, für die der Plan sie später einsetzt.",
    "Bruikbare lading van alle batterijen samen: het laadpercentage boven de ondergrens van HBC, maal de capaciteit uit de instellingen.": "Nutzbare Ladung aller Batterien zusammen: der Ladestand oberhalb der HBC-Untergrenze, mal die Kapazität aus den Einstellungen.",
    "Daar laadt HBC weer bij en maakt Batterijplan een nieuw plan. Ga met de muis over een cijfer voor meer uitleg.": "Dort lädt HBC wieder nach und Batterijplan erstellt einen neuen Plan. Fahre mit der Maus über eine Zahl für mehr Erklärung.",
    "De blauwe lijn is de lading in kWh (as rechts): doorgetrokken = gemeten, gestreept = verwacht volgens het plan. Links van Nu is voorbij en iets gedempt.": "Die blaue Linie ist die Ladung in kWh (rechte Achse): durchgezogen = gemessen, gestrichelt = laut Plan erwartet. Links von Jetzt ist Vergangenheit und leicht abgedunkelt.",
    "Dure kwartieren waarin de batterij bewust niet ontlaadt, omdat dezelfde lading later in een nog duurder kwartier meer oplevert.": "Teure Viertelstunden, in denen die Batterie bewusst nicht entlädt, weil dieselbe Ladung später in einer noch teureren Viertelstunde mehr bringt.",
    "Elk kwartier schat Batterijplan het verschil tussen HBC alleen en HBC met Batterijplan, inclusief btw.": "Jede Viertelstunde schätzt Batterijplan den Unterschied zwischen HBC allein und HBC mit Batterijplan, inklusive MwSt.",
    "Gemiddeld per dag": "Durchschnitt pro Tag",
    "Gemiddeld per maand": "Durchschnitt pro Monat",
    "Gemiddelde inkoopprijs van die dag, zonder energiebelasting, opslag en btw.": "Durchschnittlicher Einkaufspreis dieses Tages, ohne Energiesteuer, Aufschlag und MwSt.",
    "Gemiddelde kale prijs": "Durchschnittlicher Börsenpreis",
    "Geschatte opbrengst bovenop wat HBC alleen had gedaan, opgeteld over de gekozen periode.": "Geschätzter Mehrertrag gegenüber HBC allein, aufsummiert über den gewählten Zeitraum.",
    "Goedkoopste en duurste kwartier van die dag (kale prijs).": "Günstigste und teuerste Viertelstunde dieses Tages (Börsenpreis).",
    "Groen": "Grün",
    "HBC regelt het zelf.": "HBC regelt es selbst.",
    "HBC staat op": "HBC steht auf",
    "Het blijft een schatting; je energierekening is het echte bewijs. Staat HBC niet op Dynamic, dan telt er niets bij.": "Es bleibt eine Schätzung; deine Stromrechnung ist der echte Beweis. Steht HBC nicht auf Dynamic, wird nichts hinzugezählt.",
    "Het plan loopt tot het volgende goedkope moment": "Der Plan läuft bis zum nächsten günstigen Moment",
    "Hoe lang de batterij tot het volgende goedkope moment aan het huis levert, in de duurste kwartieren die Batterijplan daarvoor kiest.": "Wie lange die Batterie bis zum nächsten günstigen Moment das Haus versorgt, in den teuersten Viertelstunden, die Batterijplan dafür wählt.",
    "Huisverbruik op zon (Solar reserved for house)": "Hausverbrauch aus Solar (Solar reserved for house)",
    "In HBC vul je in hoeveel zonne-energie je huis zelf direct opmaakt (Solar reserved for house). HBC trekt dat af van de zon die nog komt, op het moment dat het goedkoop laadt.": "In HBC trägst du ein, wie viel Solarstrom dein Haus selbst direkt verbraucht (Solar reserved for house). HBC zieht das von der noch kommenden Sonne ab, in dem Moment, in dem es günstig lädt.",
    "In de batterij nu": "In der Batterie jetzt",
    "Ingesteld": "Eingestellt",
    "Inkoopprijs van stroom dit kwartier, zonder energiebelasting, opslag en btw.": "Einkaufspreis für Strom in dieser Viertelstunde, ohne Energiesteuer, Aufschlag und MwSt.",
    "Kale prijs nu": "Börsenpreis jetzt",
    "Kies de dag of periode met de datumkiezer erboven. Ga met de muis over de grafiek voor de cijfers per kwartier.": "Wähle den Tag oder Zeitraum mit der Datumsauswahl darüber. Fahre mit der Maus über das Diagramm für die Zahlen pro Viertelstunde.",
    "Kwartieren ontladen / vastgehouden / overschot": "Viertelstunden entladen / gehalten / Überschuss",
    "Laagste – hoogste": "Niedrigster – höchster",
    "Lading die er tot het volgende goedkope moment te veel in zit. Batterijplan levert die nu al aan het huis, in plaats van met een volle batterij te gaan laden. Met de geschatte opbrengst.": "Ladung, die bis zum nächsten günstigen Moment zu viel ist. Batterijplan liefert sie jetzt schon ans Haus, statt mit voller Batterie ins Laden zu gehen. Mit dem geschätzten Ertrag.",
    "Lading verschoven naar duurdere momenten": "Ladung auf teurere Momente verschoben",
    "Lege stukken in de balk: daar regelt HBC het zelf (laden met zon, ontladen, of niets). De blauwe streep is nu.": "Leere Stellen im Balken: dort regelt HBC es selbst (Laden mit Solar, Entladen oder nichts). Der blaue Strich ist jetzt.",
    "Live": "Live",
    "Morgen": "Morgen",
    "Niets bij te sturen": "Nichts zu steuern",
    "Nog aan het meten": "Noch am Messen",
    "Nu": "Jetzt",
    "Nu ingesteld": "Jetzt eingestellt",
    "Ontladen in dure kwartieren": "Entladen in teuren Viertelstunden",
    "Opgeleverd in deze periode": "Ertrag in diesem Zeitraum",
    "Overschot ontladen": "Überschuss entladen",
    "Pas als het 1 kWh of meer afwijkt, krijg je een advies. Batterijplan verandert zelf niets in HBC.": "Erst bei 1 kWh Abweichung oder mehr bekommst du eine Empfehlung. Batterijplan ändert selbst nichts in HBC.",
    "Per dag:": "Pro Tag:",
    "Per week of maand:": "Pro Woche oder Monat:",
    "Plan": "Plan",
    "Plan vandaag en morgen": "Plan heute und morgen",
    "Prijs en batterij": "Preis und Batterie",
    "Schaduw": "Schatten",
    "Staat dat te hoog, dan laadt HBC meer van het net dan nodig; te laag, dan is de batterij 's avonds te leeg voor de dure uren.": "Ist der Wert zu hoch, lädt HBC mehr aus dem Netz als nötig; zu niedrig, und die Batterie ist abends zu leer für die teuren Stunden.",
    "Staat goed": "Passt",
    "Totaal sinds": "Gesamt seit",
    "Uitleg: wat zie ik hier?": "Erklärung: was sehe ich hier?",
    "Vandaag": "Heute",
    "Vannacht extra laden:": "Heute Nacht zusätzlich laden:",
    "Vasthouden voor later": "Für später halten",
    "Voor deze dag zijn (nog) geen prijzen bekend.": "Für diesen Tag sind (noch) keine Preise bekannt.",
    "Voor deze periode is nog niets opgeteld. Batterijplan telt vanaf de eerste dag dat het draait.": "Für diesen Zeitraum wurde noch nichts gezählt. Batterijplan zählt ab dem ersten Tag, an dem es läuft.",
    "Wat er gebeurde": "Was passiert ist",
    "Wat is dit?": "Was ist das?",
    "Wat levert het op": "Was bringt es",
    "Wat telt hier?": "Was zählt hier?",
    "Wat zie je?": "Was siehst du?",
    "de grijze lijn is de kale stroomprijs per kwartier. De gekleurde vlakken zijn de kwartieren waarin Batterijplan bijstuurt (zelfde kleuren als het plan).": "die graue Linie ist der Börsenstrompreis pro Viertelstunde. Die farbigen Flächen sind die Viertelstunden, in denen Batterijplan steuert (gleiche Farben wie im Plan).",
    "duur volgens HBC — nog niet ingepland": "teuer laut HBC — noch nicht eingeplant",
    "een andere strategie": "eine andere Strategie",
    "een groene staaf per dag met wat Batterijplan geschat opleverde bovenop HBC alleen.": "ein grüner Balken pro Tag mit dem geschätzten Mehrertrag von Batterijplan gegenüber HBC allein.",
    "geen gegevens": "keine Daten",
    "gemiddeld nodig": "durchschnittlich nötig",
    "gewoon — HBC laadt met zon (of doet niets)": "normal — HBC lädt mit Solar (oder tut nichts)",
    "goedkoop volgens HBC": "günstig laut HBC",
    "kale prijs": "Börsenpreis",
    "kale prijs (ct)": "Börsenpreis (ct)",
    "laden van het net (goedkoop)": "Laden aus dem Netz (günstig)",
    "lading": "Ladung",
    "lading (kWh): doorgetrokken = gemeten, gestreept = verwacht volgens plan": "Ladung (kWh): durchgezogen = gemessen, gestrichelt = laut Plan erwartet",
    "lading daarna ±": "Ladung danach ±",
    "lading vasthouden voor een later, duurder kwartier": "Ladung halten für eine spätere, teurere Viertelstunde",
    "paars": "lila",
    "nu ingesteld": "jetzt eingestellt",
    "om": "um",
    "ontladen in een duur kwartier": "Entladen in einer teuren Viertelstunde",
    "ontladen voor het huis": "Entladen fürs Haus",
    "opgeleverd": "Ertrag",
    "opgeleverd bovenop HBC (geschat, € per dag)": "Mehrertrag gegenüber HBC (geschätzt, € pro Tag)",
    "opgeleverd bovenop HBC (geschat, € per maand)": "Mehrertrag gegenüber HBC (geschätzt, € pro Monat)",
    "oranje": "orange",
    "overschot ontladen": "Überschuss entladen",
    "start": "Start",
    "tot": "bis",
    "u": "h",
    "vasthouden (Batterijplan stuurt bij)": "halten (Batterijplan steuert)",
    "voorbij": "vorbei",
    "waarvan live (echt gestuurd)": "davon live (wirklich gesteuert)",
    "waarvan schaduw (zou opleveren)": "davon Schatten (würde bringen)",
    "wat het had opgeleverd terwijl Live uit stond (niet echt verdiend).": "was es gebracht hätte, während Live aus war (nicht wirklich verdient).",
    "wat het opleverde terwijl Batterijplan echt stuurde.": "was es gebracht hat, während Batterijplan wirklich gesteuert hat.",
    "Laatste back-up": "Letzte Sicherung",
    "instellingen": "Einstellungen",
    "Nog geen back-up": "Noch keine Sicherung",
    "Zeker? Tik nog een keer": "Sicher? Nochmal tippen",
    "niet gevonden": "nicht gefunden",
    "zonvoorspelling vandaag": "Solarprognose heute",
    "zonvoorspelling morgen": "Solarprognose morgen",
    "Zonvoorspelling niet gevonden. Vul de velden 'Zonvoorspelling vandaag' en 'Zonvoorspelling morgen' in bij Instellingen.": "Solarprognose nicht gefunden. Fülle die Felder 'Solarprognose heute' und 'Solarprognose morgen' in den Einstellungen aus.",
    "Tik om te typen": "Tippen zum Eingeben",
    "minder": "weniger",
    "meer": "mehr",
    "nu": "jetzt",
    "sensor niet gevonden": "Sensor nicht gefunden",
    "leeg · tik om in te vullen": "leer · zum Ausfüllen tippen",
    "Uitvoeren": "Ausführen",
    "klaar met leren": "fertig gelernt",
    "voorspelling": "Prognose",
    "aan het leren": "lernt",
    "dag": "Tag",
    "van": "von",
    "van 24 uren al gezien": "von 24 Stunden schon gesehen",
    "Haalt de batterij meer uit de duurste kwartieren dan HBC alleen?": "Holt die Batterie mehr aus den teuersten Viertelstunden als HBC allein?",
    "Modus": "Modus",
    "live": "live",
    "rekent mee, stuurt niet": "rechnet mit, steuert nicht",
    "Verbruik leren": "Verbrauch lernen",
    "HBC-strategie": "HBC-Strategie",
    "plan wacht tot Dynamic": "Plan wartet auf Dynamic",
    "Komend kwartier": "Nächste Viertelstunde",
    "zeer goed": "sehr gut",
    "goed": "gut",
    "redelijk": "ordentlich",
    "wisselvallig": "schwankend",
    "nog aan het meten": "wird noch gemessen",
    "Ontladen": "Entladen",
    "Ontladen (HBC)": "Entladen (HBC)",
    "goedkoop: laden": "günstig: laden",
    "duur: ontladen": "teuer: entladen",
    "lading HBC alleen": "Ladung nur HBC",
    "zon": "Sonne",
    "Advies huisverbruik": "Empfehlung Hausverbrauch",
"ingesteld": "eingestellt",
"advies": "Empfehlung",
"**Solar reserved for house** in HBC: eerst wat er nu in HBC is ingesteld, daarna het advies van Batterijplan (het gemiddelde van de laatste 7 dagen, afgerond op 0,5 kWh).\n\n- **– –**: er zijn nog geen 7 dagen gemeten; het advies komt vanzelf.\n- **groen**: staat goed, minder dan 1 kWh verschil.\n- **oranje**: aanpassen naar het advies. Staat *Solar reserved for house zelf instellen* aan (Instellingen, Expert), dan doet Batterijplan dat 's nachts zelf.\n\nMeer uitleg in het venster Advies HBC.": "**Solar reserved for house** in HBC: zuerst, was jetzt in HBC eingestellt ist, dann die Empfehlung von Batterijplan (der Durchschnitt der letzten 7 Tage, gerundet auf 0,5 kWh).\n\n- **– –**: es sind noch keine 7 Tage gemessen; die Empfehlung kommt von selbst.\n- **grün**: passt, weniger als 1 kWh Unterschied.\n- **orange**: auf die Empfehlung ändern. Ist *Solar reserved for house selbst einstellen* an (Einstellungen, Experte), macht Batterijplan das nachts selbst.\n\nMehr im Fenster HBC-Empfehlung.",
"Batterijplan-rapport": "Batterijplan-Bericht",
"Rapport downloaden": "Bericht herunterladen",
"Samenvatting": "Zusammenfassung",
"Status": "Status",
"Techniek": "Technik",
"Batterijplan staat op Live en stuurt HBC.": "Batterijplan steht auf Live und steuert HBC.",
"Batterijplan staat in schaduw: het rekent mee maar stuurt niets.": "Batterijplan ist im Schattenmodus: es rechnet mit, steuert aber nichts.",
"HBC staat op Dynamic.": "HBC steht auf Dynamic.",
"HBC staat niet op Dynamic; Batterijplan wacht.": "HBC steht nicht auf Dynamic; Batterijplan wartet.",
"Komend kwartier:": "Nächste Viertelstunde:",
"Verbruik leren:": "Verbrauch lernen:",
"Advies voor HBC:": "Empfehlung für HBC:",
"Opgeleverd sinds": "Eingebracht seit",
"Ontbreekt:": "Fehlt:",
"Alle sensoren en HBC-instellingen gevonden.": "Alle Sensoren und HBC-Einstellungen gefunden.",
"Prijs nu": "Preis jetzt",
"Huisverbruik nu": "Hausverbrauch jetzt",
"Voorspelling": "Vorhersage",
"Plan tot": "Plan bis",
"Dure kwartieren": "Teure Viertelstunden",
"Tekort": "Defizit",
"Bijsturen": "Nachsteuern",
"kwartieren": "Viertelstunden",
"Extra dit blok": "Extra in diesem Block",
"ja": "ja",
"nee": "nein",
"Stand": "Stand",
"Toelichting": "Erläuterung",
"Ingesteld in HBC": "In HBC eingestellt",
"Advies vandaag": "Empfehlung heute",
"Advies morgen": "Empfehlung morgen",
"Dagen gemeten": "Tage gemessen",
"Zelf instellen": "Selbst einstellen",
"aan": "an",
"uit": "aus",
"Totaal": "Gesamt",
"Instelling": "Einstellung",
"Waarde": "Wert",
"Sinds": "Seit",
"Tijd": "Zeit",
"Besluit": "Entscheidung",
"Laatst uitgevoerd": "Zuletzt ausgeführt",
"Alle planwaarden": "Alle Planwerte",
"Batterijplan stuurt alleen de drie Dynamic-standen van HBC, en alleen als Live aan staat. Dit rapport is in je browser gemaakt; er is niets op de server bewaard. Er staan geen namen of adressen in. Lees het na voordat je het deelt.": "Batterijplan steuert nur die drei Dynamic-Modi von HBC, und nur wenn Live an ist. Dieser Bericht wurde in deinem Browser erstellt; auf dem Server wird nichts gespeichert. Er enthält keine Namen oder Adressen. Lies ihn durch, bevor du ihn teilst.",
"Rapport bekijken opent het volledige rapport in een nieuw tabblad. Kopiëren voor GitHub zet een tekstversie klaar om in een melding te plakken.": "Bericht ansehen öffnet den ganzen Bericht in einem neuen Tab. Für GitHub kopieren legt eine Textfassung bereit, die du in ein Issue einfügen kannst.",
"Rapport bekijken": "Bericht ansehen",
"Downloaden (.html)": "Herunterladen (.html)",
"Kopiëren voor GitHub": "Für GitHub kopieren",
"Het rapport opent in een nieuw tabblad.": "Der Bericht öffnet sich in einem neuen Tab.",
"Je browser blokkeerde het nieuwe tabblad. Sta pop-ups toe voor Home Assistant.": "Dein Browser hat den neuen Tab blockiert. Erlaube Pop-ups für Home Assistant.",
"Kopiëren lukte niet. Download het rapport en voeg het bestand toe.": "Kopieren hat nicht geklappt. Lade den Bericht herunter und hänge die Datei an.",
"Het rapport wordt in je browser gemaakt uit wat Home Assistant al laat zien. Er wordt niets op de server bewaard.": "Der Bericht wird in deinem Browser aus dem erstellt, was Home Assistant ohnehin zeigt. Auf dem Server wird nichts gespeichert.",
"Opnieuw maken": "Neu erstellen",
"Nu ingesteld:": "Jetzt eingestellt:",
"Wacht op het leren": "Wartet auf das Lernen",
"Batterijplan leert eerst 7 dagen je verbruik (Verbruik leren). Daarna meet het 7 dagen hoeveel zon je huis gebruikt, en dan komt het eerste advies.": "Batterijplan lernt zuerst 7 Tage deinen Verbrauch (Verbrauch lernen). Danach misst es 7 Tage, wie viel Sonne dein Haus nutzt, und dann kommt die erste Empfehlung.",
"Gegevens ophalen…": "Daten werden geladen…",
"Nog aan het meten:": "Noch am Messen:",
"van 7 dagen": "von 7 Tagen",
"Wacht op 7 dagen meting van hoeveel zon je huis gebruikt na het goedkope laden. Eerste advies rond": "Wartet auf 7 Tage Messung, wie viel Sonne dein Haus nach dem günstigen Laden nutzt. Erste Empfehlung um den",
"Back-up gemaakt.": "Sicherung erstellt.",
"Je hebt in dit venster nog geen back-up gemaakt.": "Du hast in diesem Fenster noch keine Sicherung erstellt.",
"Back-up maken": "Sicherung erstellen",
"Weet je het zeker?": "Bist du sicher?",
"Ik weet het zeker": "Ich bin sicher",
"Annuleren": "Abbrechen",
"Ja, uitvoeren": "Ja, ausführen",
"Rapport": "Bericht",
"Alles wat Batterijplan nu weet en besluit, voor jezelf of als je om hulp vraagt. Er staan geen namen of adressen in. Lees het na voordat je het deelt.": "Alles, was Batterijplan gerade weiß und entscheidet, für dich selbst oder wenn du um Hilfe bittest. Es enthält keine Namen oder Adressen. Lies es durch, bevor du es teilst.",
"Kopiëren": "Kopieren",
"Downloaden (.md)": "Herunterladen (.md)",
"Melding maken op GitHub": "Issue auf GitHub öffnen",
"Gekopieerd": "Kopiert",
"Selecteer de tekst en kopieer met Ctrl+C.": "Markiere den Text und kopiere mit Strg+C.",
"Gedownload:": "Heruntergeladen:",
"Gekopieerd. Plak het rapport in de melding.": "Kopiert. Füge den Bericht in das Issue ein.",
"sinds": "seit",
"Gemaakt op": "Erstellt am",
"Er staan geen namen of adressen in. Lees het na voordat je het deelt.": "Es enthält keine Namen oder Adressen. Lies es durch, bevor du es teilst.",
"Taal": "Sprache",
"tijdzone": "Zeitzone",
"prijzen": "Preise",
"Advies": "Empfehlung",
"dagen gemeten": "Tage gemessen",
"gemiddeld": "Durchschnitt",
"Automatiseringen": "Automationen",
"laatst": "zuletzt",
"Overige sensoren": "Weitere Sensoren",
"Laatste 24 uur": "Letzte 24 Stunden",
"Alle wisselingen": "Alle Wechsel",
"geschiedenis niet beschikbaar": "Verlauf nicht verfügbar",
"Ontbreekt": "Fehlt",
"niets": "nichts",
"Per periode:": "Pro Zeitraum:",
"kies Dagen, Weken, Maanden, Kwartalen of Jaar. Elk vakje is wat Batterijplan in die periode opleverde bovenop HBC alleen. ▲ is meer dan de periode ervoor, ▼ minder, = ongeveer gelijk. De balk vergelijkt met de beste getoonde periode.": "wähle Tage, Wochen, Monate, Quartale oder Jahr. Jede Kachel ist, was Batterijplan in diesem Zeitraum zusätzlich zu HBC allein eingebracht hat. ▲ ist mehr als der Zeitraum davor, ▼ weniger, = etwa gleich. Der Balken vergleicht mit dem besten gezeigten Zeitraum.",
"Dagen": "Tage",
"Weken": "Wochen",
"Maanden": "Monate",
"Kwartalen": "Quartale",
"Jaar": "Jahr",
"HBC alleen": "nur HBC",
"nog niet geteld": "noch nicht gezählt",
"Week": "Woche",
"Nog niets geteld.": "Noch nichts gezählt.",
"deze maand": "diesen Monat",
"laatste 12 weken": "letzte 12 Wochen",
"laatste 12 maanden": "letzte 12 Monate",
"laatste 4 kwartalen": "letzte 4 Quartale",
"dit jaar": "dieses Jahr",
"Totalen": "Summen",
"geteld sinds": "gezählt seit",
"Opgeleverd": "Eingebracht",
"Live (echt gestuurd)": "Live (wirklich gesteuert)",
"Schaduw (zou opleveren)": "Schatten (würde einbringen)",
"Balk: groen = live, grijs = schaduw (totaal sinds de start).": "Balken: grün = live, grau = Schatten (gesamt seit dem Start).",
"Kwartieren ontladen / vastgehouden / overschot:": "Viertelstunden entladen / gehalten / Überschuss:",
"lading verschoven:": "Ladung verschoben:",
"▲ meer opgeleverd dan de periode ervoor · ▼ minder · = ongeveer gelijk. Balk: opbrengst vergeleken met de beste getoonde periode.": "▲ mehr eingebracht als der Zeitraum davor · ▼ weniger · = etwa gleich. Balken: Ertrag im Vergleich zum besten gezeigten Zeitraum.",
"Exporteren naar spreadsheet (CSV)": "In Tabelle exportieren (CSV)",
"Eén regel per dag, sinds de start. Wordt gedownload naar dit apparaat.": "Eine Zeile pro Tag, seit dem Start. Wird auf dieses Gerät heruntergeladen.",
"datum": "Datum",
"opgeleverd (EUR)": "eingebracht (EUR)",
"dagen": "Tage",
"plan tot hier": "Plan bis hier",
"Batterijplan maakt het plan voor deze dag pas als hij dichterbij komt. Je ziet nu wat HBC van plan is.": "Batterijplan erstellt den Plan für diesen Tag erst, wenn er näher rückt. Jetzt siehst du, was HBC vorhat.",
"Batterijplan stuurde deze dag niet bij: HBC regelde het zelf.": "Batterijplan hat an diesem Tag nicht nachgesteuert: HBC hat es selbst geregelt.",
"Batterijplan stuurt nu niet bij: bijsturen levert te weinig op, dus HBC regelt het zelf.": "Batterijplan steuert gerade nicht nach: Nachsteuern bringt zu wenig, also regelt HBC es selbst.",
"Batterijplan stuurt nu niet bij: HBC regelt het zelf.": "Batterijplan steuert gerade nicht nach: HBC regelt es selbst.",
"Zodra bijsturen genoeg oplevert, krijgen die kwartieren hier een eigen kleur.": "Sobald sich das Nachsteuern lohnt, bekommen diese Viertelstunden hier eine eigene Farbe.",
"Zie je geen gekleurde vlakken, dan stuurt Batterijplan niet bij en regelt HBC het zelf; dat staat dan ook onder de grafiek. Na de streepjeslijn “plan tot hier” zie je wat HBC van plan is; Batterijplan kleurt die kwartieren pas in als het plan zover is.": "Siehst du keine farbigen Flächen, steuert Batterijplan nicht nach und HBC regelt es selbst; das steht dann auch unter dem Diagramm. Nach der gestrichelten Linie „Plan bis hier“ siehst du, was HBC vorhat; Batterijplan färbt diese Viertelstunden erst ein, wenn der Plan so weit ist.",
    "lading (kWh)": "Ladung (kWh)",
    "vasthouden": "halten",
    "niet van het net geladen": "nicht aus dem Netz geladen",
    "niet van het net geladen (niet nodig)": "nicht aus dem Netz geladen (nicht nötig)",
    "bijladen van het net (tekort)": "Nachladen aus dem Netz (Fehlmenge)",
    "bijladen van het net": "Nachladen aus dem Netz",
    "Pas als het 1 kWh of meer afwijkt, krijg je een advies.": "Erst bei 1 kWh Abweichung oder mehr bekommst du eine Empfehlung.",
    "Zelf instellen staat aan (Instellingen, Expert): Batterijplan zet dit getal elke nacht om 23:50 zelf in HBC.": "Selbst einstellen ist an (Einstellungen, Experte): Batterijplan setzt diese Zahl jede Nacht um 23:50 selbst in HBC.",
    "Batterijplan verandert zelf niets in HBC, tenzij je Solar reserved for house zelf instellen aanzet (Instellingen, Expert).": "Batterijplan ändert selbst nichts in HBC, außer du schaltest Solar reserved for house selbst einstellen ein (Einstellungen, Experte).",
    "Solar reserved for house zelf instellen": "Solar reserved for house selbst einstellen",
    "Briefing en plan": "Briefing und Plan",
    "Bovenaan een korte briefing: wat er nu speelt, wat Batterijplan doet en wanneer de volgende laadkans is.": "Oben eine kurze Übersicht: was gerade passiert, was Batterijplan tut und wann die nächste Lademöglichkeit ist.",
    "Daaronder het plan voor de komende 24 uur, in zinnen. Het rolt mee: elk kwartier rekent Batterijplan opnieuw, wat voorbij is valt eraf en aan de achterkant komt er een kwartier bij. Zolang de prijzen van morgen er nog niet zijn (rond 13:00), loopt het tot het einde van de bekende prijzen.": "Darunter der Plan für die nächsten 24 Stunden, in Sätzen. Er rollt mit: jede Viertelstunde rechnet Batterijplan neu, Vergangenes fällt weg und hinten kommt eine Viertelstunde dazu. Solange die Preise von morgen noch fehlen (gegen 13:00), reicht er bis zum Ende der bekannten Preise.",
    "Tot het volgende goedkope moment is het plan zeker: daar stuurt Batterijplan nu op. Na de streep 'verwacht' is het een vooruitblik, die zeker wordt zodra dat goedkope moment voorbij is. De bolletjes hebben dezelfde kleuren als de grafiek.": "Bis zum nächsten günstigen Moment ist der Plan fest: darauf steuert Batterijplan jetzt. Nach der Linie 'erwartet' ist es ein Ausblick, der fest wird, sobald dieser günstige Moment vorbei ist. Die Punkte haben dieselben Farben wie das Diagramm.",
    "duur": "teuer",
    "duur, vasthouden": "teuer, halten",
    "goedkoop": "günstig",
    "goedkoop, niet van het net laden": "günstig, nicht aus dem Netz laden",
    "in stukjes": "in Stücken",
    "loopt door": "läuft weiter",
    "verwacht": "erwartet",
    "komende": "nächste",
    "uur": "Stunden",
    "De batterij levert aan het huis": "Die Batterie versorgt das Haus",
    "tot ca.": "bis ca.",
    "dan is hij leeg": "dann ist sie leer",
    "Lading bewaren voor het duurdere moment": "Ladung aufheben für den teureren Moment",
    "HBC laadt van het net": "HBC lädt aus dem Netz",
    "Er zit genoeg in": "Es ist genug drin",
    "voor de dure kwartieren om": "für die teuren Viertelstunden um",
    "Er komt ca.": "Es kommen ca.",
    "bij": "dazu",
    "levert ca.": "bringt ca.",
    "op": " ",
    "Er zit ca.": "Es sind ca.",
    "te veel in tot het volgende goedkope moment; dat gaat nu al naar het huis.": "zu viel drin bis zum nächsten günstigen Moment; das geht schon jetzt ans Haus.",
    "Duur blok tot": "Teurer Block bis",
    "De batterij": "Die Batterie",
    "houdt het vol tot ca.": "hält durch bis ca.",
    "daarna komt ca.": "danach kommen ca.",
    "van het net": "aus dem Netz",
    "daarna komt de rest van het net": "danach kommt der Rest aus dem Netz",
    "houdt het hele blok vol": "hält den ganzen Block durch",
    "Goedkoop tot": "Günstig bis",
    "niet van het net laden, er zit genoeg in": "nicht aus dem Netz laden, es ist genug drin",
    "In de batterij": "In der Batterie",
    "in de batterij": "in der Batterie",
    "Volgend duur blok": "Nächster teurer Block",
    "de batterij houdt het vol tot ca.": "die Batterie hält durch bis ca.",
    "daar is genoeg voor": "dafür reicht es",
    "Geen duur blok in de komende uren": "Kein teurer Block in den nächsten Stunden",
    "Batterijplan laat HBC bijladen van het net om": "Batterijplan lässt HBC aus dem Netz nachladen um",
    "ca.": "ca.",
    "kwartier vasthouden": "Viertelstunde halten",
    "kwartieren vasthouden": "Viertelstunden halten",
    "Batterijplan stuurt bij": "Batterijplan steuert nach",
    "en": "und",
    "Batterijplan stuurt niet bij: HBC regelt het zelf.": "Batterijplan steuert nicht nach: HBC regelt es selbst.",
    "Volgende laadkans": "Nächste Lademöglichkeit",
    "Geen goedkope of dure momenten in de komende uren: HBC laadt met zon.": "Keine günstigen oder teuren Momente in den nächsten Stunden: HBC lädt mit Sonne.",
    "Bijladen van het net": "Nachladen aus dem Netz",
    "Bijladen van het net:": "Nachladen aus dem Netz:",
    "Vasthouden": "Halten",
    "Laden (HBC)": "Laden (HBC)",
    "Zon laden (HBC)": "Solarladen (HBC)",
    "Niet ingesteld": "Nicht eingerichtet",
    "Geen batterijdata": "Keine Batteriedaten",
    "Geen prijsdata": "Keine Preisdaten",
    "HBC niet op Dynamic": "HBC nicht auf Dynamic",
    "**Live**: Batterijplan zet elk kwartier de twee Dynamic-standen van HBC.\n\n**Schaduw**: Batterijplan rekent mee en laat zien wat het zou doen, maar verandert niets aan HBC.\n\nAan- en uitzetten doe je met de schakelaar Live bovenaan.": "**Live**: Batterijplan stellt jede Viertelstunde die beiden Dynamic-Stellungen von HBC ein.\n\n**Schatten**: Batterijplan rechnet mit und zeigt, was es tun würde, ändert aber nichts an HBC.\n\nEin- und ausschalten mit dem Schalter Live oben.",
    "Batterijplan leert per uur van de dag hoeveel je huis gebruikt. Na 7 dagen is het klaar met leren. Daarna leert het glijdend door, zodat het met de seizoenen meegaat.\n\nDe **voorspelling** zegt hoe goed het geleerde verbruik het echte verbruik raakt, per blok van 3 uur:\n- wisselvallig: minder dan 55 %\n- redelijk: 55 % of meer\n- goed: 65 % of meer\n- zeer goed: 75 % of meer\n- uitstekend: 85 % of meer\n\nZolang er nog geen blok van 3 uur gemeten is, staat er: nog aan het meten.\n\nIs de voorspelling **wisselvallig**, dan rekent het plan zelf met **extra marge**: de gemiddelde afwijking per blok van 3 uur, maximaal 1 kWh, bovenop je eigen veiligheidsmarge. De batterij raakt dan minder vaak te vroeg leeg. Wordt de voorspelling beter, dan valt die extra marge vanzelf weg.": "Batterijplan lernt pro Stunde des Tages, wie viel dein Haus verbraucht. Nach 7 Tagen ist es fertig. Danach lernt es gleitend weiter, damit es den Jahreszeiten folgt.\n\nDie **Prognose** sagt, wie gut der gelernte Verbrauch den echten Verbrauch trifft, pro Block von 3 Stunden:\n- schwankend: weniger als 55 %\n- ordentlich: 55 % oder mehr\n- gut: 65 % oder mehr\n- sehr gut: 75 % oder mehr\n- ausgezeichnet: 85 % oder mehr\n\nSolange noch kein 3-Stunden-Block gemessen ist, steht dort: wird noch gemessen.\n\nIst die Prognose **schwankend**, rechnet der Plan selbst mit **zusätzlicher Reserve**: die durchschnittliche Abweichung pro 3-Stunden-Block, höchstens 1 kWh, zusätzlich zu deiner eigenen Sicherheitsreserve. Die Batterie ist dann seltener zu früh leer. Wird die Prognose besser, fällt die zusätzliche Reserve von selbst weg.",
    "Batterijplan werkt alleen als HBC op **Dynamic** staat. Staat HBC op iets anders, dan wacht het plan en verandert Batterijplan niets. Het leren gaat gewoon door.": "Batterijplan arbeitet nur, wenn HBC auf **Dynamic** steht. Steht HBC auf etwas anderem, wartet der Plan und Batterijplan ändert nichts. Das Lernen läuft einfach weiter.",
    "Wat Batterijplan voor het volgende kwartier besluit:\n- **Ontladen**: de batterij levert aan het huis in een duur kwartier.\n- **Vasthouden**: de lading wordt bewaard voor een nog duurder moment.\n- **Overschot ontladen**: er zit meer in de batterij dan nodig is tot het volgende goedkope moment.\n- **Niet van het net laden**: een goedkoop kwartier, maar de zon vult de batterij genoeg voor de dure kwartieren die komen. HBC laadt dan alleen met zon.\n- **Bijladen van het net**: de batterij redt de dure kwartieren die komen niet (de zon valt tegen of HBC laadde 's nachts weinig). Batterijplan laat HBC in dit goedkopere kwartier alsnog van het net laden, niet meer dan het tekort.\n- **Ontladen (HBC)**, **Laden (HBC)** of **Zon laden (HBC)**: HBC regelt het zelf. Bijsturen levert dan minder dan € 0,10 op.": "Was Batterijplan für die nächste Viertelstunde entscheidet:\n- **Entladen**: die Batterie versorgt das Haus in einer teuren Viertelstunde.\n- **Halten**: die Ladung wird für einen noch teureren Moment aufbewahrt.\n- **Überschuss entladen**: es ist mehr in der Batterie als bis zum nächsten günstigen Moment nötig.\n- **Nicht aus dem Netz laden**: eine günstige Viertelstunde, aber die Sonne füllt die Batterie genug für die teuren Viertelstunden, die kommen. HBC lädt dann nur mit Sonne.\n- **Nachladen aus dem Netz**: die Batterie reicht nicht für die kommenden teuren Viertelstunden (weniger Sonne als erwartet oder HBC hat nachts wenig geladen). Batterijplan lässt HBC in dieser günstigeren Viertelstunde doch aus dem Netz laden, nicht mehr als die Fehlmenge.\n- **Entladen (HBC)**, **Laden (HBC)** oder **Solarladen (HBC)**: HBC regelt es selbst. Eingreifen brächte weniger als 0,10 €.",
    "Geen vermogenssensor gevonden. Typ de naam zelf.": "Kein Leistungssensor gefunden. Gib den Namen selbst ein.",
    "Kies je sensor; rechts staat wat hij nu meldt.": "Wähle deinen Sensor; rechts steht, was er gerade meldet.",
    "Afname is +, teruglevering is −. Kies de sensor die nu het netvermogen van je hele huis meldt.": "Bezug ist +, Einspeisung ist −. Wähle den Sensor, der gerade die Netzleistung deines ganzen Hauses meldet.",
    "Kies de sensor met wat al je zonnepanelen samen nu opwekken.": "Wähle den Sensor mit dem, was alle deine Solarmodule zusammen gerade erzeugen.",
    "Kies het totaal van al je batterijen (ontladen is +). Bij HBC meestal: house total battery power.": "Wähle die Summe aller deiner Batterien (Entladen ist +). Bei HBC meist: house total battery power.",
    "Kies het laadvermogen van je auto-lader.": "Wähle die Ladeleistung deiner Wallbox.",
    "uitstekend": "ausgezeichnet",
    "extra marge": "zusätzliche Reserve",
    "Niet van het net laden": "Nicht aus dem Netz laden",
    "hetzelfde als HBC": "dasselbe wie HBC",
    "Regels": "Regeln",
    "Regel": "Regel",
    "laden": "Laden",
    "ontladen": "Entladen",
    "terugleveren": "Einspeisen",
    "laden van het net": "aus dem Netz laden",
    "alleen zon / niets": "nur Sonne / nichts",
    "Dit contractjaar": "Dieses Vertragsjahr",
    "Kwartieren ontladen / vastgehouden / teruggeleverd": "Viertelstunden entladen / gehalten / eingespeist",
    "Kwartieren ontladen / vastgehouden / teruggeleverd:": "Viertelstunden entladen / gehalten / eingespeist:",
    "Kosten HBC alleen": "Kosten nur HBC",
    "Kosten met Batterijplan": "Kosten mit Batterijplan",
    "Verwachte besparing t.o.v. HBC alleen": "Erwartete Ersparnis gegenüber HBC allein",
    "Kwartieren in het plan": "Viertelstunden im Plan",
    "Acties in het plan": "Aktionen im Plan",
    "Bij terugleveren telt wat je ontvangt, minus wat het kost om die lading later weer goedkoop in te kopen.": "Beim Einspeisen zählt, was du erhältst, abzüglich der Kosten, diese Ladung später wieder günstig einzukaufen.",
    "**Live**: Batterijplan zet elk kwartier de Dynamic-standen van HBC.\n\n**Schaduw**: Batterijplan rekent mee en laat zien wat het zou doen, maar verandert niets aan HBC.\n\nAan- en uitzetten doe je met de schakelaar Live bovenaan.": "**Live**: Batterijplan setzt jede Viertelstunde die Dynamic-Modi von HBC.\n\n**Schatten**: Batterijplan rechnet mit und zeigt, was es tun würde, ändert aber nichts an HBC.\n\nEin- und ausschalten geht mit dem Schalter Live oben.",
    "Wat Batterijplan voor het volgende kwartier besluit, naast wat HBC alleen zou doen:\n- **Laden van het net**: de batterij wordt van het net geladen.\n- **Ontladen**: de batterij levert aan het huis.\n- **Vasthouden**: de lading wordt bewaard voor een nog duurder moment.\n- **Terugleveren**: de batterij levert terug aan het net.\n- **Alleen zon / niets**: niet laden van het net en niet ontladen.\n\nIs het plan gelijk aan HBC, dan staat er dat het hetzelfde is.": "Was Batterijplan für die nächste Viertelstunde beschließt, neben dem, was HBC allein tun würde:\n- **Aus dem Netz laden**: die Batterie wird aus dem Netz geladen.\n- **Entladen**: die Batterie versorgt das Haus.\n- **Halten**: die Ladung wird für einen teureren Moment aufbewahrt.\n- **Einspeisen**: die Batterie liefert ans Netz zurück.\n- **Nur Sonne / nichts**: kein Laden aus dem Netz und kein Entladen.\n\nIst der Plan gleich HBC, steht dort, dass es dasselbe ist.",
    "De vier regels waarmee Batterijplan mag bijsturen. Je zet ze aan of uit onder Instellingen, tabblad Regels.\n\nStaat een regel uit, dan doet Batterijplan op dat punt wat HBC doet.": "Die vier Regeln, mit denen Batterijplan nachsteuern darf. Du schaltest sie unter Einstellungen, Reiter Regeln, ein oder aus.\n\nIst eine Regel aus, tut Batterijplan an diesem Punkt, was HBC tut.",
    "Het btw-percentage dat Batterijplan over de inkoopprijs rekent.\n\nIn Nederland is dat 21 %. Staat Prijzen van HBC op all-in, dan is dit niet nodig.": "Der Mehrwertsteuersatz, den Batterijplan auf den Einkaufspreis rechnet.\n\nIn den Niederlanden sind das 21 %. Steht Preise von HBC auf all-in, ist das nicht nötig.",
    "Wat je per kWh bovenop de beursprijs ontvangt voor teruggeleverde stroom, zonder btw. Bij een negatief getal ontvang je minder.\n\nVoorbeeld: 0,02 betekent beurs + € 0,02 per kWh. Je vindt dit bij de voorwaarden van je contract.": "Was du pro kWh zusätzlich zum Börsenpreis für eingespeisten Strom erhältst, ohne MwSt. Bei einer negativen Zahl erhältst du weniger.\n\nBeispiel: 0,02 bedeutet Börse + 0,02 € pro kWh. Das findest du in den Bedingungen deines Vertrags.",
    "Extra percentage dat je overdag (met zon, of tussen 08:00 en 17:00) bovenop de terugleververgoeding krijgt, als die positief is.\n\nVoorbeeld: 10 % betekent dat de vergoeding overdag 10 % hoger is. Heeft je contract geen bonus, zet dit dan op 0.": "Zusätzlicher Prozentsatz, den du tagsüber (bei Sonne oder zwischen 08:00 und 17:00 Uhr) auf die Einspeisevergütung erhältst, wenn diese positiv ist.\n\nBeispiel: 10 % bedeutet, dass die Vergütung tagsüber 10 % höher ist. Hat dein Vertrag keinen Bonus, setze dies auf 0.",
    "Btw": "MwSt",
    "Teruglever-toeslag (excl. btw)": "Einspeise-Zuschlag (ohne MwSt)",
    "Teruglever-bonus overdag": "Einspeise-Bonus tagsüber"
   }
  };
  const t = (s) => (LANG !== "nl" && I18N[LANG] && I18N[LANG][s] != null ? I18N[LANG][s] : s);
  // language: card config taal (nl|en|de) first, then the user profile; anything else falls back to English
  const zetTaal = (h, c) => {
    const o = String((c && c.taal) || "").slice(0, 2).toLowerCase();
    const l = ["nl", "en", "de"].includes(o) ? o : String((h && ((h.locale && h.locale.language) || h.language)) || "nl").slice(0, 2).toLowerCase();
    LANG = l === "nl" || l === "de" ? l : "en"; DAG = DAGEN[LANG]; MAAND = MAANDEN[LANG];
    // number notation follows the HA profile setting
    const nf = h && h.locale && h.locale.number_format;
    NUMLOC = nf === "comma_decimal" || nf === "none" ? "en-US" : nf === "decimal_comma" ? "de-DE" : nf === "space_comma" ? "fr-FR" : nf === "system" ? undefined : (LOC[LANG] || "nl-NL");
  };
  let NUMLOC = "nl-NL";
  const pad = (n) => String(n).padStart(2, "0");
  const hm = (d) => pad(d.getHours()) + ":" + pad(d.getMinutes());
  // also escape ': the cards often put values between single quotes in attributes
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nl = (v, d) => (Number.isFinite(v) ? v.toLocaleString(NUMLOC, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
  const allin = (pa) => (pa || {}).prijzen === "all-in";
  // money in the house style: more than 0 = "+ € x" green, exactly 0 = "€ 0,00" grey, less than 0 = "– € x" orange
  const geld = (v) => { const r = Math.round((Number(v) || 0) * 100) / 100;
    return r > 0 ? { txt: "+ € " + nl(r, 2), kleur: "#66bb6a" } : r < 0 ? { txt: "– € " + nl(-r, 2), kleur: "#ff9800" } : { txt: "€ " + nl(0, 2), kleur: "var(--secondary-text-color)" }; };
  const arr = (v) => { if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch (e) { return []; } };

  class BpBase extends HTMLElement {
    setConfig(c) { this._config = Object.assign({}, c || {}); this._key = null; if (this._hass) this._render(); }
    set hass(h) {
      this._hass = h;
      zetTaal(h, this._config);
      if (this._lang !== LANG) { this._lang = LANG; this._key = null; if (this._card) { this._card.remove(); this._card = null; this._knoppen = false; this.shadowRoot.innerHTML = ""; } }
      const key = [IDS.plan, IDS.marks, zonIds(h.states).vandaag, "sensor.batterijplan_meerwaarde", "sensor.batterijplan_meerwaarde_periode", "switch.batterijplan_live", "sensor.batterijplan_advies_hbc", "switch.batterijplan_hbc_auto", "input_number.house_battery_strategy_dynamic_cheapest_hrs", "input_number.house_battery_strategy_dynamic_expensive_hrs", "input_number.house_battery_solar_reserved_for_house"].map((id) => (h.states[id] || {}).last_updated || "").join("|");
      if (key !== this._key) { this._key = key; this._render(); }
    }
    connectedCallback() { if (!this._tick) this._tick = setInterval(() => this._render(), 60000); }
    disconnectedCallback() { clearInterval(this._tick); this._tick = null; }
    getCardSize() { return 6; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }
    _shell() {
      zetTaal(this._hass, this._config);
      if (this._card) return;
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      const c = this._config;
      this.shadowRoot.innerHTML =
        "<style>:host{display:block}ha-card{overflow:hidden}" +
        ".hdr{display:flex;flex-direction:column;gap:10px;padding:16px 16px 0}" +
        ".title{font-size:20px;font-weight:700;color:var(--primary-text-color);display:flex;align-items:center;gap:8px}.title ha-icon{--mdc-icon-size:24px}" +
        ".chips{display:flex;gap:16px;flex-wrap:wrap;justify-content:space-between}" +
        ".chip{display:flex;flex-direction:column}.chip .v{font-size:24px;line-height:1.2}.chip .u{font-size:15px;margin-left:2px;opacity:.9}" +
        ".chip .n{font-size:12px;color:var(--secondary-text-color)}.chip[title]{cursor:help}.chip[title] .n{text-decoration:underline dotted;text-underline-offset:3px}" +
        ".i{--mdc-icon-size:20px;color:#8ab4f8;cursor:pointer}.uitleg{display:none}" +
        ".ui-scherm{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}" +
        ".ui-paneel{width:100%;max-width:560px;max-height:85vh;overflow:auto;border-radius:12px;background:var(--card-background-color);border:1px solid var(--divider-color);box-shadow:0 8px 30px rgba(0,0,0,.5);padding:14px 16px;font-size:13px;line-height:1.55;color:var(--primary-text-color)}" +
        ".ui-kop{display:flex;align-items:center;gap:10px;margin-bottom:10px}.ui-kop b{font-size:15px}.terug{cursor:pointer;color:var(--primary-color);font-size:13px;padding:2px 10px;border:1px solid var(--divider-color);border-radius:14px;user-select:none}" +
        ".ui-paneel p{margin:0 0 8px}.ui-paneel p:last-child{margin:0}" +
        ".body{position:relative;padding:0 16px 16px}.tip{position:absolute;pointer-events:none;z-index:2;display:none}" +
        "table{border-collapse:collapse;font-size:13px;margin-top:10px}td{padding:3px 10px 3px 0;vertical-align:top}" +
        ".leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--secondary-text-color);margin-top:8px}" +
        ".leg span{display:inline-flex;align-items:center;gap:4px}.dot{width:10px;height:10px;border-radius:2px;display:inline-block}" +
        "</style><ha-card><div class='hdr'><div class='title'>" + (c.icon ? "<ha-icon icon='" + esc(c.icon) + "'></ha-icon>" : "") +
        "<span>" + esc(t(c.title || "")) + "</span><ha-icon class='i' icon='mdi:information-outline' title='" + esc(t("Hoe lees je dit?")) + "'></ha-icon></div><div class='uitleg'></div><div class='chips'></div></div><div class='body'></div></ha-card>";
      this._card = this.shadowRoot.querySelector("ha-card");
      this._chips = this.shadowRoot.querySelector(".chips");
      this._body = this.shadowRoot.querySelector(".body");
      this._uitlegEl = this.shadowRoot.querySelector(".uitleg");
      this.shadowRoot.querySelector(".i").addEventListener("click", () => this._toonUitleg());
    }
    // explanation as a window (house style): header "How to read this?" with a Back button; also closes with Esc or a click outside
    _toonUitleg() {
      if (this._uiScherm) return;
      const scherm = document.createElement("div"); scherm.className = "ui-scherm";
      scherm.innerHTML = "<div class='ui-paneel'><div class='ui-kop'><span class='terug'>‹ " + esc(t("Terug")) + "</span><b>" + esc(t("Hoe lees je dit?")) + "</b></div><div class='ui-tekst'></div></div>";
      scherm.querySelector(".ui-tekst").innerHTML = this._uitlegHtml || "";
      const dicht = () => { scherm.remove(); this._uiScherm = null; document.removeEventListener("keydown", esc_); };
      const esc_ = (e) => { if (e.key === "Escape") dicht(); };
      scherm.addEventListener("click", (e) => { if (e.target === scherm || e.target.classList.contains("terug")) dicht(); });
      document.addEventListener("keydown", esc_);
      this.shadowRoot.appendChild(scherm); this._uiScherm = scherm;
    }
    _setUitleg(html) {
      this._uitlegHtml = html;
      if (this._uiScherm) { const el = this._uiScherm.querySelector(".ui-tekst"); if (el && el.innerHTML !== html) el.innerHTML = html; }
    }
    _setChips(list) {
      this._chips.innerHTML = list.map((c) => "<div class='chip'" + (TIP[c.name] ? ' title="' + esc(t(TIP[c.name])) + '"' : "") + "><span class='v' style='color:" + esc(c.color) + "'>" + esc(c.value) +
        (c.unit ? "<span class='u'>" + esc(c.unit) + "</span>" : "") + "</span><span class='n'>" + esc(t(c.name)) + "</span></div>").join("");
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Earnings: counters from sensor.batterijplan_meerwaarde (total) and sensor.batterijplan_meerwaarde_periode (contract year), explanation behind the (i)
  class BpOpbrengst extends BpBase {
    static getStubConfig() { return { title: "Wat levert het op", icon: "batterijplan:euro" }; }
    getGridOptions() { return { columns: 12, rows: "auto" }; }
    // option perioden: true = Days / Weeks / Months / Quarters / Year, totals, one tile per period with up/down versus the previous one, and CSV export
    _render() {
      if (!this._hass) return;
      if (!this._config.perioden) return this._renderOud();
      this._shell();
      this._chips.style.display = "none";
      this._setUitleg("<p><b>" + t("Wat telt hier?") + "</b> " + t("Elk kwartier schat Batterijplan het verschil tussen HBC alleen en HBC met Batterijplan, inclusief btw.") + " " +
        t("Bij vasthouden telt de lading mee tegen de gemiddelde prijs van de dure kwartieren waar het plan haar later voor inzet.") + " " +
        t("Bij terugleveren telt wat je ontvangt, minus wat het kost om die lading later weer goedkoop in te kopen.") + "</p>" +
        "<p><b>" + t("Per periode:") + "</b> " + t("kies Dagen, Weken, Maanden, Kwartalen of Jaar. Elk vakje is wat Batterijplan in die periode opleverde bovenop HBC alleen. ▲ is meer dan de periode ervoor, ▼ minder, = ongeveer gelijk. De balk vergelijkt met de beste getoonde periode.") + "</p>" +
        "<p><b>" + t("Schaduw") + "</b> = " + t("wat het had opgeleverd terwijl Live uit stond (niet echt verdiend).") + " <b>" + t("Live") + "</b> = " + t("wat het opleverde terwijl Batterijplan echt stuurde.") + "</p>" +
        "<p>" + t("Het blijft een schatting; je energierekening is het echte bewijs. Staat HBC niet op Dynamic, dan telt er niets bij.") + "</p>");
      const uur = Math.floor(Date.now() / 3600000);
      if (this._dataUur !== uur && !this._laden) {
        this._laden = true;
        // history: the statistic of sensor.batterijplan_meerwaarde (kept in the recorder; the integration takes this name once the old package is gone)
        const id = "sensor.batterijplan_meerwaarde";
        const vraag = (period, van) => this._hass.callWS({ type: "recorder/statistics_during_period", start_time: new Date(van).toISOString(), statistic_ids: [id], period, types: ["change"] })
          .then((r) => (r[id] || []).map((x) => ({ d: new Date(typeof x.start === "number" ? x.start : Date.parse(x.start)), v: Number(x.change) || 0 })));
        Promise.all([vraag("day", Date.now() - 400 * 86400000), vraag("month", new Date(new Date().getFullYear() - 4, 0, 1))])
          .then(([dagen, maanden]) => { this._dagen = dagen; this._maanden = maanden; this._dataUur = uur; this._laden = false; this._teken(); })
          .catch(() => { this._laden = false; this._dagen = this._dagen || []; this._maanden = this._maanden || []; this._teken(); });
      }
      this._teken();
    }
    _teken() {
      if (!this._body || !this._hass) return;
      zetTaal(this._hass, this._config);
      const a = (this._hass.states[(this._hass.states["sensor.batterijplan_meerwaarde_2"] ? "sensor.batterijplan_meerwaarde_2" : "sensor.batterijplan_meerwaarde")] || {}).attributes || {};
      if (!this._P) { try { this._P = localStorage.getItem("batterijplan-opbrengst-periode") || "Days"; } catch (e) { this._P = "Days"; } }
      const P = this._P, dagen = this._dagen, maanden = this._maanden || [];
      const css = "<style>.pp{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:6px 0 10px}" +
        ".pk{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--divider-color);border-radius:10px;background:var(--card-background-color);color:var(--primary-text-color);padding:8px 2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
        ".pk.on{background:#22c55e;border-color:#22c55e;color:#0b1220}.tot{border:1px solid var(--divider-color);border-radius:10px;padding:10px 12px;margin-bottom:10px}" +
        ".tot .k{font-size:12px;color:var(--secondary-text-color);margin-bottom:6px}.bxs{display:flex;flex-wrap:wrap;gap:12px}.bx{flex:1;min-width:110px}.bx .l{font-size:11px;color:var(--secondary-text-color)}.bx .w{font-size:20px;font-weight:700}" +
        ".lb{height:8px;border-radius:4px;background:rgba(148,163,184,.15);overflow:hidden;margin:8px 0 4px;display:flex}.vt{font-size:11px;color:var(--secondary-text-color)}" +
        ".kal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.wd{text-align:center;font-size:11px;color:var(--secondary-text-color)}.tls{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}" +
        ".tl{border:1px solid var(--divider-color);border-radius:10px;padding:8px 10px;min-width:0}.tl.dim{opacity:.35}.tl .h{display:flex;gap:6px;align-items:center;font-size:12px;color:var(--secondary-text-color)}" +
        ".tl .bar{height:8px;border-radius:4px;background:rgba(148,163,184,.15);overflow:hidden;margin:6px 0 4px}.tl .bar i{display:block;height:100%}.tl .w{font-size:16px;font-weight:600;white-space:nowrap}.tl .s{font-size:11px;color:var(--secondary-text-color);min-height:14px}" +
        ".mnd{font-size:14px;font-weight:600;margin-bottom:8px}.exp{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px}" +
        ".exp button{font:inherit;font-size:13px;border-radius:999px;border:1.5px solid var(--primary-color);background:none;color:var(--primary-text-color);padding:7px 16px;cursor:pointer}" +
        "@media (max-width:600px){.kal .tl{padding:5px 4px}.kal .tl .w{font-size:11px}.kal .tl .s{display:none}.pk{font-size:11px}}</style>";
      const knop = [["Days", "Dagen"], ["Weeks", "Weken"], ["Months", "Maanden"], ["Quarters", "Kwartalen"], ["Year", "Jaar"]];
      const kop = "<div class='pp'>" + knop.map(([k, n]) => "<button class='pk" + (k === P ? " on" : "") + "' data-per='" + k + "'>" + esc(t(n)) + "</button>").join("") + "</div>";
      if (!dagen) { this._body.innerHTML = css + kop + "<div class='vt'>" + esc(t("Gegevens ophalen…")) + "</div>"; this._wireP(); return; }
      const loc = LOC[LANG] || "nl-NL", MN = MAANDEN[LANG] || MAANDEN.nl, DG = DAGEN[LANG] || DAGEN.nl;
      const vandaag = new Date(); vandaag.setHours(0, 0, 0, 0);
      const sm = String(a.sinds || "").match(/^(\d{1,2})-(\d{1,2})-(\d{4})/), si = String(a.sinds || "").match(/^(\d{4})-(\d{2})-(\d{2})/), sinds = sm ? new Date(+sm[3], +sm[2] - 1, +sm[1]) : si ? new Date(+si[1], +si[2] - 1, +si[3]) : null;
      const som = (l) => l.reduce((x, y) => x + y.v, 0);
      const eurK = (v) => { const g = geld(v); return "<span style='color:" + g.kleur + "'>" + esc(g.txt) + "</span>"; };
      const trend = (v, vorig) => { if (vorig == null) return "<span>•</span>"; const d = v - vorig, drempel = Math.max(0.01, Math.abs(vorig) * 0.05);
        return Math.abs(d) < drempel ? "<span>=</span>" : d > 0 ? "<span style='color:#22c55e'>▲</span>" : "<span style='color:#ff9800'>▼</span>"; };
      const vak = (label, v, max, vorig, dim, onder) => { const w = v != null && max > 0 ? Math.max(Math.abs(v) / max * 100, Math.abs(v) >= 0.005 ? 6 : 0) : 0;
        return "<div class='tl" + (dim ? " dim" : "") + "'><div class='h'>" + (dim ? "<span>•</span>" : trend(v, vorig)) + "<span>" + esc(label) + "</span></div>" +
          "<div class='bar'><i style='width:" + w + "%;background:" + (v < 0 ? "#ff9800" : "#66bb6a") + "'></i></div><div class='w'>" + (v != null && !dim ? eurK(v) : "–") + "</div><div class='s'>" + esc(onder || "") + "</div></div>"; };
      const isoWeek = (dt) => { const x = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())), dn = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - dn);
        const jr = x.getUTCFullYear(); return { y: jr, w: Math.ceil(((x - Date.UTC(jr, 0, 1)) / 86400000 + 1) / 7) }; };
      let raster = "";
      if (P === "Days") {
        const jr = vandaag.getFullYear(), mn = vandaag.getMonth(), eerste = new Date(jr, mn, 1), nDag = new Date(jr, mn + 1, 0).getDate(), off = (eerste.getDay() + 6) % 7;
        const perDag = {}; dagen.forEach((x) => { if (x.d.getFullYear() === jr && x.d.getMonth() === mn) perDag[x.d.getDate()] = (perDag[x.d.getDate()] || 0) + x.v; });
        const max = Math.max(...Object.values(perDag).map(Math.abs), 0.01);
        raster = "<div class='mnd'>" + esc(MN[mn] + " " + jr) + "</div><div class='kal'>" + [1, 2, 3, 4, 5, 6, 0].map((k) => "<div class='wd'>" + esc(DG[k]) + "</div>").join("") + "<div></div>".repeat(off);
        for (let dd = 1; dd <= nDag; dd++) { const dt = new Date(jr, mn, dd), v = perDag[dd], voor = sinds && dt < sinds, later = dt > vandaag;
          raster += v != null ? vak(String(dd), v, max, perDag[dd - 1], false, Math.abs(v) < 0.005 ? t("HBC alleen") : "") : vak(String(dd), null, max, null, true, voor ? t("nog niet geteld") : later ? "" : t("HBC alleen")); }
        raster += "</div>";
      } else {
        const groep = new Map(), bron = P === "Weeks" ? dagen : maanden;
        bron.forEach((x) => { let k, label;
          if (P === "Weeks") { const w = isoWeek(x.d); k = w.y * 100 + w.w; label = t("Week") + " " + w.w + " · " + w.y; }
          else if (P === "Months") { k = x.d.getFullYear() * 100 + x.d.getMonth(); label = MN[x.d.getMonth()] + " " + x.d.getFullYear(); }
          else if (P === "Quarters") { const kw = Math.floor(x.d.getMonth() / 3) + 1; k = x.d.getFullYear() * 10 + kw; label = "Q" + kw + " " + x.d.getFullYear(); }
          else { k = x.d.getFullYear(); label = String(k); }
          if (!groep.has(k)) groep.set(k, { label, v: 0 }); groep.get(k).v += x.v; });
        const sl = [...groep.keys()].sort((p, q) => q - p), neem = { Weeks: 12, Months: 12, Quarters: 4, Year: 5 }[P] || 12;
        const rijen = sl.slice(0, neem + 1).map((k) => groep.get(k)), toon = rijen.slice(0, neem), max = Math.max(...toon.map((x) => Math.abs(x.v)), 0.01);
        raster = toon.length ? "<div class='tls'>" + toon.map((x, i) => vak(x.label, x.v, max, rijen[i + 1] ? rijen[i + 1].v : null, false, "")).join("") + "</div>" : "<div class='vt'>" + esc(t("Nog niets geteld.")) + "</div>";
      }
      // totals over the same scope as the tiles
      let van, scope;
      if (P === "Days") { van = new Date(vandaag.getFullYear(), vandaag.getMonth(), 1); scope = t("deze maand"); }
      else if (P === "Weeks") { van = new Date(vandaag); van.setDate(van.getDate() - 7 * 12 + 1); scope = t("laatste 12 weken"); }
      else if (P === "Months") { van = new Date(vandaag.getFullYear(), vandaag.getMonth() - 11, 1); scope = t("laatste 12 maanden"); }
      else if (P === "Quarters") { van = new Date(vandaag.getFullYear(), Math.floor(vandaag.getMonth() / 3) * 3 - 9, 1); scope = t("laatste 4 kwartalen"); }
      else { van = new Date(vandaag.getFullYear(), 0, 1); scope = t("dit jaar"); }
      const inScope = dagen.filter((x) => x.d >= van), tot = som(inScope), beste = inScope.reduce((p, q) => (q.v > p.v ? q : p), { v: 0, d: null });
      const pk = this._hass.states[(this._hass.states["sensor.batterijplan_meerwaarde_periode_2"] ? "sensor.batterijplan_meerwaarde_periode_2" : "sensor.batterijplan_meerwaarde_periode")] || {};
      const live = Number(a.eur_live) || 0, schaduw = Number(a.eur_schaduw) || 0, totaal = Math.abs(live) + Math.abs(schaduw);
      const bx = (l, w, kl) => "<div class='bx'><div class='l'>" + esc(l) + "</div><div class='w'" + (kl ? " style='color:" + kl + "'" : "") + ">" + w + "</div></div>";
      const totalen = "<div class='tot'><div class='k'>" + esc(t("Totalen") + " · " + scope + (sinds ? " · " + t("geteld sinds") + " " + sinds.toLocaleDateString(loc) : "")) + "</div><div class='bxs'>" +
        bx(t("Opgeleverd"), eurK(tot)) + bx(t("Gemiddeld per dag"), eurK(inScope.length ? tot / inScope.length : 0)) +
        bx(t("Beste dag"), beste.d ? eurK(beste.v) + "<div class='vt'>" + esc((DG[beste.d.getDay()] || "") + " " + beste.d.getDate() + " " + MN[beste.d.getMonth()]) + "</div>" : "–") +
        bx(t("Live (echt gestuurd)"), eurK(live)) + ((this._hass.states["switch.batterijplan_live"] || {}).state === "on" ? "" : bx(t("Schaduw (zou opleveren)"), eurK(schaduw), "var(--secondary-text-color)")) +  // schaduw alleen tonen als Live uit staat
        
        bx(t("Dit contractjaar"), pk.state && !["unknown", "unavailable"].includes(pk.state) ? eurK(Number(pk.state) || 0) + (pk.attributes && pk.attributes.periode_start ? "<div class='vt'>" + esc(t("sinds") + " " + pk.attributes.periode_start) + "</div>" : "") : "–") + "</div>" +
        ((this._hass.states["switch.batterijplan_live"] || {}).state === "on" ? "" : "<div class='lb'><i style='width:" + (totaal ? Math.abs(live) / totaal * 100 : 0) + "%;background:#66bb6a'></i><i style='flex:1;background:#94a3b8'></i></div>") +
        "<div class='vt'>" + esc(((this._hass.states["switch.batterijplan_live"] || {}).state === "on" ? "" : t("Balk: groen = live, grijs = schaduw (totaal sinds de start).") + " ") + t("Kwartieren ontladen / vastgehouden / teruggeleverd:") + " " + (a.kwartieren_ontladen || 0) + " / " + (a.kwartieren_vastgehouden || 0) + " / " + (a.kwartieren_teruggeleverd || 0)) + "</div></div>";
      const voet = "<div class='vt' style='margin-top:8px'>" + esc(t("▲ meer opgeleverd dan de periode ervoor · ▼ minder · = ongeveer gelijk. Balk: opbrengst vergeleken met de beste getoonde periode.")) + "</div>";
      const exp = "<div class='exp'><button data-csv='1'>" + esc(t("Exporteren naar spreadsheet (CSV)")) + "</button><span class='vt' data-csvmsg='1'>" + esc(this._csvMsg || t("Eén regel per dag, sinds de start. Wordt gedownload naar dit apparaat.")) + "</span></div>";
      this._body.innerHTML = css + kop + totalen + raster + voet + exp;
      this._wireP();
    }
    _wireP() {
      this._body.querySelectorAll("[data-per]").forEach((b) => b.addEventListener("click", () => { this._P = b.dataset.per; try { localStorage.setItem("batterijplan-opbrengst-periode", this._P); } catch (e) {} this._teken(); }));
      const c = this._body.querySelector("[data-csv]");
      if (c) c.addEventListener("click", () => {
        const sep = LANG === "en" ? "," : ";", dec = (v) => (LANG === "en" ? v.toFixed(4) : v.toFixed(4).replace(".", ",")), p = (n) => String(n).padStart(2, "0");
        const rijen = (this._dagen || []).slice().sort((x, y) => x.d - y.d).map((x) => x.d.getFullYear() + "-" + p(x.d.getMonth() + 1) + "-" + p(x.d.getDate()) + sep + dec(x.v));
        const tekst = "\ufeff" + [t("datum") + sep + t("opgeleverd (EUR)")].concat(rijen).join("\r\n");
        const url = URL.createObjectURL(new Blob([tekst], { type: "text/csv;charset=utf-8" })), el = document.createElement("a"); el.href = url; el.download = "batterijplan-opbrengst-per-dag.csv"; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
        this._csvMsg = "✓ " + t("Gedownload:") + " batterijplan-opbrengst-per-dag.csv (" + rijen.length + " " + t("dagen") + ")"; this._teken();
      });
    }
    _renderOud() {
      if (!this._hass) return;
      this._shell();
      zetTaal(this._hass, this._config);
      const m = this._hass.states[(this._hass.states["sensor.batterijplan_meerwaarde_2"] ? "sensor.batterijplan_meerwaarde_2" : "sensor.batterijplan_meerwaarde")] || { state: 0, attributes: {} }, a = m.attributes || {};
      const eur = (v) => { const g = geld(v); return "<span style='color:" + g.kleur + "'>" + g.txt + "</span>"; };
      this._chips.style.display = "none";
      this._setUitleg("<p><b>" + t("Wat telt hier?") + "</b> " + t("Elk kwartier schat Batterijplan het verschil tussen HBC alleen en HBC met Batterijplan, inclusief btw.") + " " +
        t("Bij vasthouden telt de lading mee tegen de gemiddelde prijs van de dure kwartieren waar het plan haar later voor inzet.") + " " +
        t("Bij terugleveren telt wat je ontvangt, minus wat het kost om die lading later weer goedkoop in te kopen.") + "</p>" +
        "<p><b>" + t("Schaduw") + "</b> = " + t("wat het had opgeleverd terwijl Live uit stond (niet echt verdiend).") + " <b>" + t("Live") + "</b> = " + t("wat het opleverde terwijl Batterijplan echt stuurde.") + "</p>" +
        "<p>" + t("Het blijft een schatting; je energierekening is het echte bewijs. Staat HBC niet op Dynamic, dan telt er niets bij.") + "</p>");
      const rij = (l, w, vet) => "<tr><td style='padding:6px 12px 6px 0;border-top:1px solid var(--divider-color)'>" + l + "</td><td style='padding:6px 0;border-top:1px solid var(--divider-color);text-align:right;white-space:nowrap'>" + (vet ? "<b>" + w + "</b>" : w) + "</td></tr>";
      this._body.innerHTML = "<table style='width:100%;margin-top:4px'>" +
        rij(t("Totaal sinds") + " " + esc(a.sinds || t("start")), eur(m.state), true) +
        rij(t("waarvan schaduw (zou opleveren)"), eur(a.eur_schaduw)) +
        rij(t("waarvan live (echt gestuurd)"), eur(a.eur_live)) +
        rij(t("Kwartieren ontladen / vastgehouden / teruggeleverd"), (a.kwartieren_ontladen || 0) + " / " + (a.kwartieren_vastgehouden || 0) + " / " + (a.kwartieren_teruggeleverd || 0)) +
        rij(t("Dit contractjaar"), eur((this._hass.states[(this._hass.states["sensor.batterijplan_meerwaarde_periode_2"] ? "sensor.batterijplan_meerwaarde_periode_2" : "sensor.batterijplan_meerwaarde_periode")] || {}).state)) + "</table>";
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Buttons: a row of buttons that each open a window with ordinary HA cards inside, plus the Live switch. Keeps the start page compact.
  //   knoppen: [{ naam, melding: instellingen|sensoren, breed (px, optional), kaarten: [card config, ...] }]
  class BpKnoppen extends HTMLElement {
    setConfig(c) { this._config = Object.assign({ live: "switch.batterijplan_live", knoppen: [] }, c || {}); this._open = null; this._teken(); }
    set hass(h) {
      this._hass = h; zetTaal(h, this._config);
      (this._kaarten || []).forEach((k) => { k.hass = h; });
      const S = h.states, ids = [this._config.live, "number.batterijplan_capaciteit",
        "text.batterijplan_sensor_net", "text.batterijplan_sensor_zon", "text.batterijplan_sensor_batterij", "text.batterijplan_sensor_ev"];
      const sen = this._sensoren(), ha = (S["sensor.batterijplan_advies_hbc"] || {}).attributes || {}, key = ids.concat(sen).map((id) => (S[id] || {}).state).join("|") + LANG + [ha.cheapest_verschil, ha.expensive_verschil, ha.solar_verschil].join("");
      if (key !== this._key) { this._key = key; this._teken(); }
    }
    getCardSize() { return 1; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }
    _sensoren() {
      const S = (this._hass || {}).states || {};
      return ["net", "zon", "batterij", "ev"].map((k) => String((S["text.batterijplan_sensor_" + k] || {}).state || "").trim()).filter((v) => v && v !== "unknown");
    }
    _melding(m) {
      const S = this._hass.states;
      const leeg = (k) => { const v = String((S["text.batterijplan_sensor_" + k] || {}).state || "").trim(); return !v || v === "unknown"; };
      if (m === "instellingen") return !(Number((S["number.batterijplan_capaciteit"] || {}).state) > 1.05);
      if (m === "advies") { const a = (S["sensor.batterijplan_advies_hbc"] || {}).attributes || {}; adviesGem(this._hass, () => { this._key = null; this._teken(); }); return !!(a.cheapest_verschil || a.expensive_verschil || zonAdvies(S).verschil); }
      if (m === "sensoren") return ["net", "zon", "batterij"].some(leeg) ||
        this._sensoren().some((id) => { const st = (S[id] || {}).state; return st == null || st === "unavailable" || st === "unknown"; });
      return false;
    }
    _teken() {
      if (!this._hass || !this._config) return;
      zetTaal(this._hass, this._config);
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      const c = this._config, S = this._hass.states, live = (S[c.live] || {}).state === "on";
      if (!this._card) {
        this.shadowRoot.innerHTML = "<style>:host{display:block}" +
          ".rij{display:flex;align-items:center;gap:12px;padding:10px 14px;flex-wrap:wrap}.streep{width:1px;align-self:stretch;background:var(--divider-color)}.pillen{flex:1;display:flex;flex-wrap:wrap;gap:6px}" +
          ".pil{position:relative;font-size:13px;padding:3px 13px;border:1px solid var(--divider-color);border-radius:14px;color:var(--secondary-text-color);cursor:pointer;user-select:none}" +
          ".pil:hover,.pil.aan{color:var(--primary-text-color);border-color:var(--secondary-text-color);background:rgba(138,180,248,0.08)}" +
          ".pil .stip{position:absolute;top:-3px;right:-3px;width:9px;height:9px;border-radius:50%;background:#ff9800;border:2px solid var(--card-background-color)}" +
          ".live{display:flex;align-items:center;gap:10px;font:inherit;font-size:13px;color:var(--primary-text-color);cursor:pointer;padding:4px 14px 4px 5px;border-radius:999px;border:1px solid var(--divider-color);background:var(--secondary-background-color,#262932);transition:background .2s}.live.aan{background:rgba(102,187,106,0.15);border-color:#66bb6a}.live.aan .s{color:#66bb6a}.live .s{font-size:11px;color:var(--secondary-text-color)}.sw{width:42px;height:24px;border-radius:999px;background:rgba(0,0,0,.25);border:1px solid var(--divider-color);position:relative;flex:none}.sw::after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--secondary-text-color);transition:left .2s}.live.aan .sw::after{left:20px;background:#66bb6a}" +
          ".scherm{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}" +
          ".paneel{position:relative;width:100%;max-width:640px;max-height:88vh;overflow:auto;border-radius:14px;background:var(--primary-background-color);box-shadow:0 8px 30px rgba(0,0,0,.5);padding:8px;display:flex;flex-direction:column;gap:8px}" +
          ".balk{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between}.sluit{cursor:pointer;font-size:13px;color:var(--primary-color);padding:3px 12px;border:1px solid var(--divider-color);border-radius:14px;background:var(--card-background-color);user-select:none}.kruis{cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--secondary-text-color);background:var(--card-background-color);border:1px solid var(--divider-color);user-select:none}.kruis:hover{color:var(--primary-text-color)}" +
          "</style><ha-card><div class='rij'><button class='live' role='switch'><span class='sw'></span><span class='tx'></span></button><span class='streep'></span><div class='pillen'></div></div></ha-card><div class='laag'></div>";
        this._card = this.shadowRoot.querySelector("ha-card");
        this._pillen = this.shadowRoot.querySelector(".pillen");
        this._laag = this.shadowRoot.querySelector(".laag");
        this._sw = this.shadowRoot.querySelector(".live");
        this._liveTxt = this.shadowRoot.querySelector(".live .tx");
        this._sw.addEventListener("click", () => this._hass.callService("switch", this._sw.classList.contains("aan") ? "turn_off" : "turn_on", { entity_id: this._config.live }));
        this._pillen.addEventListener("click", (e) => { const p = e.target.closest(".pil"); if (p) this._openen(Number(p.dataset.i)); });
        this._esc = (e) => { if (e.key === "Escape" && this._open != null) this._openen(null); };
      }
      const pilHtml = (c.knoppen || []).map((k, i) => "<span class='pil" + (this._open === i ? " aan" : "") + "' data-i='" + i + "'>" + esc(t(k.naam || "")) +
        (k.melding && this._melding(k.melding) ? "<span class='stip' title='" + esc(t("Hier is iets te doen")) + "'></span>" : "") + "</span>").join("");
      // only rebuild the pills when they really change, so a click is never lost halfway
      if (pilHtml !== this._pilHtml) { this._pilHtml = pilHtml; this._pillen.innerHTML = pilHtml; }
      this._sw.setAttribute("aria-checked", String(live));
      this._liveTxt.innerHTML = "<b>" + t("Live") + "</b> <span class='s'>" + esc(live ? t("stuurt HBC") : t("schaduw")) + "</span>";
      this.shadowRoot.querySelector(".live").classList.toggle("aan", live);
      this.shadowRoot.querySelector(".live").title = t("Uit = schaduw: het plan rekent alleen mee. Aan = Batterijplan stuurt HBC bij.");
    }
    async _openen(i) {
      zetTaal(this._hass, this._config);
      this._open = (i == null || this._open === i) ? null : i;
      this._laag.innerHTML = ""; this._kaarten = [];
      document.removeEventListener("keydown", this._esc);
      this._key = null; this._teken();
      if (this._open == null) return;
      const k = this._config.knoppen[this._open];
      const scherm = document.createElement("div"); scherm.className = "scherm";
      const paneel = document.createElement("div"); paneel.className = "paneel";
      // option breed (px) per button: a wider window, for example for the report with four buttons side by side
      if (Number(k.breed) > 0) paneel.style.maxWidth = Number(k.breed) + "px";
      const balk = document.createElement("div"); balk.className = "balk";
      const sluit = document.createElement("span"); sluit.className = "sluit"; sluit.textContent = "‹ " + t("Terug"); sluit.title = t("Terug");
      const kruis = document.createElement("span"); kruis.className = "kruis"; kruis.textContent = "✕"; kruis.title = t("Sluiten");
      balk.appendChild(sluit); balk.appendChild(kruis); paneel.appendChild(balk); scherm.appendChild(paneel); this._laag.appendChild(scherm);
      scherm.addEventListener("click", (e) => { if (e.target === scherm || e.target === sluit || e.target === kruis) this._openen(null); });
      document.addEventListener("keydown", this._esc);
      const helpers = await window.loadCardHelpers();
      // wacht tot de kaarten in het venster bestaan (anders soms "Configuratiefout" vlak na laden)
      await Promise.all((k.kaarten || []).map((c) => String(c.type || "").startsWith("custom:") ? Promise.race([customElements.whenDefined(c.type.slice(7)), new Promise((r) => setTimeout(r, 8000))]) : null));
      if (this._open == null || this._laag.firstChild !== scherm) return;
      (k.kaarten || []).forEach((cfg) => {
        const el = helpers.createCardElement(this._config.taal ? Object.assign({ taal: this._config.taal }, cfg) : cfg); el.hass = this._hass;
        paneel.appendChild(el); this._kaarten.push(el);
      });
    }
    disconnectedCallback() { document.removeEventListener("keydown", this._esc); }
  }

  // ---------- custom:batterijplan-velden — own input fields in the house style (copy of the HESC v4 fields, own element name) ----------
  // Rows: entity (number = slider or - value + pill, select = chips, switch = toggle, text = edit on the line, date) and "section".
  // Optional "tabs: [{naam, rows}]" for setting levels; "info" on the card or on a row opens a "Hoe lees je dit?" window.
  const VCSS =
    ":host{display:block;--line:var(--divider-color,#30333c);--muted:var(--secondary-text-color,#9aa0aa);--card2:var(--secondary-background-color,#262932)}" +
    "ha-card{padding:16px 18px 8px;container-type:inline-size}" +
    ".title{font-size:20px;font-weight:700;color:var(--primary-text-color);display:flex;align-items:center;gap:8px;margin-bottom:6px}.title ha-icon{--mdc-icon-size:24px}" +
    ".i{--mdc-icon-size:20px;color:#8ab4f8;cursor:pointer}.title .i{margin-left:auto}" +
    ".tabs{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;background:var(--card2);border-radius:12px;padding:4px;gap:4px;margin:6px 0 4px}" +
    ".tab{font:inherit;font-size:14px;border:0;border-radius:9px;background:none;color:var(--muted);padding:8px 6px;cursor:pointer}" +
    ".tab.on{background:var(--primary-color);color:var(--text-primary-color,#fff);font-weight:600}" +
    ".tabsub{font-size:12px;color:var(--muted);margin:2px 2px 0}" +
    ".f{display:grid;grid-template-columns:minmax(110px,1fr) minmax(0,auto);gap:6px 16px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}" +
    ".rows>.f:first-child,.sec+.f{border-top:0}" +
    ".sec{font-size:15px;font-weight:500;margin:14px 0 2px;padding-top:12px;border-top:2px solid var(--line)}.rows>.sec:first-child{border-top:0;margin-top:4px;padding-top:0}" +
    ".nm{font-size:14px;line-height:1.3;display:flex;align-items:flex-start;gap:6px}.nm small{display:block;color:var(--muted);font-size:12px}.nm .i{--mdc-icon-size:17px;flex:none;margin-top:1px}" +
    ".f.wide{grid-template-columns:minmax(0,1fr)}.f.na{opacity:.45}" +
    ".stp{display:inline-flex;align-items:center;border:1.5px solid var(--line);border-radius:999px;background:var(--card2);height:36px;justify-self:end}" +
    ".stp button{width:36px;height:36px;border:0;background:none;color:var(--primary-text-color);font-size:19px;cursor:pointer;border-radius:50%}" +
    ".stp button:hover{background:color-mix(in srgb,var(--c) 25%,transparent)}" +
    ".stp b{min-width:64px;text-align:center;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;cursor:text}" +
    ".stp input{width:96px;font:inherit;font-size:15px;font-weight:600;text-align:center;border:0;background:none;color:var(--primary-text-color);outline:none}" +
    ".sl{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}" +
    ".sl output{font-size:15px;font-weight:600;min-width:74px;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".sl input{-webkit-appearance:none;appearance:none;width:100%;height:10px;border-radius:999px;margin:0;cursor:pointer;background:linear-gradient(90deg,var(--c) 0 var(--v),var(--card2) var(--v) 100%);border:1px solid var(--line)}" +
    ".sl input::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--c);box-shadow:0 1px 4px rgba(0,0,0,.4)}" +
    ".sl input::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--c)}" +
    ".tg{width:48px;height:28px;border-radius:999px;border:0;background:var(--card2);box-shadow:inset 0 0 0 1.5px var(--line);position:relative;cursor:pointer;justify-self:end}" +
    ".tg::after{content:'';position:absolute;top:4px;left:4px;width:20px;height:20px;border-radius:50%;background:var(--muted);transition:left .15s,background .15s}" +
    ".tg.on{background:var(--c);box-shadow:none}.tg.on::after{left:24px;background:#fff}" +
    ".chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}" +
    ".chip{font:inherit;font-size:13px;border-radius:999px;border:1.5px solid var(--line);background:none;color:var(--primary-text-color);padding:6px 12px;cursor:pointer}" +
    ".chip.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 25%,transparent);font-weight:600}" +
    ".knoppen{display:flex;gap:8px;flex-wrap:wrap}" +
    ".btn{font:inherit;font-size:13px;border-radius:999px;border:1.5px solid var(--primary-color);background:none;color:var(--primary-text-color);padding:7px 16px;cursor:pointer}" +
    ".btn:hover{background:color-mix(in srgb,var(--primary-color) 22%,transparent)}.btn.zeker{border-color:#ff9800;background:rgba(255,152,0,.18)}" +
    ".val{font-size:14px;font-weight:600;text-align:right;min-width:0;overflow-wrap:anywhere}.val small{display:block;color:var(--muted);font-weight:400;font-size:12px}" +
    ".bk{font-size:12px;color:var(--muted);padding:2px 0 10px}" +
    ".txt{font:inherit;font-size:14px;font-weight:600;border-radius:10px;border:1.5px solid var(--line);background:var(--card2);color:var(--primary-text-color);padding:7px 12px;cursor:pointer;text-align:left;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".txt.empty{color:var(--muted);font-weight:400;font-style:italic}" +
    ".ed{display:flex;gap:8px;align-items:center}" +
    ".ed input{font:inherit;font-size:14px;flex:1;min-width:0;border-radius:10px;border:1.5px solid var(--c);background:var(--card2);color:var(--primary-text-color);padding:7px 12px;outline:none}" +
    ".date{font:inherit;font-size:14px;font-weight:600;border-radius:10px;border:1.5px solid var(--line);background:var(--card2);color:var(--primary-text-color);padding:6px 10px;color-scheme:dark;justify-self:end}" +
    ".f.wide .txt,.f.wide .ed{width:100%}" +
    ".kies{display:grid;gap:4px;margin-top:8px;max-height:260px;overflow:auto}.kies .hulp{font-size:12px;color:var(--muted);margin:2px 2px 4px}" +
    ".opt{font:inherit;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 12px;align-items:center;border:1.5px solid var(--line);border-radius:10px;background:none;color:var(--primary-text-color);padding:7px 12px;cursor:pointer}" +
    ".opt:hover{border-color:var(--c);background:color-mix(in srgb,var(--c) 15%,transparent)}.opt.top{border-color:color-mix(in srgb,var(--c) 60%,var(--line))}.opt b{font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".opt small{grid-column:1;color:var(--muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.opt span{grid-row:1/3;grid-column:2;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}" +
    "@container (max-width:460px){.f.tx{grid-template-columns:minmax(0,1fr)}}" +
    ".ui-scherm{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}" +
    ".ui-paneel{width:100%;max-width:560px;max-height:85vh;overflow:auto;border-radius:12px;background:var(--card-background-color);border:1px solid var(--divider-color);box-shadow:0 8px 30px rgba(0,0,0,.5);padding:14px 16px;font-size:13px;line-height:1.55;color:var(--primary-text-color)}" +
    ".ui-kop{display:flex;align-items:center;gap:10px;margin-bottom:10px}.ui-kop b{font-size:15px}.terug{cursor:pointer;color:var(--primary-color);font-size:13px;padding:2px 10px;border:1px solid var(--divider-color);border-radius:14px;user-select:none}" +
    ".ui-paneel p{margin:0 0 8px}.ui-paneel p:last-child,.ui-paneel ul:last-child{margin-bottom:0}.ui-paneel ul{margin:0 0 8px;padding-left:18px}" +
  ".btn.danger{border-color:#ef5350}.btn.danger:hover{background:color-mix(in srgb,#ef5350 18%,transparent)}.btn.dim{opacity:.45}.btn[disabled]{cursor:default}" +
  ".ask{border:1.5px solid #ef5350;border-radius:12px;background:color-mix(in srgb,#ef5350 14%,transparent);padding:14px 16px;margin:4px 0 10px;display:grid;gap:10px;font-size:14px;line-height:1.45}" +
  ".ask.neutraal{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 12%,transparent)}.ask p{margin:0}.ask .f{border-top:0;padding:0}.ask .okline{color:#66bb6a}" +
  ".askbtns{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}.btn.yes{background:#ef5350;border-color:#ef5350;color:#fff;font-weight:600}.btn.yes[disabled]{opacity:.45}" +
  ".btn.ok{background:var(--primary-color);color:var(--text-primary-color,#fff);font-weight:600}.tg.rood.on{background:#ef5350}";
  // info text: blank line = new paragraph, "- " lines = list, **bold**
  const infoHtml = (text) => String(t(text)).split(/\n\s*\n/).map((blk) => {
    const e = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"), lines = blk.split("\n");
    return lines.every((l) => l.startsWith("- ")) ? "<ul>" + lines.map((l) => "<li>" + e(l.slice(2)) + "</li>").join("") + "</ul>" : "<p>" + e(blk) + "</p>";
  }).join("");

  // ---------- report: built in the browser from what Home Assistant already shows ----------
  // Nothing is stored on the server; only a logged-in user can build it.
  const RAPPORT_HBC = ["input_select.house_battery_strategy", "input_select.house_battery_strategy_dynamic_cheapest", "input_select.house_battery_strategy_dynamic_default",
    "input_select.house_battery_strategy_dynamic_expensive", "input_number.house_battery_strategy_dynamic_threshold_delta", "input_number.house_battery_solar_reserved_for_house",
    "input_number.house_battery_count", IDS.marks];
  const ZON_TIP = "Zonvoorspelling niet gevonden. Vul de velden 'Zonvoorspelling vandaag' en 'Zonvoorspelling morgen' in bij Instellingen.";
  const EIGEN_INST = /^(number|select|switch|text|date)\./;
  // plan points: [t, price_ct, kind, action_hbc, charge_hbc, action_plan, charge_plan, solar_kw, solar_kw_cautious]
  const planPunten = (pa) => { const v = arr(pa.punten); return Array.isArray(v) ? v : []; };
  const telActies = (pts, i) => { const tel = {}; pts.forEach((x) => { tel[x[i]] = (tel[x[i]] || 0) + 1; }); return tel; };
  async function bpRapport(hass, cfg) {
    zetTaal(hass, cfg);
    const S = hass.states, nu = new Date(), r = [], pa = (S[IDS.plan] || {}).attributes || {}, pts = planPunten(pa);
    const kort = (v) => Array.isArray(v) ? (v.length ? v.length + " × " + JSON.stringify(v.slice(0, 4)).slice(0, 140) + (v.length > 4 ? " …" : "") : "[]") :
      (v && typeof v === "object") ? JSON.stringify(v).slice(0, 200) : String(v);
    const regel = (id) => { const x = S[id]; if (!x) return "- " + id + ": **" + t("niet gevonden") + "**"; const u = x.attributes.unit_of_measurement; return "- " + id + ": " + x.state + (u ? " " + u : "") + " _(" + t("sinds") + " " + new Date(x.last_changed).toLocaleString(LOC[LANG] || "nl-NL") + ")_"; };
    const attrs = (id, max) => { const a = (S[id] || {}).attributes || {}; return Object.keys(a).filter((k) => !["friendly_name", "icon", "unit_of_measurement", "device_class", "state_class"].includes(k)).sort().slice(0, max || 80).map((k) => "  - " + k + ": " + kort(a[k])); };
    const eigen = Object.keys(S).filter((k) => k.includes("batterijplan")).sort();
    r.push("# Batterijplan report", "", "_" + t("Gemaakt op") + " " + nu.toLocaleString(LOC[LANG] || "nl-NL") + " · " + t("Er staan geen namen of adressen in. Lees het na voordat je het deelt.") + "_", "");
    r.push("## Versions", "- Batterijplan: " + (pa.versie || "?"), "- Home Assistant: " + ((hass.config && hass.config.version) || "?"),
      "- " + t("Taal") + ": " + LANG + " · " + t("tijdzone") + ": " + ((hass.config && hass.config.time_zone) || "?"), "");
    r.push("## Status", regel("switch.batterijplan_live"), regel(IDS.plan), regel("sensor.batterijplan_voorspelling"), regel("sensor.batterijplan_meerwaarde"), regel("sensor.batterijplan_meerwaarde_periode"));
    REGELS.forEach((x) => r.push(regel("switch.batterijplan_regel_" + x[0])));
    r.push("- " + t("Komend kwartier") + ": " + t(ACT_NAAM[pa.actie] || "—") + " (HBC: " + t(ACT_NAAM[pa.hbc_actie] || "—") + ")", "");
    r.push("## " + t("Instellingen") + " (Batterijplan)"); eigen.filter((k) => EIGEN_INST.test(k)).forEach((k) => r.push(regel(k))); r.push("");
    r.push("## HBC"); RAPPORT_HBC.forEach((k) => r.push(regel(k)));
    const zon = zonIds(S); [["vandaag", zon.vandaag], ["morgen", zon.morgen]].forEach((z) => r.push(z[1] ? regel(z[1]) : "- " + t("zonvoorspelling " + z[0]) + ": **" + t("niet gevonden") + "** — " + t(ZON_TIP)));
    const mk = (S[IDS.marks] || {}).attributes || {}, marks = Array.isArray(mk.marks) ? mk.marks : [];
    if (marks.length) { const ms = (v) => (typeof v === "number" ? v : Date.parse(v)); const st = marks.map((m) => ms(m.start)).filter(Number.isFinite).sort((a, b) => a - b);
      r.push("- " + t("prijzen") + ": " + marks.length + " · datapoints_per_hour " + (mk.datapoints_per_hour || "?") + " · " + new Date(st[0]).toLocaleString(LOC[LANG] || "nl-NL") + " → " + new Date(st[st.length - 1]).toLocaleString(LOC[LANG] || "nl-NL") +
        " · low " + marks.filter((m) => m.mark === "low").length + " · high " + marks.filter((m) => m.mark === "high").length); }
    r.push("");
    r.push("## " + t("Plan") + " (sensor.batterijplan)"); attrs(IDS.plan, 120).forEach((x) => r.push(x)); r.push("");
    if (pts.length) {
      const fmt = (tel) => Object.keys(tel).sort().map((k) => k + ": " + tel[k]).join(", ");
      r.push("### " + t("Acties in het plan"), "- Batterijplan: " + fmt(telActies(pts, 5)), "- HBC: " + fmt(telActies(pts, 3)), "");
    }
    ["sensor.batterijplan_verbruiksprofiel", "sensor.batterijplan_meerwaarde", "sensor.batterijplan_meerwaarde_periode"].forEach((id) => { r.push("### " + id); r.push(regel(id)); attrs(id, 40).forEach((x) => r.push(x)); r.push(""); });
    r.push("## " + t("Overige sensoren")); eigen.filter((k) => /^(sensor|binary_sensor)\./.test(k) && !["sensor.batterijplan", "sensor.batterijplan_verbruiksprofiel", "sensor.batterijplan_meerwaarde", "sensor.batterijplan_meerwaarde_periode"].includes(k)).forEach((k) => r.push(regel(k))); r.push("");
    const mist = eigen.length ? [] : ["sensor.batterijplan"]; RAPPORT_HBC.concat([zon.vandaag, zon.morgen].filter(Boolean)).forEach((k) => { if (!S[k]) mist.push(k); });
    if (!zon.vandaag || !zon.morgen) mist.push(t(ZON_TIP));
    r.push("## " + t("Ontbreekt"), mist.length ? mist.map((k) => "- " + k).join("\n") : "- " + t("niets"), "");
    return r.join("\n");
  }

  // ---------- report as its own page in the house style ----------
  const RAPPORT_CSS = ':root{--bg:#f6f7f9;--card:#fff;--tx:#1d2330;--mut:#667085;--ln:#e3e6ea;--ac:#1f7ae0;--ok:#2e9e5b;--wr:#d9822b;--bad:#d64545}' +
    '*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    '.wrap{max-width:1100px;margin:0 auto;padding:16px}h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:24px 0 8px}' +
    '.sub{color:var(--mut);font-size:13px}.box{background:var(--card);border:1px solid var(--ln);border-radius:12px;padding:14px;margin-top:10px;overflow-x:auto}' +
    '.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:12px}.kpi{background:var(--card);border:1px solid var(--ln);border-radius:12px;padding:12px}' +
    '.kl{font-size:11px;letter-spacing:.6px;color:var(--mut);text-transform:uppercase}.kb{font-size:22px;font-weight:650;margin-top:2px}.ks{font-size:12px;color:var(--mut)}' +
    'table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;color:var(--mut);font-weight:600;padding:6px 8px;border-bottom:1px solid var(--ln);white-space:nowrap}td{padding:6px 8px;border-bottom:1px solid var(--ln);vertical-align:top;overflow-wrap:anywhere}' +
    '.mut{color:var(--mut)}.ok{color:var(--ok)}.or{color:var(--wr)}.warn{color:var(--bad);font-weight:600}code{font-size:12px}' +
    '.bar{display:flex;align-items:center;gap:8px;margin:4px 0}.bl{width:170px;text-align:right;color:var(--mut);font-size:12px}.bt{flex:1;height:12px;background:var(--ln);border-radius:4px;overflow:hidden}.bf{display:block;height:12px;background:var(--ac)}.bv{width:34px;font-size:12px}' +
    ':root{color-scheme:dark;--bg:#0a121a;--card:#15222e;--tx:#f2f5f8;--mut:#93a3af;--ln:#2a3a48;--ac:#18b9df;--ok:#54d36b;--wr:#f3c44f;--bad:#ef5350}' +
    'body{background:radial-gradient(circle at 50% 0,#13212f,#0a121a 60%) fixed;color:var(--tx)}.wrap{max-width:1220px;padding:28px}' +
    '.top{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.top .nm{display:flex;gap:14px;align-items:center}.top img{height:56px;border-radius:12px}.top h1{margin:0;font-size:27px}.meta{color:var(--mut);margin-top:4px}' +
    '.dl{border:0;border-radius:10px;background:var(--ac);color:#fff;font-weight:800;padding:12px 17px;cursor:pointer;font-size:14px}' +
    'nav{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 26px}nav a{color:var(--tx);text-decoration:none;background:#152633;border:1px solid var(--ln);border-radius:999px;padding:7px 12px}nav a:hover{border-color:var(--ac)}' +
    'section{margin:0 0 26px;scroll-margin-top:12px}h2{font-size:17px;margin:0 0 10px}' +
    '.box,.kpi,.panel{background:linear-gradient(180deg,#172836,#111e29);border:1px solid var(--ln);border-radius:12px}' +
    '.panel{overflow:hidden}.kvr{display:flex;justify-content:space-between;gap:16px;padding:12px 16px;border-top:1px solid var(--ln)}.kvr:first-child{border-top:0}.kvr span{color:var(--mut)}.kvr b{text-align:right;overflow-wrap:anywhere}' +
    '.lead{font-size:14px;line-height:1.6}.lead p{margin:0 0 6px}' +
    'details.compact{background:linear-gradient(180deg,#172836,#111e29);border:1px solid var(--ln);border-radius:12px;padding:0;margin-top:10px}details.compact>summary{cursor:pointer;padding:12px 16px;font-weight:700;list-style:none}details.compact>summary::before{content:"\\25B8  ";color:var(--ac)}details.compact[open]>summary::before{content:"\\25BE  "}details.compact>.box{border:0;border-top:1px solid var(--ln);border-radius:0;margin:0;background:none}' +
    '#instellingen td:first-child,#hbc td:first-child{color:var(--mut)}#instellingen td:nth-child(2),#hbc td:nth-child(2){font-weight:700}' +
    '@media (max-width:640px){.wrap{padding:16px}.top{flex-direction:column}.bl{width:110px}}';
  function bpToon(w, html) { if (!w) return false; try { w.document.open(); w.document.write(html); w.document.close(); return true; } catch (e) { return false; } }
  async function bpRapportHtml(hass, cfg) {
    zetTaal(hass, cfg);
    const S = hass.states, pa = (S[IDS.plan] || {}).attributes || {}, loc = LOC[LANG] || "nl-NL", nu = new Date(), pts = planPunten(pa);
    const st = (id) => (S[id] ? S[id].state : null), at = (id) => ((S[id] || {}).attributes || {});
    const naam = (id) => esc(at(id).friendly_name || id);
    const val = (id) => { const x = S[id]; if (!x) return "<span class='warn'>" + esc(t("niet gevonden")) + "</span>"; const u = x.attributes.unit_of_measurement; return esc(x.state + (u ? " " + u : "")); };
    const tijd = (v) => (v ? new Date(v).toLocaleString(loc) : "–");
    const kaart = (l, b, sub, cls) => "<div class='kpi'><div class='kl'>" + esc(l) + "</div><div class='kb " + (cls || "") + "'>" + b + "</div><div class='ks'>" + (sub || "") + "</div></div>";
    const kv = (rijen) => "<div class='panel'>" + rijen.map((p) => "<div class='kvr'><span>" + esc(p[0]) + "</span><b>" + p[1] + "</b></div>").join("") + "</div>";
    const kort = (v) => Array.isArray(v) ? (v.length ? v.length + " × " + esc(JSON.stringify(v.slice(0, 4)).slice(0, 140)) + (v.length > 4 ? " …" : "") : "–") : (v && typeof v === "object") ? esc(JSON.stringify(v).slice(0, 200)) : esc(String(v));
    const geldH = (v) => { const g = geld(v); return "<span style='color:" + g.kleur + "'>" + esc(g.txt) + "</span>"; };
    const tabel = (koppen, rijen, leeg) => "<div class='box'><table><tr>" + koppen.map((k) => "<th>" + esc(k) + "</th>").join("") + "</tr>" + (rijen.length ? rijen.join("") : "<tr><td colspan='" + koppen.length + "' class='mut'>" + esc(leeg || "–") + "</td></tr>") + "</table></div>";
    const eigen = Object.keys(S).filter((k) => k.includes("batterijplan")).sort();
    const live = st("switch.batterijplan_live") === "on", strat = st("input_select.house_battery_strategy"), mw = at("sensor.batterijplan_meerwaarde");
    const zon = zonIds(S), mist = RAPPORT_HBC.concat([zon.vandaag, zon.morgen].filter(Boolean)).filter((k) => !S[k]).concat(S[IDS.plan] ? [] : [IDS.plan]),
      zonMist = !zon.vandaag || !zon.morgen;
    const an = (l) => esc(t(ACT_NAAM[l] || "—"));
    const kwTxt = ACT_NAAM[pa.actie] ? (pa.actie === pa.hbc_actie ? an(pa.actie) + " (" + esc(t("hetzelfde als HBC")) + ")" : esc(t("Plan")) + ": " + an(pa.actie) + " · HBC: " + an(pa.hbc_actie)) : "–";
    const telP = telActies(pts, 5), telH = telActies(pts, 3);
    const ACTK = { L: "#3b82f6", O: "#22c55e", H: "#f59e0b", V: "#ec4899", Z: "#94a3b8" };
    const versie = pa.versie || "?", ha = (hass.config && hass.config.version) || "?";
    const samen = "<div class='box lead'>" +
      "<p>" + (live ? esc(t("Batterijplan staat op Live en stuurt HBC.")) : "<span class='or'>" + esc(t("Batterijplan staat in schaduw: het rekent mee maar stuurt niets.")) + "</span>") + " " +
      (strat === "Dynamic" ? esc(t("HBC staat op Dynamic.")) : "<span class='warn'>" + esc(t("HBC staat niet op Dynamic; Batterijplan wacht.")) + "</span>") + "</p>" +
      "<p>" + esc(t("Komend kwartier:")) + " <b>" + kwTxt + "</b> · " + esc(t("Verbruik leren:")) + " <b>" + esc(st("sensor.batterijplan_voorspelling") || "–") + "</b></p>" +
      "<p>" + esc(t("Opgeleverd sinds")) + " " + esc(mw.sinds || "–") + ": <b>" + geldH(st("sensor.batterijplan_meerwaarde")) + "</b></p>" +
      "<p>" + (mist.length ? "<span class='warn'>" + esc(t("Ontbreekt:")) + " " + mist.map(esc).join(", ") + "</span>" : "<span class='ok'>✓ " + esc(t("Alle sensoren en HBC-instellingen gevonden.")) + "</span>") + (zonMist ? "<br><span class='warn'>" + esc(t(ZON_TIP)) + "</span>" : "") + "</p></div>";
    const status = "<div class='kpis'>" +
      kaart(t("Modus"), live ? "live" : esc(t("schaduw")), live ? esc(t("stuurt HBC")) : "", live ? "ok" : "or") +
      kaart(t("Komend kwartier"), kwTxt, "") +
      kaart(t("In de batterij nu"), esc(nl(Number(Number.isFinite(parseFloat((S["sensor.batterijplan_lading_2"] || S["sensor.batterijplan_lading"] || {}).state)) ? parseFloat((S["sensor.batterijplan_lading_2"] || S["sensor.batterijplan_lading"]).state) : pa.lading), 1)) + " kWh", "") +
      kaart(t("Prijs nu"), val("sensor.batterijplan_prijs"), "") +
      kaart(t("Huisverbruik nu"), val("sensor.batterijplan_huisverbruik"), "") +
      kaart(t("Voorspelling"), esc(st("sensor.batterijplan_voorspelling") || "–"), esc(t("Verbruik leren"))) + "</div>";
    const eindT = pts.length ? new Date((pts[pts.length - 1][0] + 900) * 1000).toLocaleString(loc) : "–";
    const plan = kv([[t("Plan tot"), esc(eindT)], [t("Kosten HBC alleen"), esc("€ " + nl(Number(pa.kosten_hbc), 2))], [t("Kosten met Batterijplan"), esc("€ " + nl(Number(pa.kosten_plan), 2))],
      [t("Verwachte besparing t.o.v. HBC alleen"), geldH(st(IDS.plan))], [t("Modus"), esc(pa.modus || "–")], [t("HBC-strategie"), esc(pa.hbc_strategie || "–")], [t("Kwartieren in het plan"), esc(pts.length)]]
      .concat(REGELS.map((x) => [t("Regel") + ": " + t(x[1]), esc(t(st("switch.batterijplan_regel_" + x[0]) === "off" ? "uit" : "aan"))])));
    const opbr = "<div class='kpis'>" + kaart(t("Totaal"), geldH(st("sensor.batterijplan_meerwaarde")), esc(t("sinds") + " " + (mw.sinds || "–"))) + kaart(t("Live (echt gestuurd)"), geldH(mw.eur_live), "") +
      kaart(t("Schaduw (zou opleveren)"), geldH(mw.eur_schaduw), "") + kaart(t("Dit contractjaar"), geldH(st("sensor.batterijplan_meerwaarde_periode")), esc(at("sensor.batterijplan_meerwaarde_periode").periode_start || "")) +
      kaart(t("Kwartieren ontladen / vastgehouden / teruggeleverd"), esc((mw.kwartieren_ontladen || 0) + " / " + (mw.kwartieren_vastgehouden || 0) + " / " + (mw.kwartieren_teruggeleverd || 0)), "") + "</div>";
    const rij = (id) => "<tr><td>" + naam(id) + "<div class='mut'><code>" + esc(id) + "</code></div></td><td>" + val(id) + "</td><td class='mut'>" + (S[id] ? esc(tijd(S[id].last_changed)) : "–") + "</td></tr>";
    const inst = tabel([t("Instelling"), t("Waarde"), t("Sinds")], eigen.filter((k) => EIGEN_INST.test(k)).map(rij));
    const hbc = tabel([t("Instelling"), t("Waarde"), t("Sinds")], RAPPORT_HBC.map(rij));
    const mxA = Math.max(1, ...Object.values(telP), ...Object.values(telH));
    const balken = (tel) => Object.keys(tel).sort((a, b) => tel[b] - tel[a]).map((k) => "<div class='bar'><span class='bl'>" + an(k) + "</span><span class='bt'><span class='bf' style='width:" + Math.round(tel[k] / mxA * 100) + "%;background:" + (ACTK[k] || "var(--ac)") + "'></span></span><span class='bv'>" + tel[k] + "×</span></div>").join("");
    const dag = pts.length ? "<div class='box'><b>Batterijplan</b>" + balken(telP) + "</div><div class='box'><b>HBC</b>" + balken(telH) + "</div>" : "<div class='box'><span class='mut'>–</span></div>";
    const overig = tabel([t("Overige sensoren"), t("Waarde"), t("Sinds")], eigen.filter((k) => /^(sensor|binary_sensor)\./.test(k)).map(rij));
    const ruw = tabel([t("Alle planwaarden"), t("Waarde")], Object.keys(pa).filter((k) => !["friendly_name", "icon"].includes(k)).sort().map((k) => "<tr><td class='mut'><code>" + esc(k) + "</code></td><td>" + kort(pa[k]) + "</td></tr>"));
    const NAV = [["samenvatting", "Samenvatting"], ["status", "Status"], ["plan", "Plan"], ["opbrengst", "Opbrengst"], ["instellingen", "Instellingen"], ["hbc", "HBC"], ["dag", "Acties in het plan"], ["techniek", "Techniek"]];
    const p2 = (n) => String(n).padStart(2, "0"), bestand = "batterijplan-rapport-" + nu.getFullYear() + p2(nu.getMonth() + 1) + p2(nu.getDate()) + "-" + p2(nu.getHours()) + p2(nu.getMinutes()) + ".html";
    return "<!doctype html><html lang='" + LANG + "'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>" + esc(t("Batterijplan-rapport")) + "</title><style>" + RAPPORT_CSS + "</style></head><body><div class='wrap'>" +
      "<header class='top'><div class='nm'><img src='" + esc(location.origin) + BASE + "logo-neon.png' alt=''><div><h1>" + esc(t("Batterijplan-rapport")) + "</h1><div class='meta'>" + esc(nu.toLocaleString(loc)) + " · Batterijplan " + esc(versie) + " · Home Assistant " + esc(ha) + "</div></div></div>" +
      "<button class='dl' id='download'>" + esc(t("Rapport downloaden")) + "</button></header>" +
      "<nav>" + NAV.map((n) => "<a href='#" + n[0] + "'>" + esc(t(n[1])) + "</a>").join("") + "</nav>" +
      "<section id='samenvatting'><h2>" + esc(t("Samenvatting")) + "</h2>" + samen + "</section>" +
      "<section id='status'><h2>" + esc(t("Status")) + "</h2>" + status + "</section>" +
      "<section id='plan'><h2>" + esc(t("Plan")) + "</h2>" + plan + "</section>" +
      "<section id='opbrengst'><h2>" + esc(t("Opbrengst")) + "</h2>" + opbr + "</section>" +
      "<section id='instellingen'><h2>" + esc(t("Instellingen")) + " (Batterijplan)</h2>" + inst + "</section>" +
      "<section id='hbc'><h2>HBC</h2>" + hbc + "</section>" +
      "<section id='dag'><h2>" + esc(t("Acties in het plan")) + "</h2>" + dag + "</section>" +
      "<section id='techniek'><h2>" + esc(t("Techniek")) + "</h2>" + overig + "<details class='compact'><summary>" + esc(t("Alle planwaarden")) + "</summary>" + ruw + "</details></section>" +
      "<div class='sub' style='margin:20px 0'>" + esc(t("Batterijplan stuurt alleen de drie Dynamic-standen van HBC, en alleen als Live aan staat. Dit rapport is in je browser gemaakt; er is niets op de server bewaard. Er staan geen namen of adressen in. Lees het na voordat je het deelt.")) + "</div></div>" +
      "<script>document.getElementById('download').addEventListener('click',function(){var b=new Blob(['<!doctype html>'+document.documentElement.outerHTML],{type:'text/html;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=" + JSON.stringify(bestand) + ";a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)});<\/script></body></html>";
  }

  // ---------- custom:batterijplan-rapport: the report in its own window behind the Report button ----------
  class BpRapport extends BpBase {
    static getStubConfig() { return { title: "Rapport", icon: "batterijplan:info" }; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }
    _render() {
      if (!this._hass) return;
      this._shell();
      this._chips.style.display = "none";
      this._setUitleg("<p>" + t("Alles wat Batterijplan nu weet en besluit, voor jezelf of als je om hulp vraagt. Er staan geen namen of adressen in. Lees het na voordat je het deelt.") + "</p><p>" +
        t("Het rapport wordt in je browser gemaakt uit wat Home Assistant al laat zien. Er wordt niets op de server bewaard.") + "</p><p>" +
        t("Rapport bekijken opent het volledige rapport in een nieuw tabblad. Kopiëren voor GitHub zet een tekstversie klaar om in een melding te plakken.") + "</p>");
      const S = this._hass.states, pa = (S[IDS.plan] || {}).attributes || {}, live = (S["switch.batterijplan_live"] || {}).state === "on";
      const an = (l) => t(ACT_NAAM[l] || "—"), kw = ACT_NAAM[pa.actie] ? (pa.actie === pa.hbc_actie ? an(pa.actie) : an(pa.actie) + " (HBC: " + an(pa.hbc_actie) + ")") : "–";
      const mw = S["sensor.batterijplan_meerwaarde"] || { state: 0, attributes: {} }, g = geld(mw.state);
      const vak = (l, w, sub, kl) => "<div style='flex:1;min-width:140px;border:1px solid var(--divider-color);border-radius:12px;padding:10px 12px'><div style='font-size:11px;letter-spacing:.6px;text-transform:uppercase;color:var(--secondary-text-color)'>" + esc(l) + "</div>" +
        "<div style='font-size:18px;font-weight:650;margin-top:2px" + (kl ? ";color:" + kl : "") + "'>" + esc(w) + "</div><div style='font-size:12px;color:var(--secondary-text-color)'>" + esc(sub || "") + "</div></div>";
      const kaarten = vak(t("Modus"), live ? "live" : t("schaduw"), live ? t("stuurt HBC") : "", live ? "#66bb6a" : "#ff9800") + vak(t("Komend kwartier"), kw, "") +
        vak(t("Verwachte besparing t.o.v. HBC alleen"), geld((S[IDS.plan] || {}).state).txt, "", geld((S[IDS.plan] || {}).state).kleur) + vak(t("Opgeleverd"), g.txt, t("sinds") + " " + ((mw.attributes || {}).sinds || "–"), g.kleur);
      const k = "font:inherit;font-size:13px;border-radius:999px;border:1.5px solid var(--primary-color);background:none;color:var(--primary-text-color);padding:7px 16px;cursor:pointer";
      if (!this._knoppen) {
        this._body.innerHTML = "<div class='rk' style='display:flex;gap:10px;flex-wrap:wrap;margin:6px 0 12px'></div>" +
          "<div style='display:flex;gap:10px;flex-wrap:wrap;align-items:center'>" +
          "<button data-r='bekijk' style='" + k + ";background:var(--primary-color);color:var(--text-primary-color,#fff);font-weight:600'>" + esc(t("Rapport bekijken")) + "</button>" +
          "<button data-r='download' style='" + k + "'>" + esc(t("Downloaden (.html)")) + "</button>" +
          "<button data-r='kopie' style='" + k + "'>" + esc(t("Kopiëren voor GitHub")) + "</button>" +
          "<button data-r='github' style='" + k + "'>" + esc(t("Melding maken op GitHub")) + "</button></div>" +
          "<div class='rmsg' style='font-size:12px;color:#66bb6a;margin-top:8px;min-height:16px'></div>";
        this._knoppen = true;
        const B = this._body, msg = B.querySelector(".rmsg");
        B.querySelector("[data-r='bekijk']").addEventListener("click", () => { const w = window.open("", "_blank"); if (!w) { msg.textContent = t("Je browser blokkeerde het nieuwe tabblad. Sta pop-ups toe voor Home Assistant."); return; }
          bpToon(w, "<p style='font-family:sans-serif;color:#ccc;background:#0a121a'>" + esc(t("Gegevens ophalen…")) + "</p>"); bpRapportHtml(this._hass, this._config).then((h) => { bpToon(w, h); msg.textContent = "✓ " + t("Het rapport opent in een nieuw tabblad."); }); });
        B.querySelector("[data-r='download']").addEventListener("click", () => bpRapportHtml(this._hass, this._config).then((h) => {
          const d = new Date(), p = (n) => String(n).padStart(2, "0"), naam = "batterijplan-rapport-" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()) + ".html";
          const url = URL.createObjectURL(new Blob([h], { type: "text/html;charset=utf-8" })), a = document.createElement("a"); a.href = url; a.download = naam; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
          msg.textContent = "✓ " + t("Gedownload:") + " " + naam; }));
        const kopieer = async () => { const txt = await bpRapport(this._hass, this._config); try { if (window.isSecureContext && navigator.clipboard) await navigator.clipboard.writeText(txt); else { const ta = document.createElement("textarea"); ta.value = txt; ta.style.cssText = "position:fixed;opacity:0"; this.shadowRoot.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); } msg.textContent = "✓ " + t("Gekopieerd"); return true; } catch (e) { msg.textContent = t("Kopiëren lukte niet. Download het rapport en voeg het bestand toe."); return false; } };
        B.querySelector("[data-r='kopie']").addEventListener("click", kopieer);
        B.querySelector("[data-r='github']").addEventListener("click", async () => { const w = window.open("https://github.com/satscan1/hbc-batterijplan/issues/new?template=bug_report.yml", "_blank", "noopener"); await kopieer(); msg.textContent = "✓ " + t("Gekopieerd. Plak het rapport in de melding."); });
      }
      this._body.querySelector(".rk").innerHTML = kaarten;
    }
  }

  class BpVelden extends HTMLElement {
    setConfig(c) { this._config = Object.assign({}, c || {}); this._tab = 0; this._sig = ""; this._busy = null; this._edit = undefined; if (this._hass) this._render(); }
    set hass(h) {
      this._hass = h; zetTaal(h, this._config);
      const sig = this._rows(true).map((r) => { const s = r.entity && h.states[r.entity]; const x = s && /^[a-z_]+\.[a-z0-9_]+$/.test(s.state) && h.states[s.state];
        return s ? s.state + (x ? x.state : "") : "-"; }).join("|") + LANG;
      if (sig === this._sig || this._busy || this._edit !== undefined) return;
      this._sig = sig; this._render();
    }
    getCardSize() { return 1 + this._rows().length; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }
    _rows(all) {
      const c = this._config || {};
      if (!c.tabs) return c.rows || [];
      return all ? c.tabs.reduce((a, tb) => a.concat(tb.rows || []), []) : ((c.tabs[this._tab] || {}).rows || []);
    }
    _num(v, step) { const d = String(step).includes(".") ? String(step).split(".")[1].length : 0; return nl(Number(v), d); }
    _naam(r, i) { return "<div class='nm'><div>" + esc(r.name || r.entity || "") + (r.hint ? "<small>" + esc(r.hint) + "</small>" : "") + "</div>" +
      (r.info ? "<ha-icon class='i' data-info='" + i + "' icon='mdi:information-outline' title='" + esc(t("Hoe lees je dit?")) + "'></ha-icon>" : "") + "</div>"; }
    _askBox(r) {
      const rood = !!r.danger;
      const bk = r.backup_note ? "<div class='okline'>" + esc(t(r.backup_note)) + "</div>" : r.backup ? (this._bk ? "<div class='okline'>✓ " + esc(t("Back-up gemaakt.")) + "</div>" :
        "<div>" + esc(t("Je hebt in dit venster nog geen back-up gemaakt.")) + "</div><div><button class='btn' data-bk='1'>" + esc(t("Back-up maken")) + "</button></div>") : "";
      return "<div class='ask" + (rood ? "" : " neutraal") + "'><b>" + esc(t(r.warn || "Weet je het zeker?")) + "</b>" + (r.note ? "<p>" + esc(t(r.note)) + "</p>" : "") + bk +
        (rood ? "<div class='f'><div class='nm'>" + esc(t(r.sure || "Ik weet het zeker")) + "</div><button class='tg rood" + (this._sure ? " on" : "") + "' role='switch' aria-checked='" + !!this._sure + "' data-sure='1'></button></div>" : "") +
        "<div class='askbtns'><button class='btn' data-ask='no'>" + esc(t("Annuleren")) + "</button><button class='btn " + (rood ? "yes" : "ok") + "' data-ask='yes'" + (rood && !this._sure ? " disabled" : "") + ">" + esc(t(r.yes || "Ja, uitvoeren")) + "</button></div></div>";
    }
    _row(r, i) {
      const H = this._hass.states;
      if (r.type === "section") return "<div class='sec'>" + esc(r.name || "") + "</div>";
      if (r.type === "actie") {
        const open = this._ask === i;
        return "<div class='f'>" + this._naam(r, i) + "<button class='btn" + (r.danger ? " danger" : "") + (open ? " dim" : "") + "' data-act='" + i + "'>" + esc(t(r.label || "Uitvoeren")) + "</button></div>" + (open ? this._askBox(r) : "");
      }
      if (!r.entity) return "";
      const s = H[r.entity], dom = r.entity.split(".")[0];
      if (!s) return "<div class='f na'>" + this._naam(Object.assign({}, r, { hint: t("niet gevonden") + ": " + r.entity }), i) + "<span></span></div>";
      const a = s.attributes, unit = a.unit_of_measurement ? " " + a.unit_of_measurement : "";
      if (dom === "number") {
        const min = +a.min, max = +a.max, step = +a.step || 1, v = +s.state, n = Math.round((max - min) / step);
        if (n <= 400 && r.kind !== "stepper") {
          const pc = (v - min) / (max - min) * 100;
          return "<div class='f'>" + this._naam(r, i) + "<div class='sl' style='min-width:min(320px,52cqw)'><input type='range' min='" + min + "' max='" + max + "' step='" + step + "' value='" + v + "' data-i='" + i + "' style='--v:" + pc + "%' aria-label='" + esc(r.name || "") + "'><output>" + this._num(v, step) + esc(unit) + "</output></div></div>";
        }
        const shown = this._edit === i ? "<input data-ni='" + i + "' inputmode='decimal' value='" + esc(String(v).replace(".", LANG === "en" ? "." : ",")) + "'>" : "<b data-ne='" + i + "' title='" + esc(t("Tik om te typen")) + "'>" + this._num(v, step) + esc(unit) + "</b>";
        return "<div class='f'>" + this._naam(r, i) + "<div class='stp' data-i='" + i + "'><button data-dir='-1' aria-label='" + esc(t("minder")) + "'>−</button>" + shown + "<button data-dir='1' aria-label='" + esc(t("meer")) + "'>+</button></div></div>";
      }
      if (dom === "switch") return "<div class='f'>" + this._naam(r, i) + "<button class='tg" + (s.state === "on" ? " on" : "") + "' role='switch' aria-checked='" + (s.state === "on") + "' data-i='" + i + "'></button></div>";
      if (dom === "select") {
        const opts = a.options || [], lab = r.labels || {};
        if (opts.length <= 6) return "<div class='f'>" + this._naam(r, i) + "<div class='chips'>" + opts.map((o) => "<button class='chip" + (o === s.state ? " on" : "") + "' data-i='" + i + "' data-o='" + esc(o) + "'>" + esc(lab[o] || o) + "</button>").join("") + "</div></div>";
        return "<div class='f'>" + this._naam(r, i) + "<div class='stp' data-i='" + i + "' data-sel='1'><button data-dir='-1'>‹</button><b>" + esc(lab[s.state] || s.state) + "</b><button data-dir='1'>›</button></div></div>";
      }
      if (dom === "text") {
        const v = ["unknown", "unavailable"].includes(s.state) ? "" : s.state, x = /^[a-z_]+\.[a-z0-9_]+$/.test(v) ? H[v] : null;
        const nu = v ? (x ? "<small>" + esc(t("nu")) + ": " + esc(x.state) + esc(x.attributes.unit_of_measurement ? " " + x.attributes.unit_of_measurement : "") + "</small>" : "<small style='color:#ff9800'>" + esc(t("sensor niet gevonden")) + "</small>") : "";
        if (this._edit === i) return "<div class='f wide'>" + this._naam(r, i) + "<div class='ed'><input data-ti='" + i + "' value='" + esc(v || (r.pick ? "sensor." : "")) + "' autocomplete='off' spellcheck='false'><button class='btn' data-tok='" + i + "'>OK</button></div>" +
          (r.pick ? "<div class='kies' data-kies='" + i + "'>" + this._kies(r, "") + "</div>" : "") + "</div>";
        return "<div class='f tx'>" + this._naam(r, i) + "<div class='val'><button class='txt" + (v ? "" : " empty") + "' data-te='" + i + "'>" + esc(v || t("leeg · tik om in te vullen")) + "</button>" + nu + "</div></div>";
      }
      if (dom === "date") return "<div class='f'>" + this._naam(r, i) + "<input type='date' class='date' data-di='" + i + "' value='" + (/^\d{4}-\d{2}-\d{2}$/.test(s.state) ? s.state : "") + "'></div>";
      return "<div class='f'>" + this._naam(r, i) + "<span class='val'>" + esc(s.state) + esc(unit) + "</span></div>";
    }
    // candidate sensors for a text row with "pick": power sensors (W or kW), best matches first, filtered by what is typed
    _kies(r, typed) {
      const H = this._hass.states, q = String(typed || "").toLowerCase().replace(/^sensor\.?/, "").trim(), woorden = (r.suggest || []).map((w) => String(w).toLowerCase());
      const lijst = Object.keys(H).filter((id) => id.startsWith("sensor.") && !id.startsWith("sensor.batterijplan")).map((id) => {
        const a = H[id].attributes || {}, u = a.unit_of_measurement, naam = String(a.friendly_name || id);
        if (!(a.device_class === "power" || u === "W" || u === "kW")) return null;
        const tekst = (id + " " + naam).toLowerCase();
        if (q && !q.split(/\s+/).every((w) => tekst.includes(w))) return null;
        const score = woorden.reduce((n, w) => n + (tekst.includes(w) ? 1 : 0), 0) + (isFinite(parseFloat(H[id].state)) ? 0.5 : 0) + (id === (H[r.entity] || {}).state ? 10 : 0);
        return { id, naam, score, v: H[id].state + (u ? " " + u : "") };
      }).filter(Boolean).sort((a, b) => b.score - a.score || a.naam.localeCompare(b.naam)).slice(0, 8);
      if (!lijst.length) return "<div class='hulp'>" + esc(t("Geen vermogenssensor gevonden. Typ de naam zelf.")) + "</div>";
      return "<div class='hulp'>" + esc(t(r.pick_hint || "Kies je sensor; rechts staat wat hij nu meldt.")) + "</div>" +
        lijst.map((x, j) => "<button class='opt" + (j === 0 && x.score >= 1 ? " top" : "") + "' data-kid='" + esc(x.id) + "'><b>" + esc(x.naam) + "</b><small>" + esc(x.id) + "</small><span>" + esc(x.v) + "</span></button>").join("");
    }
    _render() {
      if (!this._hass || !this._config) return;
      zetTaal(this._hass, this._config);
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      const c = this._config, rows = this._rows(), tb = c.tabs ? c.tabs[this._tab] || {} : null;
      this.shadowRoot.innerHTML = "<style>" + VCSS + "</style><ha-card style='--c:" + esc(c.color || "var(--primary-color)") + "'>" +
        (c.title ? "<div class='title'>" + (c.icon ? "<ha-icon icon='" + esc(c.icon) + "'></ha-icon>" : "") + "<span>" + esc(c.title) + "</span>" +
          (c.info ? "<ha-icon class='i' data-info='k' icon='mdi:information-outline' title='" + esc(t("Hoe lees je dit?")) + "'></ha-icon>" : "") + "</div>" : "") +
        (c.tabs ? "<div class='tabs'>" + c.tabs.map((x, j) => "<button class='tab" + (j === this._tab ? " on" : "") + "'" + (x.kleur ? " style='" + (j === this._tab ? "background:" : "color:") + esc(x.kleur) + "'" : "") + " data-tab='" + j + "'>" + esc(x.naam || "") + "</button>").join("") + "</div>" +
          (tb.sub ? "<div class='tabsub'>" + esc(tb.sub) + "</div>" : "") : "") +
        "<div class='rows'>" + rows.map((r, i) => this._row(r, i)).join("") + "</div></ha-card>";
      this._wire(rows);
    }
    _uitleg(text) {
      zetTaal(this._hass, this._config);
      const scherm = document.createElement("div"); scherm.className = "ui-scherm";
      scherm.innerHTML = "<div class='ui-paneel'><div class='ui-kop'><span class='terug'>‹ " + esc(t("Terug")) + "</span><b>" + esc(t("Hoe lees je dit?")) + "</b></div>" + infoHtml(text) + "</div>";
      const dicht = (e) => { if (e && e.type === "keydown") { if (e.key !== "Escape") return; e.stopPropagation(); } scherm.remove(); document.removeEventListener("keydown", dicht, true); };
      scherm.addEventListener("click", (e) => { if (e.target === scherm || e.target.classList.contains("terug")) dicht(); });
      document.addEventListener("keydown", dicht, true);
      this.shadowRoot.appendChild(scherm);
    }
    _wire(rows) {
      const R = this.shadowRoot, H = this._hass, call = (d, s, x) => H.callService(d, s, x);
      const dom = (r) => r.entity.split(".")[0];
      R.querySelectorAll("[data-info]").forEach((b) => b.addEventListener("click", () => this._uitleg(b.dataset.info === "k" ? this._config.info : rows[+b.dataset.info].info)));
      R.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { this._tab = +b.dataset.tab; this._edit = undefined; this._ask = undefined; this._sure = false; this._render(); }));
      R.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => {
        const i = +b.dataset.act, r = rows[i];
        if (r.rapport) { const w = window.open("", "_blank"); if (!w) return; bpToon(w, "<p style='font-family:sans-serif;color:#ccc;background:#0a121a'>" + esc(t("Gegevens ophalen…")) + "</p>"); bpRapportHtml(H).then((h) => bpToon(w, h)); return; }
        if (r.danger || r.ask) { this._ask = this._ask === i ? undefined : i; this._sure = false; this._bk = false; this._render(); return; }
        if (r.entity) call(r.entity.split(".")[0], "press", { entity_id: r.entity });
      }));
      const bkb = R.querySelector("[data-bk]");
      if (bkb) bkb.addEventListener("click", () => { const r = rows[this._ask]; if (r && r.backup) call(r.backup.split(".")[0], "press", { entity_id: r.backup }); this._bk = true; this._render(); });
      const zeker = R.querySelector("[data-sure]");
      if (zeker) zeker.addEventListener("click", () => { this._sure = !this._sure; this._render(); });
      R.querySelectorAll("[data-ask]").forEach((b) => b.addEventListener("click", () => {
        const r = rows[this._ask];
        if (b.dataset.ask === "yes" && r && (!r.danger || this._sure) && r.entity) call(r.entity.split(".")[0], "press", { entity_id: r.entity });
        this._ask = undefined; this._sure = false; this._bk = false; this._sig = ""; this._render();
      }));
      R.querySelectorAll("input[type=range][data-i]").forEach((inp) => {
        const r = rows[+inp.dataset.i], a = H.states[r.entity].attributes, unit = a.unit_of_measurement ? " " + a.unit_of_measurement : "";
        inp.addEventListener("pointerdown", () => { this._busy = r.entity; });
        inp.addEventListener("input", () => { this._busy = r.entity; inp.style.setProperty("--v", (inp.value - a.min) / (a.max - a.min) * 100 + "%"); inp.nextElementSibling.textContent = this._num(inp.value, a.step || 1) + unit; });
        inp.addEventListener("change", () => { this._busy = null; call(dom(r), "set_value", { entity_id: r.entity, value: +inp.value }); });
      });
      R.querySelectorAll(".stp[data-i]").forEach((box) => box.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
        const r = rows[+box.dataset.i], s = H.states[r.entity], dir = +b.dataset.dir;
        if (box.dataset.sel) { const o = s.attributes.options, j = (o.indexOf(s.state) + dir + o.length) % o.length; call(dom(r), "select_option", { entity_id: r.entity, option: o[j] }); return; }
        const a = s.attributes, st = +(r.step || a.step || 1), v = Math.min(+a.max, Math.max(+a.min, Math.round((+s.state + dir * st) / st) * st));
        call(dom(r), "set_value", { entity_id: r.entity, value: +v.toFixed(6) });
      })));
      R.querySelectorAll("[data-ne]").forEach((b) => b.addEventListener("click", () => { this._edit = +b.dataset.ne; this._render(); const x = R.querySelector("[data-ni]"); if (x) { x.focus(); x.select(); } }));
      const bewaarGetal = () => { const x = R.querySelector("[data-ni]"); if (!x) return; const r = rows[+x.dataset.ni], v = parseFloat(x.value.replace(",", ".")); this._edit = undefined;
        if (Number.isFinite(v)) call(dom(r), "set_value", { entity_id: r.entity, value: v }); this._sig = ""; this._render(); };
      R.querySelectorAll("[data-ni]").forEach((x) => { x.addEventListener("keydown", (e) => { if (e.key === "Enter") bewaarGetal(); if (e.key === "Escape") { e.stopPropagation(); this._edit = undefined; this._render(); } }); x.addEventListener("blur", bewaarGetal); });
      R.querySelectorAll(".tg[data-i]").forEach((b) => b.addEventListener("click", () => { const r = rows[+b.dataset.i]; call("switch", b.classList.contains("on") ? "turn_off" : "turn_on", { entity_id: r.entity }); }));
      R.querySelectorAll(".chip[data-i]").forEach((b) => b.addEventListener("click", () => { const r = rows[+b.dataset.i]; call(dom(r), "select_option", { entity_id: r.entity, option: b.dataset.o }); }));
      R.querySelectorAll("[data-te]").forEach((b) => b.addEventListener("click", () => { this._edit = +b.dataset.te; this._render(); const x = R.querySelector("[data-ti]"); if (x) { x.focus(); x.select(); } }));
      const bewaarTekst = () => { const x = R.querySelector("[data-ti]"); if (!x) return; const r = rows[+x.dataset.ti]; this._edit = undefined;
        const val = x.value.trim(); call(dom(r), "set_value", { entity_id: r.entity, value: val === "sensor." ? "" : val }); this._sig = ""; this._render(); };
      R.querySelectorAll("[data-tok]").forEach((b) => b.addEventListener("click", bewaarTekst));
      R.querySelectorAll("[data-ti]").forEach((x) => x.addEventListener("keydown", (e) => { if (e.key === "Enter") bewaarTekst(); if (e.key === "Escape") { e.stopPropagation(); this._edit = undefined; this._render(); } }));
      const kiesWire = (box) => box.querySelectorAll("[data-kid]").forEach((b) => b.addEventListener("mousedown", (e) => e.preventDefault()) || b.addEventListener("click", () => {
        const r = rows[+box.dataset.kies]; this._edit = undefined; call(dom(r), "set_value", { entity_id: r.entity, value: b.dataset.kid }); this._sig = ""; this._render(); }));
      R.querySelectorAll("[data-kies]").forEach((box) => {
        kiesWire(box);
        const x = R.querySelector("[data-ti='" + box.dataset.kies + "']");
        if (x) x.addEventListener("input", () => { box.innerHTML = this._kies(rows[+box.dataset.kies], x.value); kiesWire(box); });
      });
      R.querySelectorAll("[data-di]").forEach((x) => x.addEventListener("change", () => { const r = rows[+x.dataset.di]; if (x.value) call("date", "set_value", { entity_id: r.entity, date: x.value }); }));
    }
  }

  // ---------- custom:batterijplan-status — status with logo; every line has an (i) with "Hoe lees je dit?" ----------
  const ST_INFO = {
    advies: "**Solar reserved for house** in HBC: links wat er nu in HBC staat, rechts het advies van Batterijplan (verwacht huisverbruik op zon na het goedkope laden, afgerond op 0,5 kWh).\n\n- **groen**: staat goed, minder dan 1 kWh verschil.\n- **oranje**: pas het getal in HBC aan naar het advies.\n- **– –**: nog geen advies.",
    modus: "**Live**: Batterijplan zet elk kwartier de Dynamic-standen van HBC.\n\n**Schaduw**: Batterijplan rekent mee en laat zien wat het zou doen, maar verandert niets aan HBC.\n\nAan- en uitzetten doe je met de schakelaar Live bovenaan.",
    leren: "Batterijplan leert per uur van de dag hoeveel je huis gebruikt. Na 7 dagen is het klaar met leren. Daarna leert het glijdend door, zodat het met de seizoenen meegaat.\n\nDe **voorspelling** zegt hoe goed het geleerde verbruik het echte verbruik raakt, per blok van 3 uur:\n- wisselvallig: minder dan 55 %\n- redelijk: 55 % of meer\n- goed: 65 % of meer\n- zeer goed: 75 % of meer\n- uitstekend: 85 % of meer\n\nZolang er nog geen blok van 3 uur gemeten is, staat er: nog aan het meten.",
    hbc: "Batterijplan werkt alleen als HBC op **Dynamic** staat. Staat HBC op iets anders, dan wacht het plan en verandert Batterijplan niets. Het leren gaat gewoon door.",
    kwartier: "Wat Batterijplan voor het volgende kwartier besluit, naast wat HBC alleen zou doen:\n- **Laden van het net**: de batterij wordt van het net geladen.\n- **Ontladen**: de batterij levert aan het huis.\n- **Vasthouden**: de lading wordt bewaard voor een nog duurder moment.\n- **Terugleveren**: de batterij levert terug aan het net.\n- **Alleen zon / niets**: niet laden van het net en niet ontladen.\n\nIs het plan gelijk aan HBC, dan staat er dat het hetzelfde is.",
    regels: "De vier regels waarmee Batterijplan mag bijsturen. Je zet ze aan of uit onder Instellingen, tabblad Regels.\n\nStaat een regel uit, dan doet Batterijplan op dat punt wat HBC doet.",
  };
  const VOORSPELLING_KLEUR = { uitstekend: "#1b5e20", "zeer goed": "#2e7d32", goed: "#43a047", redelijk: "#9ccc65" };
  // action letters of the plan (L charge from grid, O discharge, H hold, Z solar only, V feed in) -> Dutch source text
  const ACT_NAAM = { L: "laden van het net", O: "ontladen", H: "vasthouden", V: "terugleveren", Z: "alleen zon / niets" };
  const REGELS = [["laden", "laden"], ["ontladen", "ontladen"], ["vasthouden", "vasthouden"], ["terugleveren", "terugleveren"]];
  class BpStatus extends HTMLElement {
    setConfig(c) { this._config = Object.assign({ logo: BASE + "logo-neon-ademend.webp?v=2" }, c || {}); this._sig = ""; if (this._hass) this._render(); }
    set hass(h) {
      this._pid = h.states["sensor.batterijplan_2"] ? "sensor.batterijplan_2" : "sensor.batterijplan";
      this._hass = h; zetTaal(h, this._config);
      const ids = ["switch.batterijplan_live", "sensor.batterijplan_verbruiksprofiel", "sensor.batterijplan_voorspelling", "input_select.house_battery_strategy", "sensor.batterijplan_advies_zon_na_goedkoop_laden", "input_number.house_battery_solar_reserved_for_house", this._pid]
        .concat(REGELS.map((r) => "switch.batterijplan_regel_" + r[0]));
      const pa = (h.states[this._pid] || {}).attributes || {};
      const sig = ids.map((id) => (h.states[id] || {}).state).join("|") + pa.actie + pa.hbc_actie + pa.komend_kwartier + "|" + pa.versie + LANG;
      if (sig !== this._sig) { this._sig = sig; this._render(); }
    }
    getCardSize() { return 5; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }
    _render() {
      if (!this._hass) return;
      zetTaal(this._hass, this._config);
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      const S = this._hass.states, st = (id) => (S[id] || {}).state, at = (id) => (S[id] || {}).attributes || {};
      const live = st("switch.batterijplan_live") === "on", p = "sensor.batterijplan_verbruiksprofiel", prima = st(p) === "prima";
      const nn = arr(at(p).n), dag = Math.min(Math.floor(nn.reduce((a, b) => a + (Number(b) || 0), 0) / 96) + 1, 7);
      const gezien = arr(at(p).uur).filter((x) => typeof x === "number").length;
      const vo = st("sensor.batterijplan_voorspelling") || "", vk = VOORSPELLING_KLEUR[vo];
      const vtxt = vk ? "<b style='color:" + vk + "'>" + esc(t(vo)) + "</b>" : esc(t(vo));
      const dyn = st("input_select.house_battery_strategy") === "Dynamic";
      const ic = (n) => "<img src='" + BASE + n + ".png?v=1' alt=''>";
      const pa = at(this._pid), versie = pa.versie;
      const leren = prima ? "<b>" + esc(t("klaar met leren")) + "</b> · " + esc(t("voorspelling")) + " " + vtxt
        : "<b>" + esc(t("aan het leren")) + "</b> · " + esc(t("dag")) + " " + dag + " " + esc(t("van")) + " 7 · " + esc(t("voorspelling")) + " " + vtxt +
          (gezien >= 24 ? "" : " · " + gezien + " " + esc(t("van 24 uren al gezien")));
      // next quarter: action of the plan versus what HBC alone would do
      const KORT = { L: "laden", O: "ontladen", H: "vasthouden", V: "terugleveren", Z: "zon" }; // kort, past op één regel
      const an = (l) => esc(t(KORT[l] || ACT_NAAM[l] || "—"));
      let kw = "<b>—</b>";
      if (ACT_NAAM[pa.actie]) kw = pa.actie === pa.hbc_actie ? "<b>" + an(pa.actie) + "</b> — " + esc(t("hetzelfde als HBC"))
        : esc(t("Plan")) + ": <b>" + an(pa.actie) + "</b> · HBC: " + an(pa.hbc_actie);
      const kt = Number(pa.komend_kwartier) > 0 ? new Date(Number(pa.komend_kwartier) * 1000) : null;
      const regels = REGELS.map((r) => { const on = st("switch.batterijplan_regel_" + r[0]) !== "off"; return esc(t(r[1])) + " <b style='color:" + (on ? "#66bb6a" : "#ff9800") + "'>" + esc(t(on ? "aan" : "uit")) + "</b>"; }).join(" · ");
      const rij = (icoon, naam, waarde, info) => "<div class='r'>" + icoon + "<span class='n'>" + naam + "</span><span class='w'>" + waarde + "</span>" +
        "<ha-icon class='i' data-info='" + info + "' icon='mdi:information-outline' title='" + esc(t("Hoe lees je dit?")) + "'></ha-icon></div>";
      this.shadowRoot.innerHTML = "<style>" + VCSS +
        "ha-card{padding:16px 18px 10px}.kop{display:flex;align-items:center;gap:12px}.kop img{height:64px;border-radius:12px}.kop .tt{font-size:20px;font-weight:700}.kop small{font-size:14px;font-weight:600;color:var(--secondary-text-color);margin-left:6px}" +
        ".vraag{font-weight:600;margin:10px 0 6px;font-size:14px}" +
        ".r{display:grid;grid-template-columns:24px minmax(90px,.8fr) minmax(0,1.6fr) 20px;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line);font-size:14px}" +
        ".r img{height:22px}.r .n{color:var(--secondary-text-color)}.r .i{--mdc-icon-size:18px}</style>" +
        "<ha-card><div class='kop'><img class='logo' src='" + esc(this._config.logo) + "' alt='' title='" + esc(t("Seizoen")) + "'><span class='tt'>Batterijplan" + (versie ? "<small>v" + esc(versie) + "</small>" : "") + "</span></div>" +
        "<div class='vraag'>" + esc(t("Haalt de batterij meer uit de duurste kwartieren dan HBC alleen?")) + "</div>" +
        rij(ic(live ? "vinkje-cirkel" : "spook"), esc(t("Modus")), live ? "<b>" + esc(t("live")) + "</b> — " + esc(t("stuurt HBC")) : "<b>" + esc(t("schaduw")) + "</b> — " + esc(t("rekent mee, stuurt niet")), "modus") +
        rij(ic(prima ? "vinkje-cirkel" : "zandloper"), esc(t("Verbruik leren")), leren, "leren") +
        rij(ic(dyn ? "vinkje-cirkel" : "zandloper"), esc(t("HBC-strategie")), esc(st("input_select.house_battery_strategy") || "—") + (dyn ? "" : " — " + esc(t("plan wacht tot Dynamic"))), "hbc") +
        rij(ic("kalender-klok"), esc(t("Komend kwartier")), kw, "kwartier") +
        (() => { const ad = S["sensor.batterijplan_advies_zon_na_goedkoop_laden"], ing = Number(st("input_number.house_battery_solar_reserved_for_house")); const av7 = this._adv7 || {}; const uurNu = Math.floor(Date.now() / 3600000); if (av7.uur !== uurNu && !av7.bezig) { this._adv7 = { uur: av7.uur, n: av7.n, v: av7.v, bezig: true }; this._hass.callWS({ type: "recorder/statistics_during_period", start_time: new Date(Date.now() - 7 * 86400000).toISOString(), statistic_ids: ["sensor.batterijplan_advies_zon_na_goedkoop_laden"], period: "day", types: ["mean"] }).then((r) => { const l = (r["sensor.batterijplan_advies_zon_na_goedkoop_laden"] || []).map((x) => Number(x.mean)).filter((v) => Number.isFinite(v)); this._adv7 = { uur: uurNu, n: l.length, v: l.length ? l.reduce((p, q) => p + q, 0) / l.length : null }; this._sig = ""; this._render(); }).catch(() => { this._adv7 = { uur: uurNu, n: 0, v: null }; }); } const meet = !(this._adv7 && this._adv7.n >= 7); const av = !ad || meet ? NaN : Number(this._adv7.v); const ok = Number.isFinite(av) && Number.isFinite(ing); const kl = !ok ? "" : Math.abs(av - ing) < 1 ? "#66bb6a" : "#ff9800"; const w = "<b>" + (Number.isFinite(ing) ? esc(nl(ing, Number.isInteger(ing) ? 0 : 1)) + " kWh" : "—") + "</b> " + esc(t("ingesteld")) + " · " + esc(t("advies")) + " <b" + (kl ? " style='color:" + kl + "'" : "") + ">" + (Number.isFinite(av) ? esc(nl(Math.round(av * 2) / 2, 1)) + " kWh" : "– –") + "</b>"; return rij(ic("schuifregelaars"), esc(t("Advies huisverbruik")), w, "advies"); })() +
        "</ha-card>";
      this.shadowRoot.querySelectorAll("[data-info]").forEach((b) => b.addEventListener("click", () => BpVelden.prototype._uitleg.call(this, ST_INFO[b.dataset.info])));
      // klik op het logo: seizoensplaat groot (huisstijl, zoals HESC)
      const lg = this.shadowRoot.querySelector("img.logo");
      if (lg) lg.addEventListener("click", () => {
        const m = new Date().getMonth() + 1, s = [3, 4, 5].includes(m) ? "lente" : [6, 7, 8].includes(m) ? "zomer" : [9, 10, 11].includes(m) ? "herfst" : "winter";
        const ov = document.createElement("div");
        ov.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:16px;box-sizing:border-box";
        ov.innerHTML = "<img src='" + BASE + "seizoen/batterijplan-seizoen-" + s + ".webp?v=1' alt='Batterijplan · " + s + "' style='max-width:100%;max-height:100%;border-radius:12px;box-shadow:0 0 40px rgba(6,182,212,.35)'>";
        const weg = () => { ov.remove(); document.removeEventListener("keydown", esc2); };
        const esc2 = (ev) => { if (ev.key === "Escape") weg(); };
        ov.addEventListener("click", weg); document.addEventListener("keydown", esc2);
        document.body.appendChild(ov);
      });
    }
  }

  // One source for the solar advice on both the card and the dot on the button: the backend's 7 days of history,
  // else the earlier 7-day mean of the advice sensor from the statistics (module-level ADV, filled by adviesGem)
  function zonAdvies(S) {
    const h = (S["sensor.batterijplan_advies_hbc"] || {}).attributes || {}, ad = (S["sensor.batterijplan_advies_zon_na_goedkoop_laden"] || {}).attributes || {};
    const num = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
    const lerend = String(ad.voorlopig) === "true";
    let adv = num(h.solar_advies), uitStats = false;
    if (!Number.isFinite(adv) && !lerend && ADV.n >= 7 && ADV.v != null) { adv = Math.round(ADV.v * 2) / 2; uitStats = true; }
    const ni = num((S["input_number.house_battery_solar_reserved_for_house"] || {}).state), nu = Number.isFinite(ni) ? ni : num(h.solar_nu);
    return { adv, nu, lerend, gem: uitStats ? ADV.v : adv, verschil: Number.isFinite(adv) && Number.isFinite(nu) && Math.abs(adv - nu) >= 0.5 - 1e-9 };
  }

  // Advies voor HBC: verwacht huisverbruik op zon (instelling "Solar reserved for house") en nachtladen
  class BpAdvies extends BpBase {
    static getStubConfig() { return { title: "Advies voor HBC", icon: "batterijplan:schuifregelaars" }; }
    getGridOptions() { return { columns: 12, rows: "auto" }; }
    _render() {
      if (!this._hass) return;
      this._shell();
      const S = this._hass.states, ad = S["sensor.batterijplan_advies_zon_na_goedkoop_laden"] || { state: null, attributes: {} };
      const hv = S["sensor.batterijplan_advies_hbc"] || { state: null, attributes: {} }, h = hv.attributes || {};
      const pa = (S[IDS.plan] || {}).attributes || {};
      const auto = (S["switch.batterijplan_hbc_auto"] || {}).state === "on";
      this._chips.style.display = "none";
      adviesGem(this._hass, this._terug || (this._terug = () => this._render()));
      this._setUitleg("<p><b>" + t("Wat is dit?") + "</b> " + t("In HBC stel je in hoeveel uur van de dag als goedkoop en als duur telt (cheapest hrs, expensive hrs) en hoeveel zonne-energie je huis zelf direct opmaakt (Solar reserved for house).") + "</p>" +
        "<p>" + t("Batterijplan bewaart 7 dagen per kwartier de prijs, je huisverbruik en je zon. Elke nacht rekent het die 7 dagen opnieuw door met zijn eigen plan, voor verschillende waarden van cheapest hrs en expensive hrs, en kiest de goedkoopste. Bij een gelijke uitkomst blijft het bij de waarde die het dichtst bij de huidige ligt.") + "</p>" +
        "<p>" + t("Een oranje stip betekent: het advies wijkt minstens 1 uur (of 0,5 kWh) af van wat in HBC staat. Je ziet dat ook als automatisch aanpassen uit staat.") + " " + t("Aan: Batterijplan zet de waarden zelf in HBC, alleen als het verschil minstens 1 uur of 0,5 kWh is. Jouw eigen waarden worden onthouden en komen exact terug als je dit uitzet. Elke wijziging staat in het logboek.") + "</p>");
      const oo = adviesOordeel(this._hass);
      const num = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v)); // null from the backend = no value (Number(null) would be 0)
      const fh = (v) => nl(Number(v), Number.isInteger(Number(v)) ? 0 : 2), eur = (v) => "€ " + nl(Number(v), 2);
      const meten = h.status === "meten" || !h.status, lerend = oo.stand === "meten" && oo.dagen === 0 && ad.attributes && String(ad.attributes.voorlopig) === "true";
      // solar advice: backend (7 days of its own history) else the earlier 7-day mean from the statistics
      const zon = zonAdvies(S), zonAdv = zon.adv;
      const rijen = [
        { k: "cheapest", naam: t("Aantal goedkope uren"), hbc: "cheapest hrs", eenh: " h", nul: true, dec: fh, nu: num(h.cheapest_nu), adv: num(h.cheapest_advies), thr: 1, thrTxt: "1 h" },
        { k: "expensive", naam: t("Aantal dure uren"), hbc: "expensive hrs", eenh: " h", nul: true, dec: fh, nu: num(h.expensive_nu), adv: num(h.expensive_advies), thr: 1, thrTxt: "1 h" },
        { k: "solar", naam: t("Huisverbruik op zon"), hbc: "Solar reserved for house", eenh: " kWh", dec: (v) => nl(Number(v), Number.isInteger(Number(v)) ? 0 : 1), nu: zon.nu, adv: zonAdv, thr: 0.5, thrTxt: nl(0.5, 1) + " kWh" },
      ];
      const txt = (r, v) => (r.nul && Number(v) === 0 ? t("geen grens") : r.dec(v) + r.eenh); // HBC: 0 hours = no limit
      let verschilAantal = 0;
      const rhtml = rijen.map((r) => {
        const heeft = Number.isFinite(r.adv), nuOk = Number.isFinite(r.nu);
        const verschil = heeft && nuOk && Math.abs(r.adv - r.nu) >= r.thr - 1e-9;
        if (verschil) verschilAantal++;
        let reden = "";
        if (r.k === "solar") reden = heeft ? t("Gemiddeld {x} kWh huisverbruik op zon in de laatste 7 dagen.").replace("{x}", nl(Math.round(zon.gem * 10) / 10, 1)) : "";
        else if (heeft && verschil && Number(h.besparing) > 0) reden = t("De laatste 7 dagen opnieuw doorgerekend: {x} goedkoper dan nu.").replace("{x}", eur(h.besparing));
        else if (heeft && !verschil && r.adv === r.nu) reden = t("Past het best bij de laatste 7 dagen.");
        if (heeft && !verschil && r.adv !== r.nu) reden = t("Advies wijkt minder dan {x} af: Batterijplan laat het zoals het is.").replace("{x}", r.thrTxt);
        return "<div style='display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,.7fr) minmax(0,.9fr);gap:4px 10px;align-items:baseline;padding:9px 0;border-top:1px solid var(--divider-color);font-size:14px'>" +
          "<div>" + esc(r.naam) + "<div style='font-size:11px;color:var(--secondary-text-color)'>HBC: " + esc(r.hbc) + "</div></div>" +
          "<div style='text-align:right'><span style='font-size:11px;color:var(--secondary-text-color)'>" + esc(t("nu")) + "</span> <b>" + (nuOk ? esc(txt(r, r.nu)) : "—") + "</b></div>" +
          "<div style='text-align:right'><span style='font-size:11px;color:var(--secondary-text-color)'>" + esc(t("advies")) + "</span> <b" + (verschil ? " style='color:#ff9800'" : "") + ">" + (heeft ? esc(txt(r, r.adv)) : "– –") + "</b>" +
          (verschil ? " <span title='" + esc(t("Hier is iets te doen")) + "' style='display:inline-block;width:9px;height:9px;border-radius:50%;background:#ff9800;vertical-align:middle'></span>" : "") + "</div>" +
          (reden ? "<div style='grid-column:1/-1;font-size:12px;color:var(--secondary-text-color)'>" + esc(reden) + "</div>" : "") + "</div>";
      }).join("");
      let kop = "";
      if (lerend) kop = "<div style='font-size:15px;color:var(--secondary-text-color)'>" + esc(t("Wacht op het leren")) + "</div><div style='font-size:12px;color:var(--secondary-text-color);margin-top:2px'>" + esc(t("Batterijplan leert eerst 7 dagen je verbruik (Verbruik leren). Daarna meet het 7 dagen hoeveel zon je huis gebruikt, en dan komt het eerste advies.")) + "</div>";
      else if (h.status === "geen_zon") kop = "<div style='font-size:13px;color:#ff9800'>" + esc(t("Zonnesensor ontbreekt: kies die bij Sensoren, anders kan er niet worden doorgerekend.")) + "</div>";
      else if (h.status === "niet_beschikbaar") kop = "<div style='font-size:13px;color:#ff9800'>" + esc(t("Advies nog niet te berekenen: de gegevens van HBC of de batterijcapaciteit ontbreken.")) + "</div>";
      else if (meten) {
        const dag = Number(h.dag) || 1, klaar = Number(h.dagen) || 0;
        kop = "<div style='font-size:15px;color:var(--secondary-text-color)'>" + esc(t("Nog aan het meten: dag {x} van 7").replace("{x}", dag)) + "</div>" +
          "<div style='display:flex;gap:4px;margin-top:8px'>" + Array.from({ length: 7 }, (_, k) => "<span style='flex:1;height:6px;border-radius:3px;background:" + (k < klaar ? "#06B6D4" : "var(--divider-color)") + "'></span>").join("") + "</div>" +
          "<div style='font-size:12px;color:var(--secondary-text-color);margin-top:6px'>" + esc(t("Batterijplan bewaart per kwartier de prijs, je huisverbruik en je zon. Na 7 volle dagen rekent het die opnieuw door en komt het advies. Tot die tijd verandert er niets.")) + "</div>";
      } else if (h.berekend) {
        const d = new Date(h.berekend);
        kop = "<div style='font-size:12px;color:var(--secondary-text-color)'>" + esc(t("Berekend op") + " " + (Number.isNaN(d.getTime()) ? h.berekend : d.toLocaleString(LOC[LANG] || "nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) +
          (Number.isFinite(Number(h.duur_s)) ? " · " + t("duurde") + " " + nl(Number(h.duur_s), 1) + " s" : "")) + "</div>";
      }
      const blo = String(pa.bijladen).toLowerCase() === "true", nk = blo ? (Number(pa.nachtladen_kwh) || 0) : 0, nkw = blo ? arr(pa.bijladen_kwartieren) : [];
      const nacht = nk > 0 ? "<div style='font-size:13px;margin-top:8px'>" + t("Bijladen van het net:") + " " + nl(nk, 1) + " kWh" + (nkw.length ? " " + t("om") + " " + nkw[0] : "") + "</div>" : "";
      const sw = "<div style='display:flex;align-items:center;gap:10px;margin-top:12px;padding-top:10px;border-top:1px solid var(--divider-color)'>" +
        "<div style='flex:1;font-size:14px'>" + esc(t("HBC-instellingen automatisch")) + "<div style='font-size:12px;color:var(--secondary-text-color)'>" + esc(auto ? t("Aan: Batterijplan zet de waarden zelf in HBC, alleen als het verschil minstens 1 uur of 0,5 kWh is. Jouw eigen waarden worden onthouden en komen exact terug als je dit uitzet. Elke wijziging staat in het logboek.") : t("Uit: Batterijplan verandert niets in HBC. Je ziet hierboven alleen het advies.")) + "</div></div>" +
        "<button data-auto style='cursor:pointer;font:inherit;font-size:13px;padding:5px 16px;border-radius:999px;border:1px solid " + (auto ? "#66bb6a" : "var(--divider-color)") + ";background:" + (auto ? "rgba(102,187,106,0.15)" : "var(--secondary-background-color)") + ";color:var(--primary-text-color)'>" + esc(auto ? t("aan") : t("uit")) + "</button></div>";
      this._body.innerHTML = kop + (kop ? "<div style='height:6px'></div>" : "") + rhtml + nacht + sw;
      const knop = this._body.querySelector("[data-auto]");
      if (knop) knop.addEventListener("click", () => this._hass.callService("switch", auto ? "turn_off" : "turn_on", { entity_id: "switch.batterijplan_hbc_auto" }));
    }
  }



  const ADV = { uur: null, v: null, n: 0, wacht: [] };
  function adviesGem(hass, klaar) {
    const uur = Math.floor(Date.now() / 3600000);
    if (ADV.uur === uur && !ADV.bezig) return;
    if (klaar && !ADV.wacht.includes(klaar)) ADV.wacht.push(klaar);
    if (ADV.uur === uur) return;
    ADV.uur = uur; ADV.bezig = true;
    hass.callWS({ type: "recorder/statistics_during_period", start_time: new Date(Date.now() - 7 * 86400000).toISOString(),
      statistic_ids: ["sensor.batterijplan_advies_zon_na_goedkoop_laden"], period: "day", types: ["mean"] })
      .then((r) => { const l = (r["sensor.batterijplan_advies_zon_na_goedkoop_laden"] || []).map((x) => Number(x.mean)).filter((v) => Number.isFinite(v));
        ADV.v = l.length ? l.reduce((p, q) => p + q, 0) / l.length : null; ADV.n = l.length;
        ADV.bezig = false; const w = ADV.wacht; ADV.wacht = []; w.forEach((f) => { try { f(); } catch (e) {} }); })
      .catch(() => { ADV.bezig = false; ADV.wacht = []; });
  }
  function adviesOordeel(hass) {
    const a = (hass.states["sensor.batterijplan_advies_zon_na_goedkoop_laden"] || {}).attributes || {};
    const ing = Number(a.ingesteld), lerend = String(a.voorlopig) === "true" || a.voorlopig === true;
    const n = ADV.n, gem = ADV.v;
    if (lerend || n < 7 || gem == null) {
      // zeg precies waar het advies nog op wacht
      const nuIng = Number.isFinite(ing) ? " " + t("Nu ingesteld:") + " " + nl(ing, 1) + " kWh." : "";
      if (lerend) return { stand: "meten", dagen: 0, kop: t("Wacht op het leren"), kleur: "var(--secondary-text-color)",
        sub: t("Batterijplan leert eerst 7 dagen je verbruik (Verbruik leren). Daarna meet het 7 dagen hoeveel zon je huis gebruikt, en dan komt het eerste advies.") + nuIng };
      if (!n && ADV.bezig) return { stand: "meten", dagen: 0, kop: t("Gegevens ophalen…"), kleur: "var(--secondary-text-color)", sub: nuIng.trim() };
      const rest = Math.max(1, 7 - n), dd = new Date(Date.now() + rest * 86400000);
      return { stand: "meten", dagen: n, kop: t("Nog aan het meten:") + " " + n + " " + t("van 7 dagen"), kleur: "var(--secondary-text-color)",
        sub: t("Wacht op 7 dagen meting van hoeveel zon je huis gebruikt na het goedkope laden. Eerste advies rond") + " " + (DAGEN[LANG] || DAGEN.nl)[dd.getDay()] + " " + dd.getDate() + " " + (MAANDEN[LANG] || MAANDEN.nl)[dd.getMonth()] + "." + nuIng };
    }
    if (Math.abs(gem - ing) < 1)
      return { stand: "goed", kop: t("Staat goed"), kleur: "#66bb6a", sub: t("Ingesteld") + " " + nl(ing, 1) + " kWh · " + t("gemiddeld nodig") + " " + nl(gem, 1) + " kWh (" + t("7 dagen") + ")" };
    const naar = Math.round(gem * 2) / 2;
    return { stand: "aanpassen", kop: t("Aanpassen naar") + " " + nl(naar, 1) + " kWh", kleur: "#ff9800",
      sub: t("Nu ingesteld") + " " + nl(ing, 1) + " kWh · " + t("gemiddeld nodig") + " " + nl(gem, 1) + " kWh (" + t("7 dagen") + ")" };
  }

  customElements.define("batterijplan-advies", BpAdvies);
  customElements.define("batterijplan-velden", BpVelden);
  customElements.define("batterijplan-status", BpStatus);
  customElements.define("batterijplan-knoppen", BpKnoppen);
  customElements.define("batterijplan-opbrengst", BpOpbrengst);
  customElements.define("batterijplan-rapport", BpRapport);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "batterijplan-opbrengst", name: "Batterijplan - earnings" },
    { type: "batterijplan-knoppen", name: "Batterijplan - buttons with windows" }, { type: "batterijplan-velden", name: "Batterijplan - input fields" },
    { type: "batterijplan-status", name: "Batterijplan - status" }, { type: "batterijplan-rapport", name: "Batterijplan - report" });
})();
