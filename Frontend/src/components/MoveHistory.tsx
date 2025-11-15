import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Chess } from "chess.js";

interface MoveHistoryProps {
  moves: string[];
  game: Chess;
}

export const MoveHistory = ({ moves, game }: MoveHistoryProps) => {
  const movePairs: [string, string?][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1]]);
  }

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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Move History</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={downloadPGN}
            disabled={moves.length === 0}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {movePairs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No moves yet</p>
          ) : (
            <div className="space-y-1">
              {movePairs.map((pair, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[auto_1fr_1fr] gap-2 text-sm py-1 px-2 rounded hover:bg-muted transition-colors"
                >
                  <span className="font-semibold text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <span className="font-mono">{pair[0]}</span>
                  <span className="font-mono">{pair[1] || ""}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
