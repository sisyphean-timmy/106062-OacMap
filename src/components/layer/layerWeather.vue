<template lang="pug">

.layerWeather(v-loading="loading")
	span
		small(v-if="weatherLayer.length") 當前資料來源為中央氣象局，
		small 點擊圖示查看
		el-button(
			style="padding: 0;margin: 0 0.5rem;"
			title="開啟 WINDY 地圖"
			type="text"
			@click="SET_WINDY_OPTION({visible:true})"
		)
			img(src="@/assets/windy.png" style="max-width:60px;position:relative;top:0.5rem;")
		small 的預報 ?
	//- select
	p 
		el-select(
			size="mini"
			v-model="activedLayerId"
			clearable
			placeholder="選擇一項預報"
		)
			el-option(
				v-for="o in normalWLyrOptions" 
				:label="o.label"
				:key="o.label"
				:value="o.value"
			)

	//- //- button - dep
	//- p
	//- 	el-button(
	//- 		v-for="lyr in normalWLyr"
	//- 		round
	//- 		size="small"
	//- 		:label="lyr"
	//- 		:key="lyr.name"
	//- 		:type="normalWLyr.some(l=>l.visible&&l===lyr)?'primary':''"
	//- 		@click="openNormalLyr(lyr)"
	//- 	) 
	//- 		font-awesome-icon(
	//- 			style="margin-right: 0.5rem;"
	//- 			v-if="normalWLyr.some(l=>l.visible&&l===lyr)" 
	//- 			icon="check" 
	//- 			fixed-width
	//- 		)
	//- 		span {{lyr.title}}
	
	//- p
	//- 	el-button(
	//- 		v-for="lyr in baseWLyr"
	//- 		round
	//- 		size="small"
	//- 		:label="lyr"
	//- 		:key="lyr.name"
	//- 		:type="baseWLyr.some(l=>l.visible&&l===lyr)?'primary':''"
	//- 		@click="openBaseWLyr(lyr)"
	//- 	) 
	//- 		font-awesome-icon(
	//- 			style="margin-right: 0.5rem;"
	//- 			v-if="baseWLyr.some(l=>l.visible&&l===lyr)" 
	//- 			icon="check" 
	//- 			fixed-width
	//- 		)
	//- 		span {{lyr.title}}

</template>

<script>

import { mapGetters, mapMutations } from 'vuex'

const DUMMY_LEGEND = require("@/assets/legend")

