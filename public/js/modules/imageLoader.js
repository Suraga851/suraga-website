export const initImageLoader = () => {
    const heroImageContainer = document.querySelector(".hero-image-container");
    const heroImage = document.querySelector(".hero-image");

    if (!heroImageContainer || !heroImage) return;

    const handleImageLoad = () => {
        heroImageContainer.classList.add("loaded");
    };

    // Check if image is already loaded
    if (heroImage.complete && heroImage.naturalHeight !== 0) {
        handleImageLoad();
    } else {
        heroImage.addEventListener("load", handleImageLoad);
        heroImage.addEventListener("error", () => {
            // On error, still remove the loading state
            heroImageContainer.classList.add("loaded");
            // Set a fallback background color
            heroImage.style.background = "linear-gradient(135deg, var(--primary-teal-light), var(--primary-teal-dark))";
        });
    }
};
