<template lang='pug'>
	.layer
		.layer__wrapper
			.layer__filter
				el-alert(type="success" style="margin-bottom:1rem;line-height:150%;" )
					h3 
						font-awesome-icon(icon="exclamation-circle" size="lg" fixed-width)
						| 您想找什麼 ? 
					
					//- el-button(type="primary" round size="mini" style="padding:0.2rem 0.5rem;") 衝浪
					//- el-button(type="primary" round size="mini" style="padding:0.2rem 0.5rem;") 法令與管制規定
					//- el-button(type="primary" round size="mini" style="padding:0.2rem 0.5rem;") 海象

					p
						span 點擊地圖上的色塊，來查詢您想知道的資訊，下方的圖層可以控制地圖色塊開關與透明度 。

				el-input(
					v-model="layerKeywordModel" 
					size="small" 
					placeholder="輸入關鍵字搜尋圖資名稱" 
					clearable
				)
					font-awesome-icon(icon="search" fixed-width slot="prefix")

			.fixedTopList(style="position:relative;" )
				.fixedTopList__collapse(:class="{'fixedTopList__collapse--hide':hideFixedTopList}")
					layerItemFixedCard.slickList__card(
						v-for="layer in layerFixedTop"
						:key="layer.title"
						:class="getStatusClassName(layer)"
						:layer="layer" 
						:status="layer.status"
						:dragging="dragging"
						:useDragger="!isIE"
						@switch="handleLayerVisibility(layer.id,$event)"
						@opacitySlide="handleLayerOpacity(layer.id,$event)"
					)
				div(style="display:flex;justify-content:center;position:absolute;left:0;right:0;bottom:-0.8rem;z-index: 99;")
					el-button(
						round 
						type="primary"
						size="mini" 
						style="padding:0.15rem 0.3rem;"
						@click="hideFixedTopList=!hideFixedTopList"
					) 
						font-awesome-icon(:icon="hideFixedTopList ? 'chevron-down' : 'chevron-up'" fixed-width style="margin-right:0.25rem;")
						small {{hideFixedTopList ? '展開' : '收折'}}
			
			//- see : https://github.com/Jexordexan/vue-slicksort
			SlickList.slickList(
				ref="slickList"
				v-model="layerListModel"
				@sort-end="onSortEnd"
				@sort-start="onSortStart"
				appendTo="body"
				:pressDelay=" !isIE ? 0 : 500 "
				:useDragHandle="!isIE"
				helperClass="dragging"
				:transitionDuration="300"
			)
				//- use tabindex for search focus | scrollIntoView
				SlickItem(
					v-for="layer,index in layerListModel"
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

export default {
	name:'layers',
	components:{
		SlickList,
		SlickItem,
		layerItemCard,
		layerBaseMap,
		layerItemFixedCard
	},
	data:()=>({
		dragging:false,
		lastDraggingLyrPtr:'',
		//-
		layerKeyword:'',
		matchKeywordLayers:[],
		updatingLayerList:[], // 存放正在更新的圖層名稱或ID
		//
		hideFixedTopList: false
	}),
	computed:{
		...mapGetters({
			state:'layer/layer/state',
			rootState: 'common/common/state',
			sortableLayer: 'layer/layer/sortableLayer',
			freezedLayer: 'layer/layer/freezedLayer'
		}),
		isIE(){
			return Boolean(document.documentMode)
		},
		activedSubject(){
			return this.rootState("activedSubject")
		},
		layerKeywordModel:{
			get(){
				return this.layerKeyword
			},
			set(str){
				this.matchKeywordLayers = str ? this.layerListModel.filter(lyr=>lyr.title.match(new RegExp(str,"g"))) : []
				if(this.matchKeywordLayers.length > 0){ //- matched keyword
					this.$refs.slickList.$children.forEach(comp=>{
						if(comp.$vnode.elm.innerText === this.matchKeywordLayers[0].title){ // first one
							document.documentElement.scrollIntoView ? comp.$el.scrollIntoView({behavior: "smooth"}) : c.$el.focus()
						}
					})
				}
				this.layerKeyword = str
			}
		},
		/** 可排序的圖層 取geojson*/
		layerListModel:{
			get(){
				return  this.sortableLayer.filter(l=> /geojson/ig.test(l.type) )
			},
			set(newSortedLayerArr){
				this.SNAPSHOT_RAW_LAYER({
					type:'layer', 
					payload:[...this.freezedLayer,...this.layerFixedTop,...newSortedLayerArr]
				})
			}
		},
		layerFixedTop(){
			return  this.sortableLayer.filter(l=> /clusterMark/ig.test(l.type) )
		},
		/** 不排序的圖層 */
		freezedLayerCount(){
			return this.freezedLayer.length + this.layerFixedTop.length
		}
	},
	async mounted(){},
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
			console.log("順序移動 : 索引 " + oi + " 至 " + ni,this.layerListModel[oi])

			/** 加上不可排序的長度 來偏移 */
			const offset_oi = oi + this.freezedLayerCount
			const offset_ni = ni + this.freezedLayerCount
			this.$LayerIns.reorderNormalLayer(this.layerListModel[oi].id,offset_oi,offset_ni)

			this.dragging = false
			this._toggleLayerWiggle(false) //- dom wiggle effect

		},
		onSortStart(evt){
			this.dragging = true
			this._toggleLayerWiggle(true) //- dom wiggle effect
			this.lastDraggingLyrPtr = this.layerListModel[evt.index]
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
	
	.layer{
		overflow:hidden;
		margin:-1rem;
		&__filter{
			display: flex;
			flex-direction: column;;
			margin:1rem;
			/deep/ {
				.el-input__inner{
					border: 1.5px solid $primary;
				}
			}
		}
		&__wrapper{
			height:100%;
			display:flex;
			flex-direction: column;
		}
		&__header{
			display:flex;
			padding: 0.5rem 1rem;
			@include boxShadow;
			z-index: 1;
		}
		&__footer{
			z-index: 1;
		}
	}
	.fixedTopList{
		margin: 0 1rem;
		position: relative;
		border-top: 1px solid #d7d7d7;
		border-bottom: 1px solid #d7d7d7;
		&__collapse{
			max-height: 50vh;
			overflow: hidden;
			will-change: max-height;
			&--hide{
				max-height: 0vh;
			}
		}
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
