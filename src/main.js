// import { register } from 'register-service-worker'
// import './registerServiceWorker'
//TODO: Move to state to custom notification style ?
if ("serviceWorker" in navigator) {

    function listenForWaitingServiceWorker(reg, callback) {
        function awaitStateChange() {
            reg.installing.addEventListener('statechange', function() {
                if (this.state === 'installed') callback(reg.waiting);
            });
        }
        if (!reg) return;
        if (reg.waiting) return callback(reg.waiting);
        if (reg.installing) awaitStateChange();
        reg.addEventListener('updatefound', awaitStateChange);
    }

    //navigator.serviceWorker.addEventListener('controllerchange', function() {
    //	alert("有新版本!!  請重新整理");
    //	location.reload();
    //});
    if (navigator.serviceWorker.controller) {
        console.log("[PWA] active service worker found, no need to register");
        navigator.serviceWorker.getRegistration().then(function(reg) {
            console.log("[PWA] try update service worker");
            //reg.update();
            function promptUserToRefresh(sw) {
                var yn = confirm("有新版本!!  是否重新整理?"); // TODO: better way!!
                if (yn) {
                    sw.postMessage('skipWaiting');
                    location.reload();
                }
            }
            listenForWaitingServiceWorker(reg, promptUserToRefresh);
        });
    } else {
        // Register the service worker
        navigator.serviceWorker.register("sw.js", {
                scope: "./"
            })
            .then(function(reg) {
                console.log("[PWA] Service worker has been registered for scope: " + reg.scope);
            });
    }
}

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

// VUEX
import store from './store'

Vue.config.productionTip = false


new Vue({
    store,
    render: h => h(App),
}).$mount('#app')