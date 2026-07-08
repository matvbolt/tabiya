import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useI18n } from "../i18n";
import RatingChart from "../components/RatingChart";

type Pub = {
  username: string;
  badge: string | null;
  name_style: string | null;
  avatar_url: string | null;
  rating: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
};

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

const PublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [p, setP] = useState<Pub | null>(null);
  const [events, setEvents] = useState<{ delta: number; created_at: string }[]>(
    []
  );

  useEffect(() => {
    if (!id) return;
    supabase
      .from("profiles")
      .select(
        "username, badge, name_style, avatar_url, rating, games_played, wins, losses, draws"
      )
      .eq("id", id)
      .single()
      .then(({ data }) => setP(data as Pub));
    supabase
      .from("rating_events")
      .select("delta, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setEvents(data ?? []));
  }, [id]);

  if (!p) return <div className="notice">…</div>;

  const winRate =
    p.games_played > 0 ? Math.round((p.wins / p.games_played) * 100) : 0;
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30 = events
    .filter((e) => new Date(e.created_at).getTime() >= cutoff)
    .reduce((s, e) => s + e.delta, 0);
  const allTime = events.reduce((s, e) => s + e.delta, 0);

  return (
    <div className="profile">
      <section className="panel profile__card">
        <div className="avatar avatar--static">
          {p.avatar_url ? (
            <img src={p.avatar_url} alt={p.username} />
          ) : (
            p.username[0]?.toUpperCase()
          )}
        </div>
        <div>
          <div className="eyebrow">// {t("profile.player")}</div>
          <h2>
            {p.badge && <span className="user-badge">{p.badge}</span>}
            <span className={p.name_style ? `name-${p.name_style}` : undefined}>
              {p.username}
            </span>
          </h2>
          <div className="rating-big">{p.rating}</div>
          <div className="mono muted">{t("profile.elo")}</div>
        </div>
      </section>

      <section className="panel">
        <div className="eyebrow">// {t("profile.movement")}</div>
        <div className="rating-move">
          <div className="move-tile">
            <div
              className="move-tile__val"
              data-sign={last30 > 0 ? "up" : last30 < 0 ? "down" : "flat"}
            >
              {signed(last30)}
            </div>
            <div className="move-tile__label">{t("profile.last30")}</div>
          </div>
          <div className="move-tile">
            <div
              className="move-tile__val"
              data-sign={allTime > 0 ? "up" : allTime < 0 ? "down" : "flat"}
            >
              {signed(allTime)}
            </div>
            <div className="move-tile__label">{t("profile.allTime")}</div>
          </div>
        </div>
      </section>

      <RatingChart events={events} />

      <section className="stat-grid">
        <div className="stat-tile">
          <div className="stat-tile__val">{p.games_played}</div>
          <div className="stat-tile__label">{t("profile.games")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__val w">{p.wins}</div>
          <div className="stat-tile__label">{t("profile.wins")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__val l">{p.losses}</div>
          <div className="stat-tile__label">{t("profile.losses")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__val">{p.draws}</div>
          <div className="stat-tile__label">{t("profile.draws")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__val">{winRate}%</div>
          <div className="stat-tile__label">{t("profile.winRate")}</div>
        </div>
      </section>
    </div>
  );
};

export default PublicProfilePage;
