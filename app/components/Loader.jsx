"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";

function Ball() {
  const ref = useRef();
  const { scene } = useGLTF("/models/soccer-ball.glb");

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;

    const t = clock.getElapsedTime();

    const speed = 2 + (Math.sin(t * 2) + 1) * 6;

    ref.current.rotation.y += delta * speed;

    ref.current.rotation.x += delta * speed * 0.25;

    ref.current.position.y =
      Math.sin(t * 1.5) * 0.08;
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={0.5}
      rotation={[0.5, 0, -0.3]}
    />
  );
}

export default function Loader() {
  return (
    <div className="loaderWrap">
      <div style={{ width: 120, height: 120 }}>
        <Canvas
          camera={{
            position: [0, 0.4, 3.2],
            fov: 45
          }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} intensity={1.2} />
          <directionalLight
            position={[-5, 2, -5]}
            intensity={1.5}
          />

          <Ball />
        </Canvas>
      </div>
    </div>
  );
}