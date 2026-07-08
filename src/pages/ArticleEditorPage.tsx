import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";
import { createArticle, updateArticle, getArticle } from "../lib/articles";
import { uploadMedia } from "../lib/media";

const ArticleEditorPage = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");
  const [cost, setCost] = useState(0);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    void getArticle(id).then((a) => {
      if (!a) return;
      if (a.author_id !== user.id) {
        navigate(`/learn/${id}`);
        return;
      }
      setTitle(a.title);
      setSummary(a.summary ?? "");
      setBody(a.body);
      setTag(a.tag ?? "");
      setCost(a.premium_cost);
    });
  }, [id, user, navigate]);

  const attach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const { url } = await uploadMedia(user.id, file);
    setUploading(false);
    if (url) setBody((b) => `${b}${b ? "\n\n" : ""}![](${url})\n`);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const fields = {
      title: title.trim(),
      summary: summary.trim(),
      body,
      tag: tag.trim(),
      premium_cost: Math.max(0, Math.round(cost)),
    };
    if (editing && id) {
      await updateArticle(id, fields);
      setBusy(false);
      navigate(`/learn/${id}`);
    } else {
      const { id: newId } = await createArticle(user.id, fields);
      setBusy(false);
      if (newId) navigate(`/learn/${newId}`);
    }
  };

  return (
    <div className="editor">
      <button type="button" className="readmore" onClick={() => navigate(-1)}>
        ← {t("learn.back")}
      </button>
      <header className="theory__intro">
        <div className="eyebrow">
          // {(editing ? t("learn.editArticle") : t("learn.write")).toLowerCase()}
        </div>
        <h1>{editing ? t("learn.editArticle") : t("learn.write")}</h1>
      </header>

      <form className="panel editor__form" onSubmit={submit}>
        <div className="field">
          <label className="field__label">{t("learn.title2")}</label>
          <input
            className="share-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="field__label">{t("learn.summary")}</label>
          <input
            className="share-input"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field__label">{t("learn.body")}</label>
          <textarea
            className="share-input editor__body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            required
          />
          <button
            type="button"
            className="clip-btn"
            style={{ marginTop: 8 }}
            title={t("learn.attach")}
            aria-label={t("learn.attach")}
            onClick={() => fileRef.current?.click()}
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
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={attach}
          />
        </div>
        <div className="editor__row">
          <div className="field">
            <label className="field__label">{t("learn.tag")}</label>
            <input
              className="share-input"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="tactics"
            />
          </div>
          <div className="field">
            <label className="field__label">{t("learn.premiumCost")}</label>
            <input
              className="share-input"
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="editor__actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            {t("common.cancel")}
          </button>
          <button
            className="btn-primary"
            disabled={busy || !title.trim() || !body.trim()}
          >
            {editing ? t("learn.saveChanges") : t("learn.publish")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditorPage;
