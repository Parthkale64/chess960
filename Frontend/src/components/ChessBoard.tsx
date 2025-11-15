import { useState, useCallback } from "react";
import { Chess, Square, PieceSymbol, Color } from "chess.js";
import { cn } from "@/lib/utils";

const pieceUnicode: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

interface ChessBoardProps {
  game: Chess;
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => void;
}

export const ChessBoard = ({ game, onMove }: ChessBoardProps) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  const board = game.board();
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (selectedSquare) {
        if (legalMoves.includes(square)) {
          onMove(selectedSquare, square);
          setSelectedSquare(null);
          setLegalMoves([]);
        } else {
          const moves = game.moves({ square, verbose: true });
          if (moves.length > 0) {
            setSelectedSquare(square);
            setLegalMoves(moves.map((m) => m.to));
          } else {
            setSelectedSquare(null);
            setLegalMoves([]);
          }
        }
      } else {
        const moves = game.moves({ square, verbose: true });
        if (moves.length > 0) {
          setSelectedSquare(square);
          setLegalMoves(moves.map((m) => m.to));
        }
      }
    },
    [selectedSquare, legalMoves, game, onMove]
  );

  const getPiece = (rank: number, file: number) => {
    const piece = board[rank][file];
    if (!piece) return null;
    return pieceUnicode[`${piece.color}${piece.type}`];
  };

  const getSquareName = (rankIdx: number, fileIdx: number): Square => {
    return `${files[fileIdx]}${ranks[rankIdx]}` as Square;
  };

  return (
    <div className="relative inline-block">
      <div className="grid grid-cols-8 gap-0 border-8 border-[hsl(var(--chess-board-border))] rounded-lg shadow-[var(--shadow-board)] bg-[hsl(var(--chess-board-border))]">
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const square = getSquareName(rankIdx, fileIdx);
            const isLight = (rankIdx + fileIdx) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isLegalMove = legalMoves.includes(square);
            const piece = getPiece(rankIdx, fileIdx);

            return (
              <button
                key={square}
                onClick={() => handleSquareClick(square)}
                className={cn(
                  "aspect-square w-16 sm:w-20 md:w-24 flex items-center justify-center text-5xl sm:text-6xl md:text-7xl cursor-pointer transition-all duration-200 hover:brightness-110 relative",
                  isLight
                    ? "bg-[hsl(var(--chess-light))]"
                    : "bg-[hsl(var(--chess-dark))]",
                  isSelected && "ring-4 ring-[hsl(var(--chess-selected))] ring-inset",
                  isLegalMove && "after:absolute after:w-4 after:h-4 after:bg-[hsl(var(--chess-highlight))] after:rounded-full after:opacity-70"
                )}
              >
                {piece && (
                  <span className="drop-shadow-lg select-none">
                    {piece}
                  </span>
                )}
                {fileIdx === 0 && (
                  <span className="absolute left-1 top-1 text-xs font-bold opacity-50">
                    {rank}
                  </span>
                )}
                {rankIdx === 7 && (
                  <span className="absolute right-1 bottom-1 text-xs font-bold opacity-50">
                    {file}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
