# 02 · Het dashboard

*English: [02-dashboard.md](02-dashboard.md) · Deutsch: [02-dashboard.de.md](02-dashboard.de.md)*

**In het kort**
- De startpagina beantwoordt één vraag: *wat doet Batterijplan nu, en haalt het meer uit de batterij dan HBC alleen?* Alles past op één scherm.
- Bovenaan een rij knopjes. Instellingen, sensoren, advies en opbrengst zitten achter een knopje en openen als venster.
- Elke eigen kaart heeft een **(i)** naast de titel, en op de statuskaart en in de instellingen heeft ook elke regel er een. Klik erop voor het venster *Hoe lees je dit?* Ga met de muis over een cijfer met een stippellijn voor een korte toelichting.
- Kleuren zijn overal hetzelfde: **groen** = ontladen in een duur kwartier, **oranje** = vasthouden voor later, **paars** = overschot ontladen.

<p align="center"><img src="images/dashboard.png" width="95%" alt="Batterijplan dashboard"></p>

De pagina heeft drie rijen:
1. de knoppenrij;
2. de statuskaart, met rechts daarnaast het plan;
3. de grafiek over de volle breedte.

## De knoppenrij

| Knopje | Wat het doet |
|---|---|
| **Live** (eigen schakelaar, vooraan) | Groen en aan = Batterijplan stuurt HBC bij. Uit = schaduwmodus: het rekent mee, maar stuurt niets. |
| **Opbrengst** | Opent *Wat levert het op*. |
| **Advies HBC** | Opent *Advies voor HBC*. |
| **Instellingen** | Opent de instellingen, met de tabbladen Basis en Expert. |
| **Sensoren** | Opent de sensornamen, de controle *huisverbruik nu* en de uitleg. |

Een **oranje stip** op een knopje betekent: hier is iets te doen. Bijvoorbeeld een advies om iets aan te passen, een instelling die niet is ingevuld of een sensor die niets meldt. Geen stip betekent dat alles goed staat.

Een venster sluit je met **‹ Terug** of ✕ bovenin, met een klik ernaast of met Esc. Het venster *Hoe lees je dit?* sluit je op dezelfde manier; je komt dan terug waar je was.

## Statuskaart

Bovenaan het logo, de naam en de versie, met de vraag die Batterijplan beantwoordt. Elke regel heeft rechts een **(i)** met uitleg.

| Regel | Betekenis |
|---|---|
| Modus | **live** — stuurt HBC, of **schaduw** — rekent mee, stuurt niets. |
| Verbruik leren | Tijdens het leren bijvoorbeeld "aan het leren · dag 3 van 7 · voorspelling redelijk". Na 7 dagen: "klaar met leren · voorspelling goed". |
| HBC-strategie | Moet **Dynamic** zijn. Staat er iets anders, dan wacht het plan. |
| Komend kwartier | Wat Batterijplan voor het volgende kwartier besluit. |

**De voorspelling** zegt hoe goed het geleerde verbruik het echte verbruik raakt, per blok van 3 uur. Je ziet alleen een oordeel, geen percentage:

| Oordeel | Kleur |
|---|---|
| nog aan het meten | gewone tekst |
| wisselvallig | gewone tekst |
| redelijk | lichtgroen |
| goed | groen |
| zeer goed | donkergroen |
| uitstekend | het donkerste groen |

## Plan vandaag en morgen

- Bovenaan vier cijfers: **In de batterij nu**, hoe lang er **ontladen in dure kwartieren** wordt, hoe lang er **vastgehouden voor later** wordt, en hoeveel **overschot** er ontladen wordt.
- Per dag een balk van 00:00 tot 24:00. Alleen de momenten waarop Batterijplan iets anders doet dan HBC hebben een kleur. Lege stukken betekenen: HBC doet het gewoon. De blauwe streep is nu.
- Daaronder de blokken in woorden, bijvoorbeeld "di 08:30–10:30 overschot ontladen · ± 0,65 kWh, ± € 0,10". Is er niets te doen: "Niets bij te sturen tot di 13:00: HBC doet het gewoon."
- De balk voor morgen verschijnt zodra HBC de prijzen van morgen heeft (meestal rond 13:00).

