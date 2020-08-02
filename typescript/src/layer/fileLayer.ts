require("leaflet-filelayer")()

export class FileLayer extends L.Layer implements ILayer{
    
    id: string
    type: string
    title: string
    catelog: { label: string; value: string }[]
    tag: string[]
    visible: boolean
    opacity: number
    dataSet: { label: string; value: string }[]
    imgUrl?: string
    legendColor?: string
    icon?: string
    
    lyrOpts:any

    constructor({
        id,
        type,
        title,
        catelog,
        tag,
        visible,
        opacity,
        dataSet,
        ...lyrOpts
    }){
        super()
        this.id = id
        this.type = type
        this.title = title
        this.catelog = catelog
        this.tag = tag
        this.visible = visible
        this.opacity = opacity
        this.dataSet = dataSet
        this.lyrOpts = lyrOpts
    }

    
    async fetchData(){
        return await (await fetch(this.lyrOpts.url)).blob()
    }


    /**@override  */
    onAdd(map:L.Map){
        (async ()=>{
            const blob = await this.fetchData()
            const file = new File([blob],"kml.kml")
            const loader = L.FileLayer.fileLoader(
                map,{
                    layerOptions:{
                        style:{
                            color:"red",
                            fillOpacity:"red"
                        }
                    },
                    addToMap: true,
                    fileSizeLimit:  1000000
                }
            )
            loader.on("data:loaded", e=>console.log("[res]",e))
            loader.loadData(file, "fifows_typhoon.kml")

        })()
        return this
    }

    
    // async addFileLayer(f,o):Promise<ILayer>{
        
    //     console.log("options",o)

    //     const style = {
    //         color:o.style.color.hex,
    //         fillOpacity:o.style.color.a*0.8
    //     }

    //     /** TODO:建立叢集圖層 */
    //     const pointToLayer = (feature, latlng)=>L.circleMarker(latlng, {...{radius: 5},...style})

    //     const loader = L.FileLayer.fileLoader(
    //         this._map,{
    //             layerOptions:{
    //                 style:style,
    //                 pointToLayer:pointToLayer
    //             },
    //             addToMap: false,
    //             fileSizeLimit:  999999
    //         }
    //     )

    //     try{

    //         loader.load(f)

    //         const res = await new Promise((res,rej)=>{
    //             loader.on("data:loaded", e=>res(e))
    //             loader.on("data:error", e=>rej(e))
    //         }) as any
            
    //         let lyr = res.layer as geoJsonLayer
    //         lyr.addTo(this._map)
    //         console.log("fileLayer", lyr)

    //         lyr.id = uuidv4()
    //         lyr.visible = true
    //         lyr.title = o.name
    //         lyr.opacity = o.style.color.a
    //         lyr.type = "filelayer"
    //         lyr.catelog = [{
    //             label:"自訂",
    //             value:"filelayer"
    //         }]

    //         // this.normalLayerCollection.push(lyr)
    //         // return {
    //         //     type:lyr.type,
    //         //     title:lyr.title,
    //         //     name:lyr.title,
    //         //     id:lyr.id,
    //         //     opacity:lyr.opacity,
    //         //     visible:lyr.visible,
    //         //     legendColor:`${o.style.color.rgba.r},${o.style.color.rgba.g},${o.style.color.rgba.b}`,
    //         //     catelog:lyr.catelog
    //         // }

    //     }catch(e){
    //         console.error("file layer load err")
    //         throw(e)
    //     }

    // }
}
