"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CustomerAuthPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) router.replace("/customer");
        });
    }, [router]);

    async function sendLink() {
        if (!email.trim()) return;
        setLoading(true);
        setError("");

        if (name.trim()) {
            localStorage.setItem("cutnow_pending_name", name.trim());
        }

        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                shouldCreateUser: true,
                emailRedirectTo: window.location.origin + "/customer",
            },
        });
        setLoading(false);
        if (error) { setError(error.message); return; }
        setSent(true);
    }

    if (sent) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-white">
                <div className="w-full max-w-sm text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-400/10 text-5xl">
                            ✉️
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold">Link gesendet!</h2>
                    <p className="mt-3 text-neutral-400 leading-relaxed">
                        Wir haben einen Anmelde-Link an{" "}
                        <span className="font-semibold text-white">{email}</span>{" "}
                        geschickt. Öffne die E-Mail und klicke auf den Link.
                    </p>
                    <p className="mt-3 text-sm text-neutral-500">
                        Schau auch im Spam-Ordner nach.
                    </p>
                    <button
                        onClick={() => { setSent(false); setError(""); }}
                        className="mt-6 rounded-xl border border-white/10 px-5 py-2.5 text-sm text-neutral-400 hover:bg-white/5 transition-colors">
                        ← Andere E-Mail verwenden
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-white">
            <div className="w-full max-w-sm">

                <div className="mb-8 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                                <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                                <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                                <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">Cut<span className="text-amber-400">Now</span></h1>
                    <p className="mt-2 text-sm text-neutral-400">
                        Einmal anmelden – danach automatisch eingeloggt
                    </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-neutral-900 p-6 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-neutral-400">
                            Dein Name
                        </label>
                        <input
                            type="text"
                            placeholder="z.B. Max Mustermann"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-neutral-400">
                            E-Mail Adresse
                        </label>
                        <input
                            type="email"
                            placeholder="deine@email.de"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendLink()}
                            className="w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors"
                        />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <button
                        onClick={sendLink}
                        disabled={!email.trim() || loading}
                        className="w-full rounded-xl bg-amber-400 py-3.5 font-bold text-black transition-colors hover:bg-amber-300 disabled:opacity-40">
                        {loading ? "Wird gesendet..." : "Anmelde-Link senden →"}
                    </button>
                </div>

                <p className="mt-5 text-center text-xs text-neutral-600">
                    Kein Passwort nötig · Du bekommst einen Link per E-Mail
                </p>

            </div>
        </main>
    );
}
