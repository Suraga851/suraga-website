import { FaFilePdf, FaCertificate, FaEye } from 'react-icons/fa';

interface PortfolioItemProps {
    title: string;
    subtitle: string;
    type: 'pdf' | 'certificate';
}

function PortfolioItem({ title, subtitle, type }: PortfolioItemProps) {
    const Icon = type === 'pdf' ? FaFilePdf : FaCertificate;
    const iconBg = type === 'pdf' ? 'from-red-500 to-red-700' : 'from-amber-500 to-amber-700';

    return (
        <div className="group cursor-pointer">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-4">{subtitle}</p>
                <span className="inline-flex items-center gap-2 text-teal-400 text-sm group-hover:gap-3 transition-all">
                    <FaEye />
                    View Document
                </span>
            </div>
        </div>
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
        <section id="portfolio" className="py-24 relative">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16">
                    Credentials & <span className="text-teal-400">Portfolio</span>
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {documents.map((doc, index) => (
                        <PortfolioItem key={index} {...doc} />
                    ))}
                </div>
            </div>
        </section>
    );
}
