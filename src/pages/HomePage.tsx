import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { useAuth } from "../auth/AuthContext";

const HomePage = () => {
  const { t, lang } = useI18n();
  const { configured } = useAuth();
  const ru = lang === "ru";

  const features = [
    {
      no: "01",
      icon: "♟",
      title: ru ? "Онлайн-игра" : "Play online",
      text: ru
        ? "Рейтинговые партии и тренировки. Матчмейкинг по ближайшему рейтингу или вызов друга. Ходы летят в реальном времени."
        : "Rated games and training. Matchmaking by closest rating or challenge a friend. Moves sync in real time.",
    },
    {
      no: "02",
      icon: "🤖",
      title: ru ? "Бот и подсказки" : "Bot & hints",
      text: ru
        ? "Игра со Stockfish на выбранном уровне и контроле времени. Стрелки-подсказки: из теории дебюта или от движка с объяснением."
        : "Play Stockfish at your level and time control. Arrow hints from opening theory or the engine, with a reason why.",
    },
    {
      no: "03",
      icon: "📖",
      title: ru ? "Теория и тактика" : "Theory & tactics",
      text: ru
        ? "Принципы дебюта и разбор каждой системы с диаграммами. Учись играть по знаменитым схемам."
        : "Opening principles and every system explained with diagrams. Learn to play by famous setups.",
    },
    {
      no: "04",
      icon: "◈",
      title: ru ? "Валюта ChessCoin" : "ChessCoin currency",
      text: ru
        ? "Зарабатывай монеты за игры и полезные статьи. Трать на кастомизацию профиля — бейджи, цвета ника — и реальные скидки партнёров."
        : "Earn coins from games and helpful articles. Spend on profile customization — badges, nickname colors — and real partner discounts.",
    },
    {
      no: "05",
      icon: "🎓",
      title: ru ? "Обучение и заработок" : "Learn & Earn",
      text: ru
        ? "Читай гайды сообщества и получай монеты за полезное. Пиши свои статьи — и зарабатывай, когда их читают."
        : "Read community guides and earn coins for helpful reads. Write your own and get paid when readers unlock them.",
    },
    {
      no: "06",
      icon: "🏆",
      title: ru ? "Мир шахмат" : "Chess world",
      text: ru
        ? "Зал славы легенд с рейтингами и титулами и календарь реальных предстоящих чемпионатов."
        : "A hall of fame of legends with ratings and titles, plus a calendar of real upcoming championships.",
    },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="eyebrow">// tabiya</div>
        <h1 className="hero__title">
          {t("home.hero1")}
          <br />
          <span className="accent">{t("home.hero2")}</span>
        </h1>
        <p className="hero__sub">{t("home.heroSub")}</p>
        {configured && (
          <div className="hero__cta">
            <Link to="/lobby" className="btn-primary btn-big">
              {t("home.cta1")}
            </Link>
            <Link to="/play/bot" className="btn-secondary btn-big">
              {t("home.cta2")}
            </Link>
          </div>
        )}
      </section>

      <section className="home-features">
        {features.map((f) => (
          <div className="feature" key={f.no}>
            <div className="feature__no mono">{f.no}</div>
            <div className="feature__icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
