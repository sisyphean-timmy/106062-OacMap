<template lang="pug">
	div
		transition(name="slide-fade" mode="out-in")
			//- 圖層操作
			el-card.content-card(v-if="layerCardVisible")
				layer(key="layer")
					pageHeader(
						slot="header"
						title="海域與遊憩資訊總覽"
						@back="SET_CARD_VISIBLE({key:'layer',bool:false})"
					)

			//- 查詢結果
			el-card.content-card(
				v-if="resultCardVisible"
				v-resize="true"
			)
				result

		//- CUSTOM CONER UI
		.tr
			toolTopRight
		.tl
			tools
		.br
			layerWeatherTool
			div(style="display:flex;align-items:center;justify-content:flex-end;margin-top:1rem;")
				.scaleCoordInfo(ref="scaleCoordInfo")
				small(style="margin-left:1rem;color:#fff;") 人次 {{pageviews}}
		.bl
			img(style="max-width:180px;" src="@/assets/logo.png")
		.mask

</template> 

<script>

import Vue from 'vue'

import result from "@/components/result/result"
import layer from "@/components/layer/layer"
import tools from "@/components/tools"
import toolTopRight from "@/components/toolTopRight"

import {mapGetters,mapActions, mapMutations} from 'vuex'
import pageHeader from '@/components/common/pageHeader'
import {resize} from "@/directives/directives"

import layerWeatherTool from "@/components/layer/layerWeatherTool"

export default {
	name:"mapui",
	directives:{
		resize
	},
	data:()=>({
	}),
	components:{
		result,
		layer,
		pageHeader,
		tools,
		toolTopRight,
		layerWeatherTool
	},
	computed:{
		resultCardVisible(){
			return this.$store.state.resultCardVisible
		},
		layerCardVisible(){
			return this.$store.state.layerCardVisible
		},
		pageviews(){
			return this.$store.state.GACount.pageviews
		}
	},
	methods:{
		...mapMutations(["SET_CARD_VISIBLE"])
	},
	mounted(){
		this.$InitIns.mountScaleDom(this.$refs.scaleCoordInfo)
		this.$InitIns.mountCoordDom(this.$refs.scaleCoordInfo)
	}
}
</script>

<style lang="scss" scoped>

	/**	.content-card 	*/
	.content-card{
		will-change:width;
		position: fixed;
		z-index: 999;
		top: 0;
		left: 0;    
		bottom: auto;
		right: auto;
		width: 420px;
		height: 100%;
		overflow-y:auto !important;
		/deep/ {
			&>.el-card__body{ 
				//- for layer sorting
				height: 100%;
				display:flex;
				flex-direction: column;
				box-sizing: border-box;
			}
		}
	}

	.tr,.tl,.br,.bl{
		position:  absolute;
		z-index: 2;
		&>*{
			position: relative;
		}
	}
	.tr,.tl{
		top: 1rem;
		bottom: auto;
	}
	.br,.bl{
		top: auto;
		bottom: 1rem;
	}
	.tl,.bl{
		left: 1rem;
		right: auto;
	}
	.tr,.br{
		left: auto;
		right: 1rem;
	}

	
	.tools{
		display:flex;
		flex-direction:column;
		button{
			margin:0.5rem 0;
			box-shadow:0 0 8px 4px rgba(0,0,0,0.15);
			width:2.8rem;
			height:2.8rem;
			display:flex;
			align-items:center;
			justify-content: center;
		}
	}

	.result{
		position: relative;
		&__num{
			position:absolute;
			right: -0.5rem;
			top: 0;
			background-color:darken($info,10);
			color: #fff;
			width:1.1rem;
			height:1.1rem;
			text-align: center;
			border-radius: 100%;
			font-size: 0.5rem;
			display: flex;
			align-items: center;
			justify-content: center;
			&--active{
				background-color:darken($danger,10);
				color: #fff;
			}
		}
	}

</style>
