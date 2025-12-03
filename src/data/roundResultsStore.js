// src/data/roundResultsStore.js

// results[stageId][questionId] = { questionIndex, answersByPlayer }
const results = {};

/**
 * Appelé à chaque fin de question (depuis la route round).
 */
export function saveQuestionResults(stageId, questionId, questionIndex, answersByPlayer) {
  if (!results[stageId]) {
    results[stageId] = {};
  }
  results[stageId][questionId] = {
    questionIndex,
    answersByPlayer,
  };
}

/**
 * Récupère les réponses d'une question pour un stage donné.
 */
export function getQuestionResults(stageId, questionId) {
  return results[stageId]?.[questionId] ?? null;
}

/**
 * Toutes les questions jouées pour un stage.
 * Retourne un objet : { questionId: { questionIndex, answersByPlayer } }
 */
export function getStageResults(stageId) {
  return results[stageId] ?? {};
}

/**
 * Tous les résultats de la partie.
 * Structure : { [stageId]: { [questionId]: { questionIndex, answersByPlayer } } }
 */
export function getAllResults() {
  return results;
}

/**
 * Liste les stages déjà joués pendant cette partie.
 */
export function getPlayedStageIds() {
  return Object.keys(results);
}

/**
 * Reset complet des résultats (nouvelle partie).
 */
export function resetAllResults() {
  Object.keys(results).forEach((stageId) => {
    delete results[stageId];
  });
}
