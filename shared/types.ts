// Tipos compartidos entre frontend y backend

export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  isConnected: boolean;
  isBot?: boolean;
}

export interface MinigameInfo {
  id: string;
  name: string;
  description: string;
  duration: number; // en segundos
  instructions: string;
  type?: string; // Agregar esta línea
  gameData?: any; // Agregar esta línea
}

export interface MinigameResult {
  playerId: string;
  playerName: string;
  score: number;
  time: number;
  position: number;
  details?: string; // Agregar esta línea
}

export interface GameSession {
  id: string;
  hostId: string;
  players: Player[];
  currentMinigame: number;
  totalMinigames: number;
  minigames: MinigameInfo[];
  results: MinigameResult[][];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
}

export interface GameState {
  session: GameSession | null;
  currentPlayer: Player | null;
  isConnected: boolean;
}

// Eventos Socket.IO
export interface ServerToClientEvents {
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'player:ready': (playerId: string, isReady: boolean) => void;
  'game:started': (session: GameSession) => void;
  'game:minigame-start': (minigame: MinigameInfo, minigameNumber: number) => void;
  'game:minigame-end': (results: MinigameResult[]) => void;
  'game:finished': (finalResults: MinigameResult[][]) => void;
  'session:updated': (session: GameSession) => void;
  'bot:added': (bot: Player) => void;
  'bot:removed': (botId: string) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'player:join': (playerName: string) => void;
  'player:ready': (isReady: boolean) => void;
  'game:start': () => void;
  'minigame:result': (result: Omit<MinigameResult, 'position'>) => void;
  'bot:add': (options: { difficulty: 'easy' | 'medium' | 'hard' }) => void;
  'bot:remove': (botId: string) => void;
}

// Tipos específicos para minijuegos
export interface ReactionTimeData {
  reactionTime: number;
}

export interface MemorySequenceData {
  sequence: number[];
  userSequence: number[];
  correct: boolean;
}

export interface MathChallengeData {
  answer: number;
  correct: boolean;
  timeUsed: number;
}

export interface TypingSpeedData {
  text: string;
  userText: string;
  wpm: number;
  accuracy: number;
}

export interface ColorMatchData {
  targetColor: string;
  selectedColor: string;
  correct: boolean;
  timeUsed: number;
}

export interface SimonSaysData {
  commands: string[];
  userCommands: string[];
  correct: boolean;
}

export interface NumberGuessingData {
  targetNumber: number;
  guess: number;
  attempts: number;
  correct: boolean;
}

export interface PatternMatchingData {
  pattern: string[];
  userPattern: string[];
  correct: boolean;
}

export interface QuickClickData {
  targetClicks: number;
  actualClicks: number;
  timeUsed: number;
}

export interface WordScrambleData {
  originalWord: string;
  scrambledWord: string;
  userAnswer: string;
  correct: boolean;
}

// Enum para tipos de minijuegos
export enum MinigameType {
  REACTION_TIME = 'reaction-time',
  MEMORY_SEQUENCE = 'memory-sequence',
  MATH_CHALLENGE = 'math-challenge',
  TYPING_SPEED = 'typing-speed',
  COLOR_MATCH = 'color-match',
  SIMON_SAYS = 'simon-says',
  NUMBER_GUESSING = 'number-guessing',
  PATTERN_MATCHING = 'pattern-matching',
  QUICK_CLICK = 'quick-click',
  WORD_SCRAMBLE = 'word-scramble'
}

export interface FinalGameResults {
  players: Player[];
  duration?: number;
  totalMinigames: number;
  minigameResults: MinigameResult[][];
}