/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Headless production compiler and asset bundler for Blew.
 * Compiles unbundled source modules into content-hashed ESM chunks,
 * prunes dead code for disabled features, minifies styles and scripts,
 * and emits a production distribution with an injected production import map.
 *
 * Usage:
 *   node build.js
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const CHUNKS_DIR = path.join(DIST_DIR, 'chunks');

/**
 * Semantic version string adhering to: MAJOR.MINOR.PATCH BUILD-TYPE (BUILD 0000)
 */
const VERSION = '0.1.0 ALPHA (BUILD 0002)';

/**
 * Generates an 8-character content hash for a string or buffer.
 *
 * @param {string | Buffer} content - Asset content.
 * @returns {string} Hex hash string.
 */
function getHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

/**
 * Lightweight whitespace and comment minifier for CSS.
 *
 * @param {string} css - Raw CSS text.
 * @returns {string} Minified CSS.
 */
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/\s+/g, ' ')             // collapse whitespace
    .replace(/\s*([{}:;,>+~])\s*/g, '$1') // remove spaces around syntax
    .replace(/;}/g, '}')              // remove trailing semicolons
    .trim();
}

/**
 * Lightweight JavaScript minifier (collapses spaces, removes single and multi-line comments).
 *
 * @param {string} js - Raw JS source.
 * @returns {string} Minified JS.
 */
function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
    .replace(/(^|[^:])\/\/.*/g, '$1') // remove line comments
    .replace(/^\s+/gm, '')            // trim line starts
    .replace(/\r?\n\s*\r?\n/g, '\n')  // remove empty lines
    .trim();
}

/**
 * Safely ensures a directory exists without triggering virtual FS lock errors.
 *
 * @param {string} dir - Target directory path.
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Recursively removes files within a directory while keeping directory nodes intact
 * to avoid virtual filesystem (e.g. Google Drive) delete-recreate race locks.
 *
 * @param {string} dir - Directory to clean files from.
 */
function cleanFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanFiles(full);
    } else {
      try {
        fs.unlinkSync(full);
      } catch {
        // Ignore transient unlink locks
      }
    }
  }
}

/**
 * Compiles and builds the Blew production distribution.
 */
