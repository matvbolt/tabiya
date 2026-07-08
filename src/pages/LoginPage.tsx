import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";
import PasswordInput from "../components/PasswordInput";

const LoginPage = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    if (mode === "in") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate("/lobby");
    } else {
      const { error, needsConfirmation } = await signUp(
        email,
        password,
        username || email
      );
      if (error) setError(error);
      else if (needsConfirmation) setInfo(t("login.confirm"));
      else navigate("/lobby");
    }
    setBusy(false);
  }

  return (
    <div className="auth-card">
      <h2>{mode === "in" ? t("login.signIn") : t("login.create")}</h2>
      <form onSubmit={submit} className="auth-form">
        {mode === "up" && (
          <label>
            {t("login.name")}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="grandmaster42"
              autoComplete="username"
            />
          </label>
        )}
        <label>
          {t("login.email")}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          {t("login.password")}
          <PasswordInput
            required
            minLength={6}
            value={password}
            onChange={setPassword}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
          />
        </label>

        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-info">{info}</p>}

        <button className="btn-primary" disabled={busy}>
          {busy ? "…" : mode === "in" ? t("login.signIn") : t("login.create")}
        </button>
      </form>

      <button
        className="auth-switch"
        onClick={() => {
          setMode(mode === "in" ? "up" : "in");
          setError(null);
          setInfo(null);
        }}
      >
        {mode === "in" ? t("login.noAccount") : t("login.haveAccount")}
      </button>
    </div>
  );
}

export default LoginPage;
