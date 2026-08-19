"use client";

export function ReportActions() {
  function downloadReport() {
    const report = document.querySelector(".report-sheet")?.textContent?.replace(/\n\s*\n/g, "\n\n").trim();
    if (!report) return;
    const file = new Blob([report], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "neerplan-assessment-report.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return <div className="report-actions no-print">
    <button type="button" onClick={() => window.print()}>Print or save as PDF</button>
    <button type="button" onClick={downloadReport}>Download text report</button>
    <a href="/dashboard">Back to dashboard</a>
  </div>;
}
