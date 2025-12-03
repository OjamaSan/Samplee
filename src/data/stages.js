// src/data/stages.js

import { colors } from '../theme/colors';

// On se base sur les ids définis dans src/data/avatars.js
// rnb_01 et rnb_02 → avatar_rnb_01.png / avatar_rnb_02.png

export const STAGES = [
  {
    id: 'rnb_classics_1',
    title: 'RnB 1',
    periodLabel: '2003 - 2017',
    questionCount: 5,
    difficulty: 'easy', // valeur "brute" si tu veux switcher sur ça
    difficultyLabel: 'Difficulty : easy',

    // Famille de couleur du stage (turquoise)
    colorFamily: 'turquoise',
    colors: {
      fill: colors.turquoise[500],   // fond du bloc
      border: colors.turquoise[700], // contour 9px
    },

    // Référence aux avatars via leurs id (cf. AVATARS)
    avatarIds: ['rnb_01', 'rnb_02'],
  },

  {
    id: 'hs_1',
    title: 'House 1',
    periodLabel: '1998 - 2022',
    questionCount: 5,
    difficulty: 'easy', // valeur "brute" si tu veux switcher sur ça
    difficultyLabel: 'Difficulty : easy',

    // Famille de couleur du stage (cobalt)
    colorFamily: 'cobalt',
    colors: {
      fill: colors.cobalt[500],   // fond du bloc
      border: colors.cobalt[700], // contour 9px
    },

    // Référence aux avatars via leurs id (cf. AVATARS)
    avatarIds: ['hs_01', 'hs_02'],
  },

  {
    id: 'pop_1',
    title: 'Pop 1',
    periodLabel: '1997-2011',
    questionCount: 5,
    difficulty: 'easy', // valeur "brute" si tu veux switcher sur ça
    difficultyLabel: 'Difficulty : easy',

    // Famille de couleur du stage (cobalt)
    colorFamily: 'green',
    colors: {
      fill: colors.green[500],   // fond du bloc
      border: colors.green[700], // contour 9px
    },

    // Référence aux avatars via leurs id (cf. AVATARS)
    avatarIds: ['pop_01', 'pop_02'],
  },

  {
    id: 'edm_1',
    title: 'Electro / Dance',
    periodLabel: '2004 - 2013',
    questionCount: 5,
    difficulty: 'easy', // valeur "brute" si tu veux switcher sur ça
    difficultyLabel: 'Difficulty : easy',

    // Famille de couleur du stage (cobalt)
    colorFamily: 'blue',
    colors: {
      fill: colors.blue[500],   // fond du bloc
      border: colors.blue[700], // contour 9px
    },

    // Référence aux avatars via leurs id (cf. AVATARS)
    avatarIds: ['edm_01', 'edm_02'],
  },

  {
    id: 'rap_1',
    title: 'Rap 1',
    periodLabel: '1990 - 2024',
    questionCount: 5,
    difficulty: 'easy', // valeur "brute" si tu veux switcher sur ça
    difficultyLabel: 'Difficulty : easy',

    // Famille de couleur du stage (cobalt)
    colorFamily: 'purple',
    colors: {
      fill: colors.purple[500],   // fond du bloc
      border: colors.purple[700], // contour 9px
    },

    // Référence aux avatars via leurs id (cf. AVATARS)
    avatarIds: ['rap_01', 'rap_02'],
  },
];
