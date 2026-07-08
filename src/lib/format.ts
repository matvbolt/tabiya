import type { Lang } from "../i18n";

export const formatDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
