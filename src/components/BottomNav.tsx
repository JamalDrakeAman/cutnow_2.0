"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getActiveQueue } from "@/lib/customerStorage";

function HomeIcon({ active }: { active: boolean }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
        </svg>
    );
}

function SearchIcon({ active }: { active: boolean }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    );
}

function QueueIcon({ active }: { active: boolean }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    );
}

function ProfileIcon({ active }: { active: boolean }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

export default function BottomNav() {
    const pathname = usePathname();
    const [queueLink, setQueueLink] = useState<string | null>(null);
    const [hasQueue, setHasQueue] = useState(false);

    useEffect(() => {
        const active = getActiveQueue();
        if (active) {
            setQueueLink(`/queue?barberId=${active.barberId}&entryId=${active.entryId}`);
            setHasQueue(true);
        } else {
            setQueueLink(null);
            setHasQueue(false);
        }
    }, [pathname]);

    const isHome = pathname === "/customer" || pathname === "/";
    const isSearch = pathname === "/search";
    const isQueue = pathname.startsWith("/queue");
    const isProfile = pathname === "/profile" || pathname.startsWith("/my-appointments");

    const tabs = [
        {
            href: "/customer",
            label: "Home",
            active: isHome,
            icon: <HomeIcon active={isHome} />,
        },
        {
            href: "/search",
            label: "Suchen",
            active: isSearch,
            icon: <SearchIcon active={isSearch} />,
        },
        {
            href: queueLink ?? "/customer",
            label: "Queue",
            active: isQueue,
            icon: <QueueIcon active={isQueue} />,
            dot: hasQueue && !isQueue,
        },
        {
            href: "/profile",
            label: "Profil",
            active: isProfile,
            icon: <ProfileIcon active={isProfile} />,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-neutral-950/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-safe pt-2">
                {tabs.map((tab) => (
                    <Link
                        key={tab.label}
                        href={tab.href}
                        className={`relative flex flex-col items-center gap-1 px-5 py-2 transition-colors ${
                            tab.active ? "text-amber-400" : "text-neutral-500 hover:text-neutral-300"
                        }`}>
                        <div className="relative">
                            {tab.icon}
                            {tab.dot && (
                                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />
                            )}
                        </div>
                        <span className="text-xs font-semibold">{tab.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
