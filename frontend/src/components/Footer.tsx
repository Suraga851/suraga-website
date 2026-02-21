import { FaLinkedinIn, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <footer className="relative py-20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-12 gap-16 mb-20">
                    <div className="md:col-span-5">
                        <motion.h4
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-4xl font-black mb-8 premium-gradient-text"
                        >
                            SE
                        </motion.h4>
                        <p className="text-xl text-gray-500 leading-relaxed max-w-sm">
                            Empowering students through <span className="text-white font-medium">inclusive excellence</span> and specialized support in Dubai's premier international schools.
                        </p>
                    </div>

                    <div className="md:col-span-3">
                        <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Navigation</h5>
                        <ul className="space-y-4">
                            {['About', 'Services', 'Experience', 'Portfolio', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a href={`#${item.toLowerCase()}`} className="text-lg text-gray-500 hover:text-primary transition-colors font-medium">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-4">
                        <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Connect</h5>
                        <div className="flex gap-4">
                            {[
                                { icon: FaLinkedinIn, href: 'https://linkedin.com/in/suraga-elzibaer' },
                                { icon: FaEnvelope, href: 'mailto:suragaelzibaer@gmail.com' },
                                { icon: FaWhatsapp, href: 'https://wa.me/971557177083' }
                            ].map((social, i) => (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                    className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl text-gray-400 hover:text-primary transition-all shadow-xl"
                                >
                                    <social.icon />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-gray-600 font-medium">
                        &copy; {new Date().getFullYear()} Suraga Elzibaer. <span className="hidden md:inline">Built with excellence in Dubai.</span>
                    </p>
                    <div className="flex items-center gap-8">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-700">Arabic • English</span>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-700">Inclusive Education</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
