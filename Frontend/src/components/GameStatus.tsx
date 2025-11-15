import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameStatusProps {
  status: string;
  turn: "w" | "b";
  isCheck: boolean;
  isGameOver: boolean;
  onNewGame: () => void;
}

export const GameStatus = ({
  status,
  turn,
  isCheck,
  isGameOver,
  onNewGame,
}: GameStatusProps) => {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Turn</p>
              <p className="text-2xl font-bold">
                {turn === "w" ? "White" : "Black"}
              </p>
            </div>
            <Button
              onClick={onNewGame}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          {isCheck && !isGameOver && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-3">
              <p className="font-semibold text-destructive">Check!</p>
            </div>
          )}

          {isGameOver && (
            <div
              className={cn(
                "border rounded-lg p-3",
                status.includes("Checkmate")
                  ? "bg-accent/10 border-accent"
                  : "bg-muted border-border"
              )}
            >
              <p className="font-semibold">{status}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
