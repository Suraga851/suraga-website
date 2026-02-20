"use strict";

const mobileBtn = document.getElementById("mobile-menu-btn");
const closeBtn = document.getElementById("close-mobile-menu");
const mobileMenu = document.getElementById("mobile-menu");
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
const desktopNavLinks = document.querySelectorAll(".nav-link");
const navbar = document.getElementById("navbar");
const formStatus = document.getElementById("form-status");
const isRtl = document.documentElement.dir === "rtl";
const allNavLinks = [...desktopNavLinks, ...mobileNavLinks];

const MESSAGES = {
    sending: "Sending...",
    success: "Thank you! Your message has been sent successfully.",
    error: "Something went wrong. Please try again or contact me directly via WhatsApp.",
    docUnavailable: "This document is currently unavailable."
};

const setFormStatus = (message, type) => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove("hidden", "success", "error", "info");
    formStatus.classList.add(type);
};

const clearFormStatus = () => {
    if (!formStatus) return;
    formStatus.textContent = "";
    formStatus.classList.remove("success", "error", "info");
    formStatus.classList.add("hidden");
};

let isMobileMenuOpen = false;

if (mobileBtn && closeBtn && mobileMenu) {
    const setMobileMenuState = (open) => {
        isMobileMenuOpen = open;

        if (open) {
            mobileMenu.classList.remove("translate-x-full", "-translate-x-full");
            mobileBtn.setAttribute("aria-expanded", "true");
            mobileMenu.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            closeBtn.focus();
            return;
        }

        mobileMenu.classList.add(isRtl ? "-translate-x-full" : "translate-x-full");
        mobileBtn.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "auto";
    };

    mobileBtn.addEventListener("click", () => {
        setMobileMenuState(true);
    });

    const closeMenu = () => {
        setMobileMenuState(false);
    };

    closeBtn.addEventListener("click", closeMenu);
    mobileNavLinks.forEach((link) => link.addEventListener("click", closeMenu));

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 768 && isMobileMenuOpen) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isMobileMenuOpen) {
            closeMenu();
        }
    });

    setMobileMenuState(false);
}

const navSections = [];
desktopNavLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const section = document.querySelector(href);
    if (!section || navSections.includes(section)) return;
    navSections.push(section);
});

const setActiveNav = (sectionId) => {
    allNavLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const isActive = href === `#${sectionId}`;
        link.classList.toggle("active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
            return;
        }
        link.removeAttribute("aria-current");
    });
};

const updateHeaderAndActiveSection = () => {
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add("nav-scrolled");
        } else {
            navbar.classList.remove("nav-scrolled");
        }
    }

    if (navSections.length === 0) return;

    const scrollMark = window.scrollY + (navbar ? navbar.offsetHeight + 120 : 180);
    let activeSectionId = navSections[0].id;

    navSections.forEach((section) => {
        if (scrollMark >= section.offsetTop) {
            activeSectionId = section.id;
        }
    });

    setActiveNav(activeSectionId);
};

window.addEventListener("scroll", updateHeaderAndActiveSection, { passive: true });
window.addEventListener("hashchange", updateHeaderAndActiveSection);
updateHeaderAndActiveSection();

const revealSections = document.querySelectorAll(".reveal-section");
if (revealSections.length > 0) {
    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("revealed");
                    revealObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        revealSections.forEach((section) => revealObserver.observe(section));
    } else {
        revealSections.forEach((section) => section.classList.add("revealed"));
    }
}

const modal = document.getElementById("pdf-modal");
const modalItems = document.querySelectorAll(".portfolio-item");
const closeModal = document.getElementById("close-modal");
const pdfViewer = document.getElementById("pdf-viewer");
const pdfTitle = document.getElementById("pdf-title");

if (modal && closeModal && pdfViewer && pdfTitle) {
    let lastFocusedElement = null;

    const hideModal = () => {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        pdfViewer.src = "";
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
        lastFocusedElement = null;
    };

    const openModalForItem = async (item) => {
        const docName = item.dataset.doc;
        if (!docName) return;

        const docPath = `assets/docs/${docName}.pdf`;
        try {
            const check = await fetch(docPath, { method: "HEAD" });
            if (!check.ok && check.status !== 405) {
                setFormStatus(MESSAGES.docUnavailable, "error");
                return;
            }
        } catch (error) {
            console.error("Document availability check failed:", error);
            setFormStatus(MESSAGES.docUnavailable, "error");
            return;
        }

        const titleNode = item.querySelector("h3");
        const modalTitle = titleNode ? titleNode.innerText : "Document";
        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        clearFormStatus();
        pdfTitle.innerText = modalTitle;
        pdfViewer.src = docPath;
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        closeModal.focus();
    };

    modalItems.forEach((item) => {
        if (!(item instanceof HTMLElement)) return;

        const titleNode = item.querySelector("h3");
        const itemTitle = titleNode ? titleNode.innerText.trim() : "Document";
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-haspopup", "dialog");
        item.setAttribute("aria-label", `Open document: ${itemTitle}`);

        item.addEventListener("click", async () => {
            await openModalForItem(item);
        });

        item.addEventListener("keydown", async (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            await openModalForItem(item);
        });
    });

    closeModal.addEventListener("click", hideModal);
    modal.addEventListener("click", (event) => {
        const target = event.target;
        if (target === modal || (target instanceof HTMLElement && target.classList.contains("modal-backdrop"))) {
            hideModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.classList.contains("hidden")) {
            hideModal();
        }
    });
}

const initForm = () => {
    const form = document.getElementById("contact-form");
    if (!(form instanceof HTMLFormElement)) return;

    const button = form.querySelector("button[type='submit']");
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const messageEl = document.getElementById("message");
    const inquiryEl = document.getElementById("inquiry-type");

    if (
        !(button instanceof HTMLButtonElement) ||
        !(nameEl instanceof HTMLInputElement) ||
        !(emailEl instanceof HTMLInputElement) ||
        !(messageEl instanceof HTMLTextAreaElement) ||
        !(inquiryEl instanceof HTMLSelectElement)
    ) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearFormStatus();

        const originalText = button.innerHTML;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>${MESSAGES.sending}`;
        button.disabled = true;

        const formData = new FormData();
        formData.append("name", nameEl.value.trim());
        formData.append("email", emailEl.value.trim());
        formData.append("message", messageEl.value.trim());
        formData.append("_subject", `New ${inquiryEl.value} from ${nameEl.value.trim()}`);
        formData.append("_captcha", "false");
        formData.append("_template", "table");

        try {
            const response = await fetch("https://formsubmit.co/ajax/suragaelzibaer@gmail.com", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`FormSubmit request failed: ${response.status}`);
            }

            setFormStatus(MESSAGES.success, "success");
            form.reset();
        } catch (error) {
            console.error("Form submission error:", error);
            setFormStatus(MESSAGES.error, "error");
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    });
};

initForm();

const yearSpan = document.getElementById("current-year");
if (yearSpan) {
    yearSpan.innerText = new Date().getFullYear().toString();
}
