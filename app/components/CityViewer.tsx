'use client'

import { Environment, Grid, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { makeGrassMaterial, makeWallMaterial } from './Materials'
import PlayerControls from './PlayerControls'
import StartScreen from './StartScreen'

type CityMaterials = {
  grass: THREE.MeshToonMaterial
  wall: THREE.MeshToonMaterial
}

function CityTile({
  x,
  z,
  materials,
}: {
  x: number
  z: number
  materials: CityMaterials
}) {
  const { scene } = useGLTF(`/models/tile_${x}_${z}.glb`)
  const tileScene = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return

      const applyCityMaterials = (source: THREE.Material) => {
        if (source.name === 'Toon_grass') return materials.grass
        if (source.name === 'wall') return materials.wall
        return source
      }

      object.material = Array.isArray(object.material)
        ? object.material.map(applyCityMaterials)
        : applyCityMaterials(object.material)
    })

    return clone
  }, [materials, scene])

  return <primitive object={tileScene} />
}

function City() {
  const materials = useMemo(
    () => ({ grass: makeGrassMaterial(), wall: makeWallMaterial() }),
    [],
  )

  return (
    <group>
      {Array.from({ length: 13 }, (_, x) =>
        Array.from({ length: 8 }, (_, z) => (
          <CityTile key={`${x}_${z}`} x={x} z={z} materials={materials} />
        )),
      )}
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
        <ambientLight intensity={0.7} />
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
