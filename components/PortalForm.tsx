"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function PortalForm({ endpoint, children, submit = "Salva" }: { endpoint: string; children: React.ReactNode; submit?: string }) {
  const [pending, setPending] = useState(false); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  const router = useRouter();
  return <form className="portal-form" onSubmit={async e => {
    e.preventDefault(); if (pending) return;
    const form = e.currentTarget; const body = new FormData(form);
    setPending(true); setError(""); setMessage("");
    try {
      const response = await fetch(endpoint, { method: "POST", body }); const result = await response.json();
      if (!response.ok) { setError(result.error || "Operazione non riuscita."); return; }
      if (result.redirect && result.external) { window.location.assign(result.redirect); }
      else if (result.redirect) { router.push(result.redirect); router.refresh(); }
      else { setMessage(result.message || "Operazione completata."); router.refresh(); }
    } catch { setError("Connessione non disponibile. Riprova."); }
    finally { setPending(false); }
  }}>
    <fieldset disabled={pending} className="space-y-5">{children}</fieldset>
    <div aria-live="polite">{error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900">{error}</p>}{message && <p role="status" className="rounded-lg bg-astrea-green/10 p-3">{message}</p>}</div>
    <button disabled={pending} type="submit" className="button">{pending ? "Attendi…" : submit}</button>
  </form>;
}
