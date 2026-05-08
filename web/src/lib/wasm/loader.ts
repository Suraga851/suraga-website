/*
 * WASM Module Loader
 * Loads compiled C++/Rust WASM modules dynamically on the client.
 *
 * Build step:
 *   C++ -> Emscripten -> suraga.wasm + suraga.js glue
 *   Or: Rust -> wasm-pack -> suraga pkg
 *
 * The interface below abstracts the WASM backend so the React components
 * don't care if it's C++, Rust, or native JS fallback.
 */

export interface WasmPhysicsAPI {
  initParticles(count: number, seed: number): Float32Array;
  stepParticles(dt: number): void;
  getPositions(): Float32Array;
  getVelocities(): Float32Array;
}

export interface WasmMeshAPI {
  generateIcosphere(radius: number, subdivisions: number): Float32Array; // positions
  getIndices(): Uint16Array;
}

export interface SuragaWasmModule {
  physics: WasmPhysicsAPI;
  mesh: WasmMeshAPI;
  ready: boolean;
}

let cachedModule: SuragaWasmModule | null = null;

/**
 * Dynamically import the WASM glue. Falls back to a pure-JS implementation
 * if the compiled WASM bundle is not present (e.g. during `next dev` before
 * the build-wasm step has run).
 */
export async function loadWasmModule(): Promise<SuragaWasmModule> {
  if (cachedModule) return cachedModule;

  try {
    // Attempt to load Emscripten-generated module from the static export.
    const wasmPath = "/suraga-3d/wasm/suraga.js";
    const wasmFactory = await import(/* webpackIgnore: true */ wasmPath);
    const wasm = await wasmFactory.default();

    const physics: WasmPhysicsAPI = {
      initParticles: (count, seed) => {
        const ptr = wasm._initParticles(count, seed);
        const len = count * 3;
        return new Float32Array(wasm.HEAPF32.buffer, ptr, len);
      },
      stepParticles: (dt) => wasm._stepParticles(dt),
      getPositions: () => {
        const count = wasm._getParticleCount();
        const ptr = wasm._getPositionsPtr();
        return new Float32Array(wasm.HEAPF32.buffer, ptr, count * 3);
      },
      getVelocities: () => {
        const count = wasm._getParticleCount();
        const ptr = wasm._getVelocitiesPtr();
        return new Float32Array(wasm.HEAPF32.buffer, ptr, count * 3);
      },
    };

    const mesh: WasmMeshAPI = {
      generateIcosphere: (radius, subdivisions) => {
        const ptr = wasm._generateIcosphere(radius, subdivisions);
        const vertexCount = wasm._getLastMeshVertexCount();
        return new Float32Array(wasm.HEAPF32.buffer, ptr, vertexCount * 3);
      },
      getIndices: () => {
        const count = wasm._getLastMeshIndexCount();
        const ptr = wasm._getLastMeshIndicesPtr();
        return new Uint16Array(wasm.HEAPU16.buffer, ptr, count);
      },
    };

    cachedModule = { physics, mesh, ready: true };
    return cachedModule;
  } catch (e) {
    console.warn("WASM module not found, falling back to JS implementation:", e);
    cachedModule = createFallbackModule();
    return cachedModule;
  }
}

/**
 * Pure-JS fallback that implements the same interface so the 3D scene
 * keeps working even before the C++ toolchain is set up.
 */
function createFallbackModule(): SuragaWasmModule {
  let positions = new Float32Array(0);
  let velocities = new Float32Array(0);
  let count = 0;

  const physics: WasmPhysicsAPI = {
    initParticles: (n, seed) => {
      count = n;
      positions = new Float32Array(n * 3);
      velocities = new Float32Array(n * 3);
      const rng = mulberry32(seed);
      for (let i = 0; i < n; i++) {
        const theta = rng() * Math.PI * 2;
        const phi = Math.acos(2 * rng() - 1);
        const r = 2 + rng() * 3;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        velocities[i * 3] = (rng() - 0.5) * 0.02;
        velocities[i * 3 + 1] = (rng() - 0.5) * 0.02;
        velocities[i * 3 + 2] = (rng() - 0.5) * 0.02;
      }
      return positions;
    },
    stepParticles: (dt) => {
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3] * dt;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
        // Soft boundary return
        const d = Math.sqrt(
          positions[i * 3] ** 2 +
            positions[i * 3 + 1] ** 2 +
            positions[i * 3 + 2] ** 2
        );
        if (d > 8) {
          velocities[i * 3] *= -0.5;
          velocities[i * 3 + 1] *= -0.5;
          velocities[i * 3 + 2] *= -0.5;
        }
      }
    },
    getPositions: () => positions,
    getVelocities: () => velocities,
  };

  const mesh: WasmMeshAPI = {
    generateIcosphere: (radius, subdivisions) => {
      // Minimal icosphere approximation for fallback
      const verts: number[] = [];
      const phi = (1 + Math.sqrt(5)) / 2;
      const base = [
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
      ];
      for (const [x, y, z] of base) {
        const len = Math.sqrt(x * x + y * y + z * z);
        verts.push((x / len) * radius, (y / len) * radius, (z / len) * radius);
      }
      return new Float32Array(verts);
    },
    getIndices: () => new Uint16Array([0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11]),
  };

  return { physics, mesh, ready: true };
}

/** Simple PRNG for deterministic fallback */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
