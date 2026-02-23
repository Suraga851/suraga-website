import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

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

const rewriteHtmlBundles = async ({ jsBundlePath, cssEnBundlePath, cssArBundlePath }) => {
    const htmlFiles = [
        { file: "index.html", cssBundlePath: cssEnBundlePath },
        { file: "ar.html", cssBundlePath: cssArBundlePath }
    ];

    await Promise.all(
        htmlFiles.map(async ({ file, cssBundlePath }) => {
            const fullPath = path.join(publicDir, file);
            const html = await fs.readFile(fullPath, "utf8");
            const rewritten = html
                .replaceAll("__ASSET_JS__", jsBundlePath)
                .replaceAll("__ASSET_CSS__", cssBundlePath);

            if (rewritten.includes("__ASSET_")) {
                throw new Error(`Unresolved asset placeholder in ${file}`);
            }

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
