"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/useLanguage";
import { Language } from "@/lib/translations";
import Link from "next/link";

type Barber = {
    id: number;
    name: string;
    status: string;
    mode: string;
    break_minutes: number | null;
    cut_duration: number;
};

type QueueEntry = {
    id: number;
    name: string;
    status: string;
    barber_id: number;
};

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

const LANGUAGES: { value: Language; label: string }[] = [
    { value: "de", label: "DE" },
    { value: "en", label: "EN" },
];

export default function BarberProfilePage() {
    const params = useParams();
    const router = useRouter();
    const barberId = Number(params.id);
    const { lang, changeLang, t } = useLanguage();

    const [barber, setBarber] = useState<Barber | null>(null);
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (barberId) {
            fetchBarber();
            fetchQueue();
        }
        const channel = supabase
            .channel(`barber_profile_${barberId}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "queue_entries" }, () => {
                fetchQueue();
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "barbers" }, () => {
                fetchBarber();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [barberId]);

    async function fetchBarber() {
        const { data, error } = await supabase
            .from("barbers")
            .select("id, name, status, mode, break_minutes, cut_duration")
            .eq("id", barberId)
            .single();
        if (error || !data) { setNotFound(true); return; }
        setBarber(data);
    }

    async function fetchQueue() {
        const { data } = await supabase
            .from("queue_entries")
            .select("id, name, status, barber_id")
            .eq("barber_id", barberId)
            .not("status", "in", '("skipped","done")')
            .order("created_at", { ascending: true });
        setQueue(data || []);
    }

    async function joinQueue() {
        if (!barber) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("queue_entries")
            .insert([{ name: customerName || "Anonym", status: "waiting", barber_id: barber.id }])
            .select()
            .single();
        setLoading(false);
        if (error) { alert(error.message); return; }
        router.push(`/queue?barberId=${barber.id}&entryId=${data.id}`);
    }

    function getStatusBadge(status: string, breakMinutes?: number | null) {
        if (status === "available") return (
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                ● {t("statusAvailable")}
            </span>
        );
        if (status === "break") return (
            <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                ⏸ {t("statusBreak")}{breakMinutes ? ` · ${breakMinutes} ${t("min")}` : ""}
            </span>
        );
        if (status === "vacation") return (
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                ✕ {t("statusVacation")}
            </span>
        );
        return (
            <span className="rounded-full bg-neutral-700/50 px-3 py-1 text-xs font-semibold text-neutral-400">
                ● {t("statusOffline")}
            </span>
        );
    }

    const canJoin = barber?.status === "available" && (barber?.mode === "queue" || barber?.mode === "hybrid");
    const canBook = barber?.mode === "appointment" || barber?.mode === "hybrid";
    const waitTime = queue.length * (barber?.cut_duration ?? 25);

    if (notFound) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-white">
                <div className="text-center">
                    <p className="text-5xl">✂️</p>
                    <h1 className="mt-4 text-2xl font-bold">Friseur nicht gefunden</h1>
                    <Link href="/customer" className="mt-4 inline-block rounded-2xl bg-amber-400 px-6 py-3 font-bold text-black">
                        Alle Friseure ansehen
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
            <div className="mx-auto max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/customer" className="text-sm text-neutral-400 transition-colors hover:text-white">
                        ← {t("backToBarbers")}
                    </Link>
                    <div className="flex items-center gap-1 rounded-xl bg-neutral-900 p-1">
                        {LANGUAGES.map((l) => (
                            <button
                                key={l.value}
                                onClick={() => changeLang(l.value)}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                                    lang === l.value ? "bg-amber-400 text-black" : "text-neutral-400 hover:text-white"
                                }`}>
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Barber Profil */}
                {barber && (
                    <>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-xl font-bold text-amber-400">
                                {getInitials(barber.name)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{barber.name}</h1>
                                <div className="mt-1">
                                    {getStatusBadge(barber.status, barber.break_minutes)}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/5 bg-neutral-900 p-4">
                                <p className="text-xs text-neutral-400">{t("inQueue")}</p>
                                <p className="mt-1 text-2xl font-bold">
                                    {queue.length} {queue.length === 1 ? t("person") : t("persons")}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-neutral-900 p-4">
                                <p className="text-xs text-neutral-400">{t("waitApprox")}</p>
                                <p className="mt-1 text-2xl font-bold">{waitTime} {t("min")}</p>
                            </div>
                        </div>

                        {/* Name + Buttons */}
                        <div className="mt-5 space-y-3">
                            <input
                                type="text"
                                placeholder={t("namePlaceholder")}
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3.5 outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors"
                            />

                            {canJoin && (
                                <button
                                    onClick={joinQueue}
                                    disabled={loading}
                                    className="w-full rounded-2xl bg-amber-400 py-4 font-bold text-black transition-colors hover:bg-amber-300 disabled:opacity-40">
                                    {loading ? t("adding") : t("joinQueue")}
                                </button>
                            )}

                            {!canJoin && barber.status === "available" && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 py-4 text-center text-neutral-400">
                                    {t("unavailable")}
                                </div>
                            )}

                            {!canJoin && barber.status !== "available" && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 py-4 text-center text-neutral-400">
                                    {getStatusBadge(barber.status, barber.break_minutes)}
                                </div>
                            )}

                            {canBook && (
                                <button
                                    onClick={() => router.push(`/book?barberId=${barber.id}`)}
                                    className="w-full rounded-2xl border border-white/10 py-4 font-bold text-white transition-colors hover:bg-white/5">
                                    {t("bookAppointment")}
                                </button>
                            )}
                        </div>

                        {/* Warteschlange */}
                        {queue.length > 0 && (
                            <div className="mt-8">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                                    {t("queueListLabel")} ({queue.length})
                                </p>
                                <div className="space-y-2">
                                    {queue.map((entry, index) => (
                                        <div key={entry.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-neutral-900 px-4 py-3">
                                            <span className="text-sm font-bold text-neutral-500">#{index + 1}</span>
                                            <p className="font-semibold">{entry.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!barber && !notFound && (
                    <div className="mt-20 text-center text-neutral-400">Lädt...</div>
                )}

            </div>
        </main>
    );
}
