const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
//const { InjectManifest } = require('workbox-webpack-plugin');
const bundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const fs = require('fs');

const ENV = "https://ocean.taiwan.gov.tw"


const {gitDescribe, gitDescribeSync} = require('git-describe');
process.env.VUE_APP_GIT_HASH = gitDescribeSync().hash
process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_BUILDTIME = (new Date()).toISOString()
process.env.VUE_APP_BUILD = `v${process.env.VUE_APP_VERSION}-${process.env.VUE_APP_GIT_HASH}-${process.env.VUE_APP_BUILDTIME}`

module.exports = {
    /** @see https://cli.vuejs.org/core-plugins/pwa.html#configuration */
    pwa: {
        name: '海洋遊憩整合資訊平台',
        themeColor: '#0b4873',
        msTileColor: '#F5F7FA',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        manifestOptions: {
            icons: [{
                    "src": "./img/icon/manifest-icon-192.png",
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "maskable any"
                },
                {
                    "src": "./img/icon/manifest-icon-512.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "maskable any"
                }
            ]
        },
        iconPaths: {
            favicon32: './img/icon/manifest-icon-192.png',
            favicon16: './img/icon/manifest-icon-192.png',
            appleTouchIcon: './img/icon/manifest-icon-192.png',
            maskIcon: './img/icon/manifest-icon-192.png',
            msTileImage: './img/icon/manifest-icon-192.png'
        },
        /** configure the workbox plugin @see https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-window.Workbox */
        /*workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            // InjectManifest 模式中 swSrc 屬性必須指定 sw 位置
            swSrc: 'public/sw.js',
        }*/
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            importWorkboxFrom: 'disabled',
            swSrc: 'src/sw-manifest.js',
        }
    },
    configureWebpack: config => {

        /** webpack chunk 分析輸出 */
        config.plugins.push(new bundleAnalyzer({
            analyzerMode: "static", // 將分析結果以 HTML 格式儲存
            reportFilename: "report.html", // 分析結果存放位置 ( default output.path + "/report.html")
            openAnalyzer: false // Webpack 執行完畢後，是否用瀏覽器自動開啟
        }))

        /**
         * VUE CLI PWA support 本身設計並不允許在生產模式使用 service worker 
         * @see https://www.npmjs.com/package/@vue/cli-plugin-pwa
         * 但為方便調試仍於此加入相同的 (InjectManifest)workbox 
         * 參考(\node_modules\@vue\cli-plugin-pwa)
         * @see https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest
         */
        /*if (process.env.NODE_ENV !== 'production') {
            config.plugins.push(
                new InjectManifest({
                    swSrc: 'public/sw.js',
                    exclude: [
                        /\.map$/,
                        /img\/icons\//,
                        /favicon\.ico$/,
                        /^manifest.*\.js?$/
                    ]
                })
            )
        }*/
    },
    chainWebpack: config => {

        config.plugin('copy')
            .before('sw-copy').end()

        config.plugin('pwa')
            .after('sw-copy').end()

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

	const injectStr =
            `const ACACHE = 'acache-${process.env.VUE_APP_BUILD}';\n` +
	    `const DCACHE = 'dcache-${process.env.VUE_APP_BUILD}';\n`;
        config.plugin('sw-copy')
            .before('pwa')
            .use(require('copy-webpack-plugin'), [[{
              from: 'src/sw.js',
              to: 'sw.js',
              transform(content, path) {
                return injectStr + content; //Promise.resolve(optimize(content));
              },
          }]]).end()


    },
    devServer: {
        /** 自簽SSL證書 */
        https: true,
        key: fs.readFileSync('./cert/server.key'),
        cert: fs.readFileSync('./cert/server.crt'),
        disableHostCheck: true,
        /** 代理 */
        // secure: true, // https 接口
        // changeOrigin: true, // 包含域名
        // pathRewrite:{} // 重寫路由
        proxy: {
            '/OpenData': {
                target: ENV + '/OpenData/',
                pathRewrite: {
                    '^/OpenData': ''
                }
            },
            '/OpenDataTmp': {
                target: ENV + '/OpenDataTmp/',
                pathRewrite: {
                    '^/OpenDataTmp': ''
                }
            }
        }
    },
    css: {
        /** 混入全局 SCSS */
        loaderOptions: {
            sass: {
                data: `@import "~@/custom.scss";`
            }
        }
    },
    publicPath: './',
}
