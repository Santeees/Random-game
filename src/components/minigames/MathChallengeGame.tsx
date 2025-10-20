import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, Clock, CheckCircle, XCircle } from 'lucide-react';

interface MathChallengeGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

interface MathProblem {
  question: string;
  answer: number;
  options: number[];
}

const MathChallengeGame: React.FC<MathChallengeGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'finished'>('instructions');
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentProblem, setCurrentProblem] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [answers, setAnswers] = useState<boolean[]>([]);

  // Generar problemas matemáticos
  const generateProblems = useCallback(() => {
    const problemCount = gameData?.problemCount || 8;
    const newProblems: MathProblem[] = [];

    for (let i = 0; i < problemCount; i++) {
      const operation = Math.floor(Math.random() * 4); // 0: suma, 1: resta, 2: multiplicación, 3: división
      let question: string;
      let answer: number;
      
      switch (operation) {
        case 0: // Suma
          const a1 = Math.floor(Math.random() * 50) + 1;
          const b1 = Math.floor(Math.random() * 50) + 1;
          question = `${a1} + ${b1}`;
          answer = a1 + b1;
          break;
        case 1: // Resta
          const a2 = Math.floor(Math.random() * 50) + 25;
          const b2 = Math.floor(Math.random() * 25) + 1;
          question = `${a2} - ${b2}`;
          answer = a2 - b2;
          break;
        case 2: // Multiplicación
          const a3 = Math.floor(Math.random() * 12) + 1;
          const b3 = Math.floor(Math.random() * 12) + 1;
          question = `${a3} × ${b3}`;
          answer = a3 * b3;
          break;
        case 3: // División
          const divisor = Math.floor(Math.random() * 10) + 2;
          const quotient = Math.floor(Math.random() * 15) + 1;
          const dividend = divisor * quotient;
          question = `${dividend} ÷ ${divisor}`;
          answer = quotient;
          break;
        default:
          question = '1 + 1';
          answer = 2;
      }

      // Generar opciones incorrectas
      const wrongOptions = new Set<number>();
      while (wrongOptions.size < 3) {
        const wrong = answer + (Math.floor(Math.random() * 20) - 10);
        if (wrong !== answer && wrong > 0) {
          wrongOptions.add(wrong);
        }
      }

      const options = [answer, ...Array.from(wrongOptions)]
        .sort(() => Math.random() - 0.5);

      newProblems.push({ question, answer, options });
    }

    setProblems(newProblems);
  }, [gameData]);

  useEffect(() => {
    generateProblems();
  }, [generateProblems]);

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

  const handleAnswerSelect = useCallback((answer: number) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === problems[currentProblem].answer;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentProblem + 1 >= problems.length) {
        finishGame();
      } else {
        setCurrentProblem(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1500);
  }, [selectedAnswer, showResult, problems, currentProblem, answers]);

  const finishGame = useCallback(() => {
    setGameState('finished');
    
    setTimeout(() => {
      const accuracy = problems.length > 0 ? (score / problems.length) * 100 : 0;
      const timeBonus = Math.max(0, timeLeft * 2);
      const finalScore = score * 10 + timeBonus;
      
      const result = {
        playerId,
        score: finalScore,
        details: `${score}/${problems.length} correctas (${accuracy.toFixed(1)}%)`,
        data: { 
          correctAnswers: score,
          totalProblems: problems.length,
          timeLeft,
          accuracy,
          timeBonus,
          answers
        }
      };
      onComplete(result);
    }, 2000);
  }, [score, problems.length, timeLeft, playerId, onComplete, answers]);

  const getOptionStyle = (option: number) => {
    const baseStyle = "w-full p-4 rounded-lg font-semibold text-lg transition-all duration-200 transform";
    
    if (!showResult) {
      return `${baseStyle} bg-white/20 hover:bg-white/30 text-white hover:scale-105 cursor-pointer`;
    }
    
    if (option === problems[currentProblem]?.answer) {
      return `${baseStyle} bg-green-500 text-white scale-105`;
    }
    
    if (option === selectedAnswer && option !== problems[currentProblem]?.answer) {
      return `${baseStyle} bg-red-500 text-white scale-105`;
    }
    
    return `${baseStyle} bg-white/10 text-gray-300`;
  };

  const currentProb = problems[currentProblem];

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Desafío Matemático
        </h2>
        <p className="text-blue-200">
          Resuelve los problemas lo más rápido posible
        </p>
      </div>

      {gameState === 'instructions' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Calculator className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Prepárate para calcular!
            </h3>
            <p className="text-blue-200 mb-4">
              Tendrás {problems.length} problemas matemáticos para resolver.
              ¡Responde correctamente y rápido para obtener más puntos!
            </p>
            <div className="text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentProb && (
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
                {currentProblem + 1}/{problems.length}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-yellow-400 font-bold">
                {score} puntos
              </span>
            </div>
          </div>

          {/* Problema actual */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              {currentProb.question} = ?
            </h3>
            {showResult && (
              <div className="flex items-center justify-center">
                {selectedAnswer === currentProb.answer ? (
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-6 h-6 mr-2" />
                    <span className="font-bold">¡Correcto!</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-400">
                    <XCircle className="w-6 h-6 mr-2" />
                    <span className="font-bold">Incorrecto</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opciones de respuesta */}
          <div className="grid grid-cols-2 gap-4">
            {currentProb.options.map((option, index) => (
              <button
                key={index}
                className={getOptionStyle(option)}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
            <Calculator className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Tiempo terminado!
            </h3>
            <div className="space-y-2 text-blue-200">
              <p>Problemas resueltos: {score}/{problems.length}</p>
              <p>Precisión: {problems.length > 0 ? ((score / problems.length) * 100).toFixed(1) : 0}%</p>
              <p>Tiempo restante: {timeLeft}s</p>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mt-4">
              {score === problems.length ? '¡Perfecto!' : 
               score >= problems.length * 0.7 ? '¡Excelente!' : 
               score >= problems.length * 0.5 ? '¡Bien hecho!' : '¡Sigue practicando!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathChallengeGame;