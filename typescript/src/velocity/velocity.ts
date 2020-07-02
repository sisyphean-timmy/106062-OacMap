import { Windy } from './windy';

/*
Generic  Canvas Layer for leaflet 0.7 and 1.0-rc,
copyright Stanislav Sumbera,  2016 , sumbera.com , license MIT
originally created and motivated by L.CanvasOverlay  available here: https://gist.github.com/Sumbera/11114288
*/

// // -- L.DomUtil.setTransform from leaflet 1.0.0 to work on 0.0.7
// //------------------------------------------------------------------------------
// if (!L.DomUtil.setTransform) {
//     L.DomUtil.setTransform = function(el, offset, scale) {
//         var pos = offset || new L.Point(0, 0);
//         el.style[L.DomUtil.TRANSFORM] = (L.Browser.ie3d ? "translate(" + pos.x + "px," + pos.y + "px)" : "translate3d(" + pos.x + "px," + pos.y + "px,0)") + (scale ? " scale(" + scale + ")" : "");
//     };
// } // -- support for both  0.0.7 and 1.0.0 rc2 leaflet

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
        
        this._canvas = L.DomUtil.create("canvas", "leaflet-layer") as HTMLCanvasElement;

        let size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        let animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, "leaflet-zoom-" + (animated ? "animated" : "hide"));
        this._map.getPane("overlayPane").appendChild(this._canvas);
        
        map.on(this.getEvents(), this);

        this.needRedraw()
        this._startWindy()

        return this
    }

    getEvents(){
        return {
            resize: this._onLayerDidResize,
            moveend: this._onLayerDidMove,
            zoomanim: this._map.options.zoomAnimation && L.Browser.any3d ? this._animateZoom : null
        }
    }

    /** @override */
    onRemove(map){
        this._map.getPane("overlayPane").removeChild(this._canvas);
        map.off(this.getEvents(), this);
        this._canvas = null;
        return this
    }

    /** TODO: learn what it is */
    needRedraw():void {
        if(this._frame) return
        this._frame = L.Util.requestAnimFrame(()=>{
            this._startWindy()
            this._frame = null
        }, this)
    }

    private _initWindy(){
        // windy object, copy options
        let options = {
            ...{
                canvas: this._canvas,
                map: this._map
            },
            ...this.options
        }
        this._windy = new Windy(options); // prepare context global var, start drawing

        this._context = this._canvas.getContext("2d");

        this._canvas.classList.add("velocity-overlay");

        // this.onDrawLayer();

        this._map.on("dragstart", this._windy.stop);

        this._map.on("dragend", this._clearAndRestart);

        this._map.on("zoomstart", this._windy.stop);

        this._map.on("zoomend", this._clearAndRestart);

        this._map.on("resize", this._clearWind);

        // this._initMouseHandler(false);
    }

    private _startWindy(){
        if(!this._windy){
            this._initWindy()
        }
        let bounds = this._map.getBounds();

        let size = this._map.getSize(); // bounds, width, height, extent

        this._windy.start([
            [0, 0],
            [size.x, size.y]
        ], size.x, size.y, [
            [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
            [bounds.getNorthEast().lng, bounds.getNorthEast().lat]
        ]);
    }

    private _animateZoom(e) {
        let scale = this._map.getZoomScale(e.zoom,null); // -- different calc of offset in leaflet 1.0.0 and 0.0.7 thanks for 1.0.0-rc2 calc @jduggan1
        let offset = L.Layer ? this._map.latLngToLayerPoint(this._map.getBounds().getNorthWest(), e.zoom, e.center) : this._map.get_getCenterOffset(e.center)._multiplyBy(-scale).subtract(this.map._getMapPanePos());
        L.DomUtil.setTransform(this._canvas, offset, scale);
    }

    private _onLayerDidResize(resizeEvent) {
        this._canvas['width'] = resizeEvent.newSize.x;
        this._canvas['height'] = resizeEvent.newSize.y;
    }

    private _onLayerDidMove() {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);

        this._startWindy();
    }
    private _clearAndRestart() {
        if (this._context) this._context.clearRect(0, 0, 3000, 3000);
        if (this._windy) this._startWindy();
    }
    private  _clearWind() {
        if (this._windy) this._windy.stop();
        if (this._context) this._context.clearRect(0, 0, 3000, 3000);
    }
    // private _destroyWind() {
    //     // if (this._timer) clearTimeout(this._timer);
    //     if (this._windy) this._windy.stop();
    //     if (this._context) this._context.clearRect(0, 0, 3000, 3000);
    //     // if (this._mouseControl) this.map.removeControl(this._mouseControl);
    //     // this._mouseControl = null;
    //     this._windy = null;

    //     // this.map.removeLayer(this._canvasLayer);
    // }
}


