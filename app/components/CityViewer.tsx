'use client'

import {
  Environment,
  Grid,
  PointerLockControls,
  useGLTF,
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function CityTile() {
  const { scene } = useGLTF('/models/13.glb')

  return <primitive object={scene} />
}

function PlayerControls() {
  const { camera } = useThree()

  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    ctrl: false,
  })

  const joystick = useRef({
    x: 0,
    y: 0,
  })

  const look = useRef({
    x: 0,
    y: 0,
  })

  const direction = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())

  const [touchDevice, setTouchDevice] = useState(false)

  useEffect(() => {
    setTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )
  }, [])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.w = true
          break
        case 'KeyA':
          keys.current.a = true
          break
        case 'KeyS':
          keys.current.s = true
          break
        case 'KeyD':
          keys.current.d = true
          break
        case 'Space':
          event.preventDefault()
          keys.current.space = true
          break
        case 'ControlLeft':
        case 'ControlRight':
          keys.current.ctrl = true
          break
      }
    }

    const up = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.w = false
          break
        case 'KeyA':
          keys.current.a = false
          break
        case 'KeyS':
          keys.current.s = false
          break
        case 'KeyD':
          keys.current.d = false
          break
        case 'Space':
          keys.current.space = false
          break
        case 'ControlLeft':
        case 'ControlRight':
          keys.current.ctrl = false
          break
      }
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((_, delta) => {
    const speed = 300
    const verticalSpeed = 300

    camera.getWorldDirection(forward.current)

    forward.current.y = 0

    if (forward.current.lengthSq() > 0) {
      forward.current.normalize()
    }

    right.current
      .crossVectors(forward.current, camera.up)
      .normalize()

    direction.current.set(0, 0, 0)

    // Keyboard movement
    if (keys.current.w) {
      direction.current.add(forward.current)
    }

    if (keys.current.s) {
      direction.current.sub(forward.current)
    }

    if (keys.current.d) {
      direction.current.add(right.current)
    }

    if (keys.current.a) {
      direction.current.sub(right.current)
    }

    // Mobile joystick
    direction.current.x +=
      right.current.x * joystick.current.x +
      forward.current.x * joystick.current.y

    direction.current.z +=
      right.current.z * joystick.current.x +
      forward.current.z * joystick.current.y

    if (direction.current.lengthSq() > 0) {
      direction.current.normalize()

      camera.position.addScaledVector(
        direction.current,
        speed * delta
      )
    }

    // Vertical movement
    if (keys.current.space) {
      camera.position.y += verticalSpeed * delta
    }

    if (keys.current.ctrl) {
      camera.position.y -= verticalSpeed * delta
    }

    // Mobile up/down
    camera.position.y +=
      look.current.y * verticalSpeed * delta
  })

  return (
    <>
      {!touchDevice && <PointerLockControls />}

      {touchDevice && (
        <MobileControls
          joystick={joystick}
          look={look}
        />
      )}
    </>
  )
}

