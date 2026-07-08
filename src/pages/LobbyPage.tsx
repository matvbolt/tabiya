import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useDialog } from "../ui/DialogProvider";
import {
  quickMatch,
  challengeFriend,
  listIncomingChallenges,
  joinGame,
  type GameMode,
  type Challenge,
} from "../lib/games";
import {
  searchUsers,
  sendRequest,
  acceptRequest,
  removeFriendship,
  listFriendships,
  type FriendProfile,
  type Friendship,
} from "../lib/friends";
import { OPENINGS } from "../openings/data";
import { OPENING_THEORY, openingName } from "../content/theory";
import { supabase } from "../lib/supabase";
import { useI18n } from "../i18n";
import UserName from "../components/UserName";

const LobbyPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const dialog = useDialog();
  const { t, lang } = useI18n();

  const [mode, setMode] = useState<GameMode>("rated");
  const [openingId, setOpeningId] = useState("");
  const [busy, setBusy] = useState(false);

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendProfile[]>([]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [f, c] = await Promise.all([
      listFriendships(user.id),
      listIncomingChallenges(user.id),
    ]);
    setFriends(f);
    setChallenges(c);
  }, [user]);

  useEffect(() => {
    void refresh();
    const ch = supabase
      .channel("lobby")
      .on("broadcast", { event: "refresh" }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(async () => {
      setResults(await searchUsers(query, user.id));
    }, 250);
    return () => clearTimeout(t);
  }, [query, user]);

  const onQuickMatch = async () => {
    if (!user || !profile) return;
    setBusy(true);
    const { id, error } = await quickMatch(user.id, profile.rating, mode);
    setBusy(false);
    if (error) return void dialog.alert(error, t("dlg.error"));
    if (id) navigate(`/game/${id}`);
  }

  const onChallenge = async (friendId: string) => {
    if (!user) return;
    const { id, error } = await challengeFriend(
      user.id,
      friendId,
      mode,
      mode === "training" ? openingId || null : null
    );
    if (error) return void dialog.alert(error, t("dlg.error"));
    if (id) navigate(`/game/${id}`);
  }

  const onAccept = async (c: Challenge) => {
    if (!user) return;
    const { error } = await joinGame(c.game.id, user.id);
    if (error) return void dialog.alert(error, t("dlg.error"));
    navigate(`/game/${c.game.id}`);
  }

  const incomingFriendReqs = friends.filter(
    (f) => f.status === "pending" && f.incoming
  );
  const accepted = friends.filter((f) => f.status === "accepted");
  const pendingSent = friends.filter(
    (f) => f.status === "pending" && !f.incoming
  );
  const friendIds = new Set(friends.map((f) => f.other.id));

  return (
    <div className="lobby">
      {}
      <section className="panel play-panel">
        <div className="eyebrow">// {t("lobby.eyebrow")}</div>
        <h2>{t("lobby.playOnline")}</h2>

        <div className="field">
          <label className="field__label">{t("lobby.mode")}</label>
          <div className="segmented">
            <button
              className={mode === "rated" ? "is-active" : ""}
              onClick={() => setMode("rated")}
            >
              {t("lobby.rated")}
            </button>
            <button
              className={mode === "training" ? "is-active" : ""}
              onClick={() => setMode("training")}
            >
              {t("lobby.training")}
            </button>
          </div>
        </div>

        {mode === "training" && (
          <div className="field">
            <label className="field__label">{t("lobby.openingForHints")}</label>
            <select
              value={openingId}
              onChange={(e) => setOpeningId(e.target.value)}
            >
              <option value="">{t("lobby.noOpening")}</option>
              {OPENINGS.map((o) => (
                <option key={o.id} value={o.id}>
                  {openingName(o.id, o.name, lang)}
                </option>
              ))}
            </select>
            {openingId && (
              <p className="field__hint">
                {OPENING_THEORY[openingId]?.desc[lang]}
              </p>
            )}
          </div>
        )}

        <button
          className="btn-primary btn-big"
          disabled={busy}
          onClick={onQuickMatch}
        >
          {busy ? t("lobby.matching") : t("lobby.findOpponent")}
        </button>
        <p className="field__hint">{t("lobby.matchHint")}</p>
      </section>

      {}
      <section className="lobby__social">
        {challenges.length > 0 && (
          <div className="panel">
            <div className="eyebrow">// {t("lobby.incoming")}</div>
            <ul className="game-list">
              {challenges.map((c) => (
                <li key={c.game.id} className="game-item">
                  <span>
                    <b>{c.from.username}</b>{" "}
                    <span className="mono muted">{c.from.rating}</span> ·{" "}
                    {c.game.mode === "training"
                      ? t("mode.training")
                      : t("mode.rated")}
                  </span>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => onAccept(c)}
                  >
                    {t("lobby.accept")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="panel">
          <div className="eyebrow">// {t("lobby.friends")}</div>
          <input
            className="share-input"
            placeholder={t("lobby.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {results.length > 0 && (
            <ul className="game-list">
              {results.map((r) => (
                <li key={r.id} className="game-item">
                  <span>
                    {r.username} <span className="mono muted">{r.rating}</span>
                  </span>
                  {friendIds.has(r.id) ? (
                    <span className="muted mono">{t("lobby.added")}</span>
                  ) : (
                    <button
                      className="btn-ghost"
                      onClick={async () => {
                        if (user) await sendRequest(user.id, r.id);
                        setQuery("");
                        setResults([]);
                        void refresh();
                      }}
                    >
                      {t("lobby.add")}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {incomingFriendReqs.length > 0 && (
            <>
              <div className="subhead">{t("lobby.requests")}</div>
              <ul className="game-list">
                {incomingFriendReqs.map((f) => (
                  <li key={f.id} className="game-item">
                    <span>{f.other.username}</span>
                    <button
                      className="btn-primary btn-sm"
                      onClick={async () => {
                        await acceptRequest(f.id);
                        void refresh();
                      }}
                    >
                      {t("lobby.accept")}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="subhead">
            {t("lobby.myFriends")}{" "}
            {accepted.length > 0 && `(${accepted.length})`}
          </div>
          {accepted.length === 0 ? (
            <p className="muted">{t("lobby.noFriends")}</p>
          ) : (
            <ul className="game-list">
              {accepted.map((f) => (
                <li key={f.id} className="game-item">
                  <span className="friend-info">
                    <span className="friend-avatar">
                      {f.other.avatar_url ? (
                        <img src={f.other.avatar_url} alt="" />
                      ) : (
                        f.other.username[0]?.toUpperCase()
                      )}
                    </span>
                    <span className="friend-meta">
                      <UserName
                        username={f.other.username}
                        badge={f.other.badge}
                        style={f.other.name_style}
                        userId={f.other.id}
                      />
                      <span className="mono muted friend-rating">
                        {f.other.rating}
                      </span>
                    </span>
                  </span>
                  <div className="row-actions">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => onChallenge(f.other.id)}
                    >
                      {t("lobby.invite")}
                    </button>
                    <button
                      className="btn-ghost btn-sm"
                      onClick={async () => {
                        const ok = await dialog.confirm({
                          title: t("dlg.removeTitle"),
                          message: t("dlg.removeMsg", {
                            name: f.other.username,
                          }),
                          confirmLabel: t("dlg.remove"),
                          danger: true,
                        });
                        if (!ok) return;
                        await removeFriendship(f.id);
                        void refresh();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {pendingSent.length > 0 && (
            <p className="muted mono" style={{ marginTop: 10 }}>
              {t("lobby.sent", { n: pendingSent.length })}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default LobbyPage;