// L.CanvasLayer = (L.Layer ? L.Layer : L.Class).extend({
//     // -- initialized is called on prototype
//     initialize: function initialize(options) {
//         this._map = null;
//         this._canvas = null;
//         this._frame = null;
//         this._delegate = null;
//         L.setOptions(this, options);
//     },
//     delegate: function delegate(del) {
//         this._delegate = del;
//         return this;
//     },
//     needRedraw: function needRedraw() {
//         if (!this._frame) {
//             this._frame = L.Util.requestAnimFrame(this.drawLayer, this);
//         }

//         return this;
//     },
//     //-------------------------------------------------------------
//     _onLayerDidResize: function _onLayerDidResize(resizeEvent) {
//         this._canvas.width = resizeEvent.newSize.x;
//         this._canvas.height = resizeEvent.newSize.y;
//     },
//     //-------------------------------------------------------------
//     _onLayerDidMove: function _onLayerDidMove() {
//         var topLeft = this._map.containerPointToLayerPoint([0, 0]);

//         L.DomUtil.setPosition(this._canvas, topLeft);
//         this.drawLayer();
//     },
//     //-------------------------------------------------------------
//     getEvents: function getEvents() {
//         var events = {
//             resize: this._onLayerDidResize,
//             moveend: this._onLayerDidMove
//         };

//         if (this._map.options.zoomAnimation && L.Browser.any3d) {
//             events.zoomanim = this._animateZoom;
//         }

//         return events;
//     },
//     //-------------------------------------------------------------
//     onAdd: function onAdd(map) {
//         console.log('canvas onAdd', this);
//         this._map = map;
//         this._canvas = L.DomUtil.create("canvas", "leaflet-layer");
//         this.tiles = {};

//         var size = this._map.getSize();

//         this._canvas.width = size.x;
//         this._canvas.height = size.y;

//         var animated = this._map.options.zoomAnimation && L.Browser.any3d;
//         L.DomUtil.addClass(this._canvas, "leaflet-zoom-" + (animated ? "animated" : "hide"));
//         this.options.pane.appendChild(this._canvas);
//         map.on(this.getEvents(), this);
//         var del = this._delegate || this;
//         del.onLayerDidMount && del.onLayerDidMount(); // -- callback

//         this.needRedraw();
//         var self = this;
//         setTimeout(function() {
//             self._onLayerDidMove();
//         }, 0);
//     },
//     //-------------------------------------------------------------
//     onRemove: function onRemove(map) {
//         var del = this._delegate || this;
//         del.onLayerWillUnmount && del.onLayerWillUnmount(); // -- callback

//         this.options.pane.removeChild(this._canvas);
//         map.off(this.getEvents(), this);
//         this._canvas = null;
//     },
//     //------------------------------------------------------------
//     addTo: function addTo(map) {
//         map.addLayer(this);
//         return this;
//     },
//     //------------------------------------------------------------------------------
//     drawLayer: function drawLayer() {
//         // -- todo make the viewInfo properties  flat objects.
//         var size = this._map.getSize();

//         var bounds = this._map.getBounds();

//         var zoom = this._map.getZoom();

//         var center = this._map.options.crs.project(this._map.getCenter());

//         var corner = this._map.options.crs.project(this._map.containerPointToLatLng(this._map.getSize()));

//         var del = this._delegate || this;
//         del.onDrawLayer && del.onDrawLayer({
//             layer: this,
//             canvas: this._canvas,
//             bounds: bounds,
//             size: size,
//             zoom: zoom,
//             center: center,
//             corner: corner
//         });
//         this._frame = null;
//     },
//     //------------------------------------------------------------------------------
//     _animateZoom: function _animateZoom(e) {
//         var scale = this._map.getZoomScale(e.zoom); // -- different calc of offset in leaflet 1.0.0 and 0.0.7 thanks for 1.0.0-rc2 calc @jduggan1


//         var offset = L.Layer ? this._map._latLngToNewLayerPoint(this._map.getBounds().getNorthWest(), e.zoom, e.center) : this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());
//         L.DomUtil.setTransform(this._canvas, offset, scale);
//     }
// });

// L.VelocityLayer = (L.Layer ? L.Layer : L.Class).extend({
//     options: {
//         displayValues: true,
//         displayOptions: {
//             velocityType: "Velocity",
//             position: "bottomleft",
//             emptyString: "No velocity data"
//         },
//         maxVelocity: 10,
//         // used to align color scale
//         colorScale: null,
//         data: null,
//         reverseX: false,
//         reverseY: false,
//     },
//     _map: null,
//     _canvasLayer: null,
//     _windy: null,
//     _context: null,
//     _timer: 0,
//     _mouseControl: null,
//     initialize: function initialize(options) {
//         L.setOptions(this, options);
//     },
//     onAdd: function onAdd(map) {
//         // determine where to add the layer
//         this._paneName = this.options.paneName || "overlayPane"; // fall back to overlayPane for leaflet < 1

