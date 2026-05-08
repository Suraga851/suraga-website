#include "wasm_api.h"

// EMSCRIPTEN_KEEPAlive ensures these are exported even with dead-code elimination
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#define WASM_EXPORT extern "C" EMSCRIPTEN_KEEPALIVE
#else
#define WASM_EXPORT extern "C"
#endif

WASM_EXPORT float* _initParticles(int count, unsigned int seed) {
  return initParticles(count, seed);
}

WASM_EXPORT void _stepParticles(float dt) {
  stepParticles(dt);
}

WASM_EXPORT int _getParticleCount() {
  return getParticleCount();
}

WASM_EXPORT float* _getPositionsPtr() {
  return getPositionsPtr();
}

WASM_EXPORT float* _getVelocitiesPtr() {
  return getVelocitiesPtr();
}

WASM_EXPORT float* _generateIcosphere(float radius, int subdivisions) {
  return generateIcosphere(radius, subdivisions);
}

WASM_EXPORT int _getLastMeshVertexCount() {
  return getLastMeshVertexCount();
}

WASM_EXPORT int _getLastMeshIndexCount() {
  return getLastMeshIndexCount();
}

WASM_EXPORT unsigned short* _getLastMeshIndicesPtr() {
  return getLastMeshIndicesPtr();
}
