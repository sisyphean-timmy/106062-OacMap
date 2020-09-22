<template lang="pug">
.tools
	//- 海情
	el-button(
		:title="activedLyr?activedLyr.title:'海情海象資訊'"
		:type="activedLyr?'primary':''"
		type="primary" 
		@click="$openDrawer({title:'海情/海象資訊'})"
		key="海情/海象資訊"
		circle
	)
		.tools__button
			strong.tools__button__label.tools__button__label--actived(v-if="activedLyr") {{activedLyr.title}}
			strong.tools__button__label(v-else) 海情海象資訊
			font-awesome-icon(:icon="activedLyr?activedLyr.icon:'cloud'" fixed-width size="lg")
		//- .tools__button
		//- 	font-awesome-icon(icon="search" fixed-width size="lg")

	//- 圖層
	el-button(
		circle
		@click="SET_CARD_VISIBLE({key:'layer',bool:!layerVisibility})"
	)
		.tools__button
			font-awesome-icon(icon="layer-group" fixed-width size="lg")
	//- 搜尋結果
	el-button(
		circle 
		:disabled="!allR2"
		@click="SET_CARD_VISIBLE({key:'result',bool:true})"
	)
		.tools__button
			.tools__resultNum(
				:class="{'tools__resultNum--active':allR2}" 
			) {{allR2}}
			font-awesome-icon(icon="info" fixed-width size="lg")
	//- 當前位置
	el-button(
		circle
		@click="locateCurrent()"
	)
		.tools__button
			font-awesome-icon(icon="map-marker-alt" fixed-width  size="lg")

</template> 

<script>

import {mapGetters,mapActions, mapMutations} from 'vuex'

const ICON_ENUM = {
	"風":"wind",
	"海":"water",
	"船":"ship",
	"波浪":"wave-square",
	"溫度":"thermometer-quarter",
	"高度":"ruler-vertical",
	"風險|潛勢":"exclamation-triangle",
	"鹽度":"tachometer-alt"
}

export default {
	name:"tools",
	props:{},
	data:()=>({}),
	computed:{
		...mapGetters({
			isMobile:"common/common/isMobile",
			allResultLength:"result/result/allResultLength",
			allR2:"result/result/allR2",
			commonState:"common/common/state",
			layerState:"layer/layer/state",
			weatherLayer:"layer/layer/weatherLayer",
		}),
		currentTag(){
			return this.commonState("currentTag")["label"]
		},
		layerVisibility(){
			return  this.commonState("layerCardVisible")
		},
		resultVisibility(){
			return  this.commonState("resultCardVisible")
		},
		normalWLyr(){
			// 增加圖示
			return this.weatherLayer.map(l=>{
				let icon = "cloud-sun-rain"
				Object.keys(ICON_ENUM).forEach(k=>{
					if(new RegExp(k,"g").test(l.title)){
						icon = ICON_ENUM[k]
					}
				})
				return {...l,...{icon}}
			})
		},
		activedLyr(){
			const {id} = this.layerState('activedWeatherLyr')
			return this.normalWLyr.find(l=>l.id === id)
		},
	},
	methods:{
		...mapMutations({
			SET_CARD_VISIBLE:"common/common/SET_CARD_VISIBLE",
			SET_CURRENT_TAG:"common/common/SET_CURRENT_TAG",
		}),
		async locateCurrent(){
			try{
				await this.$InitIns.toCurrentLocation()
			}catch(e){
				this.$alert("目前無法定位到當前位置，請檢查GPS狀態",{type:"error"})
			}
		},
	}
}
</script>

<style lang="scss" scoped>


	@mixin activeStyle{
		color:#fff;
		background: $primary;
		text-shadow: none;
		transition: 0.2s ease all;
		max-width: 200px;
	}

	.tools{
		position: absolute;
		
		display:flex;
		flex-direction:column;        
		align-items: flex-start;

		&>*{
			margin:0 0 1rem 0 !important;
			box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
		}

		&__button{
			display: flex;
			align-items: center;
			justify-content: center;
			width:1rem;
			height:1rem;
			position: relative;
			&__label{
				color: darken($info, 30);
				background: lighten($info,20);
				position: absolute;
				left: 250%;
				padding: 0.5rem 0.8rem;
				border-radius: 1rem;
				box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
				font-size: 0.8rem;
				&--actived {
					@include activeStyle;
				}
			}
		}
		&__resultNum{
			position:absolute;
			top: -120%;
			right: -120%;
			left: auto;
			bottom: auto;

			background-color:darken($info,10);
			color: #fff;
			width:1.15rem;
			height:1.15rem;

			border-radius: 100%;
			padding: 0.1rem;
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
