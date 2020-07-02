<template lang='pug'>

	el-card.layer-card(
		shadow="hover"
		:class="isOutScaleStyle ? 'layer-card--outscale' : !layer.visible ? 'layer-card--disabled ' :'layer-card--default'"
		@click.native.stop="handleOpacitySlider"
	)
		
		.dragger(
			v-if="!isIE"
			v-handle
			:style="isRetrival?'color:red;':''"
			@click.stop="emitDeActiveLayer(layer)"
		)
			font-awesome-icon(:icon="isRetrival?'trash-alt':'arrows-alt-v'")

		//- 透明度背景
		.layer-card__bgOpacity(
			v-if="!isOutScaleStyle && layer.visible" 
			:style="opacityTransformScaleStyle"
		)

		.layer-card__content
			//- 超過比例尺樣式 -- 顯示提示
			template(v-if="isOutScaleStyle")
				.layer-card__content__notify
					strong {{layer.title}}
					br
					small 限定比例尺範圍
					strong {{layer.minScale && layer.maxScale ? ` 1/${layer.minScale} ~ 1/${layer.maxScale} ` : layer.maxScale ? ` 1/${layer.maxScale}以下 ` : ` 1/${layer.minScale}以上 ` }}
					small 目前 1/{{mapScale}}

			//- 比例尺內樣式 -- 正常顯示
			template(v-else)

				.layer-card__content__head

					//- 名稱
					strong(style="line-height:200%;")
						
						//- template(v-if="isRetrival && layer.mgroup || layer.sgroup")
						//- 	el-tag(size="small") 
						//- 		span(v-if="layer.mgroup") {{layer.mgroup}}
						//- 		span(v-if="layer.sgroup") / {{layer.sgroup}}
						//- 	br

						div(style="display:flex;align-items:center;")
							.color-legendRGBStr(:style="`backgroundColor:${colorModel};`")
							span {{layer.title}}

					div(ref="outterButton" style="display:flex;align-items:center;")
						el-switch(
							:value="layer.visible"
							:title="layer.visible?'關閉圖層':'開啟圖層'"
							@change="$emit('switch',$event)"
						)

						el-button(
							type="text" 
							title="圖層來源網址"
							style="padding:0 0 0 0.5rem;"
							:disabled="!layer.dataSet" 
							@click="openDataSource(layer.dataSet)" 
						)
							font-awesome-icon(icon="info-circle")

				div(v-if="detailVisibility && layer.visible && !isOutScaleStyle")
					transition(name="fade")
						.layer-card__content__opacity
							el-slider(
								:value="handleOpacityPercentage"
								:show-tooltip="false"
								@input="$emit('opacitySlide',$event)"
							)
					transition(name="fade")
						.layer-card__content__colorPicker(v-if="!isIE")
							colorSliderPicker(v-model="colorModel")

</template>

<script>

/** 調色、顏色功能 IE 不支援 : 移除 */
import { mapGetters, mapMutations } from 'vuex'
import { HandleDirective } from 'vue-slicksort'

let colorConverter = (!document.documentMode) ? require("color-convert") : "";

/** @see https://www.npmjs.com/package/vue-color */
import {Slider as colorSliderPicker} from "vue-color"

/**
 * @switch()
 * @opacitySlide()
 * @openExplain()
 */
