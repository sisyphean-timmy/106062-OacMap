

import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet-geometryutil"

const uuidv4 = require('uuid/v4')

import { GeojsonLayer } from "./geojsonLayer"
import { 
    GradientLayer,
    WavePeriodGradientLayer,
    WaveHeightGradientLayer
} from "./gradient/gradientLayer"

import { VelocityLayer } from "./velocity/L.VelocityLayer"
// import { FileLayer} from "./fileLayer"
import { TyphoonLayer } from "./typhoonLayer"
import { 
    clusterMarkerLayer,
    IsoheStationLayer,
    ScenicSpotLayer
} from "./clusterMarkerLayer"


const catelog = require("../../../src/layerCatelog.json")

const getCatelog = title =>{
    let bucket = catelog.filter(i=>i.layer.some(_name=>new RegExp(_name,"g").test(title))).map(i=>i.catelog)
    if(!bucket.length) console.error(`無法取得${title}的分類`)
    return bucket
}

export class Layer {
    
    private _map:L.Map
    
    baseLayerColletion:baseLayerColletion = new Array()
    normalLayerCollection:normalLayerCollection = new Array()
    
    constructor(map:L.Map){
        this._map = map
    }

    /** 設置圖層屬性 */
    setOpts(id:string,opts: L.PathOptions){
        
        let bl = this.baseLayerColletion.find(l=>l.id === id)
        let nl = this.normalLayerCollection.find(l=>l.id === id)
        const ptr = bl || nl

        try{
            if(ptr instanceof L.GeoJSON){
                ptr.setStyle(opts)
            }else if (ptr instanceof L.TileLayer ){
                let o = opts.opacity || opts.fillOpacity || 0
                ptr.setOpacity(o>1 ? o/100 : o)
            }else{
                console.error(ptr)
                throw("setStyle() Not GeoJSON || FeatureGroup")
            }
        }catch(e){
            console.error(e)
        }
        
    }

    /** 設置圖層集合中圖層的可見度 */
    setVisible(id:string,bool:boolean)
    setVisible(id:string,bool:undefined)
    setVisible(id:string,bool:any){
        if(bool === undefined){
            this.baseLayerColletion.forEach(l=>{
                if(l.id === id && !this._map.hasLayer(l)){
                    l.addTo(this._map)
                    l.visible = true
                }else{
                    this._map.removeLayer(l)
                    l.visible = false
                }
            })
        }else{
            let nl = this.normalLayerCollection.find(l=>l.id === id)
            if(!nl) return
            if(bool){
                if(!this._map.hasLayer(nl)){
                    nl.addTo(this._map)
                    nl.visible = true
                }
                // 重排序 : 因移除後重新加回會使目標圖層跑至地圖最上，集合中紀錄的索引位置才是其原本真正位置
                this.normalLayerCollection.forEach(l=> 'bringToFront' in l && l.bringToFront())
            }else{
                if(this._map.hasLayer(nl)){
                    this._map.removeLayer(nl)
                    nl.visible = false
                }
            }
        }
    }

