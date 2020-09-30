export default {
    namespaced: true,
    state: {
        layer: [],
        baseLayer: [],
        // 已啟用的天氣圖層的包含的時間陣列
        activedWeatherLyr: {
            id: '',
            times: []
        },
        // 圖例
        legend: {
            label: "",
            colorScaleLabel: [],
            colorScaleValue: [],
        }
    },
    actions: {},
    mutations: {
        /**
         * 快照狀態 圖層狀態
         * @overload
         * @param {object} payload 圖層屬性(複數) | 加入(unshift)
         * @param {array} payload 圖層屬性(單數)| 覆蓋
         */
        SNAPSHOT_RAW_LAYER: (state, { type, payload }) => {
            if (typeof payload !== 'object') {
                new TypeError('SNAPSHOT_RAW_LAYER(params) : params expected object|Array got ' + typeof payload)
                throw ('加入圖層失敗')
            }
            if (Array.isArray(payload)) {
                state[type] = payload
            } else {
                state[type].unshift(payload)
            }
        },
        /**
         * 更新一般圖層屬性
         * @param {string} id
         * @param {object} payload 已定義的欲更新之圖層屬性
         */
        UPDATE_LAYER_OPTIONS: (state, { id, payload }) => {
            try {
                let ptr = state['layer'].find(l => l.id === id)
                Object.keys(payload).forEach(k => {
                    if (k === 'opacity') { //- 檢查透明度數值
                        ptr[k] = payload[k] > 1 ? payload[k] / 100 : payload[k]
                    } else {
                        ptr[k] = payload[k]
                    }
                })
            } catch (e) {
                throw new Error(e)
            }
        },
        /**
         * 更新底圖圖層屬性
         * @param {string} id
         * @param {object} payload 已定義的欲更新之圖層屬性
         */
        UPDATE_BASELAYER_OPTIONS: (state, { id, payload }) => {
            try {
                /** 底圖屬性的 更新 只作用在 "可見的圖層" */
                if (Object.keys(payload).indexOf('visible') > -1) {
                    state['baseLayer'].forEach(bLyr => bLyr.visible = bLyr.id === id)
                    delete payload['visible']
                }
                //- 找到當前 可見的底圖
                let ptr = state['baseLayer'].find(bLyr => bLyr.visible)
                Object.keys(payload).forEach(k => {
                    if (k === 'opacity') { //- 檢查透明度數值
                        ptr[k] = payload[k] > 1 ? payload[k] / 100 : payload[k]
                    } else {
                        ptr[k] = payload[k]
                    }
                })
            } catch (e) {
                throw new Error(e)
            }
        },
        /** 紀錄啟用的氣象圖層資訊 */
        SET_ACTIVED_WEATHER_DATA: (state, { id, times = [], legend = {} }) => {

            // 時間資訊
            state.activedWeatherLyr.id = id
            const t = state.activedWeatherLyr.times
            t.splice(0, t.length, ...times)

            // 圖例資訊
            const LL = state.legend.colorScaleLabel
            const LC = state.legend.colorScaleValue

            state.legend.label = legend.label || ""
            const P_LL = legend.colorScaleLabel || []
            const P_LC = legend.colorScaleValue || []
            LL.splice(0, LL.length, ...P_LL)
            LC.splice(0, LC.length, ...P_LC)

        }
    },
    getters: {
        /** 可排序的圖層 */
        sortableLayer: (state, getters , rootGetters) => {
            return state.layer.filter(l => {
                const { value } = rootGetters.currentTag
                return /filelayer|geojson/ig.test(l.type) && (value ? (l.tag || []).indexOf(value) > -1 : true)
            })
        },
        /** 預報 */
        weatherLayer: (state, getters , rootGetters) => {
            const wl = state.layer.filter(l => {
                const { value } = rootGetters.currentTag
                return /heatmap|velocity|gradient/ig.test(l.type) && (value ? (l.tag || []).indexOf(value) > -1 : true)
            })
            // mixin icon
            const ICON_ENUM = {
                "風":"wind",
                "海":"water",
                "船":"ship",
                "波浪":"wave-square",
                "溫度":"thermometer-quarter",
                "高度":"ruler-vertical",
                "風險|潛勢":"exclamation-triangle",
                "鹽度":"tachometer-alt"
            }
            // mixin icon
            return wl.map(({title,...args})=>{
                let icon = "cloud-sun-rain"
                for (const k of Object.keys(ICON_ENUM)) {
                    if(new RegExp(k,"g").test(title)) icon = ICON_ENUM[k]
                }
                return {title,...args, icon}
            })
        },
        /** 點狀 */
        pointerLayer: (state, getters, rootGetters) => {
            return state.layer.filter(l => {
                const { value } = rootGetters.currentTag
                return /cluster|mark/ig.test(l.type) && (value ? (l.tag || []).indexOf(value) > -1 : true)
            })
        }
    }
}