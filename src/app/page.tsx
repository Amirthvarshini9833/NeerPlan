import { AssessmentForm } from "@/components/assessment-form";
import { HeroCopy } from "@/components/hero-copy";
export default function HomePage() {
  return (
    <main>
      <HeroCopy />
      <div id="assessment"><AssessmentForm /></div>
    </main>
  );
}
