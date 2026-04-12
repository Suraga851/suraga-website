#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import readline from "node:readline/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const DEFAULT_INDEX_URL = "https://www.learn-english-today.com/idioms/idioms_proverbs.html";
const DEFAULT_OUTPUT_DIR = path.join(
    process.env.USERPROFILE || os.homedir(),
    "Downloads",
    "learn-english-today-idioms-pdf"
);
const DEFAULT_BROWSER_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEFAULT_VIEWPORT = { width: 1440, height: 2200 };

function printUsage() {
    console.log(`Usage: node scripts/scrape-idioms-to-pdf.mjs [options]

Options:
  --index-url <url>       Source index page URL.
  --output-dir <path>     Directory for generated PDFs and manifest.
  --browser-path <path>   Chrome executable path.
  --limit-themes <n>      Process only the first n matching themes.
  --theme-filter <text>   Only process themes whose title or URL matches text.
  --force                 Overwrite existing PDFs instead of skipping them.
  --help                  Show this help message.
`);
}

function parseArgs(argv) {
    const options = {
        indexUrl: DEFAULT_INDEX_URL,
        outputDir: DEFAULT_OUTPUT_DIR,
        browserPath: DEFAULT_BROWSER_PATH,
        limitThemes: null,
        themeFilter: null,
        force: false
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        switch (arg) {
            case "--index-url":
                options.indexUrl = argv[++index];
                break;
            case "--output-dir":
                options.outputDir = argv[++index];
                break;
            case "--browser-path":
                options.browserPath = argv[++index];
                break;
            case "--limit-themes":
                options.limitThemes = Number.parseInt(argv[++index], 10);
                break;
            case "--theme-filter":
                options.themeFilter = argv[++index];
                break;
            case "--force":
                options.force = true;
                break;
            case "--help":
                printUsage();
                process.exit(0);
                break;
            default:
                throw new Error(`Unknown argument: ${arg}`);
        }
    }

    if (!options.indexUrl) {
        throw new Error("--index-url is required.");
    }

    if (!options.outputDir) {
        throw new Error("--output-dir is required.");
    }

    if (!options.browserPath) {
        throw new Error("--browser-path is required.");
    }

    if (
        options.limitThemes !== null &&
        (!Number.isInteger(options.limitThemes) || options.limitThemes < 1)
    ) {
        throw new Error("--limit-themes must be a positive integer.");
    }

    return options;
}

function log(message) {
    const stamp = new Date().toISOString().replace("T", " ").replace(/\..+$/, "");
    console.log(`[${stamp}] ${message}`);
}

function normalizeUrl(value) {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
}

function sanitizeFileName(value) {
    return String(value)
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
}

function escapeForRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectThemePrefixFromPath(urlString) {
    const pathname = new URL(urlString).pathname;
    const fileName = path.posix.basename(pathname).replace(/\.html$/i, "");
    const match = fileName.match(/^(.*?)(\d+)([_-].*)?$/u);
    if (match && match[1]) {
        return match[1];
    }
    if (!fileName) {
        throw new Error(`Unable to determine theme pagination prefix from URL: ${urlString}`);
    }
    return fileName;
}

function extractPageNumberFromPath(urlString, prefix) {
    const pathname = new URL(urlString).pathname;
    const fileName = path.posix.basename(pathname).replace(/\.html$/i, "");
    if (fileName === prefix) {
        return 1;
    }
    const match = fileName.match(new RegExp(`^${escapeForRegExp(prefix)}(\\d+)`, "u"));
    return match ? Number.parseInt(match[1], 10) : Number.NaN;
}

function isChallengeContent(title, bodyText) {
    const source = `${title}\n${bodyText}`.toLowerCase();
    return (
        source.includes("please wait while your request is being verified") ||
        source.includes("just a moment") ||
        source.includes("checking if the site connection is secure") ||
        source.includes("verifying you are human") ||
        source.includes("challenge-platform")
    );
}

async function ensureFileMissingOrForce(filePath, force) {
    try {
        await fs.access(filePath);
        return force;
    } catch {
        return true;
    }
}

async function detectChallenge(page) {
    const [title, bodyText] = await Promise.all([
        page.title().catch(() => ""),
        page
            .locator("body")
            .innerText()
            .catch(() => "")
    ]);
    return isChallengeContent(title, bodyText);
}

async function promptForVerification(page, rl, url) {
    await page.bringToFront().catch(() => {});
    log(`Verification detected for ${url}`);
    log("Complete the anti-bot check in the Chrome window, then return here.");

    let resolved = false;
    while (!resolved) {
        await rl.question("Press Enter after verification is complete...");
        await page.waitForTimeout(1500);
        resolved = !(await detectChallenge(page));
        if (!resolved) {
            log("Verification is still visible. Please finish it in the browser window.");
        }
    }
}

