import express from 'express';
import cors from 'cors';
import WebTorrent from 'webtorrent';

const app = express();
const port = 3000;
const client = new WebTorrent();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================================================
// 1. CONFIGURATION & TRACKERS
// ============================================================================
const TORZNAB_CONFIG = {
  enabled: false,
  baseUrl: process.env.TORZNAB_URL || 'http://localhost:9696/1/api',
  apiKey: process.env.TORZNAB_API_KEY || 'YOUR_PROWLARR_OR_JACKETT_API_KEY'
};

// YTS movie search API. Override this with YTS_API_BASE if needed.
const YTS_API_BASE =
  process.env.YTS_API_BASE || 'https://yts.lt/api/v2/list_movies.json';

const DEFAULT_TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://exodus.desync.com:6969/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'http://tracker.opentrackr.org:1337/announce',
  'wss://tracker.openwebtorrent.com'
];

const CATALOG = [
  {
    id: 'sintel-sample',
    title: 'Test Stream (Open-Source Sintel)',
    type: 'test',
    year: 2010,
    poster: 'https://images.metahub.space/poster/medium/tt1727587/img',
    magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
  },
  {
    id: 'scooby-zombie-island',
    title: 'Scooby-Doo on Zombie Island (1998)',
    type: 'movie',
    year: 1998,
    poster: 'https://archive.org/services/img/scooby-doo-on-zombie-island-1998_202309',
    magnet: 'https://archive.org/download/scooby-doo-on-zombie-island-1998_202309/scooby-doo-on-zombie-island-1998_202309_archive.torrent'
  },
  {
    id: 'scooby doo where are you',
    title: 'scooby doo where are you',
    type: 'movie',
    year: 1998,
    poster: 'https://archive.org/services/img/scooby-doo-on-zombie-island-1998_202309',
    magnet: 'magnet:?xt=urn:btih:965855465B8DEB6D982630F4C40DFBE5C3FB38D4&dn=Scooby-Doo+Where+Are+You+1969+S01-S03+1080p+Blu-Ray+H265+10bit+AAC-Zero00&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2F47.ip-51-68-199.eu%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce'
  },
  {
    "id": "Scooby-Doo! Mystery Incorporated Season 1",
    "title": "Scooby-Doo! Mystery Incorporated Season 1",
    "year": 1978,
    "poster": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_Buck_Bunny_poster_big.jpg",
    "magnet" : "magnet:?xt=urn:btih:1637E92A4C67CE248687EAA76A9B724F23CADBB0&dn=Scooby-Doo%21+Mystery+Incorporated+Complete+Season+1+1080P+WEB-DL&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2F47.ip-51-68-199.eu%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce"
  },
  {
    "id": "Scooby-Doo! Mystery Incorporated Season 2",
    "title": "Scooby-Doo! Mystery Incorporated Season 2",
    "year": 1978,
    "poster": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_Buck_Bunny_poster_big.jpg",
    "magnet" : "magnet:?xt=urn:btih:D8D1F3BE5705657842DE2A8B68BBF2CB0250D6DC&dn=Scooby-Doo%21+Mystery+Incorporated+Complete+Season+2+1080P+WEB-DL&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2F47.ip-51-68-199.eu%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce"
  }
];

// ============================================================================
// 2. RELEASE PARSER & STRICT RELEVANCE ENGINE
// ============================================================================
const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from']);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function parseReleaseMetadata(rawTitle) {
  const lower = (rawTitle || '').toLowerCase();
  const cleanTitle = rawTitle
    .replace(/\b(19\d{2}|20\d{2}|720p|1080p|2160p|4k|bluray|webrip|web-dl|brrip|dvdrip|x264|x265|hevc|h264|aac|ac3)\b.*$/i, '')
    .replace(/[._-]+/g, ' ')
    .trim();

  const yearMatch = rawTitle.match(/\b(19\d{2}|20\d{2})\b/);

  return {
    cleanTitle: cleanTitle || rawTitle,
    year: yearMatch ? yearMatch[1] : null,
    resolution: lower.includes('2160p') || lower.includes('4k') ? '4K'
      : lower.includes('1080p') ? '1080p'
      : lower.includes('720p') ? '720p' : 'SD',
    isBrowserCompatibleVideo: !(/\b(x265|h265|hevc|10bit|10-bit|avi|wmv)\b/i.test(lower)),
    isPreferredVideo: /\b(mp4|h264|x264|avc)\b/i.test(lower),
    isIncompatibleAudio: /\b(dts|truehd|atmos|eac3|ddp5)\b/i.test(lower),
    isJunkClip: /\b(commercial|commercials|promo|trailer|opening|closing|sample|bumper|podcast|review|cam|hdcam|ts|telesync)\b/i.test(lower)
  };
}

