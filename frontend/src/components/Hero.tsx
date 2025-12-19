import { FaMapMarkerAlt, FaLanguage, FaBriefcase, FaFolderOpen } from 'react-icons/fa';

export default function Hero() {
    return (
        <section id="home" className="min-h-screen flex items-center relative pt-20">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in-up">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        Learning Assistant &amp; <br />
                        <span className="text-teal-400 relative inline-block">
                            Inclusive Education
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none">
                                <path d="M0,8 Q50,0 100,8 T200,8" stroke="#0d9488" strokeWidth="3" fill="none" className="animate-draw" />
                            </svg>
                        </span>
                        <br />Specialist
                    </h1>

                    <p className="text-xl mb-6 text-gray-400 flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-teal-400" />
                            Dubai, UAE
                        </span>
                        <span className="text-gray-600">|</span>
                        <span className="flex items-center gap-2">
                            <FaLanguage className="text-teal-400" />
                            Arabic Native • English C2
                        </span>
                    </p>

                    <p className="text-lg mb-8 text-gray-300 leading-relaxed max-w-xl">
                        Bridging cultures and curricula to support every learner's journey in British, American, and International Baccalaureate systems.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl font-semibold text-white transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25"
                        >
                            <FaBriefcase />
                            Hire Me
                        </a>
                        <a
                            href="#portfolio"
                            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 rounded-xl font-semibold transition-all"
                        >
                            <FaFolderOpen />
                            View Portfolio
                        </a>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3">
                        {['Differentiated Instruction', 'Students of Determination', 'Gifted & Talented', 'Arabic/Islamic Support'].map((skill) => (
                            <span
                                key={skill}
                                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm text-gray-300"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Profile Image */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                        <img
                            src="/assets/images/suraga-headshot.jpg"
                            alt="Suraga Elzibaer - Learning Assistant"
                            className="relative z-10 rounded-full w-64 h-64 md:w-80 md:h-80 object-cover shadow-2xl border-4 border-slate-800"
                        />
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <a href="#about" className="text-teal-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </a>
            </div>
        </section>
    );
}
