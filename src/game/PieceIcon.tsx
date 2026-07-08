import type { PieceType } from "./material";

const GLYPH: Record<PieceType | "k", string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const FONT =
  '"Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", "Noto Sans Symbols2", serif';

type Props = {
  type: PieceType | "k";
  className?: string;
};

const PieceIcon = ({ type, className }: Props) => {
  return (
    <span className={className} style={{ fontFamily: FONT }} aria-hidden="true">
      {GLYPH[type]}
    </span>
  );
}

export default PieceIcon;
