import typescript from 'rollup-plugin-typescript'

export default {
  input: './src/index.ts',
  external: ['immutable'],
  plugins: [typescript({ module: 'es2015', target: 'es3' })],
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
