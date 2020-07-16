<template lang='pug'>
	.layer
		.layer__wrapper
			.layer__header
				slot(name="header")
				//- 	el-alert(type="success" style="margin-bottom:1rem;line-height:150%;" )
				//- 		h3 
				//- 			font-awesome-icon(icon="exclamation-circle" size="lg" fixed-width)
				//- 			| 您想找什麼 ? 

				//- 		p
				//- 			span 點擊地圖上的色塊，來查詢您想知道的資訊，下方的圖層可以控制地圖色塊開關與透明度 。
				//- 	el-input(
				//- 		v-model="layerKeywordModel" 
				//- 		size="small" 
				//- 		placeholder="輸入關鍵字搜尋圖資名稱" 
				//- 		clearable
				//- 	)
				//- 		font-awesome-icon(icon="search" fixed-width slot="prefix")

				//- 	p(style="line-height: 200%;")
				//- 		el-button(
				//- 			v-for="tag in tourismTags"
				//- 			:key="tag"
				//- 			type="info" 
				//- 			round
				//- 			size="mini" 
				//- 			style="padding:0.2rem 0.5rem;margin:0 0.5rem 0 0;"
				//- 		) {{tag}}
				
			//- see : https://github.com/Jexordexan/vue-slicksort
			SlickList.slickList(
				ref="slickList"
				v-model="layerSortableModel"
				@sort-end="onSortEnd"
				@sort-start="onSortStart"
				appendTo="body"
				:pressDelay=" !isIE ? 0 : 500 "
				:useDragHandle="!isIE"
				helperClass="dragging"
				:transitionDuration="300"
			)
				h3 海域與遊憩資訊總覽
				.col
					layerWeather
				.col
					small 地圖上帶有對應圖示的圓形，在縮放比例尺後可以得到更多關於點的資訊
						.fixedTopList(style="position:relative;" )
							.fixedTopList__collapse(:class="{'fixedTopList__collapse--hide':hideFixedTopList}")
								layerItemFixedCard.slickList__card(
									v-for="layer in pointerLayer"
									:key="layer.title"
									:class="getStatusClassName(layer)"
									:layer="layer" 
									:status="layer.status"
									:dragging="dragging"
									:useDragger="!isIE"
									@switch="handleLayerVisibility(layer.id,$event)"
									@opacitySlide="handleLayerOpacity(layer.id,$event)"
								)
				.col
					small 點擊地圖上的色塊來查詢區域內的資訊，點擊下方圖層來設定顏色或透明度，亦可以拖動來改變順序!
					SlickItem(
						v-for="layer,index in layerSortableModel"
						:key="`${layer.id}`"
						:index="index"
						v-loading="updatingLayerList.indexOf(layer.id)>-1"
					)
						layerItemCard.slickList__card(
							:class="getStatusClassName(layer)"
							:layer="layer" 
							:status="layer.status"
							:dragging="dragging"
							:useDragger="!isIE"
							@switch="handleLayerVisibility(layer.id,$event)"
							@opacitySlide="handleLayerOpacity(layer.id,$event)"
						)

				//- el-collapse(:value="['預報','標記點','基本圖']")
				//- 	el-collapse-item(name="預報")
				//- 		strong(slot="title") 預報
				//- 		layerWeather
				//- 	el-collapse-item(name="標記點")
				//- 		strong(slot="title") 標記點
				//- 		small 地圖上帶有對應圖示的圓形，在縮放比例尺後可以得到更多關於點的資訊
				//- 		.fixedTopList(style="position:relative;" )
				//- 			.fixedTopList__collapse(:class="{'fixedTopList__collapse--hide':hideFixedTopList}")
				//- 				layerItemFixedCard.slickList__card(
				//- 					v-for="layer in pointerLayer"
				//- 					:key="layer.title"
				//- 					:class="getStatusClassName(layer)"
				//- 					:layer="layer" 
				//- 					:status="layer.status"
				//- 					:dragging="dragging"
				//- 					:useDragger="!isIE"
				//- 					@switch="handleLayerVisibility(layer.id,$event)"
				//- 					@opacitySlide="handleLayerOpacity(layer.id,$event)"
				//- 				)
				//- 	//- el-collapse-item(name="圖面")
				//- 	//- 	strong(slot="title") 圖面
						
				//- 	el-collapse-item(name="基本圖")
				//- 		strong(slot="title") 基本圖
				//- 		small 點擊地圖上的色塊來查詢區域內的資訊，點擊下方圖層來設定顏色或透明度，亦可以拖動來改變順序!
				//- 		//- use tabindex for search focus | scrollIntoView
				//- 		SlickItem(
				//- 			v-for="layer,index in layerSortableModel"
				//- 			:key="`${layer.id}`"
				//- 			:index="index"
				//- 			v-loading="updatingLayerList.indexOf(layer.id)>-1"
				//- 		)
				//- 			layerItemCard.slickList__card(
				//- 				:class="getStatusClassName(layer)"
				//- 				:layer="layer" 
				//- 				:status="layer.status"
				//- 				:dragging="dragging"
				//- 				:useDragger="!isIE"
				//- 				@switch="handleLayerVisibility(layer.id,$event)"
				//- 				@opacitySlide="handleLayerOpacity(layer.id,$event)"
				//- 			)

			//- baseMaps
			.layer__footer
				layerBaseMap

