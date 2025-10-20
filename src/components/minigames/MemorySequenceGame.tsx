import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Eye, Hand } from 'lucide-react';

interface MemorySequenceGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

const MemorySequenceGame: React.FC<MemorySequenceGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'showing' | 'input' | 'finished'>('instructions');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showingIndex, setShowingIndex] = useState<number>(-1);
  const [score, setScore] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(3);

  const colors = [
    { id: 0, color: 'bg-red-500', name: 'Rojo' },
    { id: 1, color: 'bg-blue-500', name: 'Azul' },
    { id: 2, color: 'bg-green-500', name: 'Verde' },
    { id: 3, color: 'bg-yellow-500', name: 'Amarillo' },
    { id: 4, color: 'bg-purple-500', name: 'Morado' },
    { id: 5, color: 'bg-orange-500', name: 'Naranja' }
  ];

  // Generar secuencia aleatoria
  useEffect(() => {
    const sequenceLength = gameData?.sequenceLength || 6;
    const newSequence = Array.from({ length: sequenceLength }, () => 
      Math.floor(Math.random() * colors.length)
    );
    setSequence(newSequence);
  }, [gameData]);

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
              }
            }, 300);
          }, 800);
        }
      };
      
      setTimeout(showSequence, 1000);
    }
  }, [gameState, sequence]);

  const handleColorClick = useCallback((colorId: number) => {
    if (gameState !== 'input') return;

    const newInput = [...playerInput, colorId];
    setPlayerInput(newInput);

    // Verificar si la entrada es correcta hasta ahora
    const isCorrect = newInput.every((input, index) => input === sequence[index]);
    
    if (!isCorrect) {
      // Respuesta incorrecta
      const finalScore = newInput.length - 1; // Puntos por respuestas correctas antes del error
      setScore(finalScore);
      setGameState('finished');
      
      setTimeout(() => {
        const result = {
          playerId,
          score: finalScore * 10, // 10 puntos por cada color correcto
          details: `${finalScore}/${sequence.length} correctos`,
          data: { 
            sequence, 
            playerInput: newInput, 
            correctCount: finalScore 
          }
        };
        onComplete(result);
      }, 1500);
    } else if (newInput.length === sequence.length) {
      // Secuencia completa y correcta
      const finalScore = sequence.length;
      setScore(finalScore);
      setGameState('finished');
      
      setTimeout(() => {
        const result = {
          playerId,
          score: finalScore * 10 + 50, // Bonus por completar toda la secuencia
          details: `¡Perfecto! ${finalScore}/${sequence.length}`,
          data: { 
            sequence, 
            playerInput: newInput, 
            correctCount: finalScore,
            perfect: true
          }
        };
        onComplete(result);
      }, 1500);
    }
  }, [gameState, playerInput, sequence, playerId, onComplete]);

  const getButtonStyle = (colorId: number) => {
    const baseStyle = `w-20 h-20 rounded-lg transition-all duration-200 transform hover:scale-110 cursor-pointer shadow-lg`;
    const color = colors[colorId];
    
    if (showingIndex === colorId) {
      return `${baseStyle} ${color.color} ring-4 ring-white scale-125 shadow-2xl`;
    }
    
    if (gameState === 'input') {
      return `${baseStyle} ${color.color} hover:shadow-xl active:scale-95`;
    }
    
    return `${baseStyle} ${color.color} opacity-50`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Secuencia de Memoria
        </h2>
        <p className="text-blue-200">
          Memoriza y repite la secuencia de colores
        </p>
      </div>

      {gameState === 'instructions' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Eye className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              Prepárate para memorizar
            </h3>
            <p className="text-blue-200 mb-4">
              Se mostrará una secuencia de {sequence.length} colores.
              Memorízala y luego repítela en el mismo orden.
            </p>
            <div className="text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {gameState === 'showing' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Eye className="w-12 h-12 text-green-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Observa la secuencia!
            </h3>
            <p className="text-blue-200">
              Memoriza el orden de los colores
            </p>
          </div>
        </div>
      )}

      {gameState === 'input' && (
        <div className="text-center mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <Hand className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              ¡Tu turno!
            </h3>
            <p className="text-blue-200 mb-4">
              Haz clic en los colores en el mismo orden
            </p>
            <div className="text-white">
              Progreso: {playerInput.length}/{sequence.length}
            </div>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              ¡Terminado!
            </h3>
            <p className="text-blue-200 mb-2">
              Colores correctos: {score}/{sequence.length}
            </p>
            <div className="text-2xl font-bold text-yellow-400">
              {score === sequence.length ? '¡Perfecto!' : score > sequence.length / 2 ? '¡Bien hecho!' : '¡Sigue practicando!'}
            </div>
          </div>
        </div>
      )}

      {/* Grid de colores */}
      <div className="grid grid-cols-3 gap-4 justify-items-center max-w-md mx-auto">
        {colors.map((color) => (
          <button
            key={color.id}
            className={getButtonStyle(color.id)}
            onClick={() => handleColorClick(color.id)}
            disabled={gameState !== 'input'}
          >
            <span className="sr-only">{color.name}</span>
          </button>
        ))}
      </div>

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

export default MemorySequenceGame;