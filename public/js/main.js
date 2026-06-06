import { initNavigation } from "./modules/navigation.js";
import { initRevealSections } from "./modules/reveal.js";
import { initPdfModal } from "./modules/modal.js";
import { initContactForm } from "./modules/form.js";
import { setCurrentYear } from "./modules/year.js";
import { getMessages } from "./modules/i18n.js";
import { createStatusHandlers } from "./modules/status.js";
import { initBackToTop } from "./modules/backToTop.js";
import { initImageLoader } from "./modules/imageLoader.js";
import { initGodsEye } from "./modules/godsEye.js";
import { initCapacitorHooks } from "./modules/capacitor.js";
import { initThemeToggle } from "./modules/theme.js";
import { initClipboard } from "./modules/clipboard.js";
import { initScrollProgress } from "./modules/scrollProgress.js";
import { initAnimatedCounters } from "./modules/animatedCounter.js";
import { initTypingAnimation } from "./modules/typingAnimation.js";
import { initParallaxHero } from "./modules/parallax.js";
import { initHoverTilt } from "./modules/hoverTilt.js";

const scheduleNonCriticalWork = (callback) => {
    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => callback(), { timeout: 1500 });
        return;
    }

    window.setTimeout(callback, 1);
};

const isRtl = document.documentElement.dir === "rtl";
const messages = getMessages(isRtl);
const { setFormStatus, clearFormStatus } = createStatusHandlers(document.getElementById("form-status"));

const navigation = initNavigation();
initThemeToggle();
initRevealSections();
setCurrentYear();
initImageLoader();
initCapacitorHooks();
initClipboard();
initScrollProgress();
initAnimatedCounters();
initTypingAnimation();
initParallaxHero();
initHoverTilt();

initPdfModal({
    messages,
    setFormStatus,
    clearFormStatus,
    isMenuOpen: navigation.isMobileMenuOpen
});
initContactForm({
    messages,
    setFormStatus,
    clearFormStatus
});

scheduleNonCriticalWork(() => {
    initBackToTop();
    initGodsEye();
});
