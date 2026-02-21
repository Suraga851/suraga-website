export const initRevealSections = () => {
    const revealSections = document.querySelectorAll(".reveal-section");
    if (revealSections.length === 0) return;

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
        return;
    }

    revealSections.forEach((section) => section.classList.add("revealed"));
};
