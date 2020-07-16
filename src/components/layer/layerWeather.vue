<template lang="pug">

.layerWeather
	span
		small(v-if="weatherLayer.length") 當前資料來源為中央氣象局，
		small 看看
		el-button(
			style="padding: 0;margin: 0 0.5rem;"
			title="開啟 WINDY 地圖"
			type="text"
			@click="SET_WINDY_OPTION({visible:true})"
		)
			img(src="@/assets/windy.png" style="max-width:60px;position:relative;top:0.5rem;")
		small 的預報 ?

	p(style="line-height:150%;")
		el-button(
			v-for="lyr in weatherLayer"
			round
			size="small"
			:label="lyr"
			:key="lyr.name"
			:type="weatherLayer.some(l=>l.visible&&l===lyr)?'primary':''"
			@click="openLyr(lyr)"
		) 
			font-awesome-icon(
				style="margin-right: 0.5rem;"
				v-if="weatherLayer.some(l=>l.visible&&l===lyr)" 
				icon="check" 
				fixed-width
			)
			span {{lyr.title}}

</template>

<script>

import { mapGetters, mapMutations } from 'vuex'
import timeSlider from "@/components/common/timeSlider"

export default {
	name:"layerWeather",
	data:()=>({
		activedLayer:null
	}),
	components:{
		timeSlider
	},
	computed:{
		...mapGetters({
			weatherLayer:"layer/layer/weatherLayer"
		})
	},
	methods:{
		...mapMutations({
			UPDATE_LAYER_OPTIONS:"layer/layer/UPDATE_LAYER_OPTIONS",
			SET_WINDY_OPTION:"common/common/SET_WINDY_OPTION",
		}),
		guessFwIcon(name){
			if(/風/.test(name)) return "wind"
			else if(/海/.test(name)) return "water"
		},
		openLyr(toActiveLayr){
			
			// 如果點自己且自己是開啟的狀態下，則關掉
			const findVisible = this.weatherLayer.find(l=>l.visible)
			if(findVisible && findVisible === toActiveLayr){
				this.$LayerIns.setVisible(findVisible.id,false)
				this.UPDATE_LAYER_OPTIONS({
					id:findVisible.id,
					payload:{visible:false}
				})
				return
			}

			this.weatherLayer.forEach(l=>{
				const visible = l.id === toActiveLayr.id 
				this.$LayerIns.setVisible(l.id,visible)
				this.UPDATE_LAYER_OPTIONS({
					id:l.id,
					payload:{visible:visible}
				})
			})

		},
	}
}
</script>

<style lang="scss" scoped >

	/deep/ {
		.el-radio {
			padding: 0.5rem 1rem;
			border: 1px solid $info;
			border-radius: 1rem;
			margin-right:1rem;
			&--active{
				border: 1px solid $primary;
			}
		}
	}
	.layerWeather{
		display: flex;
		flex-direction: column;
	}

</style>