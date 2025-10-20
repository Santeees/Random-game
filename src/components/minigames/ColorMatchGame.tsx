import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Clock, Star, Zap } from 'lucide-react';

interface ColorMatchGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

interface ColorChallenge {
  targetColor: string;
  colorName: string;
  options: { color: string; name: string }[];
}

const ColorMatchGame: React.FC<ColorMatchGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'finished'>('instructions');
  const [challenges, setChallenges] = useState<ColorChallenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);

  const colors = [
    { name: 'Rojo', color: '#EF4444', variants: ['#DC2626', '#B91C1C', '#991B1B'] },
    { name: 'Azul', color: '#3B82F6', variants: ['#2563EB', '#1D4ED8', '#1E40AF'] },
    { name: 'Verde', color: '#10B981', variants: ['#059669', '#047857', '#065F46'] },
    { name: 'Amarillo', color: '#F59E0B', variants: ['#D97706', '#B45309', '#92400E'] },
    { name: 'Morado', color: '#8B5CF6', variants: ['#7C3AED', '#6D28D9', '#5B21B6'] },
    { name: 'Rosa', color: '#EC4899', variants: ['#DB2777', '#BE185D', '#9D174D'] },
    { name: 'Naranja', color: '#F97316', variants: ['#EA580C', '#C2410C', '#9A3412'] },
    { name: 'Turquesa', color: '#06B6D4', variants: ['#0891B2', '#0E7490', '#155E75'] },
    { name: 'Lima', color: '#84CC16', variants: ['#65A30D', '#4D7C0F', '#365314'] },
    { name: 'Índigo', color: '#6366F1', variants: ['#4F46E5', '#4338CA', '#3730A3'] }
  ];

  // Generar desafíos de colores
  const generateChallenges = useCallback(() => {
    const challengeCount = gameData?.challengeCount || 12;
    const newChallenges: ColorChallenge[] = [];

    for (let i = 0; i < challengeCount; i++) {
      const targetColorData = colors[Math.floor(Math.random() * colors.length)];
      const targetVariant = Math.floor(Math.random() * 4); // 0 = color principal, 1-3 = variantes
      const targetColor = targetVariant === 0 ? targetColorData.color : targetColorData.variants[targetVariant - 1];
      
      // Crear opciones (3 incorrectas + 1 correcta)
      const wrongOptions = [];
      const usedColors = new Set([targetColor]);
      
      while (wrongOptions.length < 3) {
        const randomColorData = colors[Math.floor(Math.random() * colors.length)];
        const randomVariant = Math.floor(Math.random() * 4);
        const randomColor = randomVariant === 0 ? randomColorData.color : randomColorData.variants[randomVariant - 1];
        
        if (!usedColors.has(randomColor)) {
          wrongOptions.push({ color: randomColor, name: randomColorData.name });
          usedColors.add(randomColor);
        }
      }
      
      const options = [
        { color: targetColor, name: targetColorData.name },
        ...wrongOptions
      ].sort(() => Math.random() - 0.5);

      newChallenges.push({
        targetColor,
        colorName: targetColorData.name,
        options
      });
    }

    setChallenges(newChallenges);
  }, [gameData]);

  useEffect(() => {
    generateChallenges();
  }, [generateChallenges]);

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

  // Timer del juego
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  const handleColorSelect = useCallback((selectedColorData: { color: string; name: string }) => {
    if (selectedColor !== null || showResult) return;

    setSelectedColor(selectedColorData.color);
    setShowResult(true);

    const currentChal = challenges[currentChallenge];
    const isCorrect = selectedColorData.color === currentChal.targetColor;
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));
      
      // Puntuación con bonus por racha
      const basePoints = 10;
      const streakBonus = Math.min(newStreak * 2, 20);
      setScore(prev => prev + basePoints + streakBonus);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentChallenge + 1 >= challenges.length) {
        finishGame();
      } else {
        setCurrentChallenge(prev => prev + 1);
        setSelectedColor(null);
        setShowResult(false);
      }
    }, 1500);
  }, [selectedColor, showResult, challenges, currentChallenge, streak, maxStreak]);

  const finishGame = useCallback(() => {
    setGameState('finished');
    
    setTimeout(() => {
      const accuracy = challenges.length > 0 ? (score / (challenges.length * 10)) * 100 : 0;
      const timeBonus = Math.max(0, timeLeft * 2);
      const streakBonus = maxStreak * 5;
      const finalScore = score + timeBonus + streakBonus;
      
      const result = {
        playerId,
        score: finalScore,
        details: `${Math.round(accuracy)}% precisión, racha máx: ${maxStreak}`,
        data: { 
          correctAnswers: Math.round(score / 10),
          totalChallenges: challenges.length,
          accuracy: Math.round(accuracy),
          timeLeft,
          maxStreak,
          timeBonus,
          streakBonus
        }
      };
      onComplete(result);
    }, 2000);
  }, [score, challenges.length, timeLeft, maxStreak, playerId, onComplete]);

  const getOptionStyle = (option: { color: string; name: string }) => {
    const baseStyle = "w-24 h-24 rounded-lg transition-all duration-200 transform cursor-pointer shadow-lg border-4";
    
    if (!showResult) {
      return `${baseStyle} border-white/30 hover:border-white hover:scale-110 hover:shadow-xl`;
    }
    
    if (option.color === challenges[currentChallenge]?.targetColor) {
      return `${baseStyle} border-green-400 scale-110 shadow-2xl ring-4 ring-green-400/50`;
    }
    
    if (option.color === selectedColor && option.color !== challenges[currentChallenge]?.targetColor) {
      return `${baseStyle} border-red-400 scale-110 shadow-2xl ring-4 ring-red-400/50`;
    }
    
    return `${baseStyle} border-white/20 opacity-50`;
  };

  const currentChal = challenges[currentChallenge];

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Coincidencia de Colores
        </h2>
        <p className="text-blue-200">
          Encuentra el color que coincida con el nombre mostrado
        </p>
      </div>

      {gameState === 'instructions' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Palette className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Prepárate para los colores!
            </h3>
            <p className="text-blue-200 mb-4">
              Se mostrará el nombre de un color. Debes hacer clic en el color correcto
              entre las opciones. ¡Las rachas te dan puntos extra!
            </p>
            <div className="text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentChal && (
        <div>
          {/* Header con información */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <div className="flex items-center text-white">
                <Clock className="w-5 h-5 mr-2" />
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-white font-bold">
                {currentChallenge + 1}/{challenges.length}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <div className="flex items-center text-yellow-400">
                <Star className="w-5 h-5 mr-1" />
                <span className="font-bold">{score}</span>
              </div>
            </div>
            {streak > 0 && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-4 py-2">
                <div className="flex items-center text-white">
                  <Zap className="w-5 h-5 mr-1" />
                  <span className="font-bold">{streak}</span>
                </div>
              </div>
            )}
          </div>

          {/* Color objetivo */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6 text-center">
            <h3 className="text-sm text-blue-200 mb-2">Encuentra este color:</h3>
            <div className="text-4xl font-bold text-white mb-4">
              {currentChal.colorName}
            </div>
            <div 
              className="w-32 h-32 rounded-lg mx-auto border-4 border-white/30 shadow-lg"
              style={{ backgroundColor: currentChal.targetColor }}
            ></div>
            {showResult && (
              <div className="mt-4">
                {selectedColor === currentChal.targetColor ? (
                  <div className="text-green-400 font-bold text-lg">
                    ¡Correcto! {streak > 1 && `+${streak} racha`}
                  </div>
                ) : (
                  <div className="text-red-400 font-bold text-lg">
                    Incorrecto
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opciones de colores */}
          <div className="text-center mb-4">
            <p className="text-blue-200 text-sm">Selecciona el color correcto:</p>
          </div>
          <div className="grid grid-cols-4 gap-6 justify-items-center">
            {currentChal.options.map((option, index) => (
              <button
                key={index}
                className={getOptionStyle(option)}
                style={{ backgroundColor: option.color }}
                onClick={() => handleColorSelect(option)}
                disabled={showResult}
                title={option.name}
              >
                <span className="sr-only">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
            <Palette className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Tiempo terminado!
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
                <div className="text-blue-200">Puntuación final</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{maxStreak}</div>
                <div className="text-blue-200">Racha máxima</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((score / (challenges.length * 10)) * 100)}%
                </div>
                <div className="text-blue-200">Precisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{timeLeft}s</div>
                <div className="text-blue-200">Tiempo restante</div>
              </div>
            </div>
            <div className="text-xl font-bold text-white">
              {maxStreak >= 5 ? '¡Maestro de colores!' :
               score >= challenges.length * 8 ? '¡Excelente vista!' :
               score >= challenges.length * 5 ? '¡Buen ojo!' : '¡Sigue practicando!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorMatchGame;