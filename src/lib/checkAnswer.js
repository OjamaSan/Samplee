// src/lib/checkAnswer.js

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/é|è|ê/g, 'e')
    .replace(/à/g, 'a')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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

function isCloseMatch(user, expected, maxRatio = 0.35) {
  const a = normalize(user);
  const b = normalize(expected);
  if (!a || !b) return false;

  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);

  return dist <= Math.ceil(maxLen * maxRatio);
}

function isArtistCorrect(userArtist, correctArtist) {
  const normalized = normalize(correctArtist);

  const parts = normalized
    .split(/\b(ft|ft\.|feat|feat\.|featuring|&|and)\b/g)
    .map((p) => p.trim())
    .filter(Boolean);

  const candidates = [normalized, ...parts];

  return candidates.some((candidate) =>
    isCloseMatch(userArtist, candidate)
  );
}

function isSongCorrect(userSong, correctSong) {
  return isCloseMatch(userSong, correctSong);
}

function computeScoreForPlayer(ans, correct) {
  if (!ans) {
    return 0;
  }

  const artistOk = isArtistCorrect(ans.artist, correct.artist);
  const songOk = isSongCorrect(ans.song, correct.song);

  return (artistOk ? 1 : 0) + (songOk ? 1 : 0);
}

export {
  normalize,
  levenshtein,
  isCloseMatch,
  isArtistCorrect,
  isSongCorrect,
  computeScoreForPlayer,
};
