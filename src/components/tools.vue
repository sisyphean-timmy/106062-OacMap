<template lang="pug">
div

	//- 整合搜尋
	.search
		//- el-autocomplete(
		//- 	:select-when-unmatched="true"
		//- 	:fetch-suggestions="autocompleteSelectQuerySearch"
		//- 	v-model="autocompleteModel"
		//- 	placeholder="您想找甚麼"
		//- 	placement="bottom"
		//- 	clearable
		//- )

		//- 	template(slot="prefix")
		//- 		el-button(
		//- 			style="position:absolute;"
		//- 			circle
		//- 			type="primary" 
		//- 		)
		//- 			.tools__button
		//- 				font-awesome-icon(icon="search" fixed-width size="lg")

		//- 	template(slot-scope="{item}")
		//- 		span {{item.label}}

		//- 標籤
		el-select(
			style="width:200px;"
			v-model="selectedTagModel"
			filterable
			placeholder="選擇遊憩活動"
			placement="bottom"
			popper-class="selectItems"
			clearable
		)
			el-option(
				v-for="i in tags" 
				:key="i.label" 
				:label="i.label" 
				:value="i.value"
			)
			template(slot="prefix")
				el-button(
					style="position:absolute;"
					circle
					type="primary" 
				)
					.tools__button
						font-awesome-icon(icon="search" fixed-width size="lg")

	.tools
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
			@click="isMobile ? $emit('resultClick') : SET_CARD_VISIBLE({key:'result',bool:!resultVisibility})"
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
				font-awesome-icon(icon="crosshairs" fixed-width  size="lg")

</template> 

<script>

import Vue from 'vue'
import {mapGetters,mapActions, mapMutations} from 'vuex'
// import spots from "@/../public/layers/scenic_spot_C_f_2km.json"

export default {
	name:"tools",
	props:{
	},
	data:()=>({
		keywordLabel:"",
		keywordValue:"",
		// selectedTag:"",
		tourismTags:require("@/../typescript/src/layerTag.json")['tourism'],
	}),
	watch:{
		keywordValue:{
			handler(keywordValue){
				if(typeof keywordValue === "object"){
					
					const coord = keywordValue.geometry.coordinates
					const latlng = L.latLng(coord[1],coord[0])
					const map = this.$InitIns.map

					map.flyTo(latlng,map.getMaxZoom(),{
						animate:false
					})
					
					console.log("keywordValue.properties",keywordValue.properties)
					this.$LayerIns.openPopup(keywordValue.properties.Name)
					
				}
			}
		}
	},
	computed:{
		...mapGetters({
			isMobile:"common/common/isMobile",
			allResultLength:"result/result/allResultLength",
			allR2:"result/result/allR2",
			commonState:"common/common/state",
			layerState:"layer/layer/state"
		}),
		layerVisibility(){
			return  this.commonState("layerCardVisible")
		},
		resultVisibility(){
			return  this.commonState("resultCardVisible")
		},
		selectedTagModel:{
			get(){
				return this.keywordLabel
			},
			set(valObj){
                let val = valObj.value
                this.keywordLabel = valObj.label

				this.SET_CURRENT_TAG(val)
				this.SET_CARD_VISIBLE({key:'layer',bool:true})
				
				this.layerState("layer").forEach(l => {
					let visible = l.visible
					if(l.tag.indexOf(this.commonState("currentTag")) === -1 && val){
						visible = false
					}
					this.$LayerIns.setVisible(l.id,visible)
				})
			}
		},
		autocompleteModel:{
			get(){
				return this.keywordLabel
			},
			set(val){
				
				console.log(`[autocompleteModel set value ] type is ${typeof val} : ${val}`)

				if(typeof val === "string"){ // not match features
					this.keywordLabel = val
					this.keywordValue = ""
				}else if(typeof val === "object"){ // object
					this.keywordLabel = val.properties.Name
					this.keywordValue = val
				}

			}
		},
        tags(){
			let qSearchs = []
			Object.keys(this.tourismTags).forEach(k => {
				this.tourismTags[k].forEach(v=>{
					qSearchs.push({label: v,value: {
                        label:v, 
                        value:k
                    }})
				})
			})
			return qSearchs
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
		autocompleteSelectQuerySearch(queryString, cb){
			
			let val = spots.features.filter(i=>new RegExp(queryString,"g").test(i.properties.Name))
			let result = val.map(i=>({
				label:i.properties.Name,
				value:i
			}))

			cb(result)
		},
	}
}
</script>

<style lang="scss" scoped>
	
	.selectItems * {
		color: $primary !important;
		font-weight: normal !important;
	}

	.search{
		margin:0.5rem 0 !important;
		/deep/ {
			.el-input{
				&__prefix{
					left:0;
				}
				&__inner{
					padding-left: 50px;
					border-radius: 999px !important;
					box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
				}
			}
		}
		.el-button{
			box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
		}
		&>*{
			margin:0.5rem 0.5rem 0 0;
		}
	}

	.tools{
		position: absolute;
		
		display:flex;
		flex-direction:column;        
		align-items: flex-start;

		&>*{
			margin:0.5rem 0 !important;
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
