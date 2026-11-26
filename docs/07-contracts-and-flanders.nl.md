# 07 · Contracten, daluren en Vlaanderen

*English: [07-contracts-and-flanders.md](07-contracts-and-flanders.md) · Deutsch: [07-contracts-and-flanders.de.md](07-contracts-and-flanders.de.md)*

> **Nieuw in 2.0.0.** Dit hoofdstuk beschrijft de contractvormen en het Vlaamse capaciteitstarief. De nieuwe rekenonderdelen staan in [08 · Slimmer rekenen](08-calculation.nl.md).

**In het kort**
- Je kiest je **soort contract**: *Vast* of *Dynamisch*. Bij *Vast* kies je ook een **tarief**: *enkel* of *dubbel*.
- *Dynamisch* werkt zoals voorheen. Bij *Vast* maakt Batterijplan geen plan op prijs: HBC blijft op **Self-consumption**, en in de daluren van een dubbel tarief laadt het van het net, maar **alleen als dat loont**.
- Het **land** komt nu uit Home Assistant. Een aparte schakelaar **Vlaanderen (capaciteitstarief)** zet de kwartierberekening voor het Vlaamse capaciteitstarief aan.

## Soort contract en tarief

Open *Instellingen*, tabblad **Contract**.

| Instelling | Wat het doet |
|---|---|
| **Soort contract** | *Dynamisch*: HBC op Dynamic en Batterijplan maakt het plan, zoals voorheen. *Vast*: geen plan op prijs. |
| **Tarief** (alleen bij *Vast*) | *Enkeltarief*: één prijs de hele dag. *Dubbeltarief*: een normaaltarief en een daltarief. |
| **Prijs per kWh** / **Normaaltarief** en **Daltarief** | Je prijzen inclusief belastingen en btw. De velden houden vijf decimalen, want leveranciers geven er vijf. Op het dashboard zie je twee decimalen. |
| **Terugleververgoeding per kWh** | Wat je krijgt voor teruggeleverde stroom. HBC heeft hier zelf geen instelling voor, daarom vul je hem hier in. |

Rijen die niet bij je keuze passen staan grijs met een korte reden (bijvoorbeeld *Alleen bij een dynamisch contract*). Er wordt niets verborgen of weggehaald.

Batterijplan verandert HBC alleen als **Live** aanstaat. Het onthoudt je eigen HBC-strategie en geeft die terug als Live uitgaat of je terug naar *Dynamisch* gaat.

## Wat HBC doet bij een vast contract

- **Buiten de daluren: Self-consumption (NOM, "nul op de meter").** De batterij dekt het huisverbruik en laadt met zonneoverschot, binnen het laad- en ontlaadvermogen van je batterijen.
- **In de daluren van een dubbel tarief: Charge**, van het net tot het laaddoel van HBC, **alleen als het loont** (zie hieronder). Anders blijft HBC de hele tijd op Self-consumption.

### Daluren, weekend en feestdagen

- **Nachturen:** van *Nacht begint* tot *Nacht eindigt*. Standaard: **23:00–07:00** in Nederland, **22:00–07:00** in België. Sommige netbeheerders beginnen eerder (Enexis: 21:00): stel het uur zelf in.
- **Weekend en feestdagen als daluren:** een schakelaar, standaard **aan** in Nederland en **uit** in België. Aan = zaterdag, zondag en erkende feestdagen zijn de hele dag dal.
  - Nederland: 1 januari, 2e paasdag, Koningsdag (27 april, 26 april als de 27e een zondag is), Hemelvaart, 2e pinksterdag, 25 en 26 december.
  - België: 1 januari, paasmaandag, 1 mei, Hemelvaart, pinkstermaandag, 21 juli, 15 augustus, 1 november, 11 november, 25 december.
  - Andere landen: alleen het weekend.

### Loont laden van het net?

Laden van het net in de daluren loont alleen als het prijsverschil groot genoeg is om de verliezen in de batterij te dekken. Batterijplan gebruikt hiervoor één drempel, **dezelfde als HBC zelf gebruikt**: de HBC-instelling *Dynamic threshold delta* (in ct). Er is geen eigen vaste waarde.

