const fs = require('fs');

const FILE_PATH = 'public/css/style.css';

let content = fs.readFileSync(FILE_PATH, 'utf8');

// 1. Add CSS Variables
content = content.replace(
    '--shadow-xl: 0 28px 60px rgba(9, 31, 40, 0.24);',
    `--shadow-xl: 0 28px 60px rgba(9, 31, 40, 0.24);\n    --glass-bg: rgba(255, 255, 255, 0.45);\n    --glass-bg-dark: rgba(255, 255, 255, 0.65);\n    --glass-border: rgba(255, 255, 255, 0.4);\n    --glass-blur: 20px;`
);

// 2. Update Animated Background Gradient
content = content.replace(
    `    background: radial-gradient(circle at 15% 20%, rgba(20, 184, 166, 0.22), transparent 32%),\n        radial-gradient(circle at 84% 12%, rgba(255, 107, 74, 0.14), transparent 36%),\n        linear-gradient(145deg, #e8f4f3 0%, #f8fcfc 38%, #edf6fb 100%);`,
    `    background: radial-gradient(circle at 15% 20%, rgba(20, 184, 166, 0.3), transparent 45%),\n        radial-gradient(circle at 84% 12%, rgba(255, 107, 74, 0.2), transparent 45%),\n        radial-gradient(circle at 50% 80%, rgba(15, 118, 110, 0.15), transparent 50%),\n        linear-gradient(145deg, #e0f2f1 0%, #f0fdfa 38%, #e0f2f1 100%);`
);

// 3. Navbar Update
content = content.replace(
    `    background: rgba(255, 255, 255, 0.78);\n    backdrop-filter: blur(14px);\n    -webkit-backdrop-filter: blur(14px);\n    border-bottom: 1px solid rgba(15, 118, 110, 0.1);`,
    `    background: var(--glass-bg);\n    backdrop-filter: blur(var(--glass-blur));\n    -webkit-backdrop-filter: blur(var(--glass-blur));\n    border-bottom: 1px solid var(--glass-border);`
);

// 4. Nav Links Update
content = content.replace(
    `    background: rgba(255, 255, 255, 0.84);\n    border: 1px solid rgba(15, 118, 110, 0.08);`,
    `    background: var(--glass-bg-dark);\n    backdrop-filter: blur(var(--glass-blur));\n    -webkit-backdrop-filter: blur(var(--glass-blur));\n    border: 1px solid var(--glass-border);`
);

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log('CSS base variables updated successfully.')
