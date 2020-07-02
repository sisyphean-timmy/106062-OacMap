
import * as layerDef from "../layerDef.json"
import * as layerIcon from "../layerIcon.json"

const uuidv4:()=>string = require('uuid/v4')

import * as leaflet from 'leaflet'
// import * as leafletESRI from "esri-leaflet"  // esri 插件可擴充來載入 arcgis 服務之圖層

const leafletPip:ILeafletPip = require("@mapbox/leaflet-pip") // leafletPip

/** TODO: check proj reverse */
import "leaflet-velocity/dist/leafletVelocityReverse" // leaflet.velocityLayer

import "leaflet.markercluster" // leaflet.MarkerClusterGroup
import "proj4leaflet"
import "leaflet-geometryutil"
require("leaflet-filelayer")()
import { Init } from '../init/init';
import {CanvasLayer as test} from "../velocity/velocity"
/**
 * 熱力圖
 * https://github.com/Leaflet/Leaflet.heat
 */

const CATELOGS = [{
    catelog:{
        label:"遊憩",
        value:"tourism"
    },
    layer:[
        "娛樂漁業漁船資料",
        "開放垂釣之漁港",
        "漁村旅遊資訊",
        "商港垂釣區資訊",
        "觀光景點資訊",
        "熱門潛點資訊",
        "水域遊憩範圍",
        "海域遊憩保險商品",
        "民眾關心點"
    ]
},
{
    catelog:{
        label:"設施",
        value:"facility"
    },
    layer:[
        "遊艇泊位統計",
        "濱海國家公園公共服務設施資訊"
    ]
},
{
    catelog:{
        label:"海情",
        value:"situation"
    },
    layer:[
        "雷達整合回波圖",
        "自動氣象站",
        "自動雨量站",
        "海流",
        "風場",
        "漁業氣象資料",
        "颱風通知",
        "潮汐",
        "全國海洋資料庫",
        "遊憩海域安全動態資訊監測網",
        "商港海象觀測站",
        "氣象與浮標站",
        "水產動植物繁殖保育區",
        "人工魚礁區及保護礁區",
        "港區範圍",
        "定置漁場",
        "養殖箱網",
        "臺灣地區漁港資料",
        "科技部海洋學門資料庫",
        "河川水質監測",
        "OCM海流",
        "NWW3波浪",
    ]
},{
    catelog:{
        label:"法令",
        value:"law"
    },
    layer:[
        "水產動植物繁殖保育區",
        "沿海一般保護區",
        "沿海自然保護區",
        "人工魚礁區及保護礁區",
        "海上平台設置範圍",
        "水域遊憩範圍",
        "漁港商港公告釣點",
        "港區範圍",
    ]
}]

export class Layer {
    
    InitIns:Init
    
    // 保存上一次 highLight path
    private _lastHighLightPathCollection:Array<{
        path:Path
        lastStyle:L.PathOptions
    }> = new Array()

    //! 維持 Colletion 狀態
    private _baseLayerColletion:baseLayerColletion = new Array()
    private _normalLayerCollection:normalLayerCollection = new Array()
    
    getNormalLayers():Array<layer>{
        return this._normalLayerCollection.map(l=>({
            type:l.type,
            title:l.title,
            name:l.title,
            id:l.id,
            icon:l.icon,
            dataSet: l.dataSet,
            opacity:l.opacity,
            visible:l.visible,
            legendRGBStr:l.legendRGBStr||"145,145,145",
            catelog:l.catelog
        })).reverse()
    }

    getBaseLayers():Array<layer>{
        return this._baseLayerColletion.map(l=>({
            type:l.type,
            id:l.id,
            title:l.title,
            name:l.title,
            dataSet: l.dataSet,
            opacity:l.opacity,
            visible:l.visible,
            imgFileName:l.imgUrl,
            catelog:l.catelog
        })).reverse()
    }

    getLayerById(lyrId:string){
        return this._normalLayerCollection.find(l=>l.id === lyrId)
    }

    constructor(InitIns:Init){
        this.InitIns = InitIns
    }

