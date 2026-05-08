#!/usr/bin/env node
/**
 * Build script for C++ → WASM compilation using Emscripten.
 *
 * Prerequisites:
 *   1. Install Emscripten SDK: https://emscripten.org/docs/getting_started/downloads.html
 *   2. Activate emsdk: `emsdk activate latest && emsdk_env.bat` (Windows)
 *   3. Ensure `emcmake` and `emmake` are in your PATH.
 *
 * Usage:
 *   node build-wasm.mjs
 *
 * If Emscripten is not available, the Next.js app will gracefully fall back
 * to a pure-JS implementation (see web/src/lib/wasm/loader.ts).
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename));
const wasmSrcDir = path.join(rootDir, "wasm-src");
const buildDir = path.join(wasmSrcDir, "build-wasm");
const outDir = path.join(rootDir, "web", "public", "wasm");

function log(...args) {
  console.log("[build-wasm]", ...args);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function hasCommand(cmd) {
  const result = spawnSync(cmd, ["--version"], { stdio: "ignore", shell: true });
  return result.status === 0 || result.error === undefined;
}

function run(label, cmd, args, opts = {}) {
  log(`${label}: ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    cwd: opts.cwd || rootDir,
    env: { ...process.env, ...opts.env },
  });
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function main() {
  log("Checking for Emscripten...");

  if (!hasCommand("emcmake")) {
    log("WARNING: Emscripten not found in PATH.");
    log("  Install: https://emscripten.org/docs/getting_started/downloads.html");
    log("  Then run: emsdk activate latest && emsdk_env.bat");
    log("Skipping WASM build. The Next.js app will use its JS fallback.");
    process.exit(0);
  }

  ensureDir(buildDir);
  ensureDir(outDir);

  // Configure
  run(
    "Configure",
    "emcmake",
    ["cmake", "-B", buildDir, "-S", wasmSrcDir, "-DCMAKE_BUILD_TYPE=Release"],
    { cwd: rootDir }
  );

  // Build
  run("Build", "emmake", ["make", "-C", buildDir, "-j"], { cwd: rootDir });

  // Copy outputs
  const outputs = ["suraga.js", "suraga.wasm"];
  for (const file of outputs) {
    const src = path.join(buildDir, file);
    const dst = path.join(outDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      log(`Copied ${file} → ${path.relative(rootDir, dst)}`);
    } else {
      log(`Warning: expected output not found: ${src}`);
    }
  }

  log("WASM build complete.");
}

main();