- **Verschil (normaaltarief − daltarief) minstens de drempel:** HBC gaat in de daluren op Charge.
- **Verschil onder de drempel:** HBC blijft op Self-consumption. De briefing zegt: *Laden van het net levert niets op: verschil 2,7 ct, drempel 6,0 ct*, en de regel *Nachtladen* toont *uit (loont niet)*.
- **Uitzondering, Vlaanderen aan:** laden in de daluren mag dan om de reserve voor pieken te vullen, los van het prijsverschil, maar alleen zolang er ruimte is onder de doelgrens.

## Welk contract kies ik?

- **Je hebt een dynamisch contract** (prijs per uur of kwartier): kies *Dynamisch*. HBC staat op Dynamic en Batterijplan maakt het plan. Wil je ook laden buiten de goedkope uren van HBC, zet dan de regel *Laden in elk goedkoop kwartier* aan (zie [08 · Slimmer rekenen](08-calculation.nl.md)).
- **Je hebt een vast contract met één prijs**: kies *Vast* en *Enkeltarief*. HBC blijft op Self-consumption. Laden van het net levert dan niets op, dus dat gebeurt niet.
- **Je hebt een vast contract met een dag- en nachtprijs** (Nederland: normaal- en daltarief, België: dag- en nachtprijs): kies *Vast* en *Dubbeltarief*, en vul beide prijzen in. In de daluren laadt HBC alleen als het verschil minstens de drempel van HBC is.
- **Je woont in Vlaanderen**: kies je contract zoals hierboven, en zet daarnaast de schakelaar *Vlaanderen* aan voor het capaciteitstarief. Dat werkt bij elk contract.
- **Twijfel je?** Kijk op je energierekening: staat er een prijs per uur of kwartier, dan is het dynamisch. Anders is het vast.

### Wat stel je in HBC in?

Volgens de HBC-documentatie (*docs/03-strategies.md*):
- **Dynamisch**: zet HBC op de strategie **Dynamic**. Daarvoor heeft HBC de integratie *Cheapest Energy Hours* en een prijsbron nodig. Kies in Batterijplan het contract **Dynamisch**. Met Live aan zet Batterijplan elk kwartier de Dynamic-standen van HBC.
- **Vast, enkeltarief**: zet HBC op **Self-consumption**. HBC houdt de netmeter dan rond 0 W: de batterij laadt met zonoverschot en levert aan het huis. Kies in Batterijplan het contract **Vast** met **Enkeltarief**.
- **Vast, dubbeltarief**: zet HBC ook op **Self-consumption**. Kies in Batterijplan het contract **Vast** met **Dubbeltarief**. Met Live aan zet Batterijplan HBC in de daluren zelf tijdelijk op *Charge* als nachtladen loont, en daarna weer terug. Je hoeft daarvoor in HBC geen *Timed* in te stellen.

## Land uit Home Assistant

De landinstelling van Batterijplan is vervallen. Batterijplan leest het land uit Home Assistant (*Instellingen → Systeem → Algemeen*): **NL**, **BE** of **DE**; alles anders telt als Nederland. Het land bepaalt de daluren, de feestdagen en de woorden (normaaltarief / daltarief in Nederland, dagprijs / nachtprijs in België, HT / NT in Duitsland).

> **Duitsland:** het land in Home Assistant moet **DE** zijn voor de Duitse regels (vaste terugleververgoeding).

## Vlaanderen (capaciteitstarief)

De schakelaar **Vlaanderen (capaciteitstarief)** (standaard uit, los van het land van Home Assistant) zet aan:

- de **kwartierberekening** uit je netvermogenssensor (het gemiddelde per kwartier, zoals de meter);
- de **maandpiek**: het hoogste kwartiergemiddelde van je netto afname deze maand;
- de **doelgrens**: de hoogste van je maandpiek tot nu, **2,5 kW** en je eigen grens;
- de **importgrens van HBC** (alleen als Live aanstaat): binnen een kwartier zet Batterijplan het toegestane importvermogen zo dat het kwartier onder de doelgrens blijft (`(budget − al afgenomen) / resterende uren`, minstens 0,5 kW). Het schrijft alleen als de waarde meer dan 100 W verandert en hooguit één keer per minuut, en op elke kwartierwissel gaat het terug naar de doelgrens. Je eigen HBC-waarden (grens aan/uit en waarde) worden onthouden en teruggegeven als Live of Vlaanderen uitgaat.
- alles in **kW** met één decimaal.

