const content = {
    en: {
        dir: "ltr",
        languageToggle: "العربية",
        title: "Aura-Ed | Inclusive Adaptive Learning Platform",
        description:
            "Aura-Ed is a bilingual UAE-ready EdTech platform prototype focused on adaptive scaffolding, inclusive access, teacher enablement, and privacy-first learning analytics.",
        nav: {
            architecture: "Architecture",
            adaptive: "Adaptive Engine",
            features: "Features",
            compliance: "Compliance",
            roadmap: "Roadmap",
            readme: "README"
        },
        hero: {
            eyebrow: "Inclusive AI for UAE classrooms",
            title: "A bilingual learning platform that closes the gap between national tech ambition and day-to-day learning reality.",
            lead:
                "Aura-Ed combines adaptive scaffolding, SEND-aware design, low-bandwidth resilience, and regional compliance into one product foundation for schools across the UAE.",
            primaryCta: "Run adaptive simulation",
            secondaryCta: "View technical README",
            panelKicker: "System posture",
            panelTitle: "Designed for UAE hosting, Arabic-first access, device equity, and teacher-visible interventions.",
            privacyLabel: "Privacy layer",
            privacyTitle: "Edge AI keeps sensitive attention signals in the browser.",
            privacyCopy:
                "Only engagement scores travel upstream. Raw video, audio, and biometric traces stay local unless the institution explicitly enables them."
        },
        metrics: [
            {
                value: "Low-bandwidth",
                label: "Built to handle last-mile instability and lighter device conditions"
            },
            {
                value: "Teacher-led",
                label: "Adaptive decisions stay visible and adjustable by educators"
            },
            {
                value: "Arabic-native",
                label: "Language, layout, and content localization are first-class concerns"
            }
        ],
        signals: [
            {
                title: "Edge interface",
                copy: "Next.js web delivery, Flutter mobile access, and a shared i18n layer with RTL support."
            },
            {
                title: "Equity layer",
                copy: "Progressive loading, resumable sessions, and lightweight assets for uneven device and connection quality."
            },
            {
                title: "Teacher enablement",
                copy: "Intervention logs, rubric support, and AI literacy guidance for staff adoption."
            },
            {
                title: "Regional cloud",
                copy: "Azure UAE Central or AWS Middle East for institutional data residency alignment."
            }
        ],
        sections: {
            architecture: {
                kicker: "Architecture",
                title: "A decentralized microservices model that treats access, inclusion, and compliance as core infrastructure.",
                intro:
                    "Each domain is isolated so schools can scale services independently while respecting local residency, accessibility, and interoperability needs."
            },
            adaptive: {
                kicker: "Adaptive scaffolding engine",
                title: "A working simulation of how Aura-Ed can decide the next support level.",
                intro:
                    "Adjust performance, engagement, and educator weighting to see how the engine changes the student pathway."
            },
            features: {
                kicker: "Feature set",
                title: "The first release is shaped around inclusion, teacher readiness, and local relevance.",
                intro:
                    "These modules map directly to the ground-level issues highlighted across UAE online learning research."
            },
            compliance: {
                kicker: "Compliance and safety",
                title: "Every major workflow is framed by privacy, interoperability, accessibility, and integrity design.",
                intro:
                    "The goal is to make compliance a product feature instead of a last-minute paperwork exercise."
            },
            roadmap: {
                kicker: "Implementation roadmap",
                title: "A phased build that starts lean, proves value quickly, and expands responsibly.",
                intro:
                    "Each phase keeps scope tight while preparing the platform for institutional rollout."
            },
            readme: {
                kicker: "README snapshot",
                title: "A repo structure that can grow from pilot to platform.",
                intro:
                    "This mirrors the companion README so the concept page and the engineering plan stay aligned."
            }
        },
        architecture: [
            {
                kicker: "Frontend",
                title: "Edge Interface",
                copy:
                    "Use Next.js for the high-speed browser shell and Flutter for mobile access, both connected to one bilingual design system.",
                bullets: [
                    "Unified Arabic and English content model with fast locale switching",
                    "RTL-aware layout primitives and dyslexia-friendly typography modes",
                    "Teacher, student, and parent dashboards sharing one component library"
                ]
            },
            {
                kicker: "Equity",
                title: "Last-Mile Continuity Layer",
                copy:
                    "Plan for real device and connectivity unevenness instead of assuming every learner has ideal conditions.",
                bullets: [
                    "Progressive media loading and resumable lesson state",
                    "Offline-friendly caching for selected content blocks",
                    "Low-spec device mode with simplified visuals and compressed assets"
                ]
            },
            {
                kicker: "AI layer",
                title: "Adaptive Scaffolding Engine",
                copy:
                    "Model student momentum with recent performance, engagement duration, and teacher-controlled weighting.",
                bullets: [
                    "Inject hints, alternative media, or mentoring prompts when confidence drops",
                    "Keep intervention logic explainable instead of opaque",
                    "Preserve teacher override paths for every recommendation"
                ]
            },
            {
                kicker: "Governance",
                title: "API Gateway and Audit Spine",
                copy:
                    "Route requests through a secure gateway in front of authentication, content, gradebook, analytics, and realtime services.",
                bullets: [
                    "Structured academic records in PostgreSQL",
                    "Unstructured lesson assets in MongoDB",
                    "Audit-ready event trails for intervention and assessment decisions"
                ]
            }
        ],
        adaptive: {
            labels: {
                performance: "Recent performance",
                engagement: "Engagement duration",
                weightPerformance: "Performance weight",
                weightEngagement: "Engagement weight",
                percent: "percent",
                points: "priority points",
                resultKicker: "Live output",
                resultCaption: "Next support level",
                formulaLabel: "Adaptive formula",
                recommendationsTitle: "Recommended scaffold actions"
            },
            bands: {
                intensive: "Intensive support",
                guided: "Guided practice",
                stretch: "Stretch mode"
            },
            summaries: {
                intensive:
                    "The learner needs stronger scaffolding before moving forward. Slow the lesson down and switch to smaller support loops.",
                guided:
                    "The learner is ready to continue, but the platform should add bilingual hints and shorter checkpoints.",
                stretch:
                    "The learner is steady and engaged. Progress the lesson while adding extension tasks instead of remediation."
            },
            actions: {
                intensive: [
                    "Break the lesson into smaller checkpoints and unlock one concept at a time.",
                    "Swap in audio support, visual examples, and bilingual glossary cards.",
                    "Trigger a teacher alert plus a mentoring recommendation for follow-up."
                ],
                guided: [
                    "Add contextual hints before revealing the full answer.",
                    "Offer side-by-side English and Arabic keyword scaffolds.",
                    "Insert a confidence pulse check after the next activity."
                ],
                stretch: [
                    "Release an extension task or challenge card tied to the same objective.",
                    "Invite the learner into peer mentoring or collaborative problem solving.",
                    "Reduce intervention density while keeping progress transparent to the teacher."
                ],
                lowEngagement: "Add a presence recovery routine because engagement is drifting below the healthy range."
            }
        },
        features: [
            {
                title: "Adaptive scaffolding",
                copy: "Continuously tunes lesson difficulty, hint density, and content format without removing teacher agency."
            },
            {
                title: "Low-bandwidth continuity",
                copy: "Supports learners facing unstable access, limited devices, or interrupted sessions."
            },
            {
                title: "Arabic-native experience",
                copy: "Arabic and English work as first-class languages across UI, content metadata, and assistive patterns."
            },
            {
                title: "SEND-aware accessibility",
                copy: "High contrast modes, text spacing controls, screen reader semantics, captions, and multimodal lesson fallbacks."
            },
            {
                title: "Teacher enablement layer",
                copy: "Provides AI literacy support, intervention explanations, and actionable dashboards instead of black-box alerts."
            },
            {
                title: "Authentic assessment workflows",
                copy: "Encourages project-based and rubric-led assessment patterns to reduce over-reliance on surveillance."
            }
        ],
        compliance: [
            {
                title: "UAE PDPL alignment",
                copy: "Encrypt personal data in transit and at rest, minimize collection, and isolate school tenants."
            },
            {
                title: "LTI 1.3 interoperability",
                copy: "Support existing LMS ecosystems such as Canvas and Blackboard instead of forcing schools to replace them."
            },
            {
                title: "Explainable intervention logs",
                copy: "Every AI recommendation keeps a teacher-readable reason trail so escalation decisions stay accountable."
            },
            {
                title: "Accessibility baseline",
                copy: "Bake UDL-minded access patterns into procurement and product defaults rather than treating them as optional extras."
            },
            {
                title: "Assessment integrity by design",
                copy: "Reduce cheating pressure with authentic tasks, transparent policies, and selective monitoring instead of surveillance alone."
            },
            {
                title: "Institution governance",
                copy: "Support mixed regulatory realities across public, private, and higher-education operators with configurable controls."
            }
        ],
        roadmap: [
            {
                step: "Phase 1",
                title: "MVP launch",
                copy: "Release the bilingual web shell, identity layer, core dashboards, and the first explainable adaptive support workflows."
            },
            {
                step: "Phase 2",
                title: "Access and inclusion hardening",
                copy: "Add low-bandwidth continuity, accessibility modes, captioning, and richer SEND support tools."
            },
            {
                step: "Phase 3",
                title: "Teacher and integrity layer",
                copy: "Launch teacher AI enablement, moderated peer mentorship, and more authentic assessment templates."
            }
        ],
        stack: {
            kicker: "Suggested technical spine",
            title: "One product, multiple execution layers.",
            items: [
                "Web app: Next.js, TypeScript, accessible design tokens, and i18next",
                "Mobile app: Flutter shell that mirrors the same content and policy layer",
                "Backend: NestJS microservices for identity, content, gradebook, and audit events",
                "ML services: FastAPI, Python, TensorFlow.js, and selective transformer-based content support",
                "Realtime: Socket.io or managed pub/sub for live classrooms and mentoring signals",
                "Infra: Docker, Kubernetes, GitHub Actions, and UAE-region deployment targets"
            ]
        },
        readme: {
            structureLabel: "Suggested monorepo",
            stepsLabel: "Local setup",
            standardsLabel: "Delivery principles",
            repoStructure: [
                "apps/",
                "  web-next/",
                "  mobile-flutter/",
                "services/",
                "  api-gateway/",
                "  auth-service/",
                "  content-service/",
                "  adaptive-engine/",
                "  realtime-service/",
                "packages/",
                "  design-system/",
                "  shared-types/",
                "  i18n/",
                "infra/",
                "  docker/",
                "  kubernetes/",
                "  terraform/"
            ].join("\n"),
            setupSteps: [
                "Create the monorepo with pnpm workspaces so frontend, backend, and AI services share types safely.",
                "Stand up the Next.js web app first, then wire Arabic and English content flows before adding AI services.",
                "Add the NestJS API gateway and PostgreSQL schema for institutions, learners, courses, and interventions.",
                "Introduce the FastAPI adaptive engine behind one internal service contract, not directly from the client.",
                "Deploy the first environment in a UAE-resident region with audit logging turned on from day one."
            ],
            standards: [
                {
                    title: "Teacher-led AI",
                    copy: "Recommendations support educators. They do not silently override instructional decisions."
                },
                {
                    title: "Inclusive first",
                    copy: "Accessibility, Arabic support, and device equity are baseline product requirements."
                },
                {
                    title: "Local relevance",
                    copy: "Content, workflows, and assessment design should fit UAE school realities instead of importing foreign defaults."
                }
            ]
        },
        footer: "Aura-Ed prototype foundation for UAE-focused inclusive learning."
    },
    ar: {
        dir: "rtl",
        languageToggle: "English",
        title: "Aura-Ed | منصة تعلم تكيفية شاملة",
        description:
            "Aura-Ed نموذج أولي لمنصة تعليمية ثنائية اللغة ومهيأة لدولة الإمارات، تركز على الدعم التكيفي والوصول الشامل وتمكين المعلمين والتحليلات التعليمية التي تحترم الخصوصية.",
        nav: {
            architecture: "المعمارية",
            adaptive: "المحرك التكيفي",
            features: "الميزات",
            compliance: "الامتثال",
            roadmap: "خارطة الطريق",
            readme: "الدليل التقني"
        },
        hero: {
            eyebrow: "ذكاء اصطناعي شامل لفصول الإمارات",
            title: "منصة تعلم ثنائية اللغة تسد الفجوة بين الطموح التقني الوطني والواقع اليومي للتعلم.",
            lead:
                "يجمع Aura-Ed بين الدعم التكيفي والتصميم الداعم لذوي الاحتياجات والمرونة في الاتصال الضعيف والامتثال الإقليمي في أساس تقني واحد للمدارس في دولة الإمارات.",
            primaryCta: "شغل محاكاة التكيف",
            secondaryCta: "اعرض الدليل التقني",
            panelKicker: "الوضع التشغيلي",
            panelTitle: "مصممة للاستضافة داخل الإمارات، والوصول العربي الأصيل، وعدالة الأجهزة، وتدخلات مرئية للمعلم.",
            privacyLabel: "طبقة الخصوصية",
            privacyTitle: "يبقي الذكاء الاصطناعي الطرفي إشارات الانتباه الحساسة داخل المتصفح.",
            privacyCopy:
                "الذي يغادر إلى الخادم هو درجات التفاعل فقط. أما الفيديو والصوت والبيانات الحيوية الخام فتبقى محلية ما لم تفعل المؤسسة ذلك صراحة."
        },
        metrics: [
            {
                value: "ملائم للاتصال الضعيف",
                label: "مصمم ليتحمل اضطراب الوصول الأخير وضعف الأجهزة"
            },
            {
                value: "بقيادة المعلم",
                label: "القرارات التكيفية تبقى قابلة للرؤية والتعديل من المعلمين"
            },
            {
                value: "عربي أصيل",
                label: "اللغة والاتجاه وتوطين المحتوى عناصر أساسية منذ البداية"
            }
        ],
        signals: [
            {
                title: "واجهة الطرفية",
                copy: "واجهة ويب عبر Next.js وتطبيق Flutter مع طبقة ترجمة موحدة ودعم كامل لاتجاه RTL."
            },
            {
                title: "طبقة العدالة الرقمية",
                copy: "تحميل تدريجي واستئناف للجلسات وملفات خفيفة لمواجهة تفاوت الأجهزة والاتصال."
            },
            {
                title: "تمكين المعلم",
                copy: "سجلات تدخل وتوصيفات واضحة ودعم لمحو أمية الذكاء الاصطناعي عند الكادر التعليمي."
            },
            {
                title: "السحابة الإقليمية",
                copy: "Azure UAE Central أو AWS Middle East بما ينسجم مع متطلبات الإقامة المؤسسية للبيانات."
            }
        ],
        sections: {
            architecture: {
                kicker: "المعمارية",
                title: "نموذج خدمات مصغرة لامركزي يجعل الوصول والشمول والامتثال جزءا من البنية نفسها.",
                intro:
                    "كل نطاق معزول حتى تتمكن المدارس من توسيع كل خدمة مستقلة مع احترام الإقامة المحلية وإمكانية الوصول والتكامل."
            },
            adaptive: {
                kicker: "محرك الدعم التكيفي",
                title: "محاكاة عملية لكيفية اتخاذ Aura-Ed قرار مستوى الدعم التالي.",
                intro:
                    "عدل الأداء والتفاعل والأوزان التي يحددها المعلم لترى كيف يتغير المسار التعليمي."
            },
            features: {
                kicker: "مجموعة الميزات",
                title: "الإصدار الأول مبني حول الشمول وجاهزية المعلم والملاءمة المحلية.",
                intro:
                    "هذه الوحدات مرتبطة مباشرة بالمشكلات الميدانية التي أبرزتها أبحاث التعلم الرقمي في الإمارات."
            },
            compliance: {
                kicker: "الامتثال والسلامة",
                title: "كل مسار رئيسي مبني على الخصوصية وقابلية التكامل وإمكانية الوصول ونزاهة التقييم.",
                intro:
                    "الهدف هو أن يصبح الامتثال ميزة في المنتج لا ملفا يضاف في آخر المشروع."
            },
            roadmap: {
                kicker: "خارطة التنفيذ",
                title: "تنفيذ مرحلي يبدأ خفيفا ويثبت القيمة بسرعة ثم يتوسع بمسؤولية.",
                intro:
                    "كل مرحلة تضبط النطاق مع تجهيز المنصة للتبني المؤسسي."
            },
            readme: {
                kicker: "لقطة من README",
                title: "هيكل مستودع يمكنه أن ينمو من تجربة أولية إلى منصة كاملة.",
                intro:
                    "هذا القسم يعكس ملف README المرافق حتى تبقى الصفحة المفاهيمية والخطة الهندسية متسقتين."
            }
        },
        architecture: [
            {
                kicker: "الواجهة",
                title: "واجهة المستخدم الطرفية",
                copy:
                    "استخدم Next.js لواجهة الويب السريعة وFlutter للوصول عبر الهاتف مع نظام تصميم ثنائي اللغة مشترك.",
                bullets: [
                    "نموذج محتوى موحد للعربية والإنجليزية مع تبديل سريع بين اللغات",
                    "مكونات تراعي اتجاه RTL وخيارات خطوط داعمة لعسر القراءة",
                    "لوحات للمعلم والطالب وولي الامر فوق مكتبة مكونات واحدة"
                ]
            },
            {
                kicker: "العدالة الرقمية",
                title: "طبقة استمرارية الوصول",
                copy:
                    "تعامل مع تفاوت الأجهزة والاتصال بوصفه شرطا تصميميا حقيقيا لا حالة هامشية.",
                bullets: [
                    "تحميل تدريجي للوسائط مع حفظ حالة الدرس",
                    "تخزين مرحلي لبعض المحتوى لاستخدامه عند ضعف الاتصال",
                    "وضع خفيف للأجهزة محدودة الإمكانات"
                ]
            },
            {
                kicker: "طبقة الذكاء",
                title: "محرك الدعم التكيفي",
                copy:
                    "يقيس تقدم الطالب اعتمادا على الأداء الحديث ومدة التفاعل والأوزان التي يحددها المعلم.",
                bullets: [
                    "إضافة تلميحات أو وسائط بديلة أو توصيات إرشاد عند انخفاض الثقة",
                    "الحفاظ على منطق التدخل قابلا للتفسير",
                    "الإبقاء على حق المعلم في تجاوز أي توصية"
                ]
            },
            {
                kicker: "الحوكمة",
                title: "بوابة API وسجل التدقيق",
                copy:
                    "تمر الطلبات عبر بوابة آمنة أمام خدمات الهوية والمحتوى والدرجات والتحليلات والتفاعل اللحظي.",
                bullets: [
                    "السجلات الأكاديمية المنظمة في PostgreSQL",
                    "الأصول التعليمية غير المنظمة في MongoDB",
                    "مسارات أحداث قابلة للتدقيق للتدخلات وقرارات التقييم"
                ]
            }
        ],
        adaptive: {
            labels: {
                performance: "الأداء الحديث",
                engagement: "مدة التفاعل",
                weightPerformance: "وزن الأداء",
                weightEngagement: "وزن التفاعل",
                percent: "بالمئة",
                points: "نقاط أولوية",
                resultKicker: "الناتج المباشر",
                resultCaption: "مستوى الدعم التالي",
                formulaLabel: "المعادلة التكيفية",
                recommendationsTitle: "إجراءات الدعم المقترحة"
            },
            bands: {
                intensive: "دعم مكثف",
                guided: "ممارسة موجهة",
                stretch: "وضع التوسعة"
            },
            summaries: {
                intensive:
                    "المتعلم يحتاج إلى دعم أقوى قبل الانتقال. يجب إبطاء الدرس وتقسيمه إلى حلقات دعم أصغر.",
                guided:
                    "المتعلم قادر على الاستمرار، لكن المنصة ينبغي أن تضيف تلميحات ثنائية اللغة ونقاط تحقق أقصر.",
                stretch:
                    "المتعلم ثابت ومتفاعل. يمكن تقديم تحديات إضافية بدلا من زيادة الدعم العلاجي."
            },
            actions: {
                intensive: [
                    "تقسيم الدرس إلى نقاط تحقق أصغر وفتح مفهوم واحد في كل مرة.",
                    "إضافة دعم صوتي وأمثلة بصرية وبطاقات مصطلحات ثنائية اللغة.",
                    "إطلاق تنبيه للمعلم مع توصية بإرشاد أو متابعة فردية."
                ],
                guided: [
                    "إضافة تلميحات سياقية قبل كشف الإجابة الكاملة.",
                    "توفير مفردات أساسية بالعربية والإنجليزية بشكل متواز.",
                    "إدراج فحص ثقة سريع بعد النشاط التالي."
                ],
                stretch: [
                    "فتح مهمة توسعية أو بطاقة تحد مرتبطة بنفس الهدف.",
                    "دعوة المتعلم إلى دعم الأقران أو حل مشكلات تعاوني.",
                    "تقليل كثافة التدخل مع إبقاء التقدم واضحا للمعلم."
                ],
                lowEngagement: "أضف روتين استعادة للحضور لأن التفاعل هبط تحت النطاق الصحي."
            }
        },
        features: [
            {
                title: "الدعم التكيفي",
                copy: "يضبط صعوبة المحتوى وكثافة التلميحات وصيغة العرض باستمرار من دون إلغاء دور المعلم."
            },
            {
                title: "استمرارية في الاتصال الضعيف",
                copy: "يدعم المتعلمين الذين يواجهون اتصالا متقطعا أو أجهزة محدودة أو جلسات منقطعة."
            },
            {
                title: "تجربة عربية أصيلة",
                copy: "العربية والإنجليزية تعملان كلغتين أساسيتين في الواجهة والمحتوى وأنماط المساندة."
            },
            {
                title: "إتاحة واعية باحتياجات التعلم",
                copy: "أنماط تباين عال وتباعد نصي أفضل ودلالات لقارئات الشاشة وترجمة وبدائل متعددة الوسائط."
            },
            {
                title: "طبقة تمكين المعلم",
                copy: "توفر دعما في محو أمية الذكاء الاصطناعي وتفسيرا للتدخلات ولوحات قابلة للتنفيذ."
            },
            {
                title: "تقييمات أصيلة",
                copy: "تشجع على مهام قائمة على المشاريع وروبريكات واضحة لتقليل الاعتماد على المراقبة وحدها."
            }
        ],
        compliance: [
            {
                title: "التوافق مع PDPL الإماراتي",
                copy: "تشفير البيانات الشخصية أثناء النقل وفي التخزين مع تقليل الجمع وفصل بيانات كل مؤسسة."
            },
            {
                title: "تكامل LTI 1.3",
                copy: "التكامل مع Canvas وBlackboard وغيرها بدلا من إجبار المدارس على استبدال أنظمتها."
            },
            {
                title: "سجل تدخلات قابل للتفسير",
                copy: "كل توصية ذكاء اصطناعي تحمل سببا واضحا يمكن للمعلم قراءته ومراجعته."
            },
            {
                title: "خط أساس للإتاحة",
                copy: "أدمج مبادئ الوصول الشامل وUDL في المنتج نفسه لا كإضافات اختيارية."
            },
            {
                title: "نزاهة تقييم مصممة بعناية",
                copy: "خفف الغش عبر مهام أصيلة وسياسات شفافة ومراقبة انتقائية بدلا من الاعتماد على المراقبة فقط."
            },
            {
                title: "حوكمة مؤسسية",
                copy: "ادعم واقع التنظيم المختلف بين التعليم الحكومي والخاص والعالي عبر ضوابط قابلة للتهيئة."
            }
        ],
        roadmap: [
            {
                step: "المرحلة 1",
                title: "إطلاق MVP",
                copy: "إطلاق نواة الويب ثنائية اللغة وطبقة الهوية ولوحات الاستخدام الأساسية وأول مسارات الدعم التكيفي القابلة للتفسير."
            },
            {
                step: "المرحلة 2",
                title: "تقوية الوصول والشمول",
                copy: "إضافة أوضاع الاتصال الضعيف والإتاحة والترجمة والشرح النصي وأدوات دعم أعمق لذوي الاحتياجات."
            },
            {
                step: "المرحلة 3",
                title: "طبقة المعلم والنزاهة",
                copy: "إطلاق تمكين المعلمين في الذكاء الاصطناعي والإرشاد بين الطلاب وقوالب تقييم أكثر أصالة."
            }
        ],
        stack: {
            kicker: "العمود التقني المقترح",
            title: "منتج واحد بطبقات تنفيذ متعددة.",
            items: [
                "تطبيق الويب: Next.js وTypeScript وi18next ونظام تصميم قابل للوصول",
                "تطبيق الهاتف: Flutter يعكس نفس المحتوى وسياسات المنتج",
                "الخلفية: خدمات NestJS للهوية والمحتوى والدرجات وسجل التدقيق",
                "خدمات التعلم الآلي: FastAPI وPython وTensorFlow.js ونماذج لغوية انتقائية",
                "اللحظي: Socket.io أو pub/sub مُدار للفصول والإرشاد والتنبيهات",
                "البنية: Docker وKubernetes وGitHub Actions ونشر داخل مناطق الإمارات"
            ]
        },
        readme: {
            structureLabel: "المستودع المقترح",
            stepsLabel: "الإعداد المحلي",
            standardsLabel: "مبادئ التسليم",
            repoStructure: [
                "apps/",
                "  web-next/",
                "  mobile-flutter/",
                "services/",
                "  api-gateway/",
                "  auth-service/",
                "  content-service/",
                "  adaptive-engine/",
                "  realtime-service/",
                "packages/",
                "  design-system/",
                "  shared-types/",
                "  i18n/",
                "infra/",
                "  docker/",
                "  kubernetes/",
                "  terraform/"
            ].join("\n"),
            setupSteps: [
                "أنشئ المستودع المتعدد عبر pnpm workspaces حتى تتشارك الواجهة والخلفية والخدمات الذكية نفس الأنواع.",
                "ابدأ بتطبيق Next.js ثم اربط مسارات المحتوى العربي والإنجليزي قبل إضافة طبقات الذكاء الاصطناعي.",
                "أضف بوابة NestJS ومخطط PostgreSQL للمؤسسات والمتعلمين والمقررات والتدخلات.",
                "ضع محرك التكيف عبر FastAPI خلف عقد خدمة داخلي بدلا من استدعائه مباشرة من العميل.",
                "انشر أول بيئة داخل منطقة إماراتية مع تشغيل سجلات التدقيق منذ البداية."
            ],
            standards: [
                {
                    title: "ذكاء بقيادة المعلم",
                    copy: "التوصيات تساعد المعلم ولا تتجاوز قراره التعليمي بصمت."
                },
                {
                    title: "الشمول أولا",
                    copy: "الإتاحة والدعم العربي وعدالة الأجهزة متطلبات أساسية في المنتج."
                },
                {
                    title: "ملاءمة محلية",
                    copy: "ينبغي أن تلائم المسارات والمحتوى والتقييم واقع المدارس في الإمارات."
                }
            ]
        },
        footer: "نواة أولية لـ Aura-Ed موجهة للتعلم الشامل داخل دولة الإمارات."
    }
};

