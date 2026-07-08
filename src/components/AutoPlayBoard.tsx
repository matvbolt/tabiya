import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Chess } from "chess.js";
import PieceIcon from "../game/PieceIcon";
import type { PieceType } from "../game/material";

type Kind = PieceType | "k";
type Piece = {
  id: number;
  square: string;
  type: Kind;
  color: "w" | "b";
  captured?: boolean;
};

const FILES = "abcdefgh";
const xy = (square: string) => ({
  x: FILES.indexOf(square[0]),
  y: 8 - Number(square[1]),
});

let idSeq = 1;

const piecesFrom = (chess: Chess) : Piece[] => {
  const out: Piece[] = [];
  for (const row of chess.board())
    for (const cell of row)
      if (cell)
        out.push({
          id: idSeq++,
          square: cell.square,
          type: cell.type as Kind,
          color: cell.color,
        });
  return out;
}

const chooseMove = (chess: Chess) => {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  const center = new Set(["d4", "e4", "d5", "e5"]);
  let best = moves[0];
  let bestScore = -Infinity;
  for (const m of moves) {
    let s = Math.random() * 2;
    if (m.san.includes("x")) s += 3;
    if (m.san.includes("+") || m.san.includes("#")) s += 2.5;
    if (m.promotion) s += 2;
    if (center.has(m.to)) s += 1;
    if (s > bestScore) {
      bestScore = s;
      best = m;
    }
  }
  return best;
}

const AutoPlayBoard = () => {
  const [pieces, setPieces] = useState<Piece[]>(() => piecesFrom(new Chess()));
  const chessRef = useRef(new Chess());
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;

    const step = () => {
      if (!alive) return;
      const chess = chessRef.current;

      if (chess.isGameOver() || chess.history().length > 70) {
        setPieces((ps) => ps.map((p) => ({ ...p, captured: true })));
        timer.current = window.setTimeout(() => {
          if (!alive) return;
          chessRef.current = new Chess();
          setPieces(piecesFrom(chessRef.current));
          timer.current = window.setTimeout(step, 1400);
        }, 1200);
        return;
      }

      const m = chooseMove(chess);
      if (!m) return;
      chess.move(m);

      setPieces((prev) => {
        let next = prev.map((p) => ({ ...p }));

        if (m.captured) {
          const capSq = m.flags.includes("e") ? m.to[0] + m.from[1] : m.to;
          next = next.map((p) =>
            p.square === capSq && !p.captured ? { ...p, captured: true } : p
          );
        }

        next = next.map((p) =>
          p.square === m.from && !p.captured
            ? { ...p, square: m.to, type: (m.promotion ?? p.type) as Kind }
            : p
        );

        if (m.flags.includes("k") || m.flags.includes("q")) {
          const rank = m.from[1];
          const rookFrom = (m.flags.includes("k") ? "h" : "a") + rank;
          const rookTo = (m.flags.includes("k") ? "f" : "d") + rank;
          next = next.map((p) =>
            p.square === rookFrom && !p.captured
              ? { ...p, square: rookTo }
              : p
          );
        }

        return next;
      });

      window.setTimeout(() => {
        if (alive) setPieces((ps) => ps.filter((p) => !p.captured));
      }, 700);

      timer.current = window.setTimeout(step, 1300 + Math.random() * 600);
    };

    timer.current = window.setTimeout(step, 1200);
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return createPortal(
    <div className="apb" aria-hidden="true">
      <div className="apb__board">
        {Array.from({ length: 64 }).map((_, i) => {
          const file = i % 8;
          const rank = Math.floor(i / 8);
          const dark = (file + rank) % 2 === 1;
          return (
            <div key={i} className={`apb__cell${dark ? " is-dark" : ""}`} />
          );
        })}
        {pieces.map((p) => {
          const { x, y } = xy(p.square);
          return (
            <div
              key={p.id}
              className={`apb__piece${p.captured ? " is-captured" : ""}`}
              data-color={p.color}
              style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}
            >
              <PieceIcon type={p.type} />
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
}

export default AutoPlayBoard;
