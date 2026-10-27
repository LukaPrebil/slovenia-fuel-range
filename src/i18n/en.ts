import type { Messages } from './sl.ts'

export const en: Messages = {
  'page.title': 'How far €100 of energy takes you',
  'page.subtitle':
    'Kilometres per €100 of energy for the best-selling new cars (left) and for the models Slovenians actually drive (right). Sorted by reach.',
  'page.legendGhost': 'public charging ({price} €/kWh)',
  'page.distances': 'Dashed lines are road distances from Ljubljana (OSRM): {list}.',

  'city.dunaj': 'Vienna',
  'city.rim': 'Rome',
  'city.pariz': 'Paris',
  'city.lizbona': 'Lisbon',

  'panel.a.title': 'Best-selling models, 2025',
  'panel.a.subtitle': 'First registrations of new passenger cars: top 20 sellers plus 5 electric.',
  'panel.b.title': 'What we actually drive',
  'panel.switch': 'Which view',
  'panel.b.subtitle':
    'Registered fleet by model (estimate, end of 2024) plus the three most numerous electric models.',

  'powertrain.bencin': 'petrol',
  'powertrain.dizel': 'diesel',
  'powertrain.hibrid': 'hybrid',
  'powertrain.elektrika': 'electric',

  'unit.perYear': '{eur} €/year',
  'unit.per100km': '{eur} €/100 km',
  'unit.km': '{km} km',

  'prices.heading': 'Energy prices',
  'prices.bencin': 'Petrol 95 (€/l)',
  'prices.dizel': 'Diesel (€/l)',
  'prices.elektrika': 'Home electricity (€/kWh)',
  'prices.javnoPolnjenje': 'Public charging (€/kWh)',
  'prices.reset': 'Reset prices',
  'prices.overridden': 'Set by hand',
  'prices.resetOne': 'Reset this price',

  'controls.annualKm': 'Kilometres driven per year',
  'controls.realWorld': 'Real-world consumption',
  'controls.realWorldHint':
    'Official consumption runs below real use: petrol +20 %, diesel and hybrid +18 %, electric +19 %.',

  'car.heading': 'Your car',
  'car.search': 'Find a model',
  'car.searchPlaceholder': 'e.g. Octavia, Clio, Model 3',
  'car.noResults': 'No matches. Enter the consumption by hand below.',
  'car.manualHeading': 'Not on the list?',
  'car.manualPowertrain': 'Powertrain',
  'car.manualConsumption': 'Consumption (per 100 km)',
  'car.manualApply': 'Show my car',
  'car.clear': 'Remove my car',
  'car.personal': 'your car',
  'car.loading': 'Loading the model list …',
  'car.resultLabel': '{model} ({variant})',

  'freshness.window': 'Fuel prices: {from}–{to}. Consumption list: {asOf}.',
  'freshness.stale': 'The data is more than 14 days old. Check the validity date.',

  'theme.label': 'Theme',
  'theme.light': 'light',
  'theme.dark': 'dark',
  'theme.system': 'system',

  'language.label': 'Language',

  'source.heading': 'Sources and method',
}
