import { motion } from 'framer-motion';

interface StatCardProps {
    number: string;
    label: string;
    index: number;
}

function StatCard({ number, label, index }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="glass-card rounded-3xl p-8 text-center group hover:border-primary/50 transition-all duration-500"
        >
            <span className="text-5xl font-black premium-gradient-text block mb-2">{number}</span>
            <span className="text-gray-400 text-sm font-bold tracking-widest uppercase">{label}</span>
        </motion.div>
    );
}

export default function About() {
    return (
        <section id="about" className="py-32 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-5xl md:text-6xl font-black mb-4">
                        <span className="text-white/20">01.</span> <span className="premium-gradient-text">About</span> Me
                    </h2>
                    <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
                </motion.div>

                <div className="grid md:grid-cols-12 gap-16 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="md:col-span-7 space-y-8"
                    >
                        <h3 className="text-3xl font-bold text-white leading-tight">
                            Bilingual Education Professional with a passion for <span className="text-primary italic">inclusive excellence.</span>
                        </h3>

                        <div className="space-y-6 text-xl text-gray-400 leading-relaxed">
                            <p>
                                With a strong foundation in Classical Arabic and Islamic education from Sudan, I bring a unique perspective to Dubai's international school community. I specialize in <span className="text-white font-medium">inclusive education practices</span> that honor cultural diversity.
                            </p>
                            <p>
                                Currently based in Dubai with active <span className="text-white font-medium">UAE residency</span>, my experience spans British-style and American curriculum schools, working with students aged 4-18.
                            </p>
                            <p>
                                Fluent in both <span className="text-white font-medium">Arabic and English (C2 level)</span>, I serve as a bridge between home and school cultures, ensuring every student feels valued and understood.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
                            <StatCard number="3+" label="Years Exp" index={0} />
                            <StatCard number="100+" label="Students" index={1} />
                            <StatCard number="Native" label="Bilingual" index={2} />
                        </div>
                    </motion.div>

                    {/* Quick Facts */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="md:col-span-5"
                    >
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>

                            <h4 className="font-black text-2xl mb-10 flex items-center gap-4">
                                <span className="w-3 h-10 bg-primary rounded-full"></span>
                                Quick Facts
                            </h4>

                            <ul className="space-y-6">
                                {[
                                    { label: 'Location', value: 'Dubai, UAE' },
                                    { label: 'Nationality', value: 'Sudanese' },
                                    { label: 'Languages', value: 'Arabic (Native), English (C2)' },
                                    { label: 'Residency', value: 'Active UAE Residency' },
                                    { label: 'Availability', value: 'Immediate' }
                                ].map((fact, i) => (
                                    <li key={i} className="flex flex-col border-b border-white/5 pb-4 last:border-0">
                                        <span className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{fact.label}</span>
                                        <span className="text-gray-200 font-bold text-lg">{fact.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
