"use strict";
// Main Website Functionality
// DOM Elements
const mobileBtn = document.getElementById('mobile-menu-btn');
const closeBtn = document.getElementById('close-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.mobile-nav-link');
const navbar = document.getElementById('navbar');

// Mobile Menu Logic
if (mobileBtn && closeBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full', '-translate-x-full');
        document.body.style.overflow = 'hidden';
    });
    const closeMenu = () => {
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
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add('nav-scrolled');
    } else {
        navbar.classList.remove('nav-scrolled');
    }
});

// Scroll-triggered Reveal Animations
const revealSections = document.querySelectorAll('.reveal-section');
if (revealSections.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealSections.forEach(section => {
        revealObserver.observe(section);
    });
}

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
}

// Contact Form Logic
const initForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Sending...';
        btn.disabled = true;

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

// Current Year Update
const yearSpan = document.getElementById('current-year');
if (yearSpan) {
    yearSpan.innerText = new Date().getFullYear().toString();
}
