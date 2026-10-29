# 03 · Hoe het werkt

*English: [03-how-it-works.md](03-how-it-works.md) · Deutsch: [03-how-it-works.de.md](03-how-it-works.de.md)*

**In het kort**
- HBC zegt per kwartier: goedkoop, duur of gewoon. Batterijplan kijkt vooruit tot het volgende goedkope moment en beslist welke dure kwartieren de lading krijgen.
- Batterijplan kiest alleen tussen standen die HBC zelf aanbiedt. Alle beveiligingen blijven bij HBC en de batterij.
- Alles wat Batterijplan doet, komt in het logboek van Home Assistant onder de naam "Batterijplan".

## Het probleem dat Batterijplan oplost

HBC (strategie **Dynamic**) geeft elk kwartier een label:
- **goedkoop**: laden van het net;
- **duur**: ontladen voor het huis;
- **gewoon**: alleen laden met zon (stand *Charge PV*).

Dat werkt goed, maar HBC kijkt niet of de batterij genoeg lading heeft voor *alle* dure kwartieren tot de volgende laadkans. De makers van HBC noemen dat zelf als beperking. Gevolg: de batterij raakt leeg bij een duur moment van 27 ct, terwijl er een uur later een moment van 50 ct komt.

## Het plan

Elk kwartier, ± 45 seconden voor het begin, rekent Batterijplan vooruit tot het volgende goedkope moment. Het kijkt daarbij naar:
- hoeveel lading er nu in de batterijen zit (het laadpercentage boven de ondergrens van HBC, maal de bruikbare capaciteit);
- hoeveel je huis op dat uur van de dag gewoonlijk verbruikt (dat leert het zelf);
- hoeveel zon er verwacht wordt (Solcast, de voorzichtige schatting);
- welke dure kwartieren er nog komen en wat ze kosten.

Daarna:

| Situatie | Wat Batterijplan doet | Stand in HBC |
|---|---|---|
| Duur kwartier dat de lading krijgt | **ontladen** voor het huis | dure stand *Self-consumption* |
| Duur kwartier dat geen lading krijgt (er komt later een duurder kwartier) | **vasthouden voor later** | dure stand *Standby / peak shave* |
| Gewoon kwartier, er zit meer in de batterij dan nodig tot het goedkope moment | **overschot ontladen** in de duurste gewone kwartieren | gewone stand *Self-consumption* |
| Gewoon kwartier zonder overschot | niets, HBC doet het gewoon | gewone stand *Charge PV* |
| Goedkoop kwartier | niets, HBC laadt | *Charge* |

Komt er tussen twee pieken zon of een goedkoop moment? Dan rekent Batterijplan dat mee als bijladen, en mag de eerste piek gewoon ontladen.

## Overschot ontladen

Soms zit er meer in de batterij dan het huis tot het volgende goedkope moment nodig heeft. Zonder Batterijplan blijft die lading staan en laadt HBC straks bij met een al bijna volle batterij. Batterijplan gebruikt dat overschot liever nu, in de duurste gewone kwartieren, als dat meer oplevert dan het terugladen kost (inclusief verlies in de batterij). Het houdt altijd de veiligheidsmarge vast.

## Leren

Batterijplan meet het huisverbruik per kwartier (net + zon + batterij, min de laadpaal) en bouwt per uur van de dag een profiel op:

| Status | Na | Betekenis |
|---|---|---|
| aan het leren | 0–3 dagen | Na de eerste dag doet het al mee, maar het is nog onrustig. |
| grof | 4–6 dagen | Bruikbaar, maar één rare dag weegt nog zwaar. |
| prima | 7+ dagen | Goed ingeregeld. Daarna leert het glijdend door over ongeveer 4 weken: oude dagen doven langzaam uit, zodat het met de seizoenen meegaat. |

Waarom 7 dagen? Een proef met 89 dagen echte meetdata liet zien dat een kort geheugen het verbruik iets beter voorspelt dan een lang geheugen.

De **voorspelling** legt de verwachting naast het echte verbruik, per blok van 3 uur (00–03, 03–06 enzovoort). Een kwartier is te grillig om te voorspellen; een blok van 3 uur is wat er voor het plan echt toe doet. Je ziet een oordeel: *wisselvallig* (onder 55 %), *redelijk* (55 % of meer), *goed* (65 % of meer) *zeer goed* (75 % of meer) of *uitstekend* (85 % of meer). Het percentage zelf staat in de sensor `sensor.batterijplan_voorspelling` (eigenschap *betrouwbaarheid*), glijdend over de laatste 7 dagen.

**Wisselvallig verbruik.** Is de voorspelling *wisselvallig*, dan rekent het plan zelf met **extra marge** bovenop je eigen veiligheidsmarge: de gemiddelde afwijking per blok van 3 uur, maximaal 1 kWh. Het plan ontlaadt dan in iets minder dure kwartieren en houdt wat meer vast, zodat de batterij minder vaak te vroeg leeg raakt. Op de statuskaart staat dan bijvoorbeeld "extra marge 0,5 kWh". Wordt de voorspelling weer redelijk of beter, dan valt de extra marge vanzelf weg.

