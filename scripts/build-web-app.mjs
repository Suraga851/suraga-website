import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const webDir = path.join(rootDir, "web");
const webDistDir = path.join(webDir, "dist");
const publicWebDir = path.join(rootDir, "public", "suraga-3d");

const run = (command, args, options = {}) => {
    const result = spawnSync(command, args, {
        cwd: options.cwd || rootDir,
        stdio: "inherit",
        shell: true
    });

    if (result.status !== 0) {
        throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
    }
};

const copyDirectory = async (source, destination) => {
    await fs.mkdir(destination, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destinationPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(sourcePath, destinationPath);
        } else if (entry.isFile()) {
            await fs.copyFile(sourcePath, destinationPath);
        }
    }
};

const runBuild = async () => {
    run("npm", ["ci"], { cwd: webDir });
    run("npm", ["run", "build:wasm"], { cwd: webDir });
    run("npm", ["run", "build"], { cwd: webDir });

    await fs.rm(publicWebDir, { recursive: true, force: true });
    await copyDirectory(webDistDir, publicWebDir);

    console.log(`Copied 3D website export to ${path.relative(rootDir, publicWebDir)}`);
};

runBuild().catch((error) => {
    console.error("Failed to build 3D website:", error);
    process.exitCode = 1;
});
