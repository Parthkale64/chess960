import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Square, PieceSymbol } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { MultiplayerDialog } from "@/components/MultiplayerDialog";
import { TimeControlDialog } from "@/components/TimeControlDialog";
import { MoveHistory } from "@/components/MoveHistory";
import { CapturedPieces } from "@/components/CapturedPieces";
import { GameStatus } from "@/components/GameStatus";
import { PlayerSettings } from "@/components/PlayerSettings";
import { PromotionDialog } from "@/components/PromotionDialog";
import { GameEndOverlay } from "@/components/GameEndOverlay";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [showMultiplayerDialog, setShowMultiplayerDialog] = useState(false);
  const [capturedPieces, setCapturedPieces] = useState<
    { piece: PieceSymbol; color: "w" | "b" }[]
  >([]);
  const [whitePlayerName, setWhitePlayerName] = useState("White");
  const [blackPlayerName, setBlackPlayerName] = useState("Black");
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ from: Square; to: Square } | null>(null);
  const [showTimeControlDialog, setShowTimeControlDialog] = useState(false);
  const [timeIncrement, setTimeIncrement] = useState(0);
  const [movesPlayed, setMovesPlayed] = useState(0);
  const [gameResult, setGameResult] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleGameUpdate = useCallback((fen: string) => {
    const newGame = new Chess(fen);
    setGame(newGame);
    
    // Set PGN headers
    const today = new Date();
    newGame.header("Event", "Online Chess Game");
    newGame.header("Site", "Chess App");
    newGame.header("Date", today.toISOString().split('T')[0]);
    newGame.header("Round", "1");
    newGame.header("White", whitePlayerName);
    newGame.header("Black", blackPlayerName);
    
    if (newGame.isGameOver()) {
      let result = "1/2-1/2";
      if (newGame.isCheckmate()) {
        result = newGame.turn() === "w" ? "0-1" : "1-0";
      }
      newGame.header("Result", result);
    }
  }, [whitePlayerName, blackPlayerName]);

  const { playerRole, isConnected, makeMove } = useMultiplayer(
    isMultiplayer ? roomId : null,
    handleGameUpdate
  );

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || game.isGameOver()) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            const result = `${blackPlayerName} wins on time!`;
            setGameResult(result);
            toast.error(result);
            
            // Set PGN result
            const gameCopy = new Chess(game.fen());
            gameCopy.header("Result", "0-1");
            setGame(gameCopy);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            const result = `${whitePlayerName} wins on time!`;
            setGameResult(result);
            toast.error(result);
            
            // Set PGN result
            const gameCopy = new Chess(game.fen());
            gameCopy.header("Result", "1-0");
            setGame(gameCopy);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, game, whitePlayerName, blackPlayerName]);

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      const gameCopy = new Chess(game.fen());
      
      // Check if this is a pawn promotion move
      const piece = gameCopy.get(from);
      const isPromotion = piece?.type === "p" && 
        ((piece.color === "w" && to[1] === "8") || (piece.color === "b" && to[1] === "1"));
      
      if (isPromotion && !promotion) {
        setPendingMove({ from, to });
        setShowPromotionDialog(true);
        return;
      }
      
      if (isMultiplayer) {
        // Send move to server for validation
        makeMove({ from, to, promotion: promotion || "q" });
      } else {
        // Local game
        try {
          const move = gameCopy.move({ from, to, promotion: promotion || "q" });
          
          if (move) {
            if (!isTimerActive) setIsTimerActive(true);

            if (move.captured) {
              setCapturedPieces((prev) => [
                ...prev,
                { piece: move.captured as PieceSymbol, color: move.color === "w" ? "b" : "w" },
              ]);
            }

            setMoveHistory((prev) => [...prev, move.san]);
            setMovesPlayed(prev => prev + 1);
            
            // Add time increment after move
            if (timeIncrement > 0) {
              if (move.color === "w") {
                setWhiteTime(prev => prev + timeIncrement);
              } else {
                setBlackTime(prev => prev + timeIncrement);
              }
            }

            // Update PGN headers
            const today = new Date();
            gameCopy.header("Event", "Chess Game");
            gameCopy.header("Site", "Chess App");
            gameCopy.header("Date", today.toISOString().split('T')[0]);
            gameCopy.header("Round", "1");
            gameCopy.header("White", whitePlayerName);
            gameCopy.header("Black", blackPlayerName);

            if (gameCopy.isCheckmate()) {
              setIsTimerActive(false);
              const result = gameCopy.turn() === "w" ? "0-1" : "1-0";
              gameCopy.header("Result", result);
              setGameResult(getGameStatus());
            } else if (gameCopy.isCheck()) {
              toast.warning("Check!");
            } else if (gameCopy.isDraw()) {
              setIsTimerActive(false);
              gameCopy.header("Result", "1/2-1/2");
              setGameResult("Draw!");
            } else if (gameCopy.isStalemate()) {
              setIsTimerActive(false);
              gameCopy.header("Result", "1/2-1/2");
              setGameResult("Stalemate!");
            }
            
            setGame(gameCopy);
          }
        } catch (error) {
          console.error("Invalid move:", error);
        }
      }
    },
    [game, isTimerActive, isMultiplayer, makeMove]
  );

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (pendingMove) {
      handleMove(pendingMove.from, pendingMove.to, piece);
      setShowPromotionDialog(false);
      setPendingMove(null);
    }
  };

  const handleNewGame = () => {
    const newGame = new Chess();
    const today = new Date();
    newGame.header("Event", "Chess Game");
    newGame.header("Site", "Chess App");
    newGame.header("Date", today.toISOString().split('T')[0]);
    newGame.header("Round", "1");
    newGame.header("White", whitePlayerName);
    newGame.header("Black", blackPlayerName);
    newGame.header("Result", "*");
    
    setGame(newGame);
    setMoveHistory([]);
    setCapturedPieces([]);
    setWhiteTime(600);
    setBlackTime(600);
    setIsTimerActive(false);
    setIsMultiplayer(false);
    setRoomId(null);
    setMovesPlayed(0);
    setGameResult("");
    if (timerRef.current) clearInterval(timerRef.current);
    toast.success("New game started!");
  };

  const handleJoinMultiplayer = (room: string) => {
    setRoomId(room);
    setIsMultiplayer(true);
    toast.success(`Joining room: ${room}`);
  };

  const handleChess960 = () => {
    const chess960Positions = [
      "QNNRKR", "NQNRKR", "NNQRKR", "NNRQKR", "NNRKQR", "NNRKRQ",
      "QNRNKR", "NQRNKR", "NRQNKR", "NRNQKR", "NRNKQR", "NRNKRQ",
      "QNRKNR", "NQRKNR", "NRQKNR", "NRKQNR", "NRKNQR", "NRKNRQ",
      "QNRKRN", "NQRKRN", "NRQKRN", "NRKQRN", "NRKRQN", "NRKRNQ"
    ];
    
    const randomPos = chess960Positions[Math.floor(Math.random() * chess960Positions.length)];
    const backRank = randomPos.toLowerCase().split("");
    
    let fen = backRank.join("") + "/pppppppp/8/8/8/8/PPPPPPPP/" + 
              backRank.join("").toUpperCase() + " w KQkq - 0 1";
    
    const newGame = new Chess();
    try {
      newGame.load(fen);
      const today = new Date();
      newGame.header("Event", "Chess960 Game");
      newGame.header("Site", "Chess App");
      newGame.header("Date", today.toISOString().split('T')[0]);
      newGame.header("Round", "1");
      newGame.header("White", whitePlayerName);
      newGame.header("Black", blackPlayerName);
      newGame.header("Result", "*");
      
      setGame(newGame);
      setMoveHistory([]);
      setCapturedPieces([]);
      setWhiteTime(600);
      setBlackTime(600);
      setIsTimerActive(false);
      setMovesPlayed(0);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success("Chess960 position set!");
    } catch (error) {
      toast.error("Failed to set Chess960 position");
    }
  };

  const handlePlayerNamesSave = (whiteName: string, blackName: string) => {
    setWhitePlayerName(whiteName);
    setBlackPlayerName(blackName);
    toast.success("Player names updated!");
  };

  const handleTimeControl = (minutes: number, increment: number) => {
    const seconds = minutes * 60;
    setWhiteTime(seconds);
    setBlackTime(seconds);
    setTimeIncrement(increment);
    toast.success(`Time control set: ${minutes} min + ${increment} sec`);
  };

  const handleResignWhite = () => {
    setIsTimerActive(false);
    const result = `${blackPlayerName} wins by resignation!`;
    setGameResult(result);
    const gameCopy = new Chess(game.fen());
    gameCopy.header("Result", "0-1");
    setGame(gameCopy);
    toast.error(result);
  };

  const handleResignBlack = () => {
    setIsTimerActive(false);
    const result = `${whitePlayerName} wins by resignation!`;
    setGameResult(result);
    const gameCopy = new Chess(game.fen());
    gameCopy.header("Result", "1-0");
    setGame(gameCopy);
    toast.error(result);
  };

  const handleResign = () => {
    if (!playerRole) return;
    setIsTimerActive(false);
    const winner = playerRole === 'w' ? blackPlayerName : whitePlayerName;
    const result = `${winner} wins by resignation!`;
    setGameResult(result);
    const gameCopy = new Chess(game.fen());
    gameCopy.header("Result", playerRole === 'w' ? "0-1" : "1-0");
    setGame(gameCopy);
    toast.error(result);
  };

  const getGameStatus = () => {
    if (gameResult) return gameResult;
    if (game.isCheckmate()) {
      return `Checkmate! ${game.turn() === "w" ? blackPlayerName : whitePlayerName} wins!`;
    }
    if (game.isDraw()) return "Draw!";
    if (game.isStalemate()) return "Stalemate!";
    if (game.isThreefoldRepetition()) return "Draw by repetition!";
    if (game.isInsufficientMaterial()) return "Draw by insufficient material!";
    return "";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Chess
          </h1>
          <PlayerSettings
            whitePlayerName={whitePlayerName}
            blackPlayerName={blackPlayerName}
            onSave={handlePlayerNamesSave}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-center text-muted-foreground">
          Play a game of chess
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start justify-items-center lg:justify-items-start">
          <div className="flex justify-center">
            <ChessBoard game={game} onMove={handleMove} playerRole={playerRole} />
          </div>

          <div className="w-full max-w-sm space-y-4">
            {isMultiplayer && (
              <div className="p-4 bg-card rounded-lg border">
                <p className="text-sm">
                  <strong>Room:</strong> {roomId}
                </p>
                <p className="text-sm">
                  <strong>Role:</strong> {playerRole === 'w' ? 'White' : playerRole === 'b' ? 'Black' : 'Spectator'}
                </p>
                <p className="text-sm">
                  <strong>Status:</strong> {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleNewGame} className="flex-1">
                New Local Game
              </Button>
              <Button onClick={() => setShowMultiplayerDialog(true)} variant="secondary" className="flex-1">
                Multiplayer
              </Button>
            </div>
            
            <GameStatus
              status={getGameStatus()}
              turn={game.turn()}
              isCheck={game.isCheck()}
              isGameOver={game.isGameOver() || whiteTime === 0 || blackTime === 0 || gameResult !== ""}
              onNewGame={handleNewGame}
              onChess960={handleChess960}
              whitePlayerName={whitePlayerName}
              blackPlayerName={blackPlayerName}
              whiteTime={whiteTime}
              blackTime={blackTime}
              onSetTime={() => setShowTimeControlDialog(true)}
              showSetTime={movesPlayed < 2}
              isMultiplayer={isMultiplayer}
              playerRole={playerRole}
              onResignWhite={handleResignWhite}
              onResignBlack={handleResignBlack}
              onResign={handleResign}
            />
            <CapturedPieces captured={capturedPieces} />
            <MoveHistory moves={moveHistory} game={game} />
          </div>
        </div>
      </main>

      <PromotionDialog
        open={showPromotionDialog}
        onSelect={handlePromotionSelect}
        color={game.turn() === "w" ? "b" : "w"}
      />

      <MultiplayerDialog
        open={showMultiplayerDialog}
        onClose={() => setShowMultiplayerDialog(false)}
        onJoin={handleJoinMultiplayer}
      />

      <TimeControlDialog
        open={showTimeControlDialog}
        onClose={() => setShowTimeControlDialog(false)}
        onSet={handleTimeControl}
      />

      <GameEndOverlay
        visible={game.isGameOver() || whiteTime === 0 || blackTime === 0 || gameResult !== ""}
        status={whiteTime === 0 ? `${blackPlayerName} wins on time!` : blackTime === 0 ? `${whitePlayerName} wins on time!` : getGameStatus()}
        onNewGame={handleNewGame}
        game={game}
        whitePlayerName={whitePlayerName}
        blackPlayerName={blackPlayerName}
      />
    </div>
  );
};

export default Index;
