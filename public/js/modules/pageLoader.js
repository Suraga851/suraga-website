export const initPageLoader = () => {
    const isRtl = document.documentElement.dir === "rtl";
    
    // Create page loader
    const loader = document.createElement("div");
    loader.className = "page-loader";
    loader.id = "page-loader";
    loader.innerHTML = `
        <div class="loader-logo">SE</div>
        <p class="loader-text">
            ${isRtl ? "جاري التحميل" : "Loading"}
            <span class="loader-dots">
                <span>.</span><span>.</span><span>.</span>
            </span>
        </p>
    `;
    document.body.appendChild(loader);

    // Hide loader when page is fully loaded
    const hideLoader = () => {
        loader.classList.add("hidden");
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 500);
    };

    // Hide loader when page is loaded
    if (document.readyState === "complete") {
        setTimeout(hideLoader, 500);
    } else {
        window.addEventListener("load", () => {
            setTimeout(hideLoader, 500);
        });
    }

    // Fallback: hide loader after 5 seconds max
    setTimeout(hideLoader, 5000);
};