Instellingen op het tabblad **Vlaanderen**: het capaciteitstarief in €/kW/jaar (standaard 55) en een optionele **eigen grens** in kW (0 = geen).

### De kaarten *Piek deze maand* en *Lopend kwartier*

Ze staan in het venster **Piek** en zijn alleen zichtbaar als Vlaanderen aan staat.

- **Piek deze maand:** per dag de hoogste kwartierpiek (gevulde lijn) met de doelgrens (stippellijn), en een grijze lijn voor de piek die je **zonder batterij** had gehad. Daaronder de maandpieken van de laatste 12 maanden, nieuw naar oud, met een trendpijl, de piek **met** en **zonder** batterij en de besparing van die maand (verschil in kW × tarief ÷ 12). Beide pieken tellen minstens 2,5 kW, zoals Fluvius rekent. Daaronder: het gemiddelde van de laatste 12 maandpieken met en zonder batterij en de besparing per jaar.
- **Lopend kwartier:** het gemiddelde tot nu, wat nog mag en de HBC-grens die nu is ingesteld.

*Zonder batterij* is je netafname plus het batterijvermogen (ontladen +, laden −), met dezelfde kwartierberekening.

## Het hoofdscherm bij een vast contract

- **Briefing:** contract en tarief, de prijs nu, wanneer laden van het net begint of stopt (of dat het niet loont), de weekendregel, de terugleververgoeding en, met Vlaanderen aan, de maandpiek. De vier regels van het plan staan grijs (*Alleen bij dynamisch contract*). Het blok *Regels* toont bij een dubbel tarief *Nachtladen* en *Weekend en feestdagen als dal*, en *Vlaanderen* als die aan staat: alleen naam en aan/uit.
- **Statuskaart:** de HBC-strategie als *Self-consumption (normaaltarief)* of *Charge (daltarief)*, en de prijs nu met twee decimalen.
- **Grafiek:** de **gemeten lading** van de afgelopen uren, de **verwachte lading** (gestippeld) voor de komende 30 uur, de zonverwachting en de daluren als achtergrondband. Onder de grafiek één gekleurde balk per kwartier: **blauw** laden van het net (dal), **groen** ontladen voor het huis (NOM), **geel** laden met zon, **grijs** niets (batterij leeg of vol). De verwachte lading is een simulatie per kwartier: buiten de daluren Self-consumption met je geleerde huisverbruik en de zonverwachting, in de daluren Charge tot het laaddoel van HBC als dat loont. Verliezen zitten er niet in.
- **Tijdlijn** onder *Wat de batterij doet*, bijvoorbeeld *Nu: dekt je huisverbruik (NOM) · verwacht leeg rond 21:30 · 23:00–07:00 laden van het net tot 9,0 kWh · morgen overdag NOM, zon vult bij*. 'Vandaag', 'morgen' en een weekdagnaam tellen vanaf nu.
- **Venster Vandaag en het Rapport:** geen plan-teksten. Ze tonen het contract, de prijzen, de daluren, of nachtladen loont, het NOM-gedrag en het zelfverbruik via de batterij (kWh naar het huis, geladen met zon, geladen van het net). Met Vlaanderen aan heeft het rapport ook een sectie *Capaciteitstarief (Vlaanderen)*.

### Wat de batterij oplevert bij een vast contract

*Opbrengst* waardeert elk kwartier tegen jouw prijzen: ontladen voor het huis telt tegen de prijs, laden van het net kost de prijs, laden met zon kost de terugleververgoeding die je daardoor niet meer krijgt, en ontladen naar het net levert de terugleververgoeding op.

## Bijwerken vanaf 1.1.0 (of een eerdere pre-release)

Er gaat niets verloren. Bij de eerste start van 2.0.0-dev1:

- een opgeslagen land **BE** zet de schakelaar **Vlaanderen** aan; het land zelf komt nu uit Home Assistant;
- de landinstelling en de proefmodus van de eerdere testversies verdwijnen, met hun entities;
- een contract *dag/nacht* van een eerdere testversie wordt *Vast* met een *dubbeltarief*;
- je geleerde verbruik, de teller en alle andere instellingen blijven zoals ze zijn.
