import { AssessmentForm } from "@/components/assessment-form";
export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">NEERPLAN · PRODUCTION BUILD</p>
        <h1>Turn every rooftop into a water source.</h1>
        <p>NeerPlan will help households and communities assess, plan, and act on rainwater harvesting.</p>
        <div className="foundation-status"><span>NEERPLAN</span><strong>Plan with confidence.</strong><small>Start a free, transparent rooftop assessment below.</small></div>
      </section>
      <div id="assessment"><AssessmentForm /></div>
    </main>
  );
}
