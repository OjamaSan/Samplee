// src/theme/theme.js

import { colors } from './colors';
import { typography } from './typography';

export const theme = {
  colors,
  typography,

  // Palette de l'interface de base (rouge)
  app: {
    background: colors.rouge[500],
    surface: colors.rouge[100],
    textOnBackground: colors.rouge[100],
    textOnSurface: colors.rouge[700],
  },

  // Exemple de palette de stage
  stages: {
    rnbClassics: {
      primary: colors.turquoise[500],
      surface: colors.turquoise[100],
      text: colors.turquoise[700],
    },
  },
};
