// src/lib/checkAnswer.js

/* =========================
   NORMALISATION
========================= */

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/é|è|ê/g, 'e')
    .replace(/à/g, 'a')
    .replace(/&|,/g, ' and ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* =========================
   LEVENSHTEIN (noms courts)
========================= */

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

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

function isCloseMatch(a, b, maxRatio = 0.35) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;

  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return dist <= Math.ceil(maxLen * maxRatio);
}

/* =========================
   EXTRACTION DES ARTISTES
========================= */

const SEPARATORS = [
  'ft',
  'feat',
  'featuring',
  'and',
  'et',
];

function extractArtists(str) {
  return normalize(str)
    .split(/\b(ft|ft\.|feat|feat\.|featuring|and|et)\b/g)
    .map((p) => p.trim())
    .filter(
      (p) =>
        p &&
        !SEPARATORS.includes(p)
    );
}

/* =========================
   ALIAS
========================= */

const ARTIST_ALIASES = {
  'kanye west': ['kanye'],
  'eminem': ['slim shady', 'marshall mathers'],
  'britney spears': ['britney'],
  'kendrick lamar': ['kendrick'],
  '2 chainz': ['two chainz', 'two chains'],
};

/* =========================
   ARTIST CHECK (CLÉ)
========================= */

function isArtistCorrect(userArtist, correctArtist) {
  if (!userArtist || !correctArtist) return false;

  const userArtists = extractArtists(userArtist);
  const officialArtists = extractArtists(correctArtist);

  for (const ua of userArtists) {
    for (const oa of officialArtists) {
      // match direct
      if (isCloseMatch(ua, oa)) {
        return true;
      }

      // match alias
      const aliases = ARTIST_ALIASES[oa] || [];
      if (
        aliases.some((alias) =>
          isCloseMatch(ua, alias)
        )
      ) {
        return true;
      }
    }
  }

  return false;
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

function computeScoreForPlayer(ans, question) {
  if (!ans) return 0;

  const possibleAnswers = [
    question.correctAnswer,
    ...(question.acceptedAnswers || []),
  ];

  let bestScore = 0;

  for (const candidate of possibleAnswers) {
    const artistOk = isArtistCorrect(ans.artist, candidate.artist);
    const songOk = isSongCorrect(ans.song, candidate.song);
    const score = (artistOk ? 1 : 0) + (songOk ? 1 : 0);

    if (score > bestScore) {
      bestScore = score;
    }
  }

  return bestScore;
}


/* =========================
   EXPORTS
========================= */

export {
  computeScoreForPlayer,
  isArtistCorrect, isCloseMatch, isSongCorrect, levenshtein,
  normalize
};

