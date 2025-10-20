import React, { useState, useEffect, useCallback } from 'react';
import { Grid3X3, Eye, CheckCircle, XCircle, Trophy } from 'lucide-react';

interface PatternMatchingGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

interface Pattern {
  id: string;
  grid: boolean[][];
  size: number;
}

interface Challenge {
  pattern: Pattern;
  options: Pattern[];
  correctIndex: number;
}

const PatternMatchingGame: React.FC<PatternMatchingGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'showing' | 'selecting' | 'finished'>('instructions');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeNumber, setChallengeNumber] = useState<number>(1);
  const [totalChallenges] = useState<number>(8);
  const [score, setScore] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [showTime, setShowTime] = useState<number>(3);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);

  // Generar patrón aleatorio
  const generatePattern = useCallback((size: number): boolean[][] => {
    const pattern: boolean[][] = [];
    const density = 0.4 + Math.random() * 0.3; // 40-70% de celdas activas
    
    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        pattern[i][j] = Math.random() < density;
      }
    }
    
    return pattern;
  }, []);

  // Crear variación del patrón
  const createVariation = useCallback((original: boolean[][], changeCount: number): boolean[][] => {
    const variation = original.map(row => [...row]);
    const size = original.length;
    
    for (let i = 0; i < changeCount; i++) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      variation[row][col] = !variation[row][col];
    }
    
    return variation;
  }, []);

  // Generar desafío
  const generateChallenge = useCallback(() => {
    const baseSize = Math.min(3 + Math.floor(challengeNumber / 2), 5);
    const size = gameData?.gridSize || baseSize;
    
    const originalPattern = generatePattern(size);
    const correctIndex = Math.floor(Math.random() * 4);
    
    const options: Pattern[] = [];
    
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        options.push({
          id: `option-${i}`,
          grid: originalPattern.map(row => [...row]),
          size
        });
      } else {
        const changeCount = Math.max(1, Math.floor(size * 0.3));
        options.push({
          id: `option-${i}`,
          grid: createVariation(originalPattern, changeCount),
          size
        });
      }
    }
    
    const challenge: Challenge = {
      pattern: {
        id: 'original',
        grid: originalPattern,
        size
      },
      options,
      correctIndex
    };
    
    setCurrentChallenge(challenge);
    setSelectedOption(null);
    setShowResult(false);
    setGameState('showing');
    
    // Tiempo para mostrar el patrón
    const showDuration = Math.max(2, 5 - Math.floor(challengeNumber / 2));
    setShowTime(showDuration);
  }, [challengeNumber, gameData, generatePattern, createVariation]);

  // Countdown inicial
  useEffect(() => {
    if (gameState === 'instructions') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('showing');
            generateChallenge();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, generateChallenge]);

  // Timer principal del juego
  useEffect(() => {
    if (gameState === 'showing' || gameState === 'selecting') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Tiempo agotado
            setGameState('finished');
            setTimeout(() => {
              const result = {
                playerId,
                score,
                details: `${correctAnswers}/${challengeNumber - 1} correctas, racha máxima: ${maxStreak}`,
                data: { 
                  correctAnswers,
                  totalChallenges: challengeNumber - 1,
                  accuracy: challengeNumber > 1 ? Math.round((correctAnswers / (challengeNumber - 1)) * 100) : 0,
                  maxStreak,
                  finalScore: score,
                  timeUp: true
                }
              };
              onComplete(result);
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, score, correctAnswers, challengeNumber, maxStreak, playerId, onComplete]);

  // Timer para mostrar patrón
  useEffect(() => {
    if (gameState === 'showing') {
      const timer = setInterval(() => {
        setShowTime(prev => {
          if (prev <= 1) {
            setGameState('selecting');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    if (selectedOption !== null || showResult) return;
    
    setSelectedOption(optionIndex);
    const correct = optionIndex === currentChallenge?.correctIndex;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      const basePoints = 100;
      const timeBonus = Math.floor(timeLeft * 2);
      const streakBonus = streak * 10;
      const difficultyBonus = (currentChallenge?.pattern.size || 3) * 20;
      const totalPoints = basePoints + timeBonus + streakBonus + difficultyBonus;
      
      setScore(prev => prev + totalPoints);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    
    setTimeout(() => {
      if (challengeNumber >= totalChallenges) {
        // Juego terminado
        setGameState('finished');
        setTimeout(() => {
          const result = {
            playerId,
            score,
            details: `${correctAnswers + (correct ? 1 : 0)}/${totalChallenges} correctas, racha máxima: ${Math.max(maxStreak, correct ? streak + 1 : streak)}`,
            data: { 
              correctAnswers: correctAnswers + (correct ? 1 : 0),
              totalChallenges,
              accuracy: Math.round(((correctAnswers + (correct ? 1 : 0)) / totalChallenges) * 100),
              maxStreak: Math.max(maxStreak, correct ? streak + 1 : streak),
              finalScore: score + (correct ? 100 + Math.floor(timeLeft * 2) + streak * 10 + (currentChallenge?.pattern.size || 3) * 20 : 0),
              completed: true
            }
          };
          onComplete(result);
        }, 2000);
      } else {
        // Siguiente desafío
        setChallengeNumber(prev => prev + 1);
        generateChallenge();
      }
    }, 2000);
  }, [selectedOption, showResult, currentChallenge, timeLeft, streak, maxStreak, challengeNumber, totalChallenges, score, correctAnswers, playerId, onComplete, generateChallenge]);

  const renderGrid = (pattern: Pattern, isOption: boolean = false, optionIndex?: number) => {
    const cellSize = pattern.size <= 3 ? 'w-8 h-8' : pattern.size <= 4 ? 'w-6 h-6' : 'w-5 h-5';
    const isSelected = optionIndex !== undefined && selectedOption === optionIndex;
    const isCorrectOption = optionIndex !== undefined && optionIndex === currentChallenge?.correctIndex;
    
    let borderColor = 'border-blue-400/50';
    if (showResult && isOption) {
      if (isSelected) {
        borderColor = isCorrect ? 'border-green-400' : 'border-red-400';
      } else if (isCorrectOption) {
        borderColor = 'border-green-400';
      }
    }
    
    return (
      <div 
        className={`inline-block p-4 bg-white/10 backdrop-blur-lg rounded-lg border-2 ${borderColor} ${
          isOption ? 'cursor-pointer hover:bg-white/20 transition-all duration-200' : ''
        } ${isSelected ? 'ring-2 ring-white/50' : ''}`}
        onClick={isOption ? () => handleOptionSelect(optionIndex!) : undefined}
      >
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${pattern.size}, 1fr)` }}
        >
          {pattern.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${cellSize} rounded border ${
                  cell 
                    ? 'bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300' 
                    : 'bg-gray-600/50 border-gray-500'
                }`}
              />
            ))
          )}
        </div>
        {showResult && isOption && isSelected && (
          <div className="flex items-center justify-center mt-2">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400" />
            )}
          </div>
        )}
        {showResult && isOption && !isSelected && isCorrectOption && (
          <div className="flex items-center justify-center mt-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
          <Grid3X3 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Coincidencia de Patrones
        </h2>
        <p className="text-blue-200">
          Memoriza el patrón y encuentra la coincidencia exacta
        </p>
      </div>

      {gameState === 'instructions' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Grid3X3 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Prepárate para memorizar!
            </h3>
            <p className="text-blue-200 mb-4">
              Verás un patrón por unos segundos. Luego debes encontrar
              la coincidencia exacta entre 4 opciones.
            </p>
            <div className="text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {(gameState === 'showing' || gameState === 'selecting') && (
        <div>
          {/* Header con información */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-white font-bold">
                Patrón {challengeNumber}/{totalChallenges}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-yellow-400 font-bold">
                {score} puntos
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-green-400 font-bold">
                Racha: {streak}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {gameState === 'showing' && currentChallenge && (
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-purple-400 mr-2" />
                  <span className="text-white font-bold">
                    Memoriza este patrón ({showTime}s)
                  </span>
                </div>
                <div className="flex justify-center">
                  {renderGrid(currentChallenge.pattern)}
                </div>
              </div>
            </div>
          )}

          {gameState === 'selecting' && currentChallenge && (
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  ¿Cuál coincide con el patrón que viste?
                </h3>
                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {currentChallenge.options.map((option, index) => (
                    <div key={option.id} className="flex justify-center">
                      {renderGrid(option, true, index)}
                    </div>
                  ))}
                </div>
                {showResult && (
                  <div className="mt-6">
                    <div className={`text-xl font-bold ${
                      isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                    </div>
                    {isCorrect && (
                      <div className="text-blue-200 mt-2">
                        +{100 + Math.floor(timeLeft * 2) + streak * 10 + (currentChallenge.pattern.size * 20)} puntos
                      </div>
                    )}
                  </div>
                )}
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
                <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
                <div className="text-blue-200">Respuestas correctas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round((correctAnswers / Math.max(challengeNumber - 1, 1)) * 100)}%
                </div>
                <div className="text-blue-200">Precisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{maxStreak}</div>
                <div className="text-blue-200">Racha máxima</div>
              </div>
            </div>
            <div className="text-xl font-bold text-white">
              {correctAnswers >= totalChallenges * 0.8 ? '¡Memoria excepcional!' :
               correctAnswers >= totalChallenges * 0.6 ? '¡Buen reconocimiento!' : '¡Sigue practicando!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternMatchingGame;