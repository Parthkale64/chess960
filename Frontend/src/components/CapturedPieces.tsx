import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieceSymbol } from "chess.js";

// Import SVG pieces
import pawnW from "@/pieces/pawn-w.svg";
import pawnB from "@/pieces/pawn-b.svg";
import knightW from "@/pieces/knight-w.svg";
import knightB from "@/pieces/knight-b.svg";
import bishopW from "@/pieces/bishop-w.svg";
import bishopB from "@/pieces/bishop-b.svg";
import rookW from "@/pieces/rook-w.svg";
import rookB from "@/pieces/rook-b.svg";
import queenW from "@/pieces/queen-w.svg";
import queenB from "@/pieces/queen-b.svg";
import kingW from "@/pieces/king-w.svg";
import kingB from "@/pieces/king-b.svg";

const pieceSvgs: Record<string, string> = {
  wp: pawnW,
  wn: knightW,
  wb: bishopW,
  wr: rookW,
  wq: queenW,
  wk: kingW,
  bp: pawnB,
  bn: knightB,
  bb: bishopB,
  br: rookB,
  bq: queenB,
  bk: kingB,
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
              <img
                key={idx}
                src={pieceSvgs[`${c.color}${c.piece}`]}
                alt={`${c.color}${c.piece}`}
                className="w-8 h-8 object-contain"
              />
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
              <img
                key={idx}
                src={pieceSvgs[`${c.color}${c.piece}`]}
                alt={`${c.color}${c.piece}`}
                className="w-8 h-8 object-contain"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};