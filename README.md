# Chess960 (Fischer Random Chess)

**Overview**

Chess960, also known as Fischer Random Chess, is a chess variant created by Bobby Fischer that randomizes the starting arrangement of the back-rank pieces. There are 960 legally distinct starting positions that follow a small set of rules. The variant reduces the advantage of memorized opening lines and emphasizes creativity, general chess understanding, and over-the-board skill.

**Key rules**

- Both sides’ pawns are placed on their usual ranks (second and seventh ranks).
- The back-rank pieces (king, queen, two rooks, two bishops, two knights) are shuffled subject to:
	- The two bishops must be placed on opposite-colored squares.
	- The king must be placed on a square between the two rooks (so castling remains possible).
- These constraints produce exactly 960 legal starting setups.

**Castling in Chess960**

Castling is preserved in Chess960, but its implementation is adapted to the randomized starting files:

- After kingside castling, the king and rook end up on the same squares they would on a standard chessboard (king on `g1`/`g8`, rook on `f1`/`f8`).
- After queenside castling, the king and rook end up on the same squares they would on a standard chessboard (king on `c1`/`c8`, rook on `d1`/`d8`).
- The usual castling rules still apply: the king and rook involved must not have moved, the king may not be in check, and the king may not pass through or end on a square attacked by an enemy piece. Tournament rulebooks and online platforms provide precise, authoritative wording for any edge cases.

**Notation & FEN**

Chess960 positions can be represented using FEN the same way as standard chess. Many chess GUIs and online sites accept a FEN string and a Chess960 mode flag. Some communities also index the 960 starting positions with numbers (0–959) for quick reference.

**Why play Chess960?**

- Reduces rote memorization of opening theory.
- Rewards original thinking and general chess skill.
- Creates fresh and varied games where typical opening patterns are less predictable.

**Practical tips**

- Focus on king safety and piece development — the priorities of classical chess still apply.
- Be flexible: unusual piece placements create novel tactical and positional opportunities.
- Learn how castling behaves for many different starts so you don’t miss opportunities or make illegal attempts.

**Resources & where to play**

- Lichess and Chess.com both support Chess960 for casual play and rated games.
- Search for “Fischer Random Chess” or consult tournament rulebooks for authoritative castling details.

---

If you want, I can also append the styled HTML/CSS card to this README, or add a short banner blurb suitable for a project description. Tell me which you'd prefer.

