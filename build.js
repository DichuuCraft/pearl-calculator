const path = require('path');
const rollup = require('rollup');
const fs = require('fs-extra');
const terser = require('rollup-plugin-terser');
const _ = a => path.join(__dirname, a);

function exists(f){
    return new Promise((resolve, reject) => {
        fs.exists(f, e => resolve(e));
    });
}
function readdir(f){
    return new Promise((resolve, reject) => {
        fs.readdir(f, (e, f) => e ? reject(e) : resolve(f));
    });
}

(async () => {
    !await exists(_('dist')) && await fs.mkdirp(_('dist'));
    const plugins = [];
    process.env['DEBUG'] || plugins.push(terser.terser());

    const bundle = await rollup.rollup({
        input: _('src/index.js'),
        plugins
    });
    await bundle.write({
        file: _('dist/index.js'),
        name: 'hkm',
        format: 'umd'
    });

    for await(const file of await readdir(_('static'))){
        fs.copy(path.join(__dirname, 'static', file), path.join(__dirname, 'dist', file));
    }
})();