import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaGlobe } from 'react-icons/fa';

const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#experience', label: 'Experience' },
    { href: '#portfolio', label: 'Portfolio' },
    { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <a href="#home" className="text-2xl font-bold">
                        <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">SE</span>
                    </a>

                    <ul className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className="text-gray-300 hover:text-teal-400 transition-colors font-medium"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-4">
                        <a
                            href="ar.html"
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-full text-white text-sm transition-colors"
                        >
                            <FaGlobe />
                            العربية
                        </a>

                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden text-teal-400 p-2"
                        >
                            <FaBars className="text-2xl" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-slate-900 z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 p-2"
                >
                    <FaTimes className="text-2xl" />
                </button>

                <div className="flex flex-col items-center justify-center h-full space-y-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-2xl text-gray-300 hover:text-teal-400 transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        href="ar.html"
                        className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-full text-white transition-colors"
                    >
                        <FaGlobe />
                        العربية
                    </a>
                </div>
            </div>
        </>
    );
}
