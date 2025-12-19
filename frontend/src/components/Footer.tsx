import { FaLinkedinIn, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 py-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-12 mb-12">
                    <div>
                        <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                            SE
                        </h4>
                        <p className="text-gray-400 leading-relaxed">
                            Professional Learning Assistant specializing in inclusive education and bilingual support for Dubai's international schools.
                        </p>
                    </div>

                    <div>
                        <h5 className="font-semibold mb-6 text-white">Quick Links</h5>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="#about" className="hover:text-teal-400 transition-colors">About</a></li>
                            <li><a href="#services" className="hover:text-teal-400 transition-colors">Services</a></li>
                            <li><a href="#experience" className="hover:text-teal-400 transition-colors">Experience</a></li>
                            <li><a href="#contact" className="hover:text-teal-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-semibold mb-6 text-white">Connect</h5>
                        <div className="flex gap-4">
                            <a
                                href="https://linkedin.com/in/suraga-elzibaer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-slate-800 hover:bg-teal-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-400 transition-all"
                            >
                                <FaLinkedinIn />
                            </a>
                            <a
                                href="mailto:suragaelzibaer@gmail.com"
                                className="w-12 h-12 bg-slate-800 hover:bg-teal-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-400 transition-all"
                            >
                                <FaEnvelope />
                            </a>
                            <a
                                href="https://wa.me/971557177083"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-slate-800 hover:bg-teal-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-400 transition-all"
                            >
                                <FaWhatsapp />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center">
                    <p className="text-gray-500">
                        &copy; {new Date().getFullYear()} Suraga Elzibaer. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Designed for Dubai's International Education Community
                    </p>
                </div>
            </div>
        </footer>
    );
}
