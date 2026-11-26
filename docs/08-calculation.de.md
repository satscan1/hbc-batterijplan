# 08 · Klüger rechnen (2.0.0)

*English: [08-calculation.md](08-calculation.md) · Nederlands: [08-calculation.nl.md](08-calculation.nl.md)*

Version 2.0.0 bringt sechs neue Rechenteile. Vier arbeiten von selbst. Zwei sind Regeln, die du selbst einschaltest: **in jeder günstigen Viertelstunde laden** und **Verkaufsreserve automatisch**. Alles in diesem Kapitel gilt für einen *dynamischen* Vertrag, wenn nichts anderes dasteht.

**Kurz gesagt**
- **Sonne mit mitwachsender Marge.** Für die nächsten Stunden rechnet der Plan mit einer besseren Schätzung als für morgen Nachmittag.
- **Dunkle Tage.** Folgen nach den bekannten Preisen mindestens zwei Tage fast ohne Sonne, hält der Plan Ladung zurück und lädt bei Bedarf günstig nach.
- **Reserve, die mitlernt.** Die Reserve beginnt großzügig und wird kleiner, je besser Verbrauch und Sonne vorhergesagt werden.
- **Verbrauch pro Wochentag.** Batterijplan lernt auch pro Wochentag und nutzt dieses Profil nur, wenn es nachweislich besser vorhersagt.
- **In jeder günstigen Viertelstunde laden** (Regel, standardmäßig aus). Batterijplan erkennt günstige Viertelstunden selbst und darf darin laden, auch außerhalb der günstigen Stunden von HBC.
- **Verkaufsreserve automatisch** (Regel, standardmäßig aus). Batterijplan füllt *Keep energy in reserve* von HBC, damit HBC in einer Sell-Viertelstunde nicht mehr verkauft, als der Plan meint.

## Sonne mit mitwachsender Marge

Solcast liefert pro halbe Stunde eine normale und eine vorsichtige Schätzung. Bis 2.0.0 rechnete der Plan überall mit der vorsichtigen. Jetzt hängt es davon ab, wie weit die Viertelstunde voraus liegt:

| Wie weit voraus | Womit der Plan rechnet |
|---|---|
| jetzt | genau zwischen der normalen und der vorsichtigen Schätzung |
| bis 24 Stunden | gleitend zur vorsichtigen Schätzung |
| nach 24 Stunden | die vorsichtige Schätzung, pro weiterem Tag 10 % weniger (nie unter 70 % davon) |

Im Diagramm ist das die Linie *Sonne vorsichtig*.

## Dunkle Tage

Der Plan schaut so weit voraus, wie Preise bekannt sind, meist bis morgen Abend. Solcast sagt auch die Tage danach vorher (Tag 3 bis 7). Bringen mindestens **zwei Tage hintereinander** direkt nach dem letzten bekannten Preis fast keine Sonne (weniger als ein Viertel deines erwarteten Verbrauchs), passiert Folgendes:

- Batterijplan berechnet das Defizit dieser Tage, für höchstens drei Tage. Der Plan hält bis zu diesem Defizit Ladung in der Batterie, nie mehr als die nutzbare Kapazität.
- Das ist keine harte Regel. Für den Plan ist eine kWh unter dieser Grenze so viel wert wie der **Durchschnittspreis** der bekannten Viertelstunden, denn so viel kostet Strom, den du später ohnehin kaufen musst. Der Plan lädt also nur in Viertelstunden nach, die günstiger sind als dieser Durchschnitt, und wählt selbst die günstigsten.
- **In Flandern** bleibt der Plan unter der Spitzengrenze: der Kapazitätstarif ist Teil derselben Berechnung.
- Hast du nur die Sensoren von heute und morgen, weil du selbst einen Sonnensensor eingetragen hast? Dann funktioniert dieser Teil nicht, und der Plan rechnet wie früher.
- **Bei einem Festvertrag mit Zweitarif** lädt HBC nachts schon bis zu seinem Ladeziel, und dieses Ziel ist höher, wenn wenig Sonne kommt. Daran ändert sich nichts.

Du siehst es im Attribut `donker` von `sensor.batterijplan`: `vloer` (kWh), `dagen`, `tekort`, `reden`, `vanaf`.

## Reserve, die mitlernt

Der Plan hält immer eine Reserve in der Batterie, die er nicht einplant. Früher war das nur deine **Sicherheitsmarge** (standardmäßig 0,3 kWh). Jetzt lernt die Reserve mit:

