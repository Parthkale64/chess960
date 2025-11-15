import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieceSymbol } from "chess.js";

const pieceUnicode: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const pieceValues: Record<PieceSymbol, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

interface CapturedPiecesProps {
  captured: { piece: PieceSymbol; color: "w" | "b" }[];
}

export const CapturedPieces = ({ captured }: CapturedPiecesProps) => {
  const whiteCaptured = captured.filter((c) => c.color === "b");
  const blackCaptured = captured.filter((c) => c.color === "w");

  const whiteAdvantage = whiteCaptured.reduce((sum, c) => sum + pieceValues[c.piece], 0) -
    blackCaptured.reduce((sum, c) => sum + pieceValues[c.piece], 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Captured Pieces</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold">White</span>
            {whiteAdvantage > 0 && (
              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">
                +{whiteAdvantage}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 min-h-[2rem]">
            {whiteCaptured.map((c, idx) => (
              <span key={idx} className="text-2xl">
                {pieceUnicode[`${c.color}${c.piece}`]}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold">Black</span>
            {whiteAdvantage < 0 && (
              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">
                +{Math.abs(whiteAdvantage)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 min-h-[2rem]">
            {blackCaptured.map((c, idx) => (
              <span key={idx} className="text-2xl">
                {pieceUnicode[`${c.color}${c.piece}`]}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
