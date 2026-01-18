// src/data/questions/rap01.js

export const RAP01_QUESTIONS = [
  {
    id: 'RAP01_Q01',
    stageId: 'rap_1',
    order: 0,
    title: 'David McCallum - The Edge (1967)',
    coverSource: require('../../../assets/images/covers/RAP01/RAP01_Q01_question_cover.jpg'),
    audioSource: require('../../../assets/audio/RAP01/RAP01_Q01_sample.mp3'),
    correctAnswer: {
      artist: 'Dr Dre ft. Snoop Dogg',
      song: 'The Next Episode',
    },
    answerTitle: 'Dr Dre ft. Snoop Dogg – The Next Episode (2000)',
    answerCoverSource: require('../../../assets/images/covers/RAP01/RAP01_Q01_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/RAP01/RAP01_Q01_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'bpm +4' },
      { at: 8, text: 'bpm +4 / pitch +1' },
      { at: 16, reveal: true },
    ],
  },
  {
    id: 'RAP01_Q02',
    stageId: 'rap_1',
    order: 1,
    title: 'Monk Higgins - I Believe To My Soul (1968)',
    coverSource: require('../../../assets/images/covers/RAP01/RAP01_Q02_question_cover.jpg'),
    audioSource: require('../../../assets/audio/RAP01/RAP01_Q02_sample.mp3'),
    correctAnswer: {
      artist: 'Kendrick Lamar',
      song: 'Not Like Us',
    },
    answerTitle: 'Kendrick Lamar – Not Like Us (2024)',
    answerCoverSource: require('../../../assets/images/covers/RAP01/RAP01_Q02_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/RAP01/RAP01_Q02_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'bpm +32' },
      { at: 4, text: 'bpm +32 / pitch +6' },
      { at: 9, reveal: true },
    ],
  },
  {
    id: 'RAP01_Q03',
    stageId: 'rap_1',
    order: 2,
    title: 'Carlton Williams - Prison Song (1978)',
    coverSource: require('../../../assets/images/covers/RAP01/RAP01_Q03_question_cover.jpg'),
    audioSource: require('../../../assets/audio/RAP01/RAP01_Q03_sample.mp3'),
    correctAnswer: {
      artist: 'Future',
      song: 'Mask Off',
    },
    answerTitle: 'Future – Mask Off (2017)',
    answerCoverSource: require('../../../assets/images/covers/RAP01/RAP01_Q03_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/RAP01/RAP01_Q03_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'bpm -3' },
      { at: 6, text: 'bpm -3 / pitch -2' },
      { at: 13, reveal: true },
    ],
  },
  {
    id: 'RAP01_Q04',
    stageId: 'rap_1',
    order: 3,
    title: 'Labi Siffre - I Got The… (2006)',
    coverSource: require('../../../assets/images/covers/RAP01/RAP01_Q04_question_cover.jpg'),
    audioSource: require('../../../assets/audio/RAP01/RAP01_Q04_sample.mp3'),
    correctAnswer: {
      artist: 'Eminem',
      song: 'My Name Is…',
    },
    answerTitle: 'Eminem – My Name Is… (1999)',
    answerCoverSource: require('../../../assets/images/covers/RAP01/RAP01_Q04_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/RAP01/RAP01_Q04_correction.mp3'),
    correctionSteps: [
      { at: 11, reveal: true },
    ],
  },
  {
    id: 'RAP01_Q05',
    stageId: 'rap_1',
    order: 4,
    title: 'Rick James - Super Freak (1981)',
    coverSource: require('../../../assets/images/covers/RAP01/RAP01_Q05_question_cover.jpg'),
    audioSource: require('../../../assets/audio/RAP01/RAP01_Q05_sample.mp3'),
    correctAnswer: {
      artist: 'MC Hammer',
      song: "Can't Touch This",
    },
    acceptedAnswers: [
    {
      artist: 'Nicki Minaj',
      song: 'Super freaky girl',
    },
  ],
    answerTitle: "MC Hammer – Can't Touch This (1990)",
    answerCoverSource: require('../../../assets/images/covers/RAP01/RAP01_Q05_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/RAP01/RAP01_Q05_correction.mp3'),
    correctionSteps: [
      { at: 8, reveal: true },
    ],
  },
];