- **Ohne Daten** beträgt die Reserve 20 % der Kapazität.
- **Mit besseren Vorhersagen** sinkt sie bis auf mindestens 3 %. Dabei zählt nur die schwächere der beiden Vorhersagen: der Verbrauch (die Zuverlässigkeit, die du schon im Dashboard siehst) und die Sonne (die Vorhersage vom Morgen gegen die gemessene Sonne, über die letzten 14 Tage, ab 3 Tagen).
- **Deine eigene Sicherheitsmarge ist die Untergrenze**, die Kapazität die Obergrenze.

Für die Sonnenmessung ist der Sensor für die Solarleistung nötig (*Einstellungen*, *Sensoren*). Ohne ihn zählt nur die Verbrauchsvorhersage.

Du siehst es in `reserve_plan` (`kwh`, `eigen`, `geleerd`, `betrouwbaar`) und `zon_betrouwbaar` (`pct`, `dagen`, `afwijking_kwh`) von `sensor.batterijplan`.

## Verbrauch pro Wochentag (Selbsttest)

Das normale Profil ist ein Durchschnitt pro Tagesstunde über die letzten 7 Tage. Batterijplan lernt jetzt auch ein Profil pro **Wochentag × Stunde**, über die letzten 4 Wochen. Das neue Profil wird zuerst getestet:

- **Vorhersagen.** Jede Viertelstunde sagen beide Profile den Verbrauch vorher, **bevor** der gemessene Verbrauch gelernt wird.
- **Vergleichen.** Danach wird der Fehler beider notiert.
- **Wählen.** Das Wochentagsprofil wird erst genutzt, wenn sein Fehler über die letzten 14 Tage (mindestens 7 Tage an Vergleichen) mindestens **10 % kleiner** ist. Sonst bleibt das normale Profil.

Das Profil steht in der eigenen Speicherdatei von Batterijplan, nicht im Recorder. Das Ergebnis siehst du im Attribut `weekprofiel` von `sensor.batterijplan_verbruiksprofiel`:
- `actief`;
- `fout_week` und `fout_7d`, der mittlere Fehler in W;
- `kwartieren`;
- `reden`.

## In jeder günstigen Viertelstunde laden (Regel)

HBC lädt bei *Dynamic* nur in den Viertelstunden aus dem Netz, die HBC selbst günstig nennt, und höchstens *Cheapest hours* pro Tag. Mit dieser Regel an:

- **Günstige Viertelstunden selbst erkennen.** Batterijplan nutzt dieselbe Regel wie HBC: die günstigste Viertelstunde gegen die teuerste, solange der Unterschied mindestens die HBC-Schwelle ist. Nur die **maximale Zahl günstiger Stunden** fällt weg.
- **Darin laden.** Der Plan darf in solchen Viertelstunden aus dem Netz laden, wenn das günstiger ist.
- **HBC auf Charge.** Liegt ein Ladeblock außerhalb der günstigen Stunden von HBC, stellt Batterijplan die **HBC-Strategie für diesen Block auf Charge** und danach wieder auf **Dynamic**. Charge nutzt denselben Ladeablauf und dasselbe Ladeziel wie eine günstige Viertelstunde unter Dynamic.
- **Nur aus Dynamic.** Steht HBC auf etwas anderem, das du gewählt hast (Timed, Full stop, Self-consumption …), übernimmt Batterijplan nicht. Wählst du während eines solchen Blocks selbst eine andere Strategie, bleibt diese.
- **Live aus** stellt HBC sofort zurück auf Dynamic.

Die Regel ist standardmäßig **aus**, weil sie die Hauptstrategie von HBC wechselt. Du findest sie unter *Einstellungen*, *Regeln*.

## Verkaufsreserve automatisch (Regel)

Die Strategie *Sell* von HBC hat die Einstellung *Sell until*. Steht sie auf *energy reserve*, verkauft HBC mit voller Leistung, bis die Energie in der Batterie gleich *Keep energy in reserve* ist. Danach macht HBC mit *Then use* weiter, zum Beispiel *Self-consumption*. Batterijplan sagt pro Viertelstunde nur, *dass* HBC verkauft, nicht wie viel. Mit dieser Regel an:

