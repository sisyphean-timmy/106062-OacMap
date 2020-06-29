<template lang="pug">
	div
		transition(name="slide-fade" mode="out-in")
			//- 圖層操作
			el-card.content-card(v-if="layerVisibility")
				pageHeader(
					:title="commonState('activedSubject')"
					@back="SET_CARD_VISIBLE({key:'layer',bool:false})"
				)
				layer(key="layer")

			//- 查詢結果
			el-card.content-card(
				v-if="resultVisibility"
				v-resize="true"
			)
				result
		
		//- CUSTOM CONER UI
		.tr
			navbar(:isMobile="isMobile")
			layerWeather
		.tl
			tools
		.br
		.bl

</template> 

<script>

import Vue from 'vue'


import navbar from "@/components/navbar"
import result from "@/components/result/result"
import layer from "@/components/layer/layer"
import tools from "@/components/tools"

import layerWeather from "@/components/layer/layerWeather"


import {mapGetters,mapActions, mapMutations} from 'vuex'
import pageHeader from '@/components/common/pageHeader'
import {resize} from "@/directives/directives"

export default {
	name:"mapui",
	props:{},
	directives:{
		resize
	},
	data:()=>({
	}),
	components:{
		result,
		layer,
		pageHeader,
		navbar,
        layerWeather,
        tools
	},
	computed:{
		...mapGetters({
			isMobile:"common/common/isMobile",
			allResultLength:"result/result/allResultLength",
			commonState:"common/common/state",
		}),
		layerVisibility(){
			return  this.commonState("layerCardVisible")
		},
		resultVisibility(){
			return  this.commonState("resultCardVisible")
		},
	},
	methods:{
		...mapMutations({
			SET_CARD_VISIBLE:"common/common/SET_CARD_VISIBLE",
		})
	}
}
</script>

<style lang="scss" scoped>
		
	/deep/{
		.el-button{
			margin: 0;
		}
		.vc-chrome{
			width: auto;
			padding: 1rem 0;
			box-shadow: none;
			background: transparent;
		}
		.vc-chrome-saturation-wrap {
			width: 100%;
			padding-bottom: 25%;
		}
		.el-input__inner{
			padding-left: 3rem;
			border-radius:1rem;
		}
	}
	
	/**
	.content-card 
	*/
	.content-card{
		will-change:width;
		position: fixed;
		z-index: 999;
		top: 0;
		left: 0;    
		bottom: auto;
		right: auto;  
		width: 450px;
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
		z-index: 1;
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
