## 海域遊憩活動一站式資訊平臺

## Project setup
```
npm install
```

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

### PWA & Vu.config.js(webpack) Settings
* 使用 workbox (injectManifest) [workbox api](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin) 取得預緩存清單
* 圖標素材 及 `manifest.json` 使用 `FaviconsWebpackPlugin`，`publicPath`影響會注入到`html <head>`的路徑
* `./src/sw-manifest.js` workbox-webpack-plugin 會替換內容中 `self.__WB_MANIFEST` 為預緩存清單
* `./src/sw.js` 工作線程，使用`copy-webpack-plugin`複製、注入以 `git-describe` 產生的 cahce Name (含版本號)
* 基於 workbox [workbox cli](https://letswrite.tw/pwa-workbox-cli/)
* 基於 workbox [workbox api](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)

#### ./public/layerDef
#### ./public/layerDef
#### ./public/layerTag

#### ./typescript
* `typescript/init` leaflet map 初始化 
* `typescript/layer` leaflet layer 圖層及擴展

#### ./src
* `src/main.js` 配置 Vue 引用模塊等
* `src/store.js` Vuex 狀態配置 : 自動匹配 `./components` 中任意資料夾的 `*.js` 作為狀態，並以路徑的資料夾名稱做為狀態的命名空間
* `src/sw.js` service worker主程式, 匯入workbox打包後的檔案列表`sw-manifest.js`, 並存入快取, (目前)其他資源直接bypass
* `src/custom.scss` 主題顏色變數、全局樣式
* `src/element-variables.scss` ELEMENT UI 樣式
* `./src/assets/legend.json`
    * `layerName:string` 圖層名稱正規字串
    * `label:string` 標籤名稱+單位
    * `type:"color"|"text"`
        * `colorScaleLabel` 顏色尺度-數值(降冪)
        * `colorScaleValue` 顏色尺度-顏色(降冪)
    * `type:"text"`
    * `colorScaleName` 顏色尺度 對應文字(不限排序)

#### ./components
* `components/common` 共用組件及狀態
* `components/layer` 圖層組件 及 快照狀態(只記錄地圖實例中圖層的部分屬性)
* `components/result` 查詢結果組件及狀態

#### ./public
* 這邊的東西會直接複製到`dist/`
* `public/layerDef.json` 要載入的圖層設定
* `public/layerTag.json` 圖層標籤設定
* `public/layerCatelog.json` 圖層分類設定

#### 其他
* [leaflet TS、ES MODULE](https://cli.vuejs.org/config/)
* [leaflet UML](https://leafletjs.com/examples/extending/class-diagram.html)
* 緩存圖磚[地圖相關PWA專案範例](https://github.com/reyemtm/pwa-maps)
* [esri-leaflet 可載入 arcgis 圖層](http://esri.github.io/esri-leaflet)
* [unsafely-treat-insecure-origin-as-secure](https://stackoverflow.com/questions/40696280/unsafely-treat-insecure-origin-as-secure-flag-is-not-working-on-chrome)

#### MEMO

- [X] top-right buttons is strange 
- [X] isoheStation.vue : make chart in each item
- [X] custom mark's popup dom from `markClick` event in `app.vue` ( check unbind event )
- [X] scss in typescript : `declare module.*scss`
- [X] top area for alert messages ( typhoon alert、 offline msg ...etc ? )
- [X] top notify bar : typhoon and check typhoon data format ; add typhoon alert msg `backend/index.js` has converted `.kml` in `.kmz` to `.geojson` ; `typescript/layer/fileLayer.ts`'s dependency `leaflet-filelayer`line:214 `_convertToGeoJSON()` not convert File to string for dependency which used in the parser
``` js
const loader = L.FileLayer.fileLoader(...)
loader.loadData(file ,"filename.kmz") // file in leaflet-filelayer wasn't converted string
// change leaflet-filelayer`line:214
_convertToGeoJSON: function _convertToGeoJSON(content, format) {
    return new Promise((res,rej)=>{
        content.text().then(str=>{
            const parsed = (new window.DOMParser()).parseFromString(str, 'text/xml')
            // Format is either 'gpx' or 'kml'
            const geojson = toGeoJSON[format](parsed);
            res(this._loadGeoJSON(geojson))
        })
    })
}
```
