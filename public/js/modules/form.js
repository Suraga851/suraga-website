import { resolveContactEndpoint } from "./config.js";

export const initContactForm = ({ messages, setFormStatus, clearFormStatus }) => {
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

    const endpointPromise = resolveContactEndpoint();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearFormStatus();

        const originalText = button.innerHTML;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>${messages.sending}`;
        button.disabled = true;

        const selectedText = inquiryEl.options[inquiryEl.selectedIndex]?.text ?? inquiryEl.value;
        const formData = new FormData();
        formData.append("name", nameEl.value.trim());
        formData.append("email", emailEl.value.trim());
        formData.append("message", messageEl.value.trim());
        formData.append("_subject", `${messages.subjectPrefix} ${selectedText} ${messages.from} ${nameEl.value.trim()}`);
        formData.append("_captcha", "false");
        formData.append("_template", "table");

        try {
            const endpoint = await endpointPromise;
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Form submit request failed: ${response.status}`);
            }

            setFormStatus(messages.success, "success");
            form.reset();
        } catch (error) {
            console.error("Form submission error:", error);
            setFormStatus(messages.error, "error");
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    });
};
