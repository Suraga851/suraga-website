import { z } from "zod";

export const adaptiveRequestSchema = z.object({
  learnerId: z.string().trim().min(1),
  recentPerformance: z.number().min(0).max(100),
  engagementDuration: z.number().min(0).max(100),
  weightPerformance: z.number().min(1).max(5),
  weightEngagement: z.number().min(1).max(5),
  locale: z.enum(["en", "ar"]).optional()
});

export type AdaptiveRequestInput = z.infer<typeof adaptiveRequestSchema>;
