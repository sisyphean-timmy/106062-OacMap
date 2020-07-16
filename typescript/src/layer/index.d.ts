/**
 * ! leaflet 基類原型 UML
 * @see https://leafletjs.com/examples/extending/class-diagram.html
 * 
 * 
 * 1. 圖層: 依據各種圖層的不同實現方式會生成 特定的 Dom: Svg or Canvas
 * 並被放到 Pane 窗格中 DOM 並且具有預設順序
 * @see https://leafletjs.com/reference-1.6.0.html#map-mappane
 * 
 * 2. 型別: 依據 leaflet UML 宣告新型別 混入自定義屬性
 * 
 */

/** 自定義圖層屬性 */
interface layer {
    id:string
    title:string
    name:string
    type:string
    catelog:Array<{label:string,value:string}>
    tag:Array<string>
    visible?:boolean
    opacity?:number
    imgUrl?:string
    legendRGBStr?:string
    icon?:string
    dataSet?:string
}

/**
 * 統一化屬性
 */
interface IQueryResult{
    layerId:layer["id"]
    layerTitle:layer["title"]
    layerCatelog:layer["catelog"]
    tag:layer["tag"]
    dataId: string
    data:any
    goTo:(option:L.FitBoundsOptions)=>void
}

/**
 * TileLayer 繼承自 GridLayer>Layer
 */
type tileLayer = layer&L.TileLayer

/**
 * Geojson 繼承自 FeatureGroup->LayerGroup->Layer
 */
type geoJsonLayer = layer&L.GeoJSON

/**
 * 所有一般圖層集合
 */
type normalLayerCollection = Array<(L.Layer&layer)|tileLayer|geoJsonLayer>

/**
 * 所有底圖圖層集合
 */
type baseLayerColletion = Array<(L.Layer&layer)|tileLayer|geoJsonLayer>