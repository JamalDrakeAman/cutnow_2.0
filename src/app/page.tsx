import Link from "next/link";

function ScissorsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">

      {/* Nav */}
      <nav className="mx-auto flex max-w-lg items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-black">
            <ScissorsIcon />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Cut<span className="text-amber-400">Now</span>
          </span>
        </div>
        <Link
          href="/barber-login"
          className="text-sm font-semibold text-neutral-300 transition-colors hover:text-white">
          Anmelden
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-lg px-5 py-10">

        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Live Queue Updates
          </div>
        </div>

        <h1 className="text-center text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Nie wieder unnötig<br />beim Friseur warten.
        </h1>

        <p className="mx-auto mt-5 max-w-sm text-center text-base leading-relaxed text-neutral-400">
          Sieh live, wer verfügbar ist, wie lang die Warteschlange ist, und checke mit einem Tap ein. Dein Barber weiß, dass du kommst.
        </p>

        <div className="mt-7 flex gap-3">
          <Link
            href="/customer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 font-bold text-black transition-colors hover:bg-amber-300">
            Barber finden
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/barber-login"
            className="flex flex-1 items-center justify-center rounded-xl bg-neutral-800 px-5 py-3.5 font-bold text-white transition-colors hover:bg-neutral-700">
            Für Friseure
          </Link>
        </div>

        {/* Mock Card */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-neutral-900 p-5">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-sm font-bold text-amber-400">
              MK
            </div>
            <div className="flex-1">
              <p className="font-bold">Marco's Barbershop</p>
              <p className="flex items-center gap-1 text-xs text-neutral-400">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-500">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Berlin Mitte
              </p>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              ● Offen
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-neutral-800 p-3 text-center">
              <p className="text-xl font-bold text-amber-400">#3</p>
              <p className="mt-0.5 text-xs text-neutral-400">Position</p>
            </div>
            <div className="rounded-xl bg-neutral-800 p-3 text-center">
              <p className="text-xl font-bold">~25</p>
              <p className="mt-0.5 text-xs text-neutral-400">Minuten</p>
            </div>
            <div className="rounded-xl bg-neutral-800 p-3 text-center">
              <p className="text-xl font-bold">
                <span className="text-amber-400">★</span> 4.9
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">Bewertung</p>
            </div>
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-bold text-black">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
            Ich bin da
          </button>

        </div>

        {/* Feature Row */}
        <div className="mt-6 rounded-2xl border border-white/5 bg-neutral-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Live-Status</p>
              <p className="text-sm text-neutral-400">Sieh sofort, wer verfügbar ist – ohne anzurufen.</p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/5 bg-neutral-900 p-4">
            <p className="text-xl">🕐</p>
            <p className="mt-2 font-bold">Wartezeit</p>
            <p className="mt-1 text-sm text-neutral-400">Echte Schätzungen, kein Rätselraten.</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-neutral-900 p-4">
            <p className="text-xl">✂️</p>
            <p className="mt-2 font-bold">Dein Barber</p>
            <p className="mt-1 text-sm text-neutral-400">Direkt beim Lieblingsbarber einchecken.</p>
          </div>
        </div>

      </section>

    </main>
  );
}
