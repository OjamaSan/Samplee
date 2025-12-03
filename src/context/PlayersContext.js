// src/context/PlayersContext.js

import React, {
  createContext,
  useContext,
  useRef,
  useState,
} from 'react';
import { AVATARS } from '../data/avatars';

const PlayersContext = createContext(null);

// Mélange simple (Fisher–Yates)
function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createInitialPlayers() {
  // On mélange la liste des avatars pour en tirer 2 distincts si possible
  const shuffled = shuffleArray(AVATARS);

  const avatar1 = shuffled[0]?.id ?? null;
  const avatar2 = shuffled[1]?.id ?? avatar1 ?? null;

  return [
    {
      id: '1',
      name: 'Player 1',
      avatarId: avatar1,
    },
    {
      id: '2',
      name: 'Player 2',
      avatarId: avatar2,
    },
  ];
}

export function PlayersProvider({ children }) {
  const [players, setPlayers] = useState(() => createInitialPlayers());

  // Pour générer des IDs uniques pour les nouveaux joueurs
  const nextPlayerIdRef = useRef(3);

  return (
    <PlayersContext.Provider
      value={{ players, setPlayers, nextPlayerIdRef }}
    >
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayers() {
  const ctx = useContext(PlayersContext);
  if (!ctx) {
    throw new Error('usePlayers must be used within a PlayersProvider');
  }
  return ctx;
}