export default {
	name:"layerWeather",
	data:()=>({
		activedLayerId:"",
		loading:false
	}),
	components:{
	},
	watch:{
		activedLayerId:{
			async handler(id){
				if(id){
					await this.openNormalLyr(id)
				}else{
					this.closeAllNormalLyr()
				}
			}
		}
	},
	computed:{
		...mapGetters({
			weatherLayer:"layer/layer/weatherLayer"
		}),
		normalWLyrOptions(){
			return this.normalWLyr.map(i=>({
				label:i.title,
				value:i.id
			}))
		},
		normalWLyr(){
			// return this.weatherLayer.filter(l=>this.baseWLyr.indexOf(l)===-1)
			return this.weatherLayer.filter(l=>l)
		},
		// baseWLyr(){
		// 	return this.weatherLayer.filter(l=>/gradient/ig.test(l.type))
		// },
	},
	methods:{
		...mapMutations({
			UPDATE_LAYER_OPTIONS:"layer/layer/UPDATE_LAYER_OPTIONS",
			SET_ACTIVED_WEATHER_DATA:"layer/layer/SET_ACTIVED_WEATHER_DATA",
			SET_WINDY_OPTION:"common/common/SET_WINDY_OPTION",
		}),
		guessFwIcon(name){
			if(/風/.test(name)) return "wind"
			else if(/海/.test(name)) return "water"
		},
		closeAllNormalLyr(){
			this.normalWLyr.forEach(l=>{
				const visible = false
				this.$LayerIns.setVisible(l.id,visible)
				this.UPDATE_LAYER_OPTIONS({
					id:l.id,
					payload:{visible:visible}
				})
				this.SET_ACTIVED_WEATHER_DATA({
					id:l.id,
					times:[]
				}) 
			})
		},
		async openNormalLyr(id){
			
			this.loading = !this.loading

			this.normalWLyr.forEach(l=>{
				const visible = l.id === id
				this.$LayerIns.setVisible(l.id,visible)
				this.UPDATE_LAYER_OPTIONS({
					id:l.id,
					payload:{visible:visible}
				})
			})

			const activedLyr = this.$LayerIns.normalLayerCollection.find(l=>l.id === id)
			console.log("[activedWLyr]",activedLyr)
			if(!activedLyr) return

			// 取得 legend 
			const legend = DUMMY_LEGEND.find(l=> new RegExp(l.layerName,"g").test(activedLyr.title))
			console.log("[activedWLyr legend]",legend)

			let payload = {id}

			if(legend){
				const new_legend = {
					label:legend.label,
					colorScaleLabel:legend.colorScaleLabel,
					colorScaleValue:legend.colorScaleValue
				}

				// 重新設定 顏色尺度
				activedLyr.setOption({
					minIntensity:Number(legend.colorScaleLabel[0]),
					maxIntensity:Number(legend.colorScaleLabel[legend.colorScaleLabel.length-1]),
					colorScale:legend.colorScaleValue
				})

				// legend.colorScaleLabel -> 轉成文字
				if(legend.type==="text"){ 
					new_legend.colorScaleLabel = legend.colorScaleLabel.map(i => legend.colorScaleLabelName[i])
				}

				payload.legend = new_legend
			}

			// 等待實例完全建構 
			await new Promise(res=>activedLyr.once("loaded",()=>res()))
			payload.times = activedLyr.times,
			this.SET_ACTIVED_WEATHER_DATA(payload)
			this.loading = !this.loading
			
		}
		// openNormalLyr(lyr){
		// 	// 如果點自己且自己是開啟的狀態下，則關掉
		// 	const findVisible = this.normalWLyr.find(l=>l.visible)
		// 	if(findVisible && findVisible === lyr){
		// 		this.$LayerIns.setVisible(findVisible.id,false)
		// 		this.UPDATE_LAYER_OPTIONS({
		// 			id:findVisible.id,
		// 			payload:{visible:false}
		// 		})
		// 		return
		// 	}

		// 	this.normalWLyr.forEach(l=>{
		// 		const visible = l.id === lyr.id 
		// 		this.$LayerIns.setVisible(l.id,visible)
		// 		this.UPDATE_LAYER_OPTIONS({
		// 			id:l.id,
		// 			payload:{visible:visible}
		// 		})
		// 	})
		// },
		// openBaseWLyr(lyr){
		// 	// 如果點自己且自己是開啟的狀態下，則關掉
		// 	const findVisible = this.baseWLyr.find(l=>l.visible)
		// 	if(findVisible && findVisible === lyr){
		// 		this.$LayerIns.setVisible(findVisible.id,false)
		// 		this.UPDATE_LAYER_OPTIONS({
		// 			id:findVisible.id,
		// 			payload:{visible:false}
		// 		})
		// 		return
		// 	}

		// 	this.baseWLyr.forEach(l=>{
		// 		const visible = l.id === lyr.id 
		// 		this.$LayerIns.setVisible(l.id,visible)
		// 		this.UPDATE_LAYER_OPTIONS({
		// 			id:l.id,
		// 			payload:{visible:visible}
		// 		})
		// 	})
		// }
	}
}
</script>

<style lang="scss" scoped >

	/deep/ {
		.el-input__inner{
			border-radius: 1rem;
		}
	}
	.layerWeather{
		display: flex;
		flex-direction: column;
	}

</style>