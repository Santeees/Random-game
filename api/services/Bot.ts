import { Player, MinigameInfo, MinigameResult, MinigameType } from '../../shared/types.js';
import { v4 as uuidv4 } from 'uuid';

export class Bot {
  private player: Player;
  private difficulty: 'easy' | 'medium' | 'hard';

  constructor(name: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.player = {
      id: `bot_${uuidv4()}`,
      name,
      score: 0,
      isReady: true,
      isConnected: true,
      isBot: true
    };
    this.difficulty = difficulty;
  }

  getPlayer(): Player {
    return this.player;
  }

  // Simular resultado para cada tipo de minijuego
  async simulateMinigameResult(minigame: MinigameInfo): Promise<Omit<MinigameResult, 'position'>> {
    // Delay aleatorio para simular tiempo de reacción humano
    const delay = this.getRandomDelay();
    await new Promise(resolve => setTimeout(resolve, delay));

    const baseResult = {
      playerId: this.player.id,
      playerName: this.player.name,
      time: delay / 1000
    };

    switch (minigame.id as MinigameType) {
      case MinigameType.REACTION_TIME:
        return {
          ...baseResult,
          score: this.simulateReactionTime(),
          time: this.getReactionTime()
        };

      case MinigameType.MEMORY_SEQUENCE:
        return {
          ...baseResult,
          score: this.simulateMemorySequence(),
          time: this.getMemoryTime()
        };

      case MinigameType.MATH_CHALLENGE:
        return {
          ...baseResult,
          score: this.simulateMathChallenge(),
          time: this.getMathTime()
        };

      case MinigameType.TYPING_SPEED:
        return {
          ...baseResult,
          score: this.simulateTypingSpeed(),
          time: this.getTypingTime()
        };

      case MinigameType.COLOR_MATCH:
        return {
          ...baseResult,
          score: this.simulateColorMatch(),
          time: this.getColorMatchTime()
        };

      case MinigameType.SIMON_SAYS:
        return {
          ...baseResult,
          score: this.simulateSimonSays(),
          time: this.getSimonTime()
        };

      case MinigameType.NUMBER_GUESSING:
        return {
          ...baseResult,
          score: this.simulateNumberGuessing(),
          time: this.getNumberGuessingTime()
        };

      case MinigameType.PATTERN_MATCHING:
        return {
          ...baseResult,
          score: this.simulatePatternMatching(),
          time: this.getPatternTime()
        };

      case MinigameType.QUICK_CLICK:
        return {
          ...baseResult,
          score: this.simulateQuickClick(),
          time: this.getQuickClickTime()
        };

      case MinigameType.WORD_SCRAMBLE:
        return {
          ...baseResult,
          score: this.simulateWordScramble(),
          time: this.getWordScrambleTime()
        };

      default:
        return {
          ...baseResult,
          score: Math.random() > 0.5 ? 100 : 0,
          time: this.getRandomTime(3, 8)
        };
    }
  }

  private getRandomDelay(): number {
    const baseDelay = {
      easy: 2000,
      medium: 1500,
      hard: 1000
    }[this.difficulty];

    return baseDelay + Math.random() * 1000;
  }

