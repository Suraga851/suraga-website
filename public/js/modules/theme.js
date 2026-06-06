/**
 * Theme Toggle Module
 * Manages dark/light mode with horizon animation toggle.
 * Persists preference in localStorage and respects system preference.
 */

const THEME_KEY = "suraga-theme";
const SYSTEM_PREFERS_DARK = "(prefers-color-scheme: dark)";

function getSystemPreference() {
    if (typeof window.matchMedia !== "function") return "light";
    return window.matchMedia(SYSTEM_PREFERS_DARK).matches ? "dark" : "light";
}

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_KEY);
    } catch {
        return null;
    }
}

function storeTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        // localStorage unavailable
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
        const isDay = theme === "light";
        toggle.setAttribute("aria-checked", String(isDay));
        toggle.setAttribute("aria-label", isDay ? "Switch to dark mode" : "Switch to light mode");
    }

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute("content", theme === "dark" ? "#0f172a" : "#0d9488");
    }
}

function initThemeToggle() {
    const stored = getStoredTheme();
    const initialTheme = stored || getSystemPreference();
    applyTheme(initialTheme);

    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        storeTheme(next);
    });

    // Listen for system preference changes
    if (typeof window.matchMedia === "function") {
        window.matchMedia(SYSTEM_PREFERS_DARK).addEventListener("change", (e) => {
            if (!getStoredTheme()) {
                applyTheme(e.matches ? "dark" : "light");
            }
        });
    }
}

export { initThemeToggle };
