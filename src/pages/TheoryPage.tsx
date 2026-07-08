import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Chess } from "chess.js";
import { useI18n } from "../i18n";
import { OPENINGS } from "../openings/data";
import { PRINCIPLES, OPENING_THEORY, openingName } from "../content/theory";
import MiniBoard from "../components/MiniBoard";

const TheoryPage = () => {
  const { t, lang } = useI18n();
  const [zoomFen, setZoomFen] = useState<string | null>(null);

  useEffect(() => {
    if (!zoomFen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [zoomFen]);

  const fens = useMemo(() => {
    const map: Record<string, string> = {};
    for (const o of OPENINGS) {
      const chess = new Chess();
      for (const san of o.lines[0]) {
        try {
          chess.move(san);
        } catch {
          break;
        }
      }
      map[o.id] = chess.fen();
    }
    return map;
  }, []);

  return (
    <div className="theory">
      <header className="theory__intro">
        <div className="eyebrow">// {t("theory.title").toLowerCase()}</div>
        <h1>{t("theory.title")}</h1>
        <p className="theory__sub">{t("theory.subtitle")}</p>
      </header>

      <section className="panel">
        <h2>{t("theory.principlesTitle")}</h2>
        <ol className="principles">
          {PRINCIPLES[lang].map((p, i) => (
            <li key={i}>
              <span className="principles__no mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="theory__openings">
        {OPENINGS.map((o) => {
          const info = OPENING_THEORY[o.id];
          return (
            <section className="panel theory__opening" key={o.id}>
              <div className="theory__ohead">
                <h2>{openingName(o.id, o.name, lang)}</h2>
                <span className="mono muted">{o.eco}</span>
              </div>
              <div className="theory__row">
                <div className="theory__diagram">
                  <button
                    className="miniboard-btn"
                    onClick={() => setZoomFen(fens[o.id])}
                    aria-label="Enlarge"
                  >
                    <MiniBoard fen={fens[o.id]} size={240} />
                  </button>
                  <div className="theory__meta mono">
                    {t("theory.plays")}:{" "}
                    <b className="accent">
                      {o.you === "white" ? t("white") : t("black")}
                    </b>
                  </div>
                </div>
                <div className="theory__text">
                  {info?.body[lang].map((para, i) => (
                    <p key={i} className="theory__para">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {zoomFen &&
        createPortal(
          <div className="lightbox" onClick={() => setZoomFen(null)}>
            <div className="lightbox__pop">
              <MiniBoard
                fen={zoomFen}
                size={Math.min(
                  440,
                  typeof window !== "undefined"
                    ? Math.min(window.innerWidth - 64, window.innerHeight - 64)
                    : 440
                )}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TheoryPage;
