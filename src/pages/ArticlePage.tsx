import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { uploadMedia } from "../lib/media";
import { formatDate } from "../lib/format";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";
import { useDialog } from "../ui/DialogProvider";
import {
  getArticle,
  getMyArticleState,
  likeArticle,
  unlockArticle,
  listComments,
  addComment,
  deleteComment,
  updateComment,
  deleteArticle,
  type Article,
  type Comment,
} from "../lib/articles";
import UserName from "../components/UserName";

const renderBody = (body: string) =>
  body.split("\n").map((line, i) => {
    const img = line.trim().match(/^!\[.*?\]\((.+)\)$/);
    if (img)
      return (
        <img key={i} className="content-img" src={img[1]} alt="" loading="lazy" />
      );
    if (line.startsWith("## ")) return <h4 key={i}>{line.slice(3)}</h4>;
    if (line.startsWith("# ")) return <h3 key={i}>{line.slice(2)}</h3>;
    if (line.startsWith("- "))
      return (
        <li key={i} className="article-li">
          {line.slice(2)}
        </li>
      );
    if (!line.trim()) return <div key={i} className="article-gap" />;
    return (
      <p key={i} className="article-p">
        {line}
      </p>
    );
  });

const renderComment = (body: string) =>
  body.split("\n").map((line, i) => {
    const img = line.trim().match(/^!\[.*?\]\((.+)\)$/);
    if (img)
      return (
        <img key={i} className="content-img" src={img[1]} alt="" loading="lazy" />
      );
    if (!line.trim()) return null;
    return (
      <div key={i} className="comment__line">
        {line}
      </div>
    );
  });

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const { t, lang } = useI18n();
  const dialog = useDialog();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [liked, setLiked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const commentFileRef = useRef<HTMLInputElement>(null);

  const attachComment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const { url } = await uploadMedia(user.id, file);
    setUploading(false);
    if (url) setDraft((d) => `${d}${d ? "\n" : ""}![](${url})`);
    if (commentFileRef.current) commentFileRef.current.value = "";
  };

  const load = useCallback(async () => {
    if (!id || !user) return;
    const [a, state, cs] = await Promise.all([
      getArticle(id),
      getMyArticleState(user.id),
      listComments(id),
    ]);
    setArticle(a);
    setLiked(state.likes.has(id));
    setUnlocked(state.unlocks.has(id));
    setComments(cs);
  }, [id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const sendComment = async () => {
    if (!id || !user || !draft.trim()) return;
    await addComment(id, user.id, draft.trim());
    setDraft("");
    setComments(await listComments(id));
  };

  const removeComment = async (cid: string) => {
    if (!id) return;
    await deleteComment(cid);
    setComments(await listComments(id));
  };

  const saveEdit = async () => {
    if (!id || !editId || !editDraft.trim()) return;
    await updateComment(editId, editDraft.trim());
    setEditId(null);
    setEditDraft("");
    setComments(await listComments(id));
  };

  if (!article) return <div className="notice">…</div>;

  const isAuthor = user?.id === article.author_id;
  const locked = article.premium_cost > 0 && !unlocked && !isAuthor;

  const onDelete = async () => {
    if (!id) return;
    const ok = await dialog.confirm({
      message: t("learn.deleteConfirm"),
      confirmLabel: t("learn.delete"),
      cancelLabel: t("common.cancel"),
      danger: true,
    });
    if (!ok) return;
    const { error } = await deleteArticle(id);
    if (error) {
      void dialog.alert(error);
      return;
    }
    navigate("/learn");
  };

  const onLike = async () => {
    if (liked || !id) return;
    setLiked(true);
    await likeArticle(id);
    await Promise.all([load(), refreshProfile()]);
  };

  const onUnlock = async () => {
    if (!id) return;
    if ((profile?.coins ?? 0) < article.premium_cost) {
      void dialog.alert(t("shop.notEnough"), t("coin.name"));
      return;
    }
    const { error } = await unlockArticle(id);
    if (error) {
      void dialog.alert(error, t("coin.name"));
      return;
    }
    setUnlocked(true);
    await Promise.all([load(), refreshProfile()]);
  };

  return (
    <div className="article">
      <Link to="/learn" className="readmore">
        ← {t("learn.back")}
      </Link>
      <header className="article__head">
        <div className="article__headtop">
          {article.tag && <span className="tag mono">{article.tag}</span>}
          {isAuthor && (
            <>
              <button
                className="btn-ghost btn-sm"
                onClick={() => navigate(`/learn/${id}/edit`)}
              >
                {t("learn.edit")}
              </button>
              <button className="btn-ghost btn-sm" onClick={onDelete}>
                {t("learn.delete")}
              </button>
            </>
          )}
        </div>
        <h1>{article.title}</h1>
        <div className="mono muted article__by">
          {t("learn.by")}{" "}
          {article.author ? (
            <UserName
              username={article.author.username}
              badge={article.author.badge}
              style={article.author.name_style}
              userId={article.author_id}
            />
          ) : (
            "—"
          )}{" "}
          · {formatDate(article.created_at, lang)}
          {article.updated_at &&
            article.updated_at !== article.created_at &&
            ` · ${t("learn.edited")} ${formatDate(article.updated_at, lang)}`}
          {" · "}♥ {article.likes} · 💬 {article.comments}
        </div>
        {article.summary && <p className="theory__sub">{article.summary}</p>}
      </header>

      {locked ? (
        <div className="panel article__lock">
          <div className="badge-emoji">🔒</div>
          <p>{t("learn.premium")}</p>
          <button className="btn-primary" onClick={onUnlock}>
            {t("learn.unlock")} ◈ {article.premium_cost}
          </button>
        </div>
      ) : (
        <>
          <article className="panel article__body">
            {renderBody(article.body)}
          </article>
          <div className="article__actions">
            {!isAuthor && (
              <button
                className={liked ? "btn-ghost" : "btn-primary"}
                onClick={onLike}
                disabled={liked}
              >
                ♥ {liked ? t("learn.helped") : t("learn.helpful")}
              </button>
            )}
            <span className="mono muted">♥ {article.likes}</span>
          </div>

          <section className="comments">
            <div className="eyebrow">// {t("learn.comments").toLowerCase()}</div>
            <div className="comment-box">
              <textarea
                className="share-input"
                rows={2}
                value={draft}
                placeholder={t("learn.commentPlaceholder")}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div className="comment-box__actions">
                <button
                  className="clip-btn"
                  title={t("learn.attach")}
                  aria-label={t("learn.attach")}
                  onClick={() => commentFileRef.current?.click()}
                >
                  {uploading ? (
                    "…"
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  )}
                </button>
                <button
                  className="btn-primary btn-sm"
                  disabled={!draft.trim()}
                  onClick={sendComment}
                >
                  {t("learn.send")}
                </button>
                <input
                  ref={commentFileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={attachComment}
                />
              </div>
            </div>
            {comments.length === 0 ? (
              <p className="muted">{t("learn.noComments")}</p>
            ) : (
              <ul className="comment-list">
                {comments.map((c) => (
                  <li key={c.id} className="comment">
                    <div className="comment__head">
                      <span className="mono">
                        {c.author ? (
                          <UserName
                            username={c.author.username}
                            badge={c.author.badge}
                            style={c.author.name_style}
                            userId={c.author_id}
                          />
                        ) : (
                          "—"
                        )}{" "}
                        <span className="comment__date">
                          {formatDate(c.created_at, lang)}
                          {c.updated_at && c.updated_at !== c.created_at
                            ? ` · ${t("learn.edited")}`
                            : ""}
                        </span>
                      </span>
                      <span className="comment__actions">
                        {user?.id === c.author_id && (
                          <button
                            className="comment__del"
                            onClick={() => {
                              setEditId(c.id);
                              setEditDraft(c.body);
                            }}
                          >
                            ✎
                          </button>
                        )}
                        {(user?.id === c.author_id ||
                          user?.id === article.author_id) && (
                          <button
                            className="comment__del"
                            onClick={() => removeComment(c.id)}
                            aria-label="Delete"
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    </div>
                    {editId === c.id ? (
                      <div className="comment-box">
                        <textarea
                          className="share-input"
                          rows={2}
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                        />
                        <div className="comment-box__actions">
                          <button
                            className="btn-ghost btn-sm"
                            onClick={() => setEditId(null)}
                          >
                            {t("common.cancel")}
                          </button>
                          <button
                            className="btn-primary btn-sm"
                            disabled={!editDraft.trim()}
                            onClick={saveEdit}
                          >
                            {t("common.save")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="comment__body">
                        {renderComment(c.body)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default ArticlePage;
