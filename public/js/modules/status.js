export const createStatusHandlers = (formStatusNode) => {
    const setFormStatus = (message, type) => {
        if (!formStatusNode) return;
        formStatusNode.textContent = message;
        formStatusNode.classList.remove("hidden", "success", "error", "info");
        formStatusNode.classList.add(type);
    };

    const clearFormStatus = () => {
        if (!formStatusNode) return;
        formStatusNode.textContent = "";
        formStatusNode.classList.remove("success", "error", "info");
        formStatusNode.classList.add("hidden");
    };

    return { setFormStatus, clearFormStatus };
};
