import { NavigationBar } from "@/components/NavigationBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const HowToPlay = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="p-4 md:p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">How to Play Chess</CardTitle>
              <CardDescription>
                Learn the basic rules and strategies of chess
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="setup">
                  <AccordionTrigger>Setup & Objective</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Chess is played on an 8×8 board with 64 squares. Each player starts with 16 pieces:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>1 King</li>
                      <li>1 Queen</li>
                      <li>2 Rooks</li>
                      <li>2 Bishops</li>
                      <li>2 Knights</li>
                      <li>8 Pawns</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Objective:</strong> Checkmate your opponent's king (trap it with no legal moves).
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pieces">
                  <AccordionTrigger>How Pieces Move</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div>
                        <strong>Pawn (♙):</strong> Moves forward one square, or two squares on its first move. Captures diagonally.
                      </div>
                      <div>
                        <strong>Rook (♖):</strong> Moves horizontally or vertically any number of squares.
                      </div>
                      <div>
                        <strong>Knight (♘):</strong> Moves in an "L" shape (2 squares in one direction, 1 square perpendicular). Can jump over pieces.
                      </div>
                      <div>
                        <strong>Bishop (♗):</strong> Moves diagonally any number of squares.
                      </div>
                      <div>
                        <strong>Queen (♕):</strong> Combines rook and bishop movements (horizontally, vertically, or diagonally).
                      </div>
                      <div>
                        <strong>King (♔):</strong> Moves one square in any direction.
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="special">
                  <AccordionTrigger>Special Moves</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div>
                        <strong>Castling:</strong> A defensive move where the king moves two squares toward a rook, and the rook moves to the square next to the king. Requirements:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>Neither piece has moved before</li>
                          <li>No pieces between them</li>
                          <li>King not in check, doesn't pass through or land in check</li>
                        </ul>
                      </div>
                      <div>
                        <strong>En Passant:</strong> A pawn capturing move. If an opponent's pawn moves two squares forward and lands beside your pawn, you can capture it as if it moved only one square (on the next turn only).
                      </div>
                      <div>
                        <strong>Promotion:</strong> When a pawn reaches the opposite end of the board, it must be promoted to a queen, rook, bishop, or knight.
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="check">
                  <AccordionTrigger>Check & Checkmate</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Check:</strong> When a king is under attack. The player must:
                      </p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Move the king to safety</li>
                        <li>Block the attack with another piece</li>
                        <li>Capture the attacking piece</li>
                      </ul>
                      <p className="mt-2">
                        <strong>Checkmate:</strong> When a king is in check and has no legal way to escape. The game ends and the attacking player wins.
                      </p>
                      <p className="mt-2">
                        <strong>Stalemate:</strong> When a player has no legal moves but their king is not in check. This results in a draw.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="strategy">
                  <AccordionTrigger>Basic Strategy Tips</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Control the center of the board (e4, d4, e5, d5 squares)</li>
                      <li>Develop your pieces (knights and bishops) early</li>
                      <li>Castle early to protect your king</li>
                      <li>Don't move the same piece twice in the opening</li>
                      <li>Think about your opponent's threats before moving</li>
                      <li>Protect your pieces and avoid hanging pieces</li>
                      <li>Look for tactical opportunities (forks, pins, skewers)</li>
                      <li>In the endgame, activate your king</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="chess960">
                  <AccordionTrigger>Chess960 (Fischer Random)</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Chess960 is a variant where the starting position of pieces on the back rank is randomized, with some rules:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Bishops must be on opposite-colored squares</li>
                      <li>King must be between the two rooks</li>
                      <li>All other chess rules apply, including castling</li>
                    </ul>
                    <p className="mt-2">
                      This variant emphasizes creativity and understanding over memorized openings. Use the Chess960 button in the Game section to try it!
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="app">
                  <AccordionTrigger>Using This App</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p><strong>Game Controls:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Click a piece to see its legal moves</li>
                        <li>Click a highlighted square to move</li>
                        <li>Drag and drop pieces to move them</li>
                        <li>Right-click and drag to draw arrows on the board</li>
                        <li>Left-click anywhere to clear arrows</li>
                      </ul>
                      <p className="mt-2"><strong>Features:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Set custom time controls before the game starts</li>
                        <li>Play locally or multiplayer online</li>
                        <li>View move history and captured pieces</li>
                        <li>Change player names in settings</li>
                        <li>Try Chess960 for randomized starting positions</li>
                        <li>Use the PGN Viewer to review games</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default HowToPlay;
