import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'

/**
 * 匹配 ./components 中任意資料夾 的 js(vuex state)
 * @see https://webpack.js.org/guides/dependency-management/#requirecontext
 */
const files = require.context("./components", true, /\.js$/)
const modules = {}
files.keys().forEach(key => {
    if (key.match(/\//g).length >= 2 && !(key.match(/asset/ig))) { // 排除 素材目錄
        modules[key.replace(/(\.\/|state|\.js)/ig, '')] = files(key).default // 去除路徑副檔名路徑符、state字串
    }
})

console.log("%c 狀態模組:", 'background:#bada55;color:#000', modules)

/** @see https://vuex.vuejs.org/zh/guide/plugins.html#%E5%86%85%E7%BD%AE-logger-%E6%8F%92%E4%BB%B6 */
const debug = process.env.NODE_ENV !== 'production'
const logger = createLogger({
    filter(mutation) {
        const filters = [
            "common/common/UPDATE_WINDOW_SIZE"
        ]
        return filters.indexOf(mutation.type) === -1
    }
})
Vue.use(Vuex)

const store = new Vuex.Store({
    strict: debug,
    plugins: debug ? [logger] : [],
    modules: modules
})

export default store;