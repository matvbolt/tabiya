import { useState } from "react";
import { useI18n } from "../i18n";
import { useTheme } from "../theme";
import { useAuth } from "../auth/AuthContext";
import PasswordInput from "../components/PasswordInput";

const SettingsPage = () => {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { profile, updateUsername, updatePassword } = useAuth();

  const [username, setUsername] = useState(profile?.username ?? "");
  const [password, setPassword] = useState("");
  const [nameMsg, setNameMsg] = useState<string | null>(null);
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const saveName = async () => {
    setBusy(true);
    setNameMsg(null);
    const { error } = await updateUsername(username.trim());
    setNameMsg(error ?? t("set.saved"));
    setBusy(false);
  };

  const savePass = async () => {
    setBusy(true);
    setPassMsg(null);
    const { error } = await updatePassword(password);
    setPassMsg(error ?? t("set.saved"));
    if (!error) setPassword("");
    setBusy(false);
  };

  return (
    <div className="settings">
      <header className="theory__intro">
        <div className="eyebrow">// {t("set.title").toLowerCase()}</div>
        <h1>{t("set.title")}</h1>
      </header>

      <section className="panel">
        <div className="eyebrow">// {t("set.appearance")}</div>

        <div className="field">
          <label className="field__label">{t("set.theme")}</label>
          <div className="segmented">
            <button
              className={theme === "dark" ? "is-active" : ""}
              onClick={() => setTheme("dark")}
            >
              {t("set.dark")}
            </button>
            <button
              className={theme === "light" ? "is-active" : ""}
              onClick={() => setTheme("light")}
            >
              {t("set.light")}
            </button>
          </div>
        </div>

        <div className="field">
          <label className="field__label">{t("set.language")}</label>
          <div className="segmented">
            <button
              className={lang === "en" ? "is-active" : ""}
              onClick={() => setLang("en")}
            >
              English
            </button>
            <button
              className={lang === "ru" ? "is-active" : ""}
              onClick={() => setLang("ru")}
            >
              Русский
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="eyebrow">// {t("set.account")}</div>

        <div className="field">
          <label className="field__label">{t("set.username")}</label>
          <div className="row-inline">
            <input
              className="share-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              className="btn-primary btn-sm"
              disabled={busy || !username.trim()}
              onClick={saveName}
            >
              {t("set.save")}
            </button>
          </div>
          {nameMsg && <p className="field__hint">{nameMsg}</p>}
        </div>

        <div className="field">
          <label className="field__label">{t("set.password")}</label>
          <div className="row-inline">
            <PasswordInput
              className="share-input"
              value={password}
              minLength={6}
              onChange={setPassword}
            />
            <button
              className="btn-primary btn-sm"
              disabled={busy || password.length < 6}
              onClick={savePass}
            >
              {t("set.save")}
            </button>
          </div>
          {passMsg && <p className="field__hint">{passMsg}</p>}
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
