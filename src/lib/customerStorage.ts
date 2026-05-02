"use client";

const QUEUE_KEY = "cutnow_active_queue";
const NAME_KEY = "cutnow_customer_name";
const APPOINTMENTS_KEY = "cutnow_appointment_ids";

export function saveActiveQueue(barberId: number, entryId: number) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify({ barberId, entryId }));
}

export function getActiveQueue(): { barberId: number; entryId: number } | null {
    try {
        const saved = localStorage.getItem(QUEUE_KEY);
        if (!saved) return null;
        return JSON.parse(saved);
    } catch {
        return null;
    }
}

export function clearActiveQueue() {
    localStorage.removeItem(QUEUE_KEY);
}

export function saveCustomerName(name: string) {
    if (name.trim()) localStorage.setItem(NAME_KEY, name.trim());
}

export function getCustomerName(): string {
    try { return localStorage.getItem(NAME_KEY) || ""; } catch { return ""; }
}

export function saveAppointmentId(id: number) {
    try {
        const existing = getAppointmentIds();
        if (!existing.includes(id)) {
            localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([...existing, id]));
        }
    } catch { /* noop */ }
}

export function getAppointmentIds(): number[] {
    try {
        const saved = localStorage.getItem(APPOINTMENTS_KEY);
        if (!saved) return [];
        return JSON.parse(saved);
    } catch {
        return [];
    }
}
