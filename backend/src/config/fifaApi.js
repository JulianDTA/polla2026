const axios = require('axios');

// football-data.org — Free Football Data API
// Registration (free): https://www.football-data.org/client/register
// Docs: https://www.football-data.org/documentation/quickstart
//
// Free tier: 10 requests/minute, full access to major competitions.
// Auth: X-Auth-Token header  (set FIFA_API_KEY in .env)
// WC 2026: competition code "WC", season 2026

const BASE_URL = 'https://api.football-data.org/v4';
const COMP     = 'WC';
const SEASON   = 2026;

function makeClient() {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'X-Auth-Token': process.env.FIFA_API_KEY || '' },
  });
}

// ── stage mapping ─────────────────────────────────────────────────────────────
// football-data.org uses these stage codes (WC 2026 may vary slightly)
var STAGE_MAP = {
  // Group stage
  'GROUP_STAGE':        'group',
  'GROUP':              'group',
  // Round of 32 (new in WC 2026 with 48 teams)
  'ROUND_OF_32':        'round_of_32',
  'LAST_32':            'round_of_32',
  'ROUND_32':           'round_of_32',
  // Round of 16
  'ROUND_OF_16':        'round_of_16',
  'LAST_16':            'round_of_16',
  'ROUND_16':           'round_of_16',
  // Quarter finals
  'QUARTER_FINALS':     'quarter_final',
  'QUARTERFINAL':       'quarter_final',
  'QUARTER_FINAL':      'quarter_final',
  // Semi finals
  'SEMI_FINALS':        'semi_final',
  'SEMIFINAL':          'semi_final',
  'SEMI_FINAL':         'semi_final',
  // Third place / Final
  'THIRD_PLACE':        'third_place',
  'THIRD_PLACE_MATCH':  'third_place',
  'PLAY_OFF_5_6':       'third_place',
  'FINAL':              'final',
};

function parseStage(s) {
  if (!s) return 'round_of_32'; // unknown → treat as knockout, not group
  var mapped = STAGE_MAP[String(s).toUpperCase()];
  if (mapped) return mapped;
  // If the string contains hints, use them
  var u = String(s).toUpperCase();
  if (u.indexOf('GROUP') !== -1)   return 'group';
  if (u.indexOf('32') !== -1)      return 'round_of_32';
  if (u.indexOf('16') !== -1)      return 'round_of_16';
  if (u.indexOf('QUARTER') !== -1) return 'quarter_final';
  if (u.indexOf('SEMI') !== -1)    return 'semi_final';
  if (u.indexOf('FINAL') !== -1)   return 'final';
  // Unknown knockout stage — safer to show as round_of_32 than to pollute group view
  return 'round_of_32';
}

// e.g. "GROUP_A" → "A"
function parseGroup(g) {
  if (!g) return null;
  var m = g.match(/GROUP_([A-L])/i);
  return m ? m[1].toUpperCase() : null;
}

// football-data.org status → our status
function parseStatus(s) {
  if (s === 'IN_PLAY' || s === 'PAUSED') return 'live';
  if (s === 'FINISHED')                  return 'finished';
  return 'upcoming';
}

function normaliseMatch(m) {
  var stage = parseStage(m.stage);
  var group = parseGroup(m.group);

  // Safety: if both teams are TBD, this is a knockout match regardless of what the API says
  var homeName = (m.homeTeam && m.homeTeam.name) || '';
  var awayName = (m.awayTeam && m.awayTeam.name) || '';
  var isTBD = (!homeName || homeName === 'TBD') && (!awayName || awayName === 'TBD');
  if (isTBD && stage === 'group') {
    stage = 'round_of_32';
    group = null;
  }

  // Scores: fullTime.home/away when finished; null otherwise
  var homeScore = null;
  var awayScore = null;
  if (m.score) {
    var ft = m.score.fullTime;
    if (ft && ft.home !== null && ft.home !== undefined) homeScore = ft.home;
    if (ft && ft.away !== null && ft.away !== undefined) awayScore = ft.away;
  }

  return {
    external_id:    String(m.id),
    home_team_id:   m.homeTeam ? String(m.homeTeam.id) : '',
    home_team_name: (m.homeTeam && m.homeTeam.name)      || 'TBD',
    home_team_flag: (m.homeTeam && m.homeTeam.crest)     || '',
    away_team_id:   m.awayTeam ? String(m.awayTeam.id) : '',
    away_team_name: (m.awayTeam && m.awayTeam.name)      || 'TBD',
    away_team_flag: (m.awayTeam && m.awayTeam.crest)     || '',
    home_score:     homeScore,
    away_score:     awayScore,
    match_date:     m.utcDate || null,
    stage:          stage,
    group_name:     group,
    venue:          m.venue   || '',
    city:           '',  // football-data.org doesn't provide city separately
    status:         parseStatus(m.status),
    updated_at:     new Date().toISOString(),
  };
}