## Prijs en batterij

**De datumkiezer** staat rechts in de kopregel van de grafiek. Kies *Nu*, een andere dag, een week of een maand, en blader met ‹ ›.

- **Per dag:**
  - de grijze lijn is de stroomprijs per kwartier, zoals HBC hem geeft;
  - de gekleurde vlakken zijn de kwartieren waarin Batterijplan bijstuurt;
  - de blauwe lijn is de lading in kWh (as rechts): **doorgetrokken = gemeten**, **gestreept = verwacht volgens het plan**. Na het einde van het plan dooft hij uit;
  - de **rode stippellijn** is de lading als HBC het alleen had gedaan;
  - links van *Nu* is voorbij en iets gedempt.
- **Het verschil met HBC alleen** staat als een chip in de kop: *Extra t.o.v. HBC alleen*. Meer dan 0 staat er als **+ € 0,35** in groen, precies 0 als **€ 0,00** in grijs, minder dan 0 als **– € 0,02** in oranje. Dezelfde regel geldt voor *Opgeleverd in deze periode* en voor de bedragen in *Wat levert het op*.
- **Per week of maand:** een groene staaf per dag met wat Batterijplan geschat opleverde. Bovenaan het totaal, het gemiddelde per dag en de beste dag.
- Ga met de muis over de grafiek voor de prijs, wat de batterij deed en de lading in dat kwartier.

## Vensters achter de knopjes

**Wat levert het op**

| Regel | Betekenis |
|---|---|
| Totaal sinds … | De geschatte opbrengst bovenop HBC alleen. |
| waarvan schaduw | Wat het had opgeleverd terwijl *Live* uit stond. Dat geld heb je niet echt verdiend. |
| waarvan live | Wat het opleverde terwijl Batterijplan echt stuurde. |
| Kwartieren ontladen / vastgehouden / overschot | Hoe vaak Batterijplan elk van de drie dingen deed. |
| Lading verschoven naar duurdere momenten | Hoeveel kWh er door vasthouden later en duurder is gebruikt. |

**Advies voor HBC**

Eén regel over de HBC-instelling *Solar reserved for house* (hoeveel zonne-energie je huis zelf direct opmaakt):
- **Nog aan het meten** (grijs): het verbruik wordt nog geleerd of er is nog geen week gemeten.
- **Staat goed** (groen): je instelling ligt minder dan 1 kWh van wat er de laatste 7 dagen gemiddeld nodig was.
- **Aanpassen naar 5,5 kWh** (oranje): met eronder wat er nu is ingesteld en wat gemiddeld nodig was. Het knopje *Advies HBC* krijgt dan een oranje stip.

Is extra laden van het net vannacht zinvol, dan staat dat er ook bij. Batterijplan past HBC zelf nooit aan; jij beslist. Zie [03 · Hoe het werkt](03-how-it-works.nl.md#advies-voor-hbc).

**Instellingen**

Twee tabbladen, met eigen invoervelden (schuifbalk, keuzeknopjes, − waarde +) en bij elk veld een (i):

| Tabblad | Wat erop staat |
|---|---|
| **Basis** — instellen en vergeten | Bruikbare capaciteit, *Prijzen van HBC* (kaal of all-in), ingangsdatum contract, en de back-up: **Back-up maken**, **Back-up terugzetten** en **Standaardwaarden**. Eronder staat wanneer de laatste back-up is gemaakt. Terugzetten en standaardwaarden vragen eerst "Zeker? Tik nog een keer". |
| **Expert** — alleen aanpassen als je weet waarom | Veiligheidsmarge, rendement en energiebelasting + inkoop. |

Uitleg per veld staat ook in [01 · Installatie](01-installation.nl.md#stap-6--instellingen-invullen).

**Sensoren**

De namen van je sensoren voor net, zon, batterij en (optioneel) laadpaal. Tik op een veld voor een lijst met de vermogenssensoren uit jouw Home Assistant (de meest waarschijnlijke bovenaan) en kies; typen filtert de lijst. Onder elke naam staat wat die sensor nu meldt. Onderaan de controle *huisverbruik nu*.
