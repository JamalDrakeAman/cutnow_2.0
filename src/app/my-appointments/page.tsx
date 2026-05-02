"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getAppointmentIds } from "@/lib/customerStorage";

type Appointment = {
    id: number;
    barber_id: number;
    customer_name: string;
    date: string;
    time: string;
    status: string;
    barbers: { name: string }[] | { name: string } | null;
};

function StatusBadge({ status }: { status: string }) {
    if (status === "confirmed") return (
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Bestätigt</span>
    );
    if (status === "cancelled") return (
        <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400">Abgesagt</span>
    );
    return (
        <span className="rounded-full bg-neutral-700/50 px-2.5 py-0.5 text-xs font-semibold text-neutral-400">{status}</span>
    );
}

function formatDate(dateStr: string): string {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    if (dateStr === today) return "Heute";
    if (dateStr === tomorrow) return "Morgen";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
}

export default function MyAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    async function fetchAppointments() {
        const ids = getAppointmentIds();
        if (ids.length === 0) {
            setLoading(false);
            return;
        }
        const { data } = await supabase
            .from("appointments")
            .select("id, barber_id, customer_name, date, time, status, barbers(name)")
            .in("id", ids)
            .order("date", { ascending: true })
            .order("time", { ascending: true });
        setAppointments((data as unknown as Appointment[]) || []);
        setLoading(false);
    }

    const upcoming = appointments.filter((a) => a.status !== "cancelled" && a.date >= new Date().toISOString().split("T")[0]);
    const past = appointments.filter((a) => a.status === "cancelled" || a.date < new Date().toISOString().split("T")[0]);

    return (
        <main className="min-h-screen bg-neutral-950 pb-28 text-white">

            <div className="px-5 py-5">
                <Link href="/profile" className="text-sm text-neutral-400 transition-colors hover:text-white">
                    ← Zurück
                </Link>
                <h1 className="mt-4 text-2xl font-bold tracking-tight">Meine Termine</h1>
            </div>

            <div className="px-5 space-y-6">

                {loading && (
                    <div className="rounded-2xl border border-white/5 bg-neutral-900 p-6 text-center text-neutral-400">
                        Lädt...
                    </div>
                )}

                {!loading && appointments.length === 0 && (
                    <div className="rounded-2xl border border-white/5 bg-neutral-900 p-8 text-center">
                        <p className="text-3xl mb-3">📅</p>
                        <p className="font-bold">Keine Termine</p>
                        <p className="mt-1 text-sm text-neutral-400">Deine gebuchten Termine erscheinen hier.</p>
                        <Link
                            href="/search"
                            className="mt-4 inline-block rounded-xl bg-amber-400 px-5 py-2.5 font-bold text-black">
                            Barber finden
                        </Link>
                    </div>
                )}

                {upcoming.length > 0 && (
                    <div>
                        <p className="mb-3 px-1 text-sm text-neutral-500">Kommende Termine</p>
                        <div className="space-y-3">
                            {upcoming.map((a) => (
                                <div key={a.id} className="rounded-2xl border border-white/5 bg-neutral-900 p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-bold">{Array.isArray(a.barbers) ? (a.barbers[0]?.name ?? "Barber") : (a.barbers?.name ?? "Barber")}</p>
                                            <p className="mt-1 text-sm text-neutral-400">
                                                {formatDate(a.date)} · {a.time} Uhr
                                            </p>
                                            <p className="mt-0.5 text-sm text-neutral-500">{a.customer_name}</p>
                                        </div>
                                        <StatusBadge status={a.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {past.length > 0 && (
                    <div>
                        <p className="mb-3 px-1 text-sm text-neutral-500">Vergangene Termine</p>
                        <div className="space-y-3 opacity-60">
                            {past.map((a) => (
                                <div key={a.id} className="rounded-2xl border border-white/5 bg-neutral-900 p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-bold">{Array.isArray(a.barbers) ? (a.barbers[0]?.name ?? "Barber") : (a.barbers?.name ?? "Barber")}</p>
                                            <p className="mt-1 text-sm text-neutral-400">
                                                {formatDate(a.date)} · {a.time} Uhr
                                            </p>
                                            <p className="mt-0.5 text-sm text-neutral-500">{a.customer_name}</p>
                                        </div>
                                        <StatusBadge status={a.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            <BottomNav />
        </main>
    );
}
