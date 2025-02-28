
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
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  
  // Apply theme transition styles to document root once on mount
  useEffect(() => {
    // Add transition to make theme changes smoother
    const root = window.document.documentElement;
    root.style.transition = "background-color 0.3s ease, color 0.3s ease";
    
    // Apply initial theme immediately without animation on first load
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    
    // Clean up transition when component unmounts
    return () => {
      root.style.transition = "";
    };
  }, []);

  // Handle theme changes after the initial load
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Skip this effect when component first mounts
    if (isChangingTheme) {
      // Remove both classes first, then add the correct one
      root.classList.remove("light", "dark");
      
      // Using a small timeout to ensure the class removal is processed
      // before adding the new class to prevent flickering
      setTimeout(() => {
        root.classList.add(theme);
        localStorage.setItem("theme", theme);
      }, 5);
    }
  }, [theme, isChangingTheme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (newTheme !== theme) {
        setIsChangingTheme(true);
        setTheme(newTheme);
      }
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
