"use client";

import { useState } from "react";

export function InstallerLeadForm({ assessmentId }: { assessmentId: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSending(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send your request.");
      setMessage("Thanks — your request has been shared with our installer network.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send your request.");
    } finally {
      setSending(false);
    }
  }

  return <section className="lead-form" aria-labelledby="installer-heading">
    <div>
      <p className="eyebrow">NEXT STEP</p>
      <h3 id="installer-heading">Talk to a local installer.</h3>
      <p>Request a site survey to refine this estimate and get an installation quote.</p>
    </div>
    <form onSubmit={submit}>
      <label>Name<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label>
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} required /></label>
      <button disabled={sending}>{sending ? "Sending…" : "Request a survey"}</button>
      {message && <p className="form-message" role="status">{message}</p>}
    </form>
  </section>;
}
