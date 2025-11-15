import { useState, useCallback } from "react";
import { Chess, Square, PieceSymbol } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { MoveHistory } from "@/components/MoveHistory";
import { CapturedPieces } from "@/components/CapturedPieces";
import { GameStatus } from "@/components/GameStatus";
import { toast } from "sonner";

const Index = () => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<
    { piece: PieceSymbol; color: "w" | "b" }[]
  >([]);

  const handleMove = useCallback(
    (from: Square, to: Square) => {
      const gameCopy = new Chess(game.fen());
      
      try {
        const move = gameCopy.move({ from, to, promotion: "q" });
        
        if (move) {
          if (move.captured) {
            setCapturedPieces((prev) => [
              ...prev,
              { piece: move.captured as PieceSymbol, color: move.color === "w" ? "b" : "w" },
            ]);
          }

          setMoveHistory((prev) => [...prev, move.san]);
          setGame(gameCopy);

          if (gameCopy.isCheckmate()) {
            toast.success(
              `Checkmate! ${move.color === "w" ? "White" : "Black"} wins!`
            );
          } else if (gameCopy.isCheck()) {
            toast.warning("Check!");
          } else if (gameCopy.isDraw()) {
            toast.info("Game drawn!");
          } else if (gameCopy.isStalemate()) {
            toast.info("Stalemate!");
          }
        }
      } catch (error) {
        console.error("Invalid move:", error);
      }
    },
    [game]
  );

  const handleNewGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setCapturedPieces([]);
    toast.success("New game started!");
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
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
          Chess
        </h1>
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
