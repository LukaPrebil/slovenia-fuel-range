export const sl = {
	'page.title': 'Koliko kilometrov za 100 evrov energije',
	'page.subtitle':
		'Kilometri za 100 € energije v najbolje prodajanih modelih (levo) in v modelih, ki jih Slovenci dejansko vozijo (desno). Razvrščeno po dosegu.',
	'page.legendGhost': 'elektrika na javni polnilnici ({price} €/kWh)',
	'page.distances': 'Črtkane črte so cestne razdalje od Ljubljane (OSRM): {list}.',

	'city.dunaj': 'Dunaj',
	'city.rim': 'Rim',
	'city.pariz': 'Pariz',
	'city.lizbona': 'Lizbona',

	'panel.a.title': 'Najbolje prodajani modeli, 2025',
	'panel.a.subtitle':
		'Prve registracije novih osebnih avtomobilov: 20 najbolje prodajanih + 5 električnih.',
	'panel.b.title': 'Kaj dejansko vozimo',
	'panel.switch': 'Kateri prikaz',
	'panel.b.subtitle':
		'Registrirani vozni park po modelih (ocena, konec 2024) + trije najštevilčnejši električni.',

	'powertrain.bencin': 'bencin',
	'powertrain.dizel': 'dizel',
	'powertrain.hibrid': 'hibrid',
	'powertrain.elektrika': 'elektrika',

	'unit.perYear': '{eur} €/leto',
	'unit.per100km': '{eur} €/100 km',
	'unit.km': '{km} km',

	'prices.heading': 'Cene energije',
	'prices.bencin': 'Bencin 95 (€/l)',
	'prices.dizel': 'Dizel (€/l)',
	'prices.elektrika': 'Domača elektrika (€/kWh)',
	'prices.javnoPolnjenje': 'Javno polnjenje (€/kWh)',
	'prices.reset': 'Ponastavi cene',
	'prices.overridden': 'Ročno nastavljeno',
	'prices.resetOne': 'Ponastavi to ceno',

	'controls.annualKm': 'Letni prevoženi kilometri',
	'controls.realWorld': 'Realna poraba',
	'controls.realWorldHint':
		'Uradna poraba je v povprečju nižja od realne: bencin +20 %, dizel in hibrid +18 %, elektrika +19 %.',

	'car.heading': 'Tvoj avto',
	'car.search': 'Poišči model',
	'car.searchPlaceholder': 'npr. Octavia, Clio, Model 3',
	'car.noResults': 'Ni zadetkov. Vnesi porabo ročno spodaj.',
	'car.manualHeading': 'Ni na seznamu?',
	'car.manualPowertrain': 'Pogon',
	'car.manualConsumption': 'Poraba (na 100 km)',
	'car.manualLabel': 'Ročni vnos',
	'car.manualApply': 'Prikaži moj avto',
	'car.clear': 'Odstrani svoj avto',
	'car.personal': 'tvoj avto',
	'car.loading': 'Nalagam seznam modelov …',
	'car.resultLabel': '{model} ({variant})',

	'freshness.window': 'Cene goriv: {from} – {to}. Seznam porabe: {asOf}.',
	'freshness.stale': 'Podatki so stari več kot 14 dni. Preveri datum veljavnosti.',

	'theme.label': 'Tema',
	'theme.light': 'svetla',
	'theme.dark': 'temna',
	'theme.system': 'sistemska',

	'language.label': 'Jezik',

	'source.heading': 'Viri in metoda',
	'source.method':
		'Poraba je uradna, WLTP, iz seznama ARSO za vsak model, ki je pri nas naprodaj. Pri starejših generacijah voznega parka je uradni podatek tiste generacije (NEDC) preračunan s faktorjem 1,21. Za vsak model je izbrana vstopna različica. Vozni park po modelih je ocena iz medijske analize registrskih podatkov, ne uradna statistika.',
	'source.note':
		'Realna poraba je v povprečju višja od uradne: bencin +20 %, dizel in hibrid +18 %, elektrika +19 % (EC/TNO). Priključni hibridi niso prikazani, ker njihov uradni podatek odstopa za 240–500 %. Nakupne cene niso del izračuna.',
}

export type Messages = typeof sl
export type MessageKey = keyof Messages
