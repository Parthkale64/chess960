import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MultiplayerDialogProps {
  open: boolean;
  onClose: () => void;
  onJoin: (roomId: string) => void;
}

export const MultiplayerDialog = ({ open, onClose, onJoin }: MultiplayerDialogProps) => {
  const [roomId, setRoomId] = useState("");

  const handleCreateRoom = () => {
    const newRoomId = `room-${Date.now()}`;
    onJoin(newRoomId);
    onClose();
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoin(roomId.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Multiplayer Game</DialogTitle>
          <DialogDescription>
            Create a new room or join an existing one
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Button onClick={handleCreateRoom} className="w-full" size="lg">
              Create New Room
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Share the room ID with your opponent
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Join Existing Room</Label>
              <Input
                id="roomId"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
            </div>
            <Button 
              onClick={handleJoinRoom} 
              className="w-full" 
              variant="secondary"
              disabled={!roomId.trim()}
            >
              Join Room
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