    async addFileLayer(f,o):Promise<layer>{
        
        console.log("options",o)

        const style = {
            color:o.style.color.hex,
            fillOpacity:o.style.color.a*0.8
        }

        /** TODO:建立叢集圖層 */
        const pointToLayer = (feature, latlng)=>leaflet.circleMarker(latlng, {...{radius: 5},...style})

        const loader = leaflet.FileLayer.fileLoader(
            this.InitIns.map,{
                layerOptions:{
                    style:style,
                    pointToLayer:pointToLayer
                },
                addToMap: false,
                fileSizeLimit:  999999
            }
        )

        try{

            loader.load(f)

            const res = await new Promise((res,rej)=>{
                loader.on("data:loaded", e=>res(e))
                loader.on("data:error", e=>rej(e))
            }) as any
            
            let lyr = res.layer as geoJsonLayer
            lyr.addTo(this.InitIns.map)
            console.log("fileLayer", lyr)

            lyr.id = uuidv4()
            lyr.visible = true
            lyr.title = o.name
            lyr.opacity = o.style.color.a
            lyr.type = "filelayer"
            lyr.catelog = [{
                label:"自訂",
                value:"filelayer"
            }]

            this._normalLayerCollection.push(lyr)
            return {
                type:lyr.type,
                title:lyr.title,
                name:lyr.title,
                id:lyr.id,
                opacity:lyr.opacity,
                visible:lyr.visible,
                legendRGBStr:`${o.style.color.rgba.r},${o.style.color.rgba.g},${o.style.color.rgba.b}`,
                catelog:lyr.catelog
            }

        }catch(e){
            console.error("file layer load err")
            throw(e)
        }

    }

    async addDefault():Promise<void>{
        this._addBaseLayerFromDef()
        await this._addLayerFromDef()
    }
    
    /** 設置圖層集合中透明度 */
    setOpacity(id:string,o:number){

        o = o>1 ? o/100 : o // 百分比轉小數
        
        let bl = this._baseLayerColletion.find(l=>l.id === id)
        let nl = this._normalLayerCollection.find(l=>l.id === id)
        let resultLayer = bl || nl

        if(resultLayer instanceof L.GeoJSON){
            resultLayer.setStyle({
                // opacity:o,
                fillOpacity:o,
            })
        }else if(resultLayer instanceof L.TileLayer){
            resultLayer.setOpacity(o)
        }else{
            console.error("unSupported Layer Type : ",resultLayer)
        }
        
    }
    
    /** 設置一般圖層集合中圖層的樣式 */
    setStyle(id:string,style: leaflet.PathOptions){
        let ptr = this._normalLayerCollection.find(l=>l.id === id) as geoJsonLayer
        if(!ptr) console.error(`一般集合中找不到 id 為 ${id} 的 geojson layer`)
        ptr.setStyle({
            color:style.color,
            fillColor:style.color,
        })
    }

    /**
     * 設置圖層集合中圖層的可見度
     * @param id 依ID切換可視
     * @param bool? 若不給只開指定ID的圖層
     */
    setVisible(id:string,bool:boolean)
    setVisible(id:string,bool:undefined)
    setVisible(id:string,bool:any){
        if(bool === undefined){
            this._baseLayerColletion.forEach(l=>{
                if(l.id === id && !this.InitIns.map.hasLayer(l)){
                    l.addTo(this.InitIns.map)
                    l.visible = true
                }else{
                    this.InitIns.map.removeLayer(l)
                    l.visible = false
                }
            })
        }else{
            let nl = this._normalLayerCollection.find(l=>l.id === id)
            if(!nl) return
            if(bool){
                if(!this.InitIns.map.hasLayer(nl)){
                    nl.addTo(this.InitIns.map)
                    nl.visible = true
                }
                // 重排序 : 因移除後重新加回會使目標圖層跑至地圖最上，集合中紀錄的索引位置才是其原本真正位置
                this._normalLayerCollection.forEach(l=> 'bringToFront' in l && l.bringToFront())
            }else{
                if(this.InitIns.map.hasLayer(nl)){
                    this.InitIns.map.removeLayer(nl)
                    nl.visible = false
                }
            }
        }
    }

