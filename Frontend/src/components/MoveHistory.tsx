import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MoveHistoryProps {
  moves: string[];
}

export const MoveHistory = ({ moves }: MoveHistoryProps) => {
  const movePairs: [string, string?][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1]]);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Move History</CardTitle>
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
