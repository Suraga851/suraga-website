"use client";

import type {
  AdaptiveRecommendationRequest,
  AdaptiveRecommendationResponse,
  LocaleCode
} from "@aura-ed/shared-types";
import { useState } from "react";

type CopyBlock = {
  title: string;
  subtitle: string;
  submit: string;
  reset: string;
  modulesTitle: string;
  recommendationTitle: string;
  actionsTitle: string;
};

const copy: Record<LocaleCode, CopyBlock> = {
  en: {
    title: "Adaptive Support Simulator",
    subtitle: "Send learner performance + engagement to the gateway and view scaffold recommendations.",
    submit: "Get recommendation",
    reset: "Reset sample values",
    modulesTitle: "Starter modules from API",
    recommendationTitle: "Recommendation",
    actionsTitle: "Suggested actions"
  },
  ar: {
    title: "محاكي الدعم التكيفي",
    subtitle: "أرسل أداء المتعلم وتفاعله إلى البوابة واعرض توصيات الدعم.",
    submit: "احصل على التوصية",
    reset: "استعادة القيم الافتراضية",
    modulesTitle: "وحدات مبدئية من واجهة API",
    recommendationTitle: "التوصية",
    actionsTitle: "الإجراءات المقترحة"
  }
};

type LearningModule = {
  id: string;
  title: string;
  titleAr: string;
  grade: string;
  subject: string;
};

const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:8000";

export function AdaptiveSimulator() {
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [request, setRequest] = useState<AdaptiveRecommendationRequest>({
    learnerId: "learner-001",
    recentPerformance: 72,
    engagementDuration: 68,
    weightPerformance: 3,
    weightEngagement: 2,
    locale: "en"
  });
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [result, setResult] = useState<AdaptiveRecommendationResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const currentCopy = copy[locale];

  async function loadModules() {
    try {
      setError("");
      const response = await fetch(`${gatewayUrl}/api/v1/content/modules`);
      if (!response.ok) {
        throw new Error(`Failed loading modules (${response.status})`);
      }
      const data = (await response.json()) as { data: LearningModule[] };
      setModules(data.data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load modules");
    }
  }

  async function submitRecommendation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setError("");
    try {
      const response = await fetch(`${gatewayUrl}/api/v1/adaptive/recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, locale })
      });
      if (!response.ok) {
        throw new Error(`Recommendation request failed (${response.status})`);
      }
      const data = (await response.json()) as AdaptiveRecommendationResponse;
      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to fetch recommendation");
    } finally {
      setIsBusy(false);
    }
  }

  function resetDefaults() {
    setRequest({
      learnerId: "learner-001",
      recentPerformance: 72,
      engagementDuration: 68,
      weightPerformance: 3,
      weightEngagement: 2,
      locale
    });
    setResult(null);
    setError("");
  }

  return (
    <div className="grid two">
      <section className="panel">
        <h2>{currentCopy.title}</h2>
        <p>{currentCopy.subtitle}</p>
        <div className="button-row">
          <button type="button" className="ghost" onClick={() => setLocale(locale === "en" ? "ar" : "en")}>
            {locale === "en" ? "العربية" : "English"}
          </button>
          <button type="button" className="ghost" onClick={loadModules}>
            {currentCopy.modulesTitle}
          </button>
        </div>

        <form onSubmit={submitRecommendation}>
          <div className="input-row">
            <label htmlFor="learnerId">Learner ID</label>
            <input
              id="learnerId"
              type="text"
              value={request.learnerId}
              onChange={(event) => setRequest((prev) => ({ ...prev, learnerId: event.target.value }))}
            />
          </div>

          <div className="input-row">
            <label htmlFor="recentPerformance">Recent performance ({request.recentPerformance})</label>
            <input
              id="recentPerformance"
              type="range"
              min={0}
              max={100}
              value={request.recentPerformance}
              onChange={(event) =>
                setRequest((prev) => ({ ...prev, recentPerformance: Number(event.target.value) }))
              }
            />
          </div>

          <div className="input-row">
            <label htmlFor="engagementDuration">Engagement duration ({request.engagementDuration})</label>
            <input
              id="engagementDuration"
              type="range"
              min={0}
              max={100}
              value={request.engagementDuration}
              onChange={(event) =>
                setRequest((prev) => ({ ...prev, engagementDuration: Number(event.target.value) }))
              }
            />
          </div>

          <div className="grid two">
            <div className="input-row">
              <label htmlFor="weightPerformance">Performance weight</label>
              <input
                id="weightPerformance"
                type="number"
                min={1}
                max={5}
                value={request.weightPerformance}
                onChange={(event) =>
                  setRequest((prev) => ({ ...prev, weightPerformance: Number(event.target.value) }))
                }
              />
            </div>

            <div className="input-row">
              <label htmlFor="weightEngagement">Engagement weight</label>
              <input
                id="weightEngagement"
                type="number"
                min={1}
                max={5}
                value={request.weightEngagement}
                onChange={(event) =>
                  setRequest((prev) => ({ ...prev, weightEngagement: Number(event.target.value) }))
                }
              />
            </div>
          </div>

          <div className="button-row">
            <button type="submit" className="primary" disabled={isBusy}>
              {isBusy ? "..." : currentCopy.submit}
            </button>
            <button type="button" className="ghost" onClick={resetDefaults}>
              {currentCopy.reset}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        {error ? (
          <p role="alert">{error}</p>
        ) : null}

        {result ? (
          <>
            <h3>{currentCopy.recommendationTitle}</h3>
            <p>
              <span className="badge">{result.supportBand}</span>
            </p>
            <p>
              Score: <strong>{result.score.toFixed(2)}</strong>
            </p>
            <p>{result.explanation}</p>
            <h3>{currentCopy.actionsTitle}</h3>
            <ul className="list">
              {result.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>No recommendation yet. Submit the form to calculate support level.</p>
        )}

        {modules.length > 0 ? (
          <>
            <h3>{currentCopy.modulesTitle}</h3>
            <ul className="list">
              {modules.map((moduleItem) => (
                <li key={moduleItem.id}>
                  {locale === "ar" ? moduleItem.titleAr : moduleItem.title} - {moduleItem.subject} ({moduleItem.grade})
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </div>
  );
}