async function gotoWithVerification(page, url, rl) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    if (await detectChallenge(page)) {
        await promptForVerification(page, rl, url);
        await page.waitForLoadState("domcontentloaded").catch(() => {});
    }
    await page.waitForTimeout(1000);
}

async function extractThemes(indexPage) {
    return indexPage.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a[href]"));

        const themes = [];
        const seen = new Set();
        for (const anchor of anchors) {
            const title = anchor.textContent?.trim();
            const href = anchor.href;
            if (!title || !href) {
                continue;
            }
            if (!href.includes("/idioms/idiom-categories/")) {
                continue;
            }
            if (seen.has(href)) {
                continue;
            }
            seen.add(href);
            themes.push({ title, url: href });
        }

        return themes;
    });
}

async function extractSameThemeLinks(page, themePrefix) {
    return page.evaluate((prefix) => {
        const current = new URL(window.location.href);
        const currentDir = current.pathname.replace(/[^/]+$/u, "");
        const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const filePattern = new RegExp(
            `^${escape(prefix)}(?:\\d+(?:[_-].*)?)?\\.html$`,
            "i"
        );

        const links = Array.from(document.querySelectorAll("a[href]"))
            .map((anchor) => {
                try {
                    const url = new URL(anchor.href, window.location.href);
                    const pathname = url.pathname;
                    const fileName = pathname.split("/").pop() || "";
                    const directory = pathname.replace(/[^/]+$/u, "");
                    if (url.origin !== current.origin) {
                        return null;
                    }
                    if (directory !== currentDir) {
                        return null;
                    }
                    if (!filePattern.test(fileName)) {
                        return null;
                    }
                    url.hash = "";
                    return url.toString();
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        return Array.from(new Set(links));
    }, themePrefix);
}

async function discoverThemePages(page, theme, rl) {
    const themePrefix = detectThemePrefixFromPath(theme.url);
    const discovered = new Map();
    const queue = [normalizeUrl(theme.url)];

    while (queue.length > 0) {
        const nextUrl = queue.shift();
        if (discovered.has(nextUrl)) {
            continue;
        }

        log(`Discovering pagination for "${theme.title}" at ${nextUrl}`);
        await gotoWithVerification(page, nextUrl, rl);

        const currentUrl = normalizeUrl(page.url());
        discovered.set(currentUrl, {
            url: currentUrl,
            pageNumber: extractPageNumberFromPath(currentUrl, themePrefix)
        });

        const links = await extractSameThemeLinks(page, themePrefix);
        for (const link of links) {
            const normalized = normalizeUrl(link);
            if (!discovered.has(normalized) && !queue.includes(normalized)) {
                queue.push(normalized);
            }
        }
    }

    return Array.from(discovered.values()).sort((left, right) => {
        const leftPage = Number.isNaN(left.pageNumber) ? Number.MAX_SAFE_INTEGER : left.pageNumber;
        const rightPage = Number.isNaN(right.pageNumber)
            ? Number.MAX_SAFE_INTEGER
            : right.pageNumber;
        if (leftPage !== rightPage) {
            return leftPage - rightPage;
        }
        return left.url.localeCompare(right.url);
    });
}

async function printPageToPdf(page, filePath) {
    await page.emulateMedia({ media: "screen" });
    await page.setViewportSize(DEFAULT_VIEWPORT);

    const client = await page.context().newCDPSession(page);
    const { data } = await client.send("Page.printToPDF", {
        printBackground: true,
        preferCSSPageSize: false,
        paperWidth: 8.27,
        paperHeight: 11.69,
        marginTop: 0.2,
        marginBottom: 0.2,
        marginLeft: 0.2,
        marginRight: 0.2,
        scale: 1
    });

    await fs.writeFile(filePath, Buffer.from(data, "base64"));
}

async function mergePdfs(pdfPaths, outputPath) {
    const pythonScript = [
        "from pathlib import Path",
        "from pypdf import PdfWriter",
        "import sys",
        "",
        "writer = PdfWriter()",
        "paths = sys.argv[1:-1]",
        "output = Path(sys.argv[-1])",
        "",
        "for item in paths:",
        "    writer.append(item)",
        "",
        "output.parent.mkdir(parents=True, exist_ok=True)",
        "with output.open('wb') as handle:",
        "    writer.write(handle)"
    ].join("\n");

    const args = [
        "-c",
        pythonScript,
        ...pdfPaths,
        outputPath
    ];

    await new Promise((resolve, reject) => {
        const child = spawn("python", args, { stdio: ["ignore", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });
        child.on("error", reject);
        child.on("close", (code) => {
            if (code === 0) {
                resolve(stdout);
                return;
            }
            reject(new Error(stderr || stdout || `Python merge failed with exit code ${code}`));
        });
    });
}

async function renderThemePdf(page, theme, themePages, outputDir, rl) {
    const themeSlug = sanitizeFileName(theme.title) || sanitizeFileName(theme.url);
    const finalPdfPath = path.join(outputDir, `${themeSlug}.pdf`);
    const tempDir = path.join(outputDir, ".tmp", themeSlug);

    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.mkdir(tempDir, { recursive: true });

    try {
        const tempPdfPaths = [];
        for (let index = 0; index < themePages.length; index += 1) {
            const themePage = themePages[index];
            log(
                `Rendering PDF ${index + 1}/${themePages.length} for "${theme.title}": ${themePage.url}`
            );
            await gotoWithVerification(page, themePage.url, rl);
            const filePath = path.join(
                tempDir,
                `${String(index + 1).padStart(2, "0")}-${sanitizeFileName(
                    path.posix.basename(new URL(themePage.url).pathname).replace(/\.html$/i, "")
                )}.pdf`
            );
            await printPageToPdf(page, filePath);
            tempPdfPaths.push(filePath);
        }

        await mergePdfs(tempPdfPaths, finalPdfPath);
        return { finalPdfPath };
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
}

async function writeManifest(outputDir, manifest) {
    const manifestPath = path.join(outputDir, "manifest.json");
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    return manifestPath;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    await fs.access(options.browserPath);
    await fs.mkdir(options.outputDir, { recursive: true });

    const userDataDir = path.join(options.outputDir, ".chrome-profile");
    await fs.mkdir(userDataDir, { recursive: true });

    const browserContext = await chromium.launchPersistentContext(userDataDir, {
        executablePath: options.browserPath,
        headless: false,
        viewport: DEFAULT_VIEWPORT
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const manifest = [];

    try {
        const page = browserContext.pages()[0] || (await browserContext.newPage());
        log(`Loading index page: ${options.indexUrl}`);
        await gotoWithVerification(page, options.indexUrl, rl);

        let themes = await extractThemes(page);
        if (options.themeFilter) {
            const filter = options.themeFilter.toLowerCase();
            themes = themes.filter(
                (theme) =>
                    theme.title.toLowerCase().includes(filter) ||
                    theme.url.toLowerCase().includes(filter)
            );
        }

        if (options.limitThemes !== null) {
            themes = themes.slice(0, options.limitThemes);
        }

        if (themes.length === 0) {
            throw new Error("No theme links were found for the current filters.");
        }

        log(`Found ${themes.length} theme(s) to process.`);

        for (const theme of themes) {
            const themeSlug = sanitizeFileName(theme.title) || sanitizeFileName(theme.url);
            const finalPdfPath = path.join(options.outputDir, `${themeSlug}.pdf`);
            const shouldProcess = await ensureFileMissingOrForce(finalPdfPath, options.force);

            if (!shouldProcess) {
                log(`Skipping existing PDF for "${theme.title}"`);
                manifest.push({
                    title: theme.title,
                    slug: themeSlug,
                    pdfPath: finalPdfPath,
                    sourceUrls: [],
                    generatedAt: new Date().toISOString(),
                    status: "skipped"
                });
                continue;
            }

            try {
                const themePages = await discoverThemePages(page, theme, rl);
                const { finalPdfPath: writtenPdfPath } = await renderThemePdf(
                    page,
                    theme,
                    themePages,
                    options.outputDir,
                    rl
                );

                manifest.push({
                    title: theme.title,
                    slug: themeSlug,
                    pdfPath: writtenPdfPath,
                    sourceUrls: themePages.map((item) => item.url),
                    generatedAt: new Date().toISOString(),
                    status: "generated"
                });
                log(`Saved "${theme.title}" to ${writtenPdfPath}`);
            } catch (error) {
                manifest.push({
                    title: theme.title,
                    slug: themeSlug,
                    pdfPath: finalPdfPath,
                    sourceUrls: [],
                    generatedAt: new Date().toISOString(),
                    status: "failed",
                    error: error instanceof Error ? error.message : String(error)
                });
                log(`Failed "${theme.title}": ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        const manifestPath = await writeManifest(options.outputDir, manifest);
        log(`Wrote manifest: ${manifestPath}`);
    } finally {
        rl.close();
        await browserContext.close().catch(() => {});
    }
}

main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
});