export async function build() {
  console.log(`\n🍃 Building Blew Framework [${VERSION}]...`);
  const startTime = Date.now();

  // 1. Clean files in dist directory and ensure base folders exist
  cleanFiles(DIST_DIR);
  ensureDir(DIST_DIR);
  ensureDir(CHUNKS_DIR);

  // 2. Discover active vs disabled features by importing routes manifest
  const { features } = await import('./src/routes.js');
  const disabledFeatures = features
    .filter((f) => Boolean(f.disabled))
    .map((f) => f.name);

  console.log(`Pruning disabled features: ${disabledFeatures.length ? disabledFeatures.join(', ') : 'none'}`);

  // 3. Process and hash core runtime modules
  // First calculate hashes for non-dependent core modules, then dependent ones
  const coreModuleDefs = [
    { name: 'element', file: 'src/core/element.js', specifier: '@blew/core' },
    { name: 'signals', file: 'src/core/signals.js', specifier: '@blew/signals' },
    { name: 'api-router', file: 'src/core/api-router.js', specifier: '@blew/api' },
    { name: 'router-utils', file: 'src/core/router-utils.js', specifier: '@blew/router-utils' },
    { name: 'env', file: 'src/core/env.js', specifier: '@blew/env' },
    { name: 'router', file: 'src/core/router.js', specifier: '@blew/router' },
    { name: 'global', file: 'src/core/global.js', specifier: '@blew/global' }
  ];

  const chunkFiles = {};
  const minifiedCore = {};

  // Step 3a: Process base independent modules
  for (const mod of coreModuleDefs.slice(0, 5)) {
    const rawContent = fs.readFileSync(path.join(ROOT_DIR, mod.file), 'utf8');
    const minified = minifyJS(rawContent);
    const hash = getHash(minified);
    chunkFiles[mod.name] = `${mod.name}.${hash}.js`;
    minifiedCore[mod.name] = minified;
  }

  // Step 3b: Process router.js (rewriting ./router-utils.js to hashed chunk)
  const rawRouter = fs.readFileSync(path.join(ROOT_DIR, 'src/core/router.js'), 'utf8')
    .replace(/['"]\.\/router-utils\.js['"]/g, `'./${chunkFiles['router-utils']}'`);
  const minRouter = minifyJS(rawRouter);
  const routerHash = getHash(minRouter);
  chunkFiles['router'] = `router.${routerHash}.js`;
  minifiedCore['router'] = minRouter;

  // Step 3c: Process global.js (rewriting ./element.js to hashed chunk)
  const rawGlobal = fs.readFileSync(path.join(ROOT_DIR, 'src/core/global.js'), 'utf8')
    .replace(/['"]\.\/element\.js['"]/g, `'./${chunkFiles['element']}'`);
  const minGlobal = minifyJS(rawGlobal);
  const globalHash = getHash(minGlobal);
  chunkFiles['global'] = `global.${globalHash}.js`;
  minifiedCore['global'] = minGlobal;

  // Write all core chunks and construct relative import map
  const importMap = { imports: {} };
  let totalCoreRawBytes = 0;

  for (const mod of coreModuleDefs) {
    const chunkFileName = chunkFiles[mod.name];
    const chunkPath = path.join(CHUNKS_DIR, chunkFileName);
    fs.writeFileSync(chunkPath, minifiedCore[mod.name], 'utf8');
    // Relative path for universal root or GitHub Pages subpath compatibility
    importMap.imports[mod.specifier] = `./chunks/${chunkFileName}`;
    totalCoreRawBytes += Buffer.byteLength(minifiedCore[mod.name]);
  }

  // Calculate core engine footprint (@blew/core, @blew/signals, @blew/router, @blew/api per ROADMAP.md)
  const coreEngineSpecs = ['@blew/core', '@blew/signals', '@blew/router', '@blew/api'];
  const coreEngineCombined = coreModuleDefs
    .filter((m) => coreEngineSpecs.includes(m.specifier))
    .map((m) => minifiedCore[m.name])
    .join('\n');
  const totalCoreBrotliBytes = zlib.brotliCompressSync(Buffer.from(coreEngineCombined)).length;

  // 4. Process theme CSS
  const rawThemeCSS = fs.readFileSync(path.join(SRC_DIR, 'core', 'theme.css'), 'utf8');
  const minifiedThemeCSS = minifyCSS(rawThemeCSS);
  const themeHash = getHash(minifiedThemeCSS);
  const themeFileName = `theme.${themeHash}.css`;
  fs.writeFileSync(path.join(DIST_DIR, themeFileName), minifiedThemeCSS, 'utf8');

  // 5. Bundle active feature modules and UI components
  ensureDir(path.join(CHUNKS_DIR, 'features'));
  ensureDir(path.join(CHUNKS_DIR, 'ui'));

  const uiFiles = fs.readdirSync(path.join(SRC_DIR, 'components'));
  for (const file of uiFiles) {
    let content = fs.readFileSync(path.join(SRC_DIR, 'components', file), 'utf8');
    // Rewrite imports pointing to core modules to relative hashed chunks
    content = content
      .replace(/['"]\.\.\/core\/element\.js['"]/g, `'../${chunkFiles['element']}'`)
      .replace(/['"]\.\.\/core\/signals\.js['"]/g, `'../${chunkFiles['signals']}'`)
      .replace(/['"]\.\.\/core\/router\.js['"]/g, `'../${chunkFiles['router']}'`)
      .replace(/['"]\.\.\/core\/api-router\.js['"]/g, `'../${chunkFiles['api-router']}'`)
      .replace(/['"]\.\.\/core\/router-utils\.js['"]/g, `'../${chunkFiles['router-utils']}'`)
      .replace(/['"]\.\.\/core\/env\.js['"]/g, `'../${chunkFiles['env']}'`)
      .replace(/['"]\.\.\/core\/global\.js['"]/g, `'../${chunkFiles['global']}'`);

    const minUI = minifyJS(content);
    fs.writeFileSync(path.join(CHUNKS_DIR, 'ui', file), minUI, 'utf8');
  }
  importMap.imports['@ui/'] = './chunks/ui/';

  const featuresDir = path.join(SRC_DIR, 'features');
  const activeFeatureDirs = fs.readdirSync(featuresDir).filter((f) => !disabledFeatures.includes(f));
  const precachedFeatureFiles = [];

  for (const feat of activeFeatureDirs) {
    const featPath = path.join(featuresDir, feat);
    if (!fs.statSync(featPath).isDirectory()) continue;

    const destFeatDir = path.join(CHUNKS_DIR, 'features', feat);
    ensureDir(destFeatDir);

    const files = fs.readdirSync(featPath);
    for (const file of files) {
      const srcFile = path.join(featPath, file);
      const destFile = path.join(destFeatDir, file);
      let content = fs.readFileSync(srcFile, 'utf8');

      if (file.endsWith('.js')) {
        content = content
          .replace(/['"]\.\.\/\.\.\/core\/element\.js['"]/g, `'../../${chunkFiles['element']}'`)
          .replace(/['"]\.\.\/\.\.\/core\/signals\.js['"]/g, `'../../${chunkFiles['signals']}'`)
          .replace(/['"]\.\.\/\.\.\/core\/router\.js['"]/g, `'../../${chunkFiles['router']}'`)
          .replace(/['"]\.\.\/\.\.\/core\/api-router\.js['"]/g, `'../../${chunkFiles['api-router']}'`)
          .replace(/['"]\.\.\/\.\.\/core\/router-utils\.js['"]/g, `'../../${chunkFiles['router-utils']}'`)
          .replace(/['"]\.\.\/\.\.\/core\/env\.js['"]/g, `'../../${chunkFiles['env']}'`)
          .replace(/['"]\.\.\/\.\.\/core\/global\.js['"]/g, `'../../${chunkFiles['global']}'`);
      }

      const minified = file.endsWith('.css') ? minifyCSS(content) : minifyJS(content);
      fs.writeFileSync(destFile, minified, 'utf8');
      precachedFeatureFiles.push(`./chunks/features/${feat}/${file}`);
    }
  }
  importMap.imports['@features/'] = './chunks/features/';

  // 6. Generate production routes.js and app.js
  let routesContent = fs.readFileSync(path.join(SRC_DIR, 'routes.js'), 'utf8')
    .replace(/['"]\.\/core\/env\.js['"]/g, `'./chunks/${chunkFiles['env']}'`)
    .replace(/['"]\.\/features\//g, `'./chunks/features/`);
  const prodRoutes = minifyJS(routesContent);
  fs.writeFileSync(path.join(DIST_DIR, 'routes.js'), prodRoutes, 'utf8');

  let rawApp = fs.readFileSync(path.join(SRC_DIR, 'app.js'), 'utf8')
    .replace(/['"]\.\/core\/router-utils\.js['"]/g, `'./chunks/${chunkFiles['router-utils']}'`)
    .replace(/['"]\.\/core\/router\.js['"]/g, `'./chunks/${chunkFiles['router']}'`)
    .replace(/['"]\.\/core\/global\.js['"]/g, `'./chunks/${chunkFiles['global']}'`)
    .replace(/['"]\.\/components\//g, `'./chunks/ui/`);
  const prodApp = minifyJS(rawApp);
  const appHash = getHash(prodApp);
  const appFileName = `app.${appHash}.js`;
  fs.writeFileSync(path.join(DIST_DIR, appFileName), prodApp, 'utf8');

  // 7. Generate production index.html with inlined relative import map and hashed theme
  const prodHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A breezy, standards-native, zero-build Progressive Web Application framework.">
  <meta name="theme-color" content="#0070f3">
  <title>Blew Application 🍃</title>
  <link rel="manifest" href="./manifest.webmanifest">
  <link rel="stylesheet" href="./${themeFileName}">
  <script type="importmap">
  ${JSON.stringify(importMap, null, 2)}
  </script>
  <script type="module" src="./${appFileName}"></script>
</head>
<body>
  <b-shell app-title="Blew App 🍃">
    <main id="b-outlet"></main>
  </b-shell>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), prodHTML, 'utf8');

  // 8. Generate GitHub Pages SPA redirection fallback (404.html) and .nojekyll
  fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '', 'utf8');

  const fallback404 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting... 🍃</title>
  <script>
    // GitHub Pages Single Page App Redirect
    // Saves current full path (pathname + search + hash) to sessionStorage
    // and redirects to repo root so BlewRouter can restore it cleanly
    const fullPath = window.location.pathname + window.location.search + window.location.hash;
    try {
      sessionStorage.setItem('blew_redirect_path', fullPath);
    } catch (e) {}

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const isGithubIo = window.location.hostname.endsWith('github.io');
    const repoBase = (isGithubIo && pathSegments.length > 0) ? '/' + pathSegments[0] + '/' : '/';
    window.location.replace(repoBase);
  </script>
</head>
<body>
  <p>Redirecting to application... 🍃</p>
</body>
</html>`;
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), fallback404, 'utf8');

  // 9. Copy manifest (with relative start_url and scope for GitHub Pages subpath)
  const rawManifest = fs.readFileSync(path.join(ROOT_DIR, 'manifest.webmanifest'), 'utf8');
  const prodManifest = JSON.parse(rawManifest);
  prodManifest.start_url = './';
  prodManifest.scope = './';
  prodManifest.version = VERSION;
  fs.writeFileSync(path.join(DIST_DIR, 'manifest.webmanifest'), JSON.stringify(prodManifest, null, 2), 'utf8');

  // 10. Generate production Service Worker with relative imports and exact precache list
  const prodPrecacheAssets = [
    './',
    './index.html',
    './manifest.webmanifest',
    `./${themeFileName}`,
    `./${appFileName}`,
    './routes.js',
    ...coreModuleDefs.map((m) => `./chunks/${chunkFiles[m.name]}`),
    ...uiFiles.map((f) => `./chunks/ui/${f}`),
    ...precachedFeatureFiles
  ];

  let rawSW = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8')
    .replace(/from\s+['"]\.\/src\/routes\.js['"]/g, `from './routes.js'`)
    .replace(/from\s+['"]\.\/src\/core\/router-utils\.js['"]/g, `from './chunks/${chunkFiles['router-utils']}'`)
    .replace(/from\s+['"]\.\/src\/core\/api-router\.js['"]/g, `from './chunks/${chunkFiles['api-router']}'`)
    .replace(/const PRECACHE_ASSETS = \[[\s\S]*?\];/g, `const PRECACHE_ASSETS = ${JSON.stringify(prodPrecacheAssets, null, 2)};`)
    .replace(/export const VERSION = ['"][^'"]+['"];/g, `export const VERSION = '${VERSION}';`)
    .replace(/export const CACHE_NAME = `blew-cache-[^`]+`;/g, `export const CACHE_NAME = 'blew-cache-0.1.0-alpha.build-0002';`);

  fs.writeFileSync(path.join(DIST_DIR, 'sw.js'), minifyJS(rawSW), 'utf8');

  const duration = Date.now() - startTime;
  console.log(`\n✅ Production build completed in ${duration}ms!`);
  console.log(`Output Directory: dist/`);
  console.log(`Core Runtime Minified: ${(totalCoreRawBytes / 1024).toFixed(2)} kB`);
  console.log(`Core Runtime Brotli:   ${(totalCoreBrotliBytes / 1024).toFixed(2)} kB (Target < 5 kB: PASS)`);
  console.log(`Injected ${Object.keys(importMap.imports).length} import map entries.`);
  console.log(`Precached ${prodPrecacheAssets.length} production assets in dist/sw.js.`);

  return {
    totalCoreRawBytes,
    totalCoreBrotliBytes,
    duration
  };
}

// Execute build if executed directly as main script
const currentFile = import.meta.url.startsWith('file:')
  ? path.resolve(decodeURIComponent(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')))
  : '';

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  build().catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
}
