import { FaUniversalAccess, FaStar, FaLanguage, FaUsers, FaChartLine, FaGraduationCap } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { motion } from 'framer-motion';

interface ServiceCardProps {
    icon: IconType;
    title: string;
    description: string;
    index: number;
}

function ServiceCard({ icon: Icon, title, description, index }: ServiceCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group glass-card rounded-[2rem] p-10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2"
        >
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-teal-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                <Icon className="text-slate-950 text-3xl" />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-lg">{description}</p>
        </motion.div>
    );
}

const services = [
    {
        icon: FaUniversalAccess,
        title: "Inclusion Support",
        description: "Specialized strategies for Students of Determination, ensuring every learner thrives in inclusive environments."
    },
    {
        icon: FaStar,
        title: "Enrichment",
        description: "Challenging and engaging Gifted & Talented learners through differentiated materials and advanced pedagogy."
    },
    {
        icon: FaLanguage,
        title: "Bilingual Support",
        description: "Specialized assistance in Arabic/Islamic studies, bridging language gaps within international curricula."
    },
    {
        icon: FaUsers,
        title: "Cultural Bridge",
        description: "Facilitating communication between Arabic-speaking families and international school staff with sensitivity."
    },
    {
        icon: FaChartLine,
        title: "Literacy Focus",
        description: "Evidence-based reading interventions using SPIRE and PAST assessments to boost student confidence."
    },
    {
        icon: FaGraduationCap,
        title: "Curriculum Specialist",
        description: "Support across British (Cambridge/IPC), American (Common Core), and IB frameworks for all grade levels."
    }
];

export default function Services() {
    return (
        <section id="services" className="py-32 relative">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-5xl md:text-6xl font-black mb-4">
                        <span className="text-white/20">02.</span> <span className="premium-gradient-text">Specialized</span> Services
                    </h2>
                    <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
