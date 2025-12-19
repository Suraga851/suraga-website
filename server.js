const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

const CACHE_CONTROL = {
    'text/html': 'public, max-age=0, must-revalidate', // HTML checks for updates
    'default': 'public, max-age=31536000, immutable'   // Assets cached forever
};

http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Create clean path
    let safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';

    let filePath = path.join(PUBLIC_DIR, safePath);

    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
        const cacheHeader = CACHE_CONTROL[mimeType] || CACHE_CONTROL['default'];

        // Headers
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', cacheHeader);
        res.setHeader('X-Powered-By', 'High-Perf-Node-Server');

        // Compression Handling (Deflate/Gzip)
        const acceptEncoding = req.headers['accept-encoding'] || '';
        const raw = fs.createReadStream(filePath);

        if (/\btext\//.test(mimeType) || mimeType === 'application/json' || mimeType === 'application/javascript') {
            if (acceptEncoding.match(/\bdeflate\b/)) {
                res.writeHead(200, { 'Content-Encoding': 'deflate' });
                raw.pipe(zlib.createDeflate()).pipe(res);
            } else if (acceptEncoding.match(/\bgzip\b/)) {
                res.writeHead(200, { 'Content-Encoding': 'gzip' });
                raw.pipe(zlib.createGzip()).pipe(res);
            } else {
                res.writeHead(200);
                raw.pipe(res);
            }
        } else {
            // No compression for images/pdfs usually
            res.writeHead(200);
            raw.pipe(res);
        }
    });

}).listen(PORT, () => {
    console.log(`\n🚀 High-Performance Server running at http://localhost:${PORT}`);
    console.log(`📂 Serving static files from ${PUBLIC_DIR}`);
});
