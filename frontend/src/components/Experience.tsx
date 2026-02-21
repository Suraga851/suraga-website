import { FaCalendarAlt, FaBriefcase } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface TimelineItemProps {
    title: string;
    company: string;
    period: string;
    responsibilities: string[];
    isCurrent?: boolean;
    index: number;
}

function TimelineItem({ title, company, period, responsibilities, isCurrent, index }: TimelineItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className="relative pl-12 pb-16 border-l-2 border-white/10 last:pb-0"
        >
            {/* Timeline dot */}
            <div className={`absolute left-0 top-0 w-6 h-6 rounded-full -translate-x-1/2 flex items-center justify-center ${isCurrent ? 'bg-primary shadow-[0_0_20px_rgba(45,212,191,0.5)]' : 'bg-slate-800 border-2 border-white/10'}`}>
                {isCurrent && <div className="w-2 h-2 bg-slate-950 rounded-full animate-ping"></div>}
            </div>

            <div className="glass-card rounded-[2rem] p-10 hover:border-primary/30 transition-all duration-500 group">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-3xl font-black text-white group-hover:text-primary transition-colors mb-2">{title}</h3>
                        <h4 className="text-xl text-primary/80 font-bold">{company}</h4>
                    </div>
                    <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-bold text-sm flex items-center gap-3">
                        <FaCalendarAlt className="text-primary" />
                        {period}
                    </div>
                </div>

                <ul className="space-y-4">
                    {responsibilities.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-gray-400 text-lg leading-relaxed">
                            <span className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0 shadow-[0_0_10px_rgba(45,212,191,0.3)]"></span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

const experiences = [
    {
        title: "Learning & Teaching Assistant",
        company: "Dubai Schools Al Khawaneej (Taaleem)",
        period: "Aug 2024 – Feb 2025",
        responsibilities: [
            "Leading differentiated material development for diverse learning needs across grades 6-7.",
            "Implementing inclusive strategies for Students of Determination in collaboration with SENCO.",
            "Facilitating seamless communication between Arabic-speaking families and school leadership.",
            "Delivering specialized support within the British-style curriculum framework."
        ],
        isCurrent: true
    },
    {
        title: "Teaching Assistant",
        company: "Unity High School, Khartoum",
        period: "Sep 2022 – Jul 2023",
        responsibilities: [
            "Delivered SPIRE reading intervention and PAST phonological assessments.",
            "Assumed full classroom responsibilities for Humanities, Science, and English.",
            "Provided targeted one-on-one enrichment for Gifted & Talented students.",
            "Contributed to a high-performance educational environment in an international setting."
        ]
    }
];

export default function Experience() {
    return (
        <section id="experience" className="py-32 relative">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-5xl md:text-6xl font-black mb-4">
                        <span className="text-white/20">03.</span> Professional <span className="premium-gradient-text">Experience</span>
                    </h2>
                    <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    {experiences.map((exp, index) => (
                        <TimelineItem key={index} {...exp} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