var fifaApi = {
  // Fetch all 104 World Cup 2026 fixtures in a single request
  getAllFixtures: async function() {
    var api = makeClient();
    var res = await api.get('/competitions/' + COMP + '/matches', {
      params: { season: SEASON },
    });
    var rawMatches = (res.data && res.data.matches) ? res.data.matches : [];
    console.log('[FIFA] Total fixtures from football-data.org: ' + rawMatches.length);
    
    var matches = rawMatches.map(normaliseMatch);

    // Auto-advance winners for knockout stages since API might be slow or returning TBD
    function getWinner(m) {
      if (m.status !== 'finished') return null;
      if (m.home_score > m.away_score) return { id: m.home_team_id, name: m.home_team_name, flag: m.home_team_flag };
      if (m.away_score > m.home_score) return { id: m.away_team_id, name: m.away_team_name, flag: m.away_team_flag };
      return { id: m.home_team_id, name: m.home_team_name, flag: m.home_team_flag }; // simplistic penalty fallback
    }

    const stages = ['round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'final'];
    
    for (let s = 0; s < stages.length - 1; s++) {
      const currentStage = stages[s];
      const nextStage = stages[s + 1];
      
      const currentMatches = matches.filter(m => m.stage === currentStage).sort((a, b) => parseInt(a.external_id) - parseInt(b.external_id));
      const nextMatches = matches.filter(m => m.stage === nextStage).sort((a, b) => parseInt(a.external_id) - parseInt(b.external_id));
      
      for (let i = 0; i < currentMatches.length; i++) {
        const winner = getWinner(currentMatches[i]);
        if (winner) {
          const nextMatchIndex = Math.floor(i / 2);
          const isHome = i % 2 === 0;
          if (nextMatches[nextMatchIndex]) {
            if (isHome) {
              nextMatches[nextMatchIndex].home_team_id = winner.id;
              nextMatches[nextMatchIndex].home_team_name = winner.name;
              nextMatches[nextMatchIndex].home_team_flag = winner.flag;
            } else {
              nextMatches[nextMatchIndex].away_team_id = winner.id;
              nextMatches[nextMatchIndex].away_team_name = winner.name;
              nextMatches[nextMatchIndex].away_team_flag = winner.flag;
            }
          }
          
          // Push losers to third_place match
          if (currentStage === 'semi_final') {
            const loser = m.home_score < m.away_score ? { id: m.home_team_id, name: m.home_team_name, flag: m.home_team_flag }
                        : m.away_score < m.home_score ? { id: m.away_team_id, name: m.away_team_name, flag: m.away_team_flag }
                        : { id: m.away_team_id, name: m.away_team_name, flag: m.away_team_flag }; // fallback

            const thirdPlaceMatch = matches.find(x => x.stage === 'third_place');
            if (thirdPlaceMatch) {
              if (isHome) {
                thirdPlaceMatch.home_team_id = loser.id;
                thirdPlaceMatch.home_team_name = loser.name;
                thirdPlaceMatch.home_team_flag = loser.flag;
              } else {
                thirdPlaceMatch.away_team_id = loser.id;
                thirdPlaceMatch.away_team_name = loser.name;
                thirdPlaceMatch.away_team_flag = loser.flag;
              }
            }
          }
        }
      }
    }

    return matches;
  },

  // Fetch only live/in-progress matches (IN_PLAY + PAUSED = half time)
  getLiveFixtures: async function() {
    try {
      var api = makeClient();
      // Fetch today's matches — football-data.org free tier doesn't support
      // comma-separated status, so fetch by date range covering today
      var today = new Date().toISOString().slice(0, 10);
      var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      var res = await api.get('/competitions/' + COMP + '/matches', {
        params: { season: SEASON, dateFrom: yesterday, dateTo: today },
      });
      var matches = (res.data && res.data.matches) ? res.data.matches : [];
      // Filter to live/paused/finished
      var live = matches.filter(function(m) {
        return m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED';
      });
      console.log('[FIFA] Live/paused matches: ' + live.length);
      return live.map(function(m) {
        var n = normaliseMatch(m);
        return {
          external_id: n.external_id,
          status:      n.status,
          home_score:  n.home_score,
          away_score:  n.away_score,
          updated_at:  n.updated_at,
        };
      });
    } catch (e) {
      console.warn('[FIFA] getLiveFixtures error (ignored):', e.message);
      return [];
    }
  },

  // Fetch group standings
  getStandings: async function() {
    var api = makeClient();
    var res = await api.get('/competitions/' + COMP + '/standings', {
      params: { season: SEASON },
    });
    return (res.data && res.data.standings) ? res.data.standings : [];
  },
};

module.exports = fifaApi;
