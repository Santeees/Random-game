import { useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useGameStore } from './store/gameStore';
import JoinScreen from './components/JoinScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import FinalResultsScreen from './components/FinalResultsScreen';
import ErrorToast from './components/ErrorToast';

function App() {
  const {
    socket,
    isConnected,
    session,
    currentPlayer,
    error,
    joinGame,
    setReady,
    startGame,
    sendMinigameResult,
    clearError
  } = useSocket();
  
  const {
    currentScreen,
    setSession,
    setCurrentPlayer,
    setConnected,
    setError,
    setCurrentScreen,
    setCurrentMinigame,
    setMinigameResults,
    setFinalResults
  } = useGameStore();

  // Sincronizar estado del socket con el store
  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected, setConnected]);

  useEffect(() => {
    setSession(session);
  }, [session, setSession]);

  useEffect(() => {
    setCurrentPlayer(currentPlayer);
  }, [currentPlayer, setCurrentPlayer]);

  useEffect(() => {
    if (error) {
      setError(error);
    }
  }, [error, setError]);

  // Escuchar eventos específicos del juego
  useEffect(() => {
    if (!socket) return;

    const handleGameStarted = (gameSession: any) => {
      setCurrentScreen('game');
    };

    const handleMinigameStart = (minigame: any, number: number) => {
      setCurrentMinigame(minigame, number);
    };

    const handleMinigameEnd = (results: any) => {
      setMinigameResults(results);
      setCurrentScreen('results');
    };

    const handleGameFinished = (finalResults: any) => {
      setFinalResults(finalResults);
      setCurrentScreen('final');
    };

    socket.on('game:started', handleGameStarted);
    socket.on('game:minigame-start', handleMinigameStart);
    socket.on('game:minigame-end', handleMinigameEnd);
    socket.on('game:finished', handleGameFinished);

    return () => {
      socket.off('game:started', handleGameStarted);
      socket.off('game:minigame-start', handleMinigameStart);
      socket.off('game:minigame-end', handleMinigameEnd);
      socket.off('game:finished', handleGameFinished);
    };
  }, [socket, setCurrentScreen, setCurrentMinigame, setMinigameResults, setFinalResults]);

  // Manejar cambios de pantalla basados en el estado de la sesión
  useEffect(() => {
    if (currentPlayer && session) {
      if (session.status === 'waiting') {
        setCurrentScreen('lobby');
      } else if (session.status === 'playing') {
        setCurrentScreen('game');
      } else if (session.status === 'finished') {
        setCurrentScreen('final');
      }
    } else if (!currentPlayer) {
      setCurrentScreen('join');
    }
  }, [currentPlayer, session, setCurrentScreen]);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'join':
        return (
          <JoinScreen 
            onJoin={joinGame}
            isConnected={isConnected}
          />
        );
      case 'lobby':
        return (
          <LobbyScreen 
            session={session}
            currentPlayer={currentPlayer}
            onReady={(isReady) => setReady(isReady)}
            onStartGame={startGame}
          />
        );
      case 'game':
        return (
          <GameScreen 
            session={session}
            currentPlayer={currentPlayer}
            onResult={sendMinigameResult}
          />
        );
      case 'results':
        return (
          <ResultsScreen 
            onContinue={() => setCurrentScreen('game')}
          />
        );
      case 'final':
        return (
          <FinalResultsScreen 
            onPlayAgain={() => {
              setCurrentScreen('join');
              window.location.reload();
            }}
          />
        );
      default:
        return <JoinScreen onJoin={joinGame} isConnected={isConnected} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {renderCurrentScreen()}
      <ErrorToast 
        error={error}
        onClose={() => {
          clearError();
          setError(null);
        }}
      />
    </div>
  );
}

export default App;
