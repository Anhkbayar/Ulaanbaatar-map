'use client'

import { useState } from 'react'
import { Environment, Grid, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import PlayerControls from './PlayerControls'
import StartScreen from './StartScreen'

function CityTile() {
  const { scene } = useGLTF('/models/13.glb')
  return <primitive object={scene} />
}

export default function CityViewer() {
  const [showStartScreen, setShowStartScreen] = useState(true)

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
        <ambientLight intensity={2} />
        <directionalLight position={[500, 1000, 500]} intensity={3} />
        <Environment preset="city" />
        <CityTile />
        <Grid infiniteGrid cellSize={100} sectionSize={500} fadeDistance={5000} />
        <PlayerControls />
      </Canvas>

      {showStartScreen && <StartScreen onStart={() => setShowStartScreen(false)} />}
    </div>
  )
}
