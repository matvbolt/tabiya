import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";
import { uploadAvatar } from "../lib/avatar";
import RatingChart from "../components/RatingChart";
import { useI18n } from "../i18n";

const K_FACTOR = 32;

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

const ProfilePage = () => {
  const { user, profile, updateAvatar } = useAuth();
  const { t } = useI18n();
  const [events, setEvents] = useState<{ delta: number; created_at: string }[]>(
    []
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("rating_events")
      .select("delta, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setEvents(data ?? []));
  }, [user]);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const { url, error } = await uploadAvatar(user.id, file);
    if (url && !error) await updateAvatar(url);
    setUploading(false);
  };

  if (!profile) return <div className="notice">{t("profile.loading")}</div>;

  const winRate =
    profile.games_played > 0
      ? Math.round((profile.wins / profile.games_played) * 100)
      : 0;

  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30 = events
    .filter((e) => new Date(e.created_at).getTime() >= cutoff)
    .reduce((s, e) => s + e.delta, 0);
  const allTime = events.reduce((s, e) => s + e.delta, 0);
  const per = Math.round(K_FACTOR / 2);

  return (
    <div className="profile">
      <section className="panel profile__card">
        <button
          className="avatar avatar--edit"
          onClick={() => fileRef.current?.click()}
          title={t("set.upload")}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} />
          ) : (
            profile.username[0]?.toUpperCase()
          )}
          <span className="avatar__hint">
            {uploading ? t("set.uploading") : t("set.upload")}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onPickFile}
        />
        <div>
          <div className="eyebrow">// {t("profile.player")}</div>
          <h2>
            {profile.badge && (
              <span className="user-badge">{profile.badge}</span>
            )}
            <span
              className={
                profile.name_style ? `name-${profile.name_style}` : undefined
              }
            >
              {profile.username}
            </span>
          </h2>
          <div className="rating-big">{profile.rating}</div>
          <div className="mono muted">{t("profile.elo")}</div>
          <Link to="/shop" className="btn-secondary btn-sm profile__customize">
            ✦ {t("profile.customize")}
          </Link>
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
        <p className="field__hint">
          {t("profile.explain", { k: K_FACTOR, per })}
        </p>
      </section>

      <RatingChart events={events} />

      <section className="stat-grid">
        <div className="stat-tile">
          <div className="stat-tile__val">{profile.games_played}</div>
          <div className="stat-tile__label">{t("profile.games")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__val w">{profile.wins}</div>
          <div className="stat-tile__label">{t("profile.wins")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__val l">{profile.losses}</div>
          <div className="stat-tile__label">{t("profile.losses")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__val">{profile.draws}</div>
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

export default ProfilePage;
