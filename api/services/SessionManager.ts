import { GameSession, Player } from '../../shared/types.js';
import { v4 as uuidv4 } from 'uuid';
import { BotManager } from './Bot.js';

export class SessionManager {
  private sessions: Map<string, GameSession> = new Map();
  private playerSessions: Map<string, string> = new Map(); // playerId -> sessionId
  private botManager: BotManager = new BotManager();

  createSession(hostId?: string): GameSession {
    const sessionId = uuidv4();
    const session: GameSession = {
      id: sessionId,
      hostId: hostId || '',
      players: [],
      currentMinigame: 0,
      totalMinigames: 10,
      minigames: [],
      results: [],
      status: 'waiting',
      createdAt: new Date()
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): GameSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByPlayerId(playerId: string): GameSession | undefined {
    const sessionId = this.playerSessions.get(playerId);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  findSessionByPlayerId(playerId: string): GameSession | undefined {
    return this.getSessionByPlayerId(playerId);
  }

  addPlayerToSession(sessionId: string, player: Player): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.players.length >= 4 || session.status !== 'waiting') {
      return false;
    }

    // Verificar si el nombre ya existe
    if (session.players.some(p => p.name === player.name)) {
      return false;
    }

    // Si es el primer jugador, establecerlo como host
    if (session.players.length === 0) {
      session.hostId = player.id;
    }

    session.players.push(player);
    this.playerSessions.set(player.id, sessionId);
    return true;
  }

  addBotToSession(sessionId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Player | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.players.length >= 4 || session.status !== 'waiting') {
      return null;
    }

    const bot = this.botManager.createBot(difficulty);
    const botPlayer = bot.getPlayer();
    
    session.players.push(botPlayer);
    this.playerSessions.set(botPlayer.id, sessionId);
    
    return botPlayer;
  }

  removeBotFromSession(sessionId: string, botId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const botIndex = session.players.findIndex(p => p.id === botId && p.isBot);
    if (botIndex === -1) return false;

    session.players.splice(botIndex, 1);
    this.playerSessions.delete(botId);
    this.botManager.removeBot(botId);
    
    return true;
  }

  removePlayerFromSession(playerId: string): boolean {
    const sessionId = this.playerSessions.get(playerId);
    if (!sessionId) return false;

    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const player = session.players.find(p => p.id === playerId);
    if (player?.isBot) {
      this.botManager.removeBot(playerId);
    }

    session.players = session.players.filter(p => p.id !== playerId);
    this.playerSessions.delete(playerId);

    // Si no quedan jugadores humanos, eliminar la sesión
    const humanPlayers = session.players.filter(p => !p.isBot);
    if (humanPlayers.length === 0) {
      // Limpiar todos los bots de la sesión
      session.players.filter(p => p.isBot).forEach(bot => {
        this.botManager.removeBot(bot.id);
        this.playerSessions.delete(bot.id);
      });
      this.sessions.delete(sessionId);
    }

    return true;
  }

  updatePlayerReady(playerId: string, isReady: boolean): boolean {
    const session = this.getSessionByPlayerId(playerId);
    if (!session) return false;

    const player = session.players.find(p => p.id === playerId);
    if (!player) return false;

    player.isReady = isReady;
    return true;
  }

  updatePlayerConnection(playerId: string, isConnected: boolean): boolean {
    const session = this.getSessionByPlayerId(playerId);
    if (!session) return false;

    const player = session.players.find(p => p.id === playerId);
    if (!player) return false;

    player.isConnected = isConnected;
    return true;
  }

  canStartGame(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'waiting') return false;
  
    const humanPlayers = session.players.filter(p => !p.isBot);
    const allHumansReady = humanPlayers.every(p => p.isReady && p.isConnected);
    
    return session.players.length >= 1 && allHumansReady;
  }

  startGame(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !this.canStartGame(sessionId)) return false;

    session.status = 'playing';
    session.currentMinigame = 0;
    session.results = [];
    
    session.players.forEach(player => {
      player.score = 0;
    });

    return true;
  }

  finishGame(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'finished';
    return true;
  }

  updateSession(sessionId: string, updates: Partial<GameSession>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    Object.assign(session, updates);
    return true;
  }

  getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  getTotalPlayersCount(): number {
    return Array.from(this.sessions.values())
      .reduce((total, session) => total + session.players.length, 0);
  }

  // Limpiar sesiones inactivas (más de 1 hora)
  cleanupInactiveSessions(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.createdAt < oneHourAgo && session.status === 'waiting') {
        // Limpiar referencias de jugadores
        session.players.forEach(player => {
          this.playerSessions.delete(player.id);
        });
        
        this.sessions.delete(sessionId);
      }
    }
  }

  // Obtener o crear sesión por defecto
  getOrCreateDefaultSession(hostId?: string): GameSession {
    // Buscar una sesión disponible
    for (const session of this.sessions.values()) {
      if (session.status === 'waiting' && session.players.length < 4) {
        return session;
      }
    }
    
    // Si no hay sesiones disponibles, crear una nueva
    return this.createSession(hostId);
  }

  getBotManager(): BotManager {
    return this.botManager;
  }

  getBotsInSession(sessionId: string): Player[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    
    return session.players.filter(p => p.isBot);
  }

  getHumanPlayersInSession(sessionId: string): Player[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    
    return session.players.filter(p => !p.isBot);
  }

  // Obtener todas las sesiones
  getAllSessions(): GameSession[] {
    return Array.from(this.sessions.values());
  }

  // Método de debug para obtener información de todas las sesiones
  getDebugInfo(): any {
    const sessions = Array.from(this.sessions.entries()).map(([id, session]) => ({
      id,
      hostId: session.hostId,
      status: session.status,
      players: session.players.map(p => ({ id: p.id, name: p.name, isBot: p.isBot })),
      createdAt: session.createdAt
    }));
    
    const playerSessionMappings = Array.from(this.playerSessions.entries()).map(([playerId, sessionId]) => ({
      playerId,
      sessionId
    }));
    
    return {
      totalSessions: this.sessions.size,
      sessions,
      playerSessionMappings,
      totalPlayerMappings: this.playerSessions.size
    };
  }
}