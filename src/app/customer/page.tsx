"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Barber = {
    id: number;
    name: string;
    status: string;
    mode: string;
    break_minutes: number | null;
};

type QueueEntry = {
    id: number;
    barber_id: number;
    status: string;
};

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function CustomerPage() {

    const router = useRouter();
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [loadingBarberId, setLoadingBarberId] = useState<number | null>(null);

    useEffect(() => {
        fetchBarbers();
        fetchQueueEntries();
        const channel = supabase
            .channel("customer_queue_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "queue_entries",
                },
                () => {
                    fetchQueueEntries();
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchBarbers() {
        const { data, error } = await supabase
            .from("barbers")
            .select("id, name, status, mode, break_minutes")
            .order("created_at", { ascending: true });
        if (error) {
            console.error(error);
            return;
        }
        setBarbers(data || []);
    }

    async function fetchQueueEntries() {
        const { data, error } = await supabase
            .from("queue_entries")
            .select("id, barber_id, status")
            .not("status", "in", '("skipped","done")');
        if (error) {
            console.error(error);
            return;
        }
        setQueueEntries(data || []);
    }

    function getStatusBadge(status: string, breakMinutes?: number | null) {
        if (status === "available") {
            return (
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                    ● verfügbar
                </span>
            );
        }
        if (status === "break") {
            return (
                <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                    ⏸ Pause{breakMinutes ? ` · ${breakMinutes} Min` : ""}
                </span>
            );
        }
        if (status === "vacation") {
            return (
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                    ✕ Urlaub
                </span>
            );
        }
        return (
            <span className="rounded-full bg-neutral-700/50 px-3 py-1 text-xs font-semibold text-neutral-400">
                ● nicht da
            </span>
        );
    }

    function getModeLabel(mode: string) {
        if (mode === "queue") return "Warteschlange";
        if (mode === "appointment") return "Nur Termine";
        if (mode === "hybrid") return "Warteschlange + Termine";
        return mode;
    }

    function canJoinQueue(status: string, mode: string) {
        return status === "available" && (mode === "queue" || mode === "hybrid");
    }

    function getQueueCountForBarber(barberId: number) {
        return queueEntries.filter((e) => e.barber_id === barberId).length;
    }

    function getEstimatedWaitForBarber(barberId: number) {
        return getQueueCountForBarber(barberId) * 25;
    }

    async function joinQueue(barberId: number) {
        setLoadingBarberId(barberId);
        const { data, error } = await supabase
            .from("queue_entries")
            .insert([
                {
                    name: customerName || "Anonym",
                    status: "waiting",
                    barber_id: barberId,
                },
            ])
            .select()
            .single();
        if (error) {
            alert(error.message);
            console.error(error);
            setLoadingBarberId(null);
            return;
        }
        router.push(`/queue?barberId=${barberId}&entryId=${data.id}`);
    }

    return (
        <main className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
            <div className="mx-auto max-w-md">

                <div className="mb-8">
                    <p className="text-sm font-semibold text-amber-400">CutNow</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">
                        Wähle deinen Barber
                    </h1>
                    <p className="mt-2 text-neutral-400">
                        Live-Status · Wartezeit · Direkt einchecken
                    </p>
                </div>

                <input
                    type="text"
                    placeholder="Dein Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3.5 text-white outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors"
                />

                <div className="mt-5 space-y-4">
                    {barbers.map((barber) => {
                        const count = getQueueCountForBarber(barber.id);
                        const wait = getEstimatedWaitForBarber(barber.id);
                        const canJoin = canJoinQueue(barber.status, barber.mode);

                        return (
                            <div
                                key={barber.id}
                                className="rounded-3xl border border-white/5 bg-neutral-900 p-5">

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-sm font-bold text-amber-400">
                                        {getInitials(barber.name)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h2 className="text-lg font-bold truncate">{barber.name}</h2>
                                            {getStatusBadge(barber.status, barber.break_minutes)}
                                        </div>
                                        <p className="mt-0.5 text-sm text-neutral-500">
                                            {getModeLabel(barber.mode)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-neutral-800/60 p-3.5">
                                        <p className="text-xs text-neutral-400">In der Schlange</p>
                                        <p className="mt-1 text-xl font-bold">{count} {count === 1 ? "Person" : "Personen"}</p>
                                    </div>
                                    <div className="rounded-xl bg-neutral-800/60 p-3.5">
                                        <p className="text-xs text-neutral-400">Wartezeit ca.</p>
                                        <p className="mt-1 text-xl font-bold">{wait} Min</p>
                                    </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                    {(barber.mode === "queue" || barber.mode === "hybrid") && (
                                        <button
                                            onClick={() => joinQueue(barber.id)}
                                            disabled={loadingBarberId === barber.id || !canJoin}
                                            className="w-full rounded-2xl bg-amber-400 py-3.5 font-bold text-black transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">
                                            {loadingBarberId === barber.id
                                                ? "Wird eingetragen..."
                                                : canJoin
                                                    ? "In Warteschlange eintragen"
                                                    : "Aktuell nicht verfügbar"}
                                        </button>
                                    )}

                                    {(barber.mode === "appointment" || barber.mode === "hybrid") && (
                                        <button
                                            onClick={() => alert("Termine kommen bald! 🗓️")}
                                            className="w-full rounded-2xl border border-white/10 py-3.5 font-bold text-white transition-colors hover:bg-white/5">
                                            Termin buchen
                                        </button>
                                    )}
                                </div>

                            </div>
                        );
                    })}

                    {barbers.length === 0 && (
                        <div className="rounded-2xl border border-white/5 bg-neutral-900 p-6 text-center">
                            <p className="text-neutral-400">Noch keine Friseure gefunden.</p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
