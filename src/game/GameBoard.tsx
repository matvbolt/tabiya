import type { CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import type { Arrow } from "react-chessboard";

type Props = {
  fen: string;
  orientation: "white" | "black";
  arrows?: Arrow[];
  interactive?: boolean;
  squareStyles?: Record<string, CSSProperties>;
  onPieceDrop?: (args: {
    sourceSquare: string;
    targetSquare: string | null;
  }) => boolean;
};

const GameBoard = ({
  fen,
  orientation,
  arrows = [],
  interactive = true,
  squareStyles,
  onPieceDrop,
}: Props) => {
  return (
    <Chessboard
      options={{
        id: "board",
        position: fen,
        boardOrientation: orientation,
        arrows,
        squareStyles,
        allowDrawingArrows: true,
        animationDurationInMs: 200,
        allowDragging: interactive,
        onPieceDrop: onPieceDrop
          ? ({ sourceSquare, targetSquare }) =>
              onPieceDrop({ sourceSquare, targetSquare })
          : undefined,
        darkSquareStyle: { backgroundColor: "#4a4034" },
        lightSquareStyle: { backgroundColor: "#b6a184" },
      }}
    />
  );
}

export default GameBoard;
