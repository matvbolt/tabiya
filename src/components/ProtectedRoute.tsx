import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";

const ProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading, configured } = useAuth();
  const { t } = useI18n();
  if (!configured)
    return (
      <div className="notice">
        <h2>{t("protected.title")}</h2>
        <p>{t("protected.body")}</p>
      </div>
    );
  if (loading) return <div className="notice">{t("protected.loading")}</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default ProtectedRoute;
