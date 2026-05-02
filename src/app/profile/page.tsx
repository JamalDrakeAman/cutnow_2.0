"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/lib/useLanguage";
import { Language } from "@/lib/translations";
import { saveCustomerName } from "@/lib/customerStorage";
import { useCustomerAuth } from "@/lib/useCustomerAuth";
import Link from "next/link";

function getInitials(name: string) {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function SettingRow({ icon, label, right, onClick }: {
    icon: React.ReactNode;
    label: string;
    right?: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-white/5 disabled:cursor-default"
            disabled={!onClick}>
            <span className="text-neutral-400">{icon}</span>
            <span className="flex-1 font-medium">{label}</span>
            {right}
        </button>
    );
}

function ChevronRight() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-amber-400" : "bg-neutral-700"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
        </button>
    );
}

const LANGUAGES: { value: Language; label: string; full: string }[] = [
    { value: "de", label: "DE", full: "Deutsch" },
    { value: "en", label: "EN", full: "English" },
];

export default function ProfilePage() {
    const router = useRouter();
    const { lang, changeLang } = useLanguage();
    const { user, profile, loading: authLoading, updateName, signOut } = useCustomerAuth();
    const [name, setName] = useState("");
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [notifications, setNotifications] = useState(false);
    const [showLangPicker, setShowLangPicker] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) { router.replace("/customer-auth"); return; }
        if (profile?.name) {
            setName(profile.name);
            setNameInput(profile.name);
        }
    }, [authLoading, user, profile, router]);

    async function saveName() {
        saveCustomerName(nameInput);
        setName(nameInput);
        await updateName(nameInput);
        setEditingName(false);
    }

    const currentLang = LANGUAGES.find((l) => l.value === lang);

    return (
        <main className="min-h-screen bg-neutral-950 pb-28 text-white">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-black">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                            <line x1="20" y1="4" x2="8.12" y2="15.88" />
                            <line x1="14.47" y1="14.48" x2="20" y2="20" />
                            <line x1="8.12" y1="8.12" x2="12" y2="12" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold">Cut<span className="text-amber-400">Now</span></span>
                </div>
                <Link href="/customer" className="rounded-full bg-neutral-800 px-4 py-1.5 text-sm font-semibold text-neutral-300">
                    Kunde
                </Link>
            </div>

            <div className="mx-auto max-w-lg px-5 space-y-5">

                {/* Profil-Karte */}
                <div className="rounded-2xl border border-white/5 bg-neutral-900">
                    {editingName ? (
                        <div className="p-4">
                            <p className="mb-2 text-sm text-neutral-400">Dein Name</p>
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                autoFocus
                                className="w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-amber-400/50"
                                placeholder="Name eingeben"
                            />
                            <div className="mt-3 flex gap-2">
                                <button onClick={saveName} className="flex-1 rounded-xl bg-amber-400 py-2.5 font-bold text-black">Speichern</button>
                                <button onClick={() => setEditingName(false)} className="flex-1 rounded-xl bg-white/10 py-2.5 font-bold">Abbrechen</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setEditingName(true)} className="flex w-full items-center gap-4 p-4 hover:bg-white/5 transition-colors rounded-2xl">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-lg font-bold text-amber-400">
                                {getInitials(name)}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-bold">{name || "Name festlegen"}</p>
                                <p className="text-sm text-neutral-400">{user?.email ?? "Tippe zum Bearbeiten"}</p>
                            </div>
                            <ChevronRight />
                        </button>
                    )}
                </div>

                {/* Darstellung */}
                <div>
                    <p className="mb-2 px-1 text-sm text-neutral-500">Darstellung</p>
                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900 divide-y divide-white/5">

                        <SettingRow
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>}
                            label="Sprache"
                            onClick={() => setShowLangPicker(!showLangPicker)}
                            right={
                                <span className="text-sm text-neutral-400">{currentLang?.full}</span>
                            }
                        />

                        {showLangPicker && (
                            <div className="px-4 py-3 flex gap-2">
                                {LANGUAGES.map((l) => (
                                    <button
                                        key={l.value}
                                        onClick={() => { changeLang(l.value); setShowLangPicker(false); }}
                                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                                            lang === l.value ? "bg-amber-400 text-black" : "bg-neutral-800 text-white"
                                        }`}>
                                        {l.full}
                                    </button>
                                ))}
                            </div>
                        )}

                        <SettingRow
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>}
                            label="Dark Mode"
                            right={<Toggle on={true} onToggle={() => {}} />}
                        />
                    </div>
                </div>

                {/* Benachrichtigungen */}
                <div>
                    <p className="mb-2 px-1 text-sm text-neutral-500">Benachrichtigungen</p>
                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900">
                        <SettingRow
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>}
                            label="Push-Benachrichtigungen"
                            onClick={() => setNotifications(!notifications)}
                            right={<Toggle on={notifications} onToggle={() => setNotifications(!notifications)} />}
                        />
                    </div>
                </div>

                {/* Konto */}
                <div>
                    <p className="mb-2 px-1 text-sm text-neutral-500">Konto</p>
                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900 divide-y divide-white/5">
                        <SettingRow
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
                            label="Profil bearbeiten"
                            onClick={() => setEditingName(true)}
                            right={<ChevronRight />}
                        />
                        <Link href="/my-appointments" className="flex w-full items-center gap-4 px-4 py-3.5 hover:bg-white/5 transition-colors">
                            <span className="text-neutral-400">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </span>
                            <span className="flex-1 font-medium">Meine Termine</span>
                            <ChevronRight />
                        </Link>
                    </div>
                </div>

                {/* Support */}
                <div>
                    <p className="mb-2 px-1 text-sm text-neutral-500">Support</p>
                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900 divide-y divide-white/5">
                        <SettingRow
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>}
                            label="Hilfe & FAQ"
                            onClick={() => {}}
                            right={<ChevronRight />}
                        />
                        <SettingRow
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                            label="Datenschutz"
                            onClick={() => {}}
                            right={<ChevronRight />}
                        />
                    </div>
                </div>

                {/* Abmelden */}
                <button
                    onClick={async () => { await signOut(); router.push("/customer-auth"); }}
                    className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 py-3.5 font-bold text-red-400 transition-colors hover:bg-red-500/10">
                    Abmelden
                </button>

                <p className="text-center text-xs text-neutral-600 pb-2">CutNow · Version 2.0</p>

            </div>

            <BottomNav />
        </main>
    );
}