    /** bringToBack()最底、bringToFront()最頂 */
    reorderNormalLayer(id:string,oldIndex:number,newIndex:number){
        
        // 取得的新舊索引需反轉(視圖為反轉的)
        let rvNewIndex = this._normalLayerCollection.length-1-newIndex
        let rvOldIndex = this._normalLayerCollection.length-1-oldIndex
        console.log("rvNewIndex",rvNewIndex)
        console.log("rvOldIndex",rvOldIndex)

        // 偏移 <0 往下 >0 往上
        let offset = rvNewIndex-rvOldIndex
        console.log("offset", offset)

        // 要移動的目標
        let ptr = this._normalLayerCollection[rvOldIndex]
        if(!(ptr instanceof L.TileLayer) && !(ptr instanceof L.GeoJSON)) return

        if(offset>0){
            ptr.bringToFront() // 會使目標移到最前
            // 計算 出從原索引到新索引間的圖層，並反序使用 bringToFront 逐個移至最上 使目標回到正確索引
            for (let index = this._normalLayerCollection.length-1; index > rvNewIndex; index--) {
                const l = this._normalLayerCollection[index]
                "bringToFront" in l && l.bringToFront()
            }

            // 依偏移量逐個交換，以更新用來記錄的集合
            let cnt = rvOldIndex
            for (let index = 0; index <Math.abs(offset); index++) {
                // console.log(`swap ${temp}-${temp+1}`)
                let ptr = this._normalLayerCollection[cnt]
                this._normalLayerCollection[cnt] = this._normalLayerCollection[cnt+1]
                this._normalLayerCollection[cnt+1] = ptr
                cnt += 1
            }
        }else if(offset<0){
            
            ptr.bringToBack() // 會使目標移到最後
            // 計算 出從原索引到新索引間的圖層，並反序使用 bringToFront 逐個移到最後 使目標回到正確索引
            for (let index = this._normalLayerCollection.length-1; index >= 0; index--) {
                const l = this._normalLayerCollection[index]
                if(index<rvNewIndex){
                    "bringToBack" in l && l.bringToBack()
                }
            }

            // 依偏移量逐個交換，以更新用來記錄的集合
            let cnt = rvOldIndex
            for (let index = 0; index <Math.abs(offset); index++) {
                // console.log(`swap ${cnt}-${cnt-1}`)
                let ptr = this._normalLayerCollection[cnt]
                this._normalLayerCollection[cnt] = this._normalLayerCollection[cnt-1]
                this._normalLayerCollection[cnt-1] = ptr
                cnt -= 1
            }
        }

        console.log("after reorder:", this._normalLayerCollection.map(l=>l.title).reverse())
        
    }

    /** 取得給定點 latlng 之下的所有圖層，並且高亮 */
    queryByLatLng(LatLng:L.LatLng):Array<IQueryResult>{

        this.deHighLightPath() // 高亮初始化
        let result:Array<IQueryResult> = new Array()

        this._normalLayerCollection.forEach(l=>{

            if(!l.visible) return // 略過不可見圖層
            if(!(l instanceof L.GeoJSON)){
                console.error("contains unsupport layer type :", l)
                return
            } 

            /** polygon test */
            let pathCollection = leafletPip.pointInLayer([LatLng.lng, LatLng.lat],l)
            
            l.getLayers().forEach((path:unknown)=>{
                /** polyine test */
                if(path instanceof L.Polyline){
                    path.getLatLngs().forEach(t=>{
                        let cnt = 0
                        while(t[cnt+1]){
                            if(!(t[cnt] instanceof L.LatLng)) break
                            if(leaflet.GeometryUtil.belongsSegment(LatLng, t[cnt], t[cnt+1])) {
                                pathCollection.push(path)
                                break 
                            }
                            cnt++
                        }
                    })
                }
                /** circleMarker test */
                if(path instanceof L.CircleMarker){
                    let pathLatlng = path.getLatLng()
                    let p1 = leaflet.CRS.EPSG3857.latLngToPoint(pathLatlng, this.InitIns.map.getZoom())
                    let p2 = leaflet.CRS.EPSG3857.latLngToPoint(LatLng, this.InitIns.map.getZoom())
                    if(leaflet.GeometryUtil.length([p1,p2]) <= path.getRadius()){
                        pathCollection.push(path)
                    }
                }
            })
            
            if(!pathCollection.length){
                console.log("click hit nothing")
                return
            }
            
            pathCollection.forEach(path=>{
                result.push({
                    layerId:l.id,
                    layerTitle:l.title,
                    layerCatelog:l.catelog,
                    dataId: uuidv4(),
                    data:path.feature.properties,
                    /** @see https://leafletjs.com/reference-1.6.0.html#map-flytobounds */
                    goTo:flyToBoundsOption=>{
                        this.deHighLightPath()
                        this.highLightPath([path])
                        
                        !l.visible && this.setVisible(l.id,true)

                        if(path instanceof L.CircleMarker){
                            this.InitIns.map.flyTo(path.getLatLng(),this.InitIns.map.getMaxZoom())
                        }else{
                            this.InitIns.map.flyToBounds(path.getBounds(),flyToBoundsOption)
                        }
                    }
                })
            })

            this.highLightPath(pathCollection) // 高亮
        })
        
        console.log("%c queryByLatLng():Test Result:","background:green;",result)

        return result

    }

