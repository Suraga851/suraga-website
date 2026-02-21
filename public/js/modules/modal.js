export const initPdfModal = ({ messages, setFormStatus, clearFormStatus, isMenuOpen }) => {
    const modal = document.getElementById("pdf-modal");
    const modalItems = document.querySelectorAll(".portfolio-item");
    const closeModal = document.getElementById("close-modal");
    const pdfViewer = document.getElementById("pdf-viewer");
    const pdfTitle = document.getElementById("pdf-title");

    if (!modal || !closeModal || !pdfViewer || !pdfTitle) return;

    let lastFocusedElement = null;

    const hideModal = () => {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        pdfViewer.src = "";
        document.body.style.overflow = isMenuOpen() ? "hidden" : "auto";
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
                setFormStatus(messages.docUnavailable, "error");
                return;
            }
        } catch (error) {
            console.error("Document availability check failed:", error);
            setFormStatus(messages.docUnavailable, "error");
            return;
        }

        const titleNode = item.querySelector("h3");
        const modalTitle = titleNode ? titleNode.innerText : messages.defaultDocTitle;
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
        const itemTitle = titleNode ? titleNode.innerText.trim() : messages.defaultDocTitle;
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-haspopup", "dialog");
        item.setAttribute("aria-label", messages.openDocLabel(itemTitle));

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
};
