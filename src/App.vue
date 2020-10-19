<template lang="pug">
#app
	//- Windy Map
	div(v-if="windyOption.visible" style="position:fixed;z-index:999;left:0;right:0;")
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

	component(
		v-if="mapConstructed" 
		ref="mapUI" 
		:is="isMobile ? 'mapUIxs' : 'mapUI'"
	)

	//- Map Container
	#viewDiv(:style="windyOption.visible ? 'z-index:-10;' : ''")

	//- Mark Template - reserve for "markClick" event 
	div(ref="mark")

</template>

<script>

import Vue from 'vue'

import {mapGetters,mapActions, mapMutations} from 'vuex'

import mapUI from "@/components/mapUI"
import mapUIxs from "@/components/mapUIxs"

import isoheStation from "@/components/result/isoheStation"
import coastWeather from "@/components/result/coastWeather"

import {Init} from "@/../typescript/dist/init"
import {Layer} from "@/../typescript/dist/layer/layer"
import { marquee } from '@/directives/directives';

function getRequestParm(name) {
	var re = location.search.match('[?&]'+encodeURIComponent(name)+'=([^&]*)');
	if(re) {
		return decodeURIComponent(re[1]);
	}
	return false;
}

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
		alertData:[]
	}),
	components:{
		mapUI,
		mapUIxs,
		isoheStation,
		coastWeather
	},
	computed:{
		...mapGetters(["isMobile","windyOption"]),
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
	async mounted(){
		try{

			this.loading = this.$loading({
				lock: true,
				text: "圖資載入中",
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.8)'
			})

			var initPos = {
				center:["23.830576","121.20172"],
				zoom: 7
			}
			var loc = getRequestParm('loc');
			if(loc) {
				var p = loc.split(',');
				initPos.center = [p[0], p[1]];
				initPos.zoom = p[2];
			} else {
				if(localStorage.getItem("location")){
					const p = localStorage.getItem("location").split(",")
					//const lat = p[0]
					//const lng = p[1]
					//const zoom = p[2]
					//this.$InitIns.map.setView({lat,lng},zoom)
					initPos.center = [p[0], p[1]];
					initPos.zoom = p[2];
				}
			}
			Vue.prototype.$InitIns = new Init("viewDiv", initPos)

			await this.layerHandler()
			
			this.eventHandler()

		}catch(e){
			console.error(e)
			this.$alert(`地圖載入過程發生錯誤 : ${e}`,{type:"error"})
		}finally{
			this.loading.close()
			this.mapConstructed = true
		}
	},
	methods:{
		...mapMutations({
			SNAPSHOT_RAW_LAYER:"layer/SNAPSHOT_RAW_LAYER",
			SET_RESULT:"result/SET_RESULT",
			SET_CARD_VISIBLE:"SET_CARD_VISIBLE",
			SET_WINDY_OPTION:"SET_WINDY_OPTION",
		}),
		async eventHandler(){
			const map = this.$InitIns.map
			map.on({
				"typhoonAlert":({data})=>{
					const h = this.$createElement
					
					console.log(" [ typhoonAlert ] ",data)

					this.$message.closeAll()
					this.$message({
						message: h("div", {
							style:"display: flex;align-items: center;white-space: nowrap;height:0;"
						} , [
							h("strong", {style:"margin-right:0.5rem;"} , "颱風警報"),
							h("div",{
								directives: [{
									name:"marquee",
									value: {width:'60vw',play:true}
								}]
							},data),
							h("el-button", {
								props:{type:"text"},
								on:{
									click:()=>{
										this.$message.closeAll()
									}
								}
							} , [h("i",{class:"el-icon-close",style:"color:red;"})])
						]),
						duration: 0,
						type: "warning"
					})

				},
				"moveend":evt=>{
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

					let hasDrawer = false
					for (const r of result) {
						if(r.layerTitle === "海面天氣預報(近海海象)"){
							const {data} = r
							const drawerIns = this.$drawer({
								props:{
									title: data.locationName,
									size: this.isMobile ? "100%" : "400px",
									direction:"btt"
								},
								on:{
									close:()=>{
										console.log("drawer close")
									}
								}
							})
							drawerIns.open({...coastWeather,store:this.$store}, {
								props:{data}
							})
							hasDrawer = true
						}else{
							this.SET_RESULT(r)
						}
					}
					if(!hasDrawer){
						this.SET_CARD_VISIBLE({key:'layer',bool:false})
						this.SET_CARD_VISIBLE({key:'result',bool:true})
					}
				},
				"markerClick": async ({dataType,layer,data,event})=>{
					console.log("[markerClick]",{dataType,layer,data,event})
					switch(dataType){
						case "isoheStation":
							const drawerIns = this.$drawer({
								props:{
									title:"",
									size: this.isMobile ? "100%" : "400px",
									direction:"btt"
								},
								on:{
									close:()=>{
										console.log("drawer close")
									}
								}
							})
							drawerIns.open({...isoheStation,store:this.$store}, {
								props:{data}
							})
							break
						case "scenicSpot":
						default:
							setTimeout(()=>layer.openPopup(),100)
					}
				}
			})

		},
		async layerHandler(){

			const layerDef = await(await fetch('./layerDef.json')).json()
			const layerCateLog = await(await fetch('./layerCatelog.json')).json()

			Vue.prototype.$LayerIns = new Layer(this.$InitIns.map,layerCateLog)
			
			/** baselayer must before normal -> "zoom" */
			this.$LayerIns.addBaseLayer(layerDef.baseLayers)
			await this.$LayerIns.addLayer(layerDef.layers)

			console.log("%c $layerIns:","background:red;", this.$LayerIns)

			this.SNAPSHOT_RAW_LAYER({
				type:"baseLayer",
				payload: this.$LayerIns.baseLayerColletion.map(({
					type,id,title,name,dataSet,opacity,visible,imgUrl,catelog,tag
				})=>({
					type,id,title,name,dataSet,opacity,visible,imgUrl,catelog,tag
				})).reverse()
			})
			this.SNAPSHOT_RAW_LAYER({
				type:"layer",
				payload: this.$LayerIns.normalLayerCollection.map(({
					type,title,name,id,icon,dataSet,opacity,visible,legendColor="145,145,145",catelog,tag
				})=>({
					type,title,name,id,icon,dataSet,opacity,visible,legendColor,catelog,tag
				})).reverse()
			})
			
		}
	}
}

</script>

<style lang="scss">

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

</style>
