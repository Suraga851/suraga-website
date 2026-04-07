import type { LearningModule } from "@aura-ed/shared-types";

export const learningModules: LearningModule[] = [
  {
    id: "math-g6-fractions-01",
    subject: "Mathematics",
    grade: "Grade 6",
    title: "Fractions in Daily Context",
    titleAr: "الكسور في سياقات الحياة اليومية",
    durationMinutes: 35,
    accessibility: ["captions", "audio-support", "bilingual-keywords"]
  },
  {
    id: "arabic-g7-reading-02",
    subject: "Arabic",
    grade: "Grade 7",
    title: "Inference Through Narrative Reading",
    titleAr: "الاستنتاج عبر القراءة السردية",
    durationMinutes: 40,
    accessibility: ["dyslexia-font", "line-spacing-controls", "screen-reader-labels"]
  },
  {
    id: "science-g8-energy-03",
    subject: "Science",
    grade: "Grade 8",
    title: "Energy Transfer and Efficiency",
    titleAr: "انتقال الطاقة وكفاءتها",
    durationMinutes: 45,
    accessibility: ["high-contrast", "multimodal-hints", "interactive-checkpoints"]
  }
];
