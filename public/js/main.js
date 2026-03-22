import { initNavigation } from "./modules/navigation.js";
import { initRevealSections } from "./modules/reveal.js";
import { initPdfModal } from "./modules/modal.js";
import { initContactForm } from "./modules/form.js";
import { setCurrentYear } from "./modules/year.js";
import { getMessages } from "./modules/i18n.js";
import { createStatusHandlers } from "./modules/status.js";
import { initBackToTop } from "./modules/backToTop.js";
import { initPageLoader } from "./modules/pageLoader.js";
import { initImageLoader } from "./modules/imageLoader.js";
import { initGodsEye } from "./modules/godsEye.js";

// Initialize page loader immediately
initPageLoader();

const isRtl = document.documentElement.dir === "rtl";
const messages = getMessages(isRtl);
const { setFormStatus, clearFormStatus } = createStatusHandlers(document.getElementById("form-status"));

const navigation = initNavigation();
initRevealSections();
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
setCurrentYear();
initBackToTop();
initImageLoader();
initGodsEye();
