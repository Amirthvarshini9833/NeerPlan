"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";

export function InstallerLeadForm({ assessmentId }: { assessmentId: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { t } = useLanguage();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("");
    setSending(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send your request.");
      setMessage(t("requestShared"));
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send your request.");
    } finally {
      setSending(false);
    }
  }

  return <section className="lead-form" aria-labelledby="installer-heading">
    <div>
      <p className="eyebrow">{t("nextStep")}</p>
      <h3 id="installer-heading">{t("installerTitle")}</h3>
      <p>{t("installerText")}</p>
    </div>
    <form onSubmit={submit}>
      <label>{t("name")}<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label>
      <label>{t("phone")}<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} required /></label>
      <button disabled={sending}>{sending ? t("sending") : t("requestSurvey")}</button>
      {message && <p className="form-message" role="status">{message}</p>}
    </form>
  </section>;
}
