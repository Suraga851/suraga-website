import { resolveContactEndpoint } from "./config.js";

export const initContactForm = ({ messages, setFormStatus, clearFormStatus }) => {
    const form = document.getElementById("contact-form");
    if (!(form instanceof HTMLFormElement)) return;

    const button = form.querySelector("button[type='submit']");
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const messageEl = document.getElementById("message");
    const inquiryEl = document.getElementById("inquiry-type");
    const websiteEl = document.getElementById("website"); // honeypot

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

        try {
            const endpoint = await endpointPromise;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: nameEl.value.trim(),
                    email: emailEl.value.trim(),
                    message: messageEl.value.trim(),
                    inquiryType: selectedText,
                    // Honeypot — empty for real users, filled by bots.
                    website: websiteEl?.value ?? ""
                })
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