function calculateTitleSimilarity(candidateTitle, userQuery) {
  const queryTokens = tokenize(userQuery);
  const titleTokens = tokenize(candidateTitle);

  if (queryTokens.length === 0 || titleTokens.length === 0) return 0;

  const titleTokenSet = new Set(titleTokens);
  let matchedCount = 0;

  for (const qWord of queryTokens) {
    if (titleTokenSet.has(qWord)) {
      matchedCount++;
    }
  }

  const coverage = matchedCount / queryTokens.length;
  if (coverage < 1.0) {
    if (queryTokens.length >= 4 && coverage >= 0.75) {
      return coverage * 0.7;
    }
    return 0;
  }

  const normalizedTitle = titleTokens.join(' ');
  const normalizedQuery = queryTokens.join(' ');
  const exactPhraseBonus = normalizedTitle.includes(normalizedQuery) ? 0.25 : 0;
  const lengthRatio = Math.min(1, queryTokens.length / Math.max(queryTokens.length, titleTokens.length - 4));

  return Math.min(1.0, (coverage * 0.75) + exactPhraseBonus) * (0.6 + 0.4 * lengthRatio);
}

function scoreTorrentCandidate(candidate, query = '') {
  const meta = parseReleaseMetadata(candidate.title);
  // Score the title once. Previously the cleaned title and raw title were
  // concatenated, duplicating tokens and making long, unrelated titles score well.
  const similarity = calculateTitleSimilarity(meta.cleanTitle, query);
  const queryTokens = tokenize(query);
  const titleTokens = tokenize(meta.cleanTitle);
  const normalizedQuery = queryTokens.join(' ');
  const normalizedTitle = titleTokens.join(' ');
  const startsWithQuery = Boolean(normalizedQuery) &&
    (normalizedTitle === normalizedQuery || normalizedTitle.startsWith(`${normalizedQuery} `));
  const containsPhrase = Boolean(normalizedQuery) && normalizedTitle.includes(normalizedQuery);

  if (query && similarity === 0) return -999;
  if (meta.isJunkClip) return -500;

  let score = Math.round(similarity * 120);
  // Exact/leading title matches should outrank titles that merely mention the phrase.
  if (startsWithQuery) score += 100;
  else if (containsPhrase) score += 15;
  // Penalize long titles such as episode names and making-of featurettes.
  score -= Math.min(90, Math.max(0, titleTokens.length - queryTokens.length) * 7);

  const seeders = Number(candidate.seeders || 0);
  const sizeMB = Number(candidate.sizeMB || 800);

  if (seeders <= 0) score -= 60;
  else score += Math.min(85, Math.round(Math.log10(seeders + 1) * 28));

  if (!meta.isBrowserCompatibleVideo) score -= 120;
  if (meta.isPreferredVideo) score += 45;
  if (meta.isIncompatibleAudio) score -= 45;

  if (meta.resolution === '1080p') score += 35;
  else if (meta.resolution === '720p') score += 40;
  else if (meta.resolution === '4K') score -= 50;

  if (sizeMB >= 200 && sizeMB <= 2500) score += 30;
  else if (sizeMB < 70 || sizeMB > 5000) score -= 60;

  return score;
}

