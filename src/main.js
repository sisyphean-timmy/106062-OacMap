import Vue from 'vue'
import App from './App.vue'
import 'normalize.css'

// ELEMENT UI LIB
import { Element } from 'element-ui'
import './element-variables.scss'
import locale from 'element-ui/lib/locale/lang/zh-TW'
Vue.use(Element, { locale })

// FONTAWESOME SETUP
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(fas, fab, far)
Vue.component('font-awesome-icon', FontAwesomeIcon)

// VUEX
import store from './store'

const { Dialog, Drawer } = Element
Vue.prototype.$drawer = ({ props = {}, on = {} }) => {
    let vm = null
    return {
        open: (child, childOpts = {}) => {
            vm = new Vue({
                render: h => h(Drawer, {
                        props: Object.assign(props, {
                            visible: true,
                            appendToBody: true,
                            direction: "rtl",
                            destroyOnClose: true
                        }),
                        on: {
                            "close": () => vm.$destroy()
                        }
                    }, [h(child, childOpts), h("h2", { slot: "title" }, props.title)]) // overwrite default title
            }).$mount()
            document.body.appendChild(vm.$el)
        },
        close: () => {
            vm.$destroy()
        }
    }
}
Vue.prototype.$dialog = ({ props = {}, on = {}, ...args }) => {
    let vm = null
    return {
        open: (child, childOpts = {}) => {
            vm = new Vue({
                render: h => h(Dialog, {
                    props: Object.assign(props, {
                        destroyOnClose: true,
                        visible: true,
                        showClose: true,
                        appendToBody: true,
                        center: true
                    }),
                    on: {
                        "close": () => vm.$destroy()
                    },
                    ...args
                }, [h(child, childOpts)])
            }).$mount()
        },
        close: () => {
            vm.$destroy()
        }
    }
}

Vue.config.productionTip = false
new Vue({
    store,
    render: h => h(App),
}).$mount('#app')