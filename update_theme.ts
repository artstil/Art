import fs from 'fs';

const appFile = './src/App.tsx';
let content = fs.readFileSync(appFile, 'utf8');

content = content.replace(/jolly-/g, 'theme-');

// Also update specific hardcoded colors in App.tsx
content = content.replace(/bg-\[#a29bfe\]/g, 'bg-indigo-500');
content = content.replace(/bg-\[#74b9ff\]/g, 'bg-indigo-600');
content = content.replace(/border-\[#3bbdb4\]/g, 'border-sky-600');
content = content.replace(/bg-\[#e6fcf8\]/g, 'bg-theme-primary/10');
content = content.replace(/bg-\[#fef5f0\]/g, 'bg-theme-bg');

fs.writeFileSync(appFile, content);
console.log('Done replacing theme in App.tsx');
