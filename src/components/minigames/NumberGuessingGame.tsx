import React, { useState, useEffect, useCallback } from 'react';
import { Target, TrendingUp, TrendingDown, Equal, Trophy } from 'lucide-react';

interface NumberGuessingGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

interface GuessResult {
  guess: number;
  hint: 'higher' | 'lower' | 'correct';
  attempt: number;
}

const NumberGuessingGame: React.FC<NumberGuessingGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'finished'>('instructions');
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [guessHistory, setGuessHistory] = useState<GuessResult[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(7);
  const [score, setScore] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(3);
  const [round, setRound] = useState<number>(1);
  const [totalRounds] = useState<number>(2);
  const [minRange, setMinRange] = useState<number>(1);
  const [maxRange, setMaxRange] = useState<number>(100);

  // Generar número objetivo
  const generateTargetNumber = useCallback(() => {
    const min = gameData?.minRange || minRange;
    const max = gameData?.maxRange || maxRange;
    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    setTargetNumber(number);
  }, [gameData, minRange, maxRange]);

  useEffect(() => {
    generateTargetNumber();
  }, [generateTargetNumber]);

  // Countdown inicial
  useEffect(() => {
    if (gameState === 'instructions') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const handleGuessSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const guess = parseInt(currentGuess);
    if (isNaN(guess) || guess < minRange || guess > maxRange) {
      return;
    }

    const attempt = 8 - attemptsLeft;
    let hint: 'higher' | 'lower' | 'correct';
    
    if (guess === targetNumber) {
      hint = 'correct';
      
      // Calcular puntuación para esta ronda
      const basePoints = 100;
      const attemptBonus = Math.max(0, (7 - attempt) * 10);
      const speedBonus = attempt <= 3 ? 30 : attempt <= 5 ? 15 : 0;
      const roundScore = basePoints + attemptBonus + speedBonus;
      
      setScore(prev => prev + roundScore);
      
      const newHistory = [...guessHistory, { guess, hint, attempt: attempt + 1 }];
      setGuessHistory(newHistory);
      
      if (round >= totalRounds) {
        // Juego terminado
        setTimeout(() => {
          setGameState('finished');
          setTimeout(() => {
            const result = {
              playerId,
              score: score + roundScore,
              details: `${round}/${totalRounds} rondas, promedio ${Math.round((score + roundScore) / round)} pts/ronda`,
              data: { 
                roundsCompleted: round,
                totalRounds,
                averageScore: Math.round((score + roundScore) / round),
                finalScore: score + roundScore,
                lastRoundAttempts: attempt + 1
              }
            };
            onComplete(result);
          }, 2000);
        }, 1500);
      } else {
        // Siguiente ronda
        setTimeout(() => {
          setRound(prev => prev + 1);
          setAttemptsLeft(7);
          setGuessHistory([]);
          setCurrentGuess('');
          
          // Aumentar dificultad
          if (round === 2) {
            setMinRange(1);
            setMaxRange(200);
          } else if (round === 3) {
            setMinRange(1);
            setMaxRange(500);
          } else if (round >= 4) {
            setMinRange(1);
            setMaxRange(1000);
          }
          
          generateTargetNumber();
        }, 2000);
      }
    } else {
      hint = guess < targetNumber ? 'higher' : 'lower';
      
      const newHistory = [...guessHistory, { guess, hint, attempt: attempt + 1 }];
      setGuessHistory(newHistory);
      setAttemptsLeft(prev => prev - 1);
      
      if (attemptsLeft <= 1) {
        // Se acabaron los intentos
        setTimeout(() => {
          if (round >= totalRounds) {
            setGameState('finished');
            setTimeout(() => {
              const result = {
                playerId,
                score,
                details: `${round}/${totalRounds} rondas, falló en ronda ${round}`,
                data: { 
                  roundsCompleted: round - 1,
                  totalRounds,
                  averageScore: round > 1 ? Math.round(score / (round - 1)) : 0,
                  finalScore: score,
                  failed: true,
                  targetNumber
                }
              };
              onComplete(result);
            }, 2000);
          } else {
            // Siguiente ronda sin puntos
            setTimeout(() => {
              setRound(prev => prev + 1);
              setAttemptsLeft(7);
              setGuessHistory([]);
              setCurrentGuess('');
              generateTargetNumber();
            }, 2000);
          }
        }, 1500);
      }
    }
    
    setCurrentGuess('');
  }, [currentGuess, targetNumber, attemptsLeft, guessHistory, round, totalRounds, score, minRange, maxRange, playerId, onComplete, generateTargetNumber]);

  const getHintIcon = (hint: 'higher' | 'lower' | 'correct') => {
    switch (hint) {
      case 'higher':
        return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'lower':
        return <TrendingDown className="w-5 h-5 text-blue-400" />;
      case 'correct':
        return <Equal className="w-5 h-5 text-green-400" />;
    }
  };

  const getHintText = (hint: 'higher' | 'lower' | 'correct') => {
    switch (hint) {
      case 'higher':
        return 'Más alto';
      case 'lower':
        return 'Más bajo';
      case 'correct':
        return '¡Correcto!';
    }
  };

  const getHintColor = (hint: 'higher' | 'lower' | 'correct') => {
    switch (hint) {
      case 'higher':
        return 'text-red-400';
      case 'lower':
        return 'text-blue-400';
      case 'correct':
        return 'text-green-400';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Adivina el Número
        </h2>
        <p className="text-blue-200">
          Encuentra el número secreto con las pistas
        </p>
      </div>

      {gameState === 'instructions' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Target className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Prepárate para adivinar!
            </h3>
            <p className="text-blue-200 mb-4">
              Tendrás {totalRounds} rondas para adivinar números secretos.
              Cada ronda tienes 7 intentos. ¡Menos intentos = más puntos!
            </p>
            <div className="text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          {/* Header con información */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-white font-bold">
                Ronda {round}/{totalRounds}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-white font-bold">
                Rango: {minRange}-{maxRange}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-yellow-400 font-bold">
                {score} puntos
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className={`font-bold ${attemptsLeft <= 2 ? 'text-red-400' : 'text-white'}`}>
                {attemptsLeft} intentos
              </span>
            </div>
          </div>

          {/* Formulario de adivinanza */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              ¿Cuál es el número secreto?
            </h3>
            <form onSubmit={handleGuessSubmit} className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="number"
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  min={minRange}
                  max={maxRange}
                  className="flex-1 px-4 py-3 bg-white/20 border-2 border-blue-400/50 rounded-lg text-white text-center text-xl font-bold placeholder-blue-200 focus:outline-none focus:border-blue-400"
                  placeholder={`${minRange} - ${maxRange}`}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!currentGuess || isNaN(parseInt(currentGuess))}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Adivinar
                </button>
              </div>
            </form>
          </div>

          {/* Historial de intentos */}
          {guessHistory.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h4 className="text-lg font-bold text-white mb-4">Historial de intentos:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {guessHistory.map((result, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-200 text-sm">#{result.attempt}</span>
                      <span className="text-white font-bold text-lg">{result.guess}</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${getHintColor(result.hint)}`}>
                      {getHintIcon(result.hint)}
                      <span className="font-bold">{getHintText(result.hint)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Juego terminado!
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
                <div className="text-blue-200">Puntuación final</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((score / Math.max(round - 1, 1)) * 10) / 10}
                </div>
                <div className="text-blue-200">Promedio por ronda</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{round - 1}</div>
                <div className="text-blue-200">Rondas completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{totalRounds}</div>
                <div className="text-blue-200">Total de rondas</div>
              </div>
            </div>
            <div className="text-xl font-bold text-white">
              {round > totalRounds ? '¡Todas las rondas completadas!' :
               score >= 400 ? '¡Excelente intuición!' :
               score >= 250 ? '¡Buen trabajo!' : '¡Sigue practicando!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberGuessingGame;