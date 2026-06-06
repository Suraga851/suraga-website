/**
 * Typing Animation
 * Types out text character by character with optional cursor.
 */

export function initTypingAnimation() {
    const elements = document.querySelectorAll('[data-typing]');
    
    elements.forEach(el => {
        const text = el.getAttribute('data-typing');
        const speed = parseInt(el.getAttribute('data-typing-speed') || '50', 10);
        const delay = parseInt(el.getAttribute('data-typing-delay') || '0', 10);
        const cursor = el.getAttribute('data-typing-cursor') !== 'false';
        const loop = el.getAttribute('data-typing-loop') === 'true';
        
        if (!text) return;
        
        // Store original text
        el.dataset.originalText = text;
        el.textContent = '';
        
        if (cursor) {
            el.classList.add('typing-cursor');
        }
        
        setTimeout(() => {
            typeText(el, text, 0, speed, cursor, loop);
        }, delay);
    });
}

function typeText(el, text, index, speed, cursor, loop) {
    if (index <= text.length) {
        el.textContent = text.slice(0, index);
        index++;
        setTimeout(() => typeText(el, text, index, speed, cursor, loop), speed + Math.random() * 50);
    } else if (loop) {
        // Pause then delete
        setTimeout(() => deleteText(el, text.length, speed, cursor, loop), 2000);
    } else if (cursor) {
        // Remove cursor after finishing
        el.classList.remove('typing-cursor');
    }
}

function deleteText(el, index, speed, cursor, loop) {
    if (index >= 0) {
        const fullText = el.dataset.originalText || '';
        el.textContent = fullText.slice(0, index);
        index--;
        setTimeout(() => deleteText(el, index, speed, cursor, loop), speed / 2);
    } else {
        setTimeout(() => typeText(el, el.dataset.originalText, 0, speed, cursor, loop), 500);
    }
}
