import React from 'react';
import { useGameStore } from '../store/gameStore';
import { GameSession, Player } from 'shared/types';
import ReactionTimeGame from './minigames/ReactionTimeGame';
import MemorySequenceGame from './minigames/MemorySequenceGame';
import MathChallengeGame from './minigames/MathChallengeGame';
import TypingSpeedGame from './minigames/TypingSpeedGame';
import ColorMatchGame from './minigames/ColorMatchGame';
import SimonSaysGame from './minigames/SimonSaysGame';
import NumberGuessingGame from './minigames/NumberGuessingGame';
import PatternMatchingGame from './minigames/PatternMatchingGame';
import FastClickGame from './minigames/FastClickGame';
import WordScrambleGame from './minigames/WordScrambleGame';

interface GameScreenProps {
  session: GameSession | null;
  currentPlayer: Player | null;
  onResult: (result: any) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  session, 
  currentPlayer, 
  onResult 
}) => {
  const { currentMinigame, currentMinigameNumber } = useGameStore();

  if (!session || !currentPlayer || !currentMinigame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Preparando minijuego...</div>
        </div>
      </div>
    );
  }

  const renderMinigame = () => {
    const commonProps = {
      onComplete: onResult,
      playerId: currentPlayer.id,
      gameData: currentMinigame.gameData
    };

    switch (currentMinigame.type) {
      case 'reaction-time':
        return <ReactionTimeGame {...commonProps} />;
      case 'memory-sequence':
        return <MemorySequenceGame {...commonProps} />;
      case 'math-challenge':
        return <MathChallengeGame {...commonProps} />;
      case 'typing-speed':
        return <TypingSpeedGame {...commonProps} />;
      case 'color-match':
        return <ColorMatchGame {...commonProps} />;
      case 'simon-says':
        return <SimonSaysGame {...commonProps} />;
      case 'number-guessing':
        return <NumberGuessingGame {...commonProps} />;
      case 'pattern-matching':
        return <PatternMatchingGame {...commonProps} />;
      case 'quick-click':
        return <FastClickGame {...commonProps} />;
      case 'word-scramble':
        return <WordScrambleGame {...commonProps} />;
      default:
        return (
          <div className="text-center text-white">
            <p>Minijuego no encontrado: {currentMinigame.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header del juego */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Minijuego {currentMinigameNumber}/5
            </div>
            <h1 className="text-xl font-bold text-white">
              {currentMinigame.name}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              <span className="text-blue-300">Jugador:</span> {currentPlayer.name}
            </div>
            <div className="text-white text-sm">
              <span className="text-green-300">Puntos:</span> {currentPlayer.score}
            </div>
          </div>
        </div>
      </div>

      {/* Área del minijuego */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {renderMinigame()}
        </div>
      </div>

      {/* Footer con información */}
      <div className="bg-white/5 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-blue-200 text-sm">
            <p className="mb-2">{currentMinigame.description}</p>
            <p>Duración: {currentMinigame.duration}s</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;