const state = {
    locale: "en"
};

const metricGrid = document.getElementById("metric-grid");
const signalGrid = document.getElementById("signal-grid");
const architectureGrid = document.getElementById("architecture-grid");
const featuresGrid = document.getElementById("features-grid");
const complianceGrid = document.getElementById("compliance-grid");
const roadmapList = document.getElementById("roadmap-list");
const stackList = document.getElementById("stack-list");
const recommendationList = document.getElementById("recommendation-list");
const standardsGrid = document.getElementById("standards-grid");
const repoStructure = document.getElementById("repo-structure");
const setupSteps = document.getElementById("setup-steps");
const languageToggle = document.getElementById("lang-toggle");

["performance", "engagement", "weight-performance", "weight-engagement"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateAdaptiveState);
});

languageToggle.addEventListener("click", () => {
    state.locale = state.locale === "en" ? "ar" : "en";
    render();
});

function createCardTemplate(item) {
    const bullets = item.bullets
        ? `<ul>${item.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>`
        : "";

    const kicker = item.kicker ? `<span class="kicker">${item.kicker}</span>` : "";

    return `
        <article class="card">
            ${kicker}
            <h3>${item.title}</h3>
            <p>${item.copy}</p>
            ${bullets}
        </article>
    `;
}

function renderListItems(container, items) {
    container.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderSectionCopy(copy) {
    document.documentElement.lang = state.locale;
    document.documentElement.dir = copy.dir;
    document.body.classList.toggle("is-rtl", copy.dir === "rtl");

    document.title = copy.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
        descriptionTag.setAttribute("content", copy.description);
    }

    languageToggle.textContent = copy.languageToggle;

    Object.entries(copy.nav).forEach(([key, value]) => {
        const node = document.querySelector(`[data-nav="${key}"]`);
        if (node) {
            node.textContent = value;
        }
    });

    document.querySelector('[data-cta-link="demo"]').textContent = copy.hero.primaryCta;
    document.getElementById("hero-eyebrow").textContent = copy.hero.eyebrow;
    document.getElementById("hero-title").textContent = copy.hero.title;
    document.getElementById("hero-lead").textContent = copy.hero.lead;
    document.getElementById("hero-primary-cta").textContent = copy.hero.primaryCta;
    document.getElementById("hero-secondary-cta").textContent = copy.hero.secondaryCta;
    document.getElementById("panel-kicker").textContent = copy.hero.panelKicker;
    document.getElementById("panel-title").textContent = copy.hero.panelTitle;
    document.getElementById("privacy-label").textContent = copy.hero.privacyLabel;
    document.getElementById("privacy-title").textContent = copy.hero.privacyTitle;
    document.getElementById("privacy-copy").textContent = copy.hero.privacyCopy;

    document.getElementById("architecture-kicker").textContent = copy.sections.architecture.kicker;
    document.getElementById("architecture-title").textContent = copy.sections.architecture.title;
    document.getElementById("architecture-intro").textContent = copy.sections.architecture.intro;

    document.getElementById("adaptive-kicker").textContent = copy.sections.adaptive.kicker;
    document.getElementById("adaptive-title").textContent = copy.sections.adaptive.title;
    document.getElementById("adaptive-intro").textContent = copy.sections.adaptive.intro;

    document.getElementById("features-kicker").textContent = copy.sections.features.kicker;
    document.getElementById("features-title").textContent = copy.sections.features.title;
    document.getElementById("features-intro").textContent = copy.sections.features.intro;

    document.getElementById("compliance-kicker").textContent = copy.sections.compliance.kicker;
    document.getElementById("compliance-title").textContent = copy.sections.compliance.title;
    document.getElementById("compliance-intro").textContent = copy.sections.compliance.intro;

    document.getElementById("roadmap-kicker").textContent = copy.sections.roadmap.kicker;
    document.getElementById("roadmap-title").textContent = copy.sections.roadmap.title;
    document.getElementById("roadmap-intro").textContent = copy.sections.roadmap.intro;

    document.getElementById("readme-kicker").textContent = copy.sections.readme.kicker;
    document.getElementById("readme-title").textContent = copy.sections.readme.title;
    document.getElementById("readme-intro").textContent = copy.sections.readme.intro;

    document.getElementById("label-performance").textContent = copy.adaptive.labels.performance;
    document.getElementById("label-engagement").textContent = copy.adaptive.labels.engagement;
    document.getElementById("label-weight-performance").textContent = copy.adaptive.labels.weightPerformance;
    document.getElementById("label-weight-engagement").textContent = copy.adaptive.labels.weightEngagement;
    document.getElementById("performance-unit").textContent = copy.adaptive.labels.percent;
    document.getElementById("engagement-unit").textContent = copy.adaptive.labels.percent;
    document.getElementById("weight-performance-unit").textContent = copy.adaptive.labels.points;
    document.getElementById("weight-engagement-unit").textContent = copy.adaptive.labels.points;
    document.getElementById("result-kicker").textContent = copy.adaptive.labels.resultKicker;
    document.getElementById("next-level-caption").textContent = copy.adaptive.labels.resultCaption;
    document.getElementById("formula-label").textContent = copy.adaptive.labels.formulaLabel;
    document.getElementById("recommendations-title").textContent = copy.adaptive.labels.recommendationsTitle;

    document.getElementById("stack-kicker").textContent = copy.stack.kicker;
    document.getElementById("stack-title").textContent = copy.stack.title;

    document.getElementById("readme-structure-label").textContent = copy.readme.structureLabel;
    document.getElementById("readme-steps-label").textContent = copy.readme.stepsLabel;
    document.getElementById("readme-standards-label").textContent = copy.readme.standardsLabel;
    document.getElementById("footer-copy").textContent = copy.footer;
}

