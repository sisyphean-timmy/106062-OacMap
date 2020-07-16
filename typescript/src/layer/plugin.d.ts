declare namespace L {
    
    export const idwLayer:(data:Array<any>,option:any)=>any

    export const heatLayer:(data:Array<any>,option:any)=>any
    
    export const webGLHeatmap:(opts:any)=>{
        addDataPoint:(data:Array<[number,number,number]>)=>any,
    }

    /** @see  https://github.com/makinacorpus/Leaflet.FileLayer*/
    export const FileLayer:{
        fileLoader:(map:L.Map,option:{
            layerOptions:any
            addToMap:boolean
            fileSizeLimit: number
        })=>any
    }

    /**TODO: define type  @see https://github.com/makinacorpus/Leaflet.GeometryUtil#readme */
    export const GeometryUtil:{
        belongsSegment:(latlng:L.LatLng,v1:any,v2:any, tolerance?:number)=>any
        distance:(map:L.Map, latlngA:L.LatLng, latlngB:L.LatLng)=>number
        layersWithin:(map:L.Map, layers:Array<L.Layer>, latlng:L.LatLng, radiusopt:number, o?:any)=>Array<any>
        readableDistance:(distance:number, unit:"metric"|"imperial")=>string
        length:(coords:L.Polyline|Array<L.Point>|Array<L.LatLng>)=>number
}
    /**TODO: define type  @see https://github.com/kartena/Proj4Leaflet#readme */
    export const Proj:{
        CRS:()=>any
        GeoJSON:()=>any
        ImageOverlay:()=>any
        Projection:()=>any
        geoJson: (geojson:any, options?:any)=>any
        imageOverlay: (url:any, bounds:any, options:any)=>any
    }  
    /** TODO: define type @see https://github.com/Leaflet/Leaflet.markercluster#readme */
    export function markerClusterGroup(option?:any):any
    /** TODO: define type @see https://github.com/danwild/leaflet-velocity#readme */
    export function velocityLayer(options:{
        angleConvention?:string,
        reverseX?:boolean
        reverseY?:boolean
        /** see demo/*.json, or wind-js-server for example data service */
        data: any,
        /** 顯示數值與否 */
        displayValues: boolean
        /** 顯示數值設定 */
        displayOptions?:{
            /** Global Wind */
            velocityType?: string
            /** bottomleft*/
            position?: string
            /** No velocity data*/
            emptyString?: string
            /** bearingCW*/
            angleConvention?: string
            /** bottomleft*/
            displayPosition?: string
            /** No velocity data */
            displayEmptyString?:string
            /** kt */ 
            speedUnit?: string
        }
        /** OPTIONAL used to align color scale deafult : 0 */
        minVelocity?: number
        /** OPTIONAL used to align color scale deafult : 10 */
        maxVelocity?: number
        /** OPTIONAL 改变粒子的运动速度，值越大越快 預設 0.005 */
        velocityScale?: number 
        /** OPTIONAL array of hex/rgb colors */
        colorScale?: Array<string> 
        /** OPTIONAL callback function */
        onAdd?: any
        /** OPTIONAL callback function */
        onRemove?: any
        /** OPTIONAL layer opacity default 0.97*/ 
        opacity?: number
        /**
         *  OPTIONAL pane to add the layer, will be created if doesn't exist
         *  leaflet v1+ only (falls back to overlayPane for < v1)
         */
        paneName?: string
        /** 粒子的粗细，值越大越粗 */
        lineWidth?:number
        /** 粒子的数量 ex : 1 / 300  */
        particleMultiplier?: number
    }): any;
}

/** 子類依原型繼承也應可調用所有已繼承父類成員 */
type Path = L.Path&(L.Polygon|L.Polyline) | L.CircleMarker


/** @see https://github.com/mapbox/leaflet-pip#readme */
interface ILeafletPip{
    bassackwards:boolean,
    /** @return L.GeoJSON's child layer */
    pointInLayer(p:[number,number],l:L.GeoJSON,isFirst?:boolean):Array<Path&{feature?:{properties:any}}>
}