/**
 * Scroll Progress Bar
 * Thin progress indicator at top of viewport showing page scroll position.
 */

export function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    
    let ticking = false;
    
    function update() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        
        bar.style.transform = `scaleX(${progress / 100})`;
        ticking = false;
    }
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // Initial
}