function refineAndRankTorrents(candidates, query) {
  if (!candidates || candidates.length === 0) return { best: null, results: [] };

  const seen = new Set();
  const unique = candidates.filter(c => {
    const key = (c.source || '').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });


const ranked = unique
  .map(c => {
    const meta = parseReleaseMetadata(c.title);
    const score = scoreTorrentCandidate(c, query);

    return {
      ...c,
      resolution: meta.resolution,
      cleanTitle: meta.cleanTitle,
      score
    };
  })
  .filter(c => c.score > 0)
  .sort((a, b) => {
    // YTS results always appear before other providers.
    const aIsYts = a.provider === 'YTS';
    const bIsYts = b.provider === 'YTS';

    if (aIsYts !== bIsYts) {
      return aIsYts ? -1 : 1;
    }

    // Preserve relevance ranking within each provider group.
    return b.score - a.score;
  });


  console.log(`\n[Search Refinement] Kept ${ranked.length} of ${candidates.length} raw results for "${query}":`);
  ranked.slice(0, 5).forEach((c, idx) => {
    console.log(`  #${idx + 1} [Score: ${c.score}] [${c.resolution}] ${c.title} (Seeds: ${c.seeders}, Size: ${c.sizeMB}MB)`);
  });

  return {
    best: ranked[0] || null,
    results: ranked
  };
}

