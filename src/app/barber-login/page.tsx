"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BarberLoginPage() {

    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [barberName, setBarberName] = useState("");
    const [loading, setLoading] = useState(false);

    async function signUp() {
        if (!email || !password) {
            alert("Bitte E-Mail und Passwort eingeben.");
            return;
        }
        if (password.length < 6) {
            alert("Passwort muss mindestens 6 Zeichen lang sein.");
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                alert(error.message);
                return;
            }
            const userId = data.user?.id;
            if (!userId) {
                alert("Account erstellt. Bitte prüfe deine E-Mail.");
                return;
            }
            const { error: profileError } = await supabase.from("barbers").insert([
                {
                    user_id: userId,
                    name: barberName || "Friseur",
                    status: "available",
                    mode: "queue",
                },
            ]);
            if (profileError) {
                alert(profileError.message);
                return;
            }
            router.push("/barber");
        } finally {
            setLoading(false);
        }
    }

    async function signIn() {
        if (!email || !password) {
            alert("Bitte E-Mail und Passwort eingeben.");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert(error.message);
                return;
            }
            router.push("/barber");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center bg-neutral-950 px-5 py-8 text-white">
            <div className="mx-auto w-full max-w-sm">

                <div className="mb-8 text-center">
                    <p className="text-2xl font-bold tracking-tight">
                        Cut<span className="text-amber-400">Now</span>
                    </p>
                    <p className="mt-2 text-neutral-400">
                        {mode === "login" ? "Willkommen zurück" : "Erstelle deinen Barber-Account"}
                    </p>
                </div>

                <div className="flex rounded-2xl bg-neutral-900 p-1">
                    <button
                        onClick={() => setMode("login")}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                            mode === "login"
                                ? "bg-white text-black"
                                : "text-neutral-400 hover:text-white"
                        }`}>
                        Einloggen
                    </button>
                    <button
                        onClick={() => setMode("register")}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                            mode === "register"
                                ? "bg-white text-black"
                                : "text-neutral-400 hover:text-white"
                        }`}>
                        Registrieren
                    </button>
                </div>

                <div className="mt-5 space-y-3">

                    {mode === "register" && (
                        <input
                            type="text"
                            placeholder="Dein Name als Friseur"
                            value={barberName}
                            onChange={(e) => setBarberName(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3.5 outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors"
                        />
                    )}

                    <input
                        type="email"
                        placeholder="E-Mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3.5 outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors"
                    />

                    <input
                        type="password"
                        placeholder="Passwort"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3.5 outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors"
                    />

                    <button
                        onClick={mode === "login" ? signIn : signUp}
                        disabled={loading}
                        className="w-full rounded-2xl bg-amber-400 py-4 font-bold text-black transition-colors hover:bg-amber-300 disabled:opacity-50">
                        {loading
                            ? "Lädt..."
                            : mode === "login"
                                ? "Einloggen"
                                : "Account erstellen"}
                    </button>

                </div>

            </div>
        </main>
    );
}
