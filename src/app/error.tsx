"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return <main className="error-page"><p className="eyebrow">SOMETHING WENT WRONG</p><h1>We could not load this page.</h1><p>Your saved information has not been changed. Please try again.</p><button type="button" onClick={reset}>Try again</button></main>;
}
