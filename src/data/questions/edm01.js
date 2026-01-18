// src/data/questions/edm01.js

export const EDM01_QUESTIONS = [
  {
    id: 'EDM01_Q01',
    stageId: 'edm_1',
    order: 0,
    title: "Etta James - Something's Got a Hold on Me (1962)",
    coverSource: require('../../../assets/images/covers/EDM01/EDM01_Q01_question_cover.jpg'),
    audioSource: require('../../../assets/audio/EDM01/EDM01_Q01_sample.mp3'),
    correctAnswer: {
      artist: 'Flo Rida',
      song: 'Good Feeling',
    },
    acceptedAnswers: [
    {
      artist: 'Avicii',
      song: 'Levels',
    },
    ],
    answerTitle: 'Flo Rida – Good Feeling (2011)',
    answerCoverSource: require('../../../assets/images/covers/EDM01/EDM01_Q01_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/EDM01/EDM01_Q01_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'bpm +53' },
      { at: 17, reveal: true },
    ],
  },
  {
    id: 'EDM01_Q02',
    stageId: 'edm_1',
    order: 1,
    title: 'Lee Oskar - San Francisco Bay (1978)',
    coverSource: require('../../../assets/images/covers/EDM01/EDM01_Q02_question_cover.jpg'),
    audioSource: require('../../../assets/audio/EDM01/EDM01_Q02_sample.mp3'),
    correctAnswer: {
      artist: 'Pitbull ft. Kesha',
      song: 'Timber',
    },
    answerTitle: 'Pitbull ft. Ke$ha – Timber (2013)',
    answerCoverSource: require('../../../assets/images/covers/EDM01/EDM01_Q02_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/EDM01/EDM01_Q02_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'bpm +33' },
      { at: 8, text: 'bpm +33 / pitch -1.5' },
      { at: 16, reveal: true },
    ],
  },
  {
    id: 'EDM01_Q03',
    stageId: 'edm_1',
    order: 2,
    title: 'Alice Deejay - Better Off Alone (1999)',
    coverSource: require('../../../assets/images/covers/EDM01/EDM01_Q03_question_cover.jpg'),
    audioSource: require('../../../assets/audio/EDM01/EDM01_Q03_sample.mp3'),
    correctAnswer: {
      artist: 'David Guetta ft. Ne-YO & Akon',
      song: 'Play Hard',
    },
    answerTitle: 'David Guetta ft. Ne-YO & Akon – Play Hard (2011)',
    answerCoverSource: require('../../../assets/images/covers/EDM01/EDM01_Q03_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/EDM01/EDM01_Q03_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'bpm -7' },
      { at: 8, reveal: true },
    ],
  },
  {
    id: 'EDM01_Q04',
    stageId: 'edm_1',
    order: 3,
    title: 'Steve Winwood - Valerie (1982)',
    coverSource: require('../../../assets/images/covers/EDM01/EDM01_Q04_question_cover.jpg'),
    audioSource: require('../../../assets/audio/EDM01/EDM01_Q04_sample.mp3'),
    correctAnswer: {
      artist: 'Eric Prydz',
      song: 'Call On Me',
    },
    acceptedAnswers: [
    {
      artist: 'Thomas Bangalter ft. DJ Falcon',
      song: 'Call on me',
    },
    ],
    answerTitle: 'Eric Prydz – Call On Me (2004)',
    answerCoverSource: require('../../../assets/images/covers/EDM01/EDM01_Q04_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/EDM01/EDM01_Q04_correction.mp3'),
    correctionSteps: [
      { at: 0, text: 'looped' },
      { at: 5, text: 'looped / pitch +1.5' },
      { at: 9, text: 'looped / pitch +1.5 / bpm +10' },
      { at: 17, reveal: true },
    ],
  },
  {
    id: 'EDM01_Q05',
    stageId: 'edm_1',
    order: 4,
    title: 'Nicolas Fasano VS Pat-Rich - 75 Brasil Street (2008)',
    coverSource: require('../../../assets/images/covers/EDM01/EDM01_Q05_question_cover.jpg'),
    audioSource: require('../../../assets/audio/EDM01/EDM01_Q05_sample.mp3'),
    correctAnswer: {
      artist: 'Pitbull',
      song: 'I Know You Want Me',
    },
    answerTitle: 'Pitbull – I Know You Want Me (Calle Ocho) (2009)',
    answerCoverSource: require('../../../assets/images/covers/EDM01/EDM01_Q05_answer_cover.jpg'),
    correctionAudioSource: require('../../../assets/audio/EDM01/EDM01_Q05_correction.mp3'),
    correctionSteps: [
      { at: 7, reveal: true },
    ],
  },
];
