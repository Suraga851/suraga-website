"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { loadWasmModule, type SuragaWasmModule } from "@/lib/wasm/loader";

const PARTICLE_COUNT = 8000;

function ParticlesMesh({ wasm }: { wasm: SuragaWasmModule }) {
  const meshRef = useRef<THREE.Points>(null);
  const posArray = useMemo(() => {
    const positions = wasm.physics.initParticles(PARTICLE_COUNT, 42);
    return new Float32Array(positions);
  }, [wasm]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    wasm.physics.stepParticles(Math.min(delta, 0.05));
    const positions = wasm.physics.getPositions();
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posAttr.setXYZ(i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posArray, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#0d9488"
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Particles() {
  const [wasm, setWasm] = useState<SuragaWasmModule | null>(null);

  useEffect(() => {
    let mounted = true;
    loadWasmModule().then((m) => {
      if (mounted) setWasm(m);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!wasm) return null;
  return <ParticlesMesh wasm={wasm} />;
}
