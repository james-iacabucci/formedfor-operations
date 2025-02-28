
"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );
  
  // Apply theme transition styles to document root once on mount
  useEffect(() => {
    // Add transition to make theme changes smoother
    const root = window.document.documentElement;
    root.style.transition = "background-color 0.3s ease, color 0.3s ease";
    
    // Clean up transition when component unmounts
    return () => {
      root.style.transition = "";
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first, then add the correct one
    root.classList.remove("light", "dark");
    
    // Using requestAnimationFrame to ensure DOM is ready before applying the new theme
    window.requestAnimationFrame(() => {
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
    });
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
