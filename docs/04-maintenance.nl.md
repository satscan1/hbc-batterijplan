# 04 · Onderhoud en bijwerken

*English: [04-maintenance.md](04-maintenance.md) · Deutsch: [04-maintenance.de.md](04-maintenance.de.md)*

**In het kort**
- Eens per maand even kijken is genoeg.
- Maak altijd een back-up voordat je iets verandert of bijwerkt.
- Tijdelijk uitzetten = *Live* uit. Het plan blijft dan rekenen en leren.

## Wat je af en toe doet

| Wanneer | Wat doen |
|---|---|
| **Eens per maand** | Kijk of "vasthouden" en "ontladen" nog logisch zijn. Blijft de batterij vaak ruim vol na de dure periode? Verlaag de veiligheidsmarge. Raakt hij vaak te vroeg leeg? Verhoog de marge, of controleer de capaciteit. |
| **Advies voor HBC wordt oranje** | Pas *Solar reserved for house* in HBC aan naar het getal in het advies. Dat gebeurt vooral bij de wisseling van de seizoenen. |
| **Nieuw energiecontract** | Pas *Energiebelasting + inkoop* en de *ingangsdatum* aan. |
| **Batterij erbij of eraf, of minder capaciteit door slijtage** | Pas de *bruikbare capaciteit* aan. |
| **Grote verandering in verbruik** (warmtepomp, nieuw apparaat) | Niets doen: het profiel past zich binnen ± 14 dagen vanzelf aan. |
| **HBC-update** | Controleer dat HBC nog op Dynamic staat en de gewone periode op Charge PV. |
| **Andere sensoren** (nieuwe P1-meter, omvormer) | Zet de schakelaar *Instellingen* aan en pas de sensornamen aan. Maak daarna een nieuwe back-up. |

## Een nieuwe versie installeren

1. Druk op **Back-up maken**.
2. Vervang `packages/batterijplan.yaml` en de map `www/batterijplan/` door die uit de nieuwe zip.
3. Verhoog bij *Instellingen → Dashboards → ⋮ → Bronnen* het nummer achter de kaarten, bijvoorbeeld `?v=1` → `?v=2`. Zo laadt je browser de nieuwe kaarten.
4. Plak het nieuwe dashboard in de Raw-configuratie-editor (zie [01 · Installatie](01-installation.nl.md#stap-5--kaarten-en-dashboard)).
5. *Configuratie controleren* en herstarten.

Je instellingen, het geleerde verbruik en de teller blijven bewaard. Mist er toch iets, druk dan op **Back-up terugzetten**.

**Van 0.1.x naar 1.0.0-dev1:** voeg de kaarten toe als bron (stap 5 van de installatie) en vervang het dashboard. Gebruik je een recorder met include-lijst, zet dan ook `sensor.batterijplan_lading` en `sensor.batterijplan_advies_huisverbruik` op de lijst en herstart.

## Helemaal verwijderen

1. Zet **Live** uit, zodat HBC terug op zijn normale standen gaat.
2. Verwijder `packages/batterijplan.yaml`, de map `www/batterijplan/`, de bron `/local/batterijplan/batterijplan-cards.js` en het dashboard.
3. Herstart Home Assistant.
