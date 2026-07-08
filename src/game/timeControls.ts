export type TimeControl = {
  id: string;
  label?: string;
  labelKey?: string;
  base: number;
  inc: number;
};

export const TIME_CONTROLS: TimeControl[] = [
  { id: "off", labelKey: "tc.off", base: 0, inc: 0 },
  { id: "1+0", label: "1+0", base: 60, inc: 0 },
  { id: "3+2", label: "3+2", base: 180, inc: 2 },
  { id: "5+0", label: "5+0", base: 300, inc: 0 },
  { id: "10+0", label: "10+0", base: 600, inc: 0 },
];

export const findTC = (id: string | null | undefined): TimeControl =>
  TIME_CONTROLS.find((t) => t.id === id) ?? TIME_CONTROLS[0];
