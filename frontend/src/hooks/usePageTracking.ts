import { useEffect } from 'react';
import { trackSectionView } from '../utils/analytics';

const usePageTracking = () => {
    useEffect(() => {
        const sections = ['home', 'about', 'services', 'experience', 'portfolio', 'contact'];

        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            console.warn("IntersectionObserver not supported");
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        trackSectionView(entry.target.id);
                    }
                });
            },
            {
                threshold: 0.5, // Trigger when 50% of the section is visible
            }
        );

        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            sections.forEach((id) => {
                const element = document.getElementById(id);
                if (element) {
                    observer.unobserve(element);
                }
            });
            observer.disconnect();
        };
    }, []);
};

export default usePageTracking;
