import * as leaflet from "leaflet"
import "leaflet/dist/leaflet.css" // 載入樣式

export class Init {
    
    map:L.Map
    popup:L.Popup
    currentLocationMarkLayer:L.Marker

    constructor(container:string|HTMLElement,mapOption:L.MapOptions = {}){
        this.map = leaflet.map(container,{
            ...mapOption,
            ...{
                attributionControl:false,
                zoomControl:false
            }
        })
    }

    
    addMark(latlng:L.LatLng):L.Marker{
        if(!this.currentLocationMarkLayer){
            this.currentLocationMarkLayer = leaflet.marker(latlng,{
                icon: leaflet.icon({
                    iconSize: [25, 41],
                    iconAnchor: [10, 41],
                    popupAnchor: [2, -40],
                    iconUrl: "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0ODYuMyA0ODYuMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDg2LjMgNDg2LjM7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNDRDJBMDA7IiBkPSJNMjQzLjE1LDB2MTA0LjRjNDQuMTEsMCw4MCwzNS44OCw4MCw4MGMwLDQ0LjExLTM1Ljg5LDgwLTgwLDgwdjIyMS45bDE0Ni40My0xODQuMSAgIGMyNi4yOS0zMy4yNSw0MC4xOS03My4yMSw0MC4xOS0xMTUuNThDNDI5Ljc3LDgzLjcyLDM0Ni4wNSwwLDI0My4xNSwweiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0Q4RDdEQTsiIGQ9Ik0zMjMuMTUsMTg0LjRjMC00NC4xMi0zNS44OS04MC04MC04MHYxNjBDMjg3LjI2LDI2NC40LDMyMy4xNSwyMjguNTEsMzIzLjE1LDE4NC40eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0ZGMzUwMTsiIGQ9Ik0xNjMuMTUsMTg0LjRjMC00NC4xMiwzNS44OS04MCw4MC04MFYwQzE0MC4yNSwwLDU2LjUzLDgzLjcyLDU2LjUzLDE4Ni42MiAgIGMwLDQyLjM3LDEzLjksODIuMzMsNDAuMjMsMTE1LjYyTDI0My4xNSw0ODYuM1YyNjQuNEMxOTkuMDQsMjY0LjQsMTYzLjE1LDIyOC41MSwxNjMuMTUsMTg0LjR6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTE2My4xNSwxODQuNGMwLDQ0LjExLDM1Ljg5LDgwLDgwLDgwdi0xNjBDMTk5LjA0LDEwNC40LDE2My4xNSwxNDAuMjgsMTYzLjE1LDE4NC40eiIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=",
                })
            })
            this.currentLocationMarkLayer.bindPopup(`目前位置 經度 ${latlng.lng.toFixed(2)} 緯度 ${latlng.lat.toFixed(2)}`,{
                closeButton:false
            })
            this.map.addLayer(this.currentLocationMarkLayer)
        }else{
            this.currentLocationMarkLayer.remove()
            this.currentLocationMarkLayer.setLatLng(latlng)
        }
        return this.currentLocationMarkLayer
    }

    /**
     * 定位到當前位置
     */
    async toCurrentLocation(){
        
        let location:Position = await new Promise((res,rej)=>{
            navigator.geolocation.getCurrentPosition(loc=>res(loc), err=>rej(err))
        })
        let latlng = new leaflet.LatLng(location.coords.latitude, location.coords.longitude)

        this.map.flyTo(latlng,15)
        this.addMark(latlng).addTo(this.map).openPopup()

    }

    /**
     * 彈出內容(該實例創建的地圖)
     */
    openPopup(latlng:L.LatLng,content:string,popupOption?:L.PopupOptions){
        
        if(!this.popup){
            this.popup = leaflet.popup({...popupOption,...{closeButton:false}})
        }

        this.popup
        .setLatLng(latlng)
        .setContent(content)
        .openOn(this.map)

        return this.popup
    }

    /**
     * 取得 含座標資訊 的 DOM
     */
    setCoordWhenMouseMove():HTMLElement{
        let textLabel = document.createElement("strong")
        textLabel.style.color = "#fff"
        
        let updateCoord = (lng=0,lat=0) => {
            textLabel.style.margin = "0 5px 5px 0.5rem"
            textLabel.innerHTML = `
                <strong>
                    <span>經度</span> ${lng.toFixed(2)}
                    <span>緯度</span> ${lat.toFixed(2)}
                </strong>
            `
        }
        updateCoord(this.map.getCenter().lng,this.map.getCenter().lat) // init
        return textLabel
    }

    /**
     * 取得 比例尺 的 DOM
     */
    getScaleDom():HTMLElement {
        let scaleDom = leaflet.control.scale({
            position:"bottomright",
            imperial:false
        }).addTo(this.map).getContainer()

        let rule = scaleDom.querySelector(".leaflet-control-scale-line") as HTMLElement
        rule.style.cssText = ` 
            background: transparent;
            color: #fff;
            border-color: #fff;
        `
        return scaleDom
    }
}