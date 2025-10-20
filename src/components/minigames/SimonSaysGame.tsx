import React, { useState, useEffect, useCallback } from 'react';
import { Play, Eye, Hand, Brain } from 'lucide-react';

interface SimonSaysGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

const SimonSaysGame: React.FC<SimonSaysGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'showing' | 'input' | 'finished'>('instructions');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [showingIndex, setShowingIndex] = useState<number>(-1);
  const [score, setScore] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(3);
  const [gameSpeed, setGameSpeed] = useState<number>(800);
  const [maxLevel, setMaxLevel] = useState<number>(0);

  const colors = [
    { id: 0, color: 'bg-red-500', activeColor: 'bg-red-300', sound: 'C' },
    { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-300', sound: 'D' },
    { id: 2, color: 'bg-green-500', activeColor: 'bg-green-300', sound: 'E' },
    { id: 3, color: 'bg-yellow-500', activeColor: 'bg-yellow-300', sound: 'F' }
  ];

  // Generar nueva secuencia (añadir un elemento)
  const generateNextSequence = useCallback(() => {
    const newElement = Math.floor(Math.random() * colors.length);
    setSequence(prev => [...prev, newElement]);
  }, []);

  // Inicializar primera secuencia
  useEffect(() => {
    generateNextSequence();
  }, [generateNextSequence]);

  // Countdown inicial
  useEffect(() => {
    if (gameState === 'instructions') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('showing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  // Mostrar secuencia
  useEffect(() => {
    if (gameState === 'showing' && sequence.length > 0) {
      let index = 0;
      const showSequence = () => {
        if (index < sequence.length) {
          setShowingIndex(sequence[index]);
          setTimeout(() => {
            setShowingIndex(-1);
            setTimeout(() => {
              index++;
              if (index < sequence.length) {
                showSequence();
              } else {
                setGameState('input');
                setPlayerInput([]);
              }
            }, 200);
          }, gameSpeed);
        }
      };
      
      setTimeout(showSequence, 1000);
    }
  }, [gameState, sequence, gameSpeed]);

  const handleColorClick = useCallback((colorId: number) => {
    if (gameState !== 'input') return;

    const newInput = [...playerInput, colorId];
    setPlayerInput(newInput);

    // Verificar si la entrada es correcta hasta ahora
    const isCorrect = newInput.every((input, index) => input === sequence[index]);
    
    if (!isCorrect) {
      // Respuesta incorrecta - fin del juego
      setGameState('finished');
      setMaxLevel(currentLevel);
      
      setTimeout(() => {
        const result = {
          playerId,
          score: score,
          details: `Nivel ${currentLevel}, ${score} puntos`,
          data: { 
            level: currentLevel,
            sequence: sequence.slice(0, newInput.length),
            playerInput: newInput,
            maxLevel: currentLevel
          }
        };
        onComplete(result);
      }, 2000);
    } else if (newInput.length === sequence.length) {
      // Secuencia completa y correcta - siguiente nivel
      const levelScore = currentLevel * 10 + (gameSpeed < 600 ? 20 : gameSpeed < 700 ? 10 : 5);
      setScore(prev => prev + levelScore);
      setCurrentLevel(prev => prev + 1);
      setMaxLevel(prev => Math.max(prev, currentLevel + 1));
      
      // Aumentar velocidad cada 3 niveles
      if ((currentLevel + 1) % 3 === 0 && gameSpeed > 400) {
        setGameSpeed(prev => Math.max(400, prev - 100));
      }
      
      // Verificar si alcanzó el nivel máximo
      if (currentLevel >= (gameData?.maxLevels || 10)) {
        setGameState('finished');
        setTimeout(() => {
          const result = {
            playerId,
            score: score + levelScore + 100, // Bonus por completar todos los niveles
            details: `¡Completado! Nivel ${currentLevel + 1}`,
            data: { 
              level: currentLevel + 1,
              sequence,
              playerInput: newInput,
              maxLevel: currentLevel + 1,
              completed: true
            }
          };
          onComplete(result);
        }, 2000);
      } else {
        setTimeout(() => {
          generateNextSequence();
          setGameState('showing');
        }, 1500);
      }
    }
  }, [gameState, playerInput, sequence, currentLevel, score, gameSpeed, gameData, onComplete, playerId, generateNextSequence]);

  const getButtonStyle = (colorId: number) => {
    const baseStyle = `w-24 h-24 rounded-lg transition-all duration-150 transform cursor-pointer shadow-lg border-4 border-white/30`;
    const color = colors[colorId];
    
    if (showingIndex === colorId) {
      return `${baseStyle} ${color.activeColor} scale-110 shadow-2xl border-white ring-4 ring-white/50`;
    }
    
    if (gameState === 'input') {
      return `${baseStyle} ${color.color} hover:${color.activeColor} hover:scale-105 active:scale-95`;
    }
    
    return `${baseStyle} ${color.color} opacity-70`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Simón Dice
        </h2>
        <p className="text-blue-200">
          Memoriza y repite la secuencia de colores
        </p>
      </div>

      {gameState === 'instructions' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Play className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Prepárate para Simón!
            </h3>
            <p className="text-blue-200 mb-4">
              Observa la secuencia de colores que se ilumina y luego repítela.
              Cada nivel añade un color más a la secuencia.
            </p>
            <div className="text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {gameState === 'showing' && (
        <div className="text-center mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <Eye className="w-12 h-12 text-green-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">
              Nivel {currentLevel}
            </h3>
            <p className="text-blue-200 mb-2">
              Observa la secuencia de {sequence.length} colores
            </p>
            <div className="text-yellow-400 font-bold">
              Puntuación: {score}
            </div>
          </div>
        </div>
      )}

      {gameState === 'input' && (
        <div className="text-center mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <Hand className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              ¡Tu turno! - Nivel {currentLevel}
            </h3>
            <p className="text-blue-200 mb-2">
              Repite la secuencia haciendo clic en los colores
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <span className="text-white">Progreso: {playerInput.length}/{sequence.length}</span>
              <span className="text-yellow-400 font-bold">Puntuación: {score}</span>
            </div>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              ¡Juego terminado!
            </h3>
            <div className="space-y-2 text-blue-200">
              <p>Nivel alcanzado: {maxLevel}</p>
              <p>Puntuación final: {score}</p>
              <p>Secuencia final: {sequence.length} colores</p>
            </div>
            <div className="text-xl font-bold text-yellow-400 mt-4">
              {maxLevel >= 8 ? '¡Memoria increíble!' :
               maxLevel >= 6 ? '¡Excelente memoria!' :
               maxLevel >= 4 ? '¡Buena memoria!' : '¡Sigue practicando!'}
            </div>
          </div>
        </div>
      )}

      {/* Grid de colores */}
      <div className="grid grid-cols-2 gap-6 justify-items-center max-w-xs mx-auto mb-6">
        {colors.map((color) => (
          <button
            key={color.id}
            className={getButtonStyle(color.id)}
            onClick={() => handleColorClick(color.id)}
            disabled={gameState !== 'input'}
          >
            <span className="sr-only">Color {color.sound}</span>
          </button>
        ))}
      </div>

      {/* Indicador de velocidad */}
      {gameState === 'input' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
            <p className="text-blue-200 text-sm mb-2">Velocidad actual:</p>
            <div className="flex justify-center space-x-2">
              {[800, 700, 600, 500, 400].map((speed) => (
                <div
                  key={speed}
                  className={`w-3 h-3 rounded-full ${
                    gameSpeed <= speed ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indicador de entrada del jugador */}
      {gameState === 'input' && playerInput.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm mb-2">Tu secuencia:</p>
          <div className="flex justify-center space-x-2">
            {playerInput.map((colorId, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded ${colors[colorId].color} border-2 border-white`}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimonSaysGame;