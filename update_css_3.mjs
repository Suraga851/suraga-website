import fs from 'fs';

const STYLE_PATH = 'C:/Users/Mohamed Daoud/Desktop/suraga-website/public/css/style.css';

let style = fs.readFileSync(STYLE_PATH, 'utf8');

// 1. Hero Block
style = style.replace(
    `    border: 1px solid rgba(15, 118, 110, 0.16);\n    background: rgba(255, 255, 255, 0.72);\n    box-shadow: var(--shadow-lg);\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);`,
    `    background: var(--glass-bg);\n    border: 1px solid var(--glass-border);\n    box-shadow: var(--shadow-xl), inset 0 0 20px rgba(255,255,255,0.4);\n    backdrop-filter: blur(var(--glass-blur));\n    -webkit-backdrop-filter: blur(var(--glass-blur));`
);

// 2. Buttons glow on hover
style = style.replace(
    `    box-shadow: 0 16px 30px rgba(15, 118, 110, 0.34);`,
    `    box-shadow: 0 16px 30px rgba(15, 118, 110, 0.34), 0 0 20px rgba(20, 184, 166, 0.4);`
);

fs.writeFileSync(STYLE_PATH, style, 'utf8');
console.log('Final CSS updates applied.');
