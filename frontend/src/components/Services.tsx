import { FaUniversalAccess, FaStar, FaLanguage, FaUsers, FaChartLine, FaGraduationCap } from 'react-icons/fa';
import type { IconType } from 'react-icons';

interface ServiceCardProps {
    icon: IconType;
    title: string;
    description: string;
}

function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
    return (
        <div className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    );
}

const services = [
    {
        icon: FaUniversalAccess,
        title: "Students of Determination Support",
        description: "Individualized learning plans, behavioral support, and accommodations for students with special educational needs in inclusive classrooms."
    },
    {
        icon: FaStar,
        title: "Gifted & Talented Enrichment",
        description: "Advanced learning strategies, enrichment activities, and differentiated curriculum support for high-achieving students."
    },
    {
        icon: FaLanguage,
        title: "Arabic/Islamic Studies Support",
        description: "Specialized support for Arabic language acquisition and Islamic Studies integration within international curriculum frameworks."
    },
    {
        icon: FaUsers,
        title: "Cross-Cultural Bridging",
        description: "Facilitating communication between Arabic-speaking families and international school staff, ensuring cultural sensitivity."
    },
    {
        icon: FaChartLine,
        title: "Literacy Intervention",
        description: "Evidence-based reading support using SPIRE and PAST assessment methodologies for struggling readers."
    },
    {
        icon: FaGraduationCap,
        title: "Curriculum Support",
        description: "Assistance with British (Cambridge/IPC), American (Common Core), and IB curriculum delivery across all grade levels."
    }
];

export default function Services() {
    return (
        <section id="services" className="py-24 relative">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16">
                    Specialized <span className="text-teal-400">Services</span>
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>
            </div>
        </section>
    );
}
