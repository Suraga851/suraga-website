/**
 * Pre-compress all static assets with gzip and brotli.
 * Nginx serves these pre-compressed files via gzip_static and brotli_static,
 * avoiding CPU-intensive on-the-fly compression on every request.
 */
import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGzip, constants as zlibConstants } from "node:zlib";
import { pipeline } from "node:stream/promises";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const publicDir = path.join(rootDir, "public");

// File extensions worth compressing (text-based and structured formats)
const COMPRESSIBLE_EXTENSIONS = new Set([
    ".html", ".css", ".js", ".json", ".xml", ".txt", ".svg",
    ".mjs", ".map", ".webmanifest", ".ico"
]);

// Minimum file size to bother compressing (bytes)
const MIN_SIZE = 256;

const getAllFiles = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await getAllFiles(fullPath)));
        } else if (entry.isFile()) {
            files.push(fullPath);
        }
    }

    return files;
};

const compressGzip = async (inputPath) => {
    const outputPath = `${inputPath}.gz`;
    const gzip = createGzip({ level: zlibConstants.Z_BEST_COMPRESSION });
    await pipeline(createReadStream(inputPath), gzip, createWriteStream(outputPath));
    return outputPath;
};

let brotliCompress = null;

try {
    const zlib = await import("node:zlib");
    if (typeof zlib.createBrotliCompress === "function") {
        brotliCompress = async (inputPath) => {
            const outputPath = `${inputPath}.br`;
            const brotli = zlib.createBrotliCompress({
                params: {
                    [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
                }
            });
            await pipeline(createReadStream(inputPath), brotli, createWriteStream(outputPath));
            return outputPath;
        };
    }
} catch {
    // Brotli not available in this Node.js build
}

const run = async () => {
    const allFiles = await getAllFiles(publicDir);
    let gzipCount = 0;
    let brotliCount = 0;

    const tasks = [];

    for (const filePath of allFiles) {
        const ext = path.extname(filePath).toLowerCase();
        if (!COMPRESSIBLE_EXTENSIONS.has(ext)) continue;

        const stat = await fs.stat(filePath);
        if (stat.size < MIN_SIZE) continue;

        tasks.push(
            compressGzip(filePath).then(() => { gzipCount++; })
        );

        if (brotliCompress) {
            tasks.push(
                brotliCompress(filePath).then(() => { brotliCount++; })
            );
        }
    }

    await Promise.all(tasks);

    console.log(`Pre-compressed ${gzipCount} files with gzip, ${brotliCount} files with brotli.`);
};

run().catch((error) => {
    console.error("Failed to pre-compress assets:", error);
    process.exitCode = 1;
});
