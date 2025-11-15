import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { NavigationBar } from "@/components/NavigationBar";
import { ChessBoard } from "@/components/ChessBoard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, SkipBack, ChevronLeft, ChevronRight, SkipForward, FileUp } from "lucide-react";
import { toast } from "sonner";
import { chessSounds } from "@/utils/sounds";

const PGNViewer = () => {
  const [pgnText, setPgnText] = useState("");
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadPGN = () => {
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgnText);
      const moves = newGame.history();
      
      // Reset to starting position
      const displayGame = new Chess();
      setGame(displayGame);
      setMoveHistory(moves);
      setCurrentMoveIndex(-1);
      toast.success("PGN loaded successfully!");
    } catch (error) {
      toast.error("Invalid PGN format");
      console.error(error);
    }
  };

  const goToStart = () => {
    const newGame = new Chess();
    setGame(newGame);
    setCurrentMoveIndex(-1);
  };

  const goToPrevious = () => {
    if (currentMoveIndex < 0) return;
    
    const newGame = new Chess();
    for (let i = 0; i < currentMoveIndex; i++) {
      newGame.move(moveHistory[i]);
    }
    setGame(newGame);
    setCurrentMoveIndex(currentMoveIndex - 1);
  };

  const goToNext = () => {
    if (currentMoveIndex >= moveHistory.length - 1) return;
    
    const newGame = new Chess();
    for (let i = 0; i <= currentMoveIndex + 1; i++) {
      newGame.move(moveHistory[i]);
    }
    setGame(newGame);
    setCurrentMoveIndex(currentMoveIndex + 1);
  };

  const goToEnd = () => {
    const newGame = new Chess();
    moveHistory.forEach(move => newGame.move(move));
    setGame(newGame);
    setCurrentMoveIndex(moveHistory.length - 1);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPgnText(content);
      try {
        const newGame = new Chess();
        newGame.loadPgn(content);
        const moves = newGame.history();
        
        const displayGame = new Chess();
        setGame(displayGame);
        setMoveHistory(moves);
        setCurrentMoveIndex(-1);
        toast.success("PGN file loaded successfully!");
      } catch (error) {
        toast.error("Invalid PGN file format");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (moveHistory.length === 0) return;
      
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          chessSounds.playMove();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          chessSounds.playMove();
          break;
        case "Home":
          e.preventDefault();
          goToStart();
          chessSounds.playMove();
          break;
        case "End":
          e.preventDefault();
          goToEnd();
          chessSounds.playMove();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentMoveIndex, moveHistory]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="p-4 md:p-8">
        <main className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start justify-items-center lg:justify-items-start">
            <div className="flex justify-center">
              <ChessBoard game={game} onMove={() => {}} playerRole={null} />
            </div>

            <div className="w-full max-w-xl space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>PGN Viewer</CardTitle>
                  <CardDescription>
                    Load and replay chess games in PGN format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste PGN notation here..."
                    value={pgnText}
                    onChange={(e) => setPgnText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleLoadPGN} className="flex-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Load PGN
                    </Button>
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      variant="secondary"
                      className="flex-1"
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pgn,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {moveHistory.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={goToStart}
                          disabled={currentMoveIndex < 0}
                          variant="outline"
                          size="icon"
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={goToPrevious}
                          disabled={currentMoveIndex < 0}
                          variant="outline"
                          size="icon"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-4 py-2 bg-muted rounded-md min-w-[80px] text-center">
                          <span className="text-sm font-medium">
                            {currentMoveIndex + 1} / {moveHistory.length}
                          </span>
                        </div>
                        <Button
                          onClick={goToNext}
                          disabled={currentMoveIndex >= moveHistory.length - 1}
                          variant="outline"
                          size="icon"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={goToEnd}
                          disabled={currentMoveIndex >= moveHistory.length - 1}
                          variant="outline"
                          size="icon"
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="bg-muted p-4 rounded-lg max-h-[300px] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {moveHistory.map((move, index) => {
                            const moveNumber = Math.floor(index / 2) + 1;
                            const isWhite = index % 2 === 0;
                            const isActive = index === currentMoveIndex;
                            
                            return (
                              <div
                                key={index}
                                className={`flex items-center gap-2 ${
                                  isActive ? "bg-primary text-primary-foreground" : ""
                                } rounded px-2 py-1`}
                              >
                                {isWhite && (
                                  <span className="text-muted-foreground font-semibold min-w-[30px]">
                                    {moveNumber}.
                                  </span>
                                )}
                                <span className="font-mono">{move}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PGNViewer;
