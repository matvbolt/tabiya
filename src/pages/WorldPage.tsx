import { useState } from "react";
import { useI18n } from "../i18n";
import { PLAYERS, EVENTS } from "../content/worldchess";

const ReadMore = ({ text }: { text: string }) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <p className="legend-blurb">{text}</p>}
      <button className="readmore" onClick={() => setOpen((o) => !o)}>
        {open ? t("common.showLess") : t("common.readMore")}
      </button>
    </>
  );
};

const WorldPage = () => {
  const { t, lang } = useI18n();
  const ranked = [...PLAYERS].sort((a, b) => b.rating - a.rating);

  return (
    <div className="world">
      <header className="theory__intro">
        <div className="eyebrow">// {t("nav.world").toLowerCase()}</div>
        <h1>{t("nav.world")}</h1>
        <p className="theory__sub">{t("world.subtitle")}</p>
      </header>

      <section>
        <div className="eyebrow">// {t("world.rankings")}</div>
        <p className="field__hint" style={{ marginTop: -4 }}>
          {t("world.fideNote")}
        </p>
        <div className="rank-list">
          {ranked.map((p, i) => (
            <div className="rank-row panel" key={p.name}>
              <div className="rank-no mono">{i + 1}</div>
              <img className="rank-photo" src={p.photo} alt={p.name} loading="lazy" />
              <div className="rank-id">
                <div className="rank-name">
                  {p.name} <span className="rank-flag">{p.flag}</span>
                </div>
                <div className="rank-note muted">{p.note[lang]}</div>
              </div>
              <div className="rank-elo mono">{p.rating}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="eyebrow">// {t("world.events")}</div>
        <div className="event-list">
          {EVENTS.map((e) => (
            <article className="event-card panel" key={e.name}>
              <div className="event-card__top">
                <h3>{e.name}</h3>
              </div>
              <div className="event-cadence mono">{e.date[lang]}</div>
              <p className="legend-blurb">{e.blurb[lang]}</p>
              <ReadMore text={e.more[lang]} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WorldPage;
