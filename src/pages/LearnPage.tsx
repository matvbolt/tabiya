import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { listArticles, type Article } from "../lib/articles";
import UserName from "../components/UserName";
import { formatDate } from "../lib/format";

const LearnPage = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    void listArticles().then(setArticles);
  }, []);

  return (
    <div className="learn">
      <header className="theory__intro learn__head">
        <div>
          <div className="eyebrow">// {t("learn.title").toLowerCase()}</div>
          <h1>{t("learn.title")}</h1>
          <p className="theory__sub">{t("learn.subtitle")}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/learn/new")}>
          {t("learn.write")}
        </button>
      </header>

      {articles.length === 0 ? (
        <p className="muted">{t("learn.empty")}</p>
      ) : (
        <div className="article-grid">
          {articles.map((a) => (
            <Link to={`/learn/${a.id}`} className="article-card panel" key={a.id}>
              <div className="article-card__top">
                {a.tag && <span className="tag mono">{a.tag}</span>}
                {a.premium_cost > 0 && (
                  <span className="tag tag--premium mono">
                    ◈ {a.premium_cost}
                  </span>
                )}
              </div>
              <h3>{a.title}</h3>
              <p className="legend-blurb">{a.summary}</p>
              <div className="article-card__foot mono muted">
                {t("learn.by")}{" "}
                {a.author ? (
                  <UserName
                    username={a.author.username}
                    badge={a.author.badge}
                    style={a.author.name_style}
                  />
                ) : (
                  "—"
                )}
                <span>
                  {" "}
                  · {formatDate(a.created_at, lang)} · ♥ {a.likes} · 💬{" "}
                  {a.comments}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <p className="field__hint" style={{ maxWidth: 640 }}>
        {lang === "ru"
          ? "Отмечай статьи полезными, чтобы получать ChessCoin. Авторы зарабатывают, когда их читают и открывают премиум."
          : "Mark articles helpful to earn ChessCoin. Authors earn when readers like and unlock their work."}
      </p>
    </div>
  );
};

export default LearnPage;
