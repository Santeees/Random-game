import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MousePointer, Target, Zap, Trophy, Timer } from 'lucide-react';

interface FastClickGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

interface ClickTarget {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  points: number;
  timeLeft: number;
  maxTime: number;
}

const FastClickGame: React.FC<FastClickGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'finished'>('instructions');
  const [targets, setTargets] = useState<ClickTarget[]>([]);
  const [score, setScore] = useState<number>(0);
  const [clicks, setClicks] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [countdown, setCountdown] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [gameAreaSize, setGameAreaSize] = useState({ width: 600, height: 400 });

  const colors = [
    { bg: 'bg-red-500', border: 'border-red-400', points: 10 },
    { bg: 'bg-blue-500', border: 'border-blue-400', points: 15 },
    { bg: 'bg-green-500', border: 'border-green-400', points: 20 },
    { bg: 'bg-yellow-500', border: 'border-yellow-400', points: 25 },
    { bg: 'bg-purple-500', border: 'border-purple-400', points: 30 },
  ];

  // Actualizar tamaño del área de juego
  useEffect(() => {
    const updateSize = () => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        setGameAreaSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Generar objetivo aleatorio
  const generateTarget = useCallback(() => {
    const colorData = colors[Math.floor(Math.random() * colors.length)];
    const size = 40 + Math.random() * 40; // 40-80px
    const maxTime = Math.max(1000, 3000 - (score / 10)); // Más rápido con mayor puntuación
    
    const target: ClickTarget = {
      id: `target-${Date.now()}-${Math.random()}`,
      x: Math.random() * (gameAreaSize.width - size),
      y: Math.random() * (gameAreaSize.height - size),
      size,
      color: colorData.bg,
      points: colorData.points,
      timeLeft: maxTime,
      maxTime
    };
    
    return target;
  }, [gameAreaSize, score]);

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

  // Timer principal del juego
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('finished');
            setTimeout(() => {
              const accuracy = clicks > 0 ? Math.round((hits / clicks) * 100) : 0;
              const result = {
                playerId,
                score,
                details: `${hits}/${clicks} clics (${accuracy}%), combo máximo: ${maxCombo}`,
                data: { 
                  totalClicks: clicks,
                  successfulHits: hits,
                  accuracy,
                  maxCombo,
                  finalScore: score,
                  clicksPerSecond: Math.round((clicks / 30) * 10) / 10
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
  }, [gameState, score, clicks, hits, maxCombo, playerId, onComplete]);

  // Generar objetivos
  useEffect(() => {
    if (gameState === 'playing') {
      const spawnInterval = setInterval(() => {
        if (targets.length < 3) { // Máximo 3 objetivos simultáneos
          setTargets(prev => [...prev, generateTarget()]);
        }
      }, 800 - Math.min(score / 20, 400)); // Spawn más rápido con mayor puntuación
      
      return () => clearInterval(spawnInterval);
    }
  }, [gameState, targets.length, generateTarget, score]);

  // Actualizar objetivos (tiempo de vida)
  useEffect(() => {
    if (gameState === 'playing') {
      const updateInterval = setInterval(() => {
        setTargets(prev => 
          prev.map(target => ({
            ...target,
            timeLeft: target.timeLeft - 50
          })).filter(target => target.timeLeft > 0)
        );
      }, 50);
      
      return () => clearInterval(updateInterval);
    }
  }, [gameState]);

  // Manejar clic en objetivo
  const handleTargetClick = useCallback((targetId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const target = targets.find(t => t.id === targetId);
    if (!target) return;
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    
    // Calcular puntos con bonus
    let points = target.points;
    
    // Bonus por velocidad (menos de 500ms desde último clic)
    if (timeSinceLastClick < 500 && lastClickTime > 0) {
      points += 5;
    }
    
    // Bonus por tiempo restante del objetivo
    const timeBonus = Math.floor((target.timeLeft / target.maxTime) * 10);
    points += timeBonus;
    
    // Bonus por combo
    const newCombo = combo + 1;
    const comboBonus = Math.floor(newCombo / 3) * 5;
    points += comboBonus;
    
    setScore(prev => prev + points);
    setHits(prev => prev + 1);
    setClicks(prev => prev + 1);
    setCombo(newCombo);
    setMaxCombo(prev => Math.max(prev, newCombo));
    setLastClickTime(now);
    
    // Remover objetivo
    setTargets(prev => prev.filter(t => t.id !== targetId));
  }, [targets, combo, lastClickTime]);

  // Manejar clic en área vacía
  const handleAreaClick = useCallback(() => {
    setClicks(prev => prev + 1);
    setCombo(0); // Resetear combo
  }, []);

  // Resetear combo por inactividad
  useEffect(() => {
    if (gameState === 'playing') {
      const comboResetTimer = setTimeout(() => {
        if (Date.now() - lastClickTime > 2000) {
          setCombo(0);
        }
      }, 2000);
      
      return () => clearTimeout(comboResetTimer);
    }
  }, [gameState, lastClickTime]);

  const getTargetOpacity = (target: ClickTarget) => {
    const lifePercentage = target.timeLeft / target.maxTime;
    return Math.max(0.3, lifePercentage);
  };

  const getTargetScale = (target: ClickTarget) => {
    const lifePercentage = target.timeLeft / target.maxTime;
    return 0.8 + (lifePercentage * 0.2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mb-4">
          <MousePointer className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Clic Rápido
        </h2>
        <p className="text-blue-200">
          Haz clic en los objetivos antes de que desaparezcan
        </p>
      </div>

      {gameState === 'instructions' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Target className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Prepárate para hacer clic!
            </h3>
            <div className="text-blue-200 mb-4 space-y-2">
              <p>• Haz clic en los objetivos de colores antes de que desaparezcan</p>
              <p>• Objetivos más pequeños y raros valen más puntos</p>
              <p>• Mantén un combo para bonus adicionales</p>
              <p>• ¡Evita hacer clic en áreas vacías!</p>
            </div>
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
              <span className="text-yellow-400 font-bold">
                {score} puntos
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-green-400 font-bold">
                {hits}/{clicks} clics
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-purple-400 font-bold">
                Combo: {combo}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className={`font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                <Timer className="w-4 h-4 inline mr-1" />
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Área de juego */}
          <div 
            ref={gameAreaRef}
            className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-blue-400/50 overflow-hidden cursor-crosshair"
            style={{ height: '400px' }}
            onClick={handleAreaClick}
          >
            {/* Objetivos */}
            {targets.map(target => (
              <div
                key={target.id}
                className={`absolute ${target.color} rounded-full border-4 border-white/50 cursor-pointer transition-all duration-100 hover:scale-110 shadow-lg`}
                style={{
                  left: `${target.x}px`,
                  top: `${target.y}px`,
                  width: `${target.size}px`,
                  height: `${target.size}px`,
                  opacity: getTargetOpacity(target),
                  transform: `scale(${getTargetScale(target)})`
                }}
                onClick={(e) => handleTargetClick(target.id, e)}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {target.points}
                  </span>
                </div>
                {/* Indicador de tiempo */}
                <div 
                  className="absolute bottom-0 left-0 bg-white/30 h-1 transition-all duration-50"
                  style={{ 
                    width: `${(target.timeLeft / target.maxTime) * 100}%` 
                  }}
                />
              </div>
            ))}
            
            {/* Mensaje de combo */}
            {combo >= 3 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-500/80 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
                <Zap className="w-4 h-4 inline mr-1" />
                ¡COMBO x{combo}!
              </div>
            )}
            
            {/* Instrucciones en el área */}
            {targets.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/50 text-center">
                  <Target className="w-12 h-12 mx-auto mb-2" />
                  <p>Los objetivos aparecerán aquí...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Tiempo agotado!
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
                <div className="text-blue-200">Puntuación final</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {clicks > 0 ? Math.round((hits / clicks) * 100) : 0}%
                </div>
                <div className="text-blue-200">Precisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{hits}</div>
                <div className="text-blue-200">Objetivos alcanzados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{maxCombo}</div>
                <div className="text-blue-200">Combo máximo</div>
              </div>
            </div>
            <div className="text-lg text-blue-200 mb-2">
              Velocidad: {Math.round((clicks / 30) * 10) / 10} clics/segundo
            </div>
            <div className="text-xl font-bold text-white">
              {hits >= 50 ? '¡Reflejos increíbles!' :
               hits >= 30 ? '¡Buena puntería!' :
               hits >= 15 ? '¡Sigue practicando!' : '¡Necesitas más práctica!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FastClickGame;