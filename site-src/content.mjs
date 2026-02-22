export const siteConfig = {
    siteName: "Suraga Elzibaer",
    baseUrl: "https://suraga-website.onrender.com",
    email: "suragaelzibaer@gmail.com",
    phoneRaw: "+971557177083",
    phoneDisplay: "+971 55 7177 083",
    linkedinUrl: "https://linkedin.com/in/suraga-elzibaer",
    contactEndpointDefault: "https://formsubmit.co/ajax/suragaelzibaer@gmail.com",
    headshotPath: "assets/images/suraga-headshot.jpg",
    faviconPath: "assets/images/suraga-headshot.jpg",
    docs: [
        { key: "cv-suraga-dubai", icon: "pdf" },
        { key: "experience-letter-taaleem", icon: "pdf" },
        { key: "recommendation-unity", icon: "pdf" },
        { key: "secondary-certificate", icon: "cert" }
    ]
};

const shared = {
    navIds: ["home", "about", "services", "experience", "portfolio", "contact"],
    inquiryOptions: [
        { value: "job", key: "job" },
        { value: "collaboration", key: "collaboration" },
        { value: "general", key: "general" }
    ]
};

export const locales = {
    en: {
        lang: "en",
        dir: "ltr",
        path: "/",
        bodyClass: "body-default",
        logoText: "SE",
        langSwitchLabel: "Arabic",
        langSwitchHref: "ar.html",
        skipLink: "Skip to main content",
        aria: {
            navPrimary: "Primary",
            goHome: "Go to home section",
            openMenu: "Open menu",
            closeMenu: "Close menu",
            closeDocument: "Close document viewer"
        },
        meta: {
            title: "Suraga Elzibaer - Learning Assistant | Dubai",
            description:
                "Suraga Elzibaer - Bilingual Learning Assistant and AI Literacy Assistant Teacher in Dubai specializing in inclusive education, differentiated learning, and Arabic/Islamic support for international schools.",
            keywords:
                "Learning Assistant Dubai, AI Literacy Assistant Teacher Dubai, SEN support UAE, Bilingual Teacher, Arabic Islamic support, Differentiated Instruction, Inclusive Education, Responsible AI in education",
            ogTitle: "Suraga Elzibaer - Learning Assistant | Dubai",
            ogDescription:
                "Professional Learning Assistant and AI Literacy Assistant Teacher in Dubai with expertise in inclusive education and bilingual support"
        },
        schema: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Suraga Elzibaer",
            jobTitle: "Learning Assistant, AI Literacy Assistant Teacher & Inclusive Education Specialist",
            email: "suragaelzibaer@gmail.com",
            telephone: "+971557177083",
            address: {
                "@type": "PostalAddress",
                addressLocality: "Dubai",
                addressCountry: "AE"
            },
            knowsLanguage: ["Arabic", "English"],
            sameAs: ["https://linkedin.com/in/suraga-elzibaer"]
        },
        nav: {
            home: "Home",
            about: "About",
            services: "Services",
            experience: "Experience",
            portfolio: "Portfolio",
            contact: "Contact"
        },
        hero: {
            kicker: "Dubai-Based | Inclusive Education | Bilingual & AI Literacy Support",
            titlePrefix: "Learning Assistant &",
            titleAccent: "Inclusive Education",
            titleSuffix: "Specialist",
            subtitleLocation: "Dubai, UAE",
            subtitleLanguages: "Arabic Native | English C2",
            description:
                "Bridging cultures and curricula to support every learner's journey in British, American, and International Baccalaureate systems.",
            ctaPrimary: "Hire Me",
            ctaSecondary: "View Portfolio",
            badges: [
                "Differentiated Instruction",
                "Students of Determination",
                "Gifted & Talented",
                "Arabic/Islamic Support",
                "AI Literacy & EdTech Integration"
            ]
        },
        about: {
            title: "About Me",
            subtitle: "Bilingual & AI Literacy Education Professional",
            paragraphs: [
                "With a strong foundation in Classical Arabic and Islamic education from Sudan, I bring a unique perspective to Dubai's international school community. My secondary education in a rigorous Arabic-medium environment equips me to support students transitioning between Arabic and English curricula.",
                "Currently based in Dubai with active UAE residency, I specialize in inclusive education practices that honor cultural diversity while meeting international standards. My experience spans British-style and American curriculum schools, working with students aged 4-18.",
                "Fluent in both Arabic and English (C2 level), I serve as a bridge between home and school cultures, ensuring every student feels valued and understood.",
                "I also support AI literacy for students and teachers through age-appropriate AI tool use, prompt fundamentals, fact-checking routines, and responsible digital citizenship."
            ],
            stats: [
                { value: "3+", label: "Years Experience" },
                { value: "100+", label: "Students Supported" },
                { value: "2", label: "Languages" }
            ],
            quickFactsTitle: "Quick Facts",
            quickFacts: [
                { icon: "fa-map-marker-alt", label: "Location", value: "Dubai, UAE" },
                { icon: "fa-flag", label: "Nationality", value: "Sudanese" },
                { icon: "fa-language", label: "Languages", value: "Arabic (Native), English (C2)" },
                { icon: "fa-id-card", label: "Visa Status", value: "UAE Residency" },
                { icon: "fa-clock", label: "Availability", value: "Immediate" }
            ]
        },
        services: {
            title: "Specialized Services",
            items: [
                {
                    icon: "fa-universal-access",
                    title: "Students of Determination Support",
                    description:
                        "Individualized learning plans, behavioral support, and accommodations for students with special educational needs in inclusive classrooms."
                },
                {
                    icon: "fa-star",
                    title: "Gifted & Talented Enrichment",
                    description:
                        "Advanced learning strategies, enrichment activities, and differentiated curriculum support for high-achieving students."
                },
                {
                    icon: "fa-language",
                    title: "Arabic/Islamic Studies Support",
                    description:
                        "Specialized support for Arabic language acquisition and Islamic Studies integration within international curriculum frameworks."
                },
                {
                    icon: "fa-users",
                    title: "Cross-Cultural Bridging",
                    description:
                        "Facilitating communication between Arabic-speaking families and international school staff, ensuring cultural sensitivity."
                },
                {
                    icon: "fa-chart-line",
                    title: "Literacy Intervention",
                    description:
                        "Evidence-based reading support using SPIRE and PAST assessment methodologies for struggling readers."
                },
                {
                    icon: "fa-robot",
                    title: "AI Literacy & Responsible AI Use",
                    description:
                        "Age-appropriate AI literacy sessions, prompt basics, fact-checking, citation habits, and safe/ethical use of AI tools for students and teachers."
                },
                {
                    icon: "fa-graduation-cap",
                    title: "Curriculum Support",
                    description:
                        "Assistance with British (Cambridge/IPC), American (Common Core), and IB curriculum delivery across all grade levels."
                }
            ]
        },
        experience: {
            title: "Professional Experience",
            items: [
                {
                    role: "Learning & Teaching Assistant",
                    company: "Dubai Schools Al Khawaneej (Taaleem), Dubai, UAE",
                    period: "August 2024 - February 2025",
                    bullets: [
                        "Supported grades 6-7 in British-style curriculum delivery",
                        "Developed differentiated materials for diverse learning needs",
                        "Implemented inclusive strategies for Students of Determination",
                        "Collaborated with SENCO and parents on student progress",
                        "Supported classroom AI literacy activities and digital citizenship routines."
                    ]
                },
                {
                    role: "Teaching Assistant",
                    company: "Unity High School, Khartoum, Sudan",
                    period: "September 2022 - July 2023",
                    bullets: [
                        "Delivered SPIRE reading intervention program across multiple year groups",
                        "Administered Dr. Kilpatrick's PAST test for phonological assessment",
                        "Assumed classroom teacher responsibilities for Humanities, Science, English",
                        "Provided one-on-one support for Gifted & Talented students"
                    ]
                }
            ]
        },
        portfolio: {
            title: "Credentials & Portfolio",
            items: [
                { doc: "cv-suraga-dubai", title: "Professional CV (Dubai)", subtitle: "Updated Resume", type: "pdf" },
                {
                    doc: "experience-letter-taaleem",
                    title: "Taaleem Experience Letter",
                    subtitle: "Dubai Schools Al Khawaneej",
                    type: "pdf"
                },
                {
                    doc: "recommendation-unity",
                    title: "Unity High School Recommendation",
                    subtitle: "Head of Primary",
                    type: "pdf"
                },
                {
                    doc: "secondary-certificate",
                    title: "Sudanese Secondary Certificate",
                    subtitle: "Ashariqa Private School",
                    type: "cert"
                }
            ],
            actionText: "View Document"
        },
        contact: {
            title: "Get In Touch",
            subtitle: "Let's Collaborate",
            description:
                "I'm currently seeking opportunities with international schools in Dubai, including Learning Assistant and AI Literacy Assistant Teacher roles. Available for immediate placement with active UAE residency.",
            location: "Dubai, United Arab Emirates",
            whatsappLink:
                "https://wa.me/971557177083?text=Hello%20Suraga,%20I%20found%20your%20website%20and%20would%20like%20to%20discuss%20opportunities.",
            whatsappText: "Message on WhatsApp",
            form: {
                namePlaceholder: "Your Name",
                emailPlaceholder: "Your Email",
                messagePlaceholder: "Your Message",
                submitLabel: "Send Message",
                inquiryLabels: {
                    job: "Job Inquiry",
                    collaboration: "Collaboration",
                    general: "General Question"
                }
            }
        },
        footer: {
            description:
                "Professional Learning Assistant and AI Literacy Assistant Teacher specializing in inclusive education and bilingual support for Dubai's international schools.",
            quickLinks: "Quick Links",
            connect: "Connect",
            tagline: "Designed for Dubai's International Education Community",
            rights: "All rights reserved."
        }
    },
    ar: {
        lang: "ar",
        dir: "rtl",
        path: "/ar.html",
        bodyClass: "font-arabic body-default",
        logoText: "سـ",
        langSwitchLabel: "English",
        langSwitchHref: "index.html",
        skipLink: "تخطي إلى المحتوى الرئيسي",
        aria: {
            navPrimary: "التنقل الرئيسي",
            goHome: "الانتقال إلى القسم الرئيسي",
            openMenu: "فتح القائمة",
            closeMenu: "إغلاق القائمة",
            closeDocument: "إغلاق عارض المستند"
        },
        meta: {
            title: "سراجا الزبير - مساعد تعليم | دبي",
            description:
                "سراجا الزبير - مساعد تعليم ومعلم محو الأمية في الذكاء الاصطناعي في دبي متخصص في التعليم الشامل، التدريس المختلف، والدعم العربي/الإسلامي للمدارس الدولية",
            keywords:
                "مساعد تعليم دبي, معلم محو الأمية في الذكاء الاصطناعي دبي, دعم ذوي الاحتياجات الخاصة الإمارات, معلم ثنائي اللغة, دعم عربي إسلامي, التدريس المتمايز, التعليم الشامل",
            ogTitle: "سراجا الزبير - مساعد تعليم | دبي",
            ogDescription: "مساعد تعليم محترف ومعلم محو الأمية في الذكاء الاصطناعي في دبي متخصص في التعليم الشامل والدعم ثنائي اللغة"
        },
        schema: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: "سراجا الزبير",
            jobTitle: "مساعد تعليم ومعلم محو الأمية في الذكاء الاصطناعي ومتخصص في التعليم الشامل",
            email: "suragaelzibaer@gmail.com",
            telephone: "+971557177083",
            address: {
                "@type": "PostalAddress",
                addressLocality: "دبي",
                addressCountry: "AE"
            },
            knowsLanguage: ["Arabic", "English"],
            sameAs: ["https://linkedin.com/in/suraga-elzibaer"]
        },
        nav: {
            home: "الرئيسية",
            about: "نبذة عني",
            services: "خدماتي",
            experience: "خبراتي",
            portfolio: "ملفي",
            contact: "تواصل معي"
        },
        hero: {
            kicker: "دبي | تعليم شامل | دعم ثنائي اللغة | محو أمية الذكاء الاصطناعي",
            titlePrefix: "مساعد تعليم و",
            titleAccent: "متخصص في التعليم الشامل",
            titleSuffix: "",
            subtitleLocation: "دبي، الإمارات العربية المتحدة",
            subtitleLanguages: "اللغة الأم العربية | إنجليزي C2",
            description:
                "بناء الجسور بين الثقافات والمناهج لدعم رحلة كل متعلم في أنظمة المنهاج البريطاني والأمريكي والبكالوريا الدولية.",
            ctaPrimary: "وظفني",
            ctaSecondary: "عرض الملف",
            badges: ["التدريس المتمايز", "أصحاب الهمم", "الموهوبين والمتفوقين", "الدعم العربي/الإسلامي", "محو أمية الذكاء الاصطناعي"]
        },
        about: {
            title: "نبذة عني",
            subtitle: "متخصص تعليم ثنائي اللغة ومحو الأمية في الذكاء الاصطناعي",
            paragraphs: [
                "مع أساس قوي في اللغة العربية الفصحى والتعليم الإسلامي من السودان، أقدم منظوراً فريداً لمجتمع المدارس الدولية في دبي. تعليمي الثانوي في بيئة عربية صارمة يؤهلني لدعم الطلاب الذين ينتقلون بين المناهج العربية والإنجليزية.",
                "مقيم حالياً في دبي مع إقامة إماراتية سارية، أتخصص في ممارسات التعليم الشامل التي تحترم التنوع الثقافي مع الالتزام بالمعايير الدولية. خبرتي تمتد لتشمل مدارس المنهج البريطاني والأمريكي، مع طلاب تتراوح أعمارهم بين 4 و18 عاماً.",
                "أتقن كلاً من العربية والإنجليزية (مستوى C2)، وأعمل كجسر بين ثقافة المنزل والمدرسة، مما يضمن شعور كل طالب بالتقدير والفهم.",
                "أدعم أيضاً محو الأمية في الذكاء الاصطناعي للطلاب والمعلمين عبر تدريب مناسب للعمر على استخدام أدوات الذكاء الاصطناعي، وصياغة الأوامر، والتحقق من المعلومات، والمواطنة الرقمية المسؤولة."
            ],
            stats: [
                { value: "+3", label: "سنوات خبرة" },
                { value: "+100", label: "طالب تم دعمهم" },
                { value: "2", label: "لغات" }
            ],
            quickFactsTitle: "معلومات سريعة",
            quickFacts: [
                { icon: "fa-map-marker-alt", label: "الموقع", value: "دبي، الإمارات" },
                { icon: "fa-flag", label: "الجنسية", value: "سوداني" },
                { icon: "fa-language", label: "اللغات", value: "العربية (أم)، الإنجليزية (C2)" },
                { icon: "fa-id-card", label: "التأشيرة", value: "إقامة إماراتية" },
                { icon: "fa-clock", label: "التوفر", value: "فوري" }
            ]
        },
        services: {
            title: "خدماتي المتخصصة",
            items: [
                {
                    icon: "fa-universal-access",
                    title: "دعم أصحاب الهمم",
                    description:
                        "خطط تعلم فردية، دعم سلوكي، وتسهيلات للطلاب ذوي الاحتياجات التعليمية الخاصة في الفصول الشاملة."
                },
                {
                    icon: "fa-star",
                    title: "إثراء الموهوبين والمتفوقين",
                    description:
                        "استراتيجيات تعلم متقدمة، أنشطة إثرائية، ودعم منهجي متمايز للطلاب المتفوقين."
                },
                {
                    icon: "fa-language",
                    title: "دعم اللغة العربية/الدراسات الإسلامية",
                    description:
                        "دعم متخصص لاكتساب اللغة العربية ودمج الدراسات الإسلامية ضمن أطر المناهج الدولية."
                },
                {
                    icon: "fa-users",
                    title: "التواصل عبر الثقافات",
                    description:
                        "تسهيل التواصل بين الأسر الناطقة بالعربية وموظفي المدارس الدولية، مع ضمان الحساسية الثقافية."
                },
                {
                    icon: "fa-chart-line",
                    title: "التدخل في القراءة",
                    description:
                        "دعم القراءة القائم على الأدلة باستخدام منهجيات SPIRE وتقييم PAST للقراء المتعثرين."
                },
                {
                    icon: "fa-robot",
                    title: "محو الأمية في الذكاء الاصطناعي والاستخدام المسؤول",
                    description:
                        "جلسات عملية مناسبة للعمر حول مهارات الذكاء الاصطناعي، أساسيات صياغة الأوامر، التحقق من المعلومات، نسب المصادر، والاستخدام الآمن والأخلاقي للذكاء الاصطناعي."
                },
                {
                    icon: "fa-graduation-cap",
                    title: "دعم المناهج",
                    description:
                        "المساعدة في تقديم المنهج البريطاني (كامبريدج/IPC)، الأمريكي (Common Core)، والبكالوريا الدولية لجميع المراحل."
                }
            ]
        },
        experience: {
            title: "الخبرة المهنية",
            items: [
                {
                    role: "مساعد تعليم وتدريس",
                    company: "مدارس دبي الخوانيج (تعليم)، دبي، الإمارات",
                    period: "أغسطس 2024 - فبراير 2025",
                    bullets: [
                        "دعم الصفوف 6-7 في تقديم المنهج البريطاني",
                        "تطوير مواد متمايزة لاحتياجات التعلم المتنوعة",
                        "تنفيذ استراتيجيات شاملة لأصحاب الهمم",
                        "التعاون مع منسق الاحتياجات الخاصة وأولياء الأمور حول تقدم الطلاب",
                        "دعم أنشطة محو الأمية في الذكاء الاصطناعي ومهارات المواطنة الرقمية داخل الصف."
                    ]
                },
                {
                    role: "مساعد تدريس",
                    company: "مدرسة يونيتي الثانوية، الخرطوم، السودان",
                    period: "سبتمبر 2022 - يوليو 2023",
                    bullets: [
                        "تقديم برنامج SPIRE للتدخل في القراءة عبر مجموعات سنوية متعددة",
                        "إجراء اختبار PAST للدكتور كيلباتريك للتقييم الصوتي",
                        "تولي مسؤوليات معلم الفصل للعلوم الإنسانية والعلوم والإنجليزية",
                        "توفير دعم فردي للطلاب الموهوبين والمتفوقين"
                    ]
                }
            ]
        },
        portfolio: {
            title: "الشهادات والملف",
            items: [
                { doc: "cv-suraga-dubai", title: "السيرة الذاتية المحدثة", subtitle: "CV - Dubai", type: "pdf" },
                {
                    doc: "experience-letter-taaleem",
                    title: "خطاب خبرة تعليم",
                    subtitle: "مدارس دبي الخوانيج",
                    type: "pdf"
                },
                {
                    doc: "recommendation-unity",
                    title: "توصية مدرسة يونيتي",
                    subtitle: "رئيس المرحلة الابتدائية",
                    type: "pdf"
                },
                {
                    doc: "secondary-certificate",
                    title: "الشهادة الثانوية السودانية",
                    subtitle: "مدرسة الشريقة الخاصة",
                    type: "cert"
                }
            ],
            actionText: "عرض المستند"
        },
        contact: {
            title: "تواصل معي",
            subtitle: "لنتعاون معاً",
            description:
                "أبحث حالياً عن فرص مع المدارس الدولية في دبي، بما يشمل أدوار مساعد التعليم ومعلم محو الأمية في الذكاء الاصطناعي. متاح للتعيين الفوري مع إقامة إماراتية سارية.",
            location: "دبي، الإمارات العربية المتحدة",
            whatsappLink:
                "https://wa.me/971557177083?text=مرحباً%20سراجا،%20وجدت%20موقعك%20وأود%20مناقشة%20الفرص.",
            whatsappText: "مراسلة على واتساب",
            form: {
                namePlaceholder: "اسمك",
                emailPlaceholder: "بريدك الإلكتروني",
                messagePlaceholder: "رسالتك",
                submitLabel: "إرسال الرسالة",
                inquiryLabels: {
                    job: "استفسار وظيفي",
                    collaboration: "تعاون",
                    general: "سؤال عام"
                }
            }
        },
        footer: {
            description:
                "مساعد تعليم محترف ومعلم محو الأمية في الذكاء الاصطناعي متخصص في التعليم الشامل والدعم ثنائي اللغة للمدارس الدولية في دبي.",
            quickLinks: "روابط سريعة",
            connect: "تواصل",
            tagline: "مصمم لمجتمع التعليم الدولي في دبي",
            rights: "جميع الحقوق محفوظة."
        }
    },
    shared
};