// Search YTS and convert its movie/torrent records into this app's
// existing candidate shape. The returned source is a magnet URI, not a
// direct video URL; the existing server-side WebTorrent routes handle playback.
async function searchYts(query) {
  const results = [];

  try {
    const url = new URL(YTS_API_BASE);
    url.searchParams.set('query_term', query);
    url.searchParams.set('limit', '20');
    url.searchParams.set('sort_by', 'seeds');
    url.searchParams.set('order_by', 'desc');

    const response = await fetch(url, {
      signal: AbortSignal.timeout(Number(process.env.YTS_TIMEOUT_MS) || 15000)
    });

    if (!response.ok) {
      throw new Error(`YTS returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (payload?.status !== 'ok') {
      throw new Error(payload?.status_message || 'Unexpected YTS response');
    }

    const movies = payload?.data?.movies || [];
    const trackers = [
      'udp://tracker.opentrackr.org:1337/announce',
      'udp://open.stealth.si:80/announce',
      'udp://tracker.torrent.eu.org:451/announce',
      'udp://tracker.openbittorrent.com:6969/announce'
    ];

    for (const movie of movies) {
      for (const torrent of (movie.torrents || [])) {
        const hash = String(torrent.hash || '').trim();
        if (!/^[a-fA-F0-9]{40}$/.test(hash)) continue;

        const releaseName =
          `${movie.title || 'YTS movie'} (${movie.year || 'Unknown year'}) ` +
          `${torrent.quality || ''} ${torrent.type || ''}`.trim();

        // Keep the exact topic (xt) in its conventional magnet form. Some
        // WebTorrent versions reject a percent-encoded `urn:btih:` prefix,
        // which URLSearchParams would produce (`urn%3Abtih%3A...`). Encode
        // only the display name and tracker values.
        const magnetSource = [
          `xt=urn:btih:${hash}`,
          `dn=${encodeURIComponent(releaseName)}`,
          ...trackers.map(tracker => `tr=${encodeURIComponent(tracker)}`)
        ].join('&');

        let sizeMB = Number(torrent.size_bytes) > 0
          ? Math.round(Number(torrent.size_bytes) / (1024 * 1024))
          : 0;

        // Fallback for API responses that only include a human-readable size.
        if (!sizeMB && torrent.size) {
          const match = String(torrent.size).match(/([\d.]+)\s*(GB|MB|KB)/i);
          if (match) {
            const amount = Number(match[1]);
            const unit = match[2].toUpperCase();
            sizeMB = Math.round(
              unit === 'GB' ? amount * 1024 :
              unit === 'KB' ? amount / 1024 : amount
            );
          }
        }

        results.push({
          title: releaseName,
          year: movie.year || 'YTS',
          seeders: Number(torrent.seeds || 0),
          sizeMB: sizeMB || 800,
          poster: movie.medium_cover_image ||
            movie.large_cover_image ||
            'https://via.placeholder.com/300x450?text=YTS',
          source: `magnet:?${magnetSource}`,
          provider: 'YTS',
          movieId: movie.id,
          quality: torrent.quality || null,
          torrentType: torrent.type || null,
          rating: movie.rating || null
        });
      }
    }

    console.log(`[YTS Provider] Found ${results.length} torrent variants for "${query}".`);
  } catch (err) {
    // Keep other providers usable if YTS is unavailable.
    const cause = err?.cause?.code || err?.cause?.message;
    console.log(`[YTS Provider Notice] ${err.message}${cause ? ` (cause: ${cause})` : ''}`);
  }

  return results;
}

// ============================================================================
// 3. INDEXER PROVIDERS
// ============================================================================
async function searchTorrentIndexers(query) {
  const results = [];

  if (query.startsWith('magnet:?') || /^[a-fA-F0-9]{40}$/.test(query.trim())) {
    const source = query.startsWith('magnet:?')
      ? query.trim()
      : `magnet:?xt=urn:btih:${query.trim()}`;
    return [{
      title: `Direct Magnet Stream (${query.slice(0, 24)}...)`,
      year: 'Direct',
      seeders: 100,
      sizeMB: 800,
      poster: 'https://via.placeholder.com/300x450?text=Direct+Magnet',
      source,
      provider: 'Direct magnet'
    }];
  }

  if (TORZNAB_CONFIG.enabled) {
    try {
      const url = `${TORZNAB_CONFIG.baseUrl}?t=search&q=${encodeURIComponent(query)}&cat=2000,5000&apikey=${TORZNAB_CONFIG.apiKey}&extended=1&format=json`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        const items = data?.item || data?.channel?.item || [];
        const list = Array.isArray(items) ? items : [items];
        for (const item of list) {
          const magnetUrl = item.magneturl || item.link;
          if (!magnetUrl) continue;
          results.push({
            title: item.title,
            year: 'Torznab',
            seeders: Number(item.seeders || 20),
            sizeMB: Math.round(Number(item.size || 800000000) / (1024 * 1024)),
            poster: 'https://via.placeholder.com/300x450/1a1b23/facc15?text=Torznab+Stream',
            source: magnetUrl,
            provider: 'Torznab'
          });
        }
      }
    } catch (err) {
      console.log(`[Torznab Notice] Local indexer failed: ${err.message}`);
    }
  }

  // Search providers concurrently so a slow YTS response doesn't delay Archive results.
  const ytsPromise = searchYts(query);
 
  const archivePromise = (async () => {
    const archiveResults = [];

    try {
      const tokens = tokenize(query);

      if (tokens.length > 0) {
        const andTitleClause = tokens.map(t => `"${t}"`).join(' AND ');
        const strictIaQuery =
          `title:(${andTitleClause}) AND mediatype:(movies) ` +
          `AND -title:(commercial OR promo OR trailer OR podcast OR opening)`;

        const iaUrl =
          `https://archive.org/advancedsearch.php?q=${encodeURIComponent(strictIaQuery)}` +
          `&fl[]=identifier,title,year,downloads,item_size` +
          `&sort[]=downloads+desc&rows=15&page=1&output=json`;

        const res = await fetch(iaUrl, {
          signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
          const data = await res.json();
          const docs = data?.response?.docs || [];

          for (const doc of docs) {
            const sizeMB = Math.round(
              (doc.item_size || 0) / (1024 * 1024)
            );

            if (sizeMB < 50) continue;

            archiveResults.push({
              title: `${doc.title} (${doc.year || 'Classic'}) [MP4 x264]`,
              year: doc.year || 'Archive',
              seeders: doc.downloads || 10,
              sizeMB,
              poster: `https://archive.org/services/img/${doc.identifier}`,
              source: `https://archive.org/download/${doc.identifier}/${doc.identifier}_archive.torrent`,
              provider: 'Internet Archive'
            });
          }
        } else {
          console.log(`[Archive Provider Notice] HTTP ${res.status}`);
        }
      }
    } catch (err) {
      console.error(`[Archive Provider Error] ${err.message}`);
    }

    return archiveResults;
  })();


  const [ytsResults, archiveResults] = await Promise.all([ytsPromise, archivePromise]);
  results.push(...ytsResults, ...archiveResults);
  return results;
}

