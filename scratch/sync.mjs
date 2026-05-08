import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const publicDir = path.join(rootDir, "public");

const sites = [
    {
        url: 'https://suraga-website--suragaelzibaer.replit.app/suraga-promo/',
        outDir: path.join(publicDir, 'suraga-promo')
    },
    {
        url: 'https://suraga-website--suragaelzibaer.replit.app/suraga-pitch-deck/',
        outDir: path.join(publicDir, 'suraga-pitch-deck')
    },
    {
        url: 'https://suraga-website--suragaelzibaer.replit.app/',
        outDir: publicDir
    }
];

const baseUrl = new URL('https://suraga-website--suragaelzibaer.replit.app');

async function downloadFile(urlStr, destPath) {
    try {
        const response = await fetch(urlStr);
        if (!response.ok) {
            console.error(`Failed to download ${urlStr}: ${response.statusText}`);
            return;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.writeFile(destPath, buffer);
        console.log(`Downloaded ${urlStr} -> ${destPath}`);
    } catch (e) {
        console.error(`Error downloading ${urlStr}:`, e);
    }
}

async function syncSite(site) {
    console.log(`\nSyncing ${site.url}...`);
    try {
        await fs.mkdir(site.outDir, { recursive: true });
        
        const response = await fetch(site.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${site.url}`);
        }
        
        const html = await response.text();
        
        // Save the main index.html
        const indexPath = path.join(site.outDir, 'index.html');
        await fs.writeFile(indexPath, html);
        console.log(`Saved index.html to ${indexPath}`);
        
        // Extremely simple regex to find src, href, and srcset paths
        const linkRegex = /(?:href|src|srcset)="([^"]+)"/g;
        let match;
        const assetsToDownload = new Set();
        
        while ((match = linkRegex.exec(html)) !== null) {
            const rawValue = match[1];
            
            // If it's srcset, it could be a comma separated list of "url size, url size"
            const urls = rawValue.split(',').map(s => s.trim().split(/\s+/)[0]);
            
            for (const url of urls) {
                if (!url || url.startsWith('http') || url.startsWith('data:') || url.startsWith('#')) {
                    continue;
                }
                
                // Construct absolute URL
                const absoluteUrl = new URL(url, site.url);
                
                // Only download if it's on the same host
                if (absoluteUrl.hostname === baseUrl.hostname) {
                    assetsToDownload.add(absoluteUrl.pathname);
                }
            }
        }
        
        // For the main site, we also should parse the CSS to find imported assets if needed, 
        // but since these are simple sites/Vite bundles, the HTML might be enough.
        
        for (const assetPath of assetsToDownload) {
            const fullUrl = `${baseUrl.origin}${assetPath}`;
            // The local path is relative to the public directory
            const decodedPath = decodeURIComponent(assetPath);
            const localDestPath = path.join(publicDir, decodedPath.startsWith('/') ? decodedPath.slice(1) : decodedPath);
            await downloadFile(fullUrl, localDestPath);
        }
        
    } catch (e) {
        console.error(`Error syncing ${site.url}:`, e);
    }
}

async function run() {
    for (const site of sites) {
        await syncSite(site);
    }
    console.log('\nSync complete!');
}

run();
