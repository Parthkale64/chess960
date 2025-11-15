import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PieceSymbol } from "chess.js";

interface PromotionDialogProps {
  open: boolean;
  onSelect: (piece: PieceSymbol) => void;
  color: "w" | "b";
}

const pieceUnicode: Record<string, string> = {
  wq: "♕", wr: "♖", wb: "♗", wn: "♘",
  bq: "♛", br: "♜", bb: "♝", bn: "♞",
};

export const PromotionDialog = ({ open, onSelect, color }: PromotionDialogProps) => {
  const pieces: PieceSymbol[] = ["q", "r", "b", "n"];
  
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Promotion Piece</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 p-4">
          {pieces.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="aspect-square flex items-center justify-center text-6xl hover:bg-accent rounded-lg transition-colors"
            >
              {pieceUnicode[`${color}${piece}`]}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
