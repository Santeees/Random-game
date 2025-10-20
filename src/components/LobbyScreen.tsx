import React from 'react';
import { Crown, Users, Play, Clock, CheckCircle, Circle, Bot, Plus, Trash2 } from 'lucide-react';
import type { GameSession, Player } from '../../../shared/types';
import { useSocket } from '../hooks/useSocket';

interface LobbyScreenProps {
  session: GameSession | null;
  currentPlayer: Player | null;
  onReady: (isReady: boolean) => void;
  onStartGame: () => void;
  onAddBot?: () => void;
  onRemoveBot?: (botId: string) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ 
  session, 
  currentPlayer, 
  onReady, 
  onStartGame,
  onAddBot,
  onRemoveBot
}) => {
  const { addBot, removeBot } = useSocket();
  
  if (!session || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  const isHost = currentPlayer.id === session.hostId;
  const humanPlayers = session.players.filter(p => !p.isBot);
  const bots = session.players.filter(p => p.isBot);
  const allPlayersReady = humanPlayers.every(player => player.isReady);
  const canStartGame = session.players.length >= 1 && allPlayersReady;
  const canAddBot = session.players.length < 4 && session.status === 'waiting';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sala de Espera
          </h1>
          <p className="text-blue-200">
            Sesión: {session.id.slice(0, 8)}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Jugadores ({session.players.length}/4)
            </h2>
            <div className="flex items-center space-x-2 text-blue-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Esperando jugadores...</span>
            </div>
          </div>

          <div className="grid gap-3">
            {session.players.map((player) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  player.id === currentPlayer.id 
                    ? 'bg-blue-500/20 border-blue-400' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    player.id === session.hostId 
                      ? 'bg-yellow-500' 
                      : player.isBot
                      ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                      : 'bg-gray-500'
                  }`}>
                    {player.id === session.hostId ? (
                      <Crown className="w-5 h-5 text-white" />
                    ) : player.isBot ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-semibold">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        {player.name}
                        {player.isBot && <span className="text-xs text-gray-300 ml-1">(Bot)</span>}
                      </span>
                      {player.id === currentPlayer.id && (
                        <span className="text-blue-300 text-sm">(Tú)</span>
                      )}
                      {player.id === session.hostId && (
                        <span className="text-yellow-300 text-sm">(Anfitrión)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      Puntuación: {player.score}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {player.isBot ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">Listo</span>
                      {isHost && (
                        <button
                          onClick={() => removeBot(player.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Remover bot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : player.isReady ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">Listo</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400 text-sm">Esperando</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {!currentPlayer.isReady ? (
            <button
              onClick={() => onReady(true)}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all"
            >
              ¡Estoy Listo!
            </button>
          ) : (
            <div className="w-full bg-green-500/20 border border-green-400 text-green-400 font-semibold py-3 px-6 rounded-lg text-center">
              ✓ Estás listo - {session.players.length > 1 ? 'Esperando otros jugadores' : 'Puedes iniciar el juego'}
            </div>
          )}

          {isHost && canAddBot && (
            <button
              onClick={() => addBot('medium')}
              className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <Bot className="w-4 h-4" />
              <span>Agregar Bot</span>
            </button>
          )}

          {isHost && (
            <button
              onClick={onStartGame}
              disabled={!canStartGame}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-600"
            >
              <div className="flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>
                  {canStartGame ? 'Iniciar Juego' : 'Esperando jugadores listos'}
                </span>
              </div>
            </button>
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Información del Juego</h3>
            <div className="text-blue-200 text-sm space-y-1">
              <p>• Se jugarán 5 minijuegos aleatorios</p>
              <p>• Cada victoria otorga 1 punto</p>
              <p>• El jugador con más puntos gana</p>
              <p>• Mínimo 1 jugador para comenzar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;