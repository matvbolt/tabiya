
export type PieceType = "p" | "n" | "b" | "r" | "q";

const INITIAL: Record<PieceType, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const VALUE: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const ORDER: PieceType[] = ["q", "r", "b", "n", "p"];

export type Captured = {

  byWhite: PieceType[];

  byBlack: PieceType[];

  diff: number;
};

export const capturedFromFen = (fen: string) : Captured => {
  const placement = fen.split(" ")[0];
  const white: Record<string, number> = {};
  const black: Record<string, number> = {};
  for (const ch of placement) {
    if (/[pnbrq]/i.test(ch)) {
      const t = ch.toLowerCase();
      if (ch === ch.toUpperCase()) white[t] = (white[t] ?? 0) + 1;
      else black[t] = (black[t] ?? 0) + 1;
    }
  }

  const byWhite: PieceType[] = [];
  const byBlack: PieceType[] = [];
  let diff = 0;
  for (const t of ORDER) {
    const missingBlack = INITIAL[t] - (black[t] ?? 0);
    const missingWhite = INITIAL[t] - (white[t] ?? 0);
    for (let i = 0; i < missingBlack; i++) byWhite.push(t);
    for (let i = 0; i < missingWhite; i++) byBlack.push(t);
    diff += missingBlack * VALUE[t] - missingWhite * VALUE[t];
  }
  return { byWhite, byBlack, diff };
}
