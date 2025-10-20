import React, { useState } from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';

interface JoinScreenProps {
  onJoin: (playerName: string) => void;
  isConnected: boolean;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ onJoin, isConnected }) => {
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !isConnected || isJoining) return;

    setIsJoining(true);
    try {
      await onJoin(playerName.trim());
    } catch (error) {
      console.error('Error joining game:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Juego Multijugador
          </h1>
          <p className="text-blue-200">
            Únete a la diversión con hasta 4 jugadores
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  Conectado al servidor
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm font-medium">
                  Desconectado del servidor
                </span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="playerName" 
              className="block text-sm font-medium text-blue-200 mb-2"
            >
              Nombre del jugador
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={20}
              disabled={!isConnected || isJoining}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!playerName.trim() || !isConnected || isJoining}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-purple-600"
          >
            {isJoining ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uniéndose...</span>
              </div>
            ) : (
              'Unirse al juego'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-blue-300 text-sm">
            Minijuegos incluidos: Tiempo de Reacción, Memoria, Matemáticas, 
            Escritura, Colores y más
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinScreen;