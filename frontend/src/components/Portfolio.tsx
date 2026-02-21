import { FaFilePdf, FaCertificate, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface PortfolioItemProps {
    title: string;
    subtitle: string;
    type: 'pdf' | 'certificate';
    index: number;
}

function PortfolioItem({ title, subtitle, type, index }: PortfolioItemProps) {
    const Icon = type === 'pdf' ? FaFilePdf : FaCertificate;
    const iconBg = type === 'pdf' ? 'from-red-500/20 to-red-600/20 text-red-400' : 'from-amber-500/20 to-amber-600/20 text-amber-400';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group cursor-pointer"
        >
            <div className="glass-card rounded-[2.5rem] p-10 hover:border-primary/50 transition-all duration-500 relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className={`w-20 h-20 bg-gradient-to-br ${iconBg} rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl`}>
                    <Icon className="text-4xl" />
                </div>

                <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-gray-500 font-bold mb-8 text-lg">{subtitle}</p>

                <div className="mt-auto flex items-center gap-3 text-primary font-black uppercase tracking-widest text-sm group-hover:gap-5 transition-all">
                    <span>View Document</span>
                    <FaArrowRight />
                </div>
            </div>
        </motion.div>
    );
}

const documents = [
    {
        title: "Taaleem Experience Letter",
        subtitle: "Dubai Schools Al Khawaneej",
        type: 'pdf' as const
    },
    {
        title: "Unity High School Recommendation",
        subtitle: "Head of Primary",
        type: 'pdf' as const
    },
    {
        title: "Sudanese Secondary Certificate",
        subtitle: "Ashariqa Private School",
        type: 'certificate' as const
    }
];

export default function Portfolio() {
    return (
        <section id="portfolio" className="py-32 relative">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-5xl md:text-6xl font-black mb-4">
                        <span className="text-white/20">04.</span> Credentials & <span className="premium-gradient-text">Portfolio</span>
                    </h2>
                    <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {documents.map((doc, index) => (
                        <PortfolioItem key={index} {...doc} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
