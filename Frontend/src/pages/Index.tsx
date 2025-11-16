import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Square, PieceSymbol } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { NavigationBar } from "@/components/NavigationBar";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { MultiplayerDialog } from "@/components/MultiplayerDialog";
import { TimeControlDialog } from "@/components/TimeControlDialog";
import { MoveHistory } from "@/components/MoveHistory";
import { CapturedPieces } from "@/components/CapturedPieces";
import { GameStatus } from "@/components/GameStatus";
import { PlayerSettings } from "@/components/PlayerSettings";
import { PromotionDialog } from "@/components/PromotionDialog";
import { GameEndOverlay } from "@/components/GameEndOverlay";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { chessSounds } from "@/utils/sounds";

const Index = () => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [showMultiplayerDialog, setShowMultiplayerDialog] = useState(false);
  const [capturedPieces, setCapturedPieces] = useState<
    { piece: PieceSymbol; color: "w" | "b" }[]
  >([]);
  const [whitePlayerName, setWhitePlayerName] = useState("White");
  const [blackPlayerName, setBlackPlayerName] = useState("Black");
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ from: Square; to: Square } | null>(null);
  const [showTimeControlDialog, setShowTimeControlDialog] = useState(false);
  const [timeIncrement, setTimeIncrement] = useState(0);
  const [movesPlayed, setMovesPlayed] = useState(0);
  const [gameResult, setGameResult] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleGameUpdate = useCallback((fen: string) => {
    // Preserve move history in multiplayer by using the existing game's PGN
    const newGame = new Chess();
    if (game.history().length > 0) {
      try {
        newGame.loadPgn(game.pgn());
        // Apply the new position if it's different
        if (newGame.fen() !== fen) {
          newGame.load(fen);
        }
      } catch {
        newGame.load(fen);
      }
    } else {
      newGame.load(fen);
    }
    
    setGame(newGame);
    
    // Set PGN headers
    const today = new Date();
    newGame.header("Event", "Online Chess Game");
    newGame.header("Site", "Chess App");
    newGame.header("Date", today.toISOString().split('T')[0]);
    newGame.header("Round", "1");
    newGame.header("White", whitePlayerName);
    newGame.header("Black", blackPlayerName);
    
    if (newGame.isGameOver()) {
      let result = "1/2-1/2";
      if (newGame.isCheckmate()) {
        result = newGame.turn() === "w" ? "0-1" : "1-0";
      }
      newGame.header("Result", result);
    }
  }, [game, whitePlayerName, blackPlayerName]);

  const { playerRole, isConnected, makeMove } = useMultiplayer(
    isMultiplayer ? roomId : null,
    handleGameUpdate
  );

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || game.isGameOver()) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            const result = `${blackPlayerName} wins on time!`;
            setGameResult(result);
            toast.error(result);
            chessSounds.playGameEnd(true);
            
            // Set PGN result
            game.header("Result", "0-1");
            setGame(game);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            const result = `${whitePlayerName} wins on time!`;
            setGameResult(result);
            toast.error(result);
            chessSounds.playGameEnd(true);
            
            // Set PGN result
            game.header("Result", "1-0");
            setGame(game);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, game, whitePlayerName, blackPlayerName]);

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      // Preserve move history by loading from PGN
      const gameCopy = new Chess();
      if (game.history().length > 0) {
        gameCopy.loadPgn(game.pgn());
      } else {
        gameCopy.load(game.fen());
      }
      
      // Check if this is a pawn promotion move
      const piece = gameCopy.get(from);
      const isPromotion = piece?.type === "p" && 
        ((piece.color === "w" && to[1] === "8") || (piece.color === "b" && to[1] === "1"));
      
      if (isPromotion && !promotion) {
        setPendingMove({ from, to });
        setShowPromotionDialog(true);
        return;
      }
      
      if (isMultiplayer) {
        // Send move to server for validation
        makeMove({ from, to, promotion: promotion || "q" });
      } else {
        // Local game
        try {
          const move = gameCopy.move({ from, to, promotion: promotion || "q" });
          
          if (move) {
            if (!isTimerActive) setIsTimerActive(true);

            if (move.captured) {
              setCapturedPieces((prev) => [
                ...prev,
                { piece: move.captured as PieceSymbol, color: move.color === "w" ? "b" : "w" },
              ]);
              chessSounds.playCapture();
            } else {
              chessSounds.playMove();
            }

            setMoveHistory((prev) => [...prev, move.san]);
            setMovesPlayed(prev => prev + 1);
            
            // Add time increment after move
            if (timeIncrement > 0) {
              if (move.color === "w") {
                setWhiteTime(prev => prev + timeIncrement);
              } else {
                setBlackTime(prev => prev + timeIncrement);
              }
            }

            // Update PGN headers
            const today = new Date();
            gameCopy.header("Event", "Chess Game");
            gameCopy.header("Site", "Chess App");
            gameCopy.header("Date", today.toISOString().split('T')[0]);
            gameCopy.header("Round", "1");
            gameCopy.header("White", whitePlayerName);
            gameCopy.header("Black", blackPlayerName);

            if (gameCopy.isCheckmate()) {
              setIsTimerActive(false);
              const result = gameCopy.turn() === "w" ? "0-1" : "1-0";
              gameCopy.header("Result", result);
              setGameResult(getGameStatus());
              chessSounds.playGameEnd(true);
            } else if (gameCopy.isCheck()) {
              toast.warning("Check!");
              chessSounds.playCheck();
            } else if (gameCopy.isDraw()) {
              setIsTimerActive(false);
              gameCopy.header("Result", "1/2-1/2");
              setGameResult("Draw!");
              chessSounds.playGameEnd(false);
            } else if (gameCopy.isStalemate()) {
              setIsTimerActive(false);
              gameCopy.header("Result", "1/2-1/2");
              setGameResult("Stalemate!");
              chessSounds.playGameEnd(false);
            }
            
            setGame(gameCopy);
          }
        } catch (error) {
          console.error("Invalid move:", error);
        }
      }
    },
    [game, isTimerActive, isMultiplayer, makeMove]
  );

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (pendingMove) {
      handleMove(pendingMove.from, pendingMove.to, piece);
      setShowPromotionDialog(false);
      setPendingMove(null);
    }
  };

  const handleNewGame = () => {
    const newGame = new Chess();
    const today = new Date();
    newGame.header("Event", "Chess Game");
    newGame.header("Site", "Chess App");
    newGame.header("Date", today.toISOString().split('T')[0]);
    newGame.header("Round", "1");
    newGame.header("White", whitePlayerName);
    newGame.header("Black", blackPlayerName);
    newGame.header("Result", "*");
    
    setGame(newGame);
    setMoveHistory([]);
    setCapturedPieces([]);
    setWhiteTime(600);
    setBlackTime(600);
    setIsTimerActive(false);
    setIsMultiplayer(false);
    setRoomId(null);
    setMovesPlayed(0);
    setGameResult("");
    if (timerRef.current) clearInterval(timerRef.current);
    toast.success("New game started!");
  };

  const handleJoinMultiplayer = (room: string) => {
    setRoomId(room);
    setIsMultiplayer(true);
    toast.success(`Joining room: ${room}`);
  };

  const handleChess960 = () => {
    // Generate a valid Chess960 back rank (white side)
    const backRank = Array(8).fill('');
    const even = [0, 2, 4, 6];
    const odd = [1, 3, 5, 7];

    const pickRandom = (arr: number[]) => arr.splice(Math.floor(Math.random() * arr.length), 1)[0];

    // Bishops on opposite colors
    const evenCopy = [...even];
    const oddCopy = [...odd];
    const bishop1Pos = pickRandom(evenCopy);
    const bishop2Pos = pickRandom(oddCopy);
    backRank[bishop1Pos] = 'B';
    backRank[bishop2Pos] = 'B';

    // Remaining indices
    const remaining = Array.from({ length: 8 }, (_, i) => i).filter((i) => ![bishop1Pos, bishop2Pos].includes(i));

    // Queen
    const queenPos = pickRandom(remaining);
    backRank[queenPos] = 'Q';

    // Knights (2)
    const knight1Pos = pickRandom(remaining);
    const knight2Pos = pickRandom(remaining);
    backRank[knight1Pos] = 'N';
    backRank[knight2Pos] = 'N';

    // Remaining 3 squares: place R K R with king between rooks
    remaining.sort((a, b) => a - b);
    const leftRookPos = remaining[0];
    const kingPos = remaining[1];
    const rightRookPos = remaining[2];
    
    backRank[leftRookPos] = 'R';
    backRank[kingPos] = 'K';
    backRank[rightRookPos] = 'R';

    const whiteRank = backRank.join('');
    const blackRank = whiteRank.toLowerCase();

    // Build FEN for Chess960 position with castling rights
    // In Chess960, castling is always possible initially (king is between rooks)
    const fen = `${blackRank}/pppppppp/8/8/8/8/PPPPPPPP/${whiteRank} w KQkq - 0 1`;

    let newGame: Chess;
    try {
      newGame = new Chess(fen);
    } catch (error) {
      console.error("Chess960 setup error:", error);
      toast.error("Failed to set Chess960 position. Using standard chess.");
      newGame = new Chess();
    }

    const today = new Date();
    newGame.header("Event", "Chess960 Game");
    newGame.header("Site", "Chess App");
    newGame.header("Date", today.toISOString().split('T')[0]);
    newGame.header("Round", "1");
    newGame.header("White", whitePlayerName);
    newGame.header("Black", blackPlayerName);
    newGame.header("Result", "*");

    setGame(newGame);
    setMoveHistory([]);
    setCapturedPieces([]);
    setWhiteTime(600);
    setBlackTime(600);
    setIsTimerActive(false);
    setMovesPlayed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    toast.success("Chess960 position set!");
  };

  const handlePlayerNamesSave = (whiteName: string, blackName: string) => {
    setWhitePlayerName(whiteName);
    setBlackPlayerName(blackName);
    toast.success("Player names updated!");
  };

  const handleTimeControl = (minutes: number, increment: number) => {
    const seconds = minutes * 60;
    setWhiteTime(seconds);
    setBlackTime(seconds);
    setTimeIncrement(increment);
    toast.success(`Time control set: ${minutes} min + ${increment} sec`);
  };

  const handleResignWhite = () => {
    setIsTimerActive(false);
    const result = `${blackPlayerName} wins by resignation!`;
    setGameResult(result);
    game.header("Result", "0-1");
    setGame(game);
    toast.error(result);
    chessSounds.playGameEnd(true);
  };

  const handleResignBlack = () => {
    setIsTimerActive(false);
    const result = `${whitePlayerName} wins by resignation!`;
    setGameResult(result);
    game.header("Result", "1-0");
    setGame(game);
    toast.error(result);
    chessSounds.playGameEnd(true);
  };

  const handleResign = () => {
    if (!playerRole) return;
    setIsTimerActive(false);
    const winner = playerRole === 'w' ? blackPlayerName : whitePlayerName;
    const result = `${winner} wins by resignation!`;
    setGameResult(result);
    game.header("Result", playerRole === 'w' ? "0-1" : "1-0");
    setGame(game);
    toast.error(result);
    chessSounds.playGameEnd(true);
  };

  const handleOfferDraw = () => {
    setIsTimerActive(false);
    const result = "Game drawn by agreement";
    setGameResult(result);
    game.header("Result", "1/2-1/2");
    setGame(game);
    toast.success(result);
    chessSounds.playGameEnd(false);
  };

  const getGameStatus = () => {
    if (gameResult) return gameResult;
    if (game.isCheckmate()) {
      return `Checkmate! ${game.turn() === "w" ? blackPlayerName : whitePlayerName} wins!`;
    }
    if (game.isDraw()) return "Draw!";
    if (game.isStalemate()) return "Stalemate!";
    if (game.isThreefoldRepetition()) return "Draw by repetition!";
    if (game.isInsufficientMaterial()) return "Draw by insufficient material!";
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar 
        showPlayerSettings={true}
        whitePlayerName={whitePlayerName}
        blackPlayerName={blackPlayerName}
        onPlayerNamesSave={handlePlayerNamesSave}
      />
      
      <div className="p-4 md:p-8">
        <main className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start justify-items-center lg:justify-items-start">
            <div className="flex justify-center">
              <ChessBoard game={game} onMove={handleMove} playerRole={playerRole} />
            </div>

            <div className="w-full max-w-sm space-y-4">
              {isMultiplayer && (
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm">
                    <strong>Room:</strong> {roomId}
                  </p>
                  <p className="text-sm">
                    <strong>Role:</strong> {playerRole === 'w' ? 'White' : playerRole === 'b' ? 'Black' : 'Spectator'}
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong> {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleNewGame} className="flex-1">
                  New Local Game
                </Button>
                <Button onClick={() => setShowMultiplayerDialog(true)} variant="secondary" className="flex-1">
                  Multiplayer
                </Button>
              </div>
              
              <GameStatus
                status={getGameStatus()}
                turn={game.turn()}
                isCheck={game.isCheck()}
                isGameOver={game.isGameOver() || whiteTime === 0 || blackTime === 0 || gameResult !== ""}
                onNewGame={handleNewGame}
                onChess960={handleChess960}
                whitePlayerName={whitePlayerName}
                blackPlayerName={blackPlayerName}
                whiteTime={whiteTime}
                blackTime={blackTime}
                onSetTime={() => setShowTimeControlDialog(true)}
                showSetTime={movesPlayed < 2}
                isMultiplayer={isMultiplayer}
                playerRole={playerRole}
                onResignWhite={handleResignWhite}
                onResignBlack={handleResignBlack}
                onResign={handleResign}
                onOfferDraw={handleOfferDraw}
              />
              <CapturedPieces captured={capturedPieces} />
              <MoveHistory moves={moveHistory} game={game} />
            </div>
          </div>
        </main>
      </div>

      <PromotionDialog
        open={showPromotionDialog}
        onSelect={handlePromotionSelect}
        color={game.turn() === "w" ? "b" : "w"}
      />

      <MultiplayerDialog
        open={showMultiplayerDialog}
        onClose={() => setShowMultiplayerDialog(false)}
        onJoin={handleJoinMultiplayer}
      />

      <TimeControlDialog
        open={showTimeControlDialog}
        onClose={() => setShowTimeControlDialog(false)}
        onSet={handleTimeControl}
      />

      <GameEndOverlay
        visible={game.isGameOver() || whiteTime === 0 || blackTime === 0 || gameResult !== ""}
        status={whiteTime === 0 ? `${blackPlayerName} wins on time!` : blackTime === 0 ? `${whitePlayerName} wins on time!` : getGameStatus()}
        onNewGame={handleNewGame}
        game={game}
        whitePlayerName={whitePlayerName}
        blackPlayerName={blackPlayerName}
      />
    </div>
  );
};

export default Index;
