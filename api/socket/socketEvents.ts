import { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, Player, MinigameResult } from '../../shared/types.js';
import { SessionManager } from '../services/SessionManager.js';
import { GameEngine } from '../services/GameEngine.js';
import { v4 as uuidv4 } from 'uuid';

export function setupSocketEvents(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  sessionManager: SessionManager,
  gameEngine: GameEngine
) {
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`Cliente conectado: ${socket.id}`);
    
    let currentPlayer: Player | null = null;
    let currentSession: string | null = null;

    // Evento: Jugador se une al juego
    socket.on('player:join', (playerName: string) => {
      try {
        // Validar nombre
        if (!playerName || playerName.trim().length === 0) {
          socket.emit('error', 'El nombre del jugador es requerido');
          return;
        }

        if (playerName.trim().length > 20) {
          socket.emit('error', 'El nombre del jugador es demasiado largo');
          return;
        }

        // Crear jugador
        const player: Player = {
          id: socket.id,
          name: playerName.trim(),
          score: 0,
          isReady: false,
          isConnected: true
        };

        // Almacenar información del jugador en el socket
        socket.data = {
          playerName: playerName.trim(),
          playerId: socket.id
        };

        // Obtener o crear sesión
        const session = sessionManager.getOrCreateDefaultSession();
        
        // Intentar agregar jugador a la sesión
        const added = sessionManager.addPlayerToSession(session.id, player);
        
        if (!added) {
          socket.emit('error', 'No se pudo unir al juego. La sesión puede estar llena o el nombre ya existe.');
          return;
        }

        currentPlayer = player;
        currentSession = session.id;
        
        // Unir socket a la sala de la sesión
        socket.join(session.id);
        
        // Notificar a todos los jugadores en la sesión
        io.to(session.id).emit('player:joined', player);
        io.to(session.id).emit('session:updated', session);
        
        console.log(`Jugador ${playerName} se unió a la sesión ${session.id}`);
        console.log(`Variables establecidas - currentPlayer: ${currentPlayer.name}, currentSession: ${currentSession}`);
        
      } catch (error) {
        console.error('Error al unir jugador:', error);
        socket.emit('error', 'Error interno del servidor');
      }
    });

    // Evento: Jugador marca como listo
    socket.on('player:ready', (isReady: boolean) => {
      try {
        if (!currentPlayer || !currentSession) {
          socket.emit('error', 'Debes unirte al juego primero');
          return;
        }

        const updated = sessionManager.updatePlayerReady(currentPlayer.id, isReady);
        
        if (!updated) {
          socket.emit('error', 'No se pudo actualizar el estado');
          return;
        }

        currentPlayer.isReady = isReady;
        
        // Notificar a todos los jugadores
        io.to(currentSession).emit('player:ready', currentPlayer.id, isReady);
        
        const session = sessionManager.getSession(currentSession);
        if (session) {
          io.to(currentSession).emit('session:updated', session);
        }
        
        console.log(`Jugador ${currentPlayer.name} está ${isReady ? 'listo' : 'no listo'}`);
        
      } catch (error) {
        console.error('Error al actualizar estado de jugador:', error);
        socket.emit('error', 'Error interno del servidor');
      }
    });

    // Evento: Iniciar juego
    socket.on('game:start', () => {
      try {
        if (!currentSession) {
          socket.emit('error', 'No estás en una sesión');
          return;
        }

        const canStart = sessionManager.canStartGame(currentSession);
        
        if (!canStart) {
          socket.emit('error', 'No se puede iniciar el juego. Todos los jugadores deben estar listos.');
          return;
        }

        const started = sessionManager.startGame(currentSession);
        
        if (!started) {
          socket.emit('error', 'No se pudo iniciar el juego');
          return;
        }

        // Generar minijuegos aleatorios
        const minigames = gameEngine.getRandomMinigames(10);
        
        sessionManager.updateSession(currentSession, {
          minigames,
          currentMinigame: 0
        });

        const session = sessionManager.getSession(currentSession);
        
        if (session) {
          // Notificar inicio del juego
          io.to(currentSession).emit('game:started', session);
          
          // Iniciar primer minijuego después de un breve delay
          setTimeout(() => {
            startNextMinigame(currentSession, session, 0);
          }, 2000);
        }
        
        console.log(`Juego iniciado en sesión ${currentSession}`);
        
      } catch (error) {
        console.error('Error al iniciar juego:', error);
        socket.emit('error', 'Error interno del servidor');
      }
    });

    // Evento: Resultado de minijuego
    socket.on('minigame:result', (result: Omit<MinigameResult, 'position'>) => {
      try {
        if (!currentSession || !currentPlayer) {
          socket.emit('error', 'No estás en una sesión activa');
          return;
        }

        const session = sessionManager.getSession(currentSession);
        
        if (!session || session.status !== 'playing') {
          socket.emit('error', 'No hay un juego activo');
          return;
        }

        // Validar que el resultado pertenece al jugador actual
        if (result.playerId !== currentPlayer.id) {
          socket.emit('error', 'Resultado inválido');
          return;
        }

        // Almacenar resultado temporalmente
        if (!session.results[session.currentMinigame]) {
          session.results[session.currentMinigame] = [];
        }
        
        // Verificar si el jugador ya envió su resultado
        const existingResult = session.results[session.currentMinigame]
          .find(r => r.playerId === result.playerId);
          
        if (existingResult) {
          socket.emit('error', 'Ya enviaste tu resultado para este minijuego');
          return;
        }

        session.results[session.currentMinigame].push(result as MinigameResult);
        
        console.log(`Resultado recibido de ${currentPlayer.name}: ${result.score} puntos`);
        
        // Generar resultados de bots si es necesario
        const bots = sessionManager.getBotsInSession(currentSession);
        const botManager = sessionManager.getBotManager();
        
        bots.forEach(bot => {
          const existingBotResult = session.results[session.currentMinigame]
            .find(r => r.playerId === bot.id);
            
          if (!existingBotResult) {
            const botInstance = botManager.getBot(bot.id);
            if (botInstance) {
              botInstance.simulateMinigameResult(session.minigames[session.currentMinigame])
                .then(botResult => {
                  session.results[session.currentMinigame].push(botResult as MinigameResult);
                })
                .catch(error => {
                  console.error('Error al simular resultado del bot:', error);
                });
            }
          }
        });
        
        // Verificar si todos los jugadores han enviado sus resultados
        const allResultsReceived = session.results[session.currentMinigame].length === session.players.length;
        
        if (allResultsReceived) {
          // Calcular posiciones y actualizar puntuaciones
          const calculatedResults = gameEngine.calculateResults(session.results[session.currentMinigame]);
          session.results[session.currentMinigame] = calculatedResults;
          
          // Actualizar puntuaciones de jugadores
          calculatedResults.forEach(result => {
            const player = session.players.find(p => p.id === result.playerId);
            if (player) {
              // Asignar puntos según posición
              switch (result.position) {
                case 1: player.score += 3; break;
                case 2: player.score += 2; break;
                case 3: player.score += 1; break;
                default: break;
              }
            }
          });
          
          // Notificar resultados del minijuego
          io.to(currentSession).emit('game:minigame-end', calculatedResults);
          
          // Avanzar al siguiente minijuego o finalizar
          setTimeout(() => {
            session.currentMinigame++;
            
            if (session.currentMinigame >= session.totalMinigames) {
              // Juego terminado
              finishGame(currentSession, session);
            } else {
              // Siguiente minijuego
              startNextMinigame(currentSession, session, session.currentMinigame);
            }
          }, 3000); // 3 segundos para ver resultados
        }
        
      } catch (error) {
        console.error('Error al procesar resultado:', error);
        socket.emit('error', 'Error interno del servidor');
      }
    });

    // Evento: Agregar bot
    socket.on('bot:add', (data: { difficulty?: 'easy' | 'medium' | 'hard' }) => {
      try {
        console.log('=== EVENTO BOT:ADD INICIADO ===');
        console.log('Socket ID:', socket.id);
        console.log('Datos recibidos:', data);
        
        const { difficulty = 'medium' } = data;
        
        // Obtener el nombre del jugador desde el socket
        const playerName = socket.data?.playerName || currentPlayer?.name;
        console.log('Nombre del jugador:', playerName);
        
        // Buscar sesión donde este jugador sea el host (por nombre, no por socket ID)
        let targetSession = null;
        let hostPlayer = null;
        
        if (playerName) {
          // Buscar en todas las sesiones una donde el jugador sea host por nombre
          const allSessions = sessionManager.getAllSessions();
          console.log('Buscando en', allSessions.length, 'sesiones activas');
          
          for (const session of allSessions) {
            console.log('Revisando sesión:', session.id);
            console.log('Host ID de la sesión:', session.hostId);
            console.log('Jugadores en sesión:', session.players.map(p => ({ id: p.id, name: p.name })));
            
            // Buscar si hay un jugador con el mismo nombre que sea el host
            const sessionHostPlayer = session.players.find(p => p.id === session.hostId);
            console.log('Jugador host encontrado:', sessionHostPlayer);
            
            if (sessionHostPlayer && sessionHostPlayer.name === playerName) {
              targetSession = session;
              hostPlayer = sessionHostPlayer;
              console.log('¡Jugador es host de esta sesión!');
              break;
            }
          }
        }
        
        // Si no se encontró por nombre, intentar búsqueda tradicional por socket ID
        if (!targetSession) {
          console.log('No se encontró por nombre, intentando búsqueda por socket ID...');
          const foundSession = sessionManager.findSessionByPlayerId(socket.id);
          if (foundSession) {
            const player = foundSession.players.find(p => p.id === socket.id);
            if (player && foundSession.hostId === socket.id) {
              targetSession = foundSession;
              hostPlayer = player;
              console.log('Encontrado por socket ID como host');
            }
          }
        }
        
        console.log('Estado final de validación:');
        console.log('targetSession:', targetSession?.id);
        console.log('hostPlayer:', hostPlayer?.name);
        console.log('Es host:', !!hostPlayer);
        
        if (!targetSession || !hostPlayer) {
          console.log('ERROR: No se pudo encontrar sesión o el jugador no es host');
          console.log('targetSession existe:', !!targetSession);
          console.log('hostPlayer existe:', !!hostPlayer);
          socket.emit('error', 'Debes ser el host de una sesión para agregar bots');
          return;
        }

        // Verificar que la sesión esté en estado de espera
        if (targetSession.status !== 'waiting') {
          socket.emit('error', 'No se pueden agregar bots durante el juego');
          return;
        }

        const botPlayer = sessionManager.addBotToSession(targetSession.id, difficulty);
        
        if (!botPlayer) {
          socket.emit('error', 'No se pudo agregar el bot. La sesión puede estar llena.');
          return;
        }

        // Notificar a todos los jugadores
        io.to(targetSession.id).emit('bot:added', botPlayer);
        io.to(targetSession.id).emit('player:joined', botPlayer);
        
        const updatedSession = sessionManager.getSession(targetSession.id);
        if (updatedSession) {
          io.to(targetSession.id).emit('session:updated', updatedSession);
        }
        
        console.log(`Bot ${botPlayer.name} agregado a la sesión ${targetSession.id}`);
        
      } catch (error) {
        console.error('Error al agregar bot:', error);
        socket.emit('error', 'Error interno del servidor');
      }
    });

    // Evento: Remover bot
    socket.on('bot:remove', (botId: string) => {
      try {
        if (!currentSession || !currentPlayer) {
          socket.emit('error', 'Debes estar en una sesión para remover bots');
          return;
        }

        const session = sessionManager.getSession(currentSession);
        if (!session) {
          socket.emit('error', 'Sesión no encontrada');
          return;
        }

        // Verificar que el jugador sea el host
        if (session.hostId !== currentPlayer.id) {
          socket.emit('error', 'Solo el host puede remover bots');
          return;
        }

        // Verificar que la sesión esté en estado de espera
        if (session.status !== 'waiting') {
          socket.emit('error', 'No se pueden remover bots durante el juego');
          return;
        }

        const removed = sessionManager.removeBotFromSession(currentSession, botId);
        
        if (!removed) {
          socket.emit('error', 'No se pudo remover el bot');
          return;
        }

        // Notificar a todos los jugadores
        io.to(currentSession).emit('bot:removed', botId);
        io.to(currentSession).emit('player:left', botId);
        
        const updatedSession = sessionManager.getSession(currentSession);
        if (updatedSession) {
          io.to(currentSession).emit('session:updated', updatedSession);
        }
        
        console.log(`Bot ${botId} removido de la sesión ${currentSession}`);
        
      } catch (error) {
        console.error('Error al remover bot:', error);
        socket.emit('error', 'Error interno del servidor');
      }
    });

    // Evento: Desconexión
    socket.on('disconnect', () => {
      try {
        if (currentPlayer && currentSession) {
          // Marcar jugador como desconectado
          sessionManager.updatePlayerConnection(currentPlayer.id, false);
          
          // Notificar a otros jugadores
          socket.to(currentSession).emit('player:left', currentPlayer.id);
          
          const session = sessionManager.getSession(currentSession);
          if (session) {
            socket.to(currentSession).emit('session:updated', session);
          }
          
          console.log(`Jugador ${currentPlayer.name} se desconectó`);
          
          // Si el juego no ha comenzado, remover jugador completamente
          if (session && session.status === 'waiting') {
            sessionManager.removePlayerFromSession(currentPlayer.id);
          }
        }
        
        console.log(`Cliente desconectado: ${socket.id}`);
        
      } catch (error) {
        console.error('Error al manejar desconexión:', error);
      }
    });

    // Función auxiliar para iniciar el siguiente minijuego
    function startNextMinigame(sessionId: string, session: any, minigameIndex: number) {
      const minigame = session.minigames[minigameIndex];
      
      if (minigame) {
        sessionManager.updateSession(sessionId, {
          currentMinigame: minigameIndex
        });
        
        io.to(sessionId).emit('game:minigame-start', minigame, minigameIndex + 1);
        console.log(`Iniciando minijuego ${minigameIndex + 1}: ${minigame.name}`);
      }
    }

    // Función auxiliar para finalizar el juego
    function finishGame(sessionId: string, session: any) {
      sessionManager.finishGame(sessionId);
      
      const finalResults = gameEngine.calculateFinalScores(session.results);
      
      io.to(sessionId).emit('game:finished', session.results);
      
      console.log(`Juego finalizado en sesión ${sessionId}`);
      
      // Limpiar sesión después de un tiempo
      setTimeout(() => {
        sessionManager.removePlayerFromSession(sessionId);
      }, 60000); // 1 minuto
    }
  });

  // Limpiar sesiones inactivas cada hora
  setInterval(() => {
    sessionManager.cleanupInactiveSessions();
  }, 60 * 60 * 1000);
}