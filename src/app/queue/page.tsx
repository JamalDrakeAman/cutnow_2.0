"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/useLanguage";
import { Language } from "@/lib/translations";

type QueueEntry = {
    id: number;
    name: string;
    status: string;
    barber_id: number;
    created_at: string;
};

const LANGUAGES: { value: Language; label: string }[] = [
    { value: "de", label: "DE" },
    { value: "en", label: "EN" },
];

function QueuePageContent() {
    const searchParams = useSearchParams();
    const barberId = Number(searchParams.get("barberId"));
    const entryId = Number(searchParams.get("entryId"));

    const { lang, changeLang, t } = useLanguage();
    const [queue, setQueue] = useState<QueueEntry[]>([]);

    useEffect(() => {
        fetchQueue();
        const channel = supabase
            .channel("queue_entries_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "queue_entries" },
                () => { fetchQueue(); }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [barberId]);

    async function fetchQueue() {
        if (!barberId) return;
        const { data, error } = await supabase
            .from("queue_entries")
            .select("*")
            .eq("barber_id", barberId)
            .order("created_at", { ascending: true });
        if (error) { console.error(error); return; }
        setQueue(data || []);
    }

    async function updateStatus(id: number, status: string) {
        const { error } = await supabase
            .from("queue_entries")
            .update({ status })
            .eq("id", id);
        if (error) { alert(error.message); return; }
        fetchQueue();
    }

    async function leaveQueue(id: number) {
        const { error } = await supabase
            .from("queue_entries")
            .delete()
            .eq("id", id);
        if (error) { alert(error.message); return; }
        fetchQueue();
    }

    const currentUser = queue.find((item) => item.id === entryId);
    const activeQueue = queue.filter((e) => e.status !== "skipped" && e.status !== "done");
    const myActiveIndex = currentUser
        ? activeQueue.findIndex((item) => item.id === currentUser.id)
        : -1;
    const peopleBeforeYou = myActiveIndex >= 0 ? myActiveIndex : 0;
    const estimatedWaitMinutes = peopleBeforeYou * 25;
    const hasValidEntry = Boolean(currentUser);

    function getStatusLabel(status: string) {
        if (status === "waiting") return t("statusWaiting");
        if (status === "arrived") return t("statusArrived");
        if (status === "on_way") return t("statusOnWay");
        if (status === "done") return t("statusDone");
        if (status === "skipped") return t("statusSkipped");
        return status;
    }

    return (
        <main className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
            <div className="mx-auto max-w-md">

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-amber-400">{t("appName")}</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight">{t("queueTitle")}</h1>
                    </div>

                    {/* Sprachwechsler */}
                    <div className="flex items-center gap-1 rounded-xl bg-neutral-900 p-1">
                        {LANGUAGES.map((l) => (
                            <button
                                key={l.value}
                                onClick={() => changeLang(l.value)}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                                    lang === l.value
                                        ? "bg-amber-400 text-black"
                                        : "text-neutral-400 hover:text-white"
                                }`}>
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>

                {!hasValidEntry && (
                    <div className="rounded-2xl border border-white/5 bg-neutral-900 p-6 text-center text-neutral-400">
                        {t("entryNotFound")}
                    </div>
                )}

                {currentUser?.status === "done" && (
                    <div className="rounded-3xl bg-amber-400 p-6 text-black">
                        <p className="text-sm font-semibold opacity-70">{t("completed")}</p>
                        <h2 className="mt-1 text-3xl font-bold">{t("youAreDone")}</h2>
                        <p className="mt-2 opacity-70">{t("doneMessage")}</p>
                    </div>
                )}

                {currentUser && currentUser.status !== "done" && (
                    <div className="rounded-3xl border border-white/5 bg-neutral-900 p-5">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400">{t("loggedInAs")}</p>
                                <h2 className="text-xl font-bold">{currentUser.name}</h2>
                            </div>
                            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-400">
                                {getStatusLabel(currentUser.status)}
                            </span>
                        </div>

                        <div className="mt-5 rounded-2xl bg-neutral-950 p-5 text-center">
                            <p className="text-sm text-neutral-400">{t("yourPosition")}</p>
                            <p className="my-2 text-7xl font-bold text-amber-400">
                                #{myActiveIndex >= 0 ? myActiveIndex + 1 : "–"}
                            </p>
                            <p className="text-neutral-400">
                                {peopleBeforeYou === 0
                                    ? t("youAreNext")
                                    : `${peopleBeforeYou} ${peopleBeforeYou === 1 ? t("personAhead") : t("peopleAhead")}`}
                            </p>
                            {peopleBeforeYou > 0 && (
                                <p className="mt-1 text-lg font-bold text-amber-400">
                                    {t("approxWait")} {estimatedWaitMinutes} {t("min")}
                                </p>
                            )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => updateStatus(currentUser.id, "arrived")}
                                className="rounded-2xl bg-amber-400 py-3.5 font-bold text-black transition-colors hover:bg-amber-300">
                                {t("iAmHere")}
                            </button>
                            <button
                                onClick={() => updateStatus(currentUser.id, "on_way")}
                                className="rounded-2xl border border-white/10 py-3.5 font-bold text-white transition-colors hover:bg-white/5">
                                {t("onMyWay")}
                            </button>
                        </div>

                        <button
                            onClick={() => leaveQueue(currentUser.id)}
                            className="mt-3 w-full rounded-2xl border border-red-500/20 bg-red-500/5 py-3.5 font-bold text-red-400 transition-colors hover:bg-red-500/10">
                            {t("leaveQueue")}
                        </button>

                    </div>
                )}

                <Link
                    href="/customer"
                    className="mt-4 block w-full rounded-2xl border border-white/10 py-3.5 text-center font-bold text-neutral-400 transition-colors hover:bg-white/5">
                    {t("backToBarbers")}
                </Link>

                {activeQueue.length > 0 && (
                    <div className="mt-6">
                        <p className="mb-3 text-sm font-semibold text-neutral-400">
                            {t("queueListLabel")} ({activeQueue.length})
                        </p>
                        <div className="space-y-2">
                            {activeQueue.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                                        item.id === entryId
                                            ? "border-amber-400/30 bg-amber-400/5"
                                            : "border-white/5 bg-neutral-900"
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-bold ${item.id === entryId ? "text-amber-400" : "text-neutral-500"}`}>
                                            #{index + 1}
                                        </span>
                                        <p className="font-semibold">
                                            {item.id === entryId ? `${item.name} (${t("youMarker")})` : item.name}
                                        </p>
                                    </div>
                                    <p className="text-sm text-neutral-400">{getStatusLabel(item.status)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

export default function QueuePage() {
    return (
        <Suspense fallback={
            <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
                <p className="text-neutral-400">Lädt...</p>
            </main>
        }>
            <QueuePageContent />
        </Suspense>
    );
}