function MobileControls({
  joystick,
  look,
}: {
  joystick: React.MutableRefObject<{
    x: number
    y: number
  }>
  look: React.MutableRefObject<{
    x: number
    y: number
  }>
}) {
  const joystickPointer = useRef<number | null>(null)
  const lookPointer = useRef<number | null>(null)

  const joystickCenter = useRef({
    x: 0,
    y: 0,
  })

  const lookLast = useRef({
    x: 0,
    y: 0,
  })

  const maxDistance = 55

  const updateJoystick = (
    x: number,
    y: number
  ) => {
    const dx = x - joystickCenter.current.x
    const dy = y - joystickCenter.current.y

    const distance = Math.sqrt(
      dx * dx + dy * dy
    )

    const scale =
      distance > maxDistance
        ? maxDistance / distance
        : 1

    joystick.current.x =
      (dx * scale) / maxDistance

    // Invert Y so pushing up means forward
    joystick.current.y =
      (-dy * scale) / maxDistance
  }

  const stopJoystick = () => {
    joystickPointer.current = null
    joystick.current.x = 0
    joystick.current.y = 0
  }

  const startJoystick = (
    event: React.PointerEvent
  ) => {
    joystickPointer.current = event.pointerId

    joystickCenter.current = {
      x: event.clientX,
      y: event.clientY,
    }

    event.currentTarget.setPointerCapture(
      event.pointerId
    )
  }

  const moveJoystick = (
    event: React.PointerEvent
  ) => {
    if (
      joystickPointer.current !==
      event.pointerId
    ) {
      return
    }

    updateJoystick(
      event.clientX,
      event.clientY
    )
  }

  const startLook = (
    event: React.PointerEvent
  ) => {
    lookPointer.current = event.pointerId

    lookLast.current = {
      x: event.clientX,
      y: event.clientY,
    }

    event.currentTarget.setPointerCapture(
      event.pointerId
    )
  }

  const moveLook = (
    event: React.PointerEvent
  ) => {
    if (
      lookPointer.current !==
      event.pointerId
    ) {
      return
    }

    const dx =
      event.clientX - lookLast.current.x

    const dy =
      event.clientY - lookLast.current.y

    lookLast.current = {
      x: event.clientX,
      y: event.clientY,
    }

    const sensitivity = 0.004

    look.current.x = -dx * sensitivity
    look.current.y = -dy * sensitivity
  }

  const stopLook = (
    event: React.PointerEvent
  ) => {
    if (
      lookPointer.current ===
      event.pointerId
    ) {
      lookPointer.current = null
    }

    look.current.x = 0
    look.current.y = 0
  }

  return (
    <div className="absolute inset-0 z-20 touch-none select-none">
      {/* Right-side look area */}
      <div
        className="absolute inset-y-0 right-0 w-1/2"
        onPointerDown={startLook}
        onPointerMove={moveLook}
        onPointerUp={stopLook}
        onPointerCancel={stopLook}
      />

      {/* Left joystick */}
      <div
        className="absolute bottom-10 left-10 h-36 w-36 rounded-full border-2 border-white/40 bg-black/20"
        onPointerDown={startJoystick}
        onPointerMove={moveJoystick}
        onPointerUp={stopJoystick}
        onPointerCancel={stopJoystick}
      >
        <div
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
          style={{
            transform: `translate(calc(-50% + ${joystick.current.x * maxDistance}px), calc(-50% - ${joystick.current.y * maxDistance}px))`,
          }}
        />
      </div>

      {/* Up / Down */}
      <div className="absolute bottom-10 right-10 flex flex-col gap-3">
        <button
          className="h-16 w-16 rounded-full bg-white/60 text-2xl font-bold active:bg-white/80"
          onPointerDown={() => {
            look.current.y = 1
          }}
          onPointerUp={() => {
            look.current.y = 0
          }}
          onPointerCancel={() => {
            look.current.y = 0
          }}
        >
          ▲
        </button>

        <button
          className="h-16 w-16 rounded-full bg-white/60 text-2xl font-bold active:bg-white/80"
          onPointerDown={() => {
            look.current.y = -1
          }}
          onPointerUp={() => {
            look.current.y = 0
          }}
          onPointerCancel={() => {
            look.current.y = 0
          }}
        >
          ▼
        </button>
      </div>
    </div>
  )
}

export default function CityViewer() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-sky-200">
      <div className="absolute left-4 top-4 z-30 rounded-lg bg-white/90 px-4 py-3 shadow">
        <div className="font-bold">
          Ulaanbaatar 3D
        </div>

        <div className="text-sm text-gray-600">
          WASD · Space · Ctrl · Mouse
        </div>
      </div>

      <Canvas
        camera={{
          position: [0, 150, 500],
          fov: 75,
          near: 0.1,
          far: 100000,
        }}
      >
        <color
          attach="background"
          args={['#87ceeb']}
        />

        <ambientLight intensity={2} />

        <directionalLight
          position={[500, 1000, 500]}
          intensity={3}
        />

        <Environment preset="city" />

        <CityTile />

        <Grid
          infiniteGrid
          cellSize={100}
          sectionSize={500}
          fadeDistance={5000}
        />

        <PlayerControls />
      </Canvas>
    </div>
  )
}
