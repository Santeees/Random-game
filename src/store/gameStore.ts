import { create } from 'zustand';
import type { GameSession, Player, MinigameInfo, MinigameResult, FinalGameResults } from '../../shared/types';

export interface GameStore {
  // Estado del juego
  session: GameSession | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  error: string | null;
  
  // Estado de la UI
  currentScreen: 'join' | 'lobby' | 'game' | 'results' | 'final';
  currentMinigame: MinigameInfo | null;
  currentMinigameNumber: number;
  minigameResults: MinigameResult[] | null;
  finalResults: FinalGameResults | null;
  
  // Acciones
  setSession: (session: GameSession | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentScreen: (screen: 'join' | 'lobby' | 'game' | 'results' | 'final') => void;
  setCurrentMinigame: (minigame: MinigameInfo | null, number: number) => void;
  setMinigameResults: (results: MinigameResult[] | null) => void;
  setFinalResults: (results: FinalGameResults | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Estado inicial
  session: null,
  currentPlayer: null,
  isConnected: false,
  error: null,
  currentScreen: 'join',
  currentMinigame: null,
  currentMinigameNumber: 0,
  minigameResults: null,
  finalResults: null,
  
  // Acciones
  setSession: (session) => set({ session }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ error }),
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setCurrentMinigame: (minigame, number) => set({ 
    currentMinigame: minigame, 
    currentMinigameNumber: number 
  }),
  setMinigameResults: (results) => set({ minigameResults: results }),
  setFinalResults: (results) => set({ finalResults: results }),
  clearError: () => set({ error: null }),
  reset: () => set({
    session: null,
    currentPlayer: null,
    currentScreen: 'join',
    currentMinigame: null,
    currentMinigameNumber: 0,
    minigameResults: null,
    finalResults: null,
    error: null
  })
}));

// Selectores útiles
export const useCurrentPlayer = () => useGameStore(state => state.currentPlayer);
export const useSession = () => useGameStore(state => state.session);
export const useCurrentScreen = () => useGameStore(state => state.currentScreen);
export const useIsConnected = () => useGameStore(state => state.isConnected);
export const useError = () => useGameStore(state => state.error);
export const useCurrentMinigame = () => useGameStore(state => state.currentMinigame);
export const useMinigameResults = () => useGameStore(state => state.minigameResults);
export const useFinalResults = () => useGameStore(state => state.finalResults);