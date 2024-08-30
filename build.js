const cp = require('child_process');
const fs = require('fs');
const json5 = require('json5');
const os = require('os');
const path = require('path');

const resolve = (...args) => path.resolve(__dirname, ...args);
const join = path.join;

function empty(path) {
  for (const entry of fs.readdirSync(path)) {
    remove(join(path, entry));
  }
}

function ignoreError(fn) {
  try {
    fn()
  } catch (error) {}
}

function processFile(tmpDir, outDir, filename, license) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(join(tmpDir, filename), 'utf-8')
    const writeStream = fs.createWriteStream(join(outDir, filename), 'utf-8')
    writeStream.write(license);
    readStream.pipe(writeStream);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
  });
}

async function processFiles(tmpDir, outDir, license) {
  let outDirCreated = false;
  for (const entry of fs.readdirSync(tmpDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      outDirCreated = processFiles(join(tmpDir, entry.name), join(outDir, entry.name), license) || outDirCreated;
    } else {
      if (/\.(js|d\.ts)$/.test(entry.name)) {
        if (!outDirCreated) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        const outFile = join(outDir, entry.name);
        fs.writeFileSync(outFile, license, 'utf-8');
        await processFile(tmpDir, outDir, entry.name, license);
      }
      remove(tmpDir, entry.name);
    }
  }
  remove(tmpDir);
}

function remove(...path) {
  ignoreError(() => fs.rmSync(join(...path), { recursive: true }));
}

function resolveOutDir(tmpDir) {
  const tsconfig = json5.parse(fs.readFileSync(resolve('tsconfig.json'), 'utf-8'));
  if (!tsconfig || typeof tsconfig !== 'object' || tsconfig instanceof Array) {
    throw new Error('Invalid tsconfig.json file in project root');
  } else if (tsconfig.extends) {
    throw new Error('No support for "extends" option in tsconfig.json yet');
  } else if (!tsconfig.compilerOptions?.outDir) {
    throw new Error('The tsconfig.json file must have a "compilerOptions.outDir" option');
  } else {
    return resolve(tsconfig.compilerOptions.outDir);
  }
}

async function tsc(tmpDir) {
  const npx = /^win\d+$/.test(process.platform) ? 'npx.cmd' : 'npx';
  const { status } = cp.spawnSync(npx, ['tsc', '--outDir', tmpDir], { stdio: 'inherit' });
  if (status) {
    kill(status);
  }
}

function kill(status, ...args) {
  if (args.length) {
    console.error(...args);
  }
  remove(tmpDir);
  process.exit(status);
}

// const tmpDir = fs.mkdtempSync(join(os.tmpdir(), 'typescript-partial-lib-dom'));
const tmpDir = join(os.tmpdir(), 'typescript-partial-lib-dom');
fs.mkdirSync(tmpDir, { recursive: true });
empty(tmpDir);
const outDir = resolveOutDir();
tsc(tmpDir);
const license = `/*! *****************************************************************************
${fs.readFileSync(resolve('LICENSE.txt'), 'utf-8').replace(/\n$/, '')}
***************************************************************************** */
`;
empty(outDir);
processFiles(tmpDir, outDir, license).catch((error) => kill(1, error));

