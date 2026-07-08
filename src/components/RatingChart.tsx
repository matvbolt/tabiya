import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import { formatDate } from "../lib/format";
import type { Lang } from "../i18n";

type Event = { delta: number; created_at: string };

type Bucket = { key: string; delta: number; label: string; full: string };

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

const bucketize = (
  events: Event[],
  mode: "day" | "month",
  lang: Lang
): Bucket[] => {
  const map = new Map<string, number>();
  for (const e of events) {
    const iso = new Date(e.created_at).toISOString();
    const key = mode === "day" ? iso.slice(0, 10) : iso.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + e.delta);
  }
  const keys = [...map.keys()].sort();
  const recent = keys.slice(mode === "day" ? -14 : -12);
  return recent.map((k) => ({
    key: k,
    delta: map.get(k)!,
    label: mode === "day" ? k.slice(5) : k.slice(2),
    full:
      mode === "day"
        ? formatDate(k, lang)
        : new Date(`${k}-01`).toLocaleDateString(
            lang === "ru" ? "ru-RU" : "en-US",
            { month: "long", year: "numeric" }
          ),
  }));
};

const RatingChart = ({ events }: { events: Event[] }) => {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<"day" | "month">("day");
  const buckets = useMemo(() => bucketize(events, mode, lang), [events, mode, lang]);
  const max = Math.max(1, ...buckets.map((b) => Math.abs(b.delta)));

  return (
    <section className="panel">
      <div className="chart-head">
        <div className="eyebrow" style={{ margin: 0 }}>
          // {t("chart.title")}
        </div>
        <div className="segmented chart-toggle">
          <button
            className={mode === "day" ? "is-active" : ""}
            onClick={() => setMode("day")}
          >
            {t("chart.days")}
          </button>
          <button
            className={mode === "month" ? "is-active" : ""}
            onClick={() => setMode("month")}
          >
            {t("chart.months")}
          </button>
        </div>
      </div>

      {buckets.length === 0 ? (
        <p className="muted">{t("chart.empty")}</p>
      ) : (
        <div className="chart">
          {buckets.map((b) => (
            <div className="chart__col" key={b.key}>
              <div className="chart__tip">
                <div className="chart__tip-date">{b.full}</div>
                <div
                  className="chart__tip-val mono"
                  data-sign={b.delta > 0 ? "up" : b.delta < 0 ? "down" : "flat"}
                >
                  Δ {signed(b.delta)}
                </div>
              </div>
              <div className="chart__pos">
                {b.delta > 0 && (
                  <div
                    className="chart__bar up"
                    style={{ height: `${(Math.abs(b.delta) / max) * 100}%` }}
                  />
                )}
              </div>
              <div className="chart__axis" />
              <div className="chart__neg">
                {b.delta < 0 && (
                  <div
                    className="chart__bar down"
                    style={{ height: `${(Math.abs(b.delta) / max) * 100}%` }}
                  />
                )}
              </div>
              <div className="chart__label mono">{b.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RatingChart;
