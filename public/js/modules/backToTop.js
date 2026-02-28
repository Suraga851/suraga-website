export const initBackToTop = () => {
    // Create back-to-top button
    const button = document.createElement("button");
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(button);

    const toggleVisibility = () => {
        if (window.scrollY > 500) {
            button.classList.add("visible");
        } else {
            button.classList.remove("visible");
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    button.addEventListener("click", scrollToTop);
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    
    // Initial check
    toggleVisibility();
};