    /** 清除高亮圖層 */
    deHighLightPath(){
        if(this._lastHighLightPathCollection.length){
            this._lastHighLightPathCollection.forEach(path => {
                path.path.setStyle(path.lastStyle)
                path.path.redraw()
            })
            this._lastHighLightPathCollection.length = 0
            // 重排序 : 因移除後重新加回會使目標圖層跑至地圖最上，集合中紀錄的索引位置才是其原本真正位置
            this._normalLayerCollection.forEach(l=> 'bringToFront' in l && l.bringToFront())
        } 
    }

    /** 高亮圖層 */
    highLightPath(pathCollection:Array<Path>){
        pathCollection.length && pathCollection.forEach(path=>{
            this._lastHighLightPathCollection.push({
                path:path,
                lastStyle:{
                    color:path.options.color,
                    fillColor:path.options.color,
                }
            })
            path.bringToFront()
            path.setStyle({
                color:"yellow",
                fillColor:path.options.color,
                weight: 5
            })
        })
        return this._lastHighLightPathCollection
    }

    /** 從 JSON Definition 取得 TileLayer 定義  */
    private _addBaseLayerFromDef(){
        layerDef.baseLayers.forEach((lyr,index)=>{
            
            if(lyr.type !== "wmts"){
                console.error("unsupport baselayer type")
                return
            } 

            let tileLayer = leaflet.tileLayer(lyr.url, {
                opacity:lyr.opacity,
                maxZoom: lyr.maxZoom,
            }) as tileLayer
            
            // 附加屬性
            tileLayer.id = uuidv4()
            tileLayer.type = lyr.type
            tileLayer.title = lyr.title
            tileLayer.visible = index === (layerDef.baseLayers.length-1) // 確保最後一個可見
            tileLayer.opacity = lyr.opacity
            tileLayer.imgUrl = lyr.imgUrl

            this._baseLayerColletion.push(tileLayer)
            tileLayer.visible && tileLayer.addTo(this.InitIns.map)
        })
    }

    /**
     * 從 JSON 取得 geojson layer 定義 
     * pathoption @see https://leafletjs.com/reference-1.6.0.html#path
     */
    private async _addLayerFromDef(){
        
        for (let index = 0; index < layerDef.layers.length; index++) {
            
            const lyr = layerDef.layers[index]
            
            let matched_catelog = []
            CATELOGS.forEach(i=>{
                if(i.layer.some(_name=>new RegExp(_name,"g").test(lyr.title))){
                    matched_catelog.push(i.catelog)
                }
            })

            if(!matched_catelog.length) console.error(`無法取得${lyr.title}的分類`)

            // 從定義取得檔案 - 暫不快取
            const dataFromDef = await (await fetch(`layers/${lyr.filename}`,{
                headers: {
                    'Cache-Control': 'no-cache'
                },
                method:"get"
            })).json()

            switch(lyr.type){
                case "geojson":

                    let geojson:geoJsonLayer = null 
                    const pointToLayer = (feature, latlng)=>leaflet.circleMarker(latlng, {...{radius: 5},...lyr.pathOptions})

                    /** 
                     * 重新投影
                     * @see https://gis.stackexchange.com/questions/189126/leaflet-geojson-with-projected-coordinates-3857 
                     */
                    if(/3857/g.test(dataFromDef.crs.properties.name)){
                        geojson = leaflet.Proj.geoJson(dataFromDef,{
                            pointToLayer: pointToLayer,
                        })
                    }else{
                        geojson = leaflet.geoJSON(dataFromDef,{
                            pointToLayer: pointToLayer,
                        }) as geoJsonLayer
                    }
                    // 設置圖層樣式
                    geojson.setStyle(lyr.pathOptions)
                    
                    // 附加屬性
                    geojson.id = uuidv4()
                    geojson.type = lyr.type
                    geojson.catelog = matched_catelog
                    geojson.title = lyr.title
                    geojson.visible = lyr.visible
                    geojson.opacity = lyr.pathOptions.fillOpacity
                    geojson.dataSet = lyr.dataSet

                    let MATCHED_COLOR = lyr.pathOptions.color.match(/\d+/g)
                    if(MATCHED_COLOR instanceof Array && MATCHED_COLOR.length === 3 ){
                        geojson.legendRGBStr = MATCHED_COLOR.join(",")
                    }
                    this._normalLayerCollection.push(geojson)
                    geojson.visible && geojson.addTo(this.InitIns.map)
                    break
                case "velocity":
                    let vlyr = this.createVelocityLayer(
                        dataFromDef,
                        lyr.layerOption
                    )
                    
                    vlyr.id = uuidv4()
                    vlyr.type = lyr.type
                    vlyr.title = lyr.title
                    vlyr.opacity = 1
                    vlyr.visible = lyr.visible
                    vlyr.catelog = matched_catelog
                    vlyr.dataSet = lyr.dataSet

                    this._normalLayerCollection.push(vlyr)
                    vlyr.visible && vlyr.addTo(this.InitIns.map)
                    break
                case "clusterMark":         
                    let cmklyr = this.createClusterMarkersLayer(dataFromDef,{
                        icon:{
                            iconSize: [30, 30],
                            iconAnchor: [10, 41],
                            popupAnchor: [2, -40],
                            iconUrl: layerIcon['default'][lyr.layerOption.icon],
                            // shadowSize:[28, 35],
                            // shadowAnchor: [14, 45],
                            // shadowUrl:"data:image/png;base64,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"
                        },
                        featureProperties: lyr.layerOption.featureProperties
                    })

                    cmklyr.id = uuidv4()
                    cmklyr.icon = layerIcon['default'][lyr.layerOption.icon]
                    cmklyr.type = lyr.type
                    cmklyr.title = lyr.title
                    cmklyr.visible = lyr.visible
                    cmklyr.opacity = 1
                    cmklyr.catelog = matched_catelog
                    cmklyr.dataSet = lyr.dataSet

                    this._normalLayerCollection.push(cmklyr)
                    cmklyr.visible && cmklyr.addTo(this.InitIns.map)

                    break
                default:
                    console.error("unknown layer type in def")
            }
            
        }
        console.log("%c added layer : ","background:green;",this._normalLayerCollection)
    }
    
