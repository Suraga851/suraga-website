export type LocaleCode = "en" | "ar";

export type LearningSupportBand = "intensive" | "guided" | "stretch";

export interface AdaptiveRecommendationRequest {
  learnerId: string;
  recentPerformance: number;
  engagementDuration: number;
  weightPerformance: number;
  weightEngagement: number;
  locale?: LocaleCode;
}

export interface AdaptiveRecommendationResponse {
  score: number;
  supportBand: LearningSupportBand;
  explanation: string;
  actions: string[];
}

export interface LearningModule {
  id: string;
  subject: string;
  grade: string;
  title: string;
  titleAr: string;
  durationMinutes: number;
  accessibility: string[];
}

export interface InterventionEvent {
  learnerId: string;
  supportBand: LearningSupportBand;
  reason: string;
  actions: string[];
  createdAtIso: string;
}
