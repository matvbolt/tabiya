import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "tabiya:theme";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const s =
      typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    return s === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, theme);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  };
};
