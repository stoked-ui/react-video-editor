const commonjs = require('@rollup/plugin-commonjs');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');
const {terser} = require('rollup-plugin-terser');
import copy from 'rollup-plugin-copy';

const pckg = require('./package.json');
const name = pckg.name.replace('@', '').replace('/', '-');
const input = pckg.module;

const plugins = [
    nodeResolve(),
    commonjs(),
    sourcemaps(),

];

const output = {
    format: 'umd',
    name: name,
    // The key here is library name,and the value is the the name of the global variable name the window object.
    // See https://github.com/rollup/rollup/wiki/JavaScript-API#globals for more.
    globals: {
        // TS
        // 'tslib': 'tslib'
    },
    sourcemap: true
};


export default [{
    input,
    plugins,
    output: {
        ...output,
        file: distPath(`${name}.umd.js`)
    }
},
{
    input,
    plugins: [
        ...plugins,
        terser(),
        copy({
            targets: [
                { rename:`${name}.umd.d.ts`, src: 'dist/index.d.ts', dest: `dist/bundles` }
            ]
        })
    ],
    output: {
        ...output,
        file: distPath(`${name}.umd.min.js`)
    }
}];

function distPath(file) {
    return `./dist/bundles/${file}`;
}
