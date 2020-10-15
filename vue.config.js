const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const { InjectManifest } = require('workbox-webpack-plugin')

const { gitDescribe, gitDescribeSync } = require('git-describe')
process.env.VUE_APP_GIT_HASH = gitDescribeSync().hash
process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_BUILDTIME = (new Date()).toISOString()
process.env.VUE_APP_BUILD = `v${process.env.VUE_APP_VERSION}-${process.env.VUE_APP_GIT_HASH}-${process.env.VUE_APP_BUILDTIME}`
const injectStr =
    `const ACACHE = 'acache-${process.env.VUE_APP_BUILD}';\n` +
    `const DCACHE = 'dcache-${process.env.VUE_APP_BUILD}';\n`;

module.exports = {
    configureWebpack: config => {},
    chainWebpack: config => {

        if (process.env.NODE_ENV === 'production') {
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            config.optimization.minimize(true);
            config.optimization.splitChunks({
                chunks: 'async'
            })

            config.plugin('InjectManifest')
                .use(InjectManifest, [{
                    swSrc: './src/sw-manifest.js',
                    compileSrc: false,
                    maximumFileSizeToCacheInBytes: 99999999
                }])

            config.plugin('sw-copy')
                .use(require('copy-webpack-plugin'), [
                    [{
                        from: 'src/sw.js',
                        to: 'sw.js',
                        transform(content, path) {
                            return injectStr + content;
                        },
                    }]
                ])

            config.plugin('FaviconsWebpackPlugin')
                .use(FaviconsWebpackPlugin, [{
                    inject: true,
                    cache: true,
                    devMode: 'webapp',
                    prefix: "./img/icons",
                    publicPath: "./",
                    logo: "./src/assets/logoOCA.png",
                    favicons: {
                        appName: "海域整合資訊",
                        appDescription: "海域遊憩活動一站式資訊平臺",
                        developerName: "詮華",
                        display: "fullscreen",
                        manifestRelativePaths: "./",
                        start_url: "./",
                        scope: "./"
                    }
                }])
        }
        config.module.rule('pug')
            .test(/\.pug$/)
            .use('pug-html-loader')
            .loader('pug-html-loader')
            .end()
        config.module.rule('worker')
            .test(/\.worker\.ts$/)
            .use('worker-loader')
            .loader('worker-loader')
            .end()
    },
    devServer: {
        disableHostCheck: true, // fix socket err
        writeToDisk: true
    },
    css: {
        loaderOptions: {
            sass: { // global style
                data: `@import "~@/custom.scss";`
            }
        }
    },
    publicPath: './',
}
