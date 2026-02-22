import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { locales, siteConfig } from "../site-src/content.mjs";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const publicDir = path.join(rootDir, "public");

const { shared, ...localeMap } = locales;

const escapeHtml = (value) =>
    String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

const pageUrl = (locale) => `${siteConfig.baseUrl}${locale.path}`;

const structuredDataFor = (locale) =>
    JSON.stringify(
        {
            ...locale.schema,
            url: pageUrl(locale)
        },
        null,
        4
    );

const navLinks = (locale, itemClass) =>
    shared.navIds
        .map(
            (id) =>
                `                <li><a href="#${id}" class="${itemClass}">${escapeHtml(
                    locale.nav[id]
                )}</a></li>`
        )
        .join("\n");

const mobileNavLinks = (locale) =>
    shared.navIds
        .map(
            (id) =>
                `            <a href="#${id}" class="mobile-nav-link">${escapeHtml(locale.nav[id])}</a>`
        )
        .join("\n");

const heroBadges = (locale) =>
    locale.hero.badges
        .map((badge) => `                    <span class="skill-badge">${escapeHtml(badge)}</span>`)
        .join("\n");

const aboutParagraphs = (locale) =>
    locale.about.paragraphs
        .map((paragraph) => `                    <p class="text-body">${escapeHtml(paragraph)}</p>`)
        .join("\n");

const statsCards = (locale) =>
    locale.about.stats
        .map(
            (stat) => `                        <div class="stat-card">
                            <span class="stat-number">${escapeHtml(stat.value)}</span>
                            <span class="stat-label">${escapeHtml(stat.label)}</span>
                        </div>`
        )
        .join("\n");

const quickFactItems = (locale) =>
    locale.about.quickFacts
        .map(
            (fact) => `                            <li class="quick-fact-item">
                                <i class="fas ${escapeHtml(fact.icon)} icon-accent icon-w6"></i>
                                <span><strong>${escapeHtml(fact.label)}:</strong> ${escapeHtml(fact.value)}</span>
                            </li>`
        )
        .join("\n");

const services = (locale) =>
    locale.services.items
        .map(
            (service) => `                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas ${escapeHtml(service.icon)}"></i>
                    </div>
                    <h3 class="service-title">${escapeHtml(service.title)}</h3>
                    <p class="service-desc">${escapeHtml(service.description)}</p>
                </div>`
        )
        .join("\n");

const experienceItems = (locale) =>
    locale.experience.items
        .map((item) => {
            const bullets = item.bullets
                .map((bullet) => `                            <li>${escapeHtml(bullet)}</li>`)
                .join("\n");

            return `                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${escapeHtml(item.role)}</h3>
                        </div>
                        <h4 class="timeline-company">${escapeHtml(item.company)}</h4>
                        <p class="timeline-date">
                            <i class="fas fa-calendar-alt"></i>${escapeHtml(item.period)}
                        </p>
                        <ul class="experience-list">
${bullets}
                        </ul>
                    </div>
                </div>`;
        })
        .join("\n\n");

const portfolioItems = (locale) =>
    locale.portfolio.items
        .map(
            (item) => `                <div class="portfolio-item" data-doc="${escapeHtml(item.doc)}">
                    <div class="portfolio-card">
                        <div class="portfolio-icon ${escapeHtml(item.type)}">
                            <i class="fas ${item.type === "cert" ? "fa-certificate" : "fa-file-pdf"}"></i>
                        </div>
                        <h3 class="portfolio-name">${escapeHtml(item.title)}</h3>
                        <p class="portfolio-org">${escapeHtml(item.subtitle)}</p>
                        <span class="portfolio-action">
                            <i class="fas fa-eye"></i>${escapeHtml(locale.portfolio.actionText)}
                        </span>
                    </div>
                </div>`
        )
        .join("\n");

const inquiryOptions = (locale) =>
    shared.inquiryOptions
        .map(
            (option) =>
                `                                <option value="${option.value}">${escapeHtml(
                    locale.contact.form.inquiryLabels[option.key]
                )}</option>`
        )
        .join("\n");

const footerLinks = (locale) =>
    ["about", "services", "experience", "contact"]
        .map(
            (id) =>
                `                        <li><a href="#${id}">${escapeHtml(locale.nav[id])}</a></li>`
        )
        .join("\n");

