"""Build canada-land-housing data files.
1. nhpi_decomposition.json: StatCan NHPI house-only vs land-only (Toronto CMA + peers), 1981-2026.
2. station_supply.json: development-pipeline units within 800m of each TTC station.
3. coverage.json: honest matrix of what is testable where.
Raw inputs (nhpi csv, ttc gtfs) stay in data/raw (excluded from git).
"""
import csv, json, math, os

BASE = '/home/hatch/workspace/canada-land-housing'
PIPE = '/home/hatch/workspace/toronto-development-pipeline/data/pipeline.csv'

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1); dl = math.radians(lon2 - lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.asin(math.sqrt(a))

# ---- 1. NHPI decomposition ----
f = open('/tmp/18100205.csv', encoding='utf-8-sig') if os.path.exists('/tmp/18100205.csv') else None
src = '/tmp/18100205.csv'
if not os.path.exists(src):
    # fallback: re-download into data/raw
    import urllib.request
    os.makedirs(BASE+'/data/raw', exist_ok=True)
    urllib.request.urlretrieve('https://www150.statcan.gc.ca/n1/tbl/csv/18100205-eng.zip', BASE+'/data/raw/nhpi.zip')
    import zipfile
    zipfile.ZipFile(BASE+'/data/raw/nhpi.zip').extract('18100205.csv', BASE+'/data/raw')
    src = BASE+'/data/raw/18100205.csv'
rows = list(csv.DictReader(open(src, encoding='utf-8-sig')))

GEOS = ['Toronto, Ontario', 'Canada', 'Vancouver, British Columbia', 'Montréal, Quebec', 'Calgary, Alberta']
decomp = {}
for geo in GEOS:
    series = {}
    for kind in ['House only', 'Land only', 'Total (house and land)']:
        pts = [(r['REF_DATE'], float(r['VALUE'])) for r in rows
               if r['GEO']==geo and r['New housing price indexes']==kind and r['VALUE']]
        pts.sort()
        # downsample to annual (December) for payload size, keep monthly for Toronto
        series[kind] = pts
    decomp[geo] = series

# Toronto monthly kept; others annual December
out_decomp = {}
for geo in GEOS:
    g = {}
    for kind, pts in decomp[geo].items():
        if geo == 'Toronto, Ontario':
            keep = pts  # monthly
        else:
            keep = [p for p in pts if p[0].endswith('-12')]
        g[kind] = [{"d": d, "v": v} for d, v in keep]
    # land share of total: land/(house+land) is not how index works; instead report ratio land/house
    out_decomp[geo] = g

# headline stats for Toronto
t = out_decomp['Toronto, Ontario']
house = {p['d']: p['v'] for p in t['House only']}
land = {p['d']: p['v'] for p in t['Land only']}
common = sorted(set(house) & set(land))
first, last = common[0], common[-1]
stats = {
    "geo": "Toronto, Ontario",
    "range": [first, last],
    "house_first": house[first], "house_last": house[last],
    "land_first": land[first], "land_last": land[last],
    "house_growth_pct": round((house[last]/house[first]-1)*100, 1),
    "land_growth_pct": round((land[last]/land[first]-1)*100, 1),
    "land_vs_house_ratio_first": round(land[first]/house[first], 3),
    "land_vs_house_ratio_last": round(land[last]/house[last], 3),
    "caveat": "Land-only series flagged E (use with caution) by StatCan for all periods; split is CMA-level, not station-level.",
}
json.dump({"series": out_decomp, "stats": stats,
           "source": "Statistics Canada table 18-10-0205-02, New Housing Price Index, retrieved 2026-10-09"},
          open(BASE+'/data/nhpi_decomposition.json','w'), indent=1)
print('NHPI:', first, '->', last, '| house +%.1f%% land +%.1f%%' % (stats['house_growth_pct'], stats['land_growth_pct']))

# ---- 2. Station supply ----
stations = json.load(open(BASE+'/data/stations.json'))
projs = []
with open(PIPE, encoding='utf-8') as fh:
    for r in csv.DictReader(fh):
        try:
            lat, lon = float(r['lat']), float(r['lon'])
        except: continue
        try: units = int(float(r['proposed_units'] or 0))
        except: units = 0
        projs.append({"lat": lat, "lon": lon, "status": r['status'], "units": units})

R800 = 0.8
supply = []
for s in stations:
    bu, pu, n = 0, 0, 0
    for p in projs:
        if haversine(s['lat'], s['lon'], p['lat'], p['lon']) <= R800:
            n += 1
            if p['status'] == 'built': bu += p['units']
            else: pu += p['units']
    supply.append({"name": s['name'], "line": s['line'], "opened": s['opened'],
                   "lat": s['lat'], "lon": s['lon'],
                   "projects_800m": n, "built_units_800m": bu, "pipeline_units_800m": pu,
                   "total_units_800m": bu+pu})
supply.sort(key=lambda x: -x['total_units_800m'])
tot_built = sum(x['built_units_800m'] for x in supply)
tot_pipe = sum(x['pipeline_units_800m'] for x in supply)
json.dump({"stations": supply,
           "summary": {"station_count": len(supply), "radius_km": R800,
                       "built_units_near_stations": tot_built,
                       "pipeline_units_near_stations": tot_pipe,
                       "caveat": "Pipeline snapshot; projects may sit within 800m of multiple stations (counted per station, not deduplicated across stations)."},
           "source": "toronto-development-pipeline pipeline.csv (City of Toronto AIC) joined to TTC GTFS station coordinates"},
          open(BASE+'/data/station_supply.json','w'), indent=1)
print('top station:', supply[0]['name'], supply[0]['total_units_800m'], 'units')
print('built near stations:', tot_built, '| pipeline near stations:', tot_pipe)

# ---- 3. Coverage matrix ----
coverage = {
  "tests": [
    {"test": "Land vs structure value split over time, metro level",
     "possible": True,
     "basis": "StatCan NHPI house-only vs land-only, 27 CMAs incl. Toronto, monthly 1981-2026",
     "limit": "Land-only series carries StatCan E (use with caution) flag throughout"},
    {"test": "Land vs structure value split around individual stations",
     "possible": False,
     "basis": None,
     "limit": "MPAC parcel assessments sit behind the AboutMyProperty login or FOI requests; Teranet transaction data is proprietary. No open parcel-level value file exists for Toronto."},
    {"test": "Housing units built near stations (supply response)",
     "possible": True,
     "basis": "Development pipeline snapshot (AIC) joined to 67 TTC stations at 800m radius",
     "limit": "Snapshot, not longitudinal: no per-project completion dates, so before/after opening cannot be dated from this file"},
    {"test": "Per-unit housing cost near stations over time",
     "possible": False,
     "basis": None,
     "limit": "No open series of sale prices or project values at station scale; NHPI is CMA-level only"},
  ]
}
json.dump(coverage, open(BASE+'/data/coverage.json','w'), indent=1)
print('coverage tests:', len(coverage['tests']))
