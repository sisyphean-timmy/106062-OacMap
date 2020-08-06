<template lang="pug">
#app
	//- DIALOG - 主畫面說明
	el-dialog(
		:title="dialogTitle"
		v-if="dialogVisibility"
		@close="dialogTitle = '';dialogVisibility = false"
		visible
		show-close
		append-to-body	
		center
		:top="'10vh'"
	)
		template(v-if="dialogTitle === '加至主畫面說明'")
			addToHome
		template(v-else-if="dialogTitle === '搜尋'")
			searchAndFilterLayer

	//- DRAWER
	el-drawer(
		v-if="drawerVisibility"
		:title="drawerTitle"
		:size="isMobile?'100%':'30%'"
		:visible="true"
		direction="rtl"
		@close="drawerTitle='';drawerVisibility = false"
		@openAddToHomeScreen="dialogTitle = '加至主畫面說明';dialogVisibility = true"
	)
		template(v-if="drawerTitle==='相關資訊'")
			info
		template(v-else-if="drawerTitle==='海情/海象資訊'")
			layerWeatherDeatil

	//- Windy Map
	template(v-if="windyOption.visible")
		el-button(
			type="danger"
			plain
			style="padding:0.6rem 0;width: 100%;border-radius: 0;"			
			@click="SET_WINDY_OPTION({visible:false})"
		) 
			font-awesome-icon(icon="chevron-left" fixed-width tansform="left-2")
			strong 返回
			
		div(v-loading="windyLoading")
			iframe#windy(
				frameborder="0"
				:style="`height:${ifh}px`"
				:src="`https://embed.windy.com/?${windyOption.location}`"
			)

	//- UI and alerts
	template(v-else-if="mapConstructed")
		.topAlert(v-if="typhoonAlert.length" @click="typhoonAlert.splice(0,typhoonAlert.legnth)")
			div(style="display:flex;")
				strong
					font-awesome-icon(icon="exclamation-triangle" fixed-width size="1x")
					| 颱風警報 
				div(v-marquee="{width:'70vw',play:true}") 
					| {{Object.values(typhoonAlert[0]).join()}}

		component(
			:is="isMobile ? 'mapUIxs' : 'mapUI'"
			@openDrawer="drawerVisibility=true;drawerTitle=($event||'相關資訊')"
			@openSearchDialog="dialogVisibility=true;dialogTitle=($event||'搜尋')"
		)

	//- Map
	#viewDiv(:style="windyOption.visible ? 'z-index:-10;' : ''")

	//- Mark Template - mounted by render function by "markClick" event
	div(ref="mark")

	pullup(
		ref='pullup'
		v-if="popupData"
		:reservedHeight='0'
		height=""
		style="z-index:10;position:absolute;bottom: 0;"
	)
		el-button.close(
			style="position: absolute;left: auto;top: -2rem;bottom:auto;right: 1rem;"
			@click="popupData = null" 
			circle 
			type="danger" 
			size="mini"
		)
			font-awesome-icon(icon="times" fixed-width)

		isoheStation(
			:data="popupData"
			@caculateHeight="$refs.pullup.caculatePullupHeight()"
		)

</template>

<script>

import Vue from 'vue'

import {mapGetters,mapActions, mapMutations} from 'vuex'

import mapUI from "@/components/mapUI"
import mapUIxs from "@/components/mapUIxs"
import markss from "@/components/mark/mark"

import searchAndFilterLayer from "@/components/dialog/searchAndFilterLayer"
import addToHome from "@/components/dialog/addToHome"
import info from "@/components/drawer/info"
import layerWeatherDeatil from "@/components/drawer/layerWeatherDeatil"

import pullup from "@/components/pullup"
import isoheStation from "@/components/mark/isoheStation"

import {Init} from "@/../typescript/dist/init"
import {Layer} from "@/../typescript/dist/layer/layer"
import { marquee } from '@/directives/directives';

const layerDef = require("@/layerDef.json")

Vue.prototype.$openLink = link=>window.open(link,"_blank")


