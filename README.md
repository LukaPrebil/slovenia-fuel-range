# Slovenia Fuel Range

An interactive Slovenian answer to "how far does $100 of fuel take you": kilometres per €100 of energy
for the models Slovenians buy most and for the models they actually drive.

Live page: https://lukaprebil.github.io/slovenia-fuel-range/

The page does five things:

- Draws two panels: the 20 best-selling new cars of 2025 plus five best-selling EVs, and 15 fleet models
  plus three EVs, each row sorted by reach.
- Lets a visitor search the full ARSO list of 3,135 variants, or type a consumption by hand, and drops
  that car into the chart at its place.
- Accepts an override for any of the four energy prices and recalculates every bar.
- Turns the bars into euros per year at the visitor's annual kilometres.
- Switches between Slovenian and English, light and dark, and keeps the whole view in the URL.

The chart is HTML and CSS. There is no SVG, no canvas, and no chart library.

## Data and sources

| Data                        | Source                                                                                                               | Refresh                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Regulated fuel prices       | [gov.si, petroleum product prices](https://www.gov.si/teme/cene-naftnih-derivatov/)                                  | weekly, automatic             |
| Consumption (WLTP)          | [ARSO/MOPE model list](https://www.gov.si/teme/emisije-co2-in-onesnazeval-iz-avtomobilov/)                           | monthly, automatic            |
| Household electricity price | [SURS, 1817565S](https://pxweb.stat.si/SiStatData/pxweb/sl/Data/-/1817565S.px)                                       | manual, on the annual release |
| Public charging             | [Petrol, price list](https://www.petrol.si/mobilnost/zasebni-uporabniki/javne-elektricne-polnilnice/cenik-polnjenje) | manual, when the list changes |

The ARSO and gov.si data are published under CC BY 4.0. Every row in `data/curated.csv` carries its
source and date. The fleet by model is an estimate from a media analysis of registration data, not
official statistics, because SURS publishes no brand or model dimension.

## Method

Consumption is the official WLTP figure from the ARSO list. For pre-2018 fleet generations the official
NEDC figure of that generation is multiplied by 1.21. Each model uses its entry variant, and models sold
with several powertrains appear once per powertrain.

Three things the chart deliberately leaves out:

- **Plug-in hybrids.** Their official consumption is between 240 % and 500 % below what they burn.
- **Purchase prices.** The chart compares energy cost, nothing else.
- **Motorway fuel prices.** Only the regulated off-motorway prices have a machine-readable feed.

The optional real-world toggle applies the EC/TNO overrun figures: petrol +20 %, diesel and hybrid
+18 %, electric +19 %.

Fuel prices come from the weekly gov.si CSV. The catalogue comes from the monthly ARSO xlsx, parsed at
build time because the origin sends no CORS headers. A scheduled workflow commits only when the numbers
change, and the page shows the validity window of the data it is using.

## Development

```bash
npm ci
npm run dev          # local server
npm run test         # vitest
npm run typecheck    # tsc -b
npm run check        # biome: lint, imports, formatting; fails on any warning
npm run check:fix    # biome, writing the fixes
npm run build:data   # refresh fuel prices and catalogue from the official sources
npm run validate:data
```

Husky runs four hooks:

| Hook       | Runs                                                      | Time      |
| ---------- | --------------------------------------------------------- | --------- |
| pre-commit | `lint-staged`: Biome on the staged files, fixes re-staged | under 1 s |
| commit-msg | `commitlint` with the conventional config                 | instant   |
| pre-push   | `check`, `build` and `test`                               | about 3 s |

CI repeats those checks and validates the branch's commit messages between the pull request base and
head, so `--no-verify` does not get anything through.

The code is TypeScript. Scripts in `scripts/` run on plain Node, which strips the types itself, so no
build step sits between the source and the run. The page is Vite, React and Tailwind, with Biome for
linting and formatting and Vitest for tests.

## Licence

The code is MIT licensed, see [LICENSE](LICENSE).

The data in `data/` is CC BY 4.0, see [LICENSE-DATA](LICENSE-DATA). It derives from ARSO, gov.si, SURS,
Petrol, AMZS, Delo, ADAC and OSRM, each credited per row or per file.
