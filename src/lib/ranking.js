// src/lib/ranking.js
//
// Classement avec égalités : les joueurs à égalité partagent le même rang,
// et le rang suivant n'est pas sauté (1, 1, 2…), comme sur les podiums.

export const MAX_PODIUM_SLOTS = 4;

/**
 * Joueurs triés par score décroissant, avec { total, rank }.
 * scores : { [playerId]: points }
 */
export function rankPlayers(players, scores) {
  const sorted = players
    .map((p) => ({ ...p, total: scores[p.id] ?? 0 }))
    .sort((a, b) => b.total - a.total);

  let rank = 0;
  let lastTotal = null;
  return sorted.map((p) => {
    if (p.total !== lastTotal) {
      rank += 1;
      lastTotal = p.total;
    }
    return { ...p, rank };
  });
}

/** Gagnants (tous les premiers ex aequo), ou [] si personne n'a marqué. */
export function getWinners(ranked) {
  const best = ranked[0]?.total ?? 0;
  return best > 0 ? ranked.filter((p) => p.rank === 1) : [];
}

/** "A", "A and B", "A, B and C" */
export function joinNames(names) {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * Titre de victoire : "A wins …", "A and B win …", "It's a 4-way tie!".
 * Retourne null s'il n'y a pas de gagnant.
 */
export function getWinnersTitle(winners, what) {
  if (!winners.length) return null;
  if (winners.length === 1) return `${winners[0].name} wins ${what} !`;
  if (winners.length <= 3) {
    return `${joinNames(winners.map((w) => w.name))} win ${what} !`;
  }
  return `It's a ${winners.length}-way tie !`;
}

/**
 * Joueurs sur le podium, dans l'ordre d'affichage (gauche → droite) :
 *  - rangs 1 à 3, au plus MAX_PODIUM_SLOTS places ; un groupe d'ex aequo
 *    qui ne tient pas en entier reste hors podium (sauf les premiers,
 *    toujours tous affichés) ;
 *  - un premier seul se place au centre, avec un 2e à sa gauche ;
 *    plusieurs premiers sont alignés à gauche.
 */
export function getPodiumSlots(ranked) {
  const groups = [1, 2, 3]
    .map((rank) => ranked.filter((p) => p.rank === rank))
    .filter((group) => group.length > 0);

  const kept = [];
  for (let i = 0; i < groups.length; i++) {
    // Dès qu'un groupe ne tient pas, on s'arrête (pas de 3e sans les 2e)
    if (i > 0 && kept.length + groups[i].length > MAX_PODIUM_SLOTS) break;
    kept.push(...groups[i]);
  }

  const firsts = kept.filter((p) => p.rank === 1);
  const others = kept.filter((p) => p.rank !== 1);
  if (firsts.length === 1 && others.length > 0) {
    return [others[0], firsts[0], ...others.slice(1)];
  }
  return [...firsts, ...others];
}
