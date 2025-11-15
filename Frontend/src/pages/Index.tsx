import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Square, PieceSymbol } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
            toast.error(`${blackPlayerName} wins on time!`);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            toast.error(`${whitePlayerName} wins on time!`);
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
          setGame(gameCopy);

          if (gameCopy.isCheckmate()) {
            setIsTimerActive(false);
          } else if (gameCopy.isCheck()) {
            toast.warning("Check!");
          } else if (gameCopy.isDraw()) {
            setIsTimerActive(false);
          } else if (gameCopy.isStalemate()) {
            setIsTimerActive(false);
          }
        }
      } catch (error) {
        console.error("Invalid move:", error);
      }
    },
    [game, isTimerActive]
  );

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (pendingMove) {
      handleMove(pendingMove.from, pendingMove.to, piece);
      setShowPromotionDialog(false);
      setPendingMove(null);
    }
  };

  const handleNewGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setCapturedPieces([]);
    setWhiteTime(600);
    setBlackTime(600);
    setIsTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    toast.success("New game started!");
  };

  const handleChess960 = () => {
    const chess960Positions = [
      "QNNRKR", "NQNRKR", "NNQRKR", "NNRQKR", "NNRKQR", "NNRKRQ",
      "QNRNKR", "NQRNKR", "NRQNKR", "NRNQKR", "NRNKQR", "NRNKRQ",
      // Add more valid Chess960 positions
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
      setGame(newGame);
      setMoveHistory([]);
      setCapturedPieces([]);
      setWhiteTime(600);
      setBlackTime(600);
      setIsTimerActive(false);
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

  const getGameStatus = () => {
    if (game.isCheckmate()) {
      return `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`;
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
            <ChessBoard game={game} onMove={handleMove} />
          </div>

          <div className="w-full max-w-sm space-y-4">
            <GameStatus
              status={getGameStatus()}
              turn={game.turn()}
              isCheck={game.isCheck()}
              isGameOver={game.isGameOver()}
              onNewGame={handleNewGame}
              onChess960={handleChess960}
              whitePlayerName={whitePlayerName}
              blackPlayerName={blackPlayerName}
              whiteTime={whiteTime}
              blackTime={blackTime}
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

      <GameEndOverlay
        visible={game.isGameOver() || whiteTime === 0 || blackTime === 0}
        status={whiteTime === 0 ? `${blackPlayerName} wins on time!` : blackTime === 0 ? `${whitePlayerName} wins on time!` : getGameStatus()}
        onNewGame={handleNewGame}
      />
    </div>
  );
};

export default Index;
