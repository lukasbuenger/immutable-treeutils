import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import license from 'rollup-plugin-license'

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
    license({
      cwd: '../', // Default is process.cwd()
      sourcemap: true,

      banner: {
        commentStyle: 'regular', // The default

        content: {
          file: path.join(__dirname, '../LICENSE'),
          encoding: 'utf-8', // Default is utf-8
        },
      },
    }),
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
