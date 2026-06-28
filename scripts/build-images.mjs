import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const imagesDir = path.join(rootDir, "public", "assets", "images");

const ensureFileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

const convertImage = async ({ source, destination, operation }) => {
    const sourceExists = await ensureFileExists(source);
    if (!sourceExists) return;

    await operation(sharp(source)).toFile(destination);
};

// Responsive widths for the hero headshot. The original is high-res; these
// smaller variants let the browser pick the right bytes per device via <picture srcset>.
// Sizes chosen to cover ~1x/2x at typical hero display widths (480–960 css px).
const HEADSHOT_RESPONSIVE_WIDTHS = [480, 960];

async function generateResponsiveHeadshot(source, imagesDir) {
    for (const width of HEADSHOT_RESPONSIVE_WIDTHS) {
        await convertImage({
            source,
            destination: path.join(imagesDir, `suraga-headshot-${width}.avif`),
            operation: (image) => image.resize(width).avif({ quality: 50, effort: 5 })
        });
        await convertImage({
            source,
            destination: path.join(imagesDir, `suraga-headshot-${width}.webp`),
            operation: (image) => image.resize(width).webp({ quality: 80, effort: 4 })
        });
    }
}

const run = async () => {
    const headshotJpg = path.join(imagesDir, "suraga-headshot.jpg");
    const bgTextureJpg = path.join(imagesDir, "bg-texture.jpg");

    await convertImage({
        source: headshotJpg,
        destination: path.join(imagesDir, "suraga-headshot.webp"),
        operation: (image) => image.webp({ quality: 82, effort: 4 })
    });
    await convertImage({
        source: headshotJpg,
        destination: path.join(imagesDir, "suraga-headshot.avif"),
        operation: (image) => image.avif({ quality: 52, effort: 5 })
    });
    await convertImage({
        source: headshotJpg,
        destination: path.join(imagesDir, "favicon-32.png"),
        operation: (image) => image.resize(32, 32, { fit: "cover" }).png({ compressionLevel: 9 })
    });
    await convertImage({
        source: headshotJpg,
        destination: path.join(imagesDir, "favicon-64.png"),
        operation: (image) => image.resize(64, 64, { fit: "cover" }).png({ compressionLevel: 9 })
    });
    await convertImage({
        source: headshotJpg,
        destination: path.join(imagesDir, "apple-touch-icon.png"),
        operation: (image) => image.resize(180, 180, { fit: "cover" }).png({ compressionLevel: 9 })
    });

    await convertImage({
        source: bgTextureJpg,
        destination: path.join(imagesDir, "bg-texture.webp"),
        operation: (image) => image.webp({ quality: 76, effort: 4 })
    });
    await convertImage({
        source: bgTextureJpg,
        destination: path.join(imagesDir, "bg-texture.avif"),
        operation: (image) => image.avif({ quality: 42, effort: 5 })
    });

    // Responsive srcset variants for the hero (multi-width AVIF + WebP).
    await generateResponsiveHeadshot(headshotJpg, imagesDir);

    console.log("Generated modern image variants, responsive hero, and favicon assets.");
};

run().catch((error) => {
    console.error("Failed to build image variants:", error);
    process.exitCode = 1;
});