//         var pane = map._panes.overlayPane;

//         if (map.getPane) {
//             // attempt to get pane first to preserve parent (createPane voids this)
//             pane = map.getPane(this._paneName);

//             if (!pane) {
//                 pane = map.createPane(this._paneName);
//             }
//         } // create canvas, add to map pane


//         this._canvasLayer = L.canvasLayer({
//             pane: pane
//         }).delegate(this);

//         this._canvasLayer.addTo(map);

//         this._map = map;
//     },
//     onRemove: function onRemove(map) {
//         this._destroyWind();
//     },
//     setData: function setData(data) {
//         this.options.data = data;

//         if (this._windy) {
//             this._windy.setData(data);

//             this._clearAndRestart();
//         }

//         this.fire("load");
//     },
//     setOpacity: function setOpacity(opacity) {
//         console.log("this._canvasLayer", this._canvasLayer);

//         this._canvasLayer.setOpacity(opacity);
//     },
//     setOptions: function setOptions(options) {
//         this.options = Object.assign(this.options, options);

//         if (options.hasOwnProperty("displayOptions")) {
//             this.options.displayOptions = Object.assign(this.options.displayOptions, options.displayOptions);

//             this._initMouseHandler(true);
//         }

//         if (options.hasOwnProperty("data")) this.options.data = options.data;

//         if (this._windy) {
//             this._windy.setOptions(options);

//             if (options.hasOwnProperty("data")) this._windy.setData(options.data);

//             this._clearAndRestart();
//         }

//         this.fire("load");
//     },

//     /*------------------------------------ PRIVATE ------------------------------------------*/
//     onDrawLayer: function onDrawLayer(overlay, params) {
//         var self = this;

//         if (!this._windy) {
//             this._initWindy(this);

//             return;
//         }

//         if (!this.options.data) {
//             return;
//         }

//         if (this._timer) clearTimeout(self._timer);
//         this._timer = setTimeout(function() {
//             self._startWindy();
//         }, 750); // showing velocity is delayed
//     },
//     _startWindy: function _startWindy() {
//         var bounds = this._map.getBounds();

//         var size = this._map.getSize(); // bounds, width, height, extent


//         this._windy.start([
//             [0, 0],
//             [size.x, size.y]
//         ], size.x, size.y, [
//             [bounds._southWest.lng, bounds._southWest.lat],
//             [bounds._northEast.lng, bounds._northEast.lat]
//         ]);
//     },
//     _initWindy: function _initWindy(self) {
//         // windy object, copy options
//         var options = Object.assign({
//             canvas: self._canvasLayer._canvas,
//             map: this._map
//         }, self.options);
//         this._windy = new Windy(options); // prepare context global var, start drawing

//         this._context = this._canvasLayer._canvas.getContext("2d");

//         this._canvasLayer._canvas.classList.add("velocity-overlay");

//         this.onDrawLayer();

//         this._map.on("dragstart", self._windy.stop);

//         this._map.on("dragend", self._clearAndRestart);

//         this._map.on("zoomstart", self._windy.stop);

//         this._map.on("zoomend", self._clearAndRestart);

//         this._map.on("resize", self._clearWind);

//         this._initMouseHandler(false);
//     },
//     _initMouseHandler: function _initMouseHandler(voidPrevious) {
//         if (voidPrevious) {
//             this._map.removeControl(this._mouseControl);

//             this._mouseControl = false;
//         }

//         if (!this._mouseControl && this.options.displayValues) {
//             var options = this.options.displayOptions || {};
//             options["leafletVelocity"] = this;
//             this._mouseControl = L.control.velocity(options).addTo(this._map);
//         }
//     },
//     _clearAndRestart: function _clearAndRestart() {
//         if (this._context) this._context.clearRect(0, 0, 3000, 3000);
//         if (this._windy) this._startWindy();
//     },
//     _clearWind: function _clearWind() {
//         if (this._windy) this._windy.stop();
//         if (this._context) this._context.clearRect(0, 0, 3000, 3000);
//     },
//     _destroyWind: function _destroyWind() {
//         if (this._timer) clearTimeout(this._timer);
//         if (this._windy) this._windy.stop();
//         if (this._context) this._context.clearRect(0, 0, 3000, 3000);
//         if (this._mouseControl) this._map.removeControl(this._mouseControl);
//         this._mouseControl = null;
//         this._windy = null;

//         this._map.removeLayer(this._canvasLayer);
//     }
// })