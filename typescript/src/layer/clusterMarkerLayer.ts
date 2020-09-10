
import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(fas, fab, far)

abstract class BaseCluster extends L.Layer implements ILayer{

    id: string
    type: string
    title: string
    catelog: { label: string; value: string }[]
    tag: string[]
    visible: boolean
    opacity: number
    dataSet: { label: string; value: string }[]

    icon?: string
    lyrOpts:any

    markerClusterGroup:L.MarkerClusterGroup

    constructor({
        id,
        type,
        title,
        visible,
        tag,
        catelog,
        opacity,
        dataSet,
        ...lyrOpts
    }){
        super()
        this.catelog = catelog
        this.id = id
        this.type = type
        this.tag = tag
        this.title = title
        this.visible = visible
        this.opacity = 1
        this.icon = lyrOpts.layerOption.icon
        this.lyrOpts = lyrOpts
        this.dataSet = dataSet 

        /** Fix XSS by vue's render fn  */
        this.markerClusterGroup = L.markerClusterGroup({
            iconCreateFunction: cluster=> L.divIcon({
                html: new Vue({
                    render: h => h(
                        "div",
                        {class:"leaflet-mark-icon"},
                        [
                            h(Vue.component('font-awesome-icon', FontAwesomeIcon),{
                                props:{
                                    icon:this.icon
                                }
                            })
                        ]
                    )
                }).$mount().$el as HTMLElement
            }),
            showCoverageOnHover:false,
            spiderLegPolylineOptions: {opacity:0}
        })

    }

    async fetchData(){
        return await(await fetch(this.lyrOpts.url)).json()
    }
    onRemove(map){
        this.markerClusterGroup.removeFrom(map)
        return this
    }    
    
    abstract onAdd(map:L.Map):this
}

export class clusterMarkerLayer extends BaseCluster{
    data:any
    constructor(opts){
        super(opts)
    }
    private _pointToLayer(feature, latlng):L.Marker{
            const mk = L.marker(latlng, {
                icon:L.divIcon({
                    html:new Vue({
                        render: h => h(
                        "div",
                        {class:"leaflet-mark-icon"},
                        [
                            h(Vue.component('font-awesome-icon', FontAwesomeIcon),{
                                props:{
                                    icon:this.icon
                                }
                            })
                        ]
                    )
                }).$mount().$el as HTMLElement
            })
        })
        mk.on("click",e=>{
            this._map.fireEvent("markerClick", {
                dataType: "default",
                layer: mk,
                result: feature,
                data: feature,
                event: e
            })
        })
        // test properties
        const misc = Object.keys(feature.properties).join()
        if(/遊艇泊區/g.test(misc)){
            mk.bindPopup(`
                <h3>${feature.properties["遊艇泊區名"]}，泊位數 ${feature.properties['泊位數']} 位</h3>
            `)
        }else if(/漁港名稱/g.test(misc)){
            mk.bindPopup(`
                <h3>${feature.properties["漁港名稱"]}</h3>
            `)
        }else{
            mk.bindPopup(JSON.stringify(feature.properties))
        }
        
        return mk
    }
    onAdd(map){
        
        (async ()=>{
            if(!this.data) this.data = await this.fetchData()
            const geojson = L.geoJSON(this.data,{
                pointToLayer:this._pointToLayer.bind(this)
            })
            this.markerClusterGroup.addLayer(geojson).addTo(map)
            this.fireEvent("loaded")
        })()

        return this
    }
    
}

export class IsoheStationLayer extends BaseCluster {

    data:any

    constructor(opts){
        super(opts)
    }

    onAdd(map){
        (async ()=>{
            if(!this.data) this.data = await this.fetchData()
            for (const {DataSet,Name} of this.data.Stations) {
                for (const k of Object.keys(DataSet)) {
                    const {Data,location} = DataSet[k]
                    const {Latitude,Longitude} = location
                    const mk = L.marker(
                        L.latLng(Latitude,Longitude),{
                            icon:L.divIcon({
                                html:new Vue({
                                render: h => h(
                                    "div",
                                    {class:"leaflet-mark-icon"},
                                    [
                                        h(Vue.component('font-awesome-icon', FontAwesomeIcon),{
                                            props:{
                                                icon:this.icon
                                            }
                                        })
                                    ]
                                )
                            }).$mount().$el as HTMLElement})
                        }
                    )
                    mk.on("click",e=>{
                        let result  = {
                            title:"",
                            type:"",
                            data:Data
                        }
                        if(/tide/ig.test(k)){
                            result.title = Name+"潮汐"
                            result.type = "tide"
                        }else if(/history/ig.test(k)){
                            result.title = Name+"波浪及海流"
                            result.type = "wave"
                        }else if(/wind/ig.test(k)){
                            result.title = Name+"風力"
                            result.type = "wind"
                        }
                        this._map.fireEvent("markerClick",{
                            dataType: "isoheStation",
                            layer: mk,
                            data: result,
                            event:e
                        })
                    })
                    this.markerClusterGroup.addLayer(mk)
                }
            }
            this.markerClusterGroup.addTo(map)
            this.fireEvent("loaded")
        })()
        return this
    }
}

/** 
 * TODO: 列出各縣市 1 個 ICON > 點擊後 再載入屬於該縣市的 觀光景點資訊
 */
export class ScenicSpotLayer extends BaseCluster {
    data:any

    constructor(opts){
        super(opts)
    }
    
    private _pointToLayer(feature, latlng){

        const mk = L.marker(latlng, {
            icon:L.divIcon({
                html:new Vue({
                render: h => h(
                    "div",
                    {class:"leaflet-mark-icon"},
                    [
                        h(Vue.component('font-awesome-icon', FontAwesomeIcon),{
                            props:{
                                icon:this.icon
                            }
                        })
                    ]
                )
            }).$mount().$el as HTMLElement})
        })

        const {
            Name,
            Toldescribe,
            Picture1,
            Picture2,
            Picture3,
            Py,Px
        } = feature.properties
        const img = Picture1||Picture2||Picture3||''
        mk.bindPopup(`
            <h3>${Name}</h3>
            <small>
                經度 ${Px} 緯度 ${Py}
            </small>
            ${img?`<img style="max-width:200px;" src="${img}" alt="${Name}"/>`:``}
            <p>${Toldescribe}</p>
        `, {
            maxHeight: 300
        })
        
        mk.on("click",e=>{
            this._map.fireEvent("markerClick",{
                dataType: "scenicSpot",
                layer: mk,
                data:{
                    Name,
                    Toldescribe,
                    Picture1,
                    Picture2,
                    Picture3,
                    Py,Px
                },
                event: e
            })
        })
        return mk
    }

    onAdd(map){
        (async ()=>{

            if(!this.data) this.data = await this.fetchData()

            const geojson = L.geoJSON(this.data,{
                pointToLayer:this._pointToLayer.bind(this)
            })

            this.markerClusterGroup.addLayer(geojson).addTo(map)
            this.fireEvent("loaded")
        })()
        return this
    }
}