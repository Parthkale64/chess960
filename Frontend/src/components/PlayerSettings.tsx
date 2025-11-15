import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface PlayerSettingsProps {
  whitePlayerName: string;
  blackPlayerName: string;
  onSave: (whiteName: string, blackName: string) => void;
}

export const PlayerSettings = ({
  whitePlayerName,
  blackPlayerName,
  onSave,
}: PlayerSettingsProps) => {
  const [whiteName, setWhiteName] = useState(whitePlayerName);
  const [blackName, setBlackName] = useState(blackPlayerName);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave(whiteName || "White", blackName || "Black");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Player Settings</DialogTitle>
          <DialogDescription>
            Customize player names for the game
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="white-player">White Player</Label>
            <Input
              id="white-player"
              value={whiteName}
              onChange={(e) => setWhiteName(e.target.value)}
              placeholder="White"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="black-player">Black Player</Label>
            <Input
              id="black-player"
              value={blackName}
              onChange={(e) => setBlackName(e.target.value)}
              placeholder="Black"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
