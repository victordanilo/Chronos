const fs = require('fs-extra');
const SVGO = require('svgo');
const rollup = require('rollup');
const uglify = require('uglify-js');
const {promisify} = require('util');
const CleanCSS = require('clean-css');
const html = require('rollup-plugin-html');
const buble = require('@rollup/plugin-buble');
const replace = require('@rollup/plugin-replace');
const alias = require('@rollup/plugin-alias');
const {basename, dirname, join, resolve} = require('path');
const {version} = require('./vendor/uikit/package.json');
const banner = `/*! UIkit ${version} | https://www.getuikit.com | (c) 2014 - ${new Date().getFullYear()} YOOtheme | MIT License */\n`;

exports.banner = banner;
exports.validClassName = /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/;

exports.glob = promisify(require('glob'));

exports.read = async function (file, cb) {

    const data = await fs.readFile(file, 'utf8');
    cb && cb(data);
    return data;

};

exports.write = async function (dest, data) {
    const err = await fs.outputFile(dest, data);

    if (err) {
        console.log(err);
        throw err;
    }

    exports.logFile(dest);

    return dest;
};

exports.logFile = async function (file) {
    const data = await exports.read(file);
    console.log(`${exports.cyan(file)} ${exports.getSize(data)}`);
};

exports.getSize = function (data) {
    return `${(data.length / 1024).toFixed(2)}kb`;
};

exports.cyan = function (str) {
    return `\x1b[1m\x1b[36m${str}\x1b[39m\x1b[22m`;
};

exports.minify = async function (file) {

    const {styles} = await new CleanCSS({
        advanced: false,
        keepSpecialComments: 0,
        rebase: false,
        returnPromise: true
    }).minify([file]);

    await exports.write(`${join(dirname(file), basename(file, '.css'))}.min.css`, styles);

    return styles;

};

exports.uglify = async function (file) {
    file = join(dirname(file), basename(file, '.js'));
    return exports.write(
        `${file}.min.js`,
        uglify.minify(
            await exports.read(`${file}.js`),
            {output: {preamble: exports.banner}}
        ).code
    );
};

exports.compile = async function (file, dest, {external, globals, name, aliases, replaces, minify = true}) {

    name = (name || '').replace(/[^\w]/g, '_');

    const bundle = await rollup.rollup({
        external,
        input: `${resolve(dirname(file), basename(file, '.js'))}.js`,
        plugins: [
            replace(Object.assign({
                VERSION: `'${version}'`
            }, replaces)),
            alias({
                entries: Object.assign({
                    'uikit-util': './vendor/uikit/src/js/util/index.js'
                }, aliases)
            }),
            html({
                include: '**/*.svg',
                htmlMinifierOptions: {
                    collapseWhitespace: true
                }
            }),
            buble({namedFunctionExpressions: false})
        ]
    });

    let {output: [{code, map}]} = await bundle.generate({
        globals,
        format: 'umd',
        banner: exports.banner,
        amd: {id: `UIkit${name}`.toLowerCase()},
        name: `UIkit${exports.ucfirst(name)}`,
        sourcemap: !minify ? 'inline' : false
    });

    code = code.replace(/(>)\\n\s+|\\n\s+(<)/g, '$1 $2');

    return Promise.all([
        exports.write(`${dest}.js`, code + (!minify ? '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + Buffer.from(map.toString()).toString('base64') : '')),
        minify ? exports.write(`${dest}.min.js`, uglify.minify(code, {output: {preamble: exports.banner}}).code) : null
    ])[0];
};

exports.icons = async function (src) {
    const svgo = new SVGO({
        plugins: [
            {removeViewBox: false},
            {
                cleanupNumericValues: {
                    floatPrecision: 3
                }
            },
            {convertPathData: false},
            {convertShapeToPath: false},
            {mergePaths: false},
            {removeDimensions: false},
            {removeStyleElement: false},
            {removeScriptElement: false},
            {removeUnknownsAndDefaults: false},
            {removeUselessStrokeAndFill: false}
        ]
    });
    const files = await exports.glob(src, {nosort: true});
    const icons = await Promise.all(files.map(async file => {
        const data = await exports.read(file);
        const {data: svg} = await svgo.optimize(data);
        return svg;
    }));

    return JSON.stringify(files.reduce((result, file, i) => {
        result[basename(file, '.svg')] = icons[i];
        return result;
    }, {}), null, '    ');
};

exports.ucfirst = function (str) {
    return str.length ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};