</template>



<script>



import { SlickList, SlickItem } from "vue-slicksort"
import {mapGetters,mapActions, mapMutations} from "vuex"
import layerItemCard from "./layerItemCard"
import layerBaseMap from "./layerBaseMap"

import layerItemFixedCard from "./layerItemFixedCard"
import layerWeather from '@/components/layer/layerWeather';


export default {
	name:'layers',
	components:{
		SlickList,
		SlickItem,
		layerItemCard,
		layerBaseMap,
		layerItemFixedCard,
		layerWeather
	},
	data:()=>({
		dragging:false,
		lastDraggingLyrPtr:'',
		//-
		layerKeyword:'',
		matchKeywordLayers:[],
		updatingLayerList:[], // 存放正在更新的圖層名稱或ID
		//
		hideFixedTopList: false,
	}),
	computed:{
		...mapGetters({
			state:'layer/layer/state',
			rootState: 'common/common/state',
			pointerLayer: 'layer/layer/pointerLayer',
			sortableLayer: 'layer/layer/sortableLayer',
			weatherLayer: 'layer/layer/weatherLayer'
		}),
		isIE(){
			return Boolean(document.documentMode)
		},
		// layerKeywordModel:{
		// 	get(){
		// 		return this.layerKeyword
		// 	},
		// 	set(str){
		// 		this.matchKeywordLayers = str ? this.layerSortableModel.filter(lyr=>lyr.title.match(new RegExp(str,"g"))) : []
		// 		if(this.matchKeywordLayers.length > 0){ //- matched keyword
		// 			this.$refs.slickList.$children.forEach(comp=>{
		// 				if(comp.$vnode.elm.innerText === this.matchKeywordLayers[0].title){ // first one
		// 					document.documentElement.scrollIntoView ? comp.$el.scrollIntoView({behavior: "smooth"}) : c.$el.focus()
		// 				}
		// 			})
		// 		}
		// 		this.layerKeyword = str
		// 	}
		// },
		layerSortableModel:{
			get(){
				return this.sortableLayer
			},
			set(newSortedLayerArr){
				this.SNAPSHOT_RAW_LAYER({
					type:'layer', 
					payload:[...this.layerUnSortable,...newSortedLayerArr]
				})
			}
		},
		layerUnSortable(){
			return [...this.pointerLayer, ...this.weatherLayer]
		},
		layerUnSortableCount(){
			return this.layerUnSortable.length
		}
	},
	methods:{
		...mapMutations({
			UPDATE_LAYER_OPTIONS:'layer/layer/UPDATE_LAYER_OPTIONS',
			SNAPSHOT_RAW_LAYER:'layer/layer/SNAPSHOT_RAW_LAYER',
		}),
		_toggleLayerWiggle(bool){
			this.$nextTick(()=>{
				this.$refs['slickList'].$el.childNodes.forEach(node => {
					node.children[0].classList.toggle('wiggle',bool)
					if(bool) node.children[0].style.animationDuration = `${Math.random() * (2000 - 1000) + 1000}ms`
				})
			})
		},
		onSortEnd(evt){
			const oi = evt.oldIndex 
			const ni = evt.newIndex 
			
			//- 地圖實例順序更新
			console.log("順序移動 : 索引 " + oi + " 至 " + ni,this.layerSortableModel[oi])

			/** 加上不可排序的長度 來偏移 */
			const offset_oi = oi + this.layerUnSortableCount
			const offset_ni = ni + this.layerUnSortableCount
			this.$LayerIns.reorderNormalLayer(this.layerSortableModel[oi].id,offset_oi,offset_ni)

			this.dragging = false
			this._toggleLayerWiggle(false) //- dom wiggle effect

		},
		onSortStart(evt){
			this.dragging = true
			this._toggleLayerWiggle(true) //- dom wiggle effect
			this.lastDraggingLyrPtr = this.layerSortableModel[evt.index]
		},
		handleLayerVisibility(id,bool){
			//- update map instance
			this.$LayerIns.setVisible(id,bool)
			//- update state snapshot
			this.UPDATE_LAYER_OPTIONS({
				id:id,
				payload:{
					visible:bool
				}
			})
		},
		handleLayerOpacity(id,opacity){
			//- update map instance
			this.$LayerIns.setOpacity(id,opacity)
			//- update state snapshot
			this.UPDATE_LAYER_OPTIONS({
				id:id,
				payload:{
					opacity:opacity
				}
			})
		},
		getStatusClassName(layer){
			return {
				'slickList__card--matched-keyword':this.matchKeywordLayers.indexOf(layer)>-1,
				'slickList__card--last-move':(this.lastDraggingLyrPtr === layer),
				'slickList__card--outScale':(layer.status==='outScale'),
				'slickList__card--simple':(layer.status==='simple') || (this.matchKeywordLayers.length>0 && !this.matchKeywordLayers.indexOf(layer)>-1)
			}
		}
	}
}
</script>




