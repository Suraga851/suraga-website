import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField(props: any) {
    const ref = useRef<THREE.Points>(null!);

    const sphere = useMemo(() => {
        const particles = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000; i++) {
            const theta = THREE.MathUtils.randFloatSpread(360);
            const phi = THREE.MathUtils.randFloatSpread(360);
            const r = 1.5 + Math.random() * 2; // Radius variation

            // Convert spherical to cartesian
            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(theta);

            particles[i * 3] = x;
            particles[i * 3 + 1] = y;
            particles[i * 3 + 2] = z;
        }
        return particles;
    }, []);

    useFrame((_state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#0d9488" // Teal-600
                    size={0.005} // Smaller size
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
}

export default function ThreeBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-slate-900 to-slate-800">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <ParticleField />
            </Canvas>
        </div>
    );
}
