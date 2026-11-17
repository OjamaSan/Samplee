// src/lib/checkAnswer.js

/* =========================
   NORMALISATION
========================= */

// Minuscules, sans accents, sans contenu entre parenthèses, sans ponctuation.
// "Beyoncé (Live)" → "beyonce" ; "Ne-YO" → "neyo" ; "Can't" → "cant"
function normalize(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^the /, '');
}

// Forme compacte utilisée pour la comparaison : "jay z" et "jayz" sont égaux.
function compact(str) {
  return normalize(str).replace(/ /g, '');
}

/* =========================
   LEVENSHTEIN
========================= */

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

// Nombre de fautes de frappe tolérées selon la longueur de la réponse officielle.
// Les noms courts doivent être exacts, sinon "Halo" ≈ "Hello", "Dr Dre" ≈ "Drake".
function allowedTypos(length) {
  if (length <= 4) return 0;
  if (length <= 8) return 1;
  if (length <= 13) return 2;
  return 3;
}

// `expected` = la réponse officielle (sert à calculer la tolérance)
function isCloseMatch(given, expected) {
  const g = compact(given);
  const e = compact(expected);
  if (!g || !e) return false;
  return levenshtein(g, e) <= allowedTypos(e.length);
}

/* =========================
   EXTRACTION DES ARTISTES
========================= */

// Réponse officielle : on ne coupe que sur les marqueurs de featuring explicites,
// pour ne pas casser les noms qui contiennent "and" (Florence and the Machine).
const OFFICIAL_SEPARATORS = /\s+(?:ft\.?|feat\.?|featuring)\s+|\s*[&,]\s*/i;

// Réponse joueur : on est plus large sur la façon d'écrire plusieurs artistes.
const USER_SEPARATORS =
  /\s+(?:ft\.?|feat\.?|featuring|and|et|x|with|avec)\s+|\s*[&,+/]\s*/i;

function splitArtists(str, separators) {
  return (str || '')
    .split(separators)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* =========================
   ALIAS
========================= */

// Clé = nom officiel, valeurs = autres façons acceptées de l'écrire.
const RAW_ARTIST_ALIASES = {
  'kanye west': ['kanye', 'ye'],
  eminem: ['slim shady', 'marshall mathers'],
  'britney spears': ['britney'],
  'kendrick lamar': ['kendrick'],
  '2 chainz': ['two chainz'],
  'dr dre': ['dre', 'doctor dre'],
  'snoop dogg': ['snoop', 'snoop doggy dogg', 'snoop lion'],
  'mc hammer': ['hammer'],
  'dj khaled': ['khaled'],
  'nicki minaj': ['nicki'],
  'jason derulo': ['derulo'],
  'thomas bangalter': ['bangalter'],
  'jay-z': ['jay z', 'hov', 'jigga'],
};

const ARTIST_ALIASES = Object.fromEntries(
  Object.entries(RAW_ARTIST_ALIASES).map(([k, v]) => [compact(k), v])
);

/* =========================
   ARTIST CHECK
========================= */

// Vrai si le joueur a cité au moins un des artistes officiels
// (ex : "Snoop Dogg" suffit pour "Dr Dre ft. Snoop Dogg").
function isArtistCorrect(userArtist, correctArtist) {
  if (!userArtist || !correctArtist) return false;

  // match sur la chaîne complète (gère "Florence and the Machine")
  if (isCloseMatch(userArtist, correctArtist)) return true;

  const userArtists = splitArtists(userArtist, USER_SEPARATORS);
  const officialArtists = splitArtists(correctArtist, OFFICIAL_SEPARATORS);

  return userArtists.some((ua) =>
    officialArtists.some((oa) => {
      if (isCloseMatch(ua, oa)) return true;
      const aliases = ARTIST_ALIASES[compact(oa)] || [];
      return aliases.some((alias) => isCloseMatch(ua, alias));
    })
  );
}

/* =========================
   SONG CHECK
========================= */

function isSongCorrect(userSong, correctSong) {
  return isCloseMatch(userSong, correctSong);
}

/* =========================
   SCORE
========================= */

/**
 * Détail du résultat d'un joueur pour une question.
 * Les points viennent de la MEILLEURE réponse acceptée : on ne peut pas
 * combiner l'artiste d'une réponse et le titre d'une autre.
 * → { score: 0|1|2, artistOk: boolean, songOk: boolean }
 */
function getAnswerResult(ans, question) {
  const empty = { score: 0, artistOk: false, songOk: false };
  if (!ans) return empty;

  const candidates = [
    question.correctAnswer,
    ...(question.acceptedAnswers || []),
  ];

  let best = empty;

  for (const candidate of candidates) {
    const artistOk = isArtistCorrect(ans.artist, candidate.artist);
    const songOk = isSongCorrect(ans.song, candidate.song);
    const score = (artistOk ? 1 : 0) + (songOk ? 1 : 0);

    if (score > best.score) {
      best = { score, artistOk, songOk };
    }
  }

  return best;
}

function computeScoreForPlayer(ans, question) {
  return getAnswerResult(ans, question).score;
}

/* =========================
   EXPORTS
========================= */

export {
  computeScoreForPlayer,
  getAnswerResult,
  isArtistCorrect,
  isCloseMatch,
  isSongCorrect,
  levenshtein,
  normalize,
};
