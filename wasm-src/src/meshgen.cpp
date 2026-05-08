#include "wasm_api.h"
#include <cmath>
#include <vector>

namespace {

struct MeshCache {
  std::vector<float> positions;
  std::vector<unsigned short> indices;
};

MeshCache g_mesh;

inline float len(float x, float y, float z) {
  return std::sqrt(x * x + y * y + z * z);
}

} // namespace

float* generateIcosphere(float radius, int subdivisions) {
  static const float phi = 1.618033988749895f;

  // Base icosahedron vertices
  float baseVerts[12][3] = {
    {-1,  phi,  0}, { 1,  phi,  0}, {-1, -phi,  0}, { 1, -phi,  0},
    { 0, -1,  phi}, { 0,  1,  phi}, { 0, -1, -phi}, { 0,  1, -phi},
    { phi,  0, -1}, { phi,  0,  1}, {-phi,  0, -1}, {-phi,  0,  1},
  };

  std::vector<float> verts;
  std::vector<unsigned short> faces;

  // Normalize and scale base vertices
  for (int i = 0; i < 12; ++i) {
    float l = len(baseVerts[i][0], baseVerts[i][1], baseVerts[i][2]);
    verts.push_back((baseVerts[i][0] / l) * radius);
    verts.push_back((baseVerts[i][1] / l) * radius);
    verts.push_back((baseVerts[i][2] / l) * radius);
  }

  // Base faces (simplified for demo - just first few triangles)
  int baseFaces[][3] = {
    {0, 11, 5}, {0, 5, 1}, {0, 1, 7}, {0, 7, 10}, {0, 10, 11},
    {1, 5, 9}, {5, 11, 4}, {11, 10, 2}, {10, 7, 6}, {7, 1, 8},
    {3, 9, 4}, {3, 4, 2}, {3, 2, 6}, {3, 6, 8}, {3, 8, 9},
    {4, 9, 5}, {2, 4, 11}, {6, 2, 10}, {8, 6, 7}, {9, 8, 1},
  };

  for (int i = 0; i < 20; ++i) {
    faces.push_back(static_cast<unsigned short>(baseFaces[i][0]));
    faces.push_back(static_cast<unsigned short>(baseFaces[i][1]));
    faces.push_back(static_cast<unsigned short>(baseFaces[i][2]));
  }

  g_mesh.positions = std::move(verts);
  g_mesh.indices = std::move(faces);

  return g_mesh.positions.data();
}

int getLastMeshVertexCount() {
  return static_cast<int>(g_mesh.positions.size() / 3);
}

int getLastMeshIndexCount() {
  return static_cast<int>(g_mesh.indices.size());
}

unsigned short* getLastMeshIndicesPtr() {
  return g_mesh.indices.data();
}