- **Reserve aus dem Plan.** Jede Viertelstunde rechnet Batterijplan aus, wie viel Energie dein Haus bis zur nächsten günstigen Viertelstunde noch aus der Batterie braucht. Solarüberschuss unterwegs zählt mit. Dazu kommt die Reserve des Plans. Die Zahl wird auf die Schrittweite der HBC-Einstellung aufgerundet und bleibt innerhalb von Minimum, Maximum und nutzbarer Kapazität.
- **In HBC setzen.** Mit Live an trägt Batterijplan diese Zahl in *Keep energy in reserve* ein. Das geschieht nur bei mindestens 0,5 kWh Unterschied (oder einem Schritt der Einstellung, wenn der größer ist) und höchstens einmal pro Viertelstunde.
- **Der Plan rechnet mit.** Im Plandiagramm hört eine Sell-Viertelstunde bei dieser Reserve auf. Danach tut sie, was *Then use* tut: bei *Self-consumption* oder *Zero import* nutzt das Haus die Batterie, sonst bleibt die Ladung stehen. Das gilt auch mit Live aus, damit du im Schattenmodus siehst, was passieren würde.
- **Dein eigener Wert kommt zurück.** Beim ersten Mal merkt sich Batterijplan deinen Wert. Die Regel ist nur aktiv mit Live an, HBC auf *Dynamic*, *Sell until* auf *energy reserve* und einem dynamischen Vertrag. Fällt eines davon weg oder entfernst du die Integration, setzt Batterijplan deinen Wert sofort zurück und die Zeile zeigt *nicht aktiv* mit dem Grund. Ein *Charge*, das Batterijplan selbst für einen Ladeblock setzt, zählt als *Dynamic*: darum herum bleibt die Regel aktiv. Änderst du den Wert selbst, während die Regel arbeitet, wird das dein neuer eigener Wert.
- **Nur mit *Sell until: energy reserve*.** Steht *Sell until* auf etwas anderem, tut die Regel nichts und die Statuskarte sagt warum. Batterijplan ändert *Sell until* und *Then use* nie.

### Beispiel

Um 17:00 beginnt die teure Abendspitze und in der Batterie sind 9 kWh. Dein Haus braucht bis 02:00, dem nächsten günstigen Zeitpunkt, noch 5 kWh. In HBC steht *Keep energy in reserve* fest auf 3 kWh.
- **Ohne diese Regel** verkauft HBC bis zu den festen 3 kWh: 6 kWh gehen weg. Um 21:00 ist die Batterie leer und du kaufst 2 kWh zum Abendpreis.
- **Mit dieser Regel** setzt Batterijplan die Reserve auf 5 kWh. HBC verkauft 4 kWh und dein Haus kommt bis 02:00 aus.

Der Vorteil: du verkaufst nur, was du wirklich übrig hast, und kaufst später keinen teuren Strom zurück. Die Marge von Batterijplan (die lernende Reserve, mit deiner eigenen *Sicherheitsreserve* als Minimum) kommt immer dazu, die Reserve liegt also nie unter dieser Marge.

Die gewählte Reserve steht auf der Statuskarte (Zeile *Verkaufsreserve*) und bei den Regeln im Briefing. Für eigene Karten hat `sensor.batterijplan` das Attribut `verkoopreserve` mit:
- `aan` und `actief`, und `reden`, wenn sie nicht arbeitet;
- `kwh`: was Batterijplan in HBC setzt;
- `in_hbc`: was jetzt in HBC steht;
- `eigen`: dein gespeicherter eigener Wert;
- `plan_kwh`: der Hausverbrauch bis zur nächsten günstigen Viertelstunde, ohne die Reserve.

Die Regel ist standardmäßig **aus**. Du findest sie unter *Einstellungen*, *Regeln*.

## Namen für eigene Karten und HBC+

Seit 2.0.0 hat `sensor.batterijplan_zon_voor_hbc` die Attribute `laaddoel_kwh` (das Ladeziel für HBC) und `zon_voor_huis` (HBC's *solar reserved for house*). Die Attribute `doel` und `reserve` sind **alt, werden ersetzt durch laaddoel_kwh und zon_voor_huis**. Sie haben dieselben Werte und bleiben vorerst, damit bestehende Karten nicht brechen. Die vier Attribute sind immer da, auch mit Live aus. Steuert Batterijplan das Ladeziel nicht (zum Beispiel mit Live aus), sind `laaddoel_kwh` und `doel` leer (`null`). `zon_voor_huis` und `reserve` sind nur leer, wenn der Wert von HBC unbekannt ist.
