import Vue from 'vue'
import App from './App.vue'
import 'normalize.css'

// ELEMENT UI LIB
import Element from 'element-ui'
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

/** @see https://github.com/FortAwesome/vue-fontawesome#processing-i-tags-into-svg-using-font-awesome*/
import { dom } from '@fortawesome/fontawesome-svg-core'
dom.watch()

// VUEX
import store from './store'

import './registerServiceWorker'

Vue.config.productionTip = false


new Vue({
    store,
    render: h => h(App),
}).$mount('#app')
