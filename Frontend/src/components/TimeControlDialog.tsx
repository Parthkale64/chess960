import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeControlDialogProps {
  open: boolean;
  onClose: () => void;
  onSet: (minutes: number, increment: number) => void;
}

export const TimeControlDialog = ({ open, onClose, onSet }: TimeControlDialogProps) => {
  const [timeInput, setTimeInput] = useState("");
  const [error, setError] = useState("");

  const handleSet = () => {
    setError("");
    
    // Parse format: "n | m" or "n|m" or just "n"
    const parts = timeInput.split("|").map(p => p.trim());
    
    if (parts.length === 0 || parts.length > 2) {
      setError("Invalid format. Use: minutes | increment (e.g., 10 | 5)");
      return;
    }

    const minutes = parseInt(parts[0]);
    const increment = parts.length === 2 ? parseInt(parts[1]) : 0;

    if (isNaN(minutes) || minutes <= 0) {
      setError("Invalid minutes value");
      return;
    }

    if (parts.length === 2 && (isNaN(increment) || increment < 0)) {
      setError("Invalid increment value");
      return;
    }

    onSet(minutes, increment);
    setTimeInput("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Time Control</DialogTitle>
          <DialogDescription>
            Enter time in minutes, or use format "minutes | increment" for games with increment per move.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="time">Time Control</Label>
            <Input
              id="time"
              placeholder="e.g., 10 | 5 (10 mins + 5 sec increment)"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSet()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Examples:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>10 - 10 minute game</li>
              <li>3 | 2 - 3 minutes + 2 second increment</li>
              <li>5 | 0 - 5 minutes, no increment</li>
            </ul>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSet}>Set Time</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
