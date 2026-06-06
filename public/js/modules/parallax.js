/**
 * Parallax Hero Image
 * Subtle depth effect on hero image during scroll.
 */

export function initParallaxHero() {
    const heroImage = document.querySelector('.hero-image');
    const heroContainer = document.querySelector('.hero-image-container');
    const heroSection = document.querySelector('.hero-section');
    
    if (!heroImage || !heroSection) return;
    
    let ticking = false;
    let lastScrollY = 0;
    
    function update() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const sectionRect = heroSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Only animate when section is in view
        if (sectionRect.bottom < 0 || sectionRect.top > viewportHeight) {
            ticking = false;
            return;
        }
        
        // Parallax intensity (0.1 = subtle, 0.3 = pronounced)
        const intensity = 0.15;
        const translateY = (scrollY - lastScrollY) * intensity;
        
        // Apply to image
        heroImage.style.transform = `translateY(${translateY}px) scale(1.02)`;
        
        // Subtle container rotation for 3D feel
        if (heroContainer) {
            const rotateX = Math.min(Math.max(translateY * 0.05, -3), 3);
            heroContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg)`;
        }
        
        ticking = false;
    }
    
    function onScroll() {
        lastScrollY = window.scrollY || document.documentElement.scrollTop;
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
}
