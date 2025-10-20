import React from 'react';
import { Trophy, Medal, Award, RotateCcw, Crown, Star } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface FinalResultsScreenProps {
  onPlayAgain: () => void;
}

const FinalResultsScreen: React.FC<FinalResultsScreenProps> = ({ onPlayAgain }) => {
  const { finalResults } = useGameStore();

  if (!finalResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando resultados finales...</div>
      </div>
    );
  }

  // Ordenar jugadores por puntuación final (descendente)
  const sortedPlayers = [...finalResults.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const hasWinner = sortedPlayers[0].score > sortedPlayers[1]?.score;

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 1:
        return <Medal className="w-7 h-7 text-gray-300" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-full">
            <span className="text-white font-bold">{index + 1}</span>
          </div>
        );
    }
  };

  const getRankGradient = (index: number) => {
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

  const getScoreColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-400';
      case 1:
        return 'text-gray-300';
      case 2:
        return 'text-amber-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-3xl shadow-2xl border border-white/20">
        {/* Header con celebración */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-4">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            ¡Juego Terminado!
          </h1>
          
          {hasWinner ? (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Crown className="w-8 h-8 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white">
                  ¡{winner.name} es el Campeón!
                </h2>
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-yellow-200 text-lg">
                Puntuación final: {winner.score} puntos
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Empate!
              </h2>
              <p className="text-blue-200">
                Varios jugadores comparten el primer lugar
              </p>
            </div>
          )}
        </div>

        {/* Clasificación final */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">
            Clasificación Final
          </h3>
          
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.id}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${getRankGradient(index)}/20 border border-white/20 p-6 transform transition-all hover:scale-105`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRankIcon(index)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xl font-bold text-white">
                          {player.name}
                        </h4>
                        {index === 0 && hasWinner && (
                          <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-blue-200">
                        {index === 0 ? '¡Campeón!' : 
                         index === 1 ? 'Segundo lugar' :
                         index === 2 ? 'Tercer lugar' :
                         `${index + 1}° lugar`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(index)}`}>
                      {player.score}
                    </div>
                    <div className="text-blue-200 text-sm">
                      {player.score === 1 ? 'punto' : 'puntos'}
                    </div>
                  </div>
                </div>
                
                {/* Barra de progreso visual */}
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getRankGradient(index)} h-2 rounded-full transition-all duration-1000`}
                      style={{ 
                        width: `${Math.max((player.score / Math.max(winner.score, 1)) * 100, 10)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas del juego */}
        <div className="mb-8">
          <div className="bg-white/5 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4 text-center">
              Estadísticas del Juego
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {finalResults.players.length}
                </div>
                <div className="text-blue-200 text-sm">Jugadores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {Math.max(...finalResults.players.map(p => p.score))}
                </div>
                <div className="text-blue-200 text-sm">Máx. Puntos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {finalResults.duration ? `${Math.round(finalResults.duration / 60)}m` : 'N/A'}
                </div>
                <div className="text-blue-200 text-sm">Duración</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón para jugar de nuevo */}
        <button
          onClick={onPlayAgain}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all transform hover:scale-105"
        >
          <div className="flex items-center justify-center space-x-3">
            <RotateCcw className="w-6 h-6" />
            <span className="text-lg">Jugar de Nuevo</span>
          </div>
        </button>

        <div className="mt-6 text-center">
          <p className="text-blue-300 text-sm">
            ¡Gracias por jugar! Invita a más amigos para la próxima partida.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinalResultsScreen;