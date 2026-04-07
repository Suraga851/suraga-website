import { AdaptiveSimulator } from "../components/adaptive-simulator";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Aura-Ed Platform MVP</p>
        <h1>Build slice one: bilingual adaptive learning with real service wiring.</h1>
        <p>
          This starter app is connected to the Aura-Ed API gateway and adaptive engine. It is designed as the first
          implementation step from concept page to production platform.
        </p>
      </section>

      <AdaptiveSimulator />

      <p className="footer-note">UAE-first design: inclusive access, Arabic support, teacher-visible intervention logic.</p>
    </main>
  );
}
