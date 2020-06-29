const FaviconsWebpackPlugin = require('favicons-webpack-plugin')


module.exports = {
    configureWebpack: config => {},
    chainWebpack: config => {

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
                    start_url: "../../",
                    scope: "../../"
                }
            }])

        if (process.env.NODE_ENV === 'production') {
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            config.optimization.minimize(true);
            config.optimization.splitChunks({
                chunks: 'async'
            })
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