import fs from 'fs';

const STYLE_PATH = 'C:/Users/Mohamed Daoud/Desktop/suraga-website/public/css/style.css';
const CRITICAL_PATH = 'C:/Users/Mohamed Daoud/Desktop/suraga-website/scripts/critical.css';

// 1. UPDATE CRITICAL.CSS
let critical = fs.readFileSync(CRITICAL_PATH, 'utf8');

critical = critical.replace(
    '--shadow-xl: 0 28px 60px rgba(9, 31, 40, 0.24);',
    `--shadow-xl: 0 28px 60px rgba(9, 31, 40, 0.24);\n    --glass-bg: rgba(255, 255, 255, 0.45);\n    --glass-bg-dark: rgba(255, 255, 255, 0.65);\n    --glass-border: rgba(255, 255, 255, 0.4);\n    --glass-blur: 20px;`
);

critical = critical.replace(
    `    background: radial-gradient(circle at 15% 20%, rgba(20,184,166,0.22), transparent 32%),\n        radial-gradient(circle at 84% 12%, rgba(255,107,74,0.14), transparent 36%),\n        linear-gradient(145deg, #e8f4f3 0%, #f8fcfc 38%, #edf6fb 100%);`,
    `    background: radial-gradient(circle at 15% 20%, rgba(20, 184, 166, 0.3), transparent 45%),\n        radial-gradient(circle at 84% 12%, rgba(255, 107, 74, 0.2), transparent 45%),\n        radial-gradient(circle at 50% 80%, rgba(15, 118, 110, 0.15), transparent 50%),\n        linear-gradient(145deg, #e0f2f1 0%, #f0fdfa 38%, #e0f2f1 100%);`
);

critical = critical.replace(
    `    background: rgba(255,255,255,0.78);\n    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);\n    border-bottom: 1px solid rgba(15,118,110,0.1);`,
    `    background: var(--glass-bg);\n    backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur));\n    border-bottom: 1px solid var(--glass-border);`
);

critical = critical.replace(
    `    background: rgba(255,255,255,0.84);\n    border: 1px solid rgba(15,118,110,0.08);`,
    `    background: var(--glass-bg-dark);\n    backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur));\n    border: 1px solid var(--glass-border);`
);

fs.writeFileSync(CRITICAL_PATH, critical, 'utf8');
console.log('Updated critical.css');


// 2. UPDATE CARDS IN STYLE.CSS
let style = fs.readFileSync(STYLE_PATH, 'utf8');

const glassCSS = `    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-md), inset 0 1px 1px rgba(255,255,255,0.5);`;

// Quick Facts Card
style = style.replace(
    `    background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(243, 251, 251, 0.9));\n    padding: 1.45rem;\n    border-radius: var(--radius-md);\n    border: 1px solid rgba(15, 118, 110, 0.14);\n    box-shadow: var(--shadow-sm);`,
    `    padding: 1.45rem;\n    border-radius: var(--radius-md);\n${glassCSS}`
);

// Service Card
style = style.replace(
    `    background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(244, 251, 251, 0.92));\n    padding: 1.65rem;\n    border-radius: var(--radius-md);\n    box-shadow: var(--shadow-sm);\n    transition: all var(--transition-normal);\n    border: 1px solid rgba(15, 118, 110, 0.1);`,
    `    padding: 1.65rem;\n    border-radius: var(--radius-md);\n    transition: all var(--transition-normal);\n${glassCSS}`
);

// Timeline Content
style = style.replace(
    `    background: linear-gradient(150deg, rgba(255, 255, 255, 0.96), rgba(246, 252, 252, 0.92));\n    padding: 1.3rem 1.5rem;\n    border-radius: var(--radius-md);\n    box-shadow: var(--shadow-sm);\n    border: 1px solid rgba(15, 118, 110, 0.12);`,
    `    padding: 1.3rem 1.5rem;\n    border-radius: var(--radius-md);\n${glassCSS}`
);

// Portfolio Card
style = style.replace(
    `    background: linear-gradient(150deg, rgba(255, 255, 255, 0.98), rgba(243, 251, 251, 0.92));\n    padding: 1.45rem;\n    border-radius: var(--radius-md);\n    box-shadow: var(--shadow-sm);\n    cursor: pointer;\n    transition: all var(--transition-normal);\n    text-align: left;\n    border: 1px solid rgba(15, 118, 110, 0.1);`,
    `    padding: 1.45rem;\n    border-radius: var(--radius-md);\n    cursor: pointer;\n    transition: all var(--transition-normal);\n    text-align: left;\n${glassCSS}`
);

// Contact Form
style = style.replace(
    `    background: linear-gradient(160deg, rgba(255, 255, 255, 0.97), rgba(244, 251, 251, 0.94));\n    padding: 1.6rem;\n    border-radius: var(--radius-md);\n    border: 1px solid rgba(15, 118, 110, 0.12);\n    box-shadow: var(--shadow-sm);`,
    `    padding: 1.6rem;\n    border-radius: var(--radius-md);\n${glassCSS}`
);

// Testimonial Card
style = style.replace(
    `    background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(246, 252, 252, 0.9));\n    border-radius: var(--radius-md);\n    padding: 1.75rem;\n    border: 1px solid rgba(15, 118, 110, 0.12);\n    box-shadow: var(--shadow-sm);`,
    `    border-radius: var(--radius-md);\n    padding: 1.75rem;\n${glassCSS}`
);


// Section Containers need to lose background to allow glass to pop
style = style.replace(
    `    background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(246, 252, 252, 0.9));`,
    `    background: transparent; border: none; box-shadow: none;`
);
style = style.replace(
    `    background: linear-gradient(135deg, rgba(238, 248, 247, 0.94), rgba(250, 252, 253, 0.92));`,
    `    background: transparent; border: none; box-shadow: none;`
);

fs.writeFileSync(STYLE_PATH, style, 'utf8');
console.log('Updated style cards.');
