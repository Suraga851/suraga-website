import { FaMapMarkerAlt, FaLanguage, FaBriefcase, FaFolderOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function Hero() {
    return (
        <section id="home" className="min-h-screen flex items-center relative overflow-hidden py-20">
            {/* Background decorative elements */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
                        Learning <br />
                        <span className="premium-gradient-text">Assistant</span> & <br />
                        Inclusive <br />
                        Education <br />
                        <span className="text-white/40 italic font-light">Specialist</span>
                    </motion.h1>

                    <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 mb-8">
                        <span className="flex items-center gap-2 text-gray-400 font-medium">
                            <FaMapMarkerAlt className="text-primary" />
                            Dubai, UAE
                        </span>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <span className="flex items-center gap-2 text-gray-400 font-medium">
                            <FaLanguage className="text-primary" />
                            Arabic Native • English C2
                        </span>
                    </motion.div>

                    <motion.p variants={itemVariants} className="text-xl text-gray-400 leading-relaxed max-w-xl mb-12">
                        Bridging cultures and curricula to support every learner's journey in <span className="text-white font-medium">British, American, and IB</span> systems.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-wrap gap-5">
                        <a
                            href="#contact"
                            className="group relative px-8 py-4 bg-primary text-slate-950 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <FaBriefcase className="relative z-10" />
                            <span className="relative z-10">Hire Me</span>
                        </a>
                        <a
                            href="#portfolio"
                            className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl font-black text-white transition-all flex items-center gap-3 active:scale-95 shadow-xl"
                        >
                            <FaFolderOpen className="text-primary" />
                            View Portfolio
                        </a>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-16 flex flex-wrap gap-3">
                        {['Differentiated Instruction', 'SEN support', 'Gifted & Talented', 'Arabic/Islamic Support'].map((skill) => (
                            <span
                                key={skill}
                                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:text-primary hover:border-primary/30 transition-all cursor-default"
                            >
                                {skill}
                            </span>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Profile Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden group shadow-2xl">
                        <img
                            src="/assets/images/suraga-headshot.jpg"
                            alt="Suraga Elzibaer"
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 border-[1.5rem] border-slate-950/20 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                    </div>

                    {/* Decorative Image Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 border-t-2 border-r-2 border-primary/20 rounded-tr-[3rem]"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 border-b-2 border-l-2 border-primary/20 rounded-bl-[3rem]"></div>

                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-8 top-1/4 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl z-20"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-white whitespace-nowrap">Available for Hire</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-6 h-12 border-2 border-white/10 rounded-full flex justify-center p-2">
                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 bg-primary rounded-full"
                    ></motion.div>
                </div>
            </motion.div>
        </section>
    );
}
