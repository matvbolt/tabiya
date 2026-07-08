
export type PlayerColor = "white" | "black";

export type Opening = {
  id: string;
  name: string;
  eco: string;

  you: PlayerColor;

  description: string;

  lines: string[][];

  notes?: Record<string, string>;
};

export const OPENINGS: Opening[] = [
  {
    id: "ruy-lopez",
    name: "Ruy Lopez (Spanish)",
    eco: "C60–C99",
    you: "white",
    description: "Pressure e5 through the c6 knight. Slow, deep, positional.",
    lines: [
      "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O".split(" "),
      "e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5".split(" "),
      "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 O-O f6 d4 exd4 Nxd4".split(" "),
    ],
    notes: {
      e4: "Takes the centre and opens lines for the bishop and queen.",
      Nf3: "Develops a piece and attacks the e5 pawn.",
      Bb5: "The Ruy Lopez — pressures the knight that defends e5.",
      Ba4: "Keeps the pin alive while sidestepping ...b5.",
      "O-O": "Castles the king to safety and connects the rooks.",
      Re1: "Backs up the e4 pawn along the open file.",
      Bb3: "Repositions the bishop to eye f7 and the centre.",
      c3: "Prepares d4 to build a broad pawn centre.",
      Bxc6: "Exchange variation — damages Black's pawns for a long-term edge.",
    },
  },
  {
    id: "italian",
    name: "Italian Game",
    eco: "C50–C54",
    you: "white",
    description: "Bishop to c4, aiming at the soft f7 square. Fast, attacking.",
    lines: [
      "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Nbd2".split(" "),
      "e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Bc5 c3 d6 O-O O-O".split(" "),
    ],
    notes: {
      e4: "Takes the centre and frees the bishop and queen.",
      Nf3: "Develops and hits the e5 pawn.",
      Bc4: "The Italian bishop targets the weak f7 square.",
      c3: "Prepares d4 to challenge the centre.",
      d3: "Solid support for e4 and opens the dark-squared bishop.",
      "O-O": "Castles the king to safety.",
      Re1: "Puts a rook behind the e-pawn.",
      Nbd2: "Reroutes the knight toward f1 and g3.",
    },
  },
  {
    id: "london",
    name: "London System",
    eco: "D02",
    you: "white",
    description: "Bishop to f4, the same solid setup against almost anything.",
    lines: [
      "d4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3".split(" "),
      "d4 Nf6 Bf4 d5 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O".split(" "),
      "d4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 O-O Nbd7 h3".split(" "),
    ],
    notes: {
      d4: "Claims the centre.",
      Bf4: "The London bishop — active outside the pawn chain.",
      e3: "Solidifies d4 and opens the light-squared bishop.",
      Nf3: "Develops and controls e5.",
      c3: "Braces the d4 pawn and makes a home for the queen on c2.",
      Nbd2: "Flexible development, eyeing e5 and c4.",
      Bg3: "Preserves the bishop from being traded off.",
      Bd3: "Points the bishop at the kingside.",
      Be2: "Quiet, solid development before castling.",
    },
  },
  {
    id: "sicilian-najdorf",
    name: "Sicilian Defence (Najdorf)",
    eco: "B90",
    you: "black",
    description: "Sharp, ambitious counterattack against 1.e4.",
    lines: [
      "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7 O-O O-O".split(" "),
      "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6 f3 Be7".split(" "),
    ],
    notes: {
      c5: "The Sicilian — fights for the centre on Black's terms.",
      d6: "Controls e5 and prepares ...Nf6.",
      cxd4: "Trades to open the c-file for counterplay.",
      Nf6: "Develops with an attack on the e4 pawn.",
      a6: "The Najdorf move — stops Nb5 and prepares ...b5 and ...e5.",
      e5: "Grabs central space and kicks the d4 knight.",
      Be7: "Develops toward castling.",
      Be6: "Develops the bishop and eyes the c4 square.",
      "O-O": "Tucks the king into safety.",
    },
  },
  {
    id: "caro-kann",
    name: "Caro-Kann Defence",
    eco: "B10–B19",
    you: "black",
    description: "Rock-solid reply to 1.e4 with no pawn weaknesses.",
    lines: [
      "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7".split(" "),
      "e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 O-O Nc6".split(" "),
    ],
    notes: {
      c6: "Prepares ...d5 to challenge the centre without blocking the bishop.",
      d5: "Strikes at the centre with support.",
      dxe4: "Wins the centre pawn cleanly.",
      Bf5: "Develops the bishop actively outside the pawn chain — the point of the Caro.",
      Bg6: "Keeps the bishop safe from the advancing h-pawn.",
      e6: "Solid pawn chain; the bishop is already outside it.",
      Nd7: "Prepares ...Ngf6 without blocking the c-pawn.",
      c5: "Counters White's centre with a pawn break.",
      Nc6: "Develops and pressures d4.",
    },
  },
  {
    id: "queens-gambit",
    name: "Queen's Gambit",
    eco: "D30–D69",
    you: "white",
    description: "Classic 1.d4 fight for the centre with clear plans.",
    lines: [
      "d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6".split(" "),
      "d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4".split(" "),
      "d4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5 O-O a6".split(" "),
    ],
    notes: {
      d4: "Claims the centre.",
      c4: "The Queen's Gambit — challenges d5 to gain central space.",
      Nc3: "Develops and piles pressure on d5.",
      Nf3: "Develops and controls the central squares.",
      Bg5: "Pins the f6 knight, adding pressure on d5.",
      e3: "Opens the bishop and solidifies d4.",
      Bxc4: "Recaptures the gambit pawn with a well-placed bishop.",
      a4: "Stops Black holding the pawn with ...b5.",
      Bh4: "Keeps the pin after ...h6.",
    },
  },
];
