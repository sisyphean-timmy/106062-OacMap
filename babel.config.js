/**
 * 
 * drop conosle env = prod
 * @see https://segmentfault.com/a/1190000019099641
 * @see https://forum.vuejs.org/t/remove-console-logs-from-production-buils/39327
 * 
 */

const plugins = ["@vue/babel-plugin-transform-vue-jsx"]
if (process.env.NODE_ENV === 'production') {
    plugins.push("transform-remove-console")
}

module.exports = {
    presets: [
        '@vue/app'
    ],
    plugins: plugins
}