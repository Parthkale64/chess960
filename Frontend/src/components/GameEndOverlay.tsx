import { Button } from "@/components/ui/button";
import { Trophy, Handshake } from "lucide-react";

interface GameEndOverlayProps {
  visible: boolean;
  status: string;
  onNewGame: () => void;
}

export const GameEndOverlay = ({ visible, status, onNewGame }: GameEndOverlayProps) => {
  if (!visible) return null;

  const isCheckmate = status.includes("Checkmate") || status.includes("wins");
  
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

          <Button onClick={onNewGame} size="lg" className="w-full">
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
};
