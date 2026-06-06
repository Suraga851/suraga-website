/**
 * Hover Tilt Effect
 * 3D tilt on cards following cursor position.
 */

export function initHoverTilt() {
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    if (!tiltCards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    tiltCards.forEach(card => {
        const maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 8;
        const perspective = parseInt(card.getAttribute('data-tilt-perspective') || '1000', 10);
        const scale = parseFloat(card.getAttribute('data-tilt-scale')) || 1.02;
        const glare = card.getAttribute('data-tilt-glare') === 'true';
        
        let glareEl = null;
        if (glare) {
            glareEl = document.createElement('div');
            glareEl.className = 'tilt-glare';
            card.appendChild(glareEl);
        }
        
        card.style.transformStyle = 'preserve-3d';
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / (rect.width / 2);
            const deltaY = (e.clientY - centerY) / (rect.height / 2);
            
            const rotateY = deltaX * maxTilt;
            const rotateX = -deltaY * maxTilt;
            
            card.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
            
            if (glareEl) {
                const glareX = (deltaX + 1) / 2 * 100;
                const glareY = (deltaY + 1) / 2 * 100;
                glareEl.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 70%)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            if (glareEl) {
                glareEl.style.background = 'transparent';
            }
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
        });
    });
}
