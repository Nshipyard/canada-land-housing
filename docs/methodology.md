# Methodology

## Price split
Statistics Canada table 18-10-0205-02 (New Housing Price Index), retrieved 2026-10-09 via the
tbl/csv bulk download. House-only and land-only series published for 27 CMAs, monthly 1981-01
to 2026-08, no terminated segments. All land-only values carry the E (use with caution) flag.
The NHPI covers new housing only and is an index, not dollars.

## Stations
67 TTC subway stations, Lines 1, 2, 4. Coordinates from the City of Toronto open GTFS feed
(stops.txt); opening years from public record (1954 Yonge segment through 2017 Spadina extension).
Line 6 (Finch West LRT) excluded: opening history too recent for a supply-response read.

## Supply join
Development-pipeline projects with coordinates assigned to every station within 800m (haversine).
Projects near two stations count under both; station totals do not sum citywide. Built vs pipeline
from the pipeline snapshot. The snapshot has no per-project completion dates, so supply cannot be
dated before/after station openings from this file.

## Documented gaps
- Station-level land/structure split: MPAC assessments behind login/FOI; Teranet proprietary.
- Per-unit housing cost near stations over time: no open station-scale price series (NHPI is CMA-level).
