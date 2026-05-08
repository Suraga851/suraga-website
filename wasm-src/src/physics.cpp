#include "wasm_api.h"
#include <cmath>
#include <cstdlib>
#include <vector>

namespace {

struct ParticleSystem {
  std::vector<float> positions;
  std::vector<float> velocities;
  int count = 0;
};

ParticleSystem g_system;

inline float fastRand(unsigned int& seed) {
  seed = seed * 1103515245u + 12345u;
  return static_cast<float>(seed & 0x7FFFFFFFu) / static_cast<float>(0x7FFFFFFFu);
}

} // namespace

float* initParticles(int count, unsigned int seed) {
  g_system.count = count;
  g_system.positions.resize(count * 3);
  g_system.velocities.resize(count * 3);

  for (int i = 0; i < count; ++i) {
    float theta = fastRand(seed) * 6.283185307f;
    float phi   = std::acos(2.0f * fastRand(seed) - 1.0f);
    float r     = 2.0f + fastRand(seed) * 3.0f;

    g_system.positions[i * 3 + 0] = r * std::sin(phi) * std::cos(theta);
    g_system.positions[i * 3 + 1] = r * std::sin(phi) * std::sin(theta);
    g_system.positions[i * 3 + 2] = r * std::cos(phi);

    g_system.velocities[i * 3 + 0] = (fastRand(seed) - 0.5f) * 0.02f;
    g_system.velocities[i * 3 + 1] = (fastRand(seed) - 0.5f) * 0.02f;
    g_system.velocities[i * 3 + 2] = (fastRand(seed) - 0.5f) * 0.02f;
  }

  return g_system.positions.data();
}

void stepParticles(float dt) {
  if (g_system.count == 0) return;

  float* pos = g_system.positions.data();
  float* vel = g_system.velocities.data();

  for (int i = 0; i < g_system.count; ++i) {
    int idx = i * 3;
    pos[idx + 0] += vel[idx + 0] * dt;
    pos[idx + 1] += vel[idx + 1] * dt;
    pos[idx + 2] += vel[idx + 2] * dt;

    float d = std::sqrt(pos[idx + 0] * pos[idx + 0] +
                        pos[idx + 1] * pos[idx + 1] +
                        pos[idx + 2] * pos[idx + 2]);

    if (d > 8.0f) {
      vel[idx + 0] *= -0.5f;
      vel[idx + 1] *= -0.5f;
      vel[idx + 2] *= -0.5f;
    }
  }
}

int getParticleCount() {
  return g_system.count;
}

float* getPositionsPtr() {
  return g_system.positions.data();
}

float* getVelocitiesPtr() {
  return g_system.velocities.data();
}
