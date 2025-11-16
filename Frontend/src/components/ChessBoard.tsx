import { useState, useCallback, useRef, useEffect } from "react";
import { Chess, Square, PieceSymbol, Color } from "chess.js";
import { cn } from "@/lib/utils";

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

interface ChessBoardProps {
  game: Chess;
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => void;
  playerRole?: 'w' | 'b' | 'spectator' | null;
}

interface Arrow {
  from: Square;
  to: Square;
}

export const ChessBoard = ({ game, onMove, playerRole }: ChessBoardProps) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<{ square: Square; piece: string } | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [drawingArrow, setDrawingArrow] = useState<Square | null>(null);
  const [rightMouseDown, setRightMouseDown] = useState(false);
  const [arrowStartSquare, setArrowStartSquare] = useState<Square | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const board = game.board();
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const canInteract = !playerRole || playerRole === 'spectator' || game.turn() === playerRole;

  // Find the checked king's position safely
  const checkedKingSquare = (() => {
    try {
      if (!game.isCheck()) return null;
      const turn = game.turn();
      for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
        for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
          const piece = board[rankIdx][fileIdx];
          if (piece && piece.type === 'k' && piece.color === turn) {
            const square = `${files[fileIdx]}${ranks[rankIdx]}` as Square;
            return square;
          }
        }
      }
    } catch (error) {
      console.error("Error finding checked king:", error);
    }
    return null;
  })();

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!canInteract) return;

      // Clear arrows on any left click
      setArrows([]);
      setDrawingArrow(null);

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
    [selectedSquare, legalMoves, game, onMove, canInteract]
  );

  const handleDragStart = useCallback(
    (square: Square, piece: string) => {
      if (!canInteract) return;
      const moves = game.moves({ square, verbose: true });
      if (moves.length > 0) {
        setDraggedPiece({ square, piece });
        setLegalMoves(moves.map((m) => m.to));
      }
    },
    [game, canInteract]
  );

  const handleDragEnd = useCallback(
    (targetSquare: Square) => {
      if (draggedPiece && legalMoves.includes(targetSquare)) {
        onMove(draggedPiece.square, targetSquare);
      }
      setDraggedPiece(null);
      setLegalMoves([]);
    },
    [draggedPiece, legalMoves, onMove]
  );

  const handleRightMouseDown = useCallback((e: React.MouseEvent, square: Square) => {
    if (e.button === 2) { // Right mouse button
      e.preventDefault();
      setRightMouseDown(true);
      setArrowStartSquare(square);
    }
  }, []);

  const handleRightMouseEnter = useCallback((square: Square) => {
    if (rightMouseDown && arrowStartSquare && arrowStartSquare !== square) {
      // Update drawing arrow preview
      setDrawingArrow(square);
    }
  }, [rightMouseDown, arrowStartSquare]);

  const handleRightMouseUp = useCallback((e: React.MouseEvent, square: Square) => {
    if (e.button === 2 && rightMouseDown && arrowStartSquare) {
      e.preventDefault();
      if (arrowStartSquare !== square) {
        // Check if arrow already exists
        const arrowExists = arrows.some(
          a => a.from === arrowStartSquare && a.to === square
        );
        if (arrowExists) {
          // Remove the arrow if it already exists
          setArrows(prev => prev.filter(
            a => !(a.from === arrowStartSquare && a.to === square)
          ));
        } else {
          // Add new arrow
          setArrows(prev => [...prev, { from: arrowStartSquare, to: square }]);
        }
      }
      setRightMouseDown(false);
      setArrowStartSquare(null);
      setDrawingArrow(null);
    }
  }, [rightMouseDown, arrowStartSquare, arrows]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setArrows([]);
        setDrawingArrow(null);
        setArrowStartSquare(null);
        setRightMouseDown(false);
      }
    };

    const handleMouseUp = () => {
      setRightMouseDown(false);
      setArrowStartSquare(null);
      setDrawingArrow(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const getPiece = (rank: number, file: number) => {
    const piece = board[rank][file];
    if (!piece) return null;
    return `${piece.color}${piece.type}`;
  };

  const getSquareName = (rankIdx: number, fileIdx: number): Square => {
    return `${files[fileIdx]}${ranks[rankIdx]}` as Square;
  };

  const getSquareCenter = (square: Square) => {
    const fileIdx = files.indexOf(square[0]);
    const rankIdx = ranks.indexOf(square[1]);
    const squareSize = window.innerWidth < 640 ? 64 : window.innerWidth < 768 ? 80 : 96;
    return {
      x: fileIdx * squareSize + squareSize / 2,
      y: rankIdx * squareSize + squareSize / 2,
    };
  };

  return (
    <div className="relative inline-block" ref={boardRef}>
      <div className="grid grid-cols-8 gap-0 border-8 border-[hsl(var(--chess-board-border))] rounded-lg shadow-[var(--shadow-board)] bg-[hsl(var(--chess-board-border))] relative">
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const square = getSquareName(rankIdx, fileIdx);
            const isLight = (rankIdx + fileIdx) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isLegalMove = legalMoves.includes(square);
            const piece = getPiece(rankIdx, fileIdx);
            const isCheckedKing = checkedKingSquare === square;

            return (
              <button
                key={square}
                onClick={() => handleSquareClick(square)}
                onMouseDown={(e) => handleRightMouseDown(e, square)}
                onMouseEnter={() => handleRightMouseEnter(square)}
                onMouseUp={(e) => handleRightMouseUp(e, square)}
                onContextMenu={handleContextMenu}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDragEnd(square)}
                className={cn(
                  "aspect-square w-16 sm:w-20 md:w-24 flex items-center justify-center text-5xl sm:text-6xl md:text-7xl cursor-pointer transition-all duration-300 hover:brightness-110 relative",
                  isLight
                    ? "bg-[hsl(var(--chess-light))]"
                    : "bg-[hsl(var(--chess-dark))]",
                  isSelected && "ring-4 ring-[hsl(var(--chess-selected))] ring-inset",
                  isLegalMove && "after:absolute after:w-4 after:h-4 after:bg-[hsl(var(--chess-highlight))] after:rounded-full after:opacity-70 after:transition-all after:duration-200",
                  draggedPiece?.square === square && "opacity-50",
                  isCheckedKing && "animate-pulse ring-4 ring-red-500 ring-inset shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                )}
              >
                {piece && (
                  <img
                    src={pieceSvgs[piece]}
                    alt={piece}
                    className="w-full h-full object-contain p-1 select-none pointer-events-none drop-shadow-lg transition-transform duration-300 ease-out"
                    draggable={canInteract}
                    onDragStart={() => handleDragStart(square, piece)}
                    onDragEnd={() => setDraggedPiece(null)}
                  />
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

      {/* Arrow overlay */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {arrows.map((arrow, idx) => {
          const from = getSquareCenter(arrow.from);
          const to = getSquareCenter(arrow.to);
          return (
            <g key={idx}>
              <defs>
                <marker
                  id={`arrowhead-${idx}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="rgba(255, 0, 0, 0.7)" />
                </marker>
              </defs>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(255, 0, 0, 0.7)"
                strokeWidth="4"
                markerEnd={`url(#arrowhead-${idx})`}
              />
            </g>
          );
        })}
        {/* Preview arrow while dragging */}
        {rightMouseDown && arrowStartSquare && drawingArrow && (
          <g>
            <defs>
              <marker
                id="arrowhead-preview"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="rgba(100, 200, 255, 0.7)" />
              </marker>
            </defs>
            <line
              x1={getSquareCenter(arrowStartSquare).x}
              y1={getSquareCenter(arrowStartSquare).y}
              x2={getSquareCenter(drawingArrow).x}
              y2={getSquareCenter(drawingArrow).y}
              stroke="rgba(100, 200, 255, 0.7)"
              strokeWidth="4"
              markerEnd="url(#arrowhead-preview)"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
