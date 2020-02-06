import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

export default {
  input: './src/index.ts',
  external: ['immutable'],
  plugins: [
    typescript({
      module: 'es2015',
      target: 'es3',
      declaration: true,
      declarationDir: './dist',
    }),
    resolve(),
    commonjs(),
    terser(),
  ],
  output: [
    {
      file: './dist/index.js',
      format: 'cjs',
    },
    {
      file: './dist/index.es.js',
      format: 'esm',
    },
  ],
}
