import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { supabase } from "../lib/supabase";
import UserName from "../components/UserName";
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

type PlatRow = {
  id: string;
  username: string;
  badge: string | null;
  name_style: string | null;
  avatar_url: string | null;
  rating: number;
};

const WorldPage = () => {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<"platform" | "world">("platform");
  const [sub, setSub] = useState<"events" | "ratings">("events");
  const [platform, setPlatform] = useState<PlatRow[]>([]);
  const ranked = [...PLAYERS].sort((a, b) => b.rating - a.rating).slice(0, 30);

  useEffect(() => {
    if (tab !== "platform") return;
    supabase
      .from("profiles")
      .select("id, username, badge, name_style, avatar_url, rating")
      .order("rating", { ascending: false })
      .limit(50)
      .then(({ data }) => setPlatform((data as PlatRow[]) ?? []));
  }, [tab]);

  return (
    <div className="world">
      <header className="theory__intro">
        <div className="eyebrow">// {t("nav.world").toLowerCase()}</div>
        <h1>{t("nav.world")}</h1>
        <div className="segmented world-tabs">
          <button
            className={tab === "platform" ? "is-active" : ""}
            onClick={() => setTab("platform")}
          >
            {t("world.tabPlatform")}
          </button>
          <button
            className={tab === "world" ? "is-active" : ""}
            onClick={() => setTab("world")}
          >
            {t("world.tabWorld")}
          </button>
        </div>
      </header>

      {tab === "platform" ? (
        <section>
          <div className="eyebrow">// {t("world.tabPlatform")}</div>
          <p className="field__hint" style={{ marginTop: -4 }}>
            {t("world.platformNote")}
          </p>
          {platform.length === 0 ? (
            <p className="muted">{t("world.platformEmpty")}</p>
          ) : (
            <div className="rank-list">
              {platform.map((p, i) => (
                <div className="rank-row panel" key={p.id}>
                  <div className="rank-no mono">{i + 1}</div>
                  {p.avatar_url ? (
                    <img className="rank-photo" src={p.avatar_url} alt="" loading="lazy" />
                  ) : (
                    <div className="rank-photo rank-photo--mono">
                      {p.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="rank-id">
                    <div className="rank-name">
                      <UserName
                        username={p.username}
                        badge={p.badge}
                        style={p.name_style}
                        userId={p.id}
                      />
                    </div>
                  </div>
                  <div className="rank-elo mono">{p.rating}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="segmented world-subtabs">
            <button
              className={sub === "events" ? "is-active" : ""}
              onClick={() => setSub("events")}
            >
              {t("world.subEvents")}
            </button>
            <button
              className={sub === "ratings" ? "is-active" : ""}
              onClick={() => setSub("ratings")}
            >
              {t("world.subRatings")}
            </button>
          </div>

          {sub === "events" ? (
            <section>
              <div className="eyebrow">// {t("world.events")}</div>
              <div className="event-list">
                {EVENTS.map((e) => (
                  <article className="event-card panel" key={e.name}>
                    <div className="event-card__top">
                      <h3>{lang === "ru" ? e.nameRu : e.name}</h3>
                    </div>
                    <div className="event-cadence mono">{e.date[lang]}</div>
                    <p className="legend-blurb">{e.blurb[lang]}</p>
                    <ReadMore text={e.more[lang]} />
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div className="eyebrow">// {t("world.rankings")}</div>
              <p className="field__hint" style={{ marginTop: -4 }}>
                {t("world.fideNote")}
              </p>
              <div className="rank-list">
                {ranked.map((p, i) => (
                  <div className="rank-row panel" key={p.name}>
                    <div className="rank-no mono">{i + 1}</div>
                    {p.photo ? (
                      <img
                        className="rank-photo"
                        src={p.photo}
                        alt={p.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="rank-photo rank-photo--mono">
                        {(lang === "ru" ? p.nameRu : p.name)[0]}
                      </div>
                    )}
                    <div className="rank-id">
                      <div className="rank-name">
                        {lang === "ru" ? p.nameRu : p.name}{" "}
                        <span className="rank-flag">{p.flag}</span>
                      </div>
                      {p.note && (
                        <div className="rank-note muted">{p.note[lang]}</div>
                      )}
                    </div>
                    <div className="rank-elo mono">{p.rating}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default WorldPage;
