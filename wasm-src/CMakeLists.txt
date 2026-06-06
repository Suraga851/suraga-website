cmake_minimum_required(VERSION 3.16)
project(suraga-wasm)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Emscripten-specific settings
if(NOT EMSCRIPTEN)
  message(FATAL_ERROR "This project must be built with Emscripten. Install emsdk and run: emcmake cmake -B build-wasm -S .")
endif()

set(CMAKE_EXECUTABLE_SUFFIX ".js")

add_executable(suraga
  src/physics.cpp
  src/meshgen.cpp
)

target_include_directories(suraga PUBLIC include)

set(EMSCRIPTEN_LINK_FLAGS
  "-s WASM=1"
  "-s EXPORT_ES6=1"
  "-s MODULARIZE=1"
  "-s EXPORT_NAME=SuragaWasm"
  "-s ALLOW_MEMORY_GROWTH=1"
  "-s INITIAL_MEMORY=32MB"
  "-s MAXIMUM_MEMORY=128MB"
  "-s ENVIRONMENT=web"
  "-s NO_EXIT_RUNTIME=1"
  "-s EXPORTED_FUNCTIONS=['_malloc','_free','_initParticles','_stepParticles','_getParticleCount','_getPositionsPtr','_getVelocitiesPtr','_generateIcosphere','_getLastMeshVertexCount','_getLastMeshIndexCount','_getLastMeshIndicesPtr']"
  "-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','UTF8ToString','stringToUTF8','lengthBytesUTF8','HEAPF32','HEAPU16']"
  "-O3"
  "-flto"
  "--closure 1"
)

string(REPLACE ";" " " EMSCRIPTEN_LINK_FLAGS_STR "${EMSCRIPTEN_LINK_FLAGS}")
set_target_properties(suraga PROPERTIES LINK_FLAGS "${EMSCRIPTEN_LINK_FLAGS_STR}")

set_target_properties(suraga PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})
