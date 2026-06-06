/**
 * Animated Counters
 * Count up numbers when scrolled into view using IntersectionObserver.
 */

export function initAnimatedCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    if (!counters.length || !('IntersectionObserver' in window)) {
        return;
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter')) || 0;
    const duration = parseInt(el.getAttribute('data-counter-duration') || '1500', 10);
    const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const prefix = el.getAttribute('data-counter-prefix') || '';
    
    const startTime = performance.now();
    const startValue = 0;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = startValue + (target - startValue) * eased;
        
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = prefix + target.toFixed(decimals) + suffix;
        }
    }
    
    requestAnimationFrame(update);
}
