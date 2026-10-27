# Koliko kilometrov za 100 evrov energije

Interaktivna slovenska različica ameriške primerjave "how far $100 of fuel takes you": koliko
kilometrov se pelješ za 100 evrov energije, po modelih, ki jih v Sloveniji najbolje prodajamo in
največ vozimo.

Živa stran: https://lukaprebil.github.io/slovenia-fuel-range/

## Podatki in viri

| Podatek                         | Vir                                                                                                             | Osveževanje                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Regulirane cene goriv           | [gov.si, cene naftnih derivatov](https://www.gov.si/teme/cene-naftnih-derivatov/)                               | tedensko, samodejno         |
| Poraba (WLTP)                   | [ARSO/MOPE seznam modelov](https://www.gov.si/teme/emisije-co2-in-onesnazeval-iz-avtomobilov/)                  | mesečno, samodejno          |
| Cena elektrike za gospodinjstva | [SURS, 1817565S](https://pxweb.stat.si/SiStatData/pxweb/sl/Data/-/1817565S.px)                                  | ročno, ob novi letni objavi |
| Javno polnjenje                 | [Petrol, cenik](https://www.petrol.si/mobilnost/zasebni-uporabniki/javne-elektricne-polnilnice/cenik-polnjenje) | ročno, ob spremembi cenika  |

Podatki ARSO in gov.si so objavljeni pod licenco CC BY 4.0; pri vsaki vrstici v `data/curated.csv` sta
navedena vir in datum. Vozni park po modelih je ocena iz medijske analize registrskih podatkov, ne
uradna statistika.

## Razvoj

```bash
npm ci
npm run dev          # lokalni strežnik
npm run test         # vitest
npm run typecheck    # tsc -b
npm run check        # biome: lint, imports, formatting; fails on any warning
npm run check:fix    # biome, writing the fixes
npm run build:data   # osveži cene goriv in katalog iz uradnih virov
npm run validate:data
```

Kljuke tečejo prek Huskyja:

| Kljuka     | Kaj teče                                                                    | Čas       |
| ---------- | --------------------------------------------------------------------------- | --------- |
| pre-commit | `lint-staged`: Biome na nastavljenih datotekah, popravki se znova nastavijo | pod 1 s   |
| commit-msg | `commitlint` s konvencijo conventional commits                              | takoj     |
| pre-push   | `check`, `build` in `test`                                                  | okoli 3 s |

CI ponovi iste korake in preveri še sporočila commitov na veji, zato `--no-verify` ne pomaga.

Koda je v TypeScriptu, skripte v `scripts/` poganja Node neposredno (brez prevajalnika).
