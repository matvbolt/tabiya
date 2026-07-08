import PieceIcon from "../game/PieceIcon";
import type { PieceType } from "../game/material";

const expand = (fen: string): (string | null)[] => {
  const cells: (string | null)[] = [];
  for (const ch of fen.split(" ")[0]) {
    if (ch === "/") continue;
    if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) cells.push(null);
    else cells.push(ch);
  }
  return cells;
};

const MiniBoard = ({ fen, size = 216 }: { fen: string; size?: number }) => {
  const cells = expand(fen);
  const glyph = Math.round((size / 8) * 0.78);
  return (
    <div
      className="miniboard"
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      {cells.map((ch, i) => {
        const file = i % 8;
        const rank = Math.floor(i / 8);
        const dark = (file + rank) % 2 === 1;
        const color = ch ? (ch === ch.toUpperCase() ? "w" : "b") : null;
        return (
          <div key={i} className={`mini-cell${dark ? " is-dark" : ""}`}>
            {ch && (
              <span
                className="mini-piece"
                data-color={color!}
                style={{ fontSize: glyph }}
              >
                <PieceIcon type={ch.toLowerCase() as PieceType | "k"} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MiniBoard;
