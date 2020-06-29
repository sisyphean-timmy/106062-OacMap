<template lang='pug'>

	el-card.layer-card(
		shadow="hover"
		:class="isOutScaleStyle ? 'layer-card--outscale' : !layer.visible ? 'layer-card--disabled ' :'layer-card--default'"
		@click.native="handleOpacitySlider"
	)
		.icon
			img(:src="layer.icon")

		.layer-card__content
			.layer-card__content__head
				//- 名稱
				strong(style="line-height:200%;")
					div(style="display:flex;align-items:center;")
						span {{layer.title}}
				div(ref="buttonNotTriggerShowOpacity" style="display:flex;align-items:center;")
					//- 開關
					el-switch(
						:value="layer.visible"
						:title="layer.visible?'關閉圖層':'開啟圖層'"
						@change="$emit('switch',$event)"
					)
					el-button(
						type="text" 
						title="圖層來源網址"
						:disabled="!layer.dataSet" 
						style="padding:0 0 0 0.5rem;"
						@click="openDataSource(layer.dataSet)" 
					)
						font-awesome-icon(icon="info-circle")

		//-
		el-dialog(
			v-if="dataSetDialogVisible"
			@close="dataSetDialogVisible=false"
			:title="dataSetDialogTitle"
			visible
			show-close
			append-to-body	
			center
		)
			span {{dataSetDialogDetail}}
</template>

<script>

import { mapGetters, mapMutations } from 'vuex'

/**
 * @switch()
 * @opacitySlide()
 * @openExplain()
 */
export default {
	name:'layerItemCard',
	components:{
		
	},
	data:()=>({
		detailVisibility:false,
		//-
		dataSetDialogVisible:false,
		dataSetDialogTitle:"",
		dataSetDialogDetail:"",
	}),
	props:{
		layer:{
			type:Object
		},
		status: {
			type:String,
			validator: status => status === "" || status === "simple" || status === "outScale"
		}
	},
	computed:{
		isOutScaleStyle(){
			return this.status === 'outScale'
		}
	},
	methods:{
		...mapMutations({
			UPDATE_LAYER_OPTIONS:"layer/layer/UPDATE_LAYER_OPTIONS"
		}),
		handleOpacitySlider(evt){
			if(evt.path.includes(this.$refs.buttonNotTriggerShowOpacity)) return
			this.detailVisibility = !this.detailVisibility
		},
		openDataSource(dataUrl){
			window.open(dataUrl,"_blank")
		}
	},
}
</script>




<style lang="scss" scoped>
	
	.icon{
		padding: 0 1rem;
		cursor: -webkit-grab;
		cursor: grab;
		z-index: 2;
		img{
			height: 1.2rem;
			width: 1.2rem;
		}
	}
	
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


</style>
