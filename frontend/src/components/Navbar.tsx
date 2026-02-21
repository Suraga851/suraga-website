import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaGlobe } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'py-4 glass-nav shadow-2xl' : 'py-6 bg-transparent'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <motion.a
                        href="#home"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-black tracking-tighter"
                    >
                        <span className="premium-gradient-text">SE</span>
                    </motion.a>

                    <div className="hidden md:flex items-center space-x-2">
                        <ul className="flex space-x-1">
                            {navLinks.map((link, i) => (
                                <motion.li
                                    key={link.href}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <a
                                        href={link.href}
                                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-primary transition-all rounded-full hover:bg-white/5"
                                    >
                                        {link.label}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>

                        <div className="h-6 w-px bg-white/10 mx-4"></div>

                        <motion.a
                            href="ar.html"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full text-primary text-sm font-bold transition-all"
                        >
                            <FaGlobe />
                            العربية
                        </motion.a>
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden text-primary p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <FaBars className="text-2xl" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[60] p-8 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <span className="premium-gradient-text text-3xl font-black">SE</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>

                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link, i) => (
                                <motion.a
                                    key={link.href}
                                    href={link.href}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-3xl font-bold text-gray-300 hover:text-primary transition-colors py-2 border-b border-white/5"
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                            <motion.a
                                href="ar.html"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-8 flex items-center justify-center gap-3 px-8 py-4 bg-primary text-slate-950 rounded-2xl font-black text-xl shadow-xl shadow-primary/20"
                            >
                                <FaGlobe />
                                العربية
                            </motion.a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
