const items = [
  "Confirm local rainwater-harvesting and building requirements with the relevant municipal or panchayat authority.",
  "Check whether the proposed tank, plumbing changes, and overflow route need building-owner or society approval.",
  "Keep first-flush, filtration, tank access, mosquito control, and overflow drainage in the final design.",
  "Use a qualified installer to verify roof condition, structural loading, water quality needs, and safe maintenance access.",
  "Where harvested water will be used for drinking, obtain appropriate water-quality testing and treatment advice.",
];

export function ComplianceChecklist() {
  return <section className="compliance-checklist" aria-labelledby="compliance-heading">
    <p className="eyebrow">COMPLIANCE READINESS</p>
    <h2 id="compliance-heading">Before you install</h2>
    <p className="guidance-note"><strong>Guidance only — not legal approval.</strong> Requirements vary by location, property type, water use, and local authority.</p>
    <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
  </section>;
}