const renderPage = (localeKey, locale) => {
    const enHref = `${siteConfig.baseUrl}/`;
    const arHref = `${siteConfig.baseUrl}/ar.html`;
    const canonical = localeKey === "en" ? enHref : arHref;
    const mobileMenuClosedClass = locale.dir === "rtl" ? "-translate-x-full" : "translate-x-full";
    const rtlNavClass = locale.dir === "rtl" ? " nav-links-rtl" : "";
    const heroImageRtlClass = locale.dir === "rtl" ? " hero-image-rtl" : "";
    const timelineRtlClass = locale.dir === "rtl" ? " rtl-timeline" : "";
    const rtlComment = locale.dir === "rtl" ? " (Arabic)" : "";
    const nameAriaLabel = locale.dir === "rtl" ? "الاسم الكامل" : "Full name";
    const emailAriaLabel = locale.dir === "rtl" ? "البريد الإلكتروني" : "Email address";
    const inquiryAriaLabel = locale.dir === "rtl" ? "نوع الاستفسار" : "Inquiry type";
    const messageAriaLabel = locale.dir === "rtl" ? "الرسالة" : "Message";
    const includeArabicCss =
        locale.dir === "rtl" ? `\n    <link rel="stylesheet" href="css/arabic.css">` : "";
    const titleSuffix = locale.hero.titleSuffix
        ? `\n                ${escapeHtml(locale.hero.titleSuffix)}`
        : "";

    return `<!DOCTYPE html>
<html lang="${locale.lang}" dir="${locale.dir}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(locale.meta.description)}">
    <meta name="keywords" content="${escapeHtml(locale.meta.keywords)}">
    <meta property="og:title" content="${escapeHtml(locale.meta.ogTitle)}">
    <meta property="og:description" content="${escapeHtml(locale.meta.ogDescription)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <title>${escapeHtml(locale.meta.title)}</title>

    <!-- Canonical & Hreflang -->
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="alternate" hreflang="en" href="${escapeHtml(enHref)}">
    <link rel="alternate" hreflang="ar" href="${escapeHtml(arHref)}">

    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preload" as="image" href="${escapeHtml(siteConfig.headshotPath)}" fetchpriority="high">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="icon" type="image/jpeg" href="${escapeHtml(siteConfig.faviconPath)}">
    <link rel="apple-touch-icon" href="${escapeHtml(siteConfig.faviconPath)}">
    <!-- Google Fonts -->
    <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="css/style.css">${includeArabicCss}
    <link rel="stylesheet" href="css/responsive.css">

    <!-- Structured Data -->
    <script type="application/ld+json">
${structuredDataFor(locale)}
    </script>
</head>

<body class="${escapeHtml(locale.bodyClass)}" data-contact-endpoint="${escapeHtml(siteConfig.contactEndpointDefault)}">
    <a href="#main-content" class="skip-link">${escapeHtml(locale.skipLink)}</a>
    <!-- Animated Background -->
    <div class="animated-bg"></div>

    <!-- Language Switcher -->
    <div class="lang-switcher-wrap">
        <a href="${escapeHtml(locale.langSwitchHref)}" id="lang-switch" class="lang-switch-btn">
            <i class="fas fa-globe"></i>${escapeHtml(locale.langSwitchLabel)}
        </a>
    </div>

    <!-- Navigation${rtlComment} -->
    <nav class="navbar" id="navbar" aria-label="${escapeHtml(locale.aria.navPrimary)}">
        <div class="container nav-inner">
            <a href="#home" class="logo" aria-label="${escapeHtml(locale.aria.goHome)}">
                <span class="logo-text">${escapeHtml(locale.logoText)}</span>
            </a>
            <ul class="nav-links${rtlNavClass}">
${navLinks(locale, "nav-link")}
            </ul>
            <button class="mobile-menu-toggle" id="mobile-menu-btn" aria-label="${escapeHtml(
                locale.aria.openMenu
            )}" aria-controls="mobile-menu"
                aria-expanded="false">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </nav>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="mobile-menu ${mobileMenuClosedClass}" role="dialog" aria-modal="true" aria-hidden="true">
        <button class="mobile-close-btn" id="close-mobile-menu" aria-label="${escapeHtml(locale.aria.closeMenu)}">
            <i class="fas fa-times"></i>
        </button>
        <div class="mobile-menu-inner">
${mobileNavLinks(locale)}
        </div>
    </div>

    <main id="main-content">
    <!-- Hero Section -->
    <section id="home" class="hero-section">
        <!-- Animated Background Elements -->
        <div class="hero-bg-shapes">
            <div class="floating-shape shape-1"></div>
            <div class="floating-shape shape-2"></div>
            <div class="floating-shape shape-3"></div>
        </div>

        <div class="container hero-grid">
            <div class="animate-fade-in-up">
                <p class="hero-kicker">${escapeHtml(locale.hero.kicker)}</p>
                <h1 class="hero-title">
                    ${escapeHtml(locale.hero.titlePrefix)} <span class="text-accent">
                        ${escapeHtml(locale.hero.titleAccent)}
                        <svg class="underline-svg" viewBox="0 0 200 12" preserveAspectRatio="none">
                            <path d="M0,8 Q50,0 100,8 T200,8" stroke="#0d9488" stroke-width="3" fill="none"
                                class="underline-path" />
                        </svg>
                    </span>${titleSuffix}
                </h1>
                <p class="hero-subtitle">
                    <i class="fas fa-map-marker-alt icon-accent"></i>${escapeHtml(locale.hero.subtitleLocation)}
                    <span class="mx-3">|</span>
                    <i class="fas fa-language icon-accent"></i>${escapeHtml(locale.hero.subtitleLanguages)}
                </p>
                <p class="hero-desc">${escapeHtml(locale.hero.description)}</p>
                <div class="hero-buttons">
                    <a href="#contact" class="btn-primary">
                        <i class="fas fa-briefcase"></i>${escapeHtml(locale.hero.ctaPrimary)}
                    </a>
                    <a href="#portfolio" class="btn-secondary">
                        <i class="fas fa-folder-open"></i>${escapeHtml(locale.hero.ctaSecondary)}
                    </a>
                </div>
                <div class="skill-badges">
${heroBadges(locale)}
                </div>
            </div>
            <div class="hero-image-wrap animate-fade-in${heroImageRtlClass}">
                <div class="hero-image-container">
                    <div class="hero-image-glow"></div>
                    <img src="${escapeHtml(siteConfig.headshotPath)}" alt="${escapeHtml(locale.meta.ogTitle)}"
                        class="hero-image" loading="eager" fetchpriority="high" decoding="async">
                </div>
            </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="scroll-indicator">
            <a href="#about" class="text-accent">
                <i class="fas fa-chevron-down"></i>
            </a>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="section-white reveal-section">
        <div class="container">
            <h2 class="section-title">${escapeHtml(locale.about.title)}</h2>
            <div class="about-grid">
                <div class="about-content">
                    <h3 class="subsection-title">${escapeHtml(locale.about.subtitle)}</h3>
${aboutParagraphs(locale)}

                    <!-- Stats -->
                    <div class="stats-grid">
${statsCards(locale)}
                    </div>
                </div>
                <div>
                    <div class="quick-facts-card">
                        <h4 class="quick-facts-title">
                            <i class="fas fa-info-circle icon-accent"></i>${escapeHtml(locale.about.quickFactsTitle)}
                        </h4>
                        <ul class="quick-facts-list">
${quickFactItems(locale)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="section-gradient reveal-section">
        <div class="container">
            <h2 class="section-title">${escapeHtml(locale.services.title)}</h2>
            <div class="services-grid">
${services(locale)}
            </div>
        </div>
    </section>

    <!-- Experience Section -->
    <section id="experience" class="section-white reveal-section">
        <div class="container">
            <h2 class="section-title">${escapeHtml(locale.experience.title)}</h2>
            <div class="timeline${timelineRtlClass}">
${experienceItems(locale)}
            </div>
        </div>
    </section>

    <!-- Portfolio Section -->
    <section id="portfolio" class="section-gradient reveal-section">
        <div class="container">
            <h2 class="section-title">${escapeHtml(locale.portfolio.title)}</h2>
            <div class="portfolio-grid">
${portfolioItems(locale)}
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section-white reveal-section">
        <div class="container">
            <h2 class="section-title">${escapeHtml(locale.contact.title)}</h2>
            <div class="contact-grid">
                <div>
                    <h3 class="subsection-title">${escapeHtml(locale.contact.subtitle)}</h3>
                    <p class="text-body contact-intro">${escapeHtml(locale.contact.description)}</p>
                    <div class="contact-list">
                        <a href="tel:${escapeHtml(siteConfig.phoneRaw)}" class="contact-item">
                            <div class="contact-icon">
                                <i class="fas fa-phone"></i>
                            </div>
                            <span>${escapeHtml(siteConfig.phoneDisplay)}</span>
                        </a>
                        <a href="mailto:${escapeHtml(siteConfig.email)}" class="contact-item">
                            <div class="contact-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <span>${escapeHtml(siteConfig.email)}</span>
                        </a>
                        <div class="contact-item">
                            <div class="contact-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <span>${escapeHtml(locale.contact.location)}</span>
                        </div>
                        <a href="${escapeHtml(siteConfig.linkedinUrl)}" target="_blank" rel="noopener noreferrer" class="contact-item">
                            <div class="contact-icon linkedin">
                                <i class="fab fa-linkedin-in"></i>
                            </div>
                            <span>${escapeHtml(siteConfig.siteName)}</span>
                        </a>
                    </div>

                    <!-- WhatsApp Button -->
                    <a href="${escapeHtml(locale.contact.whatsappLink)}"
                        class="whatsapp-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-whatsapp"></i>
                        ${escapeHtml(locale.contact.whatsappText)}
                    </a>
                </div>
                <div>
                    <form id="contact-form" class="contact-form">
                        <div class="form-group">
                            <input type="text" id="name" name="name" autocomplete="name" aria-label="${escapeHtml(
                                nameAriaLabel
                            )}" placeholder="${escapeHtml(
                                locale.contact.form.namePlaceholder
                            )}" required>
                        </div>
                        <div class="form-group">
                            <input type="email" id="email" name="email" autocomplete="email" aria-label="${escapeHtml(
                                emailAriaLabel
                            )}" placeholder="${escapeHtml(
                                locale.contact.form.emailPlaceholder
                            )}" required>
                        </div>
                        <div class="form-group">
                            <select id="inquiry-type" name="inquiry-type" aria-label="${escapeHtml(
                                inquiryAriaLabel
                            )}">
${inquiryOptions(locale)}
                            </select>
                        </div>
                        <div class="form-group">
                            <textarea id="message" name="message" rows="4" aria-label="${escapeHtml(
                                messageAriaLabel
                            )}" placeholder="${escapeHtml(
                                locale.contact.form.messagePlaceholder
                            )}" required></textarea>
                        </div>
                        <button type="submit" class="btn-primary btn-full">
                            <i class="fas fa-paper-plane"></i>${escapeHtml(locale.contact.form.submitLabel)}
                        </button>
                        <p id="form-status" class="form-status hidden" aria-live="polite"></p>
                    </form>
                </div>
            </div>
        </div>
    </section>

    </main>
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div>
                    <h4 class="footer-logo">${escapeHtml(locale.logoText)}</h4>
                    <p class="footer-desc">${escapeHtml(locale.footer.description)}</p>
                </div>
                <div>
                    <h5 class="footer-heading">${escapeHtml(locale.footer.quickLinks)}</h5>
                    <ul class="footer-links">
${footerLinks(locale)}
                    </ul>
                </div>
                <div>
                    <h5 class="footer-heading">${escapeHtml(locale.footer.connect)}</h5>
                    <div class="social-links">
                        <a href="${escapeHtml(siteConfig.linkedinUrl)}" target="_blank" rel="noopener noreferrer" class="social-link">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                        <a href="mailto:${escapeHtml(siteConfig.email)}" class="social-link">
                            <i class="fas fa-envelope"></i>
                        </a>
                        <a href="https://wa.me/971557177083" target="_blank" rel="noopener noreferrer" class="social-link">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p class="footer-copyright">&copy; <span id="current-year">2026</span> ${escapeHtml(
                    siteConfig.siteName
                )}. ${escapeHtml(locale.footer.rights)}
                </p>
                <p class="footer-tagline">${escapeHtml(locale.footer.tagline)}</p>
            </div>
        </div>
    </footer>

    <!-- PDF Viewer Modal -->
    <div id="pdf-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="pdf-title"
        aria-hidden="true">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="pdf-title" class="modal-title"></h3>
                <button id="close-modal" class="modal-close" aria-label="${escapeHtml(
                    locale.aria.closeDocument
                )}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <iframe id="pdf-viewer" class="modal-body" frameborder="0"></iframe>
        </div>
    </div>

    <script type="module" src="js/main.js"></script>
</body>

</html>
`;
};

