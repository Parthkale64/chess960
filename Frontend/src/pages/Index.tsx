import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Square, PieceSymbol } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { MoveHistory } from "@/components/MoveHistory";
import { CapturedPieces } from "@/components/CapturedPieces";
import { GameStatus } from "@/components/GameStatus";
import { PlayerSettings } from "@/components/PlayerSettings";
import { toast } from "sonner";

const Index = () => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<
    { piece: PieceSymbol; color: "w" | "b" }[]
  >([]);
  const [whitePlayerName, setWhitePlayerName] = useState("White");
  const [blackPlayerName, setBlackPlayerName] = useState("Black");
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState(600);
  const [isTimerActive, setIsTimerActive] = useState(false);
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
    (from: Square, to: Square) => {
      const gameCopy = new Chess(game.fen());
      
      try {
        const move = gameCopy.move({ from, to, promotion: "q" });
        
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
            toast.success(
              `Checkmate! ${move.color === "w" ? whitePlayerName : blackPlayerName} wins!`
            );
          } else if (gameCopy.isCheck()) {
            toast.warning("Check!");
          } else if (gameCopy.isDraw()) {
            setIsTimerActive(false);
            toast.info("Game drawn!");
          } else if (gameCopy.isStalemate()) {
            setIsTimerActive(false);
            toast.info("Stalemate!");
          }
        }
      } catch (error) {
        console.error("Invalid move:", error);
      }
    },
    [game, isTimerActive, whitePlayerName, blackPlayerName]
  );

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
              whitePlayerName={whitePlayerName}
              blackPlayerName={blackPlayerName}
              whiteTime={whiteTime}
              blackTime={blackTime}
            />
            <CapturedPieces captured={capturedPieces} />
            <MoveHistory moves={moveHistory} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
