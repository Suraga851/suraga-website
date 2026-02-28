import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, transform } from "esbuild";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const publicDir = path.join(rootDir, "public");
const outDir = path.join(publicDir, "assets", "build");

const entryPoints = {
    main: path.join(publicDir, "js", "main.js"),
    "styles-en": path.join(rootDir, "scripts", "entries", "styles-en.css"),
    "styles-ar": path.join(rootDir, "scripts", "entries", "styles-ar.css")
};

const toPublicAssetPath = (absoluteFilePath) =>
    `/${path.relative(publicDir, absoluteFilePath).replaceAll("\\", "/")}`;

const resolveOutputForEntry = (metafile, entryPath, extension) => {
    const entryPathNormalized = path.resolve(entryPath);
    const outputMatch = Object.entries(metafile.outputs).find(([outputPath, outputMeta]) => {
        if (!outputMeta.entryPoint || !outputPath.endsWith(extension)) return false;
        return path.resolve(outputMeta.entryPoint) === entryPathNormalized;
    });

    if (!outputMatch) {
        throw new Error(`Missing ${extension} output for entry: ${entryPath}`);
    }

    const [outputPath] = outputMatch;
    const absoluteOutputPath = path.resolve(rootDir, outputPath);
    return toPublicAssetPath(absoluteOutputPath);
};

const writeManifest = async (manifest) => {
    const manifestPath = path.join(outDir, "manifest.json");
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
};

/**
 * Read and minify the hand-crafted critical CSS file.
 * This contains the minimal above-the-fold styles (navbar, hero, animated-bg,
 * layout, variables) needed for first paint without FOUC.
 */
const criticalCssPath = path.join(rootDir, "scripts", "critical.css");
let criticalCssCache = null;

const getCriticalCss = async () => {
    if (criticalCssCache !== null) return criticalCssCache;

    const raw = await fs.readFile(criticalCssPath, "utf8");
    const minified = await transform(raw, { loader: "css", minify: true });
    criticalCssCache = minified.code.trim();
    return criticalCssCache;
};

/**
 * Minify HTML by collapsing whitespace while preserving <pre>, <script>, <style> content.
 */
const minifyHtml = (html) => {
    // Protect content inside <pre>, <script>, <style>, and <textarea> tags
    const preserved = [];
    const protectedHtml = html.replace(
        /(<(?:pre|script|style|textarea)\b[^>]*>)([\s\S]*?)(<\/(?:pre|script|style|textarea)>)/gi,
        (match, open, content, close) => {
            const idx = preserved.length;
            preserved.push(match);
            return `__PRESERVED_${idx}__`;
        }
    );

    let minified = protectedHtml
        // Remove HTML comments (but not conditional comments)
        .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
        // Collapse multiple whitespace/newlines into single space
        .replace(/\s{2,}/g, " ")
        // Remove whitespace between tags
        .replace(/>\s+</g, "><")
        // Trim leading/trailing whitespace
        .trim();

    // Restore protected blocks
    for (let i = 0; i < preserved.length; i++) {
        minified = minified.replace(`__PRESERVED_${i}__`, preserved[i]);
    }

    return minified;
};

const rewriteHtmlBundles = async ({ jsBundlePath, cssEnBundlePath, cssArBundlePath }) => {
    const criticalCss = await getCriticalCss();

    const htmlFiles = [
        { file: "index.html", cssBundlePath: cssEnBundlePath, criticalCss },
        { file: "ar.html", cssBundlePath: cssArBundlePath, criticalCss }
    ];

    await Promise.all(
        htmlFiles.map(async ({ file, cssBundlePath, criticalCss }) => {
            const fullPath = path.join(publicDir, file);
            const html = await fs.readFile(fullPath, "utf8");
            let rewritten = html
                .replaceAll("__ASSET_JS__", jsBundlePath)
                .replaceAll("__ASSET_CSS__", cssBundlePath)
                .replaceAll("__CRITICAL_CSS__", criticalCss);

            if (rewritten.includes("__ASSET_") || rewritten.includes("__CRITICAL_CSS__")) {
                throw new Error(`Unresolved asset placeholder in ${file}`);
            }

            // Minify HTML for smaller transfer size
            rewritten = minifyHtml(rewritten);

            await fs.writeFile(fullPath, rewritten, "utf8");
        })
    );
};

const run = async () => {
    await fs.rm(outDir, { recursive: true, force: true });

    const result = await build({
        entryPoints,
        bundle: true,
        minify: true,
        format: "esm",
        target: ["es2020"],
        sourcemap: false,
        legalComments: "none",
        outdir: outDir,
        entryNames: "[name]-[hash]",
        assetNames: "assets/[name]-[hash]",
        metafile: true,
        loader: {
            ".woff2": "file",
            ".woff": "file",
            ".ttf": "file",
            ".eot": "file",
            ".svg": "file",
            ".jpg": "file",
            ".jpeg": "file",
            ".png": "file",
            ".webp": "file",
            ".avif": "file"
        }
    });

    if (!result.metafile) {
        throw new Error("esbuild did not produce a metafile.");
    }

    const jsBundlePath = resolveOutputForEntry(result.metafile, entryPoints.main, ".js");
    const cssEnBundlePath = resolveOutputForEntry(result.metafile, entryPoints["styles-en"], ".css");
    const cssArBundlePath = resolveOutputForEntry(result.metafile, entryPoints["styles-ar"], ".css");

    await rewriteHtmlBundles({ jsBundlePath, cssEnBundlePath, cssArBundlePath });
    await writeManifest({
        js: jsBundlePath,
        cssEn: cssEnBundlePath,
        cssAr: cssArBundlePath
    });

    console.log("Built optimized assets and rewrote HTML bundle references.");
};

run().catch((error) => {
    console.error("Failed to build optimized assets:", error);
    process.exitCode = 1;
});
