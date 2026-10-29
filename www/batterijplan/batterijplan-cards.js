// Batterijplan — eigen kaarten in de huisstijl van HESC (zelfde opbouw als hesc-cards.js).
//   custom:batterijplan-plan      Plan vandaag en morgen: kerncijfers, balk per dag met tijdas, blokken
//   custom:batterijplan-grafiek   Prijs per kwartier met gekleurde vlakken (wat de batterij doet) en de lading
//   custom:batterijplan-advies    Advies voor HBC (Solar reserved for house), op basis van 7 dagen
//   custom:batterijplan-opbrengst Wat levert het op (tellers), uitleg achter de (i)
//   custom:batterijplan-knoppen   Knoppenrij met vensters (Live vooraan)
//   custom:batterijplan-velden    Eigen invoervelden in de huisstijl (schuifbalk, − waarde + pil, chips, tekst op de regel), met tabbladen
//   custom:batterijplan-status    Status met logo; elke regel een (i) met uitleg
// Teksten in het Nederlands, Engels en Duits; de taal volgt het profiel van de gebruiker in Home Assistant.
(() => {
  if (customElements.get("batterijplan-plan")) return;

  // Huisstijl-iconen (SatScan, eigen werk) als iconenset "batterijplan:", zodat de kaarten ook zonder HESC hun iconen hebben.
  const BP_ICONS = {"kalender-klok":"M31.5 10.0L31.2 8.7L29.9 7.1L28.0 6.5L26.7 6.8L25.1 8.1L24.6 9.3L24.5 14.5L16.5 14.6L14.2 14.9L12.6 15.5L10.6 16.6L8.9 18.2L7.7 20.1L6.9 22.2L6.5 26.0L6.6 70.3L7.5 73.4L9.1 76.0L11.4 77.9L14.2 79.1L17.9 79.5L40.7 79.4L42.5 78.5L43.2 77.3L43.5 76.0L43.2 74.7L42.5 73.5L40.7 72.6L17.5 72.5L15.6 72.2L14.4 71.4L13.7 70.1L13.5 68.5L13.5 41.5L68.9 41.5L70.1 42.9L72.0 43.5L73.3 43.2L74.5 42.5L75.4 40.7L75.5 25.9L75.2 23.0L74.6 20.8L73.8 19.2L72.6 17.6L71.2 16.5L68.7 15.2L66.3 14.6L57.5 14.5L57.5 10.0L57.2 8.7L55.9 7.1L54.7 6.6L53.3 6.6L52.1 7.1L50.8 8.7L50.5 10.0L50.5 14.5L31.5 14.5ZM24.8 27.3L26.1 28.9L27.3 29.4L29.3 29.2L30.5 28.5L31.4 26.7L31.5 21.5L50.5 21.5L50.5 26.0L50.8 27.3L51.5 28.5L52.7 29.2L54.7 29.4L55.9 28.9L57.2 27.3L57.5 26.0L57.5 21.5L65.4 21.6L67.4 22.4L68.3 23.9L68.5 25.5L68.5 34.5L13.5 34.5L13.5 25.0L14.0 23.1L14.9 22.1L15.9 21.7L17.5 21.5L24.5 21.5L24.5 26.0ZM86.3 65.4L85.4 61.5L83.8 57.9L81.5 54.6L78.6 51.8L75.2 49.7L71.4 48.2L67.5 47.6L63.4 47.7L59.5 48.6L55.9 50.2L52.6 52.5L49.8 55.4L47.7 58.8L46.2 62.6L45.6 66.5L45.7 70.6L46.6 74.5L48.2 78.1L50.5 81.4L53.4 84.2L56.8 86.3L60.6 87.8L64.5 88.4L68.6 88.3L72.5 87.4L76.1 85.8L79.4 83.5L82.2 80.6L84.3 77.2L85.8 73.4L86.4 69.5ZM63.2 70.1L64.3 71.0L71.9 75.3L73.2 75.5L75.1 74.8L76.0 73.7L76.5 72.4L76.1 70.4L74.7 69.0L69.5 66.0L69.4 57.3L68.5 55.5L67.3 54.8L66.0 54.5L69.5 55.0L72.0 55.9L74.2 57.3L76.7 59.8L78.1 62.0L79.0 64.5L79.5 67.1L79.4 69.8L78.8 72.3L77.7 74.7L76.1 76.9L74.2 78.7L71.2 80.5L68.6 81.2L66.0 81.5L62.5 81.0L59.3 79.7L56.5 77.5L54.3 74.7L53.2 72.3L52.6 69.8L52.6 66.2L53.5 62.8L54.8 60.5L56.5 58.5L59.3 56.3L62.5 55.0L64.2 54.6L66.0 54.5L64.7 54.8L63.5 55.5L62.6 57.3L62.5 68.0L62.6 68.7Z","euro":"M58.7 44.4L59.9 43.9L60.9 42.9L61.5 41.0L60.9 39.1L59.9 38.1L58.7 37.6L30.2 37.5L31.6 35.1L34.5 31.6L38.2 28.9L42.3 26.9L46.7 25.8L51.3 25.6L55.8 26.3L60.1 27.9L63.9 30.4L68.0 34.2L69.3 34.7L71.3 34.5L72.8 33.2L73.4 31.3L72.8 29.3L68.0 24.7L62.9 21.5L58.0 19.6L51.3 18.5L45.4 18.9L40.2 20.2L34.8 22.7L29.5 26.8L25.6 31.4L23.0 36.0L22.5 37.5L17.3 37.6L16.1 38.1L15.1 39.1L14.5 41.0L14.8 42.3L15.5 43.5L17.3 44.4L20.8 44.5L20.5 47.6L20.8 51.5L17.3 51.6L16.1 52.1L14.8 53.7L14.6 55.7L15.1 56.9L16.7 58.2L18.0 58.5L22.5 58.5L23.0 60.0L26.0 65.2L30.0 69.7L34.8 73.3L40.2 75.8L45.4 77.1L51.3 77.5L57.3 76.6L63.5 74.2L68.6 70.9L72.3 67.2L73.1 66.1L73.3 64.1L72.4 62.3L70.6 61.3L68.6 61.4L67.5 62.2L63.9 65.6L60.1 68.1L55.8 69.7L51.3 70.4L46.7 70.2L42.3 69.1L38.2 67.1L34.5 64.4L31.6 60.9L30.2 58.5L58.7 58.4L59.9 57.9L61.2 56.3L61.4 54.3L60.9 53.1L59.3 51.8L58.0 51.5L27.8 51.5L27.5 48.0L27.8 44.5Z","euro-klok":"M43.3 39.2L44.9 37.9L45.5 36.0L44.9 34.1L43.3 32.8L42.0 32.5L22.6 32.5L24.7 30.0L27.3 28.0L30.4 26.5L33.6 25.7L36.9 25.5L40.2 26.1L43.4 27.3L46.2 29.0L49.4 32.0L50.7 32.5L52.0 32.5L53.3 32.0L54.6 30.4L54.8 29.0L54.2 27.1L50.3 23.3L46.8 21.1L42.4 19.4L37.0 18.5L32.2 18.8L28.3 19.8L24.0 21.8L20.1 24.7L17.0 28.3L14.5 32.5L9.3 32.6L8.1 33.1L7.1 34.1L6.5 36.0L6.8 37.3L7.5 38.5L9.3 39.4L12.8 39.5L12.5 41.6L12.8 44.5L9.3 44.6L8.1 45.1L6.8 46.7L6.6 48.7L7.1 49.9L8.7 51.2L10.0 51.5L14.5 51.5L16.6 55.2L19.6 58.8L23.4 61.8L27.6 63.9L32.9 65.3L37.0 65.5L41.7 64.8L46.8 62.9L50.8 60.2L53.7 57.4L54.5 56.3L54.8 55.0L54.6 53.6L53.8 52.5L52.0 51.5L50.0 51.6L48.9 52.4L46.2 55.0L43.4 56.7L40.2 57.9L36.9 58.5L33.6 58.3L30.4 57.5L27.3 56.0L24.7 54.0L22.6 51.5L42.7 51.4L43.9 50.9L45.2 49.3L45.4 47.3L44.9 46.1L43.3 44.8L42.0 44.5L19.8 44.5L19.5 42.0L19.8 39.5L42.0 39.5ZM90.4 69.7L89.6 66.2L88.1 62.9L86.0 59.9L83.4 57.4L80.3 55.5L76.9 54.2L73.3 53.5L69.7 53.6L66.2 54.4L62.9 55.9L59.9 58.0L57.4 60.6L55.5 63.7L54.2 67.1L53.5 70.7L53.6 74.3L54.4 77.8L55.9 81.1L58.0 84.1L60.6 86.6L63.7 88.5L67.1 89.8L70.7 90.5L74.3 90.4L77.8 89.6L81.1 88.1L84.1 86.0L86.6 83.4L88.5 80.3L89.8 76.9L90.5 73.3ZM69.1 73.9L70.1 74.9L76.7 79.2L78.0 79.5L79.9 78.9L81.2 77.3L81.4 75.3L80.5 73.5L75.5 70.1L75.5 63.0L75.2 61.7L74.7 60.8L76.4 61.4L78.4 62.4L80.1 63.9L81.6 65.6L82.9 68.3L83.5 72.0L82.9 75.7L81.6 78.4L79.6 80.6L76.4 82.6L72.8 83.5L69.8 83.3L66.9 82.3L63.9 80.1L62.0 77.7L60.7 74.2L60.6 70.5L61.4 67.6L63.4 64.4L65.6 62.4L67.6 61.4L69.3 60.8L68.8 61.7L68.5 63.0L68.5 72.0Z","schuifregelaars":"M18.8 20.6L17.1 21.0L15.5 21.7L14.1 22.7L12.9 24.3L12.2 25.8L11.9 27.3L11.9 32.3L12.2 34.0L12.8 35.4L13.7 36.6L14.9 37.7L17.5 39.0L21.1 39.2L21.1 84.2L21.4 85.3L22.0 86.3L23.0 87.0L24.1 87.2L25.3 87.0L26.3 86.3L26.9 85.3L27.1 84.2L27.1 39.2L29.5 39.2L31.4 38.7L33.2 37.7L34.6 36.4L35.5 35.0L36.1 33.1L36.2 27.6L35.4 24.7L34.4 23.2L33.3 22.2L32.1 21.4L30.5 20.8L27.1 20.6L27.1 11.2L26.6 10.1L25.3 9.0L24.1 8.8L23.0 9.0L21.7 10.1L21.1 11.8L21.1 20.6ZM21.1 33.2L18.9 33.2L18.3 32.8L17.9 32.2L17.9 27.8L18.2 27.1L18.9 26.7L21.1 26.6ZM28.8 26.6L29.7 27.0L30.1 27.7L30.1 32.1L29.8 32.7L29.2 33.1L27.1 33.2L27.1 26.6ZM65.7 31.1L64.3 31.4L62.9 32.2L61.6 33.3L60.8 34.7L60.2 36.8L60.2 43.2L60.5 44.6L61.2 45.9L63.0 47.8L65.3 48.7L68.8 48.8L68.8 84.2L69.1 85.3L70.2 86.7L71.3 87.1L72.4 87.1L73.5 86.7L74.3 85.9L74.8 84.2L74.8 48.8L78.8 48.7L81.2 47.7L82.3 46.7L83.3 45.4L83.8 44.0L84.0 42.5L83.9 36.4L83.4 34.8L82.6 33.4L81.2 32.2L79.6 31.4L78.0 31.1L74.8 31.0L74.8 11.8L74.3 10.1L73.0 9.0L71.8 8.8L70.7 9.0L69.7 9.7L69.1 10.7L68.8 11.8L68.8 31.0ZM77.7 37.1L77.9 37.3L77.9 42.6L77.7 42.8L74.8 42.8L74.8 37.0ZM66.5 42.8L66.2 42.5L66.2 37.2L66.4 37.1L68.8 37.0L68.8 42.8ZM45.4 85.3L46.5 86.7L48.2 87.2L49.3 87.0L50.7 85.9L51.2 84.2L51.2 70.8L54.9 70.7L57.2 69.7L58.3 68.8L59.1 67.6L59.7 66.3L59.9 65.0L59.9 58.5L59.5 56.9L58.7 55.5L57.2 54.1L55.6 53.3L54.3 53.1L51.2 53.0L51.2 11.8L51.0 10.7L50.3 9.7L49.3 9.0L48.2 8.8L47.1 9.0L46.1 9.7L45.4 10.7L45.2 11.8L45.2 53.0L41.5 53.1L39.1 54.0L38.0 54.9L37.0 56.2L36.5 57.5L36.3 58.9L36.3 65.4L36.7 66.9L37.5 68.3L38.9 69.7L40.5 70.5L42.1 70.8L45.2 70.8L45.2 84.2ZM51.2 59.0L53.9 59.2L53.9 64.7L51.2 64.8ZM42.4 64.8L42.2 64.6L42.3 59.1L45.2 59.0L45.2 64.8Z","thuisbatterij":"M84.2 51.0L86.2 51.5L87.5 51.2L88.6 50.3L89.3 49.2L89.5 47.8L88.8 45.9L50.3 11.4L49.7 11.0L48.4 10.5L46.9 10.7L45.7 11.4L7.7 45.4L6.8 46.5L6.5 47.8L6.7 49.2L7.4 50.3L8.5 51.2L10.5 51.5L12.3 50.6L16.5 46.9L16.5 84.0L16.8 85.3L17.5 86.5L18.7 87.2L20.0 87.5L76.0 87.5L77.9 86.9L79.2 85.3L79.5 84.0L79.5 46.9ZM72.7 40.8L72.5 80.5L23.5 80.5L23.5 42.0L23.3 40.8L48.0 18.7ZM35.4 52.5L33.0 53.1L30.8 54.6L29.2 56.8L28.6 59.1L28.6 73.4L29.1 75.0L30.0 76.5L31.1 77.7L32.4 78.6L34.2 79.3L35.9 79.5L56.0 79.5L57.6 79.3L60.1 78.3L62.0 76.5L63.2 74.1L63.5 71.4L64.7 72.2L66.0 72.5L67.9 71.9L68.9 70.9L69.5 69.0L69.5 63.0L69.2 61.7L67.9 60.1L66.7 59.6L64.7 59.8L63.5 60.6L63.3 58.4L62.6 56.4L61.2 54.6L59.6 53.4L58.1 52.8L56.4 52.5ZM56.0 59.5L56.4 59.7L56.5 60.1L56.5 71.9L56.3 72.4L36.1 72.5L35.6 72.3L35.5 60.1L35.7 59.6Z","info":"M52.8 30.8L52.4 29.0L51.2 27.5L49.6 26.5L47.7 26.2L45.9 26.7L44.4 27.8L43.4 29.4L43.2 31.3L43.6 33.1L44.8 34.6L46.4 35.6L48.3 35.9L50.1 35.4L51.6 34.3L52.6 32.7ZM49.6 31.2L49.0 32.2L47.9 32.6L46.8 32.1L46.4 30.9L47.0 29.9L48.1 29.5L49.2 30.0ZM87.0 47.9L86.7 43.0L86.2 40.3L85.0 35.6L84.0 33.0L81.8 28.6L80.4 26.3L77.4 22.4L75.5 20.4L71.8 17.1L69.6 15.5L65.3 13.1L62.8 11.9L58.2 10.4L55.5 9.7L50.6 9.1L47.9 9.0L43.0 9.3L40.3 9.8L35.6 11.0L33.0 12.0L28.6 14.2L26.3 15.6L22.4 18.6L20.4 20.5L17.1 24.2L15.5 26.4L13.1 30.7L11.9 33.2L10.4 37.8L9.7 40.5L9.1 45.4L9.0 48.1L9.3 53.0L9.8 55.7L11.0 60.4L12.0 63.0L14.2 67.4L15.6 69.7L18.6 73.6L20.5 75.6L24.2 78.9L26.4 80.5L30.7 82.9L33.2 84.1L37.8 85.6L40.5 86.3L45.4 86.9L48.1 87.0L53.0 86.7L55.7 86.2L60.4 85.0L63.0 84.0L67.4 81.8L69.7 80.4L73.6 77.4L75.6 75.5L78.9 71.8L80.5 69.6L82.9 65.3L84.1 62.8L85.6 58.2L86.3 55.5L86.9 50.6ZM80.7 52.3L79.2 58.6L76.6 64.5L72.8 69.8L68.1 74.2L62.6 77.6L56.5 79.9L50.2 80.9L43.7 80.7L37.4 79.2L31.5 76.6L26.2 72.8L21.8 68.1L18.4 62.6L16.1 56.5L15.1 50.2L15.3 43.7L16.8 37.4L19.4 31.5L23.2 26.2L27.9 21.8L33.4 18.4L39.5 16.1L45.8 15.1L52.3 15.3L58.6 16.8L64.5 19.4L69.8 23.2L74.2 27.9L77.6 33.4L79.9 39.5L80.9 45.8ZM45.4 67.4L46.5 68.8L48.2 69.3L49.3 69.1L50.3 68.4L51.1 66.9L51.2 43.8L51.0 42.7L50.3 41.7L48.8 40.9L47.6 40.9L46.5 41.3L45.7 42.1L45.3 43.2L45.2 66.3Z"};
  window.customIcons = window.customIcons || {};
  if (!window.customIcons.batterijplan) window.customIcons.batterijplan = {
    getIcon: async (name) => { const v = BP_ICONS[name]; if (!v) return undefined; return Array.isArray(v) ? { path: v[0], secondaryPath: v[1], viewBox: "0 0 96 96" } : { path: v, viewBox: "0 0 96 96" }; },
    getIconList: async () => Object.keys(BP_ICONS).map((name) => ({ name })),
  };

  const IDS = {
    plan: "sensor.batterijplan",
    marks: "sensor.hbc_energy_prices_data",
    solar_today: "sensor.solcast_pv_forecast_forecast_today",
    solar_tomorrow: "sensor.solcast_pv_forecast_forecast_tomorrow",
  };
  const CAT = {
    o: { color: "#66bb6a", name: "ontladen voor het huis" },
    v: { color: "#ff9800", name: "vasthouden (Batterijplan stuurt bij)" },
    x: { color: "#b388ff", name: "overschot ontladen" },
    n: { color: "#3a4651", name: "gewoon — HBC laadt met zon (of doet niets)" },
    l: { color: "#9e9e9e", name: "laden van het net (goedkoop)" },
    H: { color: "#7d5a3c", name: "duur volgens HBC — nog niet ingepland" },
    L: { color: "#5f5f5f", name: "goedkoop volgens HBC" },
  };
  // uitleg bij elk kerncijfer (hover); de (i) in de titel klapt de uitleg van de hele kaart uit
  const TIP = {
    "In de batterij nu": "Bruikbare lading van alle batterijen samen: het laadpercentage boven de ondergrens van HBC, maal de capaciteit uit de instellingen.",
    "Ontladen in dure kwartieren": "Hoe lang de batterij tot het volgende goedkope moment aan het huis levert, in de duurste kwartieren die Batterijplan daarvoor kiest.",
    "Vasthouden voor later": "Dure kwartieren waarin de batterij bewust niet ontlaadt, omdat dezelfde lading later in een nog duurder kwartier meer oplevert.",
    "Overschot ontladen": "Lading die er tot het volgende goedkope moment te veel in zit. Batterijplan levert die nu al aan het huis, in plaats van met een volle batterij te gaan laden. Met de geschatte opbrengst.",
    "Kale prijs nu": "Inkoopprijs van stroom dit kwartier, zonder energiebelasting, opslag en btw.",
    "Gemiddelde kale prijs": "Gemiddelde inkoopprijs van die dag, zonder energiebelasting, opslag en btw.",
    "Laagste – hoogste": "Goedkoopste en duurste kwartier van die dag.",
    "Prijs nu (all-in)": "Prijs van stroom dit kwartier zoals HBC hem geeft: inclusief energiebelasting, opslag en btw.",
    "Gemiddelde prijs (all-in)": "Gemiddelde prijs van die dag zoals HBC hem geeft: inclusief energiebelasting, opslag en btw.",
    "Opgeleverd in deze periode": "Geschatte opbrengst bovenop wat HBC alleen had gedaan, opgeteld over de gekozen periode.",
  };
  // talen: Nederlands is de bron; Engels en Duits uit I18N (zie onderaan). Taal volgt het profiel in Home Assistant.
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
    "Alleen de momenten waarop Batterijplan iets anders doet dan HBC.": "Only the moments when Batterijplan does something different from HBC.",
    "Batterijplan rekent elke dag uit wat je huis op zon kan gebruiken (geleerd verbruik naast de zonverwachting) en vergelijkt het gemiddelde van de laatste 7 dagen met jouw instelling.": "Every day Batterijplan works out how much solar your house can use (learned consumption next to the solar forecast) and compares the average of the last 7 days with your setting.",
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
    "HBC doet het gewoon.": "HBC does its usual thing.",
    "HBC staat op": "HBC is set to",
    "Het blijft een schatting; je energierekening is het echte bewijs. Staat HBC niet op Dynamic, dan telt er niets bij.": "It remains an estimate; your energy bill is the real proof. If HBC is not on Dynamic, nothing is added.",
    "Het plan loopt tot het volgende goedkope moment": "The plan runs until the next cheap moment",
    "Hoe lang de batterij tot het volgende goedkope moment aan het huis levert, in de duurste kwartieren die Batterijplan daarvoor kiest.": "How long the battery supplies the house until the next cheap moment, in the most expensive quarters Batterijplan picks for it.",
    "Huisverbruik op zon (Solar reserved for house)": "House consumption on solar (Solar reserved for house)",
    "In HBC vul je in hoeveel zonne-energie je huis op een dag zelf direct opmaakt (Solar reserved for house).": "In HBC you enter how much solar energy your house uses directly itself on a day (Solar reserved for house).",
    "In de batterij nu": "In the battery now",
    "Ingesteld": "Set to",
    "Inkoopprijs van stroom dit kwartier, zonder energiebelasting, opslag en btw.": "Purchase price of electricity this quarter, without energy tax, supplier mark-up and VAT.",
    "Kale prijs nu": "Bare price now",
    "Kies de dag of periode met de datumkiezer erboven. Ga met de muis over de grafiek voor de cijfers per kwartier.": "Pick the day or period with the date picker above. Hover over the chart for the numbers per quarter.",
    "Kwartieren ontladen / vastgehouden / overschot": "Quarters discharged / held / surplus",
    "Laagste – hoogste": "Lowest – highest",
    "Lading die er tot het volgende goedkope moment te veel in zit. Batterijplan levert die nu al aan het huis, in plaats van met een volle batterij te gaan laden. Met de geschatte opbrengst.": "Charge that is more than needed until the next cheap moment. Batterijplan already supplies it to the house now, instead of going into charging with a full battery. With the estimated gain.",
    "Lading verschoven naar duurdere momenten": "Charge moved to more expensive moments",
    "Lege stukken in de balk: daar doet HBC het gewoon (laden met zon, of niets). De blauwe streep is nu.": "Empty parts of the bar: there HBC does its usual thing (charging on solar, or nothing). The blue line is now.",
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
    "Wat Batterijplan voor het volgende kwartier besluit:\n- **Ontladen**: de batterij levert aan het huis in een duur kwartier.\n- **Vasthouden**: de lading wordt bewaard voor een nog duurder moment.\n- **Overschot ontladen**: er zit meer in de batterij dan nodig is tot het volgende goedkope moment.\n- **Laden (HBC)** of **Zon laden (HBC)**: HBC doet het gewoon.": "What Batterijplan decides for the next quarter:\n- **Discharging**: the battery supplies the house in an expensive quarter.\n- **Holding**: the charge is kept for an even more expensive moment.\n- **Surplus discharging**: there is more in the battery than needed until the next cheap moment.\n- **Charging (HBC)** or **Solar charging (HBC)**: HBC simply does its own thing.",
    "Geen vermogenssensor gevonden. Typ de naam zelf.": "No power sensor found. Type the name yourself.",
    "Kies je sensor; rechts staat wat hij nu meldt.": "Pick your sensor; on the right is what it reports now.",
    "Afname is +, teruglevering is −. Kies de sensor die nu het netvermogen van je hele huis meldt.": "Import is +, export is −. Pick the sensor that reports the grid power of your whole house now.",
    "Kies de sensor met wat al je zonnepanelen samen nu opwekken.": "Pick the sensor with what all your solar panels together produce now.",
    "Kies het totaal van al je batterijen (ontladen is +). Bij HBC meestal: house total battery power.": "Pick the total of all your batteries (discharging is +). With HBC usually: house total battery power.",
    "Kies het laadvermogen van je auto-lader.": "Pick the charging power of your EV charger.",
    "uitstekend": "excellent",
    "extra marge": "extra margin"
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
    "Alleen de momenten waarop Batterijplan iets anders doet dan HBC.": "Nur die Momente, in denen Batterijplan etwas anderes tut als HBC.",
    "Batterijplan rekent elke dag uit wat je huis op zon kan gebruiken (geleerd verbruik naast de zonverwachting) en vergelijkt het gemiddelde van de laatste 7 dagen met jouw instelling.": "Batterijplan berechnet jeden Tag, wie viel Solarstrom dein Haus selbst nutzen kann (gelernter Verbrauch neben der Solarprognose), und vergleicht den Durchschnitt der letzten 7 Tage mit deiner Einstellung.",
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
    "HBC doet het gewoon.": "HBC macht das Übliche.",
    "HBC staat op": "HBC steht auf",
    "Het blijft een schatting; je energierekening is het echte bewijs. Staat HBC niet op Dynamic, dan telt er niets bij.": "Es bleibt eine Schätzung; deine Stromrechnung ist der echte Beweis. Steht HBC nicht auf Dynamic, wird nichts hinzugezählt.",
    "Het plan loopt tot het volgende goedkope moment": "Der Plan läuft bis zum nächsten günstigen Moment",
    "Hoe lang de batterij tot het volgende goedkope moment aan het huis levert, in de duurste kwartieren die Batterijplan daarvoor kiest.": "Wie lange die Batterie bis zum nächsten günstigen Moment das Haus versorgt, in den teuersten Viertelstunden, die Batterijplan dafür wählt.",
    "Huisverbruik op zon (Solar reserved for house)": "Hausverbrauch aus Solar (Solar reserved for house)",
    "In HBC vul je in hoeveel zonne-energie je huis op een dag zelf direct opmaakt (Solar reserved for house).": "In HBC trägst du ein, wie viel Solarstrom dein Haus an einem Tag selbst direkt verbraucht (Solar reserved for house).",
    "In de batterij nu": "In der Batterie jetzt",
    "Ingesteld": "Eingestellt",
    "Inkoopprijs van stroom dit kwartier, zonder energiebelasting, opslag en btw.": "Einkaufspreis für Strom in dieser Viertelstunde, ohne Energiesteuer, Aufschlag und MwSt.",
    "Kale prijs nu": "Börsenpreis jetzt",
    "Kies de dag of periode met de datumkiezer erboven. Ga met de muis over de grafiek voor de cijfers per kwartier.": "Wähle den Tag oder Zeitraum mit der Datumsauswahl darüber. Fahre mit der Maus über das Diagramm für die Zahlen pro Viertelstunde.",
    "Kwartieren ontladen / vastgehouden / overschot": "Viertelstunden entladen / gehalten / Überschuss",
    "Laagste – hoogste": "Niedrigster – höchster",
    "Lading die er tot het volgende goedkope moment te veel in zit. Batterijplan levert die nu al aan het huis, in plaats van met een volle batterij te gaan laden. Met de geschatte opbrengst.": "Ladung, die bis zum nächsten günstigen Moment zu viel ist. Batterijplan liefert sie jetzt schon ans Haus, statt mit voller Batterie ins Laden zu gehen. Mit dem geschätzten Ertrag.",
    "Lading verschoven naar duurdere momenten": "Ladung auf teurere Momente verschoben",
    "Lege stukken in de balk: daar doet HBC het gewoon (laden met zon, of niets). De blauwe streep is nu.": "Leere Stellen im Balken: dort macht HBC das Übliche (Laden mit Solar oder nichts). Der blaue Strich ist jetzt.",
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
    "Wat Batterijplan voor het volgende kwartier besluit:\n- **Ontladen**: de batterij levert aan het huis in een duur kwartier.\n- **Vasthouden**: de lading wordt bewaard voor een nog duurder moment.\n- **Overschot ontladen**: er zit meer in de batterij dan nodig is tot het volgende goedkope moment.\n- **Laden (HBC)** of **Zon laden (HBC)**: HBC doet het gewoon.": "Was Batterijplan für die nächste Viertelstunde entscheidet:\n- **Entladen**: die Batterie versorgt das Haus in einer teuren Viertelstunde.\n- **Halten**: die Ladung wird für einen noch teureren Moment aufbewahrt.\n- **Überschuss entladen**: es ist mehr in der Batterie als bis zum nächsten günstigen Moment nötig.\n- **Laden (HBC)** oder **Solarladen (HBC)**: HBC macht es einfach selbst.",
    "Geen vermogenssensor gevonden. Typ de naam zelf.": "Kein Leistungssensor gefunden. Gib den Namen selbst ein.",
    "Kies je sensor; rechts staat wat hij nu meldt.": "Wähle deinen Sensor; rechts steht, was er gerade meldet.",
    "Afname is +, teruglevering is −. Kies de sensor die nu het netvermogen van je hele huis meldt.": "Bezug ist +, Einspeisung ist −. Wähle den Sensor, der gerade die Netzleistung deines ganzen Hauses meldet.",
    "Kies de sensor met wat al je zonnepanelen samen nu opwekken.": "Wähle den Sensor mit dem, was alle deine Solarmodule zusammen gerade erzeugen.",
    "Kies het totaal van al je batterijen (ontladen is +). Bij HBC meestal: house total battery power.": "Wähle die Summe aller deiner Batterien (Entladen ist +). Bei HBC meist: house total battery power.",
    "Kies het laadvermogen van je auto-lader.": "Wähle die Ladeleistung deiner Wallbox.",
    "uitstekend": "ausgezeichnet",
    "extra marge": "zusätzliche Reserve"
   }
  };
  const t = (s) => (LANG !== "nl" && I18N[LANG] && I18N[LANG][s] != null ? I18N[LANG][s] : s);
  const zetTaal = (h) => {
    const l = String((h && ((h.locale && h.locale.language) || h.language)) || "nl").slice(0, 2).toLowerCase();
    LANG = l === "nl" || l === "de" ? l : "en"; DAG = DAGEN[LANG]; MAAND = MAANDEN[LANG];
  };
  const pad = (n) => String(n).padStart(2, "0");
  const hm = (d) => pad(d.getHours()) + ":" + pad(d.getMinutes());
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nl = (v, d) => (Number.isFinite(v) ? v.toLocaleString(LOC[LANG] || "nl-NL", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
  const allin = (pa) => (pa || {}).prijzen === "all-in";
  // money in the house style: more than 0 = "+ € x" green, exactly 0 = "€ 0,00" grey, less than 0 = "– € x" orange
  const geld = (v) => { const r = Math.round((Number(v) || 0) * 100) / 100;
    return r > 0 ? { txt: "+ € " + nl(r, 2), kleur: "#66bb6a" } : r < 0 ? { txt: "– € " + nl(-r, 2), kleur: "#ff9800" } : { txt: "€ " + nl(0, 2), kleur: "var(--secondary-text-color)" }; };
  const arr = (v) => { if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch (e) { return []; } };

  // Alle kwartieren van vandaag 00:00 tot het einde van de bekende prijzen, met wat de batterij doet.
  function quarters(hass) {
    const S = hass.states;
    const pa = (S[IDS.plan] || {}).attributes || {};
    const o = new Set(arr(pa.ontladen)), v = new Set(arr(pa.vasthouden)), ov = new Set(arr(pa.overschot));
    // starttijd van HBC kan een getal (ms) of tekst zijn; altijd omzetten naar ms
    const ms = (v) => (typeof v === "number" ? v : /^[0-9.]+$/.test(String(v)) ? Number(v) : Date.parse(v));
    const marks = (((S[IDS.marks] || {}).attributes || {}).marks || []).map((m) => Object.assign({}, m, { start: ms(m.start) })).filter((m) => Number.isFinite(m.start));
    // HBC niet op Dynamic: Batterijplan staat stil, geen plan tonen
    const stil = (S[IDS.plan] || {}).state === "HBC niet op Dynamic";
    const zon = new Map();
    [IDS.solar_today, IDS.solar_tomorrow].forEach((id) => (((S[id] || {}).attributes || {}).detailedForecast || []).forEach((f) => {
      zon.set(new Date(f.period_start).getTime(), Number(f.pv_estimate10) || 0);
    }));
    const dag0 = new Date(); dag0.setHours(0, 0, 0, 0);
    const nu = Math.floor(Date.now() / 900000) * 900000;
    const out = []; let gestart = false, einde = null;
    marks.filter((m) => m.start >= dag0.getTime() && m.start < dag0.getTime() + 2 * 86400000).forEach((m) => {
      const d = new Date(m.start), t = hm(d);
      if (m.start >= nu && einde === null) { if (m.mark !== "low") gestart = true; else if (gestart) einde = m.start; }
      let c;
      if (m.start < nu) c = "p";
      else if (einde === null || m.start === einde) {
        if (m.mark === "low") c = "l";
        else if (m.mark === "high") c = v.has(t) ? "v" : "o";
        else if (ov.has(t)) c = "x";
        else c = "n";
      } else c = m.mark === "low" ? "L" : m.mark === "high" ? "H" : "n";
      if (stil && c !== "p") c = "n";
      out.push({ t: m.start, c, p: Number(m.price), m: m.mark });
    });
    return { q: out, einde, nu, dag0: dag0.getTime(), pa, stil };
  }

  class BpBase extends HTMLElement {
    setConfig(c) { this._config = Object.assign({}, c || {}); if (this._hass) this._render(); }
    set hass(h) {
      this._hass = h;
      const oud = LANG; zetTaal(h); if (oud !== LANG) { this._key = null; if (this._card) { this._card.remove(); this._card = null; this.shadowRoot.innerHTML = ""; this._plot = null; } }
      const key = [IDS.plan, IDS.marks, IDS.solar_today].map((id) => (h.states[id] || {}).last_updated || "").join("|");
      if (key !== this._key) { this._key = key; this._render(); }
    }
    connectedCallback() { if (!this._tick) this._tick = setInterval(() => this._render(), 60000); }
    disconnectedCallback() { clearInterval(this._tick); this._tick = null; }
    getCardSize() { return 6; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }
    _shell() {
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
    // uitleg als venster (huisstijl): kop "Hoe lees je dit?" met ‹ Terug; sluiten ook met Esc of een klik ernaast
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
      this._chips.innerHTML = list.map((c) => "<div class='chip'" + (TIP[c.name] ? ' title="' + esc(t(TIP[c.name])) + '"' : "") + "><span class='v' style='color:" + c.color + "'>" + esc(c.value) +
        (c.unit ? "<span class='u'>" + esc(c.unit) + "</span>" : "") + "</span><span class='n'>" + esc(t(c.name)) + "</span></div>").join("");
    }
    _legend(keys) {
      return "<div class='leg'>" + keys.map((k) => "<span><span class='dot' style='background:" + CAT[k].color + "'></span>" + esc(t(CAT[k].name)) + "</span>").join("") + "</div>";
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Plan vandaag en morgen
  class BpPlan extends BpBase {
    static getStubConfig() { return { title: "Plan vandaag en morgen", icon: "batterijplan:kalender-klok" }; }
    _render() {
      if (!this._hass) return;
      this._shell();
      const { q, einde, nu, dag0, pa, stil } = quarters(this._hass);
      if (stil) {
        this._setChips([
          { value: nl(Number(pa.lading_kwh), 2), unit: "kWh", name: "In de batterij nu", color: "#06B6D4" },
          { value: "—", name: "Ontladen in dure kwartieren", color: CAT.o.color },
          { value: "—", name: "Vasthouden voor later", color: CAT.v.color },
          { value: "—", name: "Overschot ontladen", color: CAT.x.color },
        ]);
        this._body.innerHTML = "<div style='font-size:14px;margin-top:12px;line-height:1.5'><b>" + t("Batterijplan staat stil") + "</b>: " + t("HBC staat op") + " <b>" + esc(pa.hbc_strategie || t("een andere strategie")) +
          "</b>.<br><span style='color:var(--secondary-text-color)'>" + t("Batterijplan stuurt alleen bij als HBC op Dynamic staat en telt in de tussentijd niets op. Het leren van je verbruik gaat gewoon door.") + "</span></div>";
        return;
      }
      this._setUitleg("<p><b>" + t("Wat zie je?") + "</b> " + t("Alleen de momenten waarop Batterijplan iets anders doet dan HBC.") + " " +
        "<font color='" + CAT.o.color + "'>" + t("Groen") + "</font> = " + t("ontladen in een duur kwartier") + ", <font color='" + CAT.v.color + "'>" + t("oranje") + "</font> = " + t("lading vasthouden voor een later, duurder kwartier") + ", " +
        "<font color='" + CAT.x.color + "'>" + t("paars") + "</font> = " + t("overschot ontladen") + ".</p>" +
        "<p>" + t("Lege stukken in de balk: daar doet HBC het gewoon (laden met zon, of niets). De blauwe streep is nu.") + "</p>" +
        "<p>" + t("Het plan loopt tot het volgende goedkope moment") + (einde ? " (" + DAG[new Date(einde).getDay()] + " " + hm(new Date(einde)) + ")" : "") +
        ". " + t("Daar laadt HBC weer bij en maakt Batterijplan een nieuw plan. Ga met de muis over een cijfer voor meer uitleg.") + "</p>");
      // alleen wat Batterijplan zelf doet: lading nu, ontladen, vasthouden, overschot ontladen
      const komend = q.filter((x) => x.t >= nu && (einde === null || x.t <= einde));
      const duur = (k) => { const n = komend.filter((x) => x.c === k).length; return n ? Math.floor(n / 4) + ":" + pad((n % 4) * 15) : "—"; };
      this._setChips([
        { value: nl(Number(pa.lading_kwh), 2), unit: "kWh", name: "In de batterij nu", color: "#06B6D4" },
        { value: duur("o"), unit: duur("o") === "—" ? "" : t("u"), name: "Ontladen in dure kwartieren", color: CAT.o.color },
        { value: duur("v"), unit: duur("v") === "—" ? "" : t("u"), name: "Vasthouden voor later", color: CAT.v.color },
        { value: Number(pa.overschot_kwh) > 0 ? nl(Number(pa.overschot_kwh), 2) : "—", unit: Number(pa.overschot_kwh) > 0 ? "kWh" : "", name: "Overschot ontladen", color: CAT.x.color },
      ]);
      const row = (dag, label) => {
        const van = dag0 + dag * 86400000, tot2 = van + 86400000;
        const dq = q.filter((x) => x.t >= van && x.t < tot2);
        if (!dq.length) return "";
        let segs = "", run = null;
        const flush = () => {
          if (!run || "ovx".indexOf(run.c) < 0) return;
          const l = (run.a - van) / 86400000 * 100, w = (run.b + 900000 - run.a) / 86400000 * 100;
          const kleur = CAT[run.c].color;
          segs += "<div title='" + hm(new Date(run.a)) + "–" + hm(new Date(run.b + 900000)) + " · " + esc(t(CAT[run.c].name)) +
            "' style='position:absolute;top:0;bottom:0;left:" + l + "%;width:calc(" + w + "% - 1px);background:" + kleur + ";border-radius:2px'></div>";
        };
        dq.forEach((x) => { if (run && run.c === x.c && x.t === run.b + 900000) run.b = x.t; else { flush(); run = { a: x.t, b: x.t, c: x.c }; } });
        flush();
        const nuMark = dag === 0 ? "<div style='position:absolute;top:-4px;bottom:-4px;left:" + ((Date.now() - van) / 86400000 * 100) + "%;width:2px;background:#009ac7;border-radius:1px'></div>" : "";
        const d = new Date(van);
        return "<div style='display:flex;gap:8px;margin-top:12px;align-items:center'><div style='flex:0 0 72px;font-weight:700;font-size:13px'>" +
          label + " <span style='font-weight:400;color:var(--secondary-text-color)'>" + DAG[d.getDay()] + "</span></div>" +
          "<div style='flex:1 1 auto;position:relative;height:16px;background:rgba(255,255,255,0.04);border-radius:3px'>" + segs + nuMark + "</div></div>";
      };
      let ticks = "";
      for (let h = 0; h <= 24; h += 3) ticks += "<span style='position:absolute;left:" + (h / 24 * 100) + "%;transform:translateX(-50%)'>" + pad(h % 24) + ":00</span>";
      const axis = "<div style='display:flex;gap:8px;margin-top:4px'><div style='flex:0 0 72px'></div><div style='flex:1 1 auto;position:relative;height:12px;font-size:10px;color:var(--secondary-text-color)'>" + ticks + "</div></div>";
      // blokken vanaf nu tot het einde van het plan
      const blokken = []; q.filter((x) => x.t >= nu && (einde === null || x.t <= einde)).forEach((x) => {
        const b = blokken[blokken.length - 1];
        if (b && b.c === x.c && x.t === b.b + 900000) b.b = x.t; else blokken.push({ a: x.t, b: x.t, c: x.c });
      });
      const rijen = blokken.filter((b) => "ovx".indexOf(b.c) >= 0).map((b) => "<tr><td><span class='dot' style='background:" + CAT[b.c].color + "'></span></td><td>" +
        DAG[new Date(b.a).getDay()] + " " + hm(new Date(b.a)) + "–" + hm(new Date(b.b + 900000)) + "</td><td>" + esc(t(CAT[b.c].name)) +
        (b.c === "x" ? " · ± " + nl(Number(pa.overschot_kwh), 2) + " kWh, ± € " + nl(Number(pa.overschot_eur), 2) : "") + "</td></tr>").join("");
      const tot = einde ? DAG[new Date(einde).getDay()] + " " + hm(new Date(einde)) : "";
      this._body.innerHTML = row(0, t("Vandaag")) + row(1, t("Morgen")) + axis +
        this._legend(["o", "v", "x"]) +
        (rijen ? "<table>" + rijen + "</table>" :
          "<div style='font-size:13px;margin-top:10px;color:var(--secondary-text-color)'>" + t("Niets bij te sturen") + (tot ? " " + t("tot") + " " + tot : "") + ": " + t("HBC doet het gewoon.") + "</div>");
    }
  }

  const nice = (span, target) => { const raw = span / target, p = Math.pow(10, Math.floor(Math.log10(raw || 1))), f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };
  const DAGMS = 86400000, KW = 900000;
  const dagStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  // besluit van sensor.batterijplan terugvertalen naar een kleur (voor kwartieren die al voorbij zijn)
  const BESLUIT = { "Ontladen": "o", "Vasthouden": "v", "Overschot ontladen": "x", "Laden (HBC)": "l", "Zon laden (HBC)": "n" };
  // waarde uit een geschiedenis-reeks [[ms, waarde], ...] op moment t (laatste waarde ervoor)
  const opMoment = (reeks, t) => { let v = null; for (const p of reeks) { if (p[0] <= t) v = p[1]; else break; } return v; };

  // Grafiek: volgt de datumkiezer (energy-date-selection) als die op het dashboard staat.
  //   dag          prijs per kwartier (lijn), gekleurde vlakken voor wat de batterij doet (voorbij = wat er gebeurde,
  //                vanaf nu = het plan) en de lading in kWh (rechter as)
  //   week / maand per dag een staaf: wat Batterijplan opleverde bovenop HBC
  class BpGrafiek extends BpBase {
    static getStubConfig() { return { title: "Prijs en batterij", icon: "batterijplan:euro-klok" }; }
    connectedCallback() { super.connectedCallback(); this._koppel(0); }
    disconnectedCallback() { super.disconnectedCallback(); if (this._unsub) { this._unsub(); this._unsub = null; } clearTimeout(this._koppelT); }
    _koppel(n) {
      if (this._unsub || !this.isConnected) return;
      // HA bewaart de datumkiezer per dashboard als connection["_energy_<dashboard>"] (of "_" + collection_key)
      const con = this._hass && this._hass.connection, dash = location.pathname.split("/")[1];
      const sleutel = this._config.collection_key ? "_" + this._config.collection_key :
        (con && con["_energy_" + dash] ? "_energy_" + dash : Object.keys(con || {}).find((k) => k.indexOf("_energy") === 0));
      const coll = con && sleutel && con[sleutel];
      if (coll && coll.subscribe) {
        this._unsub = coll.subscribe((d) => { this._periode = { start: +new Date(d.start), end: d.end ? +new Date(d.end) : null }; this._key = null; this._render(); });
        if (coll.start && !this._periode) this._periode = { start: +new Date(coll.start), end: coll.end ? +new Date(coll.end) : null };
        return;
      }
      if (n < 20) this._koppelT = setTimeout(() => this._koppel(n + 1), 500);
    }
    // De datumkiezer van HA in de titelregel van de grafiek, zodat er geen aparte balk boven nodig is.
    async _datumkiezer() {
      if (this._dk && this._dk !== true && !this._dk.isConnected) this._dk = null;
      if (this._dk) { if (this._dk !== true) this._dk.hass = this._hass; return; }
      this._dk = true;
      const dash = location.pathname.split("/")[1];
      const helpers = await window.loadCardHelpers();
      const el = helpers.createCardElement({ type: "energy-date-selection", collection_key: this._config.collection_key || "energy_" + dash });
      el.style.cssText = "flex:1;min-width:0;margin:-10px 0;--ha-card-background:transparent;--ha-card-border-width:0;--ha-card-box-shadow:none;--ha-card-border-color:transparent";
      el.hass = this._hass;
      const titel = this.shadowRoot.querySelector(".title"); titel.appendChild(el);
      this._dk = el;
      if (!this._unsub) { clearTimeout(this._koppelT); this._koppel(0); }
      // datum en knoppen samen rechts zetten (de kiezer zet ze standaard uit elkaar)
      const zoek = (r, d) => { if (!r || d > 6) return null; const x = r.querySelector("hui-energy-period-selector"); if (x) return x;
        for (const e of r.querySelectorAll("*")) if (e.shadowRoot) { const y = zoek(e.shadowRoot, d + 1); if (y) return y; } return null; };
      for (let i = 0; i < 40; i++) {
        const ps = zoek(el.shadowRoot, 0);
        if (ps && ps.shadowRoot && ps.shadowRoot.querySelector(".content")) {
          if (!ps.shadowRoot.querySelector("style[data-bp]")) { const st = document.createElement("style"); st.dataset.bp = "1";
            st.textContent = ".content{justify-content:flex-end!important;gap:4px}.date-range{flex:0 1 auto!important}"; ps.shadowRoot.appendChild(st); }
          break;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    _ids() {
      // prijs terug in de tijd: eigen sensor van Batterijplan (ct/kWh, zoals HBC hem geeft), of een eigen prijssensor (price_entity, standaard in €/kWh)
      return { prijs: this._config.price_entity || "sensor.batterijplan_prijs", lading: "sensor.batterijplan_lading", meerwaarde: "sensor.batterijplan_meerwaarde" };
    }
    _render() {
      if (!this._hass) return;
      this._shell();
      if (!this._plot) {
        this._body.innerHTML = "<div class='plot'></div><div class='tip'></div>";
        this._plot = this._body.querySelector(".plot"); this._tip = this._body.querySelector(".tip");
        this._plot.addEventListener("mousemove", (e) => this._hover(e));
        this._plot.addEventListener("mouseleave", () => { this._tip.style.display = "none"; });
        if (window.ResizeObserver) { this._ro = new ResizeObserver(() => this._draw()); this._ro.observe(this._body); }
      }
      if (this._config.datumkiezer) this._datumkiezer();
      if (!this._unsub) this._koppel(20);
      this._setUitleg("<p><b>" + t("Per dag:") + "</b> " + t("de grijze lijn is de kale stroomprijs per kwartier. De gekleurde vlakken zijn de kwartieren waarin Batterijplan bijstuurt (zelfde kleuren als het plan).") + " " +
        t("De blauwe lijn is de lading in kWh (as rechts): doorgetrokken = gemeten, gestreept = verwacht volgens het plan. Links van Nu is voorbij en iets gedempt.") + "</p>" +
        "<p><b>" + t("Per week of maand:") + "</b> " + t("een groene staaf per dag met wat Batterijplan geschat opleverde bovenop HBC alleen.") + "</p>" +
        "<p>" + t("Kies de dag of periode met de datumkiezer erboven. Ga met de muis over de grafiek voor de cijfers per kwartier.") + "</p>");
      const vandaag = dagStart(Date.now());
      const p = this._periode || { start: vandaag, end: vandaag + DAGMS - 1 };
      const span = (p.end || p.start + DAGMS - 1) - p.start;
      this._modus = span > 1.5 * DAGMS ? "periode" : "dag";
      if (this._modus === "periode") { this._laadPeriode(p); return; }
      this._dag = dagStart(p.start);
      this._laadDag(this._dag);
    }

    // ---------------- dag ----------------
    _laadDag(dag) {
      const nu = Math.floor(Date.now() / KW) * KW;
      const key = dag + "|" + (dag <= nu ? Math.floor(Date.now() / KW) : "toekomst");
      if (this._histKey !== key && dag <= nu) {
        this._histKey = key;
        const ids = this._ids();
        const eind = Math.min(Date.now(), dag + DAGMS);
        this._hass.callWS({ type: "history/history_during_period", start_time: new Date(dag).toISOString(), end_time: new Date(eind).toISOString(),
          entity_ids: [ids.prijs, IDS.plan, ids.lading], minimal_response: true, no_attributes: true })
          .then((h) => {
            const reeks = (id, f) => (h[id] || []).map((x) => [Math.round((x.lu || x.last_updated || 0) * 1000), f(x.s)]).sort((a, b) => a[0] - b[0]);
            this._hist = { dag, prijs: reeks(ids.prijs, (s) => (isFinite(parseFloat(s)) ? parseFloat(s) * (this._config.price_entity ? (this._config.price_factor || 100) : 1) : null)),
              besluit: reeks(IDS.plan, (s) => s), lading: reeks(ids.lading, (s) => (isFinite(parseFloat(s)) ? parseFloat(s) : null)) };
            if (this._modus === "dag" && this._dag === dag) this._bouwDag();
            // nog geen geschiedenis van de lading-sensor (bijv. niet in de recorder): lees de lading uit het plan zelf
            if (!this._hist.lading.length) {
              return this._hass.callWS({ type: "history/history_during_period", start_time: new Date(dag).toISOString(), end_time: new Date(eind).toISOString(),
                entity_ids: [IDS.plan], minimal_response: false, no_attributes: false, significant_changes_only: false })
                .then((h2) => {
                  const l = (h2[IDS.plan] || []).map((x) => [Math.round((x.lu || 0) * 1000), (x.a || x.attributes || {}).lading_kwh])
                    .filter((p) => p[0] && p[1] != null && p[1] !== "" && Number.isFinite(Number(p[1]))).map((p) => [p[0], Number(p[1])]).sort((p, q) => p[0] - q[0]);
                  if (l.length && this._hist && this._hist.dag === dag) { this._hist.lading = l; if (this._modus === "dag" && this._dag === dag) this._bouwDag(); }
                });
            }
          })
          .catch(() => { this._hist = { dag, prijs: [], besluit: [], lading: [] }; this._bouwDag(); });
      }
      if (dag > nu) this._hist = { dag, prijs: [], besluit: [], lading: [] };
      this._bouwDag();
    }
    _bouwDag() {
      const dag = this._dag, nu = Math.floor(Date.now() / KW) * KW, vandaag = dagStart(Date.now());
      const live = quarters(this._hass);
      const hist = this._hist && this._hist.dag === dag ? this._hist : { prijs: [], besluit: [], lading: [] };
      const sun = ((this._hass.states["sun.sun"] || {}).attributes) || {};
      const uur = (iso, d) => { const t = new Date(iso); return isNaN(t) ? d : t.getHours() + t.getMinutes() / 60; };
      const op = uur(sun.next_rising, 7.5), onder = uur(sun.next_setting, 17.5);
      const eindLive = live.q.length ? live.q[live.q.length - 1].t + KW : 0;
      const x0 = dag, x1 = dag === vandaag ? Math.max(dag + DAGMS, eindLive) : dag + DAGMS;
      const perT = new Map(live.q.map((x) => [x.t, x]));
      const q = [];
      for (let t = x0; t < x1; t += KW) {
        if (t < nu) {
          const p = opMoment(hist.prijs, t + 1) != null ? opMoment(hist.prijs, t + 1) : (perT.get(t) || {}).p;
          const b = opMoment(hist.besluit, t + KW / 2);
          let c = BESLUIT[b] || null;
          if (c === "z") { const h = new Date(t).getHours() + new Date(t).getMinutes() / 60; if (h < op || h >= onder) c = "r"; }
          if (p != null) q.push({ t, p, c, voorbij: true });
        } else if (perT.has(t)) q.push(Object.assign({}, perT.get(t), { voorbij: false }));
      }
      // lading: wat er was (geschiedenis) en daarna het verwachte verloop van het plan
      let ld = hist.lading.filter((p) => p[1] != null && p[0] < nu + KW).map((p) => [Math.max(p[0], x0), p[1]]);
      if (ld.length) ld.push([Math.min(Date.now(), x1), ld[ld.length - 1][1]]);
      const vl = !live.stil && dag <= vandaag && vandaag < dag + DAGMS ? arr((this._hass.states[IDS.plan] || {}).attributes.verloop).map((p) => [p[0] * 1000, Number(p[1])]) : [];
      // ter vergelijking: hoe de lading zou lopen als HBC het alleen deed (optie vergelijk: true)
      const vh = this._config.vergelijk && vl.length ? arr((this._hass.states[IDS.plan] || {}).attributes.verloop_hbc).map((p) => [p[0] * 1000, Number(p[1])]) : [];
      // extra t.o.v. HBC alleen tot het volgende goedkope moment: slimmer verdelen over dure kwartieren + overschot ontladen
      const extra = (Number(live.pa.meerwaarde_segment_eur) || 0) + (Number(live.pa.overschot_eur) || 0);
      this._data = { modus: "dag", q, x0, x1, nu, ld, vl, vh, pa: live.pa, vandaag: dag === vandaag };
      const cur = q.find((x) => x.t === nu);
      const prijzen = q.map((x) => x.p);
      if (this._data.vandaag) {
        this._setChips([
          { value: cur ? nl(cur.p, 1) : "—", unit: "ct", name: allin(live.pa) ? "Prijs nu (all-in)" : "Kale prijs nu", color: "#cbd5e1" },
          ...(vh.length > 1 ? [{ value: geld(extra).txt, name: "Extra t.o.v. HBC alleen", color: geld(extra).kleur }] : []),
          { value: nl(Number(live.pa.lading_kwh), 2), unit: "kWh", name: "In de batterij nu", color: "#06B6D4" },
        ]);
      } else {
        const d = new Date(dag);
        this._setChips([
          { value: prijzen.length ? nl(prijzen.reduce((a, b) => a + b, 0) / prijzen.length, 1) : "—", unit: "ct", name: allin(live.pa) ? "Gemiddelde prijs (all-in)" : "Gemiddelde kale prijs", color: "#cbd5e1" },
          { value: prijzen.length ? nl(Math.min(...prijzen), 0) + " – " + nl(Math.max(...prijzen), 0) : "—", unit: "ct", name: "Laagste – hoogste", color: "#cbd5e1" },
          { value: DAG[d.getDay()] + " " + d.getDate() + " " + MAAND[d.getMonth()], name: dag < vandaag ? t("Wat er gebeurde") : t("Plan"), color: "var(--primary-text-color)" },
        ]);
      }
      this._draw();
    }

    // ---------------- week / maand ----------------
    _laadPeriode(p) {
      const eind = p.end || Date.now();
      const per = eind - p.start > 70 * DAGMS ? "month" : "day";
      const key = p.start + "|" + eind + "|" + per + "|" + Math.floor(Date.now() / KW);
      if (this._perKey === key && this._data && this._data.modus === "periode") { this._draw(); return; }
      this._perKey = key;
      this._hass.callWS({ type: "recorder/statistics_during_period", start_time: new Date(p.start).toISOString(), end_time: new Date(eind).toISOString(),
        statistic_ids: [this._ids().meerwaarde], period: per, types: ["change"] })
        .then((r) => {
          const rows = (r[this._ids().meerwaarde] || []).map((x) => ({ t: +new Date(x.start), v: Number(x.change) || 0 }));
          this._data = { modus: "periode", per, rows, x0: p.start, x1: eind };
          const tot = rows.reduce((a, b) => a + b.v, 0), beste = rows.reduce((a, b) => (b.v > a.v ? b : a), { v: 0, t: null });
          const n = rows.length || 1;
          this._setChips([
            { value: geld(tot).txt, name: "Opgeleverd in deze periode", color: geld(tot).kleur },
            { value: "€ " + nl(tot / n, 2), name: per === "month" ? t("Gemiddeld per maand") : t("Gemiddeld per dag"), color: "var(--primary-text-color)" },
            { value: beste.t ? "€ " + nl(beste.v, 2) : "—", name: beste.t ? (per === "month" ? t("Beste maand:") + " " + MAAND[new Date(beste.t).getMonth()] : t("Beste dag:") + " " + DAG[new Date(beste.t).getDay()] + " " + new Date(beste.t).getDate() + " " + MAAND[new Date(beste.t).getMonth()]) : t("Beste dag"), color: "#66bb6a" },
          ]);
          this._draw();
        })
        .catch(() => { this._data = { modus: "periode", per, rows: [], x0: p.start, x1: eind }; this._draw(); });
    }

    _draw() {
      if (!this._data || !this._plot) return;
      if (this._data.modus === "periode") return this._drawPeriode();
      const W = Math.max(this._body.clientWidth - 32, 260), H = this._config.height || 300;
      const L = 40, R = 40, T = 24, B = 34, iw = W - L - R, ih = H - T - B;
      const { q, x0, x1, nu, ld, vl } = this._data, vh = this._data.vh || [];
      if (!q.length) { this._plot.innerHTML = "<div style='padding:12px;color:var(--secondary-text-color)'>" + t("Voor deze dag zijn (nog) geen prijzen bekend.") + "</div>"; this._geo = null; return; }
      let lo = Math.min(0, ...q.map((x) => x.p)), hi = Math.max(...q.map((x) => x.p)); const st = nice(hi - lo, 5); lo = Math.floor(lo / st) * st; hi = Math.ceil(hi / st) * st;
      const cap = Math.max(1, ...ld.map((p) => p[1]), ...vl.map((p) => p[1]), ...vh.map((p) => p[1])); const st2 = nice(cap, 4), hi2 = Math.ceil(cap / st2) * st2;
      const X = (t) => L + (t - x0) / (x1 - x0) * iw, Y = (v) => T + (hi - v) / (hi - lo) * ih, Y2 = (v) => T + (hi2 - v) / hi2 * ih, base = Y(Math.max(lo, 0));
      let g = "";
      for (let v = lo; v <= hi + st / 2; v += st) g += "<line x1='" + L + "' x2='" + (W - R) + "' y1='" + Y(v) + "' y2='" + Y(v) + "' stroke='var(--divider-color)' stroke-dasharray='2,2'/><text x='" + (L - 6) + "' y='" + (Y(v) + 3) + "' text-anchor='end' font-size='10' fill='var(--secondary-text-color)'>" + Math.round(v) + "</text>";
      const metLading = ld.length > 1 || vl.length > 1;
      if (metLading) for (let v = 0; v <= hi2 + st2 / 2; v += st2) g += "<text x='" + (W - R + 6) + "' y='" + (Y2(v) + 3) + "' font-size='10' fill='#06B6D4'>" + nl(v, Number.isInteger(v) ? 0 : Math.round(v * 10) === v * 10 ? 1 : 2) + "</text>";
      g += "<text x='" + (L - 6) + "' y='" + (T - 10) + "' text-anchor='end' font-size='10' fill='var(--secondary-text-color)'>ct</text>" + (metLading ? "<text x='" + (W - R + 6) + "' y='" + (T - 10) + "' font-size='10' fill='#06B6D4'>kWh</text>" : "");
      const stap = (x1 - x0) > 1.5 * DAGMS ? 3 : 2;
      for (let t = x0; t <= x1; t += stap * 3600000) { const x = X(t), d = new Date(t); g += "<line x1='" + x + "' x2='" + x + "' y1='" + T + "' y2='" + (T + ih) + "' stroke='var(--divider-color)' stroke-dasharray='2,2'/>" + (x < W - 20 ? "<text x='" + x + "' y='" + (T + ih + 14) + "' text-anchor='middle' font-size='10' fill='var(--secondary-text-color)'>" + hm(d) + "</text>" : ""); if (d.getHours() === 0 && t > x0) g += "<text x='" + x + "' y='" + (T + ih + 27) + "' text-anchor='middle' font-size='10' font-weight='700' fill='var(--secondary-text-color)'>" + DAG[d.getDay()] + "</text>"; }
      let body = "";
      q.forEach((x) => { if (!x.c || x.c === "p" || "ovx".indexOf(x.c) < 0) return; const xa = X(x.t), xb = X(x.t + KW), y = Y(x.p);
        body += "<rect x='" + xa + "' y='" + Math.min(y, base) + "' width='" + Math.max(xb - xa - 0.5, 0.5) + "' height='" + Math.abs(base - y) + "' fill='" + CAT[x.c].color + "' fill-opacity='" + (/[HL]/.test(x.c) ? 0.45 : 0.75) + "'/>"; });
      let path = ""; q.forEach((x, i) => { const xa = X(x.t), xb = X(x.t + KW), y = Y(x.p); path += (i && q[i - 1].t === x.t - KW ? "L" : "M") + xa + "," + y + "L" + xb + "," + y; });
      body += "<path d='" + path + "' fill='none' stroke='#cbd5e1' stroke-width='1.5'/>";
      const xnu = Math.min(Math.max(X(nu), L), L + iw);
      if (xnu > L) body += "<rect x='" + L + "' y='" + T + "' width='" + (xnu - L) + "' height='" + ih + "' fill='var(--card-background-color,#1c1c1c)' fill-opacity='0.35'/>";
      // lading: wat er was (ononderbroken lijn) en het plan (lijn met vlak)
      const lijn = (pts, vlak, streep) => {
        if (pts.length < 2) return "";
        const d = pts.map((p) => X(p[0]) + "," + Y2(p[1])).join("L");
        return (vlak ? "<path d='M" + X(pts[0][0]) + "," + Y2(0) + "L" + d + "L" + X(pts[pts.length - 1][0]) + "," + Y2(0) + "Z' fill='#06B6D4' fill-opacity='0.18'/>" : "") +
          "<path d='M" + d + "' fill='none' stroke='#06B6D4' stroke-width='2'" + (streep ? " stroke-dasharray='4,3'" : "") + "/>";
      };
      const trap = []; ld.forEach((p, i) => { if (i) trap.push([p[0], ld[i - 1][1]]); trap.push(p); });
      body += lijn(trap.filter((p) => p[0] >= x0 && p[0] <= x1), true, false);
      // verwacht verloop (gestreept): na het einde van het plan 45 minuten laten uitdoven in plaats van abrupt te stoppen
      const vlz = vl.filter((p) => p[0] <= x1);
      if (vlz.length > 1) {
        const a = vlz[0][0], e = vlz[vlz.length - 1][0], uit = Math.min(e + 2700000, x1);
        const pts = uit > e ? vlz.concat([[uit, vlz[vlz.length - 1][1]]]) : vlz;
        const xa = X(a), xe = X(e), xu = X(uit), off = xu > xa ? (xe - xa) / (xu - xa) : 1;
        body += "<defs><linearGradient id='bpuit' gradientUnits='userSpaceOnUse' x1='" + xa + "' x2='" + xu + "' y1='0' y2='0'>" +
          "<stop offset='0' stop-color='#06B6D4' stop-opacity='1'/><stop offset='" + off + "' stop-color='#06B6D4' stop-opacity='1'/>" +
          "<stop offset='1' stop-color='#06B6D4' stop-opacity='0'/></linearGradient></defs>";
        const d = pts.map((p) => X(p[0]) + "," + Y2(p[1])).join("L");
        body += "<path d='M" + xa + "," + Y2(0) + "L" + d + "L" + xu + "," + Y2(0) + "Z' fill='url(#bpuit)' fill-opacity='0.18'/>" +
          "<path d='M" + d + "' fill='none' stroke='url(#bpuit)' stroke-width='2' stroke-dasharray='4,3'/>";
      }
      // ter vergelijking: lading als HBC het alleen deed (rode stippellijn)
      const vhz = vh.filter((p) => p[0] <= x1);
      if (vhz.length > 1) body += "<path d='M" + vhz.map((p) => X(p[0]) + "," + Y2(p[1])).join("L") + "' fill='none' stroke='#ef9a9a' stroke-width='1.5' stroke-dasharray='2,3'/>";
      if (Date.now() >= x0 && Date.now() <= x1) {
        const xn = X(Date.now());
        body += "<line x1='" + xn + "' x2='" + xn + "' y1='" + T + "' y2='" + (T + ih) + "' stroke='#009ac7' stroke-width='1.5'/><rect x='" + (xn - 15) + "' y='" + T + "' width='30' height='14' rx='2' fill='#009ac7'/><text x='" + xn + "' y='" + (T + 10.5) + "' text-anchor='middle' font-size='10' fill='#fff'>" + t("Nu") + "</text>";
      }
      this._geo = { L, iw, x0, x1 };
      this._plot.innerHTML = "<svg width='" + W + "' height='" + H + "' style='display:block;font-family:inherit'>" + g + body + "</svg>" +
        this._legend(["o", "v", "x"]).replace("<div class='leg'>", "<div class='leg'><span><span class='dot' style='background:#cbd5e1'></span>" + t(allin(this._data.pa) ? "prijs all-in (ct)" : "kale prijs (ct)") + "</span><span><span class='dot' style='background:#06B6D4'></span>" + t("lading (kWh): doorgetrokken = gemeten, gestreept = verwacht volgens plan") + "</span>" +
          (vhz.length > 1 ? "<span><span class='dot' style='background:#ef9a9a'></span>" + t("lading als HBC het alleen deed") + "</span>" : ""));
    }
    _drawPeriode() {
      const W = Math.max(this._body.clientWidth - 32, 260), H = this._config.height || 300;
      const L = 44, R = 12, T = 12, B = 34, iw = W - L - R, ih = H - T - B;
      const { rows, per } = this._data;
      if (!rows.length) { this._plot.innerHTML = "<div style='padding:12px;color:var(--secondary-text-color)'>" + t("Voor deze periode is nog niets opgeteld. Batterijplan telt vanaf de eerste dag dat het draait.") + "</div>"; this._geo = null; return; }
      const hi0 = Math.max(0.01, ...rows.map((r) => r.v)), lo0 = Math.min(0, ...rows.map((r) => r.v));
      const st = nice(hi0 - lo0, 4), hi = Math.ceil(hi0 / st) * st, lo = Math.floor(lo0 / st) * st;
      const Y = (v) => T + (hi - v) / (hi - lo) * ih;
      // vaste vakken: alle dagen (of maanden) van de gekozen periode, ook als er (nog) niets is
      const vakken = []; const d = new Date(this._data.x0); d.setHours(0, 0, 0, 0); if (per === "month") d.setDate(1);
      while (d.getTime() < this._data.x1 && vakken.length < 400) { vakken.push(d.getTime()); if (per === "month") d.setMonth(d.getMonth() + 1); else d.setDate(d.getDate() + 1); }
      const bw = iw / Math.max(vakken.length, 1), map = new Map(rows.map((r) => [dagStart(r.t), r.v]));
      let g = "";
      for (let v = lo; v <= hi + st / 2; v += st) g += "<line x1='" + L + "' x2='" + (W - R) + "' y1='" + Y(v) + "' y2='" + Y(v) + "' stroke='var(--divider-color)' stroke-dasharray='2,2'/><text x='" + (L - 6) + "' y='" + (Y(v) + 3) + "' text-anchor='end' font-size='10' fill='var(--secondary-text-color)'>" + nl(v, st < 0.1 ? 2 : 1) + "</text>";
      g += "<text x='" + (L - 6) + "' y='" + (T - 2) + "' text-anchor='end' font-size='10' fill='var(--secondary-text-color)'>€</text>";
      const elke = vakken.length > 16 ? 4 : 1;
      vakken.forEach((t, i) => {
        const v = map.get(t), x = L + i * bw, dt = new Date(t);
        if (v != null) g += "<rect x='" + (x + bw * 0.15) + "' y='" + Math.min(Y(v), Y(0)) + "' width='" + Math.max(bw * 0.7, 1) + "' height='" + Math.max(Math.abs(Y(0) - Y(v)), 1) + "' rx='2' fill='#66bb6a' fill-opacity='0.8'/>";
        if (i % elke === 0) g += "<text x='" + (x + bw / 2) + "' y='" + (T + ih + 14) + "' text-anchor='middle' font-size='10' fill='var(--secondary-text-color)'>" + (per === "month" ? MAAND[dt.getMonth()] : (vakken.length <= 7 ? DAG[dt.getDay()] + " " : "") + dt.getDate()) + "</text>";
      });
      this._geo = { periode: true, L, bw, vakken, map, per };
      this._plot.innerHTML = "<svg width='" + W + "' height='" + H + "' style='display:block;font-family:inherit'>" + g + "</svg>" +
        "<div class='leg'><span><span class='dot' style='background:#66bb6a'></span>" + t(per === "month" ? "opgeleverd bovenop HBC (geschat, € per maand)" : "opgeleverd bovenop HBC (geschat, € per dag)") + "</span></div>";
    }
    _hover(e) {
      if (!this._geo) return;
      const r = this._plot.getBoundingClientRect(), px = e.clientX - r.left, g = this._geo;
      let html = "";
      if (g.periode) {
        const i = Math.floor((px - g.L) / g.bw); if (i < 0 || i >= g.vakken.length) { this._tip.style.display = "none"; return; }
        const tt = g.vakken[i], dt = new Date(tt), v = g.map.get(tt);
        html = "<b>" + (g.per === "month" ? MAAND[dt.getMonth()] + " " + dt.getFullYear() : DAG[dt.getDay()] + " " + dt.getDate() + " " + MAAND[dt.getMonth()]) + "</b><br>" + (v != null ? "€ " + nl(v, 2) + " " + t("opgeleverd") : t("geen gegevens"));
      } else {
        if (px < g.L || px > g.L + g.iw) { this._tip.style.display = "none"; return; }
        const tt = g.x0 + (px - g.L) / g.iw * (g.x1 - g.x0);
        const x = this._data.q.find((y) => tt >= y.t && tt < y.t + KW); if (!x) return;
        const lv = x.voorbij ? opMoment(this._data.ld, x.t + KW) : opMoment(this._data.vl, x.t + KW);
        html = "<b>" + DAG[new Date(x.t).getDay()] + " " + hm(new Date(x.t)) + "</b>" + (x.voorbij ? " <span style='color:var(--secondary-text-color)'>(" + t("voorbij") + ")</span>" : "") +
          "<br>" + t(allin(this._data.pa) ? "prijs all-in" : "kale prijs") + " " + nl(x.p, 1) + " ct" +
          (x.c && CAT[x.c] ? "<br><span class='dot' style='background:" + CAT[x.c].color + "'></span> " + esc(t(CAT[x.c].name)) : "") +
          (lv != null ? "<br>" + t(x.voorbij ? "lading" : "lading daarna ±") + " " + nl(Number(lv), 2) + " kWh" : "");
      }
      this._tip.innerHTML = "<div style='padding:8px 10px;font-size:11px;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:6px;width:max-content'>" + html + "</div>";
      this._tip.style.display = "block";
      const tw = this._tip.offsetWidth; this._tip.style.left = (px + 12 + tw > r.width ? px - tw - 12 : px + 12) + 16 + "px"; this._tip.style.top = Math.max(0, e.clientY - r.top) + "px";
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Wat levert het op: tellers van sensor.batterijplan_meerwaarde, uitleg achter de (i)
  class BpOpbrengst extends BpBase {
    static getStubConfig() { return { title: "Wat levert het op", icon: "batterijplan:euro" }; }
    getGridOptions() { return { columns: 12, rows: "auto" }; }
    _render() {
      if (!this._hass) return;
      this._shell();
      const m = this._hass.states["sensor.batterijplan_meerwaarde"] || { state: 0, attributes: {} }, a = m.attributes || {};
      const eur = (v) => { const g = geld(v); return "<span style='color:" + g.kleur + "'>" + g.txt + "</span>"; };
      this._chips.style.display = "none";
      this._setUitleg("<p><b>" + t("Wat telt hier?") + "</b> " + t("Elk kwartier schat Batterijplan het verschil tussen HBC alleen en HBC met Batterijplan, inclusief btw.") + " " +
        t("Bij vasthouden telt de lading mee tegen de gemiddelde prijs van de dure kwartieren waar het plan haar later voor inzet.") + " " +
        t("Bij overschot ontladen telt alleen de lading die echt uit de batterij ging: wat je daardoor niet hoeft te kopen, min wat het kost om die lading op het goedkope moment terug te laden (inclusief verlies in de batterij).") + "</p>" +
        "<p><b>" + t("Schaduw") + "</b> = " + t("wat het had opgeleverd terwijl Live uit stond (niet echt verdiend).") + " <b>" + t("Live") + "</b> = " + t("wat het opleverde terwijl Batterijplan echt stuurde.") + "</p>" +
        "<p>" + t("Het blijft een schatting; je energierekening is het echte bewijs. Staat HBC niet op Dynamic, dan telt er niets bij.") + "</p>");
      const rij = (l, w, vet) => "<tr><td style='padding:6px 12px 6px 0;border-top:1px solid var(--divider-color)'>" + l + "</td><td style='padding:6px 0;border-top:1px solid var(--divider-color);text-align:right;white-space:nowrap'>" + (vet ? "<b>" + w + "</b>" : w) + "</td></tr>";
      this._body.innerHTML = "<table style='width:100%;margin-top:4px'>" +
        rij(t("Totaal sinds") + " " + esc(a.sinds || t("start")), eur(m.state), true) +
        rij(t("waarvan schaduw (zou opleveren)"), eur(a.eur_schaduw)) +
        rij(t("waarvan live (echt gestuurd)"), eur(a.eur_live)) +
        rij(t("Kwartieren ontladen / vastgehouden / overschot"), (a.kwartieren_ontladen || 0) + " / " + (a.kwartieren_vastgehouden || 0) + " / " + (a.kwartieren_overschot || 0)) +
        rij(t("Lading verschoven naar duurdere momenten"), nl(Number(a.kwh_vastgehouden) || 0, 1) + " kWh") + "</table>";
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Advies voor HBC: verwacht huisverbruik op zon (instelling "Solar reserved for house") en nachtladen
  class BpAdvies extends BpBase {
    static getStubConfig() { return { title: "Advies voor HBC", icon: "batterijplan:schuifregelaars" }; }
    getGridOptions() { return { columns: 12, rows: "auto" }; }
    _render() {
      if (!this._hass) return;
      this._shell();
      const S = this._hass.states, ad = S["sensor.batterijplan_advies_huisverbruik"] || { state: null, attributes: {} }, a = ad.attributes || {};
      const pa = (S[IDS.plan] || {}).attributes || {};
      this._chips.style.display = "none";
      adviesGem(this._hass, this._terug || (this._terug = () => this._render()));
      this._setUitleg("<p><b>" + t("Wat is dit?") + "</b> " + t("In HBC vul je in hoeveel zonne-energie je huis op een dag zelf direct opmaakt (Solar reserved for house).") + " " +
        t("Staat dat te hoog, dan laadt HBC meer van het net dan nodig; te laag, dan is de batterij 's avonds te leeg voor de dure uren.") + "</p>" +
        "<p>" + t("Batterijplan rekent elke dag uit wat je huis op zon kan gebruiken (geleerd verbruik naast de zonverwachting) en vergelijkt het gemiddelde van de laatste 7 dagen met jouw instelling.") + " " +
        t("Pas als het 1 kWh of meer afwijkt, krijg je een advies. Batterijplan verandert zelf niets in HBC.") + "</p>");
      const { kop, kleur, sub } = adviesOordeel(this._hass);
      const nk = Number(pa.nachtladen_kwh) || 0, nkw = arr(pa.nachtladen_kwartieren);
      const nacht = nk > 0 ? "<div style='font-size:13px;margin-top:8px'>" + t("Vannacht extra laden:") + " " + nl(nk, 1) + " kWh" + (nkw.length ? " " + t("om") + " " + nkw[0] : "") + "</div>" : "";
      this._body.innerHTML = "<div style='font-size:12px;color:var(--secondary-text-color);margin-top:2px'>" + t("Huisverbruik op zon (Solar reserved for house)") + "</div>" +
        "<div style='font-size:20px;line-height:1.3;margin-top:4px;color:" + kleur + "'>" + esc(kop) + "</div>" +
        "<div style='font-size:12px;color:var(--secondary-text-color);margin-top:2px'>" + esc(sub) + "</div>" + nacht;
    }
  }


  // Advies voor HBC: gemiddelde van de laatste 7 dagen (dagstatistiek van de sensor), eens per uur opgehaald
  // en gedeeld door de advieskaart en het knopje "Advies HBC".
  const ADV = { uur: null, v: null, n: 0, wacht: [] };
  function adviesGem(hass, klaar) {
    const uur = Math.floor(Date.now() / 3600000);
    if (ADV.uur === uur && !ADV.bezig) return;
    if (klaar && !ADV.wacht.includes(klaar)) ADV.wacht.push(klaar);
    if (ADV.uur === uur) return;
    ADV.uur = uur; ADV.bezig = true;
    hass.callWS({ type: "recorder/statistics_during_period", start_time: new Date(Date.now() - 7 * 86400000).toISOString(),
      statistic_ids: ["sensor.batterijplan_advies_huisverbruik"], period: "day", types: ["mean"] })
      .then((r) => { const l = (r["sensor.batterijplan_advies_huisverbruik"] || []).map((x) => Number(x.mean)).filter((v) => Number.isFinite(v));
        ADV.v = l.length ? l.reduce((p, q) => p + q, 0) / l.length : null; ADV.n = l.length;
        ADV.bezig = false; const w = ADV.wacht; ADV.wacht = []; w.forEach((f) => { try { f(); } catch (e) {} }); })
      .catch(() => { ADV.bezig = false; ADV.wacht = []; });
  }
  function adviesOordeel(hass) {
    const a = (hass.states["sensor.batterijplan_advies_huisverbruik"] || {}).attributes || {};
    const ing = Number(a.ingesteld), lerend = String(a.voorlopig) === "true" || a.voorlopig === true;
    const n = ADV.n, gem = ADV.v;
    if (lerend || n < 7 || gem == null)
      return { stand: "meten", kop: t("Nog aan het meten"), kleur: "var(--secondary-text-color)",
        sub: t("Advies volgt als je verbruik geleerd is en er een week gemeten is") + (Number.isFinite(ing) ? " · " + t("nu ingesteld") + " " + nl(ing, 1) + " kWh" : "") };
    if (Math.abs(gem - ing) < 1)
      return { stand: "goed", kop: t("Staat goed"), kleur: "#66bb6a", sub: t("Ingesteld") + " " + nl(ing, 1) + " kWh · " + t("gemiddeld nodig") + " " + nl(gem, 1) + " kWh (" + t("7 dagen") + ")" };
    const naar = Math.round(gem * 2) / 2;
    return { stand: "aanpassen", kop: t("Aanpassen naar") + " " + nl(naar, 1) + " kWh", kleur: "#ff9800",
      sub: t("Nu ingesteld") + " " + nl(ing, 1) + " kWh · " + t("gemiddeld nodig") + " " + nl(gem, 1) + " kWh (" + t("7 dagen") + ")" };
  }

  // ------------------------------------------------------------------------------------------------
  // Knoppen: een rij knopjes die elk een venster openen met gewone HA-kaarten erin (zelfde patroon als
  // batt-mon), plus de schakelaar Live. Zo blijft de startpagina compact.
  //   knoppen: [{ naam, melding: advies|instellingen|sensoren, kaarten: [kaartconfig, ...] }]
  class BpKnoppen extends HTMLElement {
    setConfig(c) { this._config = Object.assign({ live: "input_boolean.batterijplan_live", knoppen: [] }, c || {}); this._open = null; this._teken(); }
    set hass(h) {
      this._hass = h; zetTaal(h);
      (this._kaarten || []).forEach((k) => { k.hass = h; });
      const S = h.states, ids = [this._config.live, "sensor.batterijplan_advies_huisverbruik", "input_number.batterijplan_capaciteit",
        "input_text.batterijplan_sensor_net", "input_text.batterijplan_sensor_zon", "input_text.batterijplan_sensor_batterij", "input_text.batterijplan_sensor_ev"];
      const sen = this._sensoren(), key = ids.concat(sen).map((id) => (S[id] || {}).state).join("|") + LANG;
      if (key !== this._key) { this._key = key; this._teken(); }
      adviesGem(h, this._terug || (this._terug = () => { this._key = null; this._teken(); }));
    }
    getCardSize() { return 1; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }
    _sensoren() {
      const S = (this._hass || {}).states || {};
      return ["net", "zon", "batterij", "ev"].map((k) => String((S["input_text.batterijplan_sensor_" + k] || {}).state || "").trim()).filter((v) => v && v !== "unknown");
    }
    _melding(m) {
      const S = this._hass.states;
      const leeg = (k) => { const v = String((S["input_text.batterijplan_sensor_" + k] || {}).state || "").trim(); return !v || v === "unknown"; };
      if (m === "advies") return adviesOordeel(this._hass).stand === "aanpassen";
      if (m === "instellingen") return !(Number((S["input_number.batterijplan_capaciteit"] || {}).state) > 1.05);
      if (m === "sensoren") return ["net", "zon", "batterij"].some(leeg) ||
        this._sensoren().some((id) => { const st = (S[id] || {}).state; return st == null || st === "unavailable" || st === "unknown"; });
      return false;
    }
    _teken() {
      if (!this._hass || !this._config) return;
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
        this._sw.addEventListener("click", () => this._hass.callService("input_boolean", this._sw.classList.contains("aan") ? "turn_off" : "turn_on", { entity_id: this._config.live }));
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
      this._open = (i == null || this._open === i) ? null : i;
      this._laag.innerHTML = ""; this._kaarten = [];
      document.removeEventListener("keydown", this._esc);
      this._key = null; this._teken();
      if (this._open == null) return;
      const k = this._config.knoppen[this._open];
      const scherm = document.createElement("div"); scherm.className = "scherm";
      const paneel = document.createElement("div"); paneel.className = "paneel";
      const balk = document.createElement("div"); balk.className = "balk";
      const sluit = document.createElement("span"); sluit.className = "sluit"; sluit.textContent = "‹ " + t("Terug"); sluit.title = t("Terug");
      const kruis = document.createElement("span"); kruis.className = "kruis"; kruis.textContent = "✕"; kruis.title = t("Sluiten");
      balk.appendChild(sluit); balk.appendChild(kruis); paneel.appendChild(balk); scherm.appendChild(paneel); this._laag.appendChild(scherm);
      scherm.addEventListener("click", (e) => { if (e.target === scherm || e.target === sluit || e.target === kruis) this._openen(null); });
      document.addEventListener("keydown", this._esc);
      const helpers = await window.loadCardHelpers();
      if (this._open == null || this._laag.firstChild !== scherm) return;
      (k.kaarten || []).forEach((cfg) => {
        const el = helpers.createCardElement(cfg); el.hass = this._hass;
        paneel.appendChild(el); this._kaarten.push(el);
      });
    }
    disconnectedCallback() { document.removeEventListener("keydown", this._esc); }
  }

  // ---------- custom:batterijplan-velden — own input fields in the house style (copy of the HESC v4 fields, own element name) ----------
  // Rows: entity (number = slider or − value + pill, select = chips, text = edit on the line, date, button = pill), "section", "backup" (last back-up line).
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
    ".ui-paneel p{margin:0 0 8px}.ui-paneel p:last-child,.ui-paneel ul:last-child{margin-bottom:0}.ui-paneel ul{margin:0 0 8px;padding-left:18px}";
  // info text: blank line = new paragraph, "- " lines = list, **bold**
  const infoHtml = (text) => String(t(text)).split(/\n\s*\n/).map((blk) => {
    const e = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"), lines = blk.split("\n");
    return lines.every((l) => l.startsWith("- ")) ? "<ul>" + lines.map((l) => "<li>" + e(l.slice(2)) + "</li>").join("") + "</ul>" : "<p>" + e(blk) + "</p>";
  }).join("");

  class BpVelden extends HTMLElement {
    setConfig(c) { this._config = Object.assign({}, c || {}); this._tab = 0; this._sig = ""; this._busy = null; this._edit = undefined; this._zeker = null; if (this._hass) this._render(); }
    set hass(h) {
      this._hass = h; const oud = LANG; zetTaal(h);
      const sig = this._rows(true).map((r) => { const s = r.entity && h.states[r.entity]; const x = s && r.type !== "backup" && /^[a-z_]+\.[a-z0-9_]+$/.test(s.state) && h.states[s.state];
        return s ? s.state + (x ? x.state : "") : "-"; }).join("|") + LANG;
      if ((sig === this._sig && oud === LANG) || this._busy || this._edit !== undefined) return;
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
    _row(r, i) {
      const H = this._hass.states;
      if (r.type === "section") return "<div class='sec'>" + esc(r.name || "") + "</div>";
      if (r.type === "backup") {
        const s = H[r.entity || "sensor.batterijplan_instellingen_backup"], ok = s && !["unknown", "unavailable", ""].includes(s.state);
        const n = ok ? Object.keys(s.attributes).filter((k) => !["friendly_name", "icon"].includes(k)).length : 0;
        return "<div class='bk'>" + (ok ? esc(t("Laatste back-up")) + " " + esc(s.state.slice(0, 5) + s.state.slice(10)) + " · " + n + " " + esc(t("instellingen")) : esc(t("Nog geen back-up"))) + "</div>";
      }
      if (r.type === "buttons") return "<div class='f wide'>" + (r.name ? this._naam(r, i) : "") + "<div class='knoppen'>" + (r.buttons || []).map((b, j) =>
        "<button class='btn" + (this._zeker === i + "." + j ? " zeker" : "") + "' data-b='" + i + "." + j + "'>" + esc(this._zeker === i + "." + j ? t("Zeker? Tik nog een keer") : b.name) + "</button>").join("") + "</div></div>";
      if (!r.entity) return "";
      const s = H[r.entity], dom = r.entity.split(".")[0];
      if (!s) return "<div class='f na'>" + this._naam(Object.assign({}, r, { hint: t("niet gevonden") + ": " + r.entity }), i) + "<span></span></div>";
      const a = s.attributes, unit = a.unit_of_measurement ? " " + a.unit_of_measurement : "";
      if (dom === "input_number" || dom === "number") {
        const min = +a.min, max = +a.max, step = +a.step || 1, v = +s.state, n = Math.round((max - min) / step);
        if (n <= 400 && r.kind !== "stepper") {
          const pc = (v - min) / (max - min) * 100;
          return "<div class='f'>" + this._naam(r, i) + "<div class='sl' style='min-width:min(320px,52cqw)'><input type='range' min='" + min + "' max='" + max + "' step='" + step + "' value='" + v + "' data-i='" + i + "' style='--v:" + pc + "%' aria-label='" + esc(r.name || "") + "'><output>" + this._num(v, step) + esc(unit) + "</output></div></div>";
        }
        const shown = this._edit === i ? "<input data-ni='" + i + "' inputmode='decimal' value='" + esc(String(v).replace(".", LANG === "en" ? "." : ",")) + "'>" : "<b data-ne='" + i + "' title='" + esc(t("Tik om te typen")) + "'>" + this._num(v, step) + esc(unit) + "</b>";
        return "<div class='f'>" + this._naam(r, i) + "<div class='stp' data-i='" + i + "'><button data-dir='-1' aria-label='" + esc(t("minder")) + "'>−</button>" + shown + "<button data-dir='1' aria-label='" + esc(t("meer")) + "'>+</button></div></div>";
      }
      if (dom === "input_boolean" || dom === "switch") return "<div class='f'>" + this._naam(r, i) + "<button class='tg" + (s.state === "on" ? " on" : "") + "' role='switch' aria-checked='" + (s.state === "on") + "' data-i='" + i + "'></button></div>";
      if (dom === "input_select" || dom === "select") {
        const opts = a.options || [], lab = r.labels || {};
        if (opts.length <= 6) return "<div class='f'>" + this._naam(r, i) + "<div class='chips'>" + opts.map((o) => "<button class='chip" + (o === s.state ? " on" : "") + "' data-i='" + i + "' data-o='" + esc(o) + "'>" + esc(lab[o] || o) + "</button>").join("") + "</div></div>";
        return "<div class='f'>" + this._naam(r, i) + "<div class='stp' data-i='" + i + "' data-sel='1'><button data-dir='-1'>‹</button><b>" + esc(lab[s.state] || s.state) + "</b><button data-dir='1'>›</button></div></div>";
      }
      if (dom === "input_text" || dom === "text") {
        const v = ["unknown", "unavailable"].includes(s.state) ? "" : s.state, x = /^[a-z_]+\.[a-z0-9_]+$/.test(v) ? H[v] : null;
        const nu = v ? (x ? "<small>" + esc(t("nu")) + ": " + esc(x.state) + esc(x.attributes.unit_of_measurement ? " " + x.attributes.unit_of_measurement : "") + "</small>" : "<small style='color:#ff9800'>" + esc(t("sensor niet gevonden")) + "</small>") : "";
        if (this._edit === i) return "<div class='f wide'>" + this._naam(r, i) + "<div class='ed'><input data-ti='" + i + "' value='" + esc(v || (r.pick ? "sensor." : "")) + "' autocomplete='off' spellcheck='false'><button class='btn' data-tok='" + i + "'>OK</button></div>" +
          (r.pick ? "<div class='kies' data-kies='" + i + "'>" + this._kies(r, "") + "</div>" : "") + "</div>";
        return "<div class='f tx'>" + this._naam(r, i) + "<div class='val'><button class='txt" + (v ? "" : " empty") + "' data-te='" + i + "'>" + esc(v || t("leeg · tik om in te vullen")) + "</button>" + nu + "</div></div>";
      }
      if (dom === "input_datetime" || dom === "date") return "<div class='f'>" + this._naam(r, i) + "<input type='date' class='date' data-di='" + i + "' value='" + (/^\d{4}-\d{2}-\d{2}$/.test(s.state) ? s.state : "") + "'></div>";
      if (dom === "input_button" || dom === "button") return "<div class='f'>" + this._naam(r, i) + "<button class='btn' data-p='" + i + "'>" + esc(r.label || t("Uitvoeren")) + "</button></div>";
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
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      const c = this._config, rows = this._rows(), tb = c.tabs ? c.tabs[this._tab] || {} : null;
      this.shadowRoot.innerHTML = "<style>" + VCSS + "</style><ha-card style='--c:" + esc(c.color || "var(--primary-color)") + "'>" +
        (c.title ? "<div class='title'>" + (c.icon ? "<ha-icon icon='" + esc(c.icon) + "'></ha-icon>" : "") + "<span>" + esc(c.title) + "</span>" +
          (c.info ? "<ha-icon class='i' data-info='k' icon='mdi:information-outline' title='" + esc(t("Hoe lees je dit?")) + "'></ha-icon>" : "") + "</div>" : "") +
        (c.tabs ? "<div class='tabs'>" + c.tabs.map((x, j) => "<button class='tab" + (j === this._tab ? " on" : "") + "' data-tab='" + j + "'>" + esc(x.naam || "") + "</button>").join("") + "</div>" +
          (tb.sub ? "<div class='tabsub'>" + esc(tb.sub) + "</div>" : "") : "") +
        "<div class='rows'>" + rows.map((r, i) => this._row(r, i)).join("") + "</div></ha-card>";
      this._wire(rows);
    }
    _uitleg(text) {
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
      R.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { this._tab = +b.dataset.tab; this._edit = undefined; this._render(); }));
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
      R.querySelectorAll(".tg[data-i]").forEach((b) => b.addEventListener("click", () => { const r = rows[+b.dataset.i]; call(dom(r) === "input_boolean" ? "input_boolean" : "switch", b.classList.contains("on") ? "turn_off" : "turn_on", { entity_id: r.entity }); }));
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
      R.querySelectorAll("[data-di]").forEach((x) => x.addEventListener("change", () => { const r = rows[+x.dataset.di]; if (x.value) call(dom(r) === "date" ? "date" : "input_datetime", dom(r) === "date" ? "set_value" : "set_datetime", { entity_id: r.entity, date: x.value }); }));
      R.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { const r = rows[+b.dataset.p]; call(dom(r), "press", { entity_id: r.entity }); }));
      // button row: buttons with "confirm: true" ask "Zeker?" first (second tap within 5 s)
      R.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => {
        const [i, j] = b.dataset.b.split(".").map(Number), k = rows[i].buttons[j];
        if (k.confirm && this._zeker !== b.dataset.b) { this._zeker = b.dataset.b; this._render(); clearTimeout(this._zt); this._zt = setTimeout(() => { this._zeker = null; this._render(); }, 5000); return; }
        this._zeker = null; clearTimeout(this._zt);
        const d = k.entity.split(".")[0]; call(d, "press", { entity_id: k.entity }); this._render();
      }));
    }
  }

  // ---------- custom:batterijplan-status — status with logo; every line has an (i) with "Hoe lees je dit?" ----------
  const ST_INFO = {
    modus: "**Live**: Batterijplan zet elk kwartier de twee Dynamic-standen van HBC.\n\n**Schaduw**: Batterijplan rekent mee en laat zien wat het zou doen, maar verandert niets aan HBC.\n\nAan- en uitzetten doe je met de schakelaar Live bovenaan.",
    leren: "Batterijplan leert per uur van de dag hoeveel je huis gebruikt. Na 7 dagen is het klaar met leren. Daarna leert het glijdend door, zodat het met de seizoenen meegaat.\n\nDe **voorspelling** zegt hoe goed het geleerde verbruik het echte verbruik raakt, per blok van 3 uur:\n- wisselvallig: minder dan 55 %\n- redelijk: 55 % of meer\n- goed: 65 % of meer\n- zeer goed: 75 % of meer\n- uitstekend: 85 % of meer\n\nZolang er nog geen blok van 3 uur gemeten is, staat er: nog aan het meten.\n\nIs de voorspelling **wisselvallig**, dan rekent het plan zelf met **extra marge**: de gemiddelde afwijking per blok van 3 uur, maximaal 1 kWh, bovenop je eigen veiligheidsmarge. De batterij raakt dan minder vaak te vroeg leeg. Wordt de voorspelling beter, dan valt die extra marge vanzelf weg.",
    hbc: "Batterijplan werkt alleen als HBC op **Dynamic** staat. Staat HBC op iets anders, dan wacht het plan en verandert Batterijplan niets. Het leren gaat gewoon door.",
    kwartier: "Wat Batterijplan voor het volgende kwartier besluit:\n- **Ontladen**: de batterij levert aan het huis in een duur kwartier.\n- **Vasthouden**: de lading wordt bewaard voor een nog duurder moment.\n- **Overschot ontladen**: er zit meer in de batterij dan nodig is tot het volgende goedkope moment.\n- **Laden (HBC)** of **Zon laden (HBC)**: HBC doet het gewoon.",
  };
  const VOORSPELLING_KLEUR = { uitstekend: "#1b5e20", "zeer goed": "#2e7d32", goed: "#43a047", redelijk: "#9ccc65" };
  class BpStatus extends HTMLElement {
    setConfig(c) { this._config = Object.assign({ logo: "/local/batterijplan/logo.webp?v=2" }, c || {}); this._sig = ""; if (this._hass) this._render(); }
    set hass(h) {
      this._hass = h; zetTaal(h);
      const ids = ["input_boolean.batterijplan_live", "sensor.batterijplan_verbruiksprofiel", "sensor.batterijplan_voorspelling", "input_select.house_battery_strategy", "sensor.batterijplan"];
      const pa = (h.states["sensor.batterijplan"] || {}).attributes || {};
      const sig = ids.map((id) => (h.states[id] || {}).state).join("|") + pa.kwartier + "|" + pa.marge_extra + LANG;
      if (sig !== this._sig) { this._sig = sig; this._render(); }
    }
    getCardSize() { return 5; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }
    _render() {
      if (!this._hass) return;
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      const S = this._hass.states, st = (id) => (S[id] || {}).state, at = (id) => (S[id] || {}).attributes || {};
      const live = st("input_boolean.batterijplan_live") === "on", p = "sensor.batterijplan_verbruiksprofiel", prima = st(p) === "prima";
      const nn = arr(at(p).n), dag = Math.min(Math.floor(nn.reduce((a, b) => a + (Number(b) || 0), 0) / 96) + 1, 7);
      const gezien = arr(at(p).uur).filter((x) => typeof x === "number").length;
      const vo = st("sensor.batterijplan_voorspelling") || "", vk = VOORSPELLING_KLEUR[vo];
      const vtxt = vk ? "<b style='color:" + vk + "'>" + esc(t(vo)) + "</b>" : esc(t(vo));
      const dyn = st("input_select.house_battery_strategy") === "Dynamic";
      const ic = (n) => "<img src='/local/batterijplan/" + n + ".png?v=1' alt=''>";
      const versie = at("sensor.batterijplan").versie;
      const leren = prima ? "<b>" + esc(t("klaar met leren")) + "</b> · " + esc(t("voorspelling")) + " " + vtxt
        : "<b>" + esc(t("aan het leren")) + "</b> · " + esc(t("dag")) + " " + dag + " " + esc(t("van")) + " 7 · " + esc(t("voorspelling")) + " " + vtxt +
          (gezien >= 24 ? "" : " · " + gezien + " " + esc(t("van 24 uren al gezien")));
      const mx = Number(at("sensor.batterijplan").marge_extra) || 0;
      const lerenTxt = leren + (mx > 0 ? " · <span style='color:#ff9800'>" + esc(t("extra marge")) + " " + nl(mx, 1) + " kWh</span>" : "");
      const rij = (icoon, naam, waarde, info) => "<div class='r'>" + icoon + "<span class='n'>" + naam + "</span><span class='w'>" + waarde + "</span>" +
        "<ha-icon class='i' data-info='" + info + "' icon='mdi:information-outline' title='" + esc(t("Hoe lees je dit?")) + "'></ha-icon></div>";
      this.shadowRoot.innerHTML = "<style>" + VCSS +
        "ha-card{padding:16px 18px 10px}.kop{display:flex;align-items:center;gap:12px}.kop img{height:56px}.kop .tt{font-size:20px;font-weight:700}.kop small{font-size:14px;font-weight:600;color:var(--secondary-text-color);margin-left:6px}" +
        ".vraag{font-weight:600;margin:10px 0 6px;font-size:14px}" +
        ".r{display:grid;grid-template-columns:24px minmax(90px,.8fr) minmax(0,1.6fr) 20px;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line);font-size:14px}" +
        ".r img{height:22px}.r .n{color:var(--secondary-text-color)}.r .i{--mdc-icon-size:18px}</style>" +
        "<ha-card><div class='kop'><img src='" + esc(this._config.logo) + "' alt=''><span class='tt'>Batterijplan" + (versie ? "<small>v" + esc(versie) + "</small>" : "") + "</span></div>" +
        "<div class='vraag'>" + esc(t("Haalt de batterij meer uit de duurste kwartieren dan HBC alleen?")) + "</div>" +
        rij(ic(live ? "vinkje-cirkel" : "spook"), esc(t("Modus")), live ? "<b>" + esc(t("live")) + "</b> — " + esc(t("stuurt HBC")) : "<b>" + esc(t("schaduw")) + "</b> — " + esc(t("rekent mee, stuurt niet")), "modus") +
        rij(ic(prima ? "vinkje-cirkel" : "zandloper"), esc(t("Verbruik leren")), lerenTxt, "leren") +
        rij(ic(dyn ? "vinkje-cirkel" : "zandloper"), esc(t("HBC-strategie")), esc(st("input_select.house_battery_strategy") || "—") + (dyn ? "" : " — " + esc(t("plan wacht tot Dynamic"))), "hbc") +
        rij(ic("kalender-klok"), esc(t("Komend kwartier")) + (at("sensor.batterijplan").kwartier ? " (" + esc(at("sensor.batterijplan").kwartier) + ")" : ""), "<b>" + esc(t(st("sensor.batterijplan") || "—")) + "</b>", "kwartier") +
        "</ha-card>";
      this.shadowRoot.querySelectorAll("[data-info]").forEach((b) => b.addEventListener("click", () => BpVelden.prototype._uitleg.call(this, ST_INFO[b.dataset.info])));
    }
  }

  customElements.define("batterijplan-plan", BpPlan);
  customElements.define("batterijplan-velden", BpVelden);
  customElements.define("batterijplan-status", BpStatus);
  customElements.define("batterijplan-knoppen", BpKnoppen);
  customElements.define("batterijplan-advies", BpAdvies);
  customElements.define("batterijplan-opbrengst", BpOpbrengst);
  customElements.define("batterijplan-grafiek", BpGrafiek);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "batterijplan-plan", name: "Batterijplan — plan" }, { type: "batterijplan-grafiek", name: "Batterijplan — grafiek" },
    { type: "batterijplan-advies", name: "Batterijplan — advies" }, { type: "batterijplan-opbrengst", name: "Batterijplan — opbrengst" },
    { type: "batterijplan-knoppen", name: "Batterijplan — knoppen met vensters" }, { type: "batterijplan-velden", name: "Batterijplan — instelvelden" },
    { type: "batterijplan-status", name: "Batterijplan — status" });
})();
