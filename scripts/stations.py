"""Compile TTC subway stations (Lines 1, 2, 4) with coordinates from GTFS and opening years from public record."""
import csv, json, re

# Canonical stations: (name, line, opening_year) - public record (TTC/City)
STATIONS = [
 # Line 1 Yonge-University (Yonge segment 1954)
 ("Union", 1, 1954), ("King", 1, 1954), ("Queen", 1, 1954), ("Dundas", 1, 1954),
 ("College", 1, 1954), ("Wellesley", 1, 1954), ("Bloor-Yonge", 1, 1954),
 ("Rosedale", 1, 1954), ("Summerhill", 1, 1954), ("St. Clair", 1, 1954),
 ("Davisville", 1, 1954), ("Eglinton", 1, 1954),
 # North Yonge extension
 ("Lawrence", 1, 1973), ("York Mills", 1, 1973), ("Sheppard-Yonge", 1, 1974), ("Finch", 1, 1974),
 # University segment 1963
 ("St. George", 1, 1963), ("Museum", 1, 1963), ("Queen's Park", 1, 1963),
 ("St. Patrick", 1, 1963), ("Osgoode", 1, 1963),
 # Spadina segment 1978
 ("Dupont", 1, 1978), ("St. Clair West", 1, 1978), ("Eglinton West", 1, 1978),
 ("Glencairn", 1, 1978), ("Lawrence West", 1, 1978), ("Yorkdale", 1, 1978), ("Wilson", 1, 1978),
 # North Spadina
 ("Sheppard West", 1, 1996),
 # Toronto-York Spadina extension 2017
 ("Downsview Park", 1, 2017), ("Finch West", 1, 2017), ("York University", 1, 2017),
 ("Pioneer Village", 1, 2017), ("Highway 407", 1, 2017), ("Vaughan Metropolitan Centre", 1, 2017),
 # Line 2 Bloor-Danforth (Keele-Woodbine 1966)
 ("Keele", 2, 1966), ("Dundas West", 2, 1966), ("Runnymede", 2, 1966), ("High Park", 2, 1966),
 ("Jane", 2, 1966), ("Old Mill", 2, 1966), ("Royal York", 2, 1966),
 ("Dufferin", 2, 1966), ("Ossington", 2, 1966), ("Christie", 2, 1966), ("Bathurst", 2, 1966),
 ("Spadina", 2, 1966), ("Bay", 2, 1966), ("Sherbourne", 2, 1966), ("Castle Frank", 2, 1966),
 ("Broadview", 2, 1966), ("Chester", 2, 1966), ("Pape", 2, 1966), ("Donlands", 2, 1966),
 ("Greenwood", 2, 1966), ("Coxwell", 2, 1966), ("Woodbine", 2, 1966),
 # Bloor-Danforth extensions
 ("Islington", 2, 1968), ("Warden", 2, 1968), ("Kipling", 2, 1980), ("Kennedy", 2, 1980),
 ("Victoria Park", 2, 1968), ("Main Street", 2, 1968),
 # Line 4 Sheppard 2002
 ("Bayview", 4, 2002), ("Bessarion", 4, 2002), ("Leslie", 4, 2002), ("Don Mills", 4, 2002),
]

def norm(n):
    n = n.lower().replace('station','').replace('.','').strip(' -')
    n = n.replace("’", "'")
    return n

stops = list(csv.DictReader(open('/home/hatch/workspace/canada-land-housing/data/raw/stops.txt')))
byname = {}
for s in stops:
    n = s['stop_name']
    if 'station' not in n.lower(): continue
    key = norm(n.split(' - ')[0])
    # prefer parent station-ish entries; keep first
    if key not in byname:
        byname[key] = (float(s['stop_lat']), float(s['stop_lon']))

out = []
missing = []
for name, line, year in STATIONS:
    k = norm(name)
    hit = byname.get(k)
    if not hit:
        # try variants
        for bk, v in byname.items():
            if bk == k or bk.startswith(k) or k.startswith(bk):
                hit = v; break
    if hit:
        out.append({"name": name, "line": line, "opened": year, "lat": round(hit[0],6), "lon": round(hit[1],6)})
    else:
        missing.append(name)

print('matched:', len(out), 'missing:', missing)
json.dump(out, open('/home/hatch/workspace/canada-land-housing/data/stations.json','w'), indent=1)
