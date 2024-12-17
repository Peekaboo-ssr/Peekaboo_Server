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
      // 실제 사용하는 의존성
      '@peekaboo-ssr/classes',
      '@peekaboo-ssr/config',
      '@peekaboo-ssr/events',
      '@peekaboo-ssr/utils',
      '@peekaboo-ssr/commands',
      '@peekaboo-ssr/error',
      'bcrypt',
      'jsonwebtoken',
      'uuid',
      // protobuf 관련 (공통 의존성)
      'protobufjs',
      'protobufjs/minimal',
      'express',
      'prom-client',
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
