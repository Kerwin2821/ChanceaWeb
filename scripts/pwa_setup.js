const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../public');

// Ensure dist exists (it should, after build)
if (!fs.existsSync(distDir)) {
    console.error('Dist folder not found! Build before running this script.');
    process.exit(1);
}

// Copy public assets to dist
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${entry.name}`);
        }
    }
}

console.log('Copying PWA assets to dist...');
if (fs.existsSync(publicDir)) {
    copyDir(publicDir, distDir);
} else {
    console.warn('Public folder not found.');
}

// Inject manifest & SW registration into index.html
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let content = fs.readFileSync(indexHtmlPath, 'utf8');

    // Inject manifest link
    if (!content.includes('manifest.json')) {
        content = content.replace('</head>', '<link rel="manifest" href="/manifest.json">\n</head>');
        console.log('Injected manifest link.');
    }

    // Inject SW script
    const swScript = `
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  </script>
  `;

    if (!content.includes('serviceWorker.register')) {
        content = content.replace('</body>', `${swScript}\n</body>`);
        console.log('Injected SW registration script.');
    }

    fs.writeFileSync(indexHtmlPath, content);
    console.log('Updated index.html successfully.');
} else {
    console.error('index.html not found in dist!');
}
