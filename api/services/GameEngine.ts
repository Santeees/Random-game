import { MinigameInfo, MinigameResult, MinigameType } from '../../shared/types.js';

export class GameEngine {
  private minigames: MinigameInfo[] = [
    {
      id: MinigameType.REACTION_TIME,
      name: 'Tiempo de Reacción',
      description: 'Haz clic lo más rápido posible cuando aparezca el botón',
      duration: 10,
      instructions: 'Espera a que aparezca el botón verde y haz clic lo más rápido posible',
      type: MinigameType.REACTION_TIME
    },
    {
      id: MinigameType.MEMORY_SEQUENCE,
      name: 'Secuencia de Memoria',
      description: 'Memoriza y repite la secuencia de colores',
      duration: 30,
      instructions: 'Observa la secuencia de colores y repítela en el mismo orden',
      type: MinigameType.MEMORY_SEQUENCE
    },
    {
      id: MinigameType.MATH_CHALLENGE,
      name: 'Desafío Matemático',
      description: 'Resuelve operaciones matemáticas rápidamente',
      duration: 20,
      instructions: 'Resuelve las operaciones matemáticas lo más rápido posible',
      type: MinigameType.MATH_CHALLENGE
    },
    {
      id: MinigameType.TYPING_SPEED,
      name: 'Velocidad de Escritura',
      description: 'Escribe el texto mostrado lo más rápido posible',
      duration: 30,
      instructions: 'Escribe exactamente el texto que aparece en pantalla',
      type: MinigameType.TYPING_SPEED
    },
    {
      id: MinigameType.COLOR_MATCH,
      name: 'Coincidencia de Colores',
      description: 'Selecciona el color que coincida con el nombre',
      duration: 15,
      instructions: 'Haz clic en el color que corresponda al nombre mostrado',
      type: MinigameType.COLOR_MATCH
    },
    {
      id: MinigameType.SIMON_SAYS,
      name: 'Simón Dice',
      description: 'Sigue las instrucciones solo cuando Simón lo diga',
      duration: 25,
      instructions: 'Solo realiza las acciones cuando la instrucción comience con "Simón dice"',
      type: MinigameType.SIMON_SAYS
    },
    {
      id: MinigameType.NUMBER_GUESSING,
      name: 'Adivina el Número',
      description: 'Adivina el número secreto entre 1 y 100',
      duration: 20,
      instructions: 'Usa las pistas para adivinar el número secreto en el menor número de intentos',
      type: MinigameType.NUMBER_GUESSING
    },
    {
      id: MinigameType.PATTERN_MATCHING,
      name: 'Coincidencia de Patrones',
      description: 'Encuentra el patrón correcto entre las opciones',
      duration: 20,
      instructions: 'Observa el patrón y selecciona la opción que lo complete correctamente',
      type: MinigameType.PATTERN_MATCHING
    },
    {
      id: MinigameType.QUICK_CLICK,
      name: 'Clic Rápido',
      description: 'Haz clic en los objetivos que aparecen',
      duration: 15,
      instructions: 'Haz clic en todos los objetivos que aparezcan lo más rápido posible',
      type: MinigameType.QUICK_CLICK
    },
    {
      id: MinigameType.WORD_SCRAMBLE,
      name: 'Palabras Revueltas',
      description: 'Ordena las letras para formar la palabra correcta',
      duration: 25,
      instructions: 'Reorganiza las letras para formar una palabra válida',
      type: MinigameType.WORD_SCRAMBLE
    }
  ];

