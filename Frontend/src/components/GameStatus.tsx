import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Clock, Shuffle, Timer, Flag, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameStatusProps {
  status: string;
  turn: "w" | "b";
  isCheck: boolean;
  isGameOver: boolean;
  onNewGame: () => void;
  onChess960: () => void;
  whitePlayerName: string;
  blackPlayerName: string;
  whiteTime: number;
  blackTime: number;
  onSetTime: () => void;
  showSetTime: boolean;
  isMultiplayer: boolean;
  playerRole: 'w' | 'b' | 'spectator' | null;
  onResignWhite?: () => void;
  onResignBlack?: () => void;
  onResign?: () => void;
  onOfferDraw?: () => void;
}

export const GameStatus = ({
  status,
  turn,
  isCheck,
  isGameOver,
  onNewGame,
  onChess960,
  whitePlayerName,
  blackPlayerName,
  whiteTime,
  blackTime,
  onSetTime,
  showSetTime,
  isMultiplayer,
  playerRole,
  onResignWhite,
  onResignBlack,
  onResign,
  onOfferDraw,
}: GameStatusProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Game Status</h3>
            <div className="flex gap-2">
              <Button
                onClick={onChess960}
                variant="outline"
                size="icon"
                className="h-10 w-10"
              >
                <Shuffle className="h-5 w-5" />
              </Button>
              <Button
                onClick={onNewGame}
                variant="outline"
                size="icon"
                className="h-10 w-10"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={cn(
                "p-3 rounded-lg border-2 transition-colors",
                turn === "w" && !isGameOver
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">White</p>
                  <p className="text-xl font-bold">{whitePlayerName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-mono font-bold">
                    {formatTime(whiteTime)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "p-3 rounded-lg border-2 transition-colors",
                turn === "b" && !isGameOver
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Black</p>
                  <p className="text-xl font-bold">{blackPlayerName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-mono font-bold">
                    {formatTime(blackTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isCheck && !isGameOver && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-3">
              <p className="font-semibold text-destructive">Check!</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {showSetTime && (
              <Button onClick={onSetTime} variant="outline" className="flex-1" size="sm">
                <Timer className="h-4 w-4 mr-2" />
                Set Time
              </Button>
            )}
            
            {!isGameOver && (
              <>
                {isMultiplayer && playerRole && playerRole !== 'spectator' && onResign ? (
                  <Button onClick={onResign} variant="destructive" className="flex-1" size="sm">
                    <Flag className="h-4 w-4 mr-2" />
                    Resign
                  </Button>
                ) : !isMultiplayer && onResignWhite && onResignBlack ? (
                  <>
                    <Button onClick={onResignWhite} variant="outline" className="flex-1" size="sm">
                      <Flag className="h-4 w-4 mr-2" />
                      Resign White
                    </Button>
                    <Button onClick={onResignBlack} variant="outline" className="flex-1" size="sm">
                      <Flag className="h-4 w-4 mr-2" />
                      Resign Black
                    </Button>
                  </>
                ) : null}
                
                {!isMultiplayer && onOfferDraw && (
                  <Button onClick={onOfferDraw} variant="secondary" className="flex-1" size="sm">
                    <Handshake className="h-4 w-4 mr-2" />
                    Offer Draw
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
