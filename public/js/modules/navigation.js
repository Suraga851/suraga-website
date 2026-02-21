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

    const setActiveNav = (sectionId) => {
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
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add("nav-scrolled");
            } else {
                navbar.classList.remove("nav-scrolled");
            }
        }

        if (navSections.length === 0) return;

        const scrollMark = window.scrollY + (navbar ? navbar.offsetHeight + 120 : 180);
        let activeSectionId = navSections[0].id;

        navSections.forEach((section) => {
            if (scrollMark >= section.offsetTop) {
                activeSectionId = section.id;
            }
        });

        setActiveNav(activeSectionId);
    };

    window.addEventListener("scroll", updateHeaderAndActiveSection, { passive: true });
    window.addEventListener("hashchange", updateHeaderAndActiveSection);
    updateHeaderAndActiveSection();

    return {
        isMobileMenuOpen: () => isMobileMenuOpen
    };
};
