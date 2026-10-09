"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  banner: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    badge: "Open source",
  },
  nav: { explorer: "Explorer", showcase: "Showcase", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Nshipyard Canada · Land vs Housing",
    title: "Does transit make land gold and housing cheap?",
    sub: "The thesis: near a new station, land values rise (good, it pulls developers in) while the cost per family falls when density is allowed (one lot hosts 50 families instead of 1). We tested the halves open data can test: Statistics Canada's house-only versus land-only price split for Toronto from 1981 to 2026, and housing units within 800m of all 67 TTC subway stations from the development pipeline. The station-level land split does not exist in open data; this page marks exactly where the test stops.",
    cta1: "Explore the stations",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "+352%", label: "growth of the house-only (structure) component in Toronto's New Housing Price Index, 1981 to 2026" },
    { value: "+190%", label: "growth of the land-only component over the same period; StatCan flags the land series “use with caution” throughout" },
    { value: "67", label: "TTC subway stations on Lines 1, 2 and 4, each with opening year and coordinates from the open GTFS feed" },
    { value: "141,098", label: "homes built within 800m of a subway station in the development-pipeline snapshot, plus 573,486 more in the pipeline" },
  ],
  explorer: {
    kicker: "Explorer",
    title: "Supply near every station.",
    sub: "Search a station to see how many homes were built within 800m and how many are in the pipeline. Counts come from the development-pipeline snapshot joined to station coordinates; a project near two stations counts under both.",
    search: "Search stations…",
    showing: "Showing",
    of: "of",
    noResult: "No stations match.",
    built: "built units",
    pipeline: "pipeline units",
    projects: "projects",
    opened: "Opened",
    line: "Line",
    back: "Back to stations",
  },
  showcase: {
    kicker: "Showcase",
    title: "What the split actually shows.",
    body: "At the metro level the result complicates the thesis: from 1981 to 2026, the structure component of new Toronto home prices grew 352% while the land component grew 190%. Construction cost inflation, not just land scarcity, is doing heavy work in new home prices. The station-level half of the test is where open data runs out, and the coverage section below says so plainly.",
    decompTitle: "House-only vs land-only, Toronto, 1981-2026",
    decompSub: "Statistics Canada New Housing Price Index, indexed series. Land-only flagged “use with caution” by StatCan throughout.",
    houseOnly: "House only (structure)",
    landOnly: "Land only",
    topTitle: "Stations by homes within 800m",
    topSub: "Built plus pipeline units from the development-pipeline snapshot. Wellesley leads because the downtown pipeline clusters there.",
    builtUnits: "built",
    pipelineUnits: "pipeline",
    coverageTitle: "Where the test is possible, and where it stops",
    coverageSub: "Four tests, two pass with open data, two are blocked on data nobody publishes openly.",
    possible: "Possible with open data",
    blocked: "Blocked: no open data",
  },
  methodology: {
    kicker: "Methodology",
    title: "How the decomposition was built, and where it is weak.",
    items: [
      "Price split source: Statistics Canada table 18-10-0205-02 (New Housing Price Index), retrieved 2026-10-09. The house-only and land-only series are published for 27 census metropolitan areas including Toronto, monthly from 1981-01 to 2026-08, with no terminated segments. Every land-only value carries StatCan's E (use with caution) flag.",
      "The NHPI tracks new housing only and is an index, not dollars. Growth rates compare like with like, but the series cannot be read as absolute land or structure prices, and it says nothing about resale homes.",
      "Station list: 67 TTC subway stations on Lines 1, 2 and 4. Coordinates come from the City of Toronto's open GTFS feed (stops.txt); opening years are public record (1954 for the original Yonge segment through 2017 for the Spadina extension). Line 6 (Finch West LRT) is excluded: its opening history is too recent for a supply-response read.",
      "Supply join: each development-pipeline project with coordinates is assigned to every station within 800m (haversine). Projects near two stations count under both, so station totals do not sum to a citywide total. Status comes from the pipeline snapshot: built versus everything else.",
      "The pipeline is a snapshot with no per-project completion dates, so supply near stations cannot be dated before or after each station's opening from this file. The cross-section is real; the longitudinal test is not possible here.",
      "The station-level land-versus-structure split is the documented gap: MPAC parcel assessments sit behind the AboutMyProperty login or FOI requests, and Teranet transaction data is proprietary. No open parcel-level value file exists for Toronto, so the decomposition cannot be run per station.",
      "Per-unit housing cost near stations over time is blocked for the same reason: no open series of sale prices or project values exists at station scale. The NHPI is CMA-level only.",
    ],
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same canonical data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    tryIt: "Try it",
    openapi: "OpenAPI spec",
    mcpTitle: "MCP server",
    mcpBody: "One streamable-HTTP endpoint. Tools: decomposition_lookup, station_supply, coverage.",
  },
  mcp: {
    kicker: "Connect your agent",
    title: "Put this data to work inside your AI tools.",
    body: "Pick your harness, copy the prompt, send it to your agent. Your agent runs the setup itself.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Other" },
    cardTitle: "Copy and send this to {tab}",
    copy: "Copy",
    copied: "Copied",
    chatgptNote: "ChatGPT connects through the documented REST API rather than MCP directly.",
    pChatgpt:
      "I want to use the {displayName} through its API.\n- OpenAPI spec: {origin}/api/openapi.json\n- REST base: {origin}/api/v1\nFirst tell me in two sentences what this API offers, then {exampleLower}, and show me the result.",
    pClaude:
      "In Claude (claude.ai), open Settings, then Connectors, and add a custom connector:\n- Name: {displayName}\n- URL: {origin}/mcp\nThen list the available tools, {exampleLower}, and show me the result.",
    pClaudeCode:
      "Set up the {displayName} MCP server so I can query it from here.\n1. Run: claude mcp add --transport http {slug} {origin}/mcp\n2. Run `claude mcp list` to confirm it connected.\n3. {example}, and show me the result.",
    pCli:
      "# MCP endpoint (streamable HTTP)\n{origin}/mcp\n\n# List the available tools\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Everything else",
    otherBody: "Any harness that speaks MCP over streamable HTTP, or plain REST.",
    mcpEndpoint: "MCP endpoint",
    openapiSpec: "OpenAPI spec",
    restBase: "REST base",
  },
  downloads: {
    kicker: "Data",
    title: "Take the files.",
    body: "The decomposition series, the station supply join, and the coverage matrix, MIT licensed, as JSON.",
    files: [
      { name: "nhpi_decomposition.json", desc: "House-only vs land-only NHPI series, Toronto monthly 1981-2026 plus peers" },
      { name: "station_supply.json", desc: "67 stations with built and pipeline units within 800m" },
      { name: "stations.json", desc: "Station names, lines, opening years, coordinates" },
      { name: "coverage.json", desc: "What the open data can and cannot test" },
    ],
    download: "Download",
  },
  footer: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    sources: "Price split: Statistics Canada table 18-10-0205-02 (New Housing Price Index). Stations: City of Toronto open GTFS feed; opening years public record. Supply: toronto-development-pipeline (City of Toronto AIC).",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  banner: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    badge: "Code source ouvert",
  },
  nav: { explorer: "Explorateur", showcase: "Vitrine", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Nshipyard Canada · Terrain contre logement",
    title: "Le transport en commun rend-il le terrain précieux et le logement abordable?",
    sub: "La thèse : près d'une nouvelle station, la valeur du terrain augmente (tant mieux, cela attire les promoteurs) tandis que le coût par famille diminue quand la densité est permise (un terrain accueille 50 familles au lieu d'une). Nous avons testé les moitiés vérifiables avec des données ouvertes : la répartition prix-maison contre prix-terrain de Statistique Canada pour Toronto de 1981 à 2026, et les logements dans un rayon de 800 m des 67 stations de métro de la TTC d'après le pipeline de développement. La répartition au niveau des stations n'existe pas en données ouvertes; cette page indique exactement où le test s'arrête.",
    cta1: "Explorer les stations",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "+352 %", label: "croissance de la composante maison seule (structure) dans l'Indice des prix des logements neufs de Toronto, 1981 à 2026" },
    { value: "+190 %", label: "croissance de la composante terrain seul sur la même période; StatCan signale la série terrain « à utiliser avec prudence » partout" },
    { value: "67", label: "stations de métro de la TTC sur les lignes 1, 2 et 4, chacune avec année d'ouverture et coordonnées du flux GTFS ouvert" },
    { value: "141 098", label: "logements construits dans un rayon de 800 m d'une station de métro selon l'instantané du pipeline, plus 573 486 en préparation" },
  ],
  explorer: {
    kicker: "Explorateur",
    title: "L'offre près de chaque station.",
    sub: "Recherchez une station pour voir combien de logements ont été construits dans un rayon de 800 m et combien sont en préparation. Les chiffres viennent de l'instantané du pipeline de développement joint aux coordonnées des stations; un projet près de deux stations compte pour les deux.",
    search: "Rechercher des stations…",
    showing: "Affichage de",
    of: "sur",
    noResult: "Aucune station ne correspond.",
    built: "construits",
    pipeline: "en préparation",
    projects: "projets",
    opened: "Ouverture",
    line: "Ligne",
    back: "Retour aux stations",
  },
  showcase: {
    kicker: "Vitrine",
    title: "Ce que la répartition montre vraiment.",
    body: "À l'échelle métropolitaine, le résultat complique la thèse : de 1981 à 2026, la composante structure des prix des logements neufs à Toronto a crû de 352 % contre 190 % pour le terrain. L'inflation des coûts de construction, pas seulement la rareté du terrain, pèse lourd dans les prix. La moitié du test au niveau des stations est là où les données ouvertes s'épuisent, et la section de couverture le dit plainement.",
    decompTitle: "Maison seule contre terrain seul, Toronto, 1981-2026",
    decompSub: "Indice des prix des logements neufs de Statistique Canada, séries indicées. Série terrain signalée « à utiliser avec prudence » par StatCan partout.",
    houseOnly: "Maison seule (structure)",
    landOnly: "Terrain seul",
    topTitle: "Stations par logements dans un rayon de 800 m",
    topSub: "Logements construits et en préparation d'après l'instantané du pipeline. Wellesley mène car le pipeline du centre-ville s'y concentre.",
    builtUnits: "construits",
    pipelineUnits: "en préparation",
    coverageTitle: "Où le test est possible, et où il s'arrête",
    coverageSub: "Quatre tests, deux réussis avec des données ouvertes, deux bloqués faute de données publiées ouvertement.",
    possible: "Possible avec des données ouvertes",
    blocked: "Bloqué : aucune donnée ouverte",
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Comment la décomposition a été construite, et où elle est faible.",
    items: [
      "Source de la répartition des prix : tableau 18-10-0205-02 de Statistique Canada (Indice des prix des logements neufs), récupéré le 2026-10-09. Les séries maison seule et terrain seul sont publiées pour 27 régions métropolitaines dont Toronto, mensuellement de 1981-01 à 2026-08, sans segment interrompu. Chaque valeur terrain seul porte le signal E (à utiliser avec prudence) de StatCan.",
      "L'IPLN suit les logements neufs seulement et c'est un indice, pas des dollars. Les taux de croissance se comparent à base égale, mais la série ne se lit pas comme des prix absolus du terrain ou de la structure, et elle ne dit rien des reventes.",
      "Liste des stations : 67 stations de métro de la TTC sur les lignes 1, 2 et 4. Les coordonnées viennent du flux GTFS ouvert de la Ville de Toronto (stops.txt); les années d'ouverture sont de notoriété publique (1954 pour le tronçon Yonge initial jusqu'à 2017 pour le prolongement Spadina). La ligne 6 (TLR Finch West) est exclue : son historique est trop récent pour lire une réponse de l'offre.",
      "Jointure de l'offre : chaque projet du pipeline avec coordonnées est attribué à chaque station dans un rayon de 800 m (haversine). Les projets près de deux stations comptent pour les deux, donc les totaux par station ne s'additionnent pas en total municipal. Le statut vient de l'instantané du pipeline : construit contre tout le reste.",
      "Le pipeline est un instantané sans date d'achèvement par projet : l'offre près des stations ne peut donc pas être datée avant ou après l'ouverture de chaque station à partir de ce fichier. La coupe transversale est réelle; le test longitudinal n'est pas possible ici.",
      "La répartition terrain contre structure au niveau des stations est la lacune documentée : les évaluations parcellaires de la MPAC sont derrière le portail AboutMyProperty ou des demandes d'accès, et les données de transactions Teranet sont propriétaires. Aucun fichier ouvert de valeurs parcellaires n'existe pour Toronto, donc la décomposition ne peut pas se faire par station.",
      "Le coût du logement par unité près des stations dans le temps est bloqué pour la même raison : aucune série ouverte de prix de vente ou de valeurs de projet n'existe à l'échelle des stations. L'IPLN est à l'échelle des RMR seulement.",
    ],
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-la depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données canoniques. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    tryIt: "Essayer",
    openapi: "Spécification OpenAPI",
    mcpTitle: "Serveur MCP",
    mcpBody: "Un point de terminaison HTTP continu. Outils : decomposition_lookup, station_supply, coverage.",
  },
  mcp: {
    kicker: "Connectez votre agent",
    title: "Exploitez ces données dans vos outils d'IA.",
    body: "Choisissez votre plateforme, copiez l'invite, envoyez-la à votre agent. Votre agent exécute la configuration lui-même.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Autre" },
    cardTitle: "Copiez et envoyez ceci à {tab}",
    copy: "Copier",
    copied: "Copié",
    chatgptNote: "ChatGPT se connecte via l'API REST documentée plutôt que directement en MCP.",
    pChatgpt:
      "Je veux utiliser {displayName} via son API.\n- Spécification OpenAPI : {origin}/api/openapi.json\n- Base REST : {origin}/api/v1\nD'abord, dis-moi en deux phrases ce que cette API offre, puis {exampleLower}, et montre-moi le résultat.",
    pClaude:
      "Dans Claude (claude.ai), ouvre les paramètres, puis Connecteurs, et ajoute un connecteur personnalisé :\n- Nom : {displayName}\n- URL : {origin}/mcp\nEnsuite, liste les outils disponibles, {exampleLower}, et montre-moi le résultat.",
    pClaudeCode:
      "Configure le serveur MCP {displayName} pour que je puisse l'interroger d'ici.\n1. Exécute : claude mcp add --transport http {slug} {origin}/mcp\n2. Exécute `claude mcp list` pour confirmer la connexion.\n3. {example}, et montre-moi le résultat.",
    pCli:
      "# Point de terminaison MCP (HTTP continu)\n{origin}/mcp\n\n# Lister les outils disponibles\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Tout le reste",
    otherBody: "Toute plateforme qui parle MCP en HTTP continu, ou REST tout court.",
    mcpEndpoint: "Point de terminaison MCP",
    openapiSpec: "Spécification OpenAPI",
    restBase: "Base REST",
  },
  downloads: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "La série de décomposition, la jointure de l'offre par station et la matrice de couverture, sous licence MIT, en JSON.",
    files: [
      { name: "nhpi_decomposition.json", desc: "Séries IPLN maison seule contre terrain seul, Toronto mensuel 1981-2026 et comparables" },
      { name: "station_supply.json", desc: "67 stations avec logements construits et en préparation dans 800 m" },
      { name: "stations.json", desc: "Noms, lignes, années d'ouverture et coordonnées des stations" },
      { name: "coverage.json", desc: "Ce que les données ouvertes peuvent et ne peuvent pas tester" },
    ],
    download: "Télécharger",
  },
  footer: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    sources: "Répartition des prix : tableau 18-10-0205-02 de Statistique Canada (Indice des prix des logements neufs). Stations : flux GTFS ouvert de la Ville de Toronto; années d'ouverture de notoriété publique. Offre : toronto-development-pipeline (AIC de la Ville de Toronto).",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
