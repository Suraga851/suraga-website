import { FaMapMarkerAlt, FaFlag, FaLanguage, FaIdCard, FaClock } from 'react-icons/fa';

interface StatCardProps {
    number: string;
    label: string;
}

function StatCard({ number, label }: StatCardProps) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-700/50 hover:border-teal-500/50 transition-all">
            <span className="text-4xl font-bold text-teal-400 block mb-2">{number}</span>
            <span className="text-gray-400 text-sm">{label}</span>
        </div>
    );
}

export default function About() {
    return (
        <section id="about" className="py-24 relative">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16">
                    <span className="text-teal-400">About</span> Me
                </h2>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-2xl font-semibold text-teal-400">Bilingual Education Professional</h3>
                        <p className="text-gray-300 leading-relaxed">
                            With a strong foundation in Classical Arabic and Islamic education from Sudan, I bring a unique perspective to Dubai's international school community. My secondary education in a rigorous Arabic-medium environment equips me to support students transitioning between Arabic and English curricula.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            Currently based in Dubai with active UAE residency, I specialize in inclusive education practices that honor cultural diversity while meeting international standards. My experience spans British-style and American curriculum schools, working with students aged 4-18.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            Fluent in both Arabic and English (C2 level), I serve as a bridge between home and school cultures, ensuring every student feels valued and understood.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-8">
                            <StatCard number="3+" label="Years Experience" />
                            <StatCard number="100+" label="Students Supported" />
                            <StatCard number="2" label="Languages" />
                        </div>
                    </div>

                    {/* Quick Facts */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
                        <h4 className="font-semibold text-xl mb-6 flex items-center gap-3">
                            <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                            Quick Facts
                        </h4>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-center gap-4">
                                <FaMapMarkerAlt className="text-teal-400 w-5" />
                                <span><strong className="text-white">Location:</strong> Dubai, UAE</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <FaFlag className="text-teal-400 w-5" />
                                <span><strong className="text-white">Nationality:</strong> Sudanese</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <FaLanguage className="text-teal-400 w-5" />
                                <span><strong className="text-white">Languages:</strong> Arabic (Native), English (C2)</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <FaIdCard className="text-teal-400 w-5" />
                                <span><strong className="text-white">Visa Status:</strong> UAE Residency</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <FaClock className="text-teal-400 w-5" />
                                <span><strong className="text-white">Availability:</strong> Immediate</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
