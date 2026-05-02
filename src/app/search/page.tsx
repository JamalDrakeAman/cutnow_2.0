"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/lib/useLanguage";
import { saveActiveQueue, saveCustomerName } from "@/lib/customerStorage";
import { useCustomerAuth } from "@/lib/useCustomerAuth";

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
    barber_id: number;
    status: string;
};

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function SearchPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const { user, profile, loading: authLoading } = useCustomerAuth();
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "available">("all");
    const [loadingBarberId, setLoadingBarberId] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading && !user) { router.replace("/customer-auth"); return; }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (profile?.name) setCustomerName(profile.name);
        fetchBarbers();
        fetchQueueEntries();
        const channel = supabase
            .channel("search_queue_changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "queue_entries" }, () => {
                fetchQueueEntries();
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "barbers" }, () => {
                fetchBarbers();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    async function fetchBarbers() {
        const { data } = await supabase
            .from("barbers")
            .select("id, name, status, mode, break_minutes, cut_duration")
            .order("name", { ascending: true });
        setBarbers(data || []);
    }

    async function fetchQueueEntries() {
        const { data } = await supabase
            .from("queue_entries")
            .select("id, barber_id, status")
            .not("status", "in", '("skipped","done")');
        setQueueEntries(data || []);
    }

    function getQueueCount(barberId: number) {
        return queueEntries.filter((e) => e.barber_id === barberId).length;
    }

    function canJoin(barber: Barber) {
        return barber.status === "available" && (barber.mode === "queue" || barber.mode === "hybrid");
    }

    async function joinQueue(barberId: number) {
        setLoadingBarberId(barberId);
        const name = customerName || profile?.name || "Anonym";
        saveCustomerName(name);
        const { data, error } = await supabase
            .from("queue_entries")
            .insert([{ name, status: "waiting", barber_id: barberId, customer_id: user?.id ?? null }])
            .select().single();
        setLoadingBarberId(null);
        if (error) { alert(error.message); return; }
        saveActiveQueue(barberId, data.id);
        router.push(`/queue?barberId=${barberId}&entryId=${data.id}`);
    }

    function getStatusBadge(status: string, breakMinutes?: number | null) {
        if (status === "available") return <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">● verfügbar</span>;
        if (status === "break") return <span className="rounded-full bg-yellow-400/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-400">⏸ Pause{breakMinutes ? ` · ${breakMinutes} Min` : ""}</span>;
        if (status === "vacation") return <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400">✕ Urlaub</span>;
        return <span className="rounded-full bg-neutral-700/50 px-2.5 py-0.5 text-xs font-semibold text-neutral-400">● offline</span>;
    }

    const filtered = barbers
        .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
        .filter((b) => filter === "all" || b.status === "available");

    if (authLoading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
                <p className="text-neutral-500">Lädt...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 pb-28 text-white">

            <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-sm px-5 pt-5 pb-3">
                <h1 className="text-2xl font-bold tracking-tight">Barber suchen</h1>

                <div className="mt-3 relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Name suchen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 py-3 pl-10 pr-4 outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors"
                    />
                </div>

                <div className="mt-3 flex gap-2">
                    {(["all", "available"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-xl px-4 py-1.5 text-sm font-bold transition-colors ${
                                filter === f ? "bg-amber-400 text-black" : "bg-neutral-900 text-neutral-400 hover:text-white"
                            }`}>
                            {f === "all" ? "Alle" : "Verfügbar"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-5 mt-2">
                <input
                    type="text"
                    placeholder={t("namePlaceholder")}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors mb-4"
                />

                <div className="space-y-3">
                    {filtered.map((barber) => {
                        const count = getQueueCount(barber.id);
                        const wait = count * barber.cut_duration;
                        const joinable = canJoin(barber);

                        return (
                            <div key={barber.id} className="rounded-2xl border border-white/5 bg-neutral-900 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-sm font-bold text-amber-400">
                                        {getInitials(barber.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-bold truncate">{barber.name}</p>
                                            {getStatusBadge(barber.status, barber.break_minutes)}
                                        </div>
                                        <p className="text-sm text-neutral-500">
                                            {count} wartend · ca. {wait} Min
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 flex gap-2">
                                    {(barber.mode === "queue" || barber.mode === "hybrid") && (
                                        <button
                                            onClick={() => joinQueue(barber.id)}
                                            disabled={loadingBarberId === barber.id || !joinable}
                                            className="flex-1 rounded-xl bg-amber-400 py-2.5 text-sm font-bold text-black transition-colors hover:bg-amber-300 disabled:opacity-40">
                                            {loadingBarberId === barber.id ? "..." : joinable ? "Eintragen" : "Nicht verfügbar"}
                                        </button>
                                    )}
                                    {(barber.mode === "appointment" || barber.mode === "hybrid") && (
                                        <button
                                            onClick={() => router.push(`/book?barberId=${barber.id}`)}
                                            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/5">
                                            Termin
                                        </button>
                                    )}
                                    <button
                                        onClick={() => router.push(`/b/${barber.id}`)}
                                        className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-neutral-400 hover:bg-white/5">
                                        Profil
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="rounded-2xl border border-white/5 bg-neutral-900 p-6 text-center text-neutral-400">
                            Keine Barber gefunden.
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </main>
    );
}
