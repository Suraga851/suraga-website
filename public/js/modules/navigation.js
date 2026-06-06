export const initNavigation = () => {
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("close-mobile-menu");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
    const desktopNavLinks = document.querySelectorAll(".nav-link");
    const navbar = document.getElementById("navbar");
    const isRtl = document.documentElement.dir === "rtl";
    const allNavLinks = [...desktopNavLinks, ...mobileNavLinks];

    let isMobileMenuOpen = false;

    const setMobileMenuState = (open) => {
        if (!mobileBtn || !mobileMenu) return;

        isMobileMenuOpen = open;
        if (open) {
            mobileMenu.classList.remove("translate-x-full", "-translate-x-full");
            mobileBtn.setAttribute("aria-expanded", "true");
            mobileMenu.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            if (closeBtn) closeBtn.focus();
            return;
        }

        mobileMenu.classList.add(isRtl ? "-translate-x-full" : "translate-x-full");
        mobileBtn.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "auto";
    };

    if (mobileBtn && closeBtn && mobileMenu) {
        mobileBtn.addEventListener("click", () => setMobileMenuState(true));

        const closeMenu = () => setMobileMenuState(false);
        closeBtn.addEventListener("click", closeMenu);
        mobileNavLinks.forEach((link) => link.addEventListener("click", closeMenu));

        mobileMenu.addEventListener("click", (event) => {
            if (event.target === mobileMenu) closeMenu();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth >= 768 && isMobileMenuOpen) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isMobileMenuOpen) {
                closeMenu();
            }
        });

        setMobileMenuState(false);
    }

    const navSections = [];
    desktopNavLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        const section = document.querySelector(href);
        if (!section || navSections.includes(section)) return;
        navSections.push(section);
    });

    let activeSectionId = null;
    let navSectionOffsets = [];
    let navbarHeight = navbar ? navbar.offsetHeight : 0;
    let scrollRafId = null;

    const refreshNavMetrics = () => {
        navbarHeight = navbar ? navbar.offsetHeight : 0;
        navSectionOffsets = navSections.map((section) => ({
            id: section.id,
            top: section.offsetTop
        }));
    };

    const setActiveNav = (sectionId) => {
        if (sectionId === activeSectionId) return;
        activeSectionId = sectionId;

        allNavLinks.forEach((link) => {
            const href = link.getAttribute("href");
            const isActive = href === `#${sectionId}`;
            link.classList.toggle("active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    const updateHeaderAndActiveSection = () => {
        scrollRafId = null;

        if (navbar) {
            navbar.classList.toggle("nav-scrolled", window.scrollY > 50);
        }

        if (navSectionOffsets.length === 0) return;

        const scrollMark = window.scrollY + (navbar ? navbarHeight + 120 : 180);
        let nextActiveSectionId = navSectionOffsets[0].id;

        navSectionOffsets.forEach((section) => {
            if (scrollMark >= section.top) {
                nextActiveSectionId = section.id;
            }
        });

        setActiveNav(nextActiveSectionId);
    };

    const queueHeaderAndActiveSectionUpdate = () => {
        if (scrollRafId !== null) return;
        scrollRafId = window.requestAnimationFrame(updateHeaderAndActiveSection);
    };

    const refreshAndQueueNavUpdate = () => {
        refreshNavMetrics();
        queueHeaderAndActiveSectionUpdate();
    };

    window.addEventListener("scroll", queueHeaderAndActiveSectionUpdate, { passive: true });
    window.addEventListener("resize", refreshAndQueueNavUpdate);
    window.addEventListener("load", refreshAndQueueNavUpdate, { once: true });
    window.addEventListener("hashchange", refreshAndQueueNavUpdate);
    document.fonts?.ready.then(refreshAndQueueNavUpdate).catch(() => {});

    refreshNavMetrics();
    updateHeaderAndActiveSection();

    return {
        isMobileMenuOpen: () => isMobileMenuOpen
    };
};
