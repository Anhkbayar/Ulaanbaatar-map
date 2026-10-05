import { PointerLockControls, useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import MobileControls from './MobileControls'

type MovementKey = 'w' | 'a' | 's' | 'd' | 'space' | 'c'
type MovementKeys = Record<MovementKey, boolean>

const KEY_BINDINGS: Record<string, MovementKey> = {
  KeyW: 'w',
  KeyA: 'a',
  KeyS: 's',
  KeyD: 'd',
  Space: 'space',
  KeyC: 'c',
}

const MOVE_SPEED = 300
const COLLISION_DISTANCE = 14
const EYE_HEIGHT = 20
const MINIMUM_CITY_HEIGHT = 20

function updateKeyState(
  event: KeyboardEvent,
  pressed: boolean,
  keys: React.MutableRefObject<MovementKeys>,
) {
  const key = KEY_BINDINGS[event.code]
  if (!key) return

  if (key === 'space') event.preventDefault()
  keys.current[key] = pressed
}

export default function PlayerControls() {
  const { camera } = useThree()
  const { scene: city } = useGLTF('/models/13.glb')
  const keys = useRef<MovementKeys>({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    c: false,
  })
  const look = useRef({ vertical: 0 })
  const raycaster = useRef(new THREE.Raycaster())
  const direction = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const collisionDirection = useRef(new THREE.Vector3())
  const groundDirection = useRef(new THREE.Vector3(0, -1, 0))
  const [touchDevice, setTouchDevice] = useState(false)

  useEffect(() => {
    setTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    const down = (event: KeyboardEvent) => updateKeyState(event, true, keys)
    const up = (event: KeyboardEvent) => updateKeyState(event, false, keys)

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((_, delta) => {
    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    right.current.crossVectors(forward.current, camera.up).normalize()
    direction.current.set(0, 0, 0)

    if (keys.current.w) direction.current.add(forward.current)
    if (keys.current.s) direction.current.sub(forward.current)
    if (keys.current.d) direction.current.add(right.current)
    if (keys.current.a) direction.current.sub(right.current)

    const moveAxis = (axis: 'x' | 'y' | 'z', amount: number) => {
      if (amount === 0) return

      collisionDirection.current.set(0, 0, 0)
      collisionDirection.current[axis] = Math.sign(amount)
      raycaster.current.set(camera.position, collisionDirection.current)
      raycaster.current.far = COLLISION_DISTANCE

      if (raycaster.current.intersectObject(city, true).length === 0) {
        camera.position[axis] += amount
      }
    }

    if (direction.current.lengthSq() > 0) {
      direction.current.normalize()
      const distance = MOVE_SPEED * delta
      moveAxis('x', direction.current.x * distance)
      moveAxis('z', direction.current.z * distance)
    }

    const verticalInput =
      Number(keys.current.space) - Number(keys.current.c) + look.current.vertical
    moveAxis('y', verticalInput * MOVE_SPEED * delta)

    raycaster.current.set(camera.position, groundDirection.current)
    raycaster.current.far = 1000
    const groundHit = raycaster.current.intersectObject(city, true)[0]
    const minimumHeight = groundHit
      ? groundHit.point.y + EYE_HEIGHT
      : MINIMUM_CITY_HEIGHT

    camera.position.y = Math.max(camera.position.y, minimumHeight)
  })

  return (
    <>
      {!touchDevice && <PointerLockControls />}
      {touchDevice && <MobileControls look={look} />}
    </>
  )
}
