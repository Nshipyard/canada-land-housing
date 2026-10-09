# Canada Land vs Housing

Does transit make land gold and housing cheap? This project tests the two halves of that thesis that open data can test, and marks exactly where the test stops.

**The thesis** (from the geometry-of-affordability argument): near a new transit station, land values rise, which is good because it pulls developers in, while the cost per family falls when density is allowed, because one lot hosts 50 families instead of 1.

**What we built:**

1. **Metro-level decomposition (possible).** Statistics Canada table 18-10-0205-02 publishes a house-only vs land-only split of the New Housing Price Index for 27 census metropolitan areas, monthly from 1981 to 2026. For Toronto: the structure component grew **352.2%** while the land component grew **190.0%**. That complicates the thesis at metro level: construction cost inflation is doing heavy work in new home prices, not just land scarcity. Every land-only value carries StatCan's E (use with caution) flag.
2. **Station supply response (possible).** All 67 TTC subway stations (Lines 1, 2, 4) with coordinates from the City's open GTFS feed and opening years from public record, joined to the Toronto development pipeline: **141,098 homes built within 800m of a station, plus 573,486 in the pipeline.** Wellesley leads with 43,575 units.
3. **The station-level land split (blocked, documented).** MPAC parcel assessments sit behind the AboutMyProperty login or FOI requests; Teranet transaction data is proprietary. No open parcel-level value file exists for Toronto, so the decomposition cannot be run per station. The coverage matrix states this plainly instead of faking it.

## Data

| File | Contents |
|---|---|
| `data/nhpi_decomposition.json` | House-only vs land-only NHPI, Toronto monthly 1981-2026 plus 4 peer CMAs (annual) |
| `data/station_supply.json` | 67 stations with built/pipeline units within 800m |
| `data/stations.json` | Station names, lines, opening years, coordinates |
| `data/coverage.json` | What open data can and cannot test |

Raw inputs (StatCan CSV zip, TTC GTFS zip) are excluded from git; `scripts/build_data.py` reproduces everything.

## App

Next.js 16, full English/French, Open Nshipyard family theme (paper, ink, Canadian red #d80621, Newsreader + Inter).

- `GET /api/v1/decomposition?geo=Toronto,%20Ontario`: price split series
- `GET /api/v1/stations?q=wellesley`: station supply search
- `GET /api/v1/coverage`: the testability matrix
- `GET /api/openapi.json`: OpenAPI 3.1 spec
- `POST /mcp`: MCP server (streamable HTTP): `decomposition_lookup`, `station_supply`, `coverage`

## Rebuild

```bash
python3 scripts/build_data.py   # data/ (needs the raw zips in data/raw/)
npm install && npm run build && npm start
```

## Author

Built by [Richardson Dackam](https://github.com/Nshipyard), [X](https://x.com/richardsondx), [GitHub](https://github.com/Nshipyard). MIT licensed.
