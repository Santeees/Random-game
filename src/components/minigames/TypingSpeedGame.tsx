import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Keyboard, Clock, Target, Zap } from 'lucide-react';

interface TypingSpeedGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

const TypingSpeedGame: React.FC<TypingSpeedGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'finished'>('instructions');
  const [text, setText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [startTime, setStartTime] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(3);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [errors, setErrors] = useState<number>(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sampleTexts = [
    "La programación es el arte de decirle a una computadora exactamente qué hacer. Cada línea de código es una instrucción precisa que debe ser ejecutada paso a paso.",
    "El desarrollo web moderno combina creatividad y lógica para crear experiencias digitales increíbles. Los desarrolladores utilizan múltiples tecnologías para construir aplicaciones.",
    "JavaScript es un lenguaje de programación versátil que permite crear desde simples scripts hasta aplicaciones complejas. Su flexibilidad lo hace muy popular entre desarrolladores.",
    "React es una biblioteca de JavaScript para construir interfaces de usuario. Utiliza componentes reutilizables que hacen el desarrollo más eficiente y mantenible.",
    "TypeScript añade tipado estático a JavaScript, lo que ayuda a detectar errores durante el desarrollo y hace el código más robusto y fácil de mantener."
  ];

  // Seleccionar texto aleatorio
  useEffect(() => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setText(randomText);
  }, []);

  // Countdown inicial
  useEffect(() => {
    if (gameState === 'instructions') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('playing');
            setStartTime(Date.now());
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

  // Enfocar input cuando empiece el juego
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  // Calcular estadísticas en tiempo real
  useEffect(() => {
    if (gameState === 'playing' && userInput.length > 0) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // en minutos
      const wordsTyped = userInput.trim().split(' ').length;
      const currentWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      setWpm(currentWpm);

      // Calcular precisión
      let correctChars = 0;
      let totalErrors = 0;
      
      for (let i = 0; i < userInput.length; i++) {
        if (i < text.length && userInput[i] === text[i]) {
          correctChars++;
        } else {
          totalErrors++;
        }
      }
      
      setErrors(totalErrors);
      const currentAccuracy = userInput.length > 0 ? (correctChars / userInput.length) * 100 : 100;
      setAccuracy(Math.round(currentAccuracy));
    }
  }, [userInput, gameState, startTime, text]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // No permitir escribir más allá del texto original
    if (value.length <= text.length) {
      setUserInput(value);
      
      // Si completó todo el texto, terminar el juego
      if (value.length === text.length) {
        setTimeout(finishGame, 500);
      }
    }
  }, [text]);

  const finishGame = useCallback(() => {
    setGameState('finished');
    
    setTimeout(() => {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60;
      const wordsTyped = userInput.trim().split(' ').length;
      const finalWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      
      // Calcular puntuación final
      const completionBonus = userInput.length === text.length ? 50 : 0;
      const accuracyBonus = Math.round(accuracy / 2);
      const speedBonus = Math.min(finalWpm, 100);
      const finalScore = speedBonus + accuracyBonus + completionBonus;
      
      const result = {
        playerId,
        score: finalScore,
        details: `${finalWpm} PPM, ${accuracy}% precisión`,
        data: { 
          wpm: finalWpm,
          accuracy,
          errors,
          charactersTyped: userInput.length,
          totalCharacters: text.length,
          timeElapsed: Math.round(timeElapsed * 60),
          completed: userInput.length === text.length,
          speedBonus,
          accuracyBonus,
          completionBonus
        }
      };
      onComplete(result);
    }, 2000);
  }, [startTime, userInput, text, accuracy, errors, playerId, onComplete]);

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-lg ';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += 'bg-green-500/30 text-green-200';
        } else {
          className += 'bg-red-500/30 text-red-200';
        }
      } else if (index === userInput.length) {
        className += 'bg-blue-500/50 text-white animate-pulse';
      } else {
        className += 'text-gray-300';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
          <Keyboard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Velocidad de Escritura
        </h2>
        <p className="text-blue-200">
          Escribe el texto lo más rápido y preciso posible
        </p>
      </div>

      {gameState === 'instructions' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Keyboard className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Prepárate para escribir!
            </h3>
            <p className="text-blue-200 mb-4">
              Tendrás 60 segundos para escribir el texto que aparecerá.
              ¡La velocidad y precisión son importantes!
            </p>
            <div className="text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          {/* Estadísticas en tiempo real */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}s
              </div>
              <div className="text-sm text-blue-200">Tiempo</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">
                {wpm}
              </div>
              <div className="text-sm text-blue-200">PPM</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-center">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">
                {accuracy}%
              </div>
              <div className="text-sm text-blue-200">Precisión</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-center">
              <div className="w-6 h-6 bg-red-400 rounded mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold">
                !
              </div>
              <div className="text-xl font-bold text-white">
                {errors}
              </div>
              <div className="text-sm text-blue-200">Errores</div>
            </div>
          </div>

          {/* Texto para escribir */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <div className="font-mono leading-relaxed">
              {renderText()}
            </div>
          </div>

          {/* Área de escritura */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              className="w-full h-32 bg-transparent border-2 border-blue-400/50 rounded-lg p-4 text-white font-mono text-lg resize-none focus:outline-none focus:border-blue-400"
              placeholder="Comienza a escribir aquí..."
              disabled={gameState !== 'playing'}
            />
            <div className="mt-2 text-sm text-blue-200">
              Progreso: {userInput.length}/{text.length} caracteres
            </div>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
            <Keyboard className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Tiempo terminado!
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{wpm}</div>
                <div className="text-blue-200">Palabras por minuto</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
                <div className="text-blue-200">Precisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{userInput.length}</div>
                <div className="text-blue-200">Caracteres escritos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{errors}</div>
                <div className="text-blue-200">Errores</div>
              </div>
            </div>
            <div className="text-xl font-bold text-white">
              {userInput.length === text.length ? '¡Texto completo!' :
               wpm >= 60 ? '¡Velocidad increíble!' :
               wpm >= 40 ? '¡Muy buena velocidad!' :
               wpm >= 25 ? '¡Buen trabajo!' : '¡Sigue practicando!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingSpeedGame;