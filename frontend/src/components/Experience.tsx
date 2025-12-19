import { FaCalendarAlt } from 'react-icons/fa';

interface TimelineItemProps {
    title: string;
    company: string;
    period: string;
    responsibilities: string[];
    isCurrent?: boolean;
}

function TimelineItem({ title, company, period, responsibilities, isCurrent }: TimelineItemProps) {
    return (
        <div className="relative pl-8 pb-12 border-l-2 border-slate-700 last:pb-0">
            {/* Timeline dot */}
            <div className={`absolute left-0 top-0 w-4 h-4 rounded-full -translate-x-1/2 ${isCurrent ? 'bg-teal-400 ring-4 ring-teal-400/20' : 'bg-slate-600'}`}></div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-teal-500/30 transition-all">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h3 className="text-2xl font-semibold text-teal-400">{title}</h3>
                    {isCurrent && (
                        <span className="px-3 py-1 bg-teal-500/20 text-teal-400 text-sm rounded-full border border-teal-500/30">
                            Current
                        </span>
                    )}
                </div>
                <h4 className="text-lg text-gray-300 mb-3">{company}</h4>
                <p className="text-gray-500 flex items-center gap-2 mb-6">
                    <FaCalendarAlt className="text-teal-400" />
                    {period}
                </p>
                <ul className="space-y-3">
                    {responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-400">
                            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const experiences = [
    {
        title: "Learning & Teaching Assistant",
        company: "Dubai Schools Al Khawaneej (Taaleem), Dubai, UAE",
        period: "August 2024 – February 2025",
        responsibilities: [
            "Supported grades 6-7 in British-style curriculum delivery",
            "Developed differentiated materials for diverse learning needs",
            "Implemented inclusive strategies for Students of Determination",
            "Collaborated with SENCO and parents on student progress"
        ],
        isCurrent: true
    },
    {
        title: "Teaching Assistant",
        company: "Unity High School, Khartoum, Sudan",
        period: "September 2022 – July 2023",
        responsibilities: [
            "Delivered SPIRE reading intervention program across multiple year groups",
            "Administered Dr. Kilpatrick's PAST test for phonological assessment",
            "Assumed classroom teacher responsibilities for Humanities, Science, English",
            "Provided one-on-one support for Gifted & Talented students"
        ]
    }
];

export default function Experience() {
    return (
        <section id="experience" className="py-24 relative">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16">
                    Professional <span className="text-teal-400">Experience</span>
                </h2>

                <div className="max-w-3xl mx-auto">
                    {experiences.map((exp, index) => (
                        <TimelineItem key={index} {...exp} />
                    ))}
                </div>
            </div>
        </section>
    );
}
