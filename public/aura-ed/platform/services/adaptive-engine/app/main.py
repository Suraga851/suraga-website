from enum import Enum
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator


class LocaleCode(str, Enum):
    EN = "en"
    AR = "ar"


class SupportBand(str, Enum):
    INTENSIVE = "intensive"
    GUIDED = "guided"
    STRETCH = "stretch"


class AdaptiveRequest(BaseModel):
    learner_id: str = Field(min_length=1)
    recent_performance: float = Field(ge=0, le=100)
    engagement_duration: float = Field(ge=0, le=100)
    weight_performance: float = Field(ge=1, le=5)
    weight_engagement: float = Field(ge=1, le=5)
    locale: LocaleCode = LocaleCode.EN

    @field_validator("learner_id")
    @classmethod
    def strip_learner_id(cls, value: str) -> str:
        return value.strip()


class AdaptiveResponse(BaseModel):
    score: float
    support_band: SupportBand
    explanation: str
    actions: List[str]


def compute_score(request: AdaptiveRequest) -> float:
    weighted = (
        (request.weight_performance * request.recent_performance)
        + (request.weight_engagement * request.engagement_duration)
    ) / (request.weight_performance + request.weight_engagement)
    return round(weighted, 2)


def band_for_score(score: float) -> SupportBand:
    if score < 50:
        return SupportBand.INTENSIVE
    if score < 75:
        return SupportBand.GUIDED
    return SupportBand.STRETCH


def localized_explanation(locale: LocaleCode, band: SupportBand) -> str:
    text = {
        LocaleCode.EN: {
            SupportBand.INTENSIVE: "Learner needs tighter scaffolding before progression.",
            SupportBand.GUIDED: "Learner can progress with guided support and short checkpoints.",
            SupportBand.STRETCH: "Learner is ready for extension tasks and mentorship opportunities."
        },
        LocaleCode.AR: {
            SupportBand.INTENSIVE: "المتعلم يحتاج إلى دعم أكثر إحكاما قبل الانتقال.",
            SupportBand.GUIDED: "المتعلم قادر على الاستمرار مع دعم موجه ونقاط تحقق قصيرة.",
            SupportBand.STRETCH: "المتعلم جاهز لمهام توسعية وفرص إرشاد بين الأقران."
        }
    }
    return text[locale][band]


def localized_actions(locale: LocaleCode, band: SupportBand, engagement: float) -> List[str]:
    actions = {
        LocaleCode.EN: {
            SupportBand.INTENSIVE: [
                "Break the lesson into smaller checkpoints.",
                "Inject bilingual hint cards and audio support.",
                "Notify teacher for targeted follow-up."
            ],
            SupportBand.GUIDED: [
                "Provide contextual hints before full answers.",
                "Offer Arabic-English key-term scaffolding.",
                "Run confidence pulse after the next task."
            ],
            SupportBand.STRETCH: [
                "Unlock extension challenge tied to the same objective.",
                "Invite learner into peer mentoring workflow.",
                "Reduce intervention density while monitoring momentum."
            ]
        },
        LocaleCode.AR: {
            SupportBand.INTENSIVE: [
                "قسّم الدرس إلى نقاط تحقق أصغر.",
                "أضف بطاقات تلميح ثنائية اللغة ودعما صوتيا.",
                "نبّه المعلم لمتابعة موجهة."
            ],
            SupportBand.GUIDED: [
                "قدّم تلميحات سياقية قبل الإجابة الكاملة.",
                "استخدم دعم المصطلحات العربية والإنجليزية.",
                "نفّذ فحص ثقة بعد المهمة التالية."
            ],
            SupportBand.STRETCH: [
                "افتح تحديا توسعيا مرتبطا بنفس الهدف.",
                "ادعُ المتعلم إلى مسار إرشاد بين الأقران.",
                "خفّض كثافة التدخل مع متابعة الزخم."
            ]
        }
    }
    result = list(actions[locale][band])
    if engagement < 40:
        result.append(
            "Add presence recovery routine."
            if locale == LocaleCode.EN
            else "أضف روتين استعادة الحضور."
        )
    return result


app = FastAPI(title="Aura-Ed Adaptive Engine", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "adaptive-engine"}


@app.post("/v1/recommendation", response_model=AdaptiveResponse)
def recommendation(payload: AdaptiveRequest) -> AdaptiveResponse:
    score = compute_score(payload)
    band = band_for_score(score)
    explanation = localized_explanation(payload.locale, band)
    actions = localized_actions(payload.locale, band, payload.engagement_duration)
    return AdaptiveResponse(score=score, support_band=band, explanation=explanation, actions=actions)
