import { execFile } from 'node:child_process';
import { access, copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);

export default function resume() {
  let source;
  let rendererDir;
  let output;
  let publicOutput;
  let root;
  let cleanup;

  async function render(logger) {
    await mkdir(path.dirname(fileURLToPath(publicOutput)), { recursive: true });
    let hasSource = true;
    try {
      await access(source);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      hasSource = false;
    }

    if (!hasSource) {
      await copyFile(output, publicOutput);
      logger.info('Using committed static/resume.pdf; private YAML is not present.');
      return;
    }

    // Run TSX in Node so Vite does not bundle the server-only PDF renderer.
    try {
      const { stdout } = await run(process.execPath, [
        '--import', 'tsx',
        fileURLToPath(new URL('render-resume.tsx', rendererDir)),
        fileURLToPath(source),
        fileURLToPath(output),
      ], { cwd: fileURLToPath(root) });
      await copyFile(output, publicOutput);
      logger.info(stdout.trim());
    } catch (error) {
      throw new Error(error.stderr?.trim() || error.message, { cause: error });
    }
  }

  return {
    name: 'resume',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = config.root;
        source = new URL('resume/AurelioFlorez-Resume.yaml', root);
        rendererDir = new URL('scripts/resume/', root);
        output = new URL('static/resume.pdf', root);
        publicOutput = new URL('resume.pdf', config.publicDir);
      },
      'astro:build:start': ({ logger }) => render(logger),
      'astro:server:setup': async ({ server, logger }) => {
        const watched = new Set([
          fileURLToPath(source),
          ...(await readdir(rendererDir))
            .filter(file => /\.tsx?$/.test(file))
            .map(file => fileURLToPath(new URL(file, rendererDir))),
        ]);
        server.watcher.add([...watched]);

        // Queue renders so a save during a render is never dropped.
        let pending = Promise.resolve();
        const onChange = (_event, file) => {
          if (!watched.has(path.resolve(file))) return;
          pending = pending.then(() => render(logger)).catch(error => {
            logger.error(error.message);
          });
        };
        server.watcher.on('all', onChange);
        cleanup = () => server.watcher.off('all', onChange);
        pending = render(logger);
        await pending;
      },
      'astro:server:done': () => cleanup?.(),
    },
  };
}
