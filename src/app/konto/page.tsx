"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";

export default function KontoPage() {
  const { user, ready, configured, signIn, signOut } = useAuth();
  const { count, syncError } = useFavorites();
  const [error, setError] = useState("");
  const action = async (fn: () => Promise<void>) => {
    setError("");
    try { await fn(); } catch { setError("Die Aktion ist fehlgeschlagen. Bitte versuche es erneut."); }
  };
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-7 shadow-sm sm:p-10">
        <h1 className="text-3xl font-black text-ink">Mein Konto</h1>
        <p className="mt-2 text-sm text-muted">Melde dich mit Google an, um deine Merkliste auf mehreren Geräten zu nutzen.</p>
        {!configured ? (
          <p className="mt-6 rounded-xl bg-accent-soft p-4 text-sm text-ink">Google-Anmeldung wird eingerichtet. Die lokale Merkliste funktioniert weiterhin.</p>
        ) : !ready ? (
          <p className="mt-6 text-muted">Konto wird geladen …</p>
        ) : user ? (
          <div className="mt-7 space-y-5">
            <div className="rounded-xl bg-page p-4">
              <p className="font-bold text-ink">{user.user_metadata?.full_name || user.email || "Google-Konto"}</p>
              <p className="break-all text-sm text-muted">{user.email}</p>
            </div>
            <p className="text-sm text-muted">{count} gespeicherte Stellenangebote</p>
            <Link className="inline-flex rounded-full bg-accent px-5 py-3 font-bold text-white" href="/merkliste">Meine Merkliste öffnen</Link>
            <div><button className="rounded-full border border-border px-5 py-2 font-semibold text-ink" onClick={() => action(signOut)}>Abmelden</button></div>
          </div>
        ) : (
          <button onClick={() => action(signIn)} className="mt-7 rounded-full bg-accent px-6 py-3 font-bold text-white">Mit Google anmelden</button>
        )}
        {(error || syncError) && <p role="alert" className="mt-5 text-sm text-red-600">{error || syncError}</p>}
        <p className="mt-8 text-xs text-muted">Ohne Anmeldung werden Favoriten nur in diesem Browser gespeichert.</p>
      </div>
    </main>
  );
}
