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
        activedSubject: "海域整合資訊",
        subjects: [{
                label: "海域整合資訊",
                desc: "整合所有海域相關資訊: 海象、 遊憩景點、 港阜範圍 生態保護區， 等",
                value: ["tourism", "facility", "situation", "law"], // ts layer 中定義
            },
            {
                label: "遊憩資訊",
                desc: "遊憩景點相關分類之資訊，應注意之項目相關規定說明等",
                value: ["tourism", "facility"],
            },
            {
                label: "海域管制與法令",
                desc: "海域範圍限制活動、需申請項目、禁止採捕與否、違規罰則等",
                value: ["law"],
            },
            {
                label: "海情資訊",
                desc: "遊憩景點相關分類之資訊，時間性海象觀測資訊",
                value: ["situation"],
            },
        ],
        /** windy iframe embed */
        windyOption: {
            visible: false,
            location: ''
        },
        /** GA 統計資料 https://www.leica.com.tw/OacTwGA_Hangfire/ocatwgatotalpageviews.json */
        GACounter: {},
    },
    actions: {
        initBeforeMapMounted: async(context, componentContext) => {
            console.log("state initBeforeMapMounted")

            window.addEventListener('resize', () => {
                context.commit("UPDATE_WINDOW_SIZE", { width: window.innerWidth, height: window.innerHeight })
            })
        },
        initAfterMapMounted: async(context, componentContext) => {
            console.log("state initAfterMapMounted")
                // 若 query string 含 座標 則對此座標 查詢
                // if (LONG && LATI) {
                //     console.log("query string 含 座標 對此座標 查詢 !!")
                // }
        },
        getGACount: async context => {
            try {
                return await (await fetch("https://www.leica.com.tw/OacTwGA_Hangfire/ocatwgatotalpageviews.json")).json()
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
        CHANGE_SUBJECT: (state, subject) => state.activedSubject = subject
    },
    getters: {
        state: state => key => state[key],
        isMobile: state => state.screenWidth < 576,
        windyOption: state => state.windyOption
    }
}