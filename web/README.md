# Suraga 3D Website

Next.js 15 + React Three Fiber + TypeScript + TailwindCSS v4 + C++ WASM

## Stack

- **Framework**: Next.js 15 (App Router, static export)
- **3D Rendering**: React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`) + Three.js
- **Styling**: TailwindCSS v4 with custom brand theme
- **WASM Compute**: C++ → Emscripten (physics particles, mesh generation)
- **Fallback**: Pure JS implementation when WASM is unavailable

## Project Structure

```
web/
  src/
    app/
      page.tsx          # English homepage
      ar/
        page.tsx        # Arabic homepage (RTL)
        layout.tsx      # Arabic SEO + meta
      layout.tsx        # Root English layout + Schema.org JSON-LD
      globals.css       # Tailwind theme + animations
    components/
      three/
        Hero3D.tsx      # Main 3D scene (Canvas + lights + meshes)
        Particles.tsx   # 8,000 particle system driven by WASM
      ui/
        Navbar.tsx      # Responsive nav with language switcher
    lib/
      i18n/
        content.ts      # All bilingual content (en + ar)
      wasm/
        loader.ts       # WASM module loader with JS fallback
  public/
    wasm/               # Compiled C++ output (suraga.js + suraga.wasm)
  next.config.ts        # Static export config
  postcss.config.mjs   # Tailwind v4 PostCSS setup
  tsconfig.json
  package.json

wasm-src/               # C++ source code
  CMakeLists.txt
  include/
    wasm_api.h
  src/
    physics.cpp         # Particle system (8k particles)
    meshgen.cpp         # Icosphere mesh generator
    bindings.cpp        # Emscripten export bindings
```

## Quick Start

```bash
# 1. Install dependencies
cd web && npm install

# 2. (Optional) Compile C++ WASM
#    Requires Emscripten SDK installed
#    See: https://emscripten.org/docs/getting_started/downloads.html
node ../build-wasm.mjs

# 3. Run dev server
npm run dev

# 4. Build for production
npm run build
```

## Architecture Notes

### WASM Integration
The C++ particle system compiles to WASM via Emscripten and exposes:
- `initParticles(count, seed)` → `Float32Array` positions
- `stepParticles(dt)` → advances simulation
- `getPositionsPtr()` / `getVelocitiesPtr()` → direct memory access

If Emscripten is not available, `loader.ts` transparently falls back to a pure-JS implementation using the same API surface.

### Performance
- Static export (`output: "export"`) for fastest possible delivery
- `dpr={[1, 2]}` on Canvas for adaptive resolution
- `requestIdleCallback` pattern for non-critical work
- WASM physics runs in native-speed memory for 8,000 particles

### SEO
- Full Schema.org JSON-LD (`WebSite`, `Person`, `WebPage`)
- Open Graph + Twitter Cards for both EN and AR
- Canonical URLs and `alternate` language tags
- RTL support on Arabic page with `dir="rtl"`
