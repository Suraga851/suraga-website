/**
 * Clipboard Module
 * Copy phone/email to clipboard with toast notification.
 */

export function initClipboard() {
    const clipboardButtons = document.querySelectorAll('[data-clipboard]');
    
    clipboardButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const text = btn.getAttribute('data-clipboard');
            const label = btn.getAttribute('data-clipboard-label') || 'Copied!';
            
            if (!text) return;
            
            try {
                await navigator.clipboard.writeText(text);
                showToast(label, 'success');
            } catch (err) {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showToast(label, 'success');
                } catch {
                    showToast('Failed to copy', 'error');
                }
                document.body.removeChild(textarea);
            }
        });
    });
}

function showToast(message, type = 'success') {
    // Remove existing toasts
    const existing = document.querySelector('.clipboard-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `clipboard-toast clipboard-toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('clipboard-toast--visible');
    });
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('clipboard-toast--visible');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
