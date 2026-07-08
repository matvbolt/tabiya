import { Link } from "react-router-dom";

type Props = {
  username: string;
  badge?: string | null;
  style?: string | null;
  userId?: string | null;
  className?: string;
};

const UserName = ({ username, badge, style, userId, className }: Props) => {
  const inner = (
    <>
      {badge && <span className="user-badge">{badge}</span>}
      <span className={style ? `name-${style}` : undefined}>{username}</span>
    </>
  );
  if (userId)
    return (
      <Link to={`/u/${userId}`} className={`username-link ${className ?? ""}`}>
        {inner}
      </Link>
    );
  return <span className={className}>{inner}</span>;
};

export default UserName;
