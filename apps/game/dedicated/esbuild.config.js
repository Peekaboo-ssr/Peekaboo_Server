import { glob } from 'glob';
import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy'; // copy 함수 import 추가

try {
  const entryPoints = await glob('src/**/*.js');

  await esbuild.build({
    entryPoints,
    bundle: true,
    outdir: 'dist',
    platform: 'node',
    target: 'node18',
    format: 'esm',
    sourcemap: true,
    plugins: [
      copy({
        assets: {
          from: ['./src/**/*.json'],
          to: ['./'],
        },
      }),
    ],
    external: [
      '@peekaboo-ssr/classes',
      '@peekaboo-ssr/config',
      '@peekaboo-ssr/events',
      '@peekaboo-ssr/utils',
      '@peekaboo-ssr/commands',
      '@peekaboo-ssr/error',
      'bull',
      'crypto',
      'ioredis',
      'lodash',
      'long',
      'protobufjs',
      'protobufjs/minimal',
    ],
    define: {
      'global.XMLHttpRequest': 'undefined',
      'process.env.NODE_ENV': '"production"',
    },
    inject: ['./esm-shims.js'],
  });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
