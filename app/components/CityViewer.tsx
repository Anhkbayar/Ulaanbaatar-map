'use client'

import { Environment, Grid, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import PlayerControls from './PlayerControls'
import StartScreen from './StartScreen'

type CityTileData = {
  file: string
  center: [number, number]
}

type CityTileManifest = {
  tiles: CityTileData[]
}

const TILE_ENTER_DISTANCE = 2200
const TILE_EXIT_DISTANCE = 2600
const TILE_UPDATE_INTERVAL = 0.2

function CityTile({ file }: { file: string }) {
  const { scene } = useGLTF(`/models/${file}`)

  return <primitive object={scene} />
}

function City() {
  const { camera } = useThree()
  const [tiles, setTiles] = useState<CityTileData[]>([])
  const [activeFiles, setActiveFiles] = useState<string[]>([])
  const timeSinceUpdate = useRef(0)

  useEffect(() => {
    let cancelled = false

    fetch('/models/tiles.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Tile manifest request failed: ${response.status}`)
        return response.json() as Promise<CityTileManifest>
      })
      .then((manifest) => {
        if (cancelled) return

        const validTiles = manifest.tiles.filter(
          (tile) =>
            /^tile_\d+_\d+\.glb$/.test(tile.file) &&
            tile.center.length === 2 &&
            tile.center.every(Number.isFinite),
        )
        setTiles(validTiles)
      })
      .catch((error: unknown) => {
        console.error('Failed to load city tile manifest', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useFrame((_, delta) => {
    timeSinceUpdate.current += delta
    if (timeSinceUpdate.current < TILE_UPDATE_INTERVAL || tiles.length === 0) return
    timeSinceUpdate.current = 0

    const cameraX = camera.position.x
    const cameraZ = camera.position.z
    const currentFiles = new Set(activeFiles)
    const nextFiles = tiles
      .filter((tile) => {
        // GLB tiles are Y-up; their manifest's second coordinate maps to negative Z.
        const tileX = tile.center[0]
        const tileZ = -tile.center[1]
        const distance = Math.hypot(tileX - cameraX, tileZ - cameraZ)
        const limit = currentFiles.has(tile.file)
          ? TILE_EXIT_DISTANCE
          : TILE_ENTER_DISTANCE

        return distance <= limit
      })
      .map((tile) => tile.file)

    setActiveFiles((currentFiles) =>
      currentFiles.length === nextFiles.length &&
      currentFiles.every((file, index) => file === nextFiles[index])
        ? currentFiles
        : nextFiles,
    )
  })

  const activeTiles = tiles.filter((tile) => activeFiles.includes(tile.file))

  return (
    <group>
      {activeTiles.map((tile) => (
        <Suspense fallback={null} key={tile.file}>
          <CityTile file={tile.file} />
        </Suspense>
      ))}
    </group>
  )
}

export default function CityViewer() {
  const [showStartScreen, setShowStartScreen] = useState(true)
  const cityRef = useRef<THREE.Group>(null)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-sky-200">
      <div className="absolute left-4 top-4 z-30 rounded-lg bg-white/90 px-4 py-3 shadow">
        <div className="font-bold">Ulaanbaatar 3D</div>
        <div className="text-sm text-gray-600">WASD | Space | C | Mouse</div>
      </div>

      <Canvas
        camera={{
          position: [0, 150, 500],
          fov: 45,
          near: 0.1,
          far: 100000,
        }}
      >
        <color attach="background" args={['#87ceeb']} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[500, 1000, 500]} intensity={1.2} />
        <Environment preset="city" />
        <group ref={cityRef}>
          <City />
        </group>
        <Grid infiniteGrid cellSize={100} sectionSize={500} fadeDistance={5000} />
        <PlayerControls cityRef={cityRef} />
      </Canvas>

      {showStartScreen && <StartScreen onStart={() => setShowStartScreen(false)} />}
    </div>
  )
}
