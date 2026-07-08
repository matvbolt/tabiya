type Props = {
  ms: number;
  active: boolean;
};

const Clock = ({ ms, active }: Props) => {
  const low = ms > 0 && ms <= 20000;
  const out = ms <= 0;
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return (
    <div
      className={`clock mono${active ? " is-active" : ""}${
        low ? " is-low" : ""
      }${out ? " is-out" : ""}`}
    >
      {m}:{String(s).padStart(2, "0")}
    </div>
  );
}

export default Clock;
