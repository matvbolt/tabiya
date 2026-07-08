import { Chess } from "chess.js";
import type { Opening } from "./data";

export type BookMove = {
  from: string;
  to: string;
  san: string;
  promotion?: string;
};

export const fenKey = (fen: string) : string => {
  return fen.split(" ").slice(0, 4).join(" ");
}

export const buildBook = (opening: Opening) : Map<string, BookMove> => {
  const book = new Map<string, BookMove>();
  for (const line of opening.lines) {
    const chess = new Chess();
    for (const san of line) {
      const key = fenKey(chess.fen());
      let move;
      try {
        move = chess.move(san);
      } catch {
        break;
      }
      if (!move) break;
      if (!book.has(key)) {
        book.set(key, {
          from: move.from,
          to: move.to,
          san: move.san,
          promotion: move.promotion,
        });
      }
    }
  }
  return book;
}