Het leren loopt altijd door, ook in schaduwmodus en ook als HBC niet op Dynamic staat.

## Live zetten

Zet op het dashboard **Live** aan. Vanaf dat moment past Batterijplan elk kwartier de twee Dynamic-standen van HBC aan zoals in de tabel hierboven. Elke wijziging komt in het logboek.

**Live weer uit?** Dan zet Batterijplan beide standen direct terug naar jouw eigen standen. HBC is dan weer helemaal zoals voorheen.

## Jouw eigen HBC-standen

Batterijplan onthoudt jouw standen voor de dure en de gewone periode:
- op het moment dat je *Live* aanzet;
- en elke keer dat je ze verandert terwijl *Live* uit staat.

Die standen zet het terug als *Live* uitgaat of als HBC Dynamic verlaat. Nog niets onthouden? Dan zet het *Self-consumption* en *Charge PV* terug.

Batterijplan stuurt alleen bij waar dat past:
- de **dure periode** alleen als jouw stand daar *Self-consumption* is;
- de **gewone periode** alleen als jouw stand daar *Charge PV* is.

Gebruik je in de dure periode bijvoorbeeld **Sell** (terugleveren voor geld), dan blijft Batterijplan daar af. HBC doet dan zijn eigen werk.

## Als HBC niet op Dynamic staat

Kies jij (of een automatisering, bijvoorbeeld bij een negatieve prijs) een andere strategie in HBC, dan:
- staat Batterijplan stil: de plankaart zegt "Batterijplan staat stil: HBC staat op …";
- telt de teller niets op;
- zet Batterijplan, als *Live* aan stond, de twee Dynamic-standen terug naar jouw eigen standen;
- gaat het leren gewoon door.

Zodra HBC weer op Dynamic staat, rekent het plan direct opnieuw en stuurt het meteen weer bij.

## Advies voor HBC

In HBC vul je in hoeveel zonne-energie je huis op een dag zelf direct opmaakt (*Solar reserved for house*). HBC rekent: verwachte zon min dat getal is wat er overblijft voor de batterij; de rest laadt HBC in het goedkope blok van het net.
- Staat het getal **te hoog**, dan laadt HBC meer van het net dan nodig.
- Staat het **te laag**, dan is de batterij 's avonds te leeg voor de dure uren.

Het juiste getal verschilt per dag en per seizoen. Batterijplan rekent elke dag uit wat je huis op zon kan gebruiken: per half uur het kleinste van je geleerde verbruik en de verwachte zon (Solcast, middelste schatting). Het vergelijkt het gemiddelde van de laatste 7 dagen met jouw instelling. Pas bij 1 kWh of meer verschil krijg je een advies, afgerond op een halve kWh. **Batterijplan verandert de instelling in HBC nooit zelf.**

## De teller: wat levert het op

Elk kwartier rekent Batterijplan het vorige kwartier af:
- **Vasthouden:** de lading telt mee tegen de gemiddelde prijs van de dure kwartieren waar het plan haar later voor inzet.
- **Ontladen in een duur kwartier:** het verschil met wat HBC alleen had gedaan.
- **Overschot ontladen:** alleen de lading die echt uit de batterij ging (niet meer dan gepland). Wat je daardoor niet hoeft te kopen, min wat het kost om die lading op het goedkope moment terug te laden.

Alle bedragen zijn inclusief btw. **Schaduw** telt apart van **live**. Het blijft een schatting; je energierekening is het echte bewijs.

**Kale of all-in prijzen.** Geeft HBC kale beursprijzen, dan telt Batterijplan zelf de energiebelasting, de inkoopvergoeding en de btw erbij. Geeft HBC all-in prijzen, kies dan bij *Prijzen van HBC* voor *all-in*: Batterijplan rekent dan met de prijs zoals hij is.

## Vergelijking met HBC alleen

In de grafiek *Prijs en batterij* rekent Batterijplan ook uit hoe de lading was verlopen als HBC het alleen had gedaan: ontladen in elk duur kwartier, op volgorde. Dat is de rode stippellijn. De chip *Extra t.o.v. HBC alleen* is het geschatte verschil in euro voor die dag.

## Wat het (nog) niet doet

- **Zelf extra laden 's nachts:** dat wordt alleen uitgerekend en getoond.
- **Een goedkope middag die HBC niet als goedkoop markeert** (door de grens van uren per dag of het minimale prijsverschil in HBC) telt niet als bijladen.
- **Verschil tussen werkdag en weekend** in het verbruik.
- **Terugleveren aan het net voor geld** (Sell): Batterijplan is gericht op eigen verbruik. Gebruik je Sell in HBC, dan blijft Batterijplan van die periode af (zie [Jouw eigen HBC-standen](#jouw-eigen-hbc-standen)). Wat Sell oplevert, laat Batterijplan (nog) niet zien.
