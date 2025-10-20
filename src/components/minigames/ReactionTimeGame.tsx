import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Clock } from 'lucide-react';

interface ReactionTimeGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

const ReactionTimeGame: React.FC<ReactionTimeGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'go' | 'clicked' | 'too_early'>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(3);
  const [waitTime, setWaitTime] = useState<number>(0);

  const handleClick = useCallback(() => {
    const now = Date.now();
    
    if (gameState === 'ready') {
      setGameState('too_early');
      setTimeout(() => {
        const result = {
          playerId,
          score: 0,
          details: 'Clic muy temprano',
          data: { reactionTime: 0, tooEarly: true }
        };
        onComplete(result);
      }, 1500);
    } else if (gameState === 'go') {
      const reaction = now - startTime;
      setReactionTime(reaction);
      setGameState('clicked');
      
      setTimeout(() => {
        const score = Math.max(0, 1000 - reaction); // Puntuación basada en velocidad
        const result = {
          playerId,
          score,
          details: `${reaction}ms`,
          data: { reactionTime: reaction }
        };
        onComplete(result);
      }, 1500);
    }
  }, [gameState, startTime, playerId, onComplete]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'waiting') {
      // Countdown inicial
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('ready');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (gameState === 'ready') {
      // Esperar tiempo aleatorio antes de mostrar "GO!"
      const randomWait = Math.random() * 3000 + 2000; // 2-5 segundos
      setWaitTime(randomWait);
      
      timer = setTimeout(() => {
        setStartTime(Date.now());
        setGameState('go');
      }, randomWait);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
        clearTimeout(timer);
      }
    };
  }, [gameState]);

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-red-500';
      case 'go':
        return 'bg-green-500';
      case 'clicked':
        return 'bg-yellow-500';
      case 'too_early':
        return 'bg-red-700';
      default:
        return 'bg-gray-500';
    }
  };

  const getInstruction = () => {
    switch (gameState) {
      case 'waiting':
        return `Prepárate... ${countdown}`;
      case 'ready':
        return 'Espera el color verde...';
      case 'go':
        return '¡CLIC AHORA!';
      case 'clicked':
        return `¡Excelente! ${reactionTime}ms`;
      case 'too_early':
        return '¡Muy temprano! Espera el verde';
      default:
        return 'Cargando...';
    }
  };

  const getIcon = () => {
    switch (gameState) {
      case 'waiting':
        return <Clock className="w-16 h-16 text-white" />;
      case 'ready':
        return <Clock className="w-16 h-16 text-white animate-pulse" />;
      case 'go':
        return <Zap className="w-16 h-16 text-white animate-bounce" />;
      case 'clicked':
        return <Zap className="w-16 h-16 text-white" />;
      case 'too_early':
        return <Clock className="w-16 h-16 text-white" />;
      default:
        return <Clock className="w-16 h-16 text-white" />;
    }
  };

  return (
    <div className="w-full h-96 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Tiempo de Reacción
        </h2>
        <p className="text-blue-200">
          Haz clic cuando veas el color verde
        </p>
      </div>

      <div 
        className={`w-80 h-80 rounded-full ${getBackgroundColor()} flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-2xl`}
        onClick={handleClick}
      >
        <div className="mb-4">
          {getIcon()}
        </div>
        <div className="text-white text-2xl font-bold text-center px-4">
          {getInstruction()}
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-blue-200 text-sm">
          {gameState === 'ready' && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Mantente alerta...</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          )}
          {gameState === 'clicked' && (
            <div>
              <p>Tu tiempo de reacción: <span className="font-bold text-yellow-400">{reactionTime}ms</span></p>
              <p className="text-xs mt-1">
                {reactionTime < 200 ? '¡Increíble!' : 
                 reactionTime < 300 ? '¡Muy bueno!' :
                 reactionTime < 400 ? 'Bueno' :
                 reactionTime < 500 ? 'Regular' : 'Puedes mejorar'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionTimeGame;