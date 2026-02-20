"use strict";

const mobileBtn = document.getElementById("mobile-menu-btn");
const closeBtn = document.getElementById("close-mobile-menu");
const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.querySelectorAll(".mobile-nav-link");
const navbar = document.getElementById("navbar");
const formStatus = document.getElementById("form-status");

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

if (mobileBtn && closeBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
        mobileMenu.classList.remove("translate-x-full", "-translate-x-full");
        document.body.style.overflow = "hidden";
    });

    const closeMenu = () => {
        const isRtl = document.documentElement.dir === "rtl";
        mobileMenu.classList.add(isRtl ? "-translate-x-full" : "translate-x-full");
        document.body.style.overflow = "auto";
    };

    closeBtn.addEventListener("click", closeMenu);
    navLinks.forEach((link) => link.addEventListener("click", closeMenu));
}

window.addEventListener("scroll", () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add("nav-scrolled");
        return;
    }
    navbar.classList.remove("nav-scrolled");
});

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
    const hideModal = () => {
        modal.classList.add("hidden");
        pdfViewer.src = "";
        document.body.style.overflow = "auto";
    };

    modalItems.forEach((item) => {
        item.addEventListener("click", async () => {
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
            pdfTitle.innerText = titleNode ? titleNode.innerText : "Document";
            pdfViewer.src = docPath;
            modal.classList.remove("hidden");
            document.body.style.overflow = "hidden";
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