function renderCollections(copy) {
    metricGrid.innerHTML = copy.metrics
        .map(
            (item) => `
            <article class="metric-card">
                <strong>${item.value}</strong>
                <span>${item.label}</span>
            </article>
        `
        )
        .join("");

    signalGrid.innerHTML = copy.signals
        .map(
            (item) => `
            <article class="signal-card">
                <strong>${item.title}</strong>
                <p>${item.copy}</p>
            </article>
        `
        )
        .join("");

    architectureGrid.innerHTML = copy.architecture.map(createCardTemplate).join("");
    featuresGrid.innerHTML = copy.features.map(createCardTemplate).join("");
    complianceGrid.innerHTML = copy.compliance.map(createCardTemplate).join("");

    roadmapList.innerHTML = copy.roadmap
        .map(
            (item) => `
            <article class="timeline-card">
                <span class="timeline-step">${item.step}</span>
                <h3>${item.title}</h3>
                <p>${item.copy}</p>
            </article>
        `
        )
        .join("");

    renderListItems(stackList, copy.stack.items);

    repoStructure.textContent = copy.readme.repoStructure;
    setupSteps.innerHTML = copy.readme.setupSteps.map((item) => `<li>${item}</li>`).join("");

    standardsGrid.innerHTML = copy.readme.standards
        .map(
            (item) => `
            <article class="standard-item">
                <h3>${item.title}</h3>
                <p>${item.copy}</p>
            </article>
        `
        )
        .join("");
}

