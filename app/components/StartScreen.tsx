'use client'

type StartScreenProps = {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-6 py-10">
      <section
        aria-labelledby="start-screen-title"
        className="w-full max-w-lg rounded-2xl border border-white/30 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12"
      >
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
          Explore the city
        </p>
        <h1 id="start-screen-title" className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Ulaanbaatar 3D
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Walk through a 3D view of Ulaanbaatar.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Desktop: WASD to move, Space/C to rise and descend, and click the view to look around.
          <br />
          Touch: drag on the right side to look, and use the arrow buttons to rise or descend.
          Distance culling implemented will make it better, Odoo oirthoor info ugdug bolhin XD
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-8 rounded-full bg-yellow-400 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-yello-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yello-700"
        >
          Start exploring
        </button>
      </section>
    </div>
  )
}
