import { initNavigation } from "./modules/navigation.js";
import { initRevealSections } from "./modules/reveal.js";
import { initPdfModal } from "./modules/modal.js";
import { initContactForm } from "./modules/form.js";
import { setCurrentYear } from "./modules/year.js";
import { getMessages } from "./modules/i18n.js";
import { createStatusHandlers } from "./modules/status.js";

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
