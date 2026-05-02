import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="text-xl font-bold tracking-tight">
          Cut<span className="text-amber-400">Now</span>
        </div>
        <Link
          href="/barber-login"
          className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white/15">
          Für Friseure →
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-400 ring-1 ring-amber-400/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Live-Warteschlange für Barbershops
            </div>

            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              Nie wieder{" "}
              <span className="text-amber-400">unnötig</span>{" "}
              beim Friseur warten.
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-neutral-400">
              Sieh live, welcher Barber verfügbar ist und wie lange du warten musst.
              Kein Anruf. Kein Rumstehen. Einfach einchecken.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/customer"
                className="rounded-full bg-amber-400 px-7 py-3.5 text-center font-bold text-black transition-colors hover:bg-amber-300">
                Barber finden →
              </Link>
              <Link
                href="/barber-login"
                className="rounded-full border border-white/15 px-7 py-3.5 text-center font-bold transition-colors hover:bg-white/5">
                Demo für Friseure
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-neutral-900 p-2 shadow-2xl shadow-black/50">
            <div className="rounded-[1.5rem] bg-neutral-950 p-5">

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-sm font-bold text-amber-400">
                  AH
                </div>
                <div>
                  <p className="font-bold">Ahmed</p>
                  <p className="text-xs text-neutral-500">Barber House</p>
                </div>
                <span className="ml-auto rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  ● verfügbar
                </span>
              </div>

              <div className="rounded-2xl bg-neutral-900 p-5 text-center">
                <p className="text-sm text-neutral-400">Deine Position</p>
                <p className="my-2 text-7xl font-bold text-amber-400">#3</p>
                <p className="text-sm text-neutral-400">2 Personen vor dir</p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-neutral-900 p-4">
                  <p className="text-xs text-neutral-400">Wartezeit</p>
                  <p className="mt-1 text-xl font-bold">~25 Min</p>
                </div>
                <div className="rounded-xl bg-neutral-900 p-4">
                  <p className="text-xs text-neutral-400">Status</p>
                  <p className="mt-1 text-xl font-bold">Unterwegs</p>
                </div>
              </div>

              <button className="mt-3 w-full rounded-2xl bg-amber-400 py-3.5 font-bold text-black">
                Ich bin da ✓
              </button>

            </div>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "⚡", title: "Live-Status", desc: "Sieh sofort, wer verfügbar ist – ohne anzurufen." },
            { icon: "🕐", title: "Wartezeit", desc: "Echte Schätzungen, kein Rätselraten mehr." },
            { icon: "✂️", title: "Dein Barber", desc: "Wähle deinen Lieblings-Barber gezielt aus." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/5 bg-neutral-900 p-5">
              <p className="text-2xl">{f.icon}</p>
              <p className="mt-3 font-bold">{f.title}</p>
              <p className="mt-1 text-sm text-neutral-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
