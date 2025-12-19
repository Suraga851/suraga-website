"use strict";
// Main Website Functionality in TypeScript
// DOM Elements
const mobileBtn = document.getElementById('mobile-menu-btn');
const closeBtn = document.getElementById('close-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.mobile-nav-link');
const navbar = document.getElementById('navbar');
// Mobile Menu Logic
if (mobileBtn && closeBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full', '-translate-x-full'); // Remove both potential rtl/ltr classes
        mobileMenu.classList.remove('opacity-0');
        document.body.style.overflow = 'hidden';
    });
    const closeMenu = () => {
        // Check RTL to decide direction
        const isRtl = document.documentElement.dir === 'rtl';
        mobileMenu.classList.add(isRtl ? '-translate-x-full' : 'translate-x-full');
        document.body.style.overflow = 'auto';
    };
    closeBtn.addEventListener('click', closeMenu);
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}
// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (!navbar)
        return;
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-md', 'py-2');
        navbar.classList.remove('py-3');
    }
    else {
        navbar.classList.remove('shadow-md', 'py-2');
        navbar.classList.add('py-3');
    }
});
// PDF Modal Logic
const modal = document.getElementById('pdf-modal');
const modalItems = document.querySelectorAll('.portfolio-item');
const closeModal = document.getElementById('close-modal');
const pdfViewer = document.getElementById('pdf-viewer');
const pdfTitle = document.getElementById('pdf-title');
if (modal && closeModal && pdfViewer && pdfTitle) {
    modalItems.forEach(item => {
        item.addEventListener('click', () => {
            const docName = item.dataset.doc;
            const title = item.querySelector('h3').innerText;
            if (docName) {
                pdfViewer.src = `assets/docs/${docName}.pdf`;
                pdfTitle.innerText = title;
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    const hideModal = () => {
        modal.classList.add('hidden');
        pdfViewer.src = '';
        document.body.style.overflow = 'auto';
    };
    closeModal.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
            hideModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            hideModal();
        }
    });
    // Form Logic
    const initForm = () => {
        const form = document.getElementById('contact-form');
        if (!form)
            return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
            btn.disabled = true;
            // Using FormSubmit.co
            const email = "suragaelzibaer@gmail.com";
            const formData = new FormData();
            const nameEl = document.getElementById('name');
            const emailEl = document.getElementById('email');
            const messageEl = document.getElementById('message');
            const inquiryEl = document.getElementById('inquiry-type');
            formData.append('name', nameEl.value);
            formData.append('email', emailEl.value);
            formData.append('message', messageEl.value);
            formData.append('_subject', `New ${inquiryEl.value} from ${nameEl.value}`);
            fetch(`https://formsubmit.co/ajax/${email}`, {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                alert('Thank you! Your message has been sent successfully.');
                form.reset();
            })
                .catch(error => {
                console.error('Error:', error);
                alert('Something went wrong. Please try again or contact me directly via WhatsApp.');
            })
                .finally(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        });
    };
    initForm();
}
// Current Year Update
const yearSpan = document.getElementById('current-year');
if (yearSpan) {
    yearSpan.innerText = new Date().getFullYear().toString();
}
