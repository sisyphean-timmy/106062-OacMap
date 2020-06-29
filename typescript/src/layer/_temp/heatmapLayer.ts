

import "leaflet.idw/archive/leaflet-idw-v0.0.1.js"
import * as HeatmapOverlay from "leaflet-heatmap"

export class HeatMapLayer extends L.Layer implements ILayer{
    id: string
    type: string
    title: string
    catelog: {
        // const parsedGeoraster = await georaster(values, metadata);
        // console.log("[georaster]",parsedGeoraster.toCanvas())
        // heatMapData
        label: string; value: string
    }[]
    tag: string[]
    visible: boolean
    opacity: number
    dataSet: { label: string; value: string }[]
    fetchData(p: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    imgUrl?: string
    legendColor?: string
    icon?: string

    constructor(){
        super()
        let heatDate = []
        let max = 999
        for (const iterator of dataFromDef.features.filter(i=>/TEMP/ig.test(i.properties.ns1_elemen))) {
            const lat = iterator.geometry.coordinates[1]
            const lng = iterator.geometry.coordinates[0]
            
            if(!lat||!lng) return
            if(iterator.properties.ns1_value===-99) return 

            let count = parseFloat(iterator.properties.ns1_value)
            if(max === 999) max = count
            if(count > max) max = count
            heatDate.push([lat,lng,count])
        }

        // const values = [ [ [0, 1, 2], [0, 0, 0], [2, 1, 1] ] ];
        // const noDataValue = 3;
        // const projection = 4326;
        // const xmin = -40;
        // const ymax = 14;
        // const pixelWidth = 0.00001;
        // const pixelHeight = 0.00001;
        // const metadata = { noDataValue, projection, xmin, ymax, pixelWidth, pixelHeight };
        // const parsedGeoraster = await georaster(values, metadata);
        // console.log("[georaster]",parsedGeoraster.toCanvas())
        

        // heatMapData
        console.log("[heatMapData]",heatDate,max)

        /**
            * @see https://github.com/spatialsparks/Leaflet.idw
            * @see http://www.geonet.ch/leaflet-idw/
            */
        let hlyr = leaflet.idwLayer(heatDate,
            {
                opacity: 0.8, cellSize: 10, exp: 2, max: max, min:0,
                gradient:{0: 'purple', 0.5: 'blue', 1: 'orange'}
            }
        )
        hlyr.id = uuidv4()
        hlyr.type = lyr.type
        hlyr.title = lyr.title
        hlyr.opacity = 1
        hlyr.visible = lyr.visible
        hlyr.catelog = matched_catelog
        hlyr.tag = lyr.tag
        hlyr.dataSet = lyr.dataSet
        
        this.normalLayerCollection.push(hlyr)
        hlyr.visible && hlyr.addTo(this.InitIns.map)
        break
    }

    onAdd(){
        let hlyr = new HeatmapOverlay({
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            // if scaleRadius is false it will be the constant radius used in pixels
            "radius": 0.1,
            "maxOpacity": 0.5,
            // scales the radius based on map zoom
            "scaleRadius": true,
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": true,
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'count',
            // gradient: {
            //     0.0: 'green',
            //     0.5: 'yellow',
            //     0.8: 'blue',
            //     1.0: 'red'
            // }
        })
        hlyr.setData({data});
        
        return hlyr as unknown as L.Layer & ILayer
    }
}