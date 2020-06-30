<template lang="pug">

#app
	template(v-if="windyOption.visible")
		el-button(
			type="danger"
			plain
			style="padding:0.6rem 0;width: 100%;border-radius: 0;"			
			@click="SET_WINDY_OPTION({visible:false})"
		) 
			font-awesome-icon(icon="chevron-left" fixed-width tansform="left-2")
			strong 返回

		iframe#windy(
			:style="`height:${ifh}px`"
			frameborder="0"
			:src="`https://embed.windy.com/?${windyOption.location}`"
		)

	template(v-else)
		component(:is="isMobile ? 'mapUIxs' : 'mapUI'")

	#viewDiv(:style="windyOption.visible ? 'z-index:-10;' : ''")

	//- 掛載到地圖的UI內
	template(v-if="!isMobile")
		div(ref="tl")
		div(ref="tr")
		div(ref="bl")
			.logo
				img(src="./assets/logo.png")
			.mask
		div(ref="br")
			.scaleCoordInfo(ref="scaleCoordInfo")

</template>

<script>

import Vue from 'vue'

import {mapGetters,mapActions, mapMutations} from 'vuex'

import mapUI from "@/components/mapUI"
import mapUIxs from "@/components/mapUIxs"

import {Init} from "@/../typescript/dist/init/init"
import {Layer} from "@/../typescript/dist/layer/layer"

export default {
	name: 'app',
	data:()=>({
		loading:null,
	}),
	components:{
		mapUI,
		mapUIxs
	},
	computed:{
		...mapGetters({
			isMobile:"common/common/isMobile",
			windyOption:"common/common/windyOption",
		}),
		ifh(){ // iframe 高度 減 上方按鈕高度 
			return window.innerHeight - 32
		}
	},
	async mounted(){
		try{

			this.loading = this.$loading({
				lock: true,
				text: "圖資載入中",
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.8)'
			})

			await this.initBeforeMapMounted(this) // Action before mount
	
			Vue.prototype.$InitIns = new Init("viewDiv",{
				center:["23.830576","121.201172"],
				zoom: 8
			})
	
			// 將 vue template UI DOM 掛載入 leaflet map 的 UI DOM
			if(!this.isMobile){
				let map = this.$InitIns.map.getContainer()
				map.querySelector('.leaflet-bottom.leaflet-left').appendChild(this.$refs.bl)
				map.querySelector('.leaflet-bottom.leaflet-right').appendChild(this.$refs.br)
				map.querySelector('.leaflet-top.leaflet-left').appendChild(this.$refs.tl)
				map.querySelector('.leaflet-top.leaflet-right').appendChild(this.$refs.tr)
		
				// mount scale and coord info
				this.$refs.scaleCoordInfo.appendChild(this.$InitIns.getScaleDom())
				this.$refs.scaleCoordInfo.appendChild(this.$InitIns.setCoordWhenMouseMove())
			}
			
			// 載入圖層
			await this.layerHandler()

			// 依紀錄 的 localStorage 來定位到位置
			if(localStorage.getItem("location")){
				const locArr = localStorage.getItem("location").split(",")
				const lat = locArr[0]
				const lng = locArr[1]
				const zoom = locArr[2]
				this.$InitIns.map.setView({lat,lng},zoom)
			} 
			
			// 初始化相關事件
			this.eventHandler()

			// 開啟圖層側邊欄
			!this.isMobile && this.SET_CARD_VISIBLE({key:'layer',bool:true})

			await this.initAfterMapMounted(this) // Action after mount

		}catch(e){
			console.error(e)
			this.$alert(`地圖載入過程發生錯誤 : ${e}`,{type:"error"})
		}finally{
			console.log("map loaded")
			this.loading.close()
		}
	},
	methods:{
		...mapActions({
			initBeforeMapMounted:"common/common/initBeforeMapMounted",
			initAfterMapMounted:"common/common/initAfterMapMounted",
		}),
		...mapMutations({
			SNAPSHOT_RAW_LAYER:"layer/layer/SNAPSHOT_RAW_LAYER",
			SET_RESULT:"result/result/SET_RESULT",
			SET_CARD_VISIBLE:"common/common/SET_CARD_VISIBLE",
			SET_WINDY_OPTION:"common/common/SET_WINDY_OPTION"
		}),
		async eventHandler(){

			const map = this.$InitIns.map

			/** evt @see https://leafletjs.com/reference-1.6.0.html#mouseevent-latlng */

			map.on("click",evt=>{
				let qResult = this.$LayerIns.queryByLatLng(evt.latlng)
				if(!qResult.length) return

				this.SET_RESULT(qResult)
				this.SET_CARD_VISIBLE({key:'layer',bool:false})
				this.SET_CARD_VISIBLE({key:'result',bool:true})
			})

			const setLocation = () => {
				const lat = map.getCenter().lat
				const lng = map.getCenter().lng
				const zoom = map.getZoom()
				
				const locStr = `${lat},${lng},${zoom}`

				localStorage.setItem("location",`${locStr}`)
				this.SET_WINDY_OPTION({location:`${locStr}`})

				history.replaceState(null, document.title, `?loc=${locStr}`)
			}

			setLocation()
			map.on('moveend', evt=>setLocation())
			
		},
		async layerHandler(){
			
			Vue.prototype.$LayerIns = new Layer(this.$InitIns)
			await this.$LayerIns.addDefault() /** 增加 預設靜態文件 依定義檔 ( TS中 ) */

			console.log("%c $layerIns:","background:red;", this.$LayerIns)

			this.SNAPSHOT_RAW_LAYER({
				type:"baseLayer",
				payload: this.$LayerIns.getBaseLayers()
			})
			this.SNAPSHOT_RAW_LAYER({
				type:"layer",
				payload: this.$LayerIns.getNormalLayers()
			})
			
		}
	}
}

</script>

<style lang="scss">

/** windyMap */
#windy {
	width: 100%;
	z-index:999;
}

/deep/ {
	.leaflet-popup-content-wrapper{
		height: 500px;
		overflow: scroll;
	}
}

#viewDiv {
	position: fixed;
	top: 0;
	left: 0;
	right: auto;
	bottom: auto;
	padding: 0;
	margin: 0;
	height: 100%;
	width: 100%;
	z-index: 0;
}

.logo{
	z-index: 1;
	position: fixed;
	left: 1rem;
	right: 0;
	bottom: 0.8rem;
	pointer-events: none;
	img{
		max-width: 200px;
	}
}

.mask{
	z-index: 0;
	pointer-events: none;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	width: 100%;
	height: 80px;
	background:linear-gradient(360deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 38%, rgba(0, 0, 0, 0.25) 60%, rgba(0, 0, 0, 0) 100%);
}

.scaleCoordInfo{
	display:flex;
	align-items: center;
}

</style>