const renderRobots = () => `User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteConfig.baseUrl}/sitemap.xml

# Allow all assets
Allow: /assets/
Allow: /css/
Allow: /js/
`;

const renderSitemap = () => {
    const now = new Date().toISOString().slice(0, 10);
    const en = `${siteConfig.baseUrl}/`;
    const ar = `${siteConfig.baseUrl}/ar.html`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <url>
        <loc>${en}</loc>
        <lastmod>${now}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
        <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
        <xhtml:link rel="alternate" hreflang="ar" href="${ar}"/>
    </url>
    <url>
        <loc>${ar}</loc>
        <lastmod>${now}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
        <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
        <xhtml:link rel="alternate" hreflang="ar" href="${ar}"/>
    </url>
</urlset>
`;
};

const writeGeneratedFiles = async () => {
    const enPage = renderPage("en", localeMap.en);
    const arPage = renderPage("ar", localeMap.ar);

    await fs.writeFile(path.join(publicDir, "index.html"), enPage, "utf8");
    await fs.writeFile(path.join(publicDir, "ar.html"), arPage, "utf8");
    await fs.writeFile(path.join(publicDir, "robots.txt"), renderRobots(), "utf8");
    await fs.writeFile(path.join(publicDir, "sitemap.xml"), renderSitemap(), "utf8");
};

writeGeneratedFiles()
    .then(() => {
        console.log("Generated pages and SEO files in /public");
    })
    .catch((error) => {
        console.error("Failed to generate pages:", error);
        process.exitCode = 1;
    });