<style lang="scss" scoped>

	.col {
		border-top: 0.75px solid rgba($info,0.5);
		padding: 1rem 0;
	}

	/deep/ .el-collapse-item__content{padding: 0;}
	.layer{
		overflow:hidden;
		margin:-1rem;
		&__wrapper{
			height:100%;
			display:flex;
			flex-direction: column;
		}
		&__header{
			display: flex;
			flex-direction: column;;
			margin:1rem;
			/deep/ {
				.el-input__inner{
					border: 1.5px solid $primary;
				}
			}
		}
		&__footer{
			z-index: 1;
		}
	}
	.fixedTopList{
		position: relative;
		// &__collapse{
		// 	max-height: 50vh;
		// 	overflow: hidden;
		// 	will-change: max-height;
		// 	&--hide{
		// 		max-height: 0vh;
		// 	}
		// }
	}
	.slickList{ 
		padding: 0 1rem;
		overflow-y: auto;
		box-sizing: border-box;
		position: relative;
		height:100vh;
		
		&__card{
			transition: all 0.2s ease-in-out;
			&--matched-keyword{
				color: red !important;
				border-color: red !important;
				border-width: 2px;
			}
			&--last-move{
				border-color: $primary;
				border-width: 2px;
			}
			&--outScale{
				color:#E6A23C;
				background-color:#fdf6ec;
			}
			&--simple {
				opacity:0.5;
			}
		}
	}

	.wiggle {
		animation-name: wiggle;
		animation-duration: 1500ms;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
		transform: scale(0.95,0.95);
	}

	@keyframes wiggle {
		0% { transform: translate(0, 0) rotate(0); }
		10% { transform: translate(-0.5px, -1px) rotate(-0.2deg); }
		20% { transform: translate(-1.5px, 0px) rotate(0.2deg); }
		30% { transform: translate(1.5px, 1px) rotate(0deg); }
		40% { transform: translate(0.5px, -0.5px) rotate(0.2deg); }
		50% { transform: translate(-0.5px, 1px) rotate(-0.2deg); }
		60% { transform: translate(-1.5px, 0.5px) rotate(0deg); }
		70% { transform: translate(1.5px, 0.5px) rotate(-0.2deg); }
		80% { transform: translate(-0.5px, -0.5px) rotate(0.2deg); }
		90% { transform: translate(0.5px, 1px) rotate(0deg); }
		100% { transform: translate(0, 0) rotate(0); }
	}
	
	.flicker{
		animation-name: flicker;
		animation-duration: 800ms;
		animation-iteration-count: 3;
	}
	@keyframes flicker {
		0%,100%{
			opacity: 1;
		}
		50%{
			opacity: 0.3;
		}
	}

	.dragging{
		margin: 0;
		z-index: 9999;
		@include boxShadow;
		&>*{
			margin: 0;
		}
	}

</style>
