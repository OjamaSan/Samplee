// src/theme/stageTheme.js

import { colors } from './colors';
import { STAGES } from '../data/stages';

// petite utilitaire
export function getStageById(stageId) {
  return STAGES.find((s) => s.id === stageId) ?? null;
}

/**
 * Retourne une palette pour un stage donné.
 * Ex :
 *  - background → fond de l’écran
 *  - cardBackground → fond des cartes
 *  - cardBorder → bordures
 *  - primaryText → texte principal (souvent blanc)
 */
export function getStageTheme(stageId) {
  const stage = getStageById(stageId);
  const family = stage?.colorFamily ?? 'turquoise';

  const palette = colors[family] ?? colors.turquoise;

  return {
    family,
    palette,
    background: palette[500],
    cardBackground: palette[100],
    cardBorder: palette[700],
    // pour l’instant on garde le texte clair en "rouge 100"
    primaryText: colors.rouge[100],
    // texte foncé dans les cartes
    cardText: palette[700],
  };
}
