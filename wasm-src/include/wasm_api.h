#pragma once

#include <cstddef>

#ifdef __cplusplus
extern "C" {
#endif

// ── Particle System ──

/** Initialize particles with random spherical distribution.
 *  Returns pointer to positions buffer (count * 3 floats). */
float* initParticles(int count, unsigned int seed);

/** Advance simulation by dt seconds. */
void stepParticles(float dt);

/** Get current particle count. */
int getParticleCount();

/** Get pointer to positions buffer. */
float* getPositionsPtr();

/** Get pointer to velocities buffer. */
float* getVelocitiesPtr();

// ── Mesh Generation ──

/** Generate an icosphere mesh.
 *  Returns pointer to vertex positions (vertexCount * 3 floats). */
float* generateIcosphere(float radius, int subdivisions);

/** Get vertex count of last generated mesh. */
int getLastMeshVertexCount();

/** Get index count of last generated mesh. */
int getLastMeshIndexCount();

/** Get pointer to index buffer. */
unsigned short* getLastMeshIndicesPtr();

#ifdef __cplusplus
}
#endif