// ============================================================================
// 4. WEBTORRENT SWARM & LIFECYCLE MANAGER
// ============================================================================
const activeTorrents = new Map(); // Primary key -> entry
const torrentEntriesByHash = new Map(); // Info hash -> entry
const sourceAliases = new Map(); // Source URL/magnet -> primary key

const TORRENT_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const STATS_INTERVAL_MS = 5000;

function getInfoHash(source) {
  const match = String(source || '').match(/xt=urn:btih:([a-fA-F0-9]{40}|[a-zA-Z2-7]{32})/i);
  return match ? match[1].toLowerCase() : null;
}
function pauseTorrentDownload(entry) {
  if (!entry?.torrent || entry.torrent.destroyed) return;

  const torrent = entry.torrent;

  // Stop selecting pieces for every file in this torrent.
  for (const file of torrent.files) {
    try {
      file.deselect();
    } catch (_) {}
  }

  console.log(`[Bandwidth] Paused background download: ${torrent.name}`);
}
function getEntry(key, source) {
  const aliasKey = sourceAliases.get(String(source || ''));
  const hash = getInfoHash(source);

  return activeTorrents.get(key) ||
    (aliasKey ? activeTorrents.get(aliasKey) : null) ||
    (hash ? torrentEntriesByHash.get(hash) : null) ||
    null;
}

function destroyTorrentEntry(key, entry) {
  if (entry.statsInterval) clearInterval(entry.statsInterval);

  for (const stream of entry.openStreams) {
    try { stream.destroy(); } catch (_) {}
  }
  entry.openStreams.clear();

  if (entry.torrent && !entry.torrent.destroyed) {
    try { entry.torrent.destroy(); } catch (_) {}
  }

  if (activeTorrents.get(key) === entry) activeTorrents.delete(key);

  if (entry.infoHash && torrentEntriesByHash.get(entry.infoHash) === entry) {
    torrentEntriesByHash.delete(entry.infoHash);
  }

  for (const [source, aliasKey] of sourceAliases.entries()) {
    if (aliasKey === key) sourceAliases.delete(source);
  }
}

function getReadyTorrent(key, torrentSource) {
  const source = String(torrentSource);
  const knownHash = getInfoHash(source);
  const existing = getEntry(key, source);

  if (existing) {
    existing.lastUsedAt = Date.now();
    sourceAliases.set(source, existing.key);
    return existing.promise;
  }

  const entry = {
    key,
    source,
    torrent: null,
    infoHash: knownHash,
    promise: null,
    statsInterval: null,
    openStreams: new Set(),
    lastUsedAt: Date.now()
  };

  // Register before client.add() so concurrent requests share one promise.
  activeTorrents.set(key, entry);
  sourceAliases.set(source, key);
  if (knownHash) torrentEntriesByHash.set(knownHash, entry);

  entry.promise = new Promise((resolve, reject) => {
    console.log(`\n[Torrent] Opening: ${source.slice(0, 100)}`);

    let torrent;

    try {
      // WebTorrent merges these trackers with the trackers in the magnet.
      torrent = client.add(source, { announce: DEFAULT_TRACKERS });
      entry.torrent = torrent;
    } catch (err) {
      destroyTorrentEntry(key, entry);
      reject(err);
      return;
    }

    let settled = false;

    torrent.once('error', (err) => {
      console.error(`[Torrent Error] ${err.message}`);

      if (entry.statsInterval) clearInterval(entry.statsInterval);

      if (!settled) {
        settled = true;
        reject(err);
      }

      // Remove failed entries so a later request can retry.
      if (activeTorrents.get(key) === entry) {
        destroyTorrentEntry(key, entry);
      }
    });

    torrent.once('metadata', () => {
      if (settled) return;
      settled = true;

      entry.infoHash = String(torrent.infoHash || knownHash || '').toLowerCase();

      // If another request already mounted this same torrent, reuse that entry.
      const duplicate = entry.infoHash
        ? torrentEntriesByHash.get(entry.infoHash)
        : null;

      if (duplicate && duplicate !== entry) {
        sourceAliases.set(source, duplicate.key);
        if (activeTorrents.get(key) === entry) activeTorrents.delete(key);

        try { torrent.destroy(); } catch (_) {}

        duplicate.lastUsedAt = Date.now();
        resolve(duplicate.torrent || duplicate.promise);
        return;
      }

      if (entry.infoHash) torrentEntriesByHash.set(entry.infoHash, entry);

      console.log(
        `[Torrent] Metadata ready: "${torrent.name}" | ` +
        `${torrent.files.length} files | ${torrent.numPeers} peers`
      );

      // Don't deselect every piece here. File streaming will prioritize the
      // requested video and WebTorrent can fetch its required pieces.
      entry.statsInterval = setInterval(() => {
        if (!entry.torrent || entry.torrent.destroyed) {
          clearInterval(entry.statsInterval);
          return;
        }

        const speedMB = (entry.torrent.downloadSpeed / (1024 * 1024)).toFixed(2);
        console.log(
          `[Swarm] "${entry.torrent.name.slice(0, 30)}" | ` +
          `Peers: ${entry.torrent.numPeers} | Download: ${speedMB} MB/s`
        );
      }, STATS_INTERVAL_MS);

      resolve(torrent);
    });
  });

  return entry.promise;
}

