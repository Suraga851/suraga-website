const fetchRuntimeConfig = async () => {
    try {
        const response = await fetch("/config.json", { cache: "no-store" });
        if (!response.ok) return {};
        const data = await response.json();
        if (typeof data !== "object" || data === null) return {};
        return data;
    } catch (error) {
        console.warn("Unable to load runtime config, falling back to page defaults.", error);
        return {};
    }
};

export const resolveContactEndpoint = async () => {
    const bodyDefault =
        document.body?.getAttribute("data-contact-endpoint") ||
        "https://formsubmit.co/ajax/suragaelzibaer@gmail.com";

    const runtimeConfig = await fetchRuntimeConfig();
    if (typeof runtimeConfig.contactEndpoint === "string" && runtimeConfig.contactEndpoint.trim().length > 0) {
        return runtimeConfig.contactEndpoint.trim();
    }

    return bodyDefault;
};
