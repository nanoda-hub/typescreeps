const fs = require('fs')
const fsExtra = require('fs-extra')
const commonjs = require('@rollup/plugin-commonjs')
const copy = require('rollup-plugin-copy')
const typescript = require('rollup-plugin-typescript2')
const args = process.argv.slice(2)
const command = args[0]
const { rollup } = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve')

let config = require('./.secret.json')

async function run_rollup() {
    const plugins = [
        commonjs(),
        nodeResolve(),
        typescript({
            tsconfig: "tsconfig.json"
        })
    ]

    if (command === 'local') {
        if (!config || !config.local || !config.local.copyPath) {
            console.error('请在 .secret.json 中配置 local.copyPath');
            process.exit(1);
        }

        if (!fs.existsSync(config.local.copyPath)) {
            console.error(`目标路径 ${config.local.copyPath} 不存在`);
            process.exit(1);
        }

        console.log(`正在将文件复制到 ${config.local.copyPath}...`);

        plugins.push(copy({
            targets: [
                {
                    src: 'dist/main.js',
                    dest: config.local.copyPath
                },
                {
                    src: 'dist/main.js.map',
                    dest: config.local.copyPath,
                    rename: name => name + ".map.js",
                    transform: contents => `module.exports = ${contents.toString()};`
                }
            ],
            verbose: true,
            hook: "writeBundle",
        }))
    }

    const bundle = await rollup({
        input: 'src/main.ts',
        plugins: plugins,
    })

    await bundle.write({
        file: 'dist/main.js',
        format: 'cjs',
        sourcemap: true
    })
}

function output_clean() {
    for (const dir of ['dist']) {
        fsExtra.emptyDirSync(dir)
    }
}

async function run() {
    output_clean()
    await run_rollup()
}

run().catch(console.error)