  private getRandomTime(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private getSuccessRate(): number {
    return {
      easy: 0.6,
      medium: 0.75,
      hard: 0.9
    }[this.difficulty];
  }

  // Simulaciones específicas por minijuego
  private simulateReactionTime(): number {
    const successRate = this.getSuccessRate();
    return Math.random() < successRate ? 100 : 0;
  }

  private getReactionTime(): number {
    const baseTimes = {
      easy: 0.8,
      medium: 0.6,
      hard: 0.4
    };
    return baseTimes[this.difficulty] + Math.random() * 0.3;
  }

  private simulateMemorySequence(): number {
    const successRate = this.getSuccessRate();
    return Math.random() < successRate ? 100 : Math.floor(Math.random() * 60);
  }

  private getMemoryTime(): number {
    return this.getRandomTime(2, 6);
  }

  private simulateMathChallenge(): number {
    const successRate = this.getSuccessRate();
    return Math.random() < successRate ? 100 : 0;
  }

  private getMathTime(): number {
    const baseTimes = {
      easy: 8,
      medium: 5,
      hard: 3
    };
    return this.getRandomTime(baseTimes[this.difficulty], baseTimes[this.difficulty] + 3);
  }

  private simulateTypingSpeed(): number {
    const baseWPM = {
      easy: 25,
      medium: 40,
      hard: 60
    };
    const wpm = baseWPM[this.difficulty] + Math.random() * 15;
    return Math.floor(wpm);
  }

  private getTypingTime(): number {
    return this.getRandomTime(15, 25);
  }

  private simulateColorMatch(): number {
    const successRate = this.getSuccessRate();
    return Math.random() < successRate ? 100 : 0;
  }

  private getColorMatchTime(): number {
    return this.getRandomTime(1, 4);
  }

  private simulateSimonSays(): number {
    const successRate = this.getSuccessRate();
    return Math.random() < successRate ? 100 : Math.floor(Math.random() * 70);
  }

  private getSimonTime(): number {
    return this.getRandomTime(3, 8);
  }

  private simulateNumberGuessing(): number {
    const successRate = this.getSuccessRate();
    return Math.random() < successRate ? 100 : Math.floor(Math.random() * 50);
  }

  private getNumberGuessingTime(): number {
    return this.getRandomTime(2, 6);
  }

  private simulatePatternMatching(): number {
    const successRate = this.getSuccessRate();
    return Math.random() < successRate ? 100 : Math.floor(Math.random() * 60);
  }

  private getPatternTime(): number {
    return this.getRandomTime(3, 7);
  }

  private simulateQuickClick(): number {
    const baseClicks = {
      easy: 15,
      medium: 25,
      hard: 35
    };
    return baseClicks[this.difficulty] + Math.floor(Math.random() * 10);
  }

  private getQuickClickTime(): number {
    return this.getRandomTime(8, 12);
  }

  private simulateWordScramble(): number {
    const successRate = this.getSuccessRate();
    return Math.random() < successRate ? 100 : 0;
  }

  private getWordScrambleTime(): number {
    return this.getRandomTime(5, 12);
  }
}

export class BotManager {
  private bots: Map<string, Bot> = new Map();
  private botNames = [
    'RoboPlayer', 'CyberBot', 'AIChampion', 'DigitalRival',
    'SmartBot', 'QuickBot', 'MegaBot', 'SuperAI',
    'TurboBot', 'EliteBot', 'ProBot', 'UltraBot'
  ];
  private usedNames = new Set<string>();

  createBot(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Bot {
    const availableNames = this.botNames.filter(name => !this.usedNames.has(name));
    
    if (availableNames.length === 0) {
      // Si no hay nombres disponibles, generar uno aleatorio
      const randomName = `Bot${Math.floor(Math.random() * 1000)}`;
      const bot = new Bot(randomName, difficulty);
      this.bots.set(bot.getPlayer().id, bot);
      return bot;
    }

    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
    this.usedNames.add(randomName);
    
    const bot = new Bot(randomName, difficulty);
    this.bots.set(bot.getPlayer().id, bot);
    return bot;
  }

  removeBot(botId: string): boolean {
    const bot = this.bots.get(botId);
    if (bot) {
      this.usedNames.delete(bot.getPlayer().name);
      this.bots.delete(botId);
      return true;
    }
    return false;
  }

  getBot(botId: string): Bot | undefined {
    return this.bots.get(botId);
  }

  getAllBots(): Bot[] {
    return Array.from(this.bots.values());
  }

  clearAllBots(): void {
    this.bots.clear();
    this.usedNames.clear();
  }
}