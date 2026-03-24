const url = process.argv[2] || "http://127.0.0.1:8080";
const outputPath = process.argv[3] || "artifacts/site-screenshot.png";

const createFallbackPng = async (targetUrl, destinationPath, reason) => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const { default: sharp } = await import("sharp");
    const width = 1440;
    const height = 900;
    const safeReason = String(reason).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const safeUrl = String(targetUrl).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const timestamp = new Date().toISOString();

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#0b4f4a"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect x="60" y="80" width="${width - 120}" height="${height - 160}" rx="24" fill="#ffffff" opacity="0.95"/>
  <text x="100" y="170" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#152632">
    Screenshot Fallback
  </text>
  <text x="100" y="230" font-family="Arial, sans-serif" font-size="24" fill="#344454">
    Could not launch Playwright Chromium in this environment.
  </text>
  <text x="100" y="290" font-family="Arial, sans-serif" font-size="20" fill="#0b4f4a">
    URL: ${safeUrl}
  </text>
  <text x="100" y="335" font-family="Arial, sans-serif" font-size="18" fill="#4f5f6e">
    Reason: ${safeReason}
  </text>
  <text x="100" y="380" font-family="Arial, sans-serif" font-size="18" fill="#4f5f6e">
    Generated: ${timestamp}
  </text>
</svg>`;

    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await sharp(Buffer.from(svg)).png().toFile(destinationPath);
};

const run = async () => {
    try {
        const { chromium } = await import("playwright");
        let browser;

        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
        await page.goto(url, { waitUntil: "networkidle" });
        const fs = await import("node:fs/promises");
        const path = await import("node:path");
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await page.screenshot({ path: outputPath, fullPage: true });
        await browser.close();
        console.log(`Screenshot saved to ${outputPath}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await createFallbackPng(url, outputPath, message);
        console.warn("Playwright Chromium unavailable. Generated fallback PNG instead.");
        console.warn(`Fallback saved to ${outputPath}`);
    }
};

await run();
