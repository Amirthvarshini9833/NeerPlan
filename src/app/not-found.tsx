import Link from "next/link";

export default function NotFound() {
  return <main className="error-page"><p className="eyebrow">NOT FOUND</p><h1>That page is not available.</h1><p>The assessment may not exist or you may not have permission to view it.</p><Link className="button-link" href="/dashboard">Go to dashboard</Link></main>;
}