export default {
	name:'layerItemCard',
	directives: { handle: HandleDirective },
	components:{
		colorSliderPicker
	},
	data:()=>({
		detailVisibility:false
	}),
	props:{
		layer:{
			type:Object
		},
		dragging:{
			type:Boolean
		},
		status: {
			type:String,
			validator: status => status === "" || status === "simple" || status === "outScale"
		},
		isRetrival:{
			type: Boolean,
		}
	},
	computed:{
		...mapGetters({
			rootState:"common/common/state"
		}),
		isIE(){
			return Boolean(document.documentMode)
		},
		dragAvaliable(){
			return this.layer.type === "geojson"
		},
		colorModel:{
			get(){
				
				if(!this.layer.visible){
					return `#efefef`
				}

				if(!colorConverter){
					if(this.isIE){
						return `rgb(${this.layer.legendRGBStr})`
					}
					return `#000000`
				} 

				let rgb = this.layer.legendRGBStr.split(",")
				let hslArr = colorConverter.rgb.hsl(rgb)
				let result = {
					hsl:{
						hue: hslArr[0]||0,
						saturation: hslArr[1]||0,
						luminosity: hslArr[2]||0,
						alpha: 1
					},
					rgb:rgb,
					hex: colorConverter.rgb.hex(rgb)
				}
				return `#${result.hex}`
			},
			set(color){
				
				console.log("layer in state", this.layer)
				console.log("color", color)

				// update map 
				this.$LayerIns.setStyle(this.layer.id,{
					color:color.hex
				})
				// update state
				this.UPDATE_LAYER_OPTIONS({
					id:this.layer.id,
					payload:{
						legendRGBStr:`${color.rgba.r},${color.rgba.g},${color.rgba.b}`
					}
				})

			}
		},
		handleOpacityPercentage(){
			return Number((Number(this.layer.opacity)*100).toFixed(0))
		},
		handleOpacityFloat(){
			return this.handleOpacityPercentage/100
		},
		opacityTransformScaleStyle(){
			return {
				transform: `scale(${ this.handleOpacityFloat },1)`
			}
		},
		isSimpleStyle(){
			return this.status === 'simple'
		},
		isOutScaleStyle(){
			return this.status === 'outScale'
		}
	},
	methods:{
		...mapMutations({
			UPDATE_LAYER_OPTIONS:"layer/layer/UPDATE_LAYER_OPTIONS"
		}),
		handleOpacitySlider(evt){
			if(this.$refs.outterButton.contains(evt.target)) return
			this.detailVisibility = !this.detailVisibility
		},
		emitDeActiveLayer(layer){
			if(this.isRetrival){
				this.$emit("deActiveLayer",layer)
			}
		},
		openDataSource(dataUrl){
			window.open(dataUrl,"_blank")
		}
	},
}
</script>




<style lang="scss" scoped>
	.layer-card{
		margin: 1rem auto;
		box-sizing: border-box;
		position: relative;
		cursor: pointer;
		/deep/ {
			.el-card__body{
				padding:0.35rem 0.6rem;
				display:flex;
				align-items: center;
			}
		}
		
		&__bgOpacity{
			position: absolute;
			top: 0; left: 0; bottom: 0; right: 0;
			background-color: rgba($primary, 0.1);
			transform-origin: left;
			transform: scale(0.5,1);
			z-index: 0;
		}

		&__content{
			display:flex;
			flex-direction:column;
			align-items: space-between;
			justify-content:center;
			flex: 1 1 100%;

			&__head{
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			&__detail{
				display: flex;
				align-items: center;
			}
			&__notify{
				line-height: 150%;
			}
			&__opacity{
				width: 97%;
			}
			&__colorPicker{
				margin:0.5rem 0 1rem 0;
				/deep/ {
					.vc-slider{
						width: 98%;
					}
					.vc-slider-swatches{
						display: none;
					}
				}
			}
		}

		&--disabled{
			border:0;
			border: 1px dashed darken($info,20);
			color: darken($info,20);
			background-color: lighten($info,20);
		}
		&--default{
			border:0;
			border: 1px dashed darken($info,20);
		}
		&--outscale{
			border:0;
			border: 1px dashed $warning;
		}

	}
	
	.dragger{
		padding: 0 1rem;
		cursor: grab;
		z-index: 2;
	}

	.color-legendRGBStr{
		border:2px solid #ffffff;
		border-radius: 100%;
		margin-right: 0.5rem;
		width:0.9rem;
		height:0.9rem;
		// box-shadow: 0 0 1px 2px rgba(0,0,0,0.1);
	}


</style>
