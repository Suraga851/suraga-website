export const initPdfModal = ({ messages, clearFormStatus, isMenuOpen }) => {
    const modal = document.getElementById("pdf-modal");
    const modalItems = document.querySelectorAll(".portfolio-item");
    const closeModal = document.getElementById("close-modal");
    const pdfViewer = document.getElementById("pdf-viewer");
    const pdfTitle = document.getElementById("pdf-title");
    const pdfOpenExternal = document.getElementById("pdf-open-external");

    if (!modal || !closeModal || !pdfViewer || !pdfTitle) return;

    let lastFocusedElement = null;
    let loadFallbackTimer = null;

    const shouldOpenDocDirectly = () =>
        window.matchMedia("(max-width: 767px)").matches ||
        window.matchMedia("(pointer: coarse)").matches;

    const openDocumentDirectly = (docPath) => {
        const absolutePath = new URL(docPath, window.location.href).toString();

        // Use an anchor-click approach: avoids popup blockers in mobile in-app
        // browsers (Soul, Instagram, etc.) which block window.open() but allow
        // navigation triggered by clicking a real <a> element during a user gesture.
        const anchor = document.createElement("a");
        anchor.href = absolutePath;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();

        // Use setTimeout to ensure the navigation/download has time to start
        // before removing the element from the DOM, which fixes issues in some browsers
        setTimeout(() => {
            if (document.body.contains(anchor)) {
                document.body.removeChild(anchor);
            }
        }, 500);
    };

    const clearFallbackTimer = () => {
        if (loadFallbackTimer) {
            clearTimeout(loadFallbackTimer);
            loadFallbackTimer = null;
        }
    };

    const hideModal = () => {
        clearFallbackTimer();
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        pdfViewer.removeAttribute("src");
        pdfViewer.removeAttribute("data-loaded");
        if (pdfOpenExternal) pdfOpenExternal.removeAttribute("href");
        document.body.style.overflow = isMenuOpen() ? "hidden" : "auto";
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
        lastFocusedElement = null;
    };

    /**
     * Some browsers (Mobile Safari, many in-app webviews) refuse to render a PDF
     * inside an <iframe> and show a blank panel. If the iframe hasn't fired `load`
     * within ~2.5s, fall back to opening the document in a new tab — and keep the
     * modal open with the "Open" button visible so the user always has an escape.
     */
    const armLoadFallback = (docPath, titleText) => {
        clearFallbackTimer();
        loadFallbackTimer = setTimeout(() => {
            const loaded = pdfViewer.getAttribute("data-loaded");
            if (!loaded && document.body.contains(pdfViewer)) {
                console.warn("PDF iframe did not report load in time — opening in new tab.");
                openDocumentDirectly(docPath);
            }
        }, 2500);
    };

    const openModalForItem = (item) => {
        const docName = item.dataset.doc;
        if (!docName) return;

        const docPath = `assets/docs/${docName}.pdf`;

        if (shouldOpenDocDirectly()) {
            clearFormStatus();
            openDocumentDirectly(docPath);
            return;
        }

        const titleNode = item.querySelector("h3");
        const modalTitle = titleNode ? titleNode.innerText : messages.defaultDocTitle;
        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        clearFormStatus();
        pdfTitle.innerText = modalTitle;
        if (pdfOpenExternal) {
            pdfOpenExternal.href = new URL(docPath, window.location.href).toString();
        }

        // Mark not-loaded, set src, arm the fallback. The `load` handler below
        // flips data-loaded when the browser actually renders the PDF.
        pdfViewer.removeAttribute("data-loaded");
        pdfViewer.src = docPath;
        armLoadFallback(docPath, modalTitle);

        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        closeModal.focus();
    };

    // Mark the iframe loaded so the timed fallback doesn't fire unnecessarily.
    // (Browsers that can't render PDFs in iframes simply never fire `load`.)
    pdfViewer.addEventListener("load", () => {
        pdfViewer.setAttribute("data-loaded", "true");
        clearFallbackTimer();
    });

    modalItems.forEach((item) => {
        if (!(item instanceof HTMLElement)) return;

        const titleNode = item.querySelector("h3");
        const itemTitle = titleNode ? titleNode.innerText.trim() : messages.defaultDocTitle;
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-haspopup", "dialog");
        item.setAttribute("aria-label", messages.openDocLabel(itemTitle));

        item.addEventListener("click", () => {
            openModalForItem(item);
        });

        item.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            openModalForItem(item);
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
};