function getAdaptiveBand(score) {
    if (score < 50) {
        return "intensive";
    }

    if (score < 75) {
        return "guided";
    }

    return "stretch";
}

function updateAdaptiveState() {
    const copy = content[state.locale];
    const performance = Number(document.getElementById("performance").value);
    const engagement = Number(document.getElementById("engagement").value);
    const weightPerformance = Number(document.getElementById("weight-performance").value);
    const weightEngagement = Number(document.getElementById("weight-engagement").value);
    const nextLevel = ((weightPerformance * performance) + (weightEngagement * engagement)) / (weightPerformance + weightEngagement);
    const roundedLevel = Math.round(nextLevel);
    const band = getAdaptiveBand(roundedLevel);
    const actions = [...copy.adaptive.actions[band]];

    if (engagement < 40) {
        actions.push(copy.adaptive.actions.lowEngagement);
    }

    document.getElementById("performance-value").textContent = performance;
    document.getElementById("engagement-value").textContent = engagement;
    document.getElementById("weight-performance-value").textContent = weightPerformance;
    document.getElementById("weight-engagement-value").textContent = weightEngagement;
    document.getElementById("next-level").textContent = roundedLevel;
    document.getElementById("support-band").textContent = copy.adaptive.bands[band];
    document.getElementById("support-summary").textContent = copy.adaptive.summaries[band];
    document.getElementById("formula-output").textContent =
        `((${weightPerformance} x ${performance}) + (${weightEngagement} x ${engagement})) / (${weightPerformance} + ${weightEngagement}) = ${nextLevel.toFixed(1)}`;

    recommendationList.innerHTML = actions.map((item) => `<li>${item}</li>`).join("");
}

function render() {
    const copy = content[state.locale];
    renderSectionCopy(copy);
    renderCollections(copy);
    updateAdaptiveState();
}

render();
