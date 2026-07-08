import type { CSSProperties } from "react";
import type { Chess } from "chess.js";

const CHECK_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle, rgba(248,113,113,0.9) 0%, rgba(248,113,113,0.3) 70%)",
  animation: "checkBlink 0.85s ease-in-out infinite",
};

const MATE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle, rgba(248,113,113,0.95) 0%, rgba(248,113,113,0.45) 75%)",
  boxShadow: "inset 0 0 0 3px #f87171",
};

const kingSquare = (game: Chess, color: "w" | "b"): string | null => {
  for (const row of game.board())
    for (const cell of row)
      if (cell && cell.type === "k" && cell.color === color) return cell.square;
  return null;
};

export const checkHighlight = (game: Chess): Record<string, CSSProperties> => {
  if (!game.isCheck()) return {};
  const square = kingSquare(game, game.turn());
  if (!square) return {};
  return { [square]: game.isCheckmate() ? MATE_STYLE : CHECK_STYLE };
};

export const kingRed = (
  game: Chess,
  color: "w" | "b"
): Record<string, CSSProperties> => {
  const square = kingSquare(game, color);
  return square ? { [square]: MATE_STYLE } : {};
};