  getRandomMinigames(count: number = 10): MinigameInfo[] {
    const shuffled = [...this.minigames].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, this.minigames.length));
  }

  getMinigameById(id: string): MinigameInfo | undefined {
    return this.minigames.find(game => game.id === id);
  }

  calculateResults(results: Omit<MinigameResult, 'position'>[]): MinigameResult[] {
    // Ordenar por puntuación (descendente) y luego por tiempo (ascendente)
    const sortedResults = results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.time - b.time;
    });

    // Asignar posiciones
    return sortedResults.map((result, index) => ({
      ...result,
      position: index + 1
    }));
  }

  calculateFinalScores(allResults: MinigameResult[][]): { playerId: string; playerName: string; totalScore: number; position: number }[] {
    const playerScores = new Map<string, { playerName: string; totalScore: number }>();

    // Sumar puntuaciones de todos los minijuegos
    allResults.forEach(gameResults => {
      gameResults.forEach(result => {
        const current = playerScores.get(result.playerId) || { playerName: result.playerName, totalScore: 0 };
        
        // Asignar puntos según la posición: 1er lugar = 3 puntos, 2do = 2 puntos, 3ro = 1 punto, 4to = 0 puntos
        let points = 0;
        switch (result.position) {
          case 1: points = 3; break;
          case 2: points = 2; break;
          case 3: points = 1; break;
          default: points = 0; break;
        }
        
        current.totalScore += points;
        playerScores.set(result.playerId, current);
      });
    });

    // Convertir a array y ordenar
    const finalResults = Array.from(playerScores.entries()).map(([playerId, data]) => ({
      playerId,
      playerName: data.playerName,
      totalScore: data.totalScore
    }));

    // Ordenar por puntuación total
    finalResults.sort((a, b) => b.totalScore - a.totalScore);

    // Asignar posiciones finales
    return finalResults.map((result, index) => ({
      ...result,
      position: index + 1
    }));
  }

  // Generar datos específicos para cada minijuego
  generateReactionTimeChallenge() {
    return {
      delay: Math.random() * 3000 + 2000 // Entre 2-5 segundos
    };
  }

  generateMemorySequence() {
    const length = Math.floor(Math.random() * 3) + 4; // 4-6 elementos
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * 4)); // 4 colores
    }
    return { sequence };
  }

  generateMathChallenge() {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let a, b, answer;
    
    switch (operation) {
      case '+':
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * 50) + 25;
        b = Math.floor(Math.random() * 25) + 1;
        answer = a - b;
        break;
      case '*':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        break;
      default:
        a = 1; b = 1; answer = 2;
    }
    
    return { question: `${a} ${operation} ${b}`, answer };
  }

  generateTypingChallenge() {
    const texts = [
      'El gato subió al tejado',
      'La lluvia cae sobre el jardín',
      'Los pájaros cantan en el árbol',
      'El sol brilla en el cielo azul',
      'Las flores florecen en primavera',
      'El viento sopla entre las hojas',
      'Los niños juegan en el parque',
      'La luna ilumina la noche estrellada'
    ];
    
    return {
      text: texts[Math.floor(Math.random() * texts.length)]
    };
  }

  generateColorChallenge() {
    const colors = [
      { name: 'Rojo', value: '#FF0000' },
      { name: 'Azul', value: '#0000FF' },
      { name: 'Verde', value: '#00FF00' },
      { name: 'Amarillo', value: '#FFFF00' },
      { name: 'Naranja', value: '#FFA500' },
      { name: 'Morado', value: '#800080' }
    ];
    
    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
    
    return {
      targetColorName: targetColor.name,
      targetColorValue: targetColor.value,
      options: shuffledColors.slice(0, 4)
    };
  }

  generateSimonSaysChallenge() {
    const actions = [
      'Levanta la mano derecha',
      'Toca tu nariz',
      'Aplaude',
      'Salta',
      'Gira a la izquierda',
      'Cierra los ojos',
      'Sonríe',
      'Toca tu cabeza'
    ];
    
    const commands = [];
    const numCommands = Math.floor(Math.random() * 3) + 3; // 3-5 comandos
    
    for (let i = 0; i < numCommands; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const isSimonSays = Math.random() > 0.3; // 70% probabilidad de ser "Simón dice"
      
      commands.push({
        text: isSimonSays ? `Simón dice: ${action}` : action,
        isValid: isSimonSays
      });
    }
    
    return { commands };
  }

  generateNumberGuessingChallenge() {
    return {
      targetNumber: Math.floor(Math.random() * 100) + 1,
      maxAttempts: 7
    };
  }

  generatePatternChallenge() {
    const shapes = ['circle', 'square', 'triangle', 'diamond'];
    const colors = ['red', 'blue', 'green', 'yellow'];
    
    const pattern = [];
    const patternLength = 4;
    
    for (let i = 0; i < patternLength; i++) {
      pattern.push({
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    // Generar opciones para completar el patrón
    const options = [];
    for (let i = 0; i < 4; i++) {
      options.push({
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    // Asegurar que una opción sea la correcta (simplificado)
    const correctIndex = Math.floor(Math.random() * 4);
    options[correctIndex] = pattern[0]; // Simplificado: la respuesta correcta es repetir el primer elemento
    
    return { pattern, options, correctIndex };
  }

  generateQuickClickChallenge() {
    return {
      targetCount: Math.floor(Math.random() * 10) + 15, // 15-25 objetivos
      spawnRate: Math.random() * 500 + 500 // Entre 500-1000ms
    };
  }

  generateWordScrambleChallenge() {
    const words = [
      'GATO', 'PERRO', 'CASA', 'AGUA', 'FUEGO',
      'TIERRA', 'CIELO', 'LUNA', 'SOL', 'ESTRELLA',
      'FLOR', 'ÁRBOL', 'MONTAÑA', 'RÍO', 'MAR'
    ];
    
    const word = words[Math.floor(Math.random() * words.length)];
    const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    
    return {
      originalWord: word,
      scrambledWord: scrambled
    };
  }
}