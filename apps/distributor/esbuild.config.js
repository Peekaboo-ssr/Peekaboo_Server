// distributor, gateway, lobby, session용 esbuild.config.js
import { glob } from 'glob';
import * as esbuild from 'esbuild';

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
    external: [
      // Node.js 내장 모듈
      'fs',
      'path',
      'http',
      'https',
      'net',
      'tls',
      'crypto',
      'stream',
      'zlib',
      'events',
      'util',
      'buffer',
      'url',
      // 공통 의존성
      '@peekaboo-ssr/config',
      '@peekaboo-ssr/classes',
      '@peekaboo-ssr/events',
      '@peekaboo-ssr/utils',
      // protobuf 관련
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
