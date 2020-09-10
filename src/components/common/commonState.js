// 取得 QUERY STRING
// let url = new URL(window.location.href)
// const loc = url.searchParams.get('loc')
// const latLngZArr = loc ? loc.split(",") : []
// const LATI = latLngZArr[0]
// const LONG = latLngZArr[1]
// const ZOOM = latLngZArr[2]

export default {
    namespaced: true,
    state: {
        // 螢幕尺寸紀錄狀態
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        // 圖層、查詢結果 側邊欄卡片 開啟/關閉 狀態
        layerCardVisible: false,
        resultCardVisible: false,
        // 主題 紀錄之狀態
        activedSubject: "海域遊憩活動一站式資訊平臺",
        currentTag: "",
        // subjects: [{
        //         label: "海域遊憩活動一站式資訊平臺",
        //         desc: "整合所有海域相關資訊: 海象、 遊憩景點、 港阜範圍 生態保護區， 等",
        //         value: ["tourism", "facility", "situation", "law"], // ts layer 中定義
        //     },
        //     {
        //         label: "遊憩資訊",
        //         desc: "遊憩景點相關分類之資訊，應注意之項目相關規定說明等",
        //         value: ["tourism", "facility"],
        //     },
        //     {
        //         label: "海域管制與法令",
        //         desc: "海域範圍限制活動、需申請項目、禁止採捕與否、違規罰則等",
        //         value: ["law"],
        //     },
        //     {
        //         label: "海情資訊",
        //         desc: "遊憩景點相關分類之資訊，時間性海象觀測資訊",
        //         value: ["situation"],
        //     },
        // ],
        /** windy iframe embed */
        windyOption: {
            visible: false,
            location: ''
        },
        /** GA 統計資料 https://www.leica.com.tw/OacTwGA_Hangfire/ocatwgatotalpageviews.json */
        GACount: {
            pageviews: 0,
            users: 0
        }
    },
    actions: {
        initBeforeMapMounted: async(context, componentContext) => {
            console.log("[common/common/initBeforeMapMounted]")
            window.addEventListener('resize', () => {
                context.commit("UPDATE_WINDOW_SIZE", { width: window.innerWidth, height: window.innerHeight })
            })
        },
        initAfterMapMounted: async(context, componentContext) => {
            await context.dispatch("getGACount")
        },
        getGACount: async context => {
            try {
                const res = await (await fetch("https://ocean.taiwan.gov.tw/OacGA_HF/ocatwgatotalpageviews.json")).json()
                context.commit("SET_GA_COUNT", res)
            } catch (e) {
                console.error(e)
                throw (e)
            }
        }
    },
    mutations: {
        /** 更新 視窗寬度 */
        UPDATE_WINDOW_SIZE: (state, payload) => {
            Object.keys(payload).forEach(k => {
                if (k.match(/width/ig)) {
                    state.screenWidth = payload[k]
                }
                if (k.match(/height/ig)) {
                    state.screenHeight = payload[k]
                }
            })
        },
        /** 側邊欄狀態變更 */
        SET_CARD_VISIBLE: (state, { key, bool }) => state[`${key}CardVisible`] = bool,
        OPEN_RESULT_CARD: (state) => {
            state.layerCardVisible = false
            state.resultCardVisible = true
        },
        /** windy 氣象資料是否使用 */
        SET_WINDY_OPTION: (state, { visible, location = '' }) => {
            if (visible !== undefined) {
                state.windyOption.visible = visible
            }
            state.windyOption.location = location || state.windyOption.location
        },
        /** 主題變更 */
        CHANGE_SUBJECT: (state, subject) => state.activedSubject = subject,
        /** 主題標籤變更 */
        SET_CURRENT_TAG: (state, tag) => state.currentTag = tag,
        /** 統計人次 */
        SET_GA_COUNT: (state, payload) => state.GACount = payload
    },
    getters: {
        state: state => key => state[key],
        isMobile: state => state.screenWidth < 576,
        isAndroid: state => {
            const u = navigator.userAgent
            return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
        },
        isIOS: state => !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
        windyOption: state => state.windyOption
    }
}