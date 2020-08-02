/**
 * Generic  Canvas Layer for leaflet 0.7 and 1.0-rc,
 * copyright Stanislav Sumbera,  2016 , sumbera.com , license MIT
 * originally created and motivated by L.CanvasOverlay  available here: https://gist.github.com/Sumbera/11114288
 * 
 */

/** requestAnimationFrame @see https://developer.mozilla.org/zh-TW/docs/Web/API/Window.requestAnimationFrame */

import { Windy } from './velocity'
 /** 
  * 風場、海流
  * GRIB2 @see https://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_doc/
  * parameterCategory @see https://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_doc/grib2_table4-2.shtml
  * parameterNumber @see https://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_doc/grib2_table4-2-0-2.shtml
  * {[
  *  ucomp:{header:any{},data:number[]} 緯向
  *  vcomp:{header:any{},data:number[]} 經向
  * ]}
  */
export class VelocityLayer extends L.Layer implements ILayer{
    
    id: string
    type: string
    title: string
    catelog: { label: string; value: string }[]
    tag: string[]
    visible: boolean
    opacity: number
    dataSet: { label: string; value: string }[]

    private _canvas:HTMLCanvasElement = null
    private _frame:any = null
    private _windy:any = null
    private _context:CanvasRenderingContext2D = null

    // _lastTimeStamp:number = 0
    lyrOpts:any = null
    dataIndexDef:Array<{
        name:string,
        time08:string
    }>
    times:Array<string>

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

    async fetchData(idx:number = 0):Promise<any>{
        const url = this.lyrOpts.url.replace("index.json",this.dataIndexDef[idx].name)
        return await (await fetch(url)).json()
    }

    async setTimeData(time:string = this.times[0]){
        try{
            const idx = this.times.indexOf(time)
            const data = await this.fetchData(idx)
            !this._windy && this._init()
            this._windy.setData(data)
            this.needRedraw()
        }catch(e){
            console.error(e)
        }
    }
    
    setOption(opts:any){
        !this._windy && this._init()
        this._windy.setOptions(opts)
    }

    /** @override */
    onAdd(map){
        (async ()=>{
            this._canvas = L.DomUtil.create("canvas", "leaflet-velocity-layer") as HTMLCanvasElement

            let size = map.getSize()
            this._canvas.width = size.x
            this._canvas.height = size.y
    
            map.getPane("overlayPane").appendChild(this._canvas)
            
            map.on(this.getEvents(),this)
            
            // get index file and times
            this.dataIndexDef = await (await fetch(this.lyrOpts.url)).json()
            this.times = this.dataIndexDef.map(i=>i.time08)

            await this.setTimeData()
            this.fireEvent("loaded")

        })()
        return this
    }

    /** @override */
    onRemove(map){
        
        map.getPane("overlayPane").removeChild(this._canvas)
        map.off("mousemove", this.onMouseMove);

        this._canvas = null
        
        map.off(this.getEvents(),this)
        
        if(this._frame) L.Util.cancelAnimFrame(this._frame)
        
        /** 清除創建的windy實例 */
        this._windy.stop()
        this._windy = null

        return this
    }

    /** @override */
    getEvents(){
        return {
            resize: this._resizeHandler,
            movestart: this._moveStartHandler,
            moveend: this.needRedraw,
            zoomanim: this.needRedraw
        }
    }

    /** redraw canvas by requestAnimFrame */
    needRedraw():void {

        if(this._context) this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
        if(this._frame) return

        // let now = Date.now()
        // if(!(Math.abs(this._lastTimeStamp-now)>1000)) return
        // this._lastTimeStamp = now
        
        this._frame = L.Util.requestAnimFrame(()=>{
            this._start()
            this._frame = null
        }, this)

    }

    private _init(){
        this._windy = new Windy({
            ...{
                canvas: this._canvas,
                map: this._map,
                displayValues:false,
                reverseY: true
            },
            ...this.lyrOpts.layerOption
        })
        this._context = this._canvas.getContext("2d")
    }

    private _start(){
        !this._windy && this._init()

        const tl = this._map.containerPointToLayerPoint([0, 0])
        L.DomUtil.setPosition(this._canvas, tl)

        let bounds = this._map.getBounds()

        let size = this._map.getSize() // bounds, width, height, extent

        this._windy.start([
            [0, 0],
            [size.x, size.y]
        ], size.x, size.y, [
            [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
            [bounds.getNorthEast().lng, bounds.getNorthEast().lat]
        ])
    }

    private _resizeHandler(resizeEvent){
        this._canvas.width = resizeEvent.newSize.x
        this._canvas.height = resizeEvent.newSize.y
    }

    private _moveStartHandler(){
        this._windy.stop()
    }
    
    /** 取得指標位置的資訊 */
    onMouseMove(cb:(evt:any)=>void){
        this._map.on("mousemove",(e:any)=>{
            console.log("mouse move",e)
            if(e.type === "Point"){
                const pos = this._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));
                const gridValue = this._windy.interpolatePoint(pos.lng, pos.lat);
            }
        })
    }
}
