import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, CheckCircle, XCircle, Trophy, Clock } from 'lucide-react';

interface WordScrambleGameProps {
  onComplete: (result: any) => void;
  playerId: string;
  gameData: any;
}

interface WordChallenge {
  original: string;
  scrambled: string;
  hint: string;
  category: string;
  difficulty: number;
}

const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ 
  onComplete, 
  playerId, 
  gameData 
}) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'finished'>('instructions');
  const [currentWord, setCurrentWord] = useState<WordChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [wordNumber, setWordNumber] = useState<number>(1);
  const [totalWords] = useState<number>(10);
  const [score, setScore] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [wordTimeLeft, setWordTimeLeft] = useState<number>(15);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  const wordDatabase = [
    // Fácil (3-5 letras)
    { word: 'CASA', hint: 'Lugar donde vives', category: 'Hogar', difficulty: 1 },
    { word: 'GATO', hint: 'Animal doméstico que maúlla', category: 'Animales', difficulty: 1 },
    { word: 'AGUA', hint: 'Líquido vital', category: 'Naturaleza', difficulty: 1 },
    { word: 'LIBRO', hint: 'Se lee para aprender', category: 'Educación', difficulty: 1 },
    { word: 'FLOR', hint: 'Parte colorida de las plantas', category: 'Naturaleza', difficulty: 1 },
    { word: 'MESA', hint: 'Mueble para comer', category: 'Hogar', difficulty: 1 },
    { word: 'PERRO', hint: 'Mejor amigo del hombre', category: 'Animales', difficulty: 1 },
    { word: 'CIELO', hint: 'Azul durante el día', category: 'Naturaleza', difficulty: 1 },
    
    // Medio (6-8 letras)
    { word: 'VENTANA', hint: 'Se abre para ver afuera', category: 'Hogar', difficulty: 2 },
    { word: 'ESCUELA', hint: 'Lugar de aprendizaje', category: 'Educación', difficulty: 2 },
    { word: 'MONTAÑA', hint: 'Elevación natural del terreno', category: 'Naturaleza', difficulty: 2 },
    { word: 'GUITARRA', hint: 'Instrumento de cuerdas', category: 'Música', difficulty: 2 },
    { word: 'COMPUTADORA', hint: 'Máquina para procesar datos', category: 'Tecnología', difficulty: 2 },
    { word: 'MARIPOSA', hint: 'Insecto con alas coloridas', category: 'Animales', difficulty: 2 },
    { word: 'HOSPITAL', hint: 'Lugar para curar enfermos', category: 'Salud', difficulty: 2 },
    { word: 'BIBLIOTECA', hint: 'Lugar lleno de libros', category: 'Educación', difficulty: 2 },
    
    // Difícil (9+ letras)
    { word: 'REFRIGERADOR', hint: 'Electrodoméstico que enfría', category: 'Hogar', difficulty: 3 },
    { word: 'UNIVERSIDAD', hint: 'Educación superior', category: 'Educación', difficulty: 3 },
    { word: 'SUPERMERCADO', hint: 'Tienda grande de comestibles', category: 'Comercio', difficulty: 3 },
    { word: 'ASTRONAUTA', hint: 'Viajero del espacio', category: 'Ciencia', difficulty: 3 },
    { word: 'DEMOCRACIA', hint: 'Sistema de gobierno del pueblo', category: 'Política', difficulty: 3 },
    { word: 'FOTOGRAFIA', hint: 'Arte de capturar imágenes', category: 'Arte', difficulty: 3 },
    { word: 'ARQUITECTURA', hint: 'Arte de diseñar edificios', category: 'Arte', difficulty: 3 },
    { word: 'MATEMATICAS', hint: 'Ciencia de los números', category: 'Educación', difficulty: 3 }
  ];

  // Mezclar letras de una palabra
  const scrambleWord = useCallback((word: string): string => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    // Asegurar que la palabra mezclada sea diferente a la original
    const scrambled = letters.join('');
    return scrambled === word ? scrambleWord(word) : scrambled;
  }, []);

  // Generar nueva palabra
  const generateWord = useCallback(() => {
    // Seleccionar palabras según progresión de dificultad
    let availableWords = wordDatabase;
    if (wordNumber <= 3) {
      availableWords = wordDatabase.filter(w => w.difficulty === 1);
    } else if (wordNumber <= 7) {
      availableWords = wordDatabase.filter(w => w.difficulty <= 2);
    }
    
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    const scrambled = scrambleWord(randomWord.word);
    
    const challenge: WordChallenge = {
      original: randomWord.word,
      scrambled,
      hint: randomWord.hint,
      category: randomWord.category,
      difficulty: randomWord.difficulty
    };
    
    setCurrentWord(challenge);
    setUserAnswer('');
    setShowResult(false);
    setShowHint(false);
    
    // Tiempo por palabra según dificultad
    const timePerWord = challenge.difficulty === 1 ? 15 : challenge.difficulty === 2 ? 20 : 25;
    setWordTimeLeft(timePerWord);
  }, [wordNumber, scrambleWord]);

  // Countdown inicial
  useEffect(() => {
    if (gameState === 'instructions') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('playing');
            generateWord();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, generateWord]);

  // Timer principal del juego
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('finished');
            setTimeout(() => {
              const accuracy = wordNumber > 1 ? Math.round((correctAnswers / (wordNumber - 1)) * 100) : 0;
              const result = {
                playerId,
                score,
                details: `${correctAnswers}/${wordNumber - 1} palabras, ${accuracy}% precisión, racha máxima: ${maxStreak}`,
                data: { 
                  correctAnswers,
                  totalWords: wordNumber - 1,
                  accuracy,
                  maxStreak,
                  hintsUsed,
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
  }, [gameState, score, correctAnswers, wordNumber, maxStreak, hintsUsed, playerId, onComplete]);

  // Timer por palabra
  useEffect(() => {
    if (gameState === 'playing' && !showResult) {
      const timer = setInterval(() => {
        setWordTimeLeft(prev => {
          if (prev <= 1) {
            // Tiempo agotado para esta palabra
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, showResult]);

  const handleTimeUp = useCallback(() => {
    setShowResult(true);
    setIsCorrect(false);
    setStreak(0);
    
    setTimeout(() => {
      if (wordNumber >= totalWords) {
        // Juego terminado
        setGameState('finished');
        setTimeout(() => {
          const accuracy = Math.round((correctAnswers / totalWords) * 100);
          const result = {
            playerId,
            score,
            details: `${correctAnswers}/${totalWords} palabras, ${accuracy}% precisión, racha máxima: ${maxStreak}`,
            data: { 
              correctAnswers,
              totalWords,
              accuracy,
              maxStreak,
              hintsUsed,
              finalScore: score,
              completed: true
            }
          };
          onComplete(result);
        }, 2000);
      } else {
        // Siguiente palabra
        setWordNumber(prev => prev + 1);
        generateWord();
      }
    }, 2000);
  }, [wordNumber, totalWords, correctAnswers, score, maxStreak, hintsUsed, playerId, onComplete, generateWord]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentWord || showResult) return;
    
    const isAnswerCorrect = userAnswer.toUpperCase().trim() === currentWord.original;
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    if (isAnswerCorrect) {
      // Calcular puntuación
      const basePoints = currentWord.difficulty * 50;
      const timeBonus = Math.floor(wordTimeLeft * 2);
      const streakBonus = streak * 10;
      const hintPenalty = showHint ? 20 : 0;
      const totalPoints = Math.max(10, basePoints + timeBonus + streakBonus - hintPenalty);
      
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
      if (wordNumber >= totalWords) {
        // Juego terminado
        setGameState('finished');
        setTimeout(() => {
          const finalCorrect = correctAnswers + (isAnswerCorrect ? 1 : 0);
          const accuracy = Math.round((finalCorrect / totalWords) * 100);
          const result = {
            playerId,
            score: isAnswerCorrect ? score + (currentWord.difficulty * 50 + Math.floor(wordTimeLeft * 2) + streak * 10 - (showHint ? 20 : 0)) : score,
            details: `${finalCorrect}/${totalWords} palabras, ${accuracy}% precisión, racha máxima: ${Math.max(maxStreak, isAnswerCorrect ? streak + 1 : streak)}`,
            data: { 
              correctAnswers: finalCorrect,
              totalWords,
              accuracy,
              maxStreak: Math.max(maxStreak, isAnswerCorrect ? streak + 1 : streak),
              hintsUsed,
              finalScore: isAnswerCorrect ? score + (currentWord.difficulty * 50 + Math.floor(wordTimeLeft * 2) + streak * 10 - (showHint ? 20 : 0)) : score,
              completed: true
            }
          };
          onComplete(result);
        }, 2000);
      } else {
        // Siguiente palabra
        setWordNumber(prev => prev + 1);
        generateWord();
      }
    }, 2000);
  }, [currentWord, userAnswer, showResult, wordTimeLeft, streak, showHint, wordNumber, totalWords, correctAnswers, score, maxStreak, hintsUsed, playerId, onComplete, generateWord]);

  const handleShowHint = useCallback(() => {
    if (!showHint) {
      setShowHint(true);
      setHintsUsed(prev => prev + 1);
    }
  }, [showHint]);

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-400';
      case 2: return 'text-yellow-400';
      case 3: return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Fácil';
      case 2: return 'Medio';
      case 3: return 'Difícil';
      default: return 'Normal';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
          <Shuffle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Palabras Revueltas
        </h2>
        <p className="text-blue-200">
          Descifra las palabras mezcladas
        </p>
      </div>

      {gameState === 'instructions' && (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6">
            <Shuffle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">
              ¡Prepárate para descifrar!
            </h3>
            <div className="text-blue-200 mb-4 space-y-2">
              <p>• Descifra {totalWords} palabras mezcladas</p>
              <p>• Usa pistas si necesitas ayuda (-20 puntos)</p>
              <p>• Más rápido = más puntos</p>
              <p>• Mantén una racha para bonus adicionales</p>
            </div>
            <div className="text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentWord && (
        <div>
          {/* Header con información */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-white font-bold">
                Palabra {wordNumber}/{totalWords}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-yellow-400 font-bold">
                {score} puntos
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className="text-purple-400 font-bold">
                Racha: {streak}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
              <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Palabra actual */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getDifficultyColor(currentWord.difficulty)} bg-white/20`}>
                  {getDifficultyText(currentWord.difficulty)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold text-blue-400 bg-white/20">
                  {currentWord.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${wordTimeLeft <= 5 ? 'text-red-400' : 'text-white'} bg-white/20`}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  {wordTimeLeft}s
                </span>
              </div>
              
              <div className="text-4xl font-bold text-white mb-4 tracking-wider">
                {currentWord.scrambled.split('').map((letter, index) => (
                  <span key={index} className="inline-block mx-1 p-2 bg-blue-500/30 rounded border">
                    {letter}
                  </span>
                ))}
              </div>
              
              {showHint && (
                <div className="text-lg text-yellow-300 mb-4">
                  💡 Pista: {currentWord.hint}
                </div>
              )}
            </div>
            
            {!showResult && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/20 border-2 border-blue-400/50 rounded-lg text-white text-center text-xl font-bold placeholder-blue-200 focus:outline-none focus:border-blue-400"
                    placeholder="Escribe la palabra..."
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!userAnswer.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Enviar
                  </button>
                </div>
                
                {!showHint && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleShowHint}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all duration-200"
                    >
                      💡 Mostrar pista (-20 puntos)
                    </button>
                  </div>
                )}
              </form>
            )}
            
            {showResult && (
              <div className="text-center">
                <div className={`flex items-center justify-center mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? (
                    <CheckCircle className="w-8 h-8 mr-2" />
                  ) : (
                    <XCircle className="w-8 h-8 mr-2" />
                  )}
                  <span className="text-2xl font-bold">
                    {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                  </span>
                </div>
                
                {!isCorrect && (
                  <div className="text-white mb-4">
                    La respuesta era: <span className="font-bold text-green-400">{currentWord.original}</span>
                  </div>
                )}
                
                {isCorrect && (
                  <div className="text-blue-200">
                    +{currentWord.difficulty * 50 + Math.floor(wordTimeLeft * 2) + streak * 10 - (showHint ? 20 : 0)} puntos
                  </div>
                )}
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
              ¡Juego terminado!
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
                <div className="text-blue-200">Puntuación final</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
                <div className="text-blue-200">Palabras correctas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round((correctAnswers / Math.max(wordNumber - 1, 1)) * 100)}%
                </div>
                <div className="text-blue-200">Precisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{maxStreak}</div>
                <div className="text-blue-200">Racha máxima</div>
              </div>
            </div>
            <div className="text-lg text-blue-200 mb-2">
              Pistas usadas: {hintsUsed}
            </div>
            <div className="text-xl font-bold text-white">
              {correctAnswers >= totalWords * 0.8 ? '¡Vocabulario excepcional!' :
               correctAnswers >= totalWords * 0.6 ? '¡Buen desciframiento!' : '¡Sigue practicando!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordScrambleGame;