import { Button } from "@/components/ui/button";
import { Trophy, Handshake, Download } from "lucide-react";
import { Chess } from "chess.js";

interface GameEndOverlayProps {
  visible: boolean;
  status: string;
  onNewGame: () => void;
  game: Chess;
  whitePlayerName: string;
  blackPlayerName: string;
}

export const GameEndOverlay = ({ visible, status, onNewGame, game, whitePlayerName, blackPlayerName }: GameEndOverlayProps) => {
  if (!visible) return null;

  const isCheckmate = status.includes("Checkmate") || status.includes("wins");

  const downloadPGN = () => {
    const pgn = game.pgn();
    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chess-game-${new Date().toISOString().slice(0, 10)}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-card border-2 border-primary rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex flex-col items-center gap-6">
          {isCheckmate ? (
            <Trophy className="w-20 h-20 text-primary animate-bounce" />
          ) : (
            <Handshake className="w-20 h-20 text-muted-foreground" />
          )}
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">{status}</h2>
            <p className="text-muted-foreground">
              {isCheckmate ? "Congratulations!" : "Good game!"}
            </p>
          </div>

          <div className="flex gap-2 w-full">
            <Button onClick={downloadPGN} variant="outline" size="lg" className="flex-1">
              <Download className="h-5 w-5 mr-2" />
              Download PGN
            </Button>
            <Button onClick={onNewGame} size="lg" className="flex-1">
              New Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
