"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { saveAppointmentId, getCustomerName, saveCustomerName } from "@/lib/customerStorage";

type Barber = {
    id: number;
    name: string;
};

function generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 9; h < 18; h++) {
        slots.push(`${String(h).padStart(2, "0")}:00`);
        slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
}

function generateDates(): { value: string; label: string }[] {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const value = d.toISOString().split("T")[0];
        const label =
            i === 0
                ? "Heute"
                : i === 1
                ? "Morgen"
                : d.toLocaleDateString("de-DE", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                  });
        dates.push({ value, label });
    }
    return dates;
}

const ALL_SLOTS = generateTimeSlots();
const DATES = generateDates();

function BookPageContent() {
    const searchParams = useSearchParams();
    const barberId = Number(searchParams.get("barberId"));

    const [barber, setBarber] = useState<Barber | null>(null);
    const [customerName, setCustomerName] = useState("");
    const [selectedDate, setSelectedDate] = useState(DATES[0].value);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [takenSlots, setTakenSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [booked, setBooked] = useState(false);
    const [bookedTime, setBookedTime] = useState<string | null>(null);

    useEffect(() => {
        setCustomerName(getCustomerName());
        if (barberId) fetchBarber();
    }, [barberId]);

    useEffect(() => {
        if (barberId && selectedDate) fetchTakenSlots();
    }, [barberId, selectedDate]);

    async function fetchBarber() {
        const { data } = await supabase
            .from("barbers")
            .select("id, name")
            .eq("id", barberId)
            .single();
        if (data) setBarber(data);
    }

    async function fetchTakenSlots() {
        const { data } = await supabase
            .from("appointments")
            .select("time")
            .eq("barber_id", barberId)
            .eq("date", selectedDate)
            .not("status", "eq", "cancelled");
        setTakenSlots(data ? data.map((a: { time: string }) => a.time) : []);
        setSelectedTime(null);
    }

    async function bookAppointment() {
        if (!customerName.trim() || !selectedTime) return;
        setLoading(true);
        saveCustomerName(customerName.trim());
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from("appointments").insert([
            {
                barber_id: barberId,
                customer_name: customerName.trim(),
                date: selectedDate,
                time: selectedTime,
                status: "confirmed",
                customer_id: user?.id ?? null,
            },
        ]).select().single();
        setLoading(false);
        if (error) {
            alert(error.message);
            return;
        }
        if (data) saveAppointmentId(data.id);
        setBookedTime(selectedTime);
        setBooked(true);
    }

    if (booked) {
        return (
            <main className="flex min-h-screen items-center bg-neutral-950 pb-28 px-5 text-white">
                <div className="mx-auto w-full max-w-sm">
                    <div className="rounded-3xl bg-amber-400 p-8 text-black text-center">
                        <p className="text-5xl">✓</p>
                        <h2 className="mt-4 text-2xl font-bold">Termin gebucht!</h2>
                        <p className="mt-2 text-lg font-semibold">
                            {bookedTime} Uhr
                        </p>
                        <p className="mt-1 opacity-70">
                            {selectedDate === DATES[0].value ? "Heute" : selectedDate} bei {barber?.name}
                        </p>
                    </div>
                    <Link
                        href="/my-appointments"
                        className="mt-4 block rounded-2xl bg-amber-400/10 border border-amber-400/30 py-3.5 text-center font-bold text-amber-400 transition-colors hover:bg-amber-400/20">
                        Meine Termine anzeigen
                    </Link>
                    <Link
                        href="/customer"
                        className="mt-2 block rounded-2xl border border-white/10 py-3.5 text-center font-bold text-neutral-400 transition-colors hover:bg-white/5">
                        ← Zurück zur Übersicht
                    </Link>
                </div>
                <BottomNav />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 pb-28 px-5 py-8 text-white">
            <div className="mx-auto max-w-md">

                <Link href="/customer" className="text-sm text-neutral-400 transition-colors hover:text-white">
                    ← Zurück
                </Link>

                <div className="mt-4 mb-8">
                    <p className="text-sm font-semibold text-amber-400">Termin buchen</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">
                        {barber ? `bei ${barber.name}` : "Lädt..."}
                    </h1>
                </div>

                {/* Name */}
                <div className="mb-5">
                    <p className="mb-2 text-sm font-semibold text-neutral-400">Dein Name</p>
                    <input
                        type="text"
                        placeholder="Name eingeben"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3.5 outline-none placeholder:text-neutral-500 focus:border-amber-400/50 transition-colors"
                    />
                </div>

                {/* Datum */}
                <div className="mb-5">
                    <p className="mb-2 text-sm font-semibold text-neutral-400">Tag wählen</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {DATES.map((d) => (
                            <button
                                key={d.value}
                                onClick={() => setSelectedDate(d.value)}
                                className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${
                                    selectedDate === d.value
                                        ? "bg-amber-400 text-black"
                                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                                }`}>
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Uhrzeiten */}
                <div className="mb-6">
                    <p className="mb-2 text-sm font-semibold text-neutral-400">
                        Uhrzeit wählen{" "}
                        <span className="font-normal text-neutral-500">
                            ({ALL_SLOTS.length - takenSlots.length} frei)
                        </span>
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {ALL_SLOTS.map((slot) => {
                            const taken = takenSlots.includes(slot);
                            const selected = selectedTime === slot;
                            return (
                                <button
                                    key={slot}
                                    onClick={() => !taken && setSelectedTime(slot)}
                                    disabled={taken}
                                    className={`rounded-xl py-2.5 text-sm font-bold transition-colors ${
                                        taken
                                            ? "cursor-not-allowed bg-neutral-800/40 text-neutral-600 line-through"
                                            : selected
                                            ? "bg-amber-400 text-black"
                                            : "bg-neutral-900 text-white hover:bg-neutral-800"
                                    }`}>
                                    {slot}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Buchen */}
                <button
                    onClick={bookAppointment}
                    disabled={!customerName.trim() || !selectedTime || loading}
                    className="w-full rounded-2xl bg-amber-400 py-4 font-bold text-black transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">
                    {loading
                        ? "Wird gebucht..."
                        : selectedTime
                        ? `Termin um ${selectedTime} buchen`
                        : "Uhrzeit auswählen"}
                </button>

            </div>
            <BottomNav />
        </main>
    );
}

export default function BookPage() {
    return (
        <Suspense fallback={
            <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
                <p className="text-neutral-400">Lädt...</p>
            </main>
        }>
            <BookPageContent />
        </Suspense>
    );
}
