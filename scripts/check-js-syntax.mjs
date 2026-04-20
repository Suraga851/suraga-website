import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const jsRoots = [
    path.join(rootDir, "public", "js"),
    path.join(rootDir, "api")
];

const collectJsFiles = async (directory) => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                return collectJsFiles(fullPath);
            }
            if (entry.isFile() && fullPath.endsWith(".js")) {
                return [fullPath];
            }
            return [];
        })
    );

    return files.flat();
};

const run = async () => {
    const files = [];

    for (const root of jsRoots) {
        try {
            await fs.access(root);
            files.push(...await collectJsFiles(root));
        } catch {
            // Skip optional roots that are not present.
        }
    }

    if (files.length === 0) {
        throw new Error("No JavaScript files found in the configured syntax-check roots.");
    }

    for (const file of files) {
        const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
        if (result.status !== 0) {
            process.exit(result.status ?? 1);
        }
    }

    console.log(`JS syntax check passed for ${files.length} files.`);
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
