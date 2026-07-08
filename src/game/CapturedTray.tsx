import type { PieceType } from "./material";
import PieceIcon from "./PieceIcon";

type Props = {

  pieces: PieceType[];

  pieceColor: "white" | "black";

  advantage?: number;

  label: string;
};

const CapturedTray = ({
  pieces,
  pieceColor,
  advantage,
  label,
}: Props) => {
  return (
    <div className="captured" data-color={pieceColor}>
      <span className="captured__label mono">{label}</span>
      <span className="captured__pieces">
        {pieces.length === 0 ? (
          <span className="captured__empty mono">—</span>
        ) : (
          pieces.map((t, i) => (
            <PieceIcon key={i} type={t} className="captured__glyph" />
          ))
        )}
      </span>
      {advantage != null && advantage > 0 && (
        <span className="captured__adv mono">+{advantage}</span>
      )}
    </div>
  );
}

export default CapturedTray;
