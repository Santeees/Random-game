import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents, GameSession, Player, MinigameInfo, MinigameResult } from '../../shared/types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface SocketState {
  socket: SocketType | null;
  isConnected: boolean;
  session: GameSession | null;
  currentPlayer: Player | null;
  error: string | null;
}

export function useSocket() {
  const [state, setState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    session: null,
    currentPlayer: null,
    error: null
  });
  
  const socketRef = useRef<SocketType | null>(null);

  useEffect(() => {
    // Obtener la URL del servidor dinámicamente
    const getServerUrl = () => {
      // En desarrollo, usar la IP del host actual
      const hostname = window.location.hostname;
      const port = '3001';
      return `http://${hostname}:${port}`;
    };

    // Crear conexión Socket.IO
    const socket: SocketType = io(getServerUrl(), {
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('Conectado al servidor');
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
      setState(prev => ({ ...prev, error: 'Error de conexión al servidor' }));
    });

    // Eventos del juego
    socket.on('player:joined', (player: Player) => {
      console.log('Jugador se unió:', player);
      if (player.id === socket.id) {
        setState(prev => ({ ...prev, currentPlayer: player }));
      }
    });

    socket.on('player:left', (playerId: string) => {
      console.log('Jugador se fue:', playerId);
    });

    socket.on('player:ready', (playerId: string, isReady: boolean) => {
      console.log(`Jugador ${playerId} está ${isReady ? 'listo' : 'no listo'}`);
    });

    socket.on('session:updated', (session: GameSession) => {
      console.log('Sesión actualizada:', session);
      setState(prev => ({ ...prev, session }));
    });

    socket.on('game:started', (session: GameSession) => {
      console.log('Juego iniciado:', session);
      setState(prev => ({ ...prev, session }));
    });

    socket.on('game:minigame-start', (minigame: MinigameInfo, minigameNumber: number) => {
      console.log(`Iniciando minijuego ${minigameNumber}:`, minigame);
    });

    socket.on('game:minigame-end', (results: MinigameResult[]) => {
      console.log('Resultados del minijuego:', results);
    });

    socket.on('game:finished', (finalResults: MinigameResult[][]) => {
      console.log('Juego terminado:', finalResults);
    });

    socket.on('bot:added', (bot: Player) => {
      console.log('Bot agregado:', bot);
    });

    socket.on('bot:removed', (botId: string) => {
      console.log('Bot removido:', botId);
    });

    socket.on('error', (message: string) => {
      console.error('Error del servidor:', message);
      setState(prev => ({ ...prev, error: message }));
    });

    setState(prev => ({ ...prev, socket }));

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  // Funciones de utilidad
  const joinGame = (playerName: string) => {
    if (socketRef.current) {
      socketRef.current.emit('player:join', playerName);
    }
  };

  const setReady = (isReady: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('player:ready', isReady);
    }
  };

  const startGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('game:start');
    }
  };

  const sendMinigameResult = (result: Omit<MinigameResult, 'position'>) => {
    if (socketRef.current) {
      socketRef.current.emit('minigame:result', result);
    }
  };

  const addBot = (difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    console.log('Intentando agregar bot con dificultad:', difficulty);
    if (socketRef.current) {
      socketRef.current.emit('bot:add', { difficulty });
    }
  };

  const removeBot = (botId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('bot:remove', botId);
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    joinGame,
    setReady,
    startGame,
    sendMinigameResult,
    addBot,
    removeBot,
    clearError
  };
}