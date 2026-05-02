"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type QueueEntry = {
    id: number;
    name: string;
    status: string;
    barber_id: number;
    created_at: string;
};

type BarberProfile = {
    id: number;
    user_id: string;
    name: string;
    status: string;
    mode: string;
    break_minutes: number | null;
};

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function BarberPage() {

    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [barber, setBarber] = useState<BarberProfile | null>(null);

    useEffect(() => {
        fetchBarberProfile();
        const channel = supabase
            .channel("barber_queue_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "queue_entries",
                },
                () => {
                    fetchBarberProfile();
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function logout() {
        await supabase.auth.signOut();
        window.location.href = "/barber-login";
    }

    async function fetchBarberProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = "/barber-login";
            return;
        }
        const { data, error } = await supabase
            .from("barbers")
            .select("*")
            .eq("user_id", user.id)
            .single();
        if (error) {
            alert(error.message);
            return;
        }
        setBarber(data);
        fetchQueue(data.id);
    }

    async function fetchQueue(barberId?: number) {
        if (!barberId) return;
        const { data, error } = await supabase
            .from("queue_entries")
            .select("*")
            .eq("barber_id", barberId)
            .not("status", "in", '("skipped","done")')
            .order("created_at", { ascending: true });
        if (error) {
            console.error(error);
            return;
        }
        setQueue(data || []);
    }

    async function finishCurrentCustomer() {
        const current = queue[0];
        if (!current) return;
        const { error } = await supabase
            .from("queue_entries")
            .update({ status: "done" })
            .eq("id", current.id);
        if (error) {
            alert(error.message);
            return;
        }
        if (barber) fetchQueue(barber.id);
    }

    async function skipCurrentCustomer() {
        const current = queue[0];
        if (!current) return;
        const { error } = await supabase
            .from("queue_entries")
            .update({ status: "skipped" })
            .eq("id", current.id);
        if (error) {
            alert(error.message);
            return;
        }
        if (barber) fetchQueue(barber.id);
    }

    async function updateBarberStatus(status: string, breakMinutes: number | null = null) {
        if (!barber) return;
        const { error } = await supabase
            .from("barbers")
            .update({
                status,
                break_minutes: status === "break" ? breakMinutes : null,
            })
            .eq("id", barber.id);
        if (error) {
            alert(error.message);
            return;
        }
        setBarber({ ...barber, status, break_minutes: status === "break" ? breakMinutes : null });
    }

    async function updateBarberMode(mode: string) {
        if (!barber) return;
        const { error } = await supabase
            .from("barbers")
            .update({ mode })
            .eq("id", barber.id);
        if (error) {
            alert(error.message);
            return;
        }
        setBarber({ ...barber, mode });
    }

    function getQueueStatusLabel(status: string) {
        if (status === "waiting") return "🕒 Wartet";
        if (status === "arrived") return "🟢 Ist da";
        if (status === "on_way") return "🟡 Unterwegs";
        if (status === "skipped") return "⏭️ Übersprungen";
        if (status === "done") return "✅ Fertig";
        return status;
    }

    function getBarberStatusBadge(status: string, breakMinutes?: number | null) {
        if (status === "available") return <span className="text-emerald-400">● Verfügbar</span>;
        if (status === "break") return <span className="text-yellow-400">⏸ Pause{breakMinutes ? ` · ${breakMinutes} Min` : ""}</span>;
        if (status === "offline") return <span className="text-neutral-400">● Offline</span>;
        if (status === "vacation") return <span className="text-red-400">✕ Urlaub</span>;
        return <span>{status}</span>;
    }

    const currentCustomer = queue[0];
    const nextCustomers = queue.slice(1);

    return (
        <main className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
            <div className="mx-auto max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-sm font-bold text-amber-400">
                            {barber ? getInitials(barber.name) : "…"}
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400">Barber Dashboard</p>
                            <h1 className="text-xl font-bold">
                                {barber ? barber.name : "Lädt..."}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {barber && (
                            <span className="text-sm font-semibold">
                                {getBarberStatusBadge(barber.status, barber.break_minutes)}
                            </span>
                        )}
                        <button
                            onClick={logout}
                            className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-neutral-400 transition-colors hover:bg-white/5">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Arbeitsmodus */}
                <div className="mt-6 rounded-3xl border border-white/5 bg-neutral-900 p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                        Arbeitsmodus
                    </p>
                    <p className="mt-1 text-lg font-bold">
                        {barber
                            ? barber.mode === "queue"
                                ? "Nur Warteschlange"
                                : barber.mode === "appointment"
                                    ? "Nur Termine"
                                    : "Warteschlange + Termine"
                            : "Lädt..."}
                    </p>
                    <div className="mt-4 space-y-2">
                        {[
                            { value: "queue", label: "Nur Warteschlange" },
                            { value: "appointment", label: "Nur Termine" },
                            { value: "hybrid", label: "Warteschlange + Termine" },
                        ].map((m) => (
                            <button
                                key={m.value}
                                onClick={() => updateBarberMode(m.value)}
                                className={`w-full rounded-2xl py-3 font-bold transition-colors ${
                                    barber?.mode === m.value
                                        ? "bg-amber-400 text-black"
                                        : "bg-white/5 text-white hover:bg-white/10"
                                }`}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div className="mt-4 rounded-3xl border border-white/5 bg-neutral-900 p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                        Mein Status
                    </p>
                    <p className="mt-1 text-lg font-bold">
                        {barber ? getBarberStatusBadge(barber.status, barber.break_minutes) : "Lädt..."}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                            onClick={() => updateBarberStatus("available")}
                            className={`rounded-2xl py-3 font-bold transition-colors ${
                                barber?.status === "available"
                                    ? "bg-emerald-400 text-black"
                                    : "bg-white/5 text-white hover:bg-white/10"
                            }`}>
                            Verfügbar
                        </button>
                        <button
                            onClick={() => updateBarberStatus("offline")}
                            className={`rounded-2xl py-3 font-bold transition-colors ${
                                barber?.status === "offline"
                                    ? "bg-neutral-400 text-black"
                                    : "bg-white/5 text-white hover:bg-white/10"
                            }`}>
                            Offline
                        </button>
                        <button
                            onClick={() => updateBarberStatus("vacation")}
                            className={`col-span-2 rounded-2xl py-3 font-bold transition-colors ${
                                barber?.status === "vacation"
                                    ? "bg-red-500 text-white"
                                    : "bg-white/5 text-white hover:bg-white/10"
                            }`}>
                            Urlaub
                        </button>
                    </div>

                    <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                            Pause setzen
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            {[5, 10, 15].map((min) => (
                                <button
                                    key={min}
                                    onClick={() => updateBarberStatus("break", min)}
                                    className={`rounded-2xl py-3 font-bold transition-colors ${
                                        barber?.status === "break" && barber?.break_minutes === min
                                            ? "bg-yellow-400 text-black"
                                            : "bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20"
                                    }`}>
                                    {min} Min
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Aktueller Kunde */}
                <div className="mt-4 rounded-3xl border border-white/5 bg-neutral-900 p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                        Aktueller Kunde
                    </p>

                    {currentCustomer ? (
                        <>
                            <div className="mt-3 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">{currentCustomer.name}</h2>
                                <span className="text-sm text-neutral-400">
                                    {getQueueStatusLabel(currentCustomer.status)}
                                </span>
                            </div>
                            <button
                                onClick={finishCurrentCustomer}
                                className="mt-4 w-full rounded-2xl bg-amber-400 py-4 font-bold text-black transition-colors hover:bg-amber-300">
                                Kunde fertig ✓
                            </button>
                            <button
                                onClick={skipCurrentCustomer}
                                className="mt-2 w-full rounded-2xl border border-white/10 py-3.5 font-bold text-neutral-400 transition-colors hover:bg-white/5">
                                Überspringen
                            </button>
                        </>
                    ) : (
                        <p className="mt-3 text-neutral-400">
                            Warteschlange ist leer.
                        </p>
                    )}
                </div>

                {/* Nächste Kunden */}
                {nextCustomers.length > 0 && (
                    <div className="mt-6">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                            Nächste Kunden ({nextCustomers.length})
                        </p>
                        <div className="space-y-2">
                            {nextCustomers.map((customer, index) => (
                                <div
                                    key={customer.id}
                                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-neutral-900 px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-neutral-500">
                                            #{index + 2}
                                        </span>
                                        <p className="font-semibold">{customer.name}</p>
                                    </div>
                                    <p className="text-sm text-neutral-400">
                                        {getQueueStatusLabel(customer.status)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
