// src/data/questions/pop01.js

export const POP01_QUESTIONS = [
  {
    id: 'POP01_Q01',
    stageId: 'pop_1',
    order: 0,
    title: 'Jerry Rivera - Amore Como El Nuestro (1992)',
    coverSource: require('../../../assets/images/covers/POP01/POP01_Q01_question_cover.jpg'),
    audioSource: require('../../../assets/audio/POP01/POP01_Q01_sample.mp3'),
    correctAnswer: {
      artist: 'Shakira ft. Wyclef Jean',
      song: "Hips Don't Lie",
    },
    answerTitle: "Shakira ft. Wyclef Jean – Hips Don't Lie (2005)",
    answerCoverSource: require('../../../assets/images/covers/POP01/POP01_Q01_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/POP01/POP01_Q01_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'bpm +10' },
      { at: 5, text: 'bpm +10 / pitch +1.5' },
      { at: 11, reveal: true },
    ],
  },
  {
    id: 'POP01_Q02',
    stageId: 'pop_1',
    order: 1,
    title: 'Luiz Bonfá - Seville (1967)',
    coverSource: require('../../../assets/images/covers/POP01/POP01_Q02_question_cover.jpg'),
    audioSource: require('../../../assets/audio/POP01/POP01_Q02_sample.mp3'),
    correctAnswer: {
      artist: 'Gotye ft. Kimbra',
      song: 'Somebody That I Used To Know',
    },
    answerTitle: 'Gotye ft. Kimbra – Somebody That I Used To Know (2011)',
    answerCoverSource: require('../../../assets/images/covers/POP01/POP01_Q02_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/POP01/POP01_Q02_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'just looped' },
      { at: 8, reveal: true },
    ],
  },
  {
    id: 'POP01_Q03',
    stageId: 'pop_1',
    order: 2,
    title:
      'Lata Mangeshkar and S. P. Balasubrahmanyam - Tere Mere Beech Mein (1981)',
    coverSource: require('../../../assets/images/covers/POP01/POP01_Q03_question_cover.jpg'),
    audioSource: require('../../../assets/audio/POP01/POP01_Q03_sample.mp3'),
    correctAnswer: {
      artist: 'Britney Spears',
      song: 'Toxic',
    },
    answerTitle: 'Britney Spears – Toxic (2003)',
    answerCoverSource: require('../../../assets/images/covers/POP01/POP01_Q03_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/POP01/POP01_Q03_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'chopped and sliced' },
      { at: 8, text: 'chopped and sliced / bpm -23 / pitch +1' },
      { at: 16, reveal: true },
    ],
  },
  {
    id: 'POP01_Q04',
    stageId: 'pop_1',
    order: 3,
    title: 'Gian Franco Reverberi - Last Men Standing (1968)',
    coverSource: require('../../../assets/images/covers/POP01/POP01_Q04_question_cover.jpg'),
    audioSource: require('../../../assets/audio/POP01/POP01_Q04_sample.mp3'),
    correctAnswer: {
      artist: 'Gnarls Barkley',
      song: 'Crazy',
    },
    answerTitle: 'Gnarls Barkley – Crazy (2006)',
    answerCoverSource: require('../../../assets/images/covers/POP01/POP01_Q04_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/POP01/POP01_Q04_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'pitch +2' },
      { at: 17, reveal: true },
    ],
  },
  {
    id: 'POP01_Q05',
    stageId: 'pop_1',
    order: 4,
    title: 'Andrew Oldham Orchestra - The Last Time (1965)',
    coverSource: require('../../../assets/images/covers/POP01/POP01_Q05_question_cover.jpg'),
    audioSource: require('../../../assets/audio/POP01/POP01_Q05_sample.mp3'),
    correctAnswer: {
      artist: 'The Verve',
      song: 'Bitter Sweet Symphony',
    },
    answerTitle: 'The Verve – Bitter Sweet Symphony (1997)',
    answerCoverSource: require('../../../assets/images/covers/POP01/POP01_Q05_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/POP01/POP01_Q05_correction.mp3'),
    correctionSteps: [
      { at: 12, reveal: true },
    ],
  },
];
