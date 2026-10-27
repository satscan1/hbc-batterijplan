// Batterijplan — eigen kaarten in de huisstijl van HESC (zelfde opbouw als hesc-cards.js).
//   custom:batterijplan-plan      Plan vandaag en morgen: kerncijfers, balk per dag met tijdas, blokken
//   custom:batterijplan-grafiek   Prijs per kwartier met gekleurde vlakken (wat de batterij doet) en de lading
//   custom:batterijplan-advies    Advies voor HBC (Solar reserved for house), op basis van 7 dagen
//   custom:batterijplan-opbrengst Wat levert het op (tellers), uitleg achter de (i)
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
    o: { color: "#4caf50", name: "ontladen voor het huis" },
    v: { color: "#e0a526", name: "vasthouden (Batterijplan stuurt bij)" },
    x: { color: "#9ccc65", name: "overschot ontladen" },
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
    "Laagste – hoogste": "Goedkoopste en duurste kwartier van die dag (kale prijs).",
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
    "lichtgroen": "light green",
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
    "wat het opleverde terwijl Batterijplan echt stuurde.": "what it earned while Batterijplan was really steering."
   },
   "de": {
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
    "lichtgroen": "hellgrün",
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
    "wat het opleverde terwijl Batterijplan echt stuurde.": "was es gebracht hat, während Batterijplan wirklich gesteuert hat."
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
        ".i{--mdc-icon-size:20px;color:#8ab4f8;cursor:pointer}.uitleg{display:none;padding:10px 12px;border-radius:8px;background:rgba(138,180,248,0.08);border-left:3px solid #8ab4f8;font-size:13px;line-height:1.55;color:var(--primary-text-color)}.uitleg.open{display:block}.uitleg p{margin:0 0 6px}.uitleg p:last-child{margin:0}" +
        ".body{position:relative;padding:0 16px 16px}.tip{position:absolute;pointer-events:none;z-index:2;display:none}" +
        "table{border-collapse:collapse;font-size:13px;margin-top:10px}td{padding:3px 10px 3px 0;vertical-align:top}" +
        ".leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--secondary-text-color);margin-top:8px}" +
        ".leg span{display:inline-flex;align-items:center;gap:4px}.dot{width:10px;height:10px;border-radius:2px;display:inline-block}" +
        "</style><ha-card><div class='hdr'><div class='title'>" + (c.icon ? "<ha-icon icon='" + esc(c.icon) + "'></ha-icon>" : "") +
        "<span>" + esc(t(c.title || "")) + "</span><ha-icon class='i' icon='mdi:information-outline' title='" + esc(t("Uitleg: wat zie ik hier?")) + "'></ha-icon></div><div class='uitleg'></div><div class='chips'></div></div><div class='body'></div></ha-card>";
      this._card = this.shadowRoot.querySelector("ha-card");
      this._chips = this.shadowRoot.querySelector(".chips");
      this._body = this.shadowRoot.querySelector(".body");
      this._uitlegEl = this.shadowRoot.querySelector(".uitleg");
      this.shadowRoot.querySelector(".i").addEventListener("click", () => this._uitlegEl.classList.toggle("open"));
    }
    _setUitleg(html) { if (this._uitlegEl && this._uitlegEl.innerHTML !== html) this._uitlegEl.innerHTML = html; }
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
        "<font color='" + CAT.x.color + "'>" + t("lichtgroen") + "</font> = " + t("overschot ontladen") + ".</p>" +
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
    _ids() {
      return { prijs: this._config.price_entity || "sensor.nordpool_kwh_nl_eur_3_10_021", lading: "sensor.batterijplan_lading", meerwaarde: "sensor.batterijplan_meerwaarde" };
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
            this._hist = { dag, prijs: reeks(ids.prijs, (s) => (isFinite(parseFloat(s)) ? parseFloat(s) * 100 : null)),
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
      this._data = { modus: "dag", q, x0, x1, nu, ld, vl, pa: live.pa, vandaag: dag === vandaag };
      const cur = q.find((x) => x.t === nu);
      const prijzen = q.map((x) => x.p);
      if (this._data.vandaag) {
        this._setChips([
          { value: cur ? nl(cur.p, 1) : "—", unit: "ct", name: "Kale prijs nu", color: "#cbd5e1" },
          { value: nl(Number(live.pa.lading_kwh), 2), unit: "kWh", name: "In de batterij nu", color: "#06B6D4" },
        ]);
      } else {
        const d = new Date(dag);
        this._setChips([
          { value: prijzen.length ? nl(prijzen.reduce((a, b) => a + b, 0) / prijzen.length, 1) : "—", unit: "ct", name: "Gemiddelde kale prijs", color: "#cbd5e1" },
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
            { value: "€ " + nl(tot, 2), name: "Opgeleverd in deze periode", color: "#4caf50" },
            { value: "€ " + nl(tot / n, 2), name: per === "month" ? t("Gemiddeld per maand") : t("Gemiddeld per dag"), color: "var(--primary-text-color)" },
            { value: beste.t ? "€ " + nl(beste.v, 2) : "—", name: beste.t ? (per === "month" ? t("Beste maand:") + " " + MAAND[new Date(beste.t).getMonth()] : t("Beste dag:") + " " + DAG[new Date(beste.t).getDay()] + " " + new Date(beste.t).getDate() + " " + MAAND[new Date(beste.t).getMonth()]) : t("Beste dag"), color: "#4caf50" },
          ]);
          this._draw();
        })
        .catch(() => { this._data = { modus: "periode", per, rows: [], x0: p.start, x1: eind }; this._draw(); });
    }

    _draw() {
      if (!this._data || !this._plot) return;
      if (this._data.modus === "periode") return this._drawPeriode();
      const W = Math.max(this._body.clientWidth - 32, 260), H = this._config.height || 300;
      const L = 40, R = 40, T = 12, B = 34, iw = W - L - R, ih = H - T - B;
      const { q, x0, x1, nu, ld, vl } = this._data;
      if (!q.length) { this._plot.innerHTML = "<div style='padding:12px;color:var(--secondary-text-color)'>" + t("Voor deze dag zijn (nog) geen prijzen bekend.") + "</div>"; this._geo = null; return; }
      let lo = Math.min(0, ...q.map((x) => x.p)), hi = Math.max(...q.map((x) => x.p)); const st = nice(hi - lo, 5); lo = Math.floor(lo / st) * st; hi = Math.ceil(hi / st) * st;
      const cap = Math.max(1, ...ld.map((p) => p[1]), ...vl.map((p) => p[1])); const st2 = nice(cap, 4), hi2 = Math.ceil(cap / st2) * st2;
      const X = (t) => L + (t - x0) / (x1 - x0) * iw, Y = (v) => T + (hi - v) / (hi - lo) * ih, Y2 = (v) => T + (hi2 - v) / hi2 * ih, base = Y(Math.max(lo, 0));
      let g = "";
      for (let v = lo; v <= hi + st / 2; v += st) g += "<line x1='" + L + "' x2='" + (W - R) + "' y1='" + Y(v) + "' y2='" + Y(v) + "' stroke='var(--divider-color)' stroke-dasharray='2,2'/><text x='" + (L - 6) + "' y='" + (Y(v) + 3) + "' text-anchor='end' font-size='10' fill='var(--secondary-text-color)'>" + Math.round(v) + "</text>";
      const metLading = ld.length > 1 || vl.length > 1;
      if (metLading) for (let v = 0; v <= hi2 + st2 / 2; v += st2) g += "<text x='" + (W - R + 6) + "' y='" + (Y2(v) + 3) + "' font-size='10' fill='#06B6D4'>" + nl(v, Number.isInteger(v) ? 0 : Math.round(v * 10) === v * 10 ? 1 : 2) + "</text>";
      g += "<text x='" + (L - 6) + "' y='" + (T - 2) + "' text-anchor='end' font-size='10' fill='var(--secondary-text-color)'>ct</text>" + (metLading ? "<text x='" + (W - R + 6) + "' y='" + (T - 2) + "' font-size='10' fill='#06B6D4'>kWh</text>" : "");
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
      if (Date.now() >= x0 && Date.now() <= x1) {
        const xn = X(Date.now());
        body += "<line x1='" + xn + "' x2='" + xn + "' y1='" + T + "' y2='" + (T + ih) + "' stroke='#009ac7' stroke-width='1.5'/><rect x='" + (xn - 15) + "' y='" + T + "' width='30' height='14' rx='2' fill='#009ac7'/><text x='" + xn + "' y='" + (T + 10.5) + "' text-anchor='middle' font-size='10' fill='#fff'>" + t("Nu") + "</text>";
      }
      this._geo = { L, iw, x0, x1 };
      this._plot.innerHTML = "<svg width='" + W + "' height='" + H + "' style='display:block;font-family:inherit'>" + g + body + "</svg>" +
        this._legend(["o", "v", "x"]).replace("<div class='leg'>", "<div class='leg'><span><span class='dot' style='background:#cbd5e1'></span>" + t("kale prijs (ct)") + "</span><span><span class='dot' style='background:#06B6D4'></span>" + t("lading (kWh): doorgetrokken = gemeten, gestreept = verwacht volgens plan") + "</span>");
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
        if (v != null) g += "<rect x='" + (x + bw * 0.15) + "' y='" + Math.min(Y(v), Y(0)) + "' width='" + Math.max(bw * 0.7, 1) + "' height='" + Math.max(Math.abs(Y(0) - Y(v)), 1) + "' rx='2' fill='#4caf50' fill-opacity='0.8'/>";
        if (i % elke === 0) g += "<text x='" + (x + bw / 2) + "' y='" + (T + ih + 14) + "' text-anchor='middle' font-size='10' fill='var(--secondary-text-color)'>" + (per === "month" ? MAAND[dt.getMonth()] : (vakken.length <= 7 ? DAG[dt.getDay()] + " " : "") + dt.getDate()) + "</text>";
      });
      this._geo = { periode: true, L, bw, vakken, map, per };
      this._plot.innerHTML = "<svg width='" + W + "' height='" + H + "' style='display:block;font-family:inherit'>" + g + "</svg>" +
        "<div class='leg'><span><span class='dot' style='background:#4caf50'></span>" + t(per === "month" ? "opgeleverd bovenop HBC (geschat, € per maand)" : "opgeleverd bovenop HBC (geschat, € per dag)") + "</span></div>";
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
          "<br>" + t("kale prijs") + " " + nl(x.p, 1) + " ct" +
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
      const eur = (v) => "€ " + nl(Number(v) || 0, 2);
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
      // gemiddeld advies over de laatste 7 dagen (dagstatistiek van de sensor), eens per uur ophalen
      const uur = Math.floor(Date.now() / 3600000);
      if (this._gemUur !== uur) {
        this._gemUur = uur;
        this._hass.callWS({ type: "recorder/statistics_during_period", start_time: new Date(Date.now() - 7 * 86400000).toISOString(),
          statistic_ids: ["sensor.batterijplan_advies_huisverbruik"], period: "day", types: ["mean"] })
          .then((r) => { const l = (r["sensor.batterijplan_advies_huisverbruik"] || []).map((x) => Number(x.mean)).filter((v) => Number.isFinite(v));
            this._gem = { v: l.length ? l.reduce((p, q) => p + q, 0) / l.length : null, n: l.length }; this._render(); })
          .catch(() => {});
      }
      this._setUitleg("<p><b>" + t("Wat is dit?") + "</b> " + t("In HBC vul je in hoeveel zonne-energie je huis op een dag zelf direct opmaakt (Solar reserved for house).") + " " +
        t("Staat dat te hoog, dan laadt HBC meer van het net dan nodig; te laag, dan is de batterij 's avonds te leeg voor de dure uren.") + "</p>" +
        "<p>" + t("Batterijplan rekent elke dag uit wat je huis op zon kan gebruiken (geleerd verbruik naast de zonverwachting) en vergelijkt het gemiddelde van de laatste 7 dagen met jouw instelling.") + " " +
        t("Pas als het 1 kWh of meer afwijkt, krijg je een advies. Batterijplan verandert zelf niets in HBC.") + "</p>");
      const ing = Number(a.ingesteld), lerend = String(a.voorlopig) === "true" || a.voorlopig === true, g = this._gem;
      const n = g ? g.n : 0, gem = g && g.v != null ? g.v : null;
      let kop, kleur, sub;
      if (lerend || n < 7 || gem == null) {
        kop = t("Nog aan het meten"); kleur = "var(--secondary-text-color)";
        sub = t("Advies volgt als je verbruik geleerd is en er een week gemeten is") + (Number.isFinite(ing) ? " · " + t("nu ingesteld") + " " + nl(ing, 1) + " kWh" : "");
      } else if (Math.abs(gem - ing) < 1) {
        kop = t("Staat goed"); kleur = "#4caf50"; sub = t("Ingesteld") + " " + nl(ing, 1) + " kWh · " + t("gemiddeld nodig") + " " + nl(gem, 1) + " kWh (" + t("7 dagen") + ")";
      } else {
        const naar = Math.round(gem * 2) / 2;
        kop = t("Aanpassen naar") + " " + nl(naar, 1) + " kWh"; kleur = "#e0a526"; sub = t("Nu ingesteld") + " " + nl(ing, 1) + " kWh · " + t("gemiddeld nodig") + " " + nl(gem, 1) + " kWh (" + t("7 dagen") + ")";
      }
      const nk = Number(pa.nachtladen_kwh) || 0, nkw = arr(pa.nachtladen_kwartieren);
      const nacht = nk > 0 ? "<div style='font-size:13px;margin-top:8px'>" + t("Vannacht extra laden:") + " " + nl(nk, 1) + " kWh" + (nkw.length ? " " + t("om") + " " + nkw[0] : "") + "</div>" : "";
      this._body.innerHTML = "<div style='font-size:12px;color:var(--secondary-text-color);margin-top:2px'>" + t("Huisverbruik op zon (Solar reserved for house)") + "</div>" +
        "<div style='font-size:20px;line-height:1.3;margin-top:4px;color:" + kleur + "'>" + esc(kop) + "</div>" +
        "<div style='font-size:12px;color:var(--secondary-text-color);margin-top:2px'>" + esc(sub) + "</div>" + nacht;
    }
  }

  customElements.define("batterijplan-plan", BpPlan);
  customElements.define("batterijplan-advies", BpAdvies);
  customElements.define("batterijplan-opbrengst", BpOpbrengst);
  customElements.define("batterijplan-grafiek", BpGrafiek);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "batterijplan-plan", name: "Batterijplan — plan" }, { type: "batterijplan-grafiek", name: "Batterijplan — grafiek" },
    { type: "batterijplan-advies", name: "Batterijplan — advies" }, { type: "batterijplan-opbrengst", name: "Batterijplan — opbrengst" });
})();