// Periodically remove only torrents that have been idle for a while.
// Active streams are never stopped by this cleanup.
const torrentCleanupInterval = setInterval(() => {
  const now = Date.now();

  for (const [key, entry] of activeTorrents.entries()) {
    if (
      entry.openStreams.size === 0 &&
      now - entry.lastUsedAt > TORRENT_IDLE_TIMEOUT_MS
    ) {
      console.log(`[Cleanup] Removing idle torrent: ${key.slice(0, 45)}`);
      destroyTorrentEntry(key, entry);
    }
  }
}, 60 * 1000);

torrentCleanupInterval.unref?.();

// General file-based range streaming
function pipeFileToResponse(key, file, req, res) {
  const entry = getEntry(key, key);
  if (entry) entry.lastUsedAt = Date.now();

  const extension = file.name.split('.').pop()?.toLowerCase();
  const contentType = extension === 'mkv'
    ? 'video/x-matroska'
    : extension === 'webm'
      ? 'video/webm'
      : 'video/mp4';

  const range = req.headers.range;
  let start = 0;
  let end = file.length - 1;
  let statusCode = 200;

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());

    if (!match || (!match[1] && !match[2])) {
      res.setHeader('Content-Range', `bytes */${file.length}`);
      return res.status(416).end();
    }

    if (!match[1]) {
      const suffixLength = Number(match[2]);
      if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
        res.setHeader('Content-Range', `bytes */${file.length}`);
        return res.status(416).end();
      }
      start = Math.max(0, file.length - suffixLength);
    } else {
      start = Number(match[1]);
      if (match[2]) end = Number(match[2]);
    }

    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 0 ||
      start >= file.length ||
      end < start
    ) {
      res.setHeader('Content-Range', `bytes */${file.length}`);
      return res.status(416).end();
    }

    end = Math.min(end, file.length - 1);
    statusCode = 206;
  }

  const headers = {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Cache-Control': 'no-store'
  };

  if (statusCode === 206) {
    headers['Content-Range'] = `bytes ${start}-${end}/${file.length}`;
  }

  res.writeHead(statusCode, headers);

  // Selecting the file gives its pieces download priority for playback.
try {
  file.select(10);
} catch (_) {}
  const stream = file.createReadStream({ start, end });

  if (entry) entry.openStreams.add(stream);

  const cleanup = () => {
  if (!stream.destroyed) {
    try {
      stream.destroy();
    } catch (_) {}
  }

  if (entry) {
    entry.openStreams.delete(stream);
    entry.lastUsedAt = Date.now();

    // Don't download in the background after the player closes.
    if (entry.openStreams.size === 0) {
      pauseTorrentDownload(entry);
    }
  }
};

  stream.on('error', (err) => {
    if (!res.destroyed && !res.headersSent) {
      res.status(500).end('Unable to read video stream');
    } else if (!res.destroyed) {
      res.destroy(err);
    }

    const message = err?.message || '';
    if (
      err.code !== 'ERR_STREAM_PREMATURE_CLOSE' &&
      !message.includes('Writable stream closed') &&
      !message.includes('Torrent is removed')
    ) {
      console.error('[Stream Read Error]', message);
    }
  });

  res.on('close', cleanup);
  stream.pipe(res);
}
// ============================================================================
// 5. EXPRESS API ROUTES
// ============================================================================
app.get('/api/library', (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  const filtered = CATALOG.filter(item =>
    item.title.toLowerCase().includes(query)
  );
  res.json(filtered);
});