export default {
	name: 'app',
	directives:{
		marquee
	},
	data:()=>({
		loading:null,
		windyLoading: true,
		mapConstructed:false,
		//
		popupData:null,
		//
		dialogVisibility:false,
		dialogTitle:"",
		// 
		drawerVisibility:false,
		drawerTitle:"",
		//
		typhoonAlert: []
	}),
	components:{
        markss,
		mapUI,
		mapUIxs,
		addToHome,
		info,
		pullup,
		isoheStation,
		searchAndFilterLayer,
		layerWeatherDeatil
	},
	computed:{
		...mapGetters({
			isMobile:"common/common/isMobile",
			windyOption:"common/common/windyOption",
			commonState: "common/common/state",
		}),
		ifh(){ // iframe 高度 減 上方按鈕高度 
			return window.innerHeight - 32
		},
	},
	watch:{
		"windyOption.visible":{
			handler(bool){
				if(!bool) return 
				this.windyLoading = true
				this.$nextTick(()=>{
					const Iframe = this.$el.querySelector("#windy")
					Iframe.onload = ()=> this.windyLoading = false
				})
			}
		}
	},
	watch:{
		"windyOption.visible":{
			handler(bool){
				if(!bool) return 
				this.windyLoading = true
				this.$nextTick(()=>{
					const Iframe = this.$el.querySelector("#windy")
					Iframe.onload = ()=> this.windyLoading = false
				})
			}
		},
		popupData:{
			handler(){
				this.$nextTick(()=>{
					if(!this.$refs.pullup) return
					// this.SET_CARD_VISIBLE({key:"result",bool:false})
					// this.SET_CARD_VISIBLE({key:"layer",bool:false})
					this.$refs.pullup.toggleUp()
					this.$refs.pullup.caculatePullupHeight()
				})
			}
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
				center:["23.830576","121.20172"],
				zoom: 7
			})

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

			if(this.isMobile){
				this.dialogVisibility = true
				this.dialogTitle = "加至主畫面說明"
			}

			await this.initAfterMapMounted(this) // Action after mount

		}catch(e){
			console.error(e)
			this.$alert(`地圖載入過程發生錯誤 : ${e}`,{type:"error"})
		}finally{
			this.loading.close()
			this.mapConstructed = true
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
			SET_WINDY_OPTION:"common/common/SET_WINDY_OPTION",
			// // SET_MARK_DATA:"common/common/SET_MARK_DATA"
		}),
		async eventHandler(){

			const map = this.$InitIns.map

			map.on({
				"typhoonAlert":({data})=>{
					this.typhoonAlert.push(...data)
				},
				"moveend":evt=>{
					/** 移動後記錄位置 */
					const lat = map.getCenter().lat
					const lng = map.getCenter().lng
					const zoom = map.getZoom()
					
					const locStr = `${lat},${lng},${zoom}`

					localStorage.setItem("location",`${locStr}`)
					this.SET_WINDY_OPTION({location:`${locStr}`})

					history.replaceState(null, document.title, `?loc=${locStr}`)
				},
				"geojsonClick":({result})=>{
					console.log("[geojsonClick Result]", result)
					if(!result.length) return
					this.SET_RESULT(result)
					this.SET_CARD_VISIBLE({key:'layer',bool:false})
					this.SET_CARD_VISIBLE({key:'result',bool:true})
				},
				"markerClick":({dataType,layer,data,event})=>{
					console.log("[markerClick]",{dataType,layer,data,event})
					switch(dataType){
						case "isoheStation":
							/** 
							 * Render fn : 
							 * layer --> bindPopup( vue component ) ---latency---> openPopup()  
							 */
							// const vm = new Vue({
							//     render: h => h(markss, {
							//         // style: {
							//         //     display: context.rootState['tool/tool']['activedId'] === 'googleStreetView' ? 'block' : 'none'
							//         // },
							//         props: {data
							//             // width: 450,
							//             // position: {
							//             //     x: window.innerWidth,
							//             //     y: 0,
							//             //     z: 9999
							//             // }
							//         },
							//         // on: {
							//         //     close: event => context.dispatch("deActiveDispatcher")
							//         // }
							//     })
							// }).$mount()
							// setTimeout(()=>{
							//     layer.bindPopup(vm.$el).openPopup()
							// },100)
							this.popupData = data //TODO: will be replace
							break
						case "scenicSpot":
						default:
							setTimeout(()=>layer.openPopup(),100)
					}
				}
			})

		},
		async layerHandler(){
			
			Vue.prototype.$LayerIns = new Layer(this.$InitIns.map)
			
			await this.$LayerIns.addLayer(layerDef.layers)
			this.$LayerIns.addBaseLayer(layerDef.baseLayers)

			console.log("%c $layerIns:","background:red;", this.$LayerIns)

			this.SNAPSHOT_RAW_LAYER({
				type:"baseLayer",
				payload: this.$LayerIns.baseLayerColletion.map(l=>({
					type:l.type,
					id:l.id,
					title:l.title,
					name:l.title,
					dataSet: l.dataSet,
					opacity:l.opacity,
					visible:l.visible,
					imgUrl:l.imgUrl,
					catelog:l.catelog,
					tag:l.tag
				})).reverse()
			})
			this.SNAPSHOT_RAW_LAYER({
				type:"layer",
				payload: this.$LayerIns.normalLayerCollection.map(l=>({
					type:l.type,
					title:l.title,
					name:l.title,
					id:l.id,
					icon:l.icon,
					dataSet: l.dataSet,
					opacity:l.opacity,
					visible:l.visible,
					legendColor:l.legendColor||"145,145,145",
					catelog:l.catelog,
					tag:l.tag
				})).reverse()
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


.topAlert{
	animation-name: sparkle;
	animation-duration: 800ms;
	animation-iteration-count: infinite;
	animation-timing-function: ease-in-out;
	//
    display: flex;
    align-items: center;
	justify-content: center;
	width: 100%;
	//
	font-size: 0.8rem;
	padding: 0.5rem 0;
	position: fixed;
	z-index: 2;
	background-color: lighten($danger,20);
	color: darken($danger,10);
}
@keyframes sparkle{
	0% {
		background-color: rgba(lighten($danger,20),1);
	}
	50% {
		background-color: rgba(lighten($danger,20),0.8);
	}
	100% {
		background-color: rgba(lighten($danger,20),1);
	}
}

</style>
