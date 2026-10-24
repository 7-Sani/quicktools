"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button
      onClick={cycle}
      className="p-2 neo-border rounded-lg neo-hover bg-surface"
      aria-label={`Current theme: ${theme}. Click to switch.`}
      title={`Theme: ${theme}`}
    >
      {theme === "light" && <Sun size={18} />}
      {theme === "dark" && <Moon size={18} />}
      {theme === "system" && <Monitor size={18} />}
    </button>
  );
}