app.get('/api/torrent-search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.status(400).json({ error: 'Search query is required' });

  console.log(`\n[Search] Querying indexers for: "${query}"...`);
  const candidates = await searchTorrentIndexers(query);
  const { best, results } = refineAndRankTorrents(candidates, query);

  res.json({ best, results });
});

// NEW ENDPOINT: Inspect torrent and return file-system view of all video files
app.get('/api/torrent-files', async (req, res) => {
  const source = req.query.source;
  if (!source) return res.status(400).json({ error: 'Missing torrent source' });

  try {
    const torrent = await getReadyTorrent(source, source);
    
    // Filter out video files
    const videoFiles = [];
    torrent.files.forEach((file, index) => {
      const lower = file.name.toLowerCase();
      if ((lower.endsWith('.mp4') || lower.endsWith('.mkv') || lower.endsWith('.webm')) && !lower.includes('sample')) {
        videoFiles.push({
          index,
          name: file.name,
          path: file.path,
          sizeMB: Math.round(file.length / (1024 * 1024))
        });
      }
    });

    res.json({
      torrentName: torrent.name,
      files: videoFiles
    });
  } catch (err) {
    console.error('Failed to load torrent files:', err.message);
    res.status(500).json({ error: 'Failed to retrieve torrent file list' });
  }
});

// Stream a specific curated media item
app.get('/api/stream/:id', async (req, res) => {
  const media = CATALOG.find(item => item.id === req.params.id);
  if (!media) return res.status(404).send('Media item not found');

  try {
    const torrent = await getReadyTorrent(media.id, media.magnet);

    const videoFiles = torrent.files.filter(file =>
      /\.(mp4|mkv|webm)$/i.test(file.name) &&
      !file.name.toLowerCase().includes('sample')
    );

    const file = videoFiles.sort((a, b) => b.length - a.length)[0];

    if (!file) {
      return res.status(404).send('No playable video file found in this torrent');
    }

    pipeFileToResponse(media.id, file, req, res);
  } catch (err) {
    console.error('[Curated Stream Error]', err.message);
    if (!res.headersSent) res.status(500).send('Failed to load torrent');
  }
});

// Stream a specific file index from a dynamic torrent
app.get('/api/stream-file', async (req, res) => {
  const source = req.query.source;
  const fileIndex = Number.parseInt(req.query.fileIndex, 10);

  if (!source || !Number.isInteger(fileIndex) || fileIndex < 0) {
    return res.status(400).send('Missing or invalid source/fileIndex');
  }

  try {
    const torrent = await getReadyTorrent(source, source);
    const file = torrent.files[fileIndex];

    if (!file) return res.status(404).send('File index not found in torrent');

    if (!/\.(mp4|mkv|webm)$/i.test(file.name)) {
      return res.status(415).send('Selected file is not a supported video format');
    }

    pipeFileToResponse(source, file, req, res);
  } catch (err) {
    console.error('[Dynamic Stream Error]', err.message);
    if (!res.headersSent) res.status(500).send('Failed to stream selected file');
  }
});

app.post('/api/stop-stream', (req, res) => {
  for (const entry of activeTorrents.values()) {
    for (const stream of entry.openStreams) {
      try {
        stream.destroy();
      } catch (_) {}
    }

    entry.openStreams.clear();
    entry.lastUsedAt = Date.now();
  }

  console.log('[Player Closed] Streams closed; torrent sessions retained temporarily.');
  res.json({ stopped: true });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});