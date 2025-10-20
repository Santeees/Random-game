import React from 'react';
import { Trophy, Medal, Award, ArrowRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface ResultsScreenProps {
  onContinue: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ onContinue }) => {
  const { minigameResults, currentMinigame, currentMinigameNumber } = useGameStore();

  if (!minigameResults || !currentMinigame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando resultados...</div>
      </div>
    );
  }

  // Ordenar resultados por puntuación (descendente)
  const sortedResults = [...minigameResults].sort((a, b) => b.score - a.score);
  const winner = sortedResults[0];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-white font-bold">{index + 1}</div>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-500 to-orange-500';
      case 1:
        return 'from-gray-400 to-gray-600';
      case 2:
        return 'from-amber-500 to-amber-700';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Resultados del Minijuego
          </h1>
          <p className="text-blue-200">
            {currentMinigame.name} - Ronda {currentMinigameNumber}/5
          </p>
        </div>

        {/* Ganador destacado */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡{winner.playerName} gana!
            </h2>
            <p className="text-yellow-200">
              Puntuación: {winner.score.toFixed(2)}
            </p>
            {winner.details && (
              <p className="text-yellow-300 text-sm mt-2">
                {winner.details}
              </p>
            )}
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Clasificación Completa
          </h3>
          <div className="space-y-3">
            {sortedResults.map((result, index) => (
              <div 
                key={result.playerId}
                className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r ${getRankColor(index)}/20 border border-white/10`}
              >
                <div className="flex items-center space-x-4">
                  {getRankIcon(index)}
                  <div>
                    <div className="text-white font-medium">
                      {result.playerName}
                    </div>
                    {result.details && (
                      <div className="text-blue-200 text-sm">
                        {result.details}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">
                    {result.score.toFixed(2)}
                  </div>
                  <div className="text-blue-200 text-sm">
                    {index === 0 ? '+1 punto' : '0 puntos'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón continuar */}
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>{currentMinigameNumber < 5 ? 'Siguiente Minijuego' : 'Ver Resultados Finales'}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>

        {/* Progreso del juego */}
        <div className="mt-6">
          <div className="flex justify-between text-blue-200 text-sm mb-2">
            <span>Progreso del juego</span>
            <span>{currentMinigameNumber}/5 minijuegos</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentMinigameNumber / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;