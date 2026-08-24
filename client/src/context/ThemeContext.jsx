import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'roomi-theme';

const getSystemDark = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;

export const ThemeProvider = ({ children }) => {
    const [dark, setDark] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return saved === 'dark';
        } catch { /* ignore */ }
        return getSystemDark();
    });

    // Single source of truth: mirror the theme onto a `.dark` class on <html>.
    // Tailwind is configured with darkMode: 'class', so this makes every
    // `dark:` variant (admin panel, form fields, everything) follow the app's
    // theme instead of the OS `prefers-color-scheme`.
    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    // Manual toggle (navbar button) — always records an explicit preference.
    const toggleTheme = useCallback(() => {
        setDark((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
            } catch { /* ignore */ }
            return next;
        });
    }, []);

    // Apply a site theme value: 'system' | 'light' | 'dark'.
    //  - persist: true  → the choice becomes the stored preference
    //    (admin sets the site theme from Settings; takes effect immediately).
    //  - persist: false → apply for this view only, without claiming a manual
    //    preference (a visitor's first load seeded from the saved Default theme).
    const applyTheme = useCallback((theme, { persist = false } = {}) => {
        if (theme === 'system') {
            if (persist) {
                try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
            }
            setDark(getSystemDark());
            return;
        }
        const isDark = theme === 'dark';
        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
            } catch { /* ignore */ }
        }
        setDark(isDark);
    }, []);

    return (
        <ThemeContext.Provider value={{ dark, toggleTheme, applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
