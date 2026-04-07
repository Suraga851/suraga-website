import type {
  AdaptiveRecommendationRequest,
  AdaptiveRecommendationResponse,
  InterventionEvent
} from "@aura-ed/shared-types";
import cors from "cors";
import express from "express";

import { learningModules } from "./content.js";
import { PersistenceLayer } from "./persistence.js";
import { adaptiveRequestSchema } from "./validation.js";

const app = express();

const port = Number(process.env.PORT ?? 8000);
const adaptiveEngineUrl = process.env.ADAPTIVE_ENGINE_URL ?? "http://localhost:8010";
const persistence = new PersistenceLayer();

app.use(cors());
app.use(express.json());

const interventions: InterventionEvent[] = [];

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    adaptiveEngineUrl,
    persistence: persistence.getHealth()
  });
});

app.get("/api/v1/content/modules", async (_req, res) => {
  const modules = await persistence.listModules(learningModules);
  res.json({
    data: modules
  });
});

app.get("/api/v1/interventions", async (_req, res) => {
  const events = await persistence.listInterventions(interventions);
  res.json({
    data: events
  });
});

app.post("/api/v1/adaptive/recommendation", async (req, res) => {
  const parsed = adaptiveRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      issues: parsed.error.issues
    });
  }

  const payload: AdaptiveRecommendationRequest = parsed.data;
  try {
    const response = await fetch(`${adaptiveEngineUrl}/v1/recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        learner_id: payload.learnerId,
        recent_performance: payload.recentPerformance,
        engagement_duration: payload.engagementDuration,
        weight_performance: payload.weightPerformance,
        weight_engagement: payload.weightEngagement,
        locale: payload.locale ?? "en"
      })
    });

    if (!response.ok) {
      throw new Error(`Adaptive engine responded ${response.status}`);
    }

    const data = (await response.json()) as {
      score: number;
      support_band: "intensive" | "guided" | "stretch";
      explanation: string;
      actions: string[];
    };

    const mapped: AdaptiveRecommendationResponse = {
      score: data.score,
      supportBand: data.support_band,
      explanation: data.explanation,
      actions: data.actions
    };

    const event: InterventionEvent = {
      learnerId: payload.learnerId,
      supportBand: mapped.supportBand,
      reason: mapped.explanation,
      actions: mapped.actions,
      createdAtIso: new Date().toISOString()
    };

    interventions.push(event);
    try {
      await persistence.insertIntervention(event);
    } catch (insertError) {
      console.error("Persisting intervention failed:", insertError);
    }

    return res.json(mapped);
  } catch (error) {
    const fallbackScore = Number(
      (
        ((payload.weightPerformance * payload.recentPerformance) +
          (payload.weightEngagement * payload.engagementDuration)) /
        (payload.weightPerformance + payload.weightEngagement)
      ).toFixed(2)
    );
    const fallbackBand =
      fallbackScore < 50 ? "intensive" : fallbackScore < 75 ? "guided" : "stretch";

    const fallback: AdaptiveRecommendationResponse = {
      score: fallbackScore,
      supportBand: fallbackBand,
      explanation:
        payload.locale === "ar"
          ? "تم استخدام محرك احتياطي داخل البوابة بسبب تعذر الوصول إلى خدمة التكيف."
          : "Gateway fallback engine was used because the adaptive service was unavailable.",
      actions:
        payload.locale === "ar"
          ? ["تحقق من اتصال خدمة التكيف.", "استمر مؤقتا بخطة دعم موجهة يدويا."]
          : ["Verify adaptive engine connectivity.", "Continue with a guided manual scaffold plan."]
    };

    const fallbackEvent: InterventionEvent = {
      learnerId: payload.learnerId,
      supportBand: fallback.supportBand,
      reason: fallback.explanation,
      actions: fallback.actions,
      createdAtIso: new Date().toISOString()
    };
    interventions.push(fallbackEvent);
    try {
      await persistence.insertIntervention(fallbackEvent);
    } catch (insertError) {
      console.error("Persisting fallback intervention failed:", insertError);
    }

    return res.status(200).json({
      ...fallback,
      degraded: true,
      details: error instanceof Error ? error.message : "Unknown adaptive proxy failure"
    });
  }
});

async function startServer(): Promise<void> {
  await persistence.initialize(learningModules);
  app.listen(port, () => {
    console.log(`Aura-Ed API Gateway listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to bootstrap API gateway:", error);
  process.exit(1);
});
