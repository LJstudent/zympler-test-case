# Design Note

Een energierekening en de bijbehorende energiestromen zijn voor veel ondernemers moeilijk te begrijpen. Daarom heb ik de interface ontworpen met één doel: complexe informatie zo eenvoudig en overzichtelijk mogelijk presenteren, zodat een operator snel kan zien hoe de installatie presteert.

Om de leercurve zo klein mogelijk te maken, krijgt een nieuwe gebruiker bij de eerste keer opstarten een korte interactieve tutorial. Vervolgens komt de gebruiker op een overzichtspagina waar in één oogopslag de status van de volledige installatie zichtbaar is. In de sidebar zijn alle assets direct bereikbaar, terwijl de System Info direct laat zien of er errors of warnings zijn. Daarnaast bevat de overzichtspagina alleen de belangrijkste KPI's, zodat de gebruiker niet direct wordt overspoeld met informatie.

Wanneer een gebruiker een asset opent, verschuift de focus van een hoog-over overzicht naar detail. Elke asset bevat een eenvoudige standaardweergave voor dagelijks gebruik en een uitgebreidere breakdown voor gebruikers die de energiestromen verder willen analyseren. Vrijwel alle onderdelen zijn voorzien van tooltips, zodat begrippen en berekeningen direct kunnen worden toegelicht zonder dat de interface drukker wordt.

Onder iedere grafiek worden aanvullende KPI's weergegeven die specifiek zijn voor de geselecteerde asset. Wanneer de gebruiker de breakdown-weergave inschakelt, veranderen deze KPI's mee en tonen ze extra inzichten die relevant zijn voor de onderliggende energiestromen. Hierdoor krijgt iedere asset informatie die past bij zijn eigen functie binnen het energiesysteem.

Bij het ontwerp heb ik bewust gekozen voor een rustig en neutraal kleurenpalet. De interface is bedoeld voor operators die dagelijks met het systeem werken. Te veel felle of alarmerende kleuren kunnen onnodig onrust veroorzaken. Tijdens mijn eerdere werkzaamheden bij Planetpod heb ik ervaren dat een interface met veel verschillende signaalkleuren juist averechts kan werken. Daarom worden kleuren in deze applicatie alleen gebruikt wanneer ze daadwerkelijk een betekenis hebben en niet als decoratie.

Voor de batterij heb ik de KPI's _Savings_ en _Profit_ samengevoegd tot één overzicht. Dit voorkomt dat gebruikers meerdere financiële indicatoren moeten interpreteren en maakt direct duidelijk wat de totale economische bijdrage van de batterij is.

Om deze berekeningen mogelijk te maken heb ik de day-ahead elektriciteitsprijzen van ENTSO-E gebruikt. Deze gegevens waren niet opgenomen in de aangeleverde Excel-dataset en zijn daarom afzonderlijk opgehaald en geïntegreerd. Hierdoor kunnen de financiële KPI's worden berekend op basis van realistische marktprijzen over een volledig jaar.
