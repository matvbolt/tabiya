import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useDialog } from "../ui/DialogProvider";
import { useI18n } from "../i18n";
import AutoPlayBoard from "./AutoPlayBoard";

const Layout = () => {
  const { user, profile, signOut, configured } = useAuth();
  const navigate = useNavigate();
  const dialog = useDialog();
  const { t } = useI18n();

  const onSignOut = async () => {
    const ok = await dialog.confirm({
      title: t("dlg.signOutTitle"),
      message: t("dlg.signOutMsg"),
      confirmLabel: t("auth.signOut"),
    });
    if (!ok) return;
    await signOut();
    navigate("/");
  };

  return (
    <div className="app">
      <AutoPlayBoard />

      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <svg className="brand__mark" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 4a3 3 0 0 1 1.7 5.5c1.7 1.2 2.8 3.5 3 6H7.3c.2-2.5 1.3-4.8 3-6A3 3 0 0 1 12 4zM6 16.5h12l1.2 3.5H4.8z"
              fill="currentColor"
            />
          </svg>
          Tabiya
        </NavLink>

        {user && (
          <NavLink to="/profile" className="side-user">
            <span className="side-user__avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" />
              ) : (
                (profile?.username ?? "?")[0]?.toUpperCase()
              )}
            </span>
            <span className="side-user__id">
              <b>
                {profile?.badge && (
                  <span className="user-badge">{profile.badge}</span>
                )}
                <span
                  className={
                    profile?.name_style ? `name-${profile.name_style}` : undefined
                  }
                >
                  {profile?.username ?? user.email}
                </span>
              </b>
              {profile && (
                <span className="side-user__rating mono">
                  ◈ {profile.coins} · {profile.rating}
                </span>
              )}
            </span>
          </NavLink>
        )}

        <nav className="sidenav">
          <NavLink to="/" end>
            {t("nav.home")}
          </NavLink>
          {user && (
            <>
              <NavLink to="/lobby">{t("nav.online")}</NavLink>
              <NavLink to="/play/bot">{t("nav.playBot")}</NavLink>
              <NavLink to="/theory">{t("nav.theory")}</NavLink>
              <NavLink to="/world">{t("nav.world")}</NavLink>
              <NavLink to="/learn">{t("nav.learn")}</NavLink>
              <NavLink to="/shop">{t("nav.shop")}</NavLink>
              <NavLink to="/profile">{t("nav.profile")}</NavLink>
              <NavLink to="/settings">{t("nav.settings")}</NavLink>
            </>
          )}
        </nav>
      </aside>

      <div className="shell">
        <header className="topbar">
          {!configured && (
            <span className="badge badge--warn">{t("common.offline")}</span>
          )}
          {user ? (
            <button className="btn-ghost" onClick={onSignOut}>
              {t("auth.signOut")}
            </button>
          ) : (
            configured && (
              <NavLink to="/login" className="btn-ghost">
                {t("auth.signIn")}
              </NavLink>
            )
          )}
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
