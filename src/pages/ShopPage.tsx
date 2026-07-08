import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";
import { useDialog } from "../ui/DialogProvider";
import {
  equipBadge,
  purchaseBadge,
  equipStyle,
  purchaseStyle,
  listRedemptions,
  redeemPartner,
} from "../lib/coins";
import { BADGES, NAME_STYLES, PARTNERS } from "../content/shop";

const ShopPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { t, lang } = useI18n();
  const dialog = useDialog();
  const [coupons, setCoupons] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) void listRedemptions(user.id).then(setCoupons);
  }, [user]);

  if (!user || !profile)
    return <div className="notice">{t("profile.loading")}</div>;

  const coins = profile.coins;
  const owned = profile.owned_badges ?? [];
  const equipped = profile.badge;

  const buy = async (emoji: string, price: number) => {
    const ok = await dialog.confirm({
      title: t("shop.buy"),
      message: `${t("shop.buyConfirm")} ${emoji} — ◈ ${price}?`,
      confirmLabel: t("shop.buy"),
    });
    if (!ok) return;
    const { ok: paid } = await purchaseBadge(user.id, emoji, price);
    if (!paid) {
      void dialog.alert(t("shop.notEnough"), t("coin.name"));
      return;
    }
    await refreshProfile();
  };

  const equip = async (emoji: string | null) => {
    await equipBadge(user.id, emoji);
    await refreshProfile();
  };

  const onBadge = (emoji: string, price: number) => {
    if (!owned.includes(emoji)) return void buy(emoji, price);
    if (equipped === emoji) return void equip(null);
    return void equip(emoji);
  };

  const ownedStyles = profile.owned_styles ?? [];
  const equippedStyle = profile.name_style;

  const buyStyle = async (id: string, price: number) => {
    const ok = await dialog.confirm({
      title: t("shop.buy"),
      message: `${t("shop.buyConfirm")} — ◈ ${price}?`,
      confirmLabel: t("shop.buy"),
    });
    if (!ok) return;
    const { ok: paid } = await purchaseStyle(user.id, id, price);
    if (!paid) {
      void dialog.alert(t("shop.notEnough"), t("coin.name"));
      return;
    }
    await refreshProfile();
  };

  const onStyle = async (id: string, price: number) => {
    if (!ownedStyles.includes(id)) return void buyStyle(id, price);
    await equipStyle(user.id, equippedStyle === id ? null : id);
    await refreshProfile();
  };

  const redeem = async (name: string, price: number) => {
    const ok = await dialog.confirm({
      title: t("shop.redeem"),
      message: `${t("shop.redeemConfirm")} ◈ ${price}?`,
      confirmLabel: t("shop.redeem"),
    });
    if (!ok) return;
    const { code, error } = await redeemPartner(user.id, name, price);
    if (error || !code) {
      void dialog.alert(t("shop.notEnough"), t("coin.name"));
      return;
    }
    setCoupons((c) => ({ ...c, [name]: code }));
    await refreshProfile();
  };

  const copy = (name: string, code: string) => {
    void navigator.clipboard?.writeText(code);
    setCopied(name);
    setTimeout(() => setCopied((c) => (c === name ? null : c)), 1500);
  };

  return (
    <div className="shop">
      <header className="theory__intro">
        <div className="eyebrow">// {t("nav.shop").toLowerCase()}</div>
        <h1>
          {t("nav.shop")}{" "}
          <span className="coin-balance mono">
            ◈ {coins} <span className="muted">{t("shop.balance")}</span>
          </span>
        </h1>
        <p className="theory__sub">{t("shop.subtitle")}</p>
        <p className="field__hint">{t("shop.earn")}</p>
      </header>

      <section>
        <div className="eyebrow">// {t("shop.badges")}</div>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const isOwned = owned.includes(b.emoji);
            const isEquipped = equipped === b.emoji;
            return (
              <button
                className={`badge-card panel${isEquipped ? " is-equipped" : ""}${
                  isOwned ? " is-owned" : ""
                }`}
                key={b.emoji}
                onClick={() => onBadge(b.emoji, b.price)}
              >
                <div className="badge-emoji">{b.emoji}</div>
                <div className="badge-price mono">
                  {isEquipped ? (
                    <span className="accent">{t("shop.equipped")}</span>
                  ) : isOwned ? (
                    <span className="muted">{t("shop.equip")}</span>
                  ) : (
                    <>◈ {b.price}</>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="eyebrow">// {t("shop.styles")}</div>
        <div className="badge-grid">
          {NAME_STYLES.map((s) => {
            const isOwned = ownedStyles.includes(s.id);
            const isEquipped = equippedStyle === s.id;
            return (
              <button
                className={`badge-card panel${isEquipped ? " is-equipped" : ""}`}
                key={s.id}
                onClick={() => onStyle(s.id, s.price)}
              >
                <div className={`style-preview name-${s.id}`}>
                  {profile.username}
                </div>
                <div className="badge-price mono">
                  {isEquipped ? (
                    <span className="accent">{t("shop.equipped")}</span>
                  ) : isOwned ? (
                    <span className="muted">{t("shop.equip")}</span>
                  ) : (
                    <>◈ {s.price}</>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="eyebrow">// {t("shop.partners")}</div>
        <div className="partner-grid">
          {PARTNERS.map((p) => (
            <article className="partner-card panel" key={p.name}>
              <div
                className="partner-cover"
                style={{
                  background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})`,
                }}
              >
                <span>{p.emoji}</span>
              </div>
              <div className="partner-body">
                <div className="partner-top">
                  <h3>{p.name}</h3>
                  <span className="mono muted">{p.category[lang]}</span>
                </div>
                <div className="partner-discount">{p.discount[lang]}</div>
                <p className="legend-blurb">{p.blurb[lang]}</p>
                {coupons[p.name] ? (
                  <div className="coupon">
                    <div className="coupon__label mono muted">
                      {t("shop.code")}
                    </div>
                    <div className="coupon__row">
                      <code className="coupon__code mono">
                        {coupons[p.name]}
                      </code>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => copy(p.name, coupons[p.name])}
                      >
                        {copied === p.name ? t("shop.copied") : t("shop.copy")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="partner-foot">
                    <span className="mono">
                      ◈ {p.price} <span className="muted">{t("shop.cost")}</span>
                    </span>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => redeem(p.name, p.price)}
                    >
                      {t("shop.redeem")}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