    /** 排序一般圖層 bringToBack()最底、bringToFront()最頂 */
    reorderNormalLayer(id:string,oldIndex:number,newIndex:number){
        
        // 取得的新舊索引需反轉(視圖為反轉的)
        let rvNewIndex = this.normalLayerCollection.length-1-newIndex
        let rvOldIndex = this.normalLayerCollection.length-1-oldIndex
        console.log("rvNewIndex",rvNewIndex)
        console.log("rvOldIndex",rvOldIndex)

        // 偏移 <0 往下 >0 往上
        let offset = rvNewIndex-rvOldIndex
        console.log("offset", offset)

        // 要移動的目標
        let ptr = this.normalLayerCollection[rvOldIndex]
        // if(!(ptr instanceof L.TileLayer) && !(ptr instanceof L.GeoJSON)) return

        if(offset>0){
            ptr.bringToFront() // 會使目標移到最前
            // 計算 出從原索引到新索引間的圖層，並反序使用 bringToFront 逐個移至最上 使目標回到正確索引
            for (let index = this.normalLayerCollection.length-1; index > rvNewIndex; index--) {
                const l = this.normalLayerCollection[index]
                "bringToFront" in l && l.bringToFront()
            }

            // 依偏移量逐個交換，以更新用來記錄的集合
            let cnt = rvOldIndex
            for (let index = 0; index <Math.abs(offset); index++) {
                // console.log(`swap ${temp}-${temp+1}`)
                let ptr = this.normalLayerCollection[cnt]
                this.normalLayerCollection[cnt] = this.normalLayerCollection[cnt+1]
                this.normalLayerCollection[cnt+1] = ptr
                cnt += 1
            }
        }else if(offset<0){
            
            ptr.bringToBack() // 會使目標移到最後
            // 計算 出從原索引到新索引間的圖層，並反序使用 bringToFront 逐個移到最後 使目標回到正確索引
            for (let index = this.normalLayerCollection.length-1; index >= 0; index--) {
                const l = this.normalLayerCollection[index]
                if(index<rvNewIndex){
                    "bringToBack" in l && l.bringToBack()
                }
            }

            // 依偏移量逐個交換，以更新用來記錄的集合
            let cnt = rvOldIndex
            for (let index = 0; index <Math.abs(offset); index++) {
                // console.log(`swap ${cnt}-${cnt-1}`)
                let ptr = this.normalLayerCollection[cnt]
                this.normalLayerCollection[cnt] = this.normalLayerCollection[cnt-1]
                this.normalLayerCollection[cnt-1] = ptr
                cnt -= 1
            }
        }

        console.log("[ after order ]", this.normalLayerCollection.map(l=>l.title).reverse())

    }
    
    async addLayer(lyrDefs:any|Array<any>){
        if(!Array.isArray(lyrDefs)) lyrDefs = [lyrDefs]
        try{
            for (const lyrOpts of lyrDefs) {
                const mapFn = {
                    "geojson":GeojsonLayer,
                    "gradient":GradientLayer,
                    "velocity":VelocityLayer,
                    "clusterMark":clusterMarkerLayer,
                    "markScenicSpot":ScenicSpotLayer,
                    "markIsoheStation":IsoheStationLayer,
                    "wavePeriodGradient":WavePeriodGradientLayer,
                    "waveHeightGradient":WaveHeightGradientLayer,
                    // "fileLayer":FileLayer,
                    "typhoonLayer":TyphoonLayer
                }
                const lyrIns = new mapFn[lyrOpts.type]({
                    ...lyrOpts,
                    ...{
                        id:uuidv4(),
                        catelog:getCatelog(lyrOpts.title)
                    }
                })
                this.normalLayerCollection.push(lyrIns)
                lyrIns.visible && lyrIns.addTo(this._map)
            }
        }catch(e){
            console.error(e)
        }finally{
            console.log("%c added layer : ","background:green;",this.normalLayerCollection)
        }
    }
    
    addBaseLayer(lyrDefs:any|Array<any>){
        if(!Array.isArray(lyrDefs)) lyrDefs = [lyrDefs]
        
        lyrDefs.forEach((lyrOpts,idx) => {
            if(lyrOpts.type !== "wmts"){
                console.error(lyrOpts)
                return
            }
            
            const tileLayer = L.tileLayer(lyrOpts.url, {
                opacity:lyrOpts.opacity,
                maxZoom: lyrOpts.maxZoom,
            }) as any
            
            tileLayer.id = uuidv4()
            tileLayer.type = lyrOpts.type
            tileLayer.title = lyrOpts.title
            tileLayer.visible = idx === (lyrDefs.length-1)// 確保最後一個可見
            tileLayer.opacity = lyrOpts.opacity
            tileLayer.imgUrl = lyrOpts.imgUrl

            this.baseLayerColletion.push(tileLayer)
            tileLayer.visible && tileLayer.addTo(this._map)  
        })
    }

}
