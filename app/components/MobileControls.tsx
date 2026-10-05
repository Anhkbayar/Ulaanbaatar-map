import { useRef } from 'react'

type LookState = { vertical: number }

export default function MobileControls({
  look,
}: {
  look: React.MutableRefObject<LookState>
}) {
  const pointerId = useRef<number | null>(null)
  const lastY = useRef(0)

  const startLook = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerId.current = event.pointerId
    lastY.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveLook = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) return

    const deltaY = event.clientY - lastY.current
    lastY.current = event.clientY
    look.current.vertical = -deltaY * 0.004
  }

  const stopLook = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current === event.pointerId) pointerId.current = null
    look.current.vertical = 0
  }

  const setVerticalInput = (value: number) => {
    look.current.vertical = value
  }

  return (
    <div className="absolute inset-0 z-20 touch-none select-none">
      <div
        className="absolute inset-y-0 right-0 w-1/2"
        onPointerDown={startLook}
        onPointerMove={moveLook}
        onPointerUp={stopLook}
        onPointerCancel={stopLook}
      />
      <div className="absolute bottom-10 right-10 flex flex-col gap-3">
        <button
          className="h-16 w-16 rounded-full bg-white/60 text-2xl font-bold active:bg-white/80"
          onPointerDown={() => setVerticalInput(1)}
          onPointerUp={() => setVerticalInput(0)}
          onPointerCancel={() => setVerticalInput(0)}
        > &#9650; </button>
        <button
          className="h-16 w-16 rounded-full bg-white/60 text-2xl font-bold active:bg-white/80"
          onPointerDown={() => setVerticalInput(-1)}
          onPointerUp={() => setVerticalInput(0)}
          onPointerCancel={() => setVerticalInput(0)}
        > &#9660; </button>
      </div>
    </div>
  )
}
