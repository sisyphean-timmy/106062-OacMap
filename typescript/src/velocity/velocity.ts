/**
 * Generic  Canvas Layer for leaflet 0.7 and 1.0-rc,
 * copyright Stanislav Sumbera,  2016 , sumbera.com , license MIT
 * originally created and motivated by L.CanvasOverlay  available here: https://gist.github.com/Sumbera/11114288
 * 
 */

import { Windy } from './windy'

export class CanvasLayer extends L.Layer {

    private _canvas:HTMLCanvasElement = null
    private _frame:any = null
    private _windy:any = null
    private _context:CanvasRenderingContext2D = null

    options:any = null
    constructor(options:L.LayerOptions){
        super(options)
        this.options = options
    }

    /** @override */
    onAdd(map){
        this._canvas = L.DomUtil.create("canvas", "leaflet-velocity-layer") as HTMLCanvasElement

        let size = map.getSize()
        this._canvas.width = size.x
        this._canvas.height = size.y

        map.getPane("overlayPane").appendChild(this._canvas)
        
        map.on(this.getEvents(),this)
        
        this.needRedraw()

        return this
    }

    /** @override */
    onRemove(map){
        
        map.getPane("overlayPane").removeChild(this._canvas)
        
        this._canvas = null
        
        map.off(this.getEvents(),this)
        
        if(this._frame) L.Util.cancelAnimFrame(this._frame)
        
        /** 清除創建的windy實例 */
        this._windy.stop()
        this._windy = null

        return this
    }

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
        /** clear canvas */
        if(this._context) this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
        if(this._frame) return
        /** @see https://developer.mozilla.org/zh-TW/docs/Web/API/Window.requestAnimationFrame */
        this._frame = L.Util.requestAnimFrame(()=>{
            this._startWindy()
            this._frame = null
        }, this)
    }

    private _initWindy(){
        this._windy = new Windy({
            ...{
                canvas: this._canvas,
                map: this._map
            },
            ...this.options
        })
        this._context = this._canvas.getContext("2d")
    }

    private _startWindy(){
        if(!this._windy){
            this._initWindy()
        }

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
    
}