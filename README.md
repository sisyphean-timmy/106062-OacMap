## 海域遊憩活動一站式資訊平臺

## Project setup
```
npm install
```

> 暫時需手動將 `typescript/src/leafletVelocityReverse.js` 放到 `node_modules/leaflet-velocity/dist`

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles Typescript
```
tsc -w
```

### Compiles and minifies for production
```
npm run build
```

### [產生圖示](https://www.npmjs.com/package/pwa-asset-generator) 
* 將 `npm run serve` 或 `npm run build` 後 console 輸出的`<head>`內容 貼到 `public/index.html`
* 手動指定輸出，需配合 `vue.config.js` 設定 `manifest.json` icon
```
pwa-asset-generator [icon-src-path] [icon-output-path]
```

#### ./typescript
* `typescript/layerDef` 靜態圖資定義
* `typescript/init` 初始化 leaflet 方法
* `typescript/layer` leaflet 圖層方法

#### ./src
* `src/main.js` 配置 Vue 中所需引用
* `src/store.js` Vuex 狀態配置，會自動匹配 `./components` 中任意資料夾 的 `*.js` ( Vuex 狀態 )，並以該資料夾作為狀態命名空間
* `src/registerServiceWorker.js` Vue CLI 提供之 PWA service worker (未使用)
* `src/custom.scss` 訂定樣式 及 主題顏色變數 等
* `src/element-variables.scss` ELEMENT UI 樣式調整重寫

#### ./components
* `components/common` 共用組件及狀態
* `components/layer` 圖層組件 及 快照狀態
    * 快照:只記錄地圖實例中圖層的部分屬性 不包含全部屬性
    * 全部屬性在 `typescript/layer` 內維持
* `components/result` 查詢結果組件及狀態

#### Other
* [leaflet TS、ES MODULE](https://cli.vuejs.org/config/)
* [leaflet UML](https://leafletjs.com/examples/extending/class-diagram.html)

#### Todo 
- [x] [leaflet velocity](https://github.com/linghuam/ocean-weather) 合併修改套件到專案 或 改用其他方式(canvas)製作
- [X] windy API add
- [X] layer state : 氣象等動態圖層 獨立保存
