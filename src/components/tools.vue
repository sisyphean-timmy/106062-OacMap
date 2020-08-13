<template lang="pug">
.tools
	//- 搜尋
	el-button(
		circle
		type="primary" 
		@click="$openDialog('搜尋')"
	)
		.tools__button
			font-awesome-icon(icon="search" fixed-width size="lg")

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
			layerState:"layer/layer/state"
		}),
		currentTag(){
			return this.commonState("currentTag")["label"]
		},
		layerVisibility(){
			return  this.commonState("layerCardVisible")
		},
		resultVisibility(){
			return  this.commonState("resultCardVisible")
		}
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
		}
		&__resultNum{
			position:absolute;
			top: -100%;
			right: -100%;
			left: auto;
			bottom: auto;

			background-color:darken($info,10);
			color: #fff;
			width:1rem;
			height:1rem;

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