    /**
     * 建立流量圖
     * leafletVelocity
     * @see https://github.com/danwild/leaflet-velocity
     * @see https://www.cnblogs.com/tiandi/p/10124095.html
     */
    createVelocityLayer(data:any,option?:any):L.Layer & layer{
        let vlyr = new test({
            ...option,
            ...{
                displayValues:false,         
                angleConvention: "bearingCCW",
                reverseY: true,
                data: data,
            }
        }) as any 
        
        return vlyr
    }

    /**
     * 建立叢集標記圖層
     * TS type example  
     * @see https://stackblitz.com/edit/ts-leaflet-markercluster?file=index.ts
     * api 
     * @see https://github.com/Leaflet/Leaflet.markercluster#readme
     */
    createClusterMarkersLayer(data:any,option?:{
        featureProperties:{
            title:string
            description:Array<string>
            photo?:Array<string>, 
        }
        icon:L.IconOptions
    }):L.Layer & layer{
        const icon = leaflet.icon(option.icon)

        let markClusterLayer = leaflet.markerClusterGroup({
            iconCreateFunction: cluster=> icon,
            showCoverageOnHover:false,
            spiderLegPolylineOptions: {opacity:0}
        })
        
        leaflet.geoJSON(data).getLayers().forEach((l:any)=> {
            
            let content = ""
            if("photo" in option.featureProperties){
                option.featureProperties.photo.some(k=>{
                    const data = l.feature.properties[k]
                    if(!data) return true
                    content += `<img style="width:100%;margin:0.5rem 0;" src="${data}"/>`
                    return true
                })
            }
            if("description" in option.featureProperties){
                option.featureProperties.description.some(k=>{
                    const data = l.feature.properties[k]
                    if(!data) return true
                    content += `<p>${data}</p>`
                    return true
                })
            }

            let mark = leaflet.marker(l.getLatLng(),{icon})
            mark.bindPopup(`
                <h3>${l.feature.properties[option.featureProperties.title]}</h3>
                <small>
                    經度 ${l.feature.geometry.coordinates[0]} 緯度 ${l.feature.geometry.coordinates[1]}
                </small>
                ${content}
            `, {
                closeButton:false,
                maxHeight: 300
            })
            markClusterLayer.addLayer(mark)
        })

        return markClusterLayer
    }
